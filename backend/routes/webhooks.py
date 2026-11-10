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
        headers={"Authorization": f"Basic {credentials}"}
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

    # Only a successful payment changes anything.
    # A failed attempt keeps the checkout pending so the merchant can retry.
    if event_type != "payment_paid":
        current_app.logger.warning(
            "Moyasar webhook event ignored: %s", event_type
        )
        return jsonify({"message": "Event ignored"}), 200

    payment_id = str(payment["id"])

    # Confirm the payment directly with Moyasar
    try:
        verified = fetch_moyasar_payment(payment_id)
    except (urllib.error.URLError, ValueError, TimeoutError):
        current_app.logger.exception(
            "Could not verify Moyasar payment %s", payment_id
        )
        # Non-2xx makes Moyasar retry later
        return jsonify({"error": "Could not verify payment"}), 503

    metadata = verified.get("metadata") or {}

    try:
        checkout_id = int(metadata.get("checkout_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "Missing checkout_id"}), 400

    if verified.get("status") != "paid":
        return jsonify({"error": "Payment is not paid"}), 400

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:

                cursor.execute("""
                    SELECT total_amount, currency, status
                    FROM checkouts
                    WHERE id = %s
                    FOR UPDATE;
                """, (checkout_id,))

                checkout = cursor.fetchone()

                if checkout is None:
                    return jsonify({"error": "Checkout not found"}), 404

                total_amount, currency, status = checkout

                # Already processed: Moyasar may send the event again
                if status == "paid":
                    return jsonify({"message": "Already processed"}), 200

                expected_halalas = int(
                    (Decimal(total_amount) * 100).quantize(Decimal("1"))
                )

                if (
                    verified.get("amount") != expected_halalas
                    or verified.get("currency") != currency
                ):
                    current_app.logger.error(
                        "Payment %s does not match checkout %s",
                        payment_id, checkout_id
                    )
                    return jsonify({"error": "Amount mismatch"}), 400

                cursor.execute("""
                    UPDATE checkouts
                    SET
                        status = 'paid',
                        payment_id = %s,
                        paid_at = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s;
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