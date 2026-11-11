import base64
import hmac
import json
import urllib.error
import urllib.request
from decimal import Decimal

import psycopg
from flask import Blueprint, current_app, jsonify, request

from config import Config
from email_service import notify_checkout_paid


webhooks_bp = Blueprint("webhooks", __name__)
SUPPORTED_PAYMENT_EVENTS = {"payment_paid", "payment_failed"}


def describe_request(event):
    """Short, secret-free description of a request body for the logs."""
    if isinstance(event, dict):
        event = {k: v for k, v in event.items() if k != "secret_token"}

    return str(event)[:500]


def fetch_moyasar_payment(payment_id):
    """Fetch the payment from Moyasar so we never trust the webhook body."""
    credentials = base64.b64encode(
        f"{Config.MOYASAR_SECRET_KEY}:".encode()
    ).decode()

    api_request = urllib.request.Request(
        f"{Config.MOYASAR_API_URL}/payments/{payment_id}",
        headers={
            "Authorization": f"Basic {credentials}",
            "Accept": "application/json",
            "User-Agent": "Maksab/1.0"
        }
    )

    with urllib.request.urlopen(api_request, timeout=10) as response:
        return json.loads(response.read().decode())


@webhooks_bp.route("/api/webhooks/moyasar", methods=["POST"])
def moyasar_webhook():
    # Refuse everything if the secret is not configured
    if not Config.MOYASAR_WEBHOOK_SECRET or not Config.MOYASAR_SECRET_KEY:
        current_app.logger.error("Moyasar settings are not configured")
        return jsonify({"error": "Webhook not configured"}), 503

    event = request.get_json(silent=True)

    if not isinstance(event, dict):
        current_app.logger.warning(
            "Moyasar webhook with a non-JSON body: %s",
            request.get_data(as_text=True)[:500]
        )
        return jsonify({"error": "Invalid JSON body"}), 400

    # Verify the shared secret token
    received_token = event.get("secret_token")

    if not isinstance(received_token, str) or not hmac.compare_digest(
        received_token.encode(),
        Config.MOYASAR_WEBHOOK_SECRET.encode()
    ):
        current_app.logger.warning(
            "Moyasar webhook rejected (bad token): %s",
            describe_request(event)
        )
        return jsonify({"error": "Invalid secret token"}), 401

    event_type = event.get("type")
    payment = event.get("data")

    if not isinstance(payment, dict) or not payment.get("id"):
        current_app.logger.warning(
            "Moyasar webhook without payment data: %s",
            describe_request(event)
        )
        return jsonify({"error": "Invalid payment data"}), 400

    if event_type not in SUPPORTED_PAYMENT_EVENTS:
        current_app.logger.warning(
            "Moyasar webhook event ignored: %s", event_type
        )
        return jsonify({"message": "Event ignored"}), 200

    payment_id = str(payment["id"])

    # Confirm the payment directly with Moyasar
    try:
        verified = fetch_moyasar_payment(payment_id)
    except (urllib.error.URLError, ValueError, TimeoutError) as error:
        detail = ""

        if isinstance(error, urllib.error.HTTPError):
            detail = error.read().decode(errors="replace")[:300]

        current_app.logger.exception(
            "Could not verify Moyasar payment %s: %s",
            payment_id, detail
        )
        # Non-2xx makes Moyasar retry later
        return jsonify({"error": "Could not verify payment"}), 503

    if not isinstance(verified, dict):
        current_app.logger.error(
            "Moyasar returned an invalid payment response for %s",
            payment_id,
        )
        return jsonify({"error": "Invalid payment response"}), 503

    if verified.get("id") not in (None, payment_id):
        current_app.logger.error(
            "Moyasar payment id mismatch for webhook %s", payment_id
        )
        return jsonify({"error": "Payment verification mismatch"}), 400

    metadata = verified.get("metadata") or {}
    if not isinstance(metadata, dict):
        return jsonify({"error": "Invalid payment metadata"}), 400

    try:
        raw_checkout_id = metadata.get("checkout_id")
        if isinstance(raw_checkout_id, bool):
            raise ValueError
        checkout_id = int(raw_checkout_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Missing checkout_id"}), 400

    raw_attempt_id = metadata.get("payment_attempt_id")
    try:
        if isinstance(raw_attempt_id, bool):
            raise ValueError
        attempt_id = int(raw_attempt_id) if raw_attempt_id is not None else None
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid payment attempt id"}), 400

    if attempt_id is not None and attempt_id < 1:
        return jsonify({"error": "Invalid payment attempt id"}), 400

    provider_status = verified.get("status")
    if event_type == "payment_paid" and provider_status != "paid":
        return jsonify({"error": "Payment is not paid"}), 400

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:

                cursor.execute("""
                    SELECT
                        id, total_amount, currency, status,
                        payment_id, payment_state
                    FROM checkouts
                    WHERE id = %s
                    FOR UPDATE;
                """, (checkout_id,))

                checkout = cursor.fetchone()

                if checkout is None:
                    return jsonify({"error": "Checkout not found"}), 404

                _, total_amount, currency, status, stored_payment_id, _ = checkout

                expected_halalas = int(
                    (Decimal(total_amount) * 100).quantize(Decimal("1"))
                )

                if (
                    isinstance(verified.get("amount"), bool)
                    or verified.get("amount") != expected_halalas
                    or verified.get("currency") != currency
                ):
                    current_app.logger.error(
                        "Payment %s does not match checkout %s",
                        payment_id, checkout_id
                    )
                    return jsonify({"error": "Amount mismatch"}), 400

                cursor.execute("""
                    SELECT id, checkout_id, status
                    FROM checkout_payment_attempts
                    WHERE moyasar_payment_id = %s
                    FOR UPDATE;
                """, (payment_id,))
                payment_attempt = cursor.fetchone()

                if payment_attempt and payment_attempt[1] != checkout_id:
                    _record_reconciliation(
                        cursor,
                        checkout_id,
                        payment_id,
                        verified,
                        "payment_id_reused",
                    )
                    return jsonify({
                        "message": "Payment requires manual reconciliation",
                        "reconciliation_required": True,
                    }), 202

                tracked_attempt = _lock_payment_attempt(
                    cursor, checkout_id, attempt_id
                )

                if attempt_id is not None and tracked_attempt is None:
                    _record_reconciliation(
                        cursor,
                        checkout_id,
                        payment_id,
                        verified,
                        "unknown_payment_attempt",
                    )
                    return jsonify({
                        "message": "Payment requires manual reconciliation",
                        "reconciliation_required": True,
                    }), 202

                if provider_status == "failed":
                    if tracked_attempt is not None:
                        cursor.execute("""
                            UPDATE checkout_payment_attempts
                            SET status = 'failed',
                                moyasar_payment_id = %s,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = %s;
                        """, (payment_id, tracked_attempt[0]))
                        _refresh_payment_state(cursor, checkout_id)

                    return jsonify({
                        "message": "Payment attempt failed",
                    }), 200

                if provider_status != "paid":
                    if tracked_attempt is not None:
                        cursor.execute("""
                            UPDATE checkout_payment_attempts
                            SET status = 'unknown',
                                moyasar_payment_id = %s,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = %s;
                        """, (payment_id, tracked_attempt[0]))
                        cursor.execute("""
                            UPDATE checkouts
                            SET payment_state = 'unknown',
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = %s AND status = 'pending';
                        """, (checkout_id,))

                    return jsonify({
                        "message": "Payment status is not final",
                        "payment_state": "unknown",
                    }), 200

                if status == "paid" and stored_payment_id == payment_id:
                    return jsonify({"message": "Already processed"}), 200

                if status != "pending":
                    reason = (
                        "payment_after_checkout_closed"
                        if status != "paid"
                        else "additional_successful_payment"
                    )
                    _record_reconciliation(
                        cursor,
                        checkout_id,
                        payment_id,
                        verified,
                        reason,
                    )
                    if tracked_attempt is not None:
                        cursor.execute("""
                            UPDATE checkout_payment_attempts
                            SET status = 'paid',
                                moyasar_payment_id = %s,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = %s;
                        """, (payment_id, tracked_attempt[0]))
                    if status in ("cancelled", "expired"):
                        cursor.execute("""
                            UPDATE checkouts
                            SET payment_state = 'late_paid',
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = %s;
                        """, (checkout_id,))

                    current_app.logger.error(
                        "Successful payment %s needs reconciliation for "
                        "checkout %s (%s)",
                        payment_id, checkout_id, reason
                    )
                    return jsonify({
                        "message": "Payment requires manual reconciliation",
                        "reconciliation_required": True,
                    }), 202

                if tracked_attempt is not None:
                    cursor.execute("""
                        UPDATE checkout_payment_attempts
                        SET status = 'paid',
                            moyasar_payment_id = %s,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = %s;
                    """, (payment_id, tracked_attempt[0]))
                else:
                    cursor.execute("""
                        INSERT INTO checkout_payment_attempts (
                            checkout_id, moyasar_payment_id, status
                        )
                        VALUES (%s, %s, 'paid')
                        ON CONFLICT (moyasar_payment_id) DO NOTHING;
                    """, (checkout_id, payment_id))

                cursor.execute("""
                    UPDATE checkouts
                    SET
                        status = 'paid',
                        payment_id = %s,
                        payment_state = 'paid',
                        paid_at = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s AND status = 'pending';
                """, (payment_id, checkout_id))

                cursor.execute("""
                    UPDATE orders
                    SET
                        status = 'paid',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE checkout_id = %s
                      AND status = 'pending';
                """, (checkout_id,))

        # The payment is saved. A failed email must never undo or fail it.
        try:
            notify_checkout_paid(checkout_id)
        except Exception:
            current_app.logger.exception(
                "Checkout %s paid, but notifications failed", checkout_id
            )

        return jsonify({"message": "Payment recorded"}), 200

    except psycopg.errors.UniqueViolation:
        current_app.logger.exception(
            "Payment %s already used", payment_id
        )
        return jsonify({"error": "Payment already used"}), 409

    except psycopg.Error:
        current_app.logger.exception(
            "Database error while processing Moyasar webhook"
        )
        return jsonify({"error": "Database temporarily unavailable"}), 503


def _lock_payment_attempt(cursor, checkout_id, attempt_id):
    if attempt_id is None:
        return None

    cursor.execute("""
        SELECT id, status
        FROM checkout_payment_attempts
        WHERE id = %s AND checkout_id = %s
        FOR UPDATE;
    """, (attempt_id, checkout_id))
    return cursor.fetchone()


def _refresh_payment_state(cursor, checkout_id):
    cursor.execute("""
        SELECT status
        FROM checkout_payment_attempts
        WHERE checkout_id = %s
        ORDER BY id
        FOR UPDATE;
    """, (checkout_id,))
    statuses = [row[0] for row in cursor.fetchall()]

    payment_state = (
        "failed"
        if statuses and all(status == "failed" for status in statuses)
        else "unknown"
    )
    cursor.execute("""
        UPDATE checkouts
        SET payment_state = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s AND status = 'pending';
    """, (payment_state, checkout_id))


def _record_reconciliation(
    cursor, checkout_id, payment_id, verified_payment, reason
):
    cursor.execute("""
        INSERT INTO checkout_payment_reconciliations (
            checkout_id,
            moyasar_payment_id,
            amount,
            currency,
            provider_status,
            reason
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (moyasar_payment_id) DO NOTHING;
    """, (
        checkout_id,
        payment_id,
        verified_payment.get("amount", 0),
        verified_payment.get("currency", "SAR"),
        str(verified_payment.get("status", "unknown")),
        reason,
    ))