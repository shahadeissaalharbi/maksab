import argparse
import json

import psycopg

from checkout_lifecycle import (
    CheckoutLifecycleConflict,
    close_pending_checkout,
    utc_now,
)
from config import Config


def expire_pending_checkouts(batch_size=100, now=None):
    if not isinstance(batch_size, int) or batch_size < 1:
        raise ValueError("batch_size must be a positive integer")

    now = now or utc_now()
    result = {
        "expired": 0,
        "deferred_payment_uncertain": 0,
        "deferred_order_state": 0,
    }

    with psycopg.connect(Config.DATABASE_URL) as connection:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, merchant_id, status, payment_state, expires_at
                FROM checkouts
                WHERE status = 'pending'
                  AND expires_at <= %s
                ORDER BY expires_at, id
                LIMIT %s
                FOR UPDATE SKIP LOCKED;
            """, (now, batch_size))
            checkouts = cursor.fetchall()

            for checkout in checkouts:
                try:
                    close_pending_checkout(cursor, checkout, "expired")
                    result["expired"] += 1
                except CheckoutLifecycleConflict as error:
                    if error.code == "payment_uncertain":
                        result["deferred_payment_uncertain"] += 1
                    else:
                        result["deferred_order_state"] += 1

    return result


def list_pending_reconciliations(limit=100):
    if not isinstance(limit, int) or limit < 1:
        raise ValueError("limit must be a positive integer")

    with psycopg.connect(Config.DATABASE_URL) as connection:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    id,
                    checkout_id,
                    moyasar_payment_id,
                    amount,
                    currency,
                    provider_status,
                    reason,
                    created_at
                FROM checkout_payment_reconciliations
                WHERE resolution_status = 'pending_review'
                ORDER BY created_at, id
                LIMIT %s;
            """, (limit,))
            rows = cursor.fetchall()

    return [
        {
            "id": row[0],
            "checkout_id": row[1],
            "moyasar_payment_id": row[2],
            "amount": row[3],
            "currency": row[4],
            "provider_status": row[5],
            "reason": row[6],
            "created_at": row[7].isoformat(),
        }
        for row in rows
    ]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch-size", type=int, default=100)
    parser.add_argument(
        "--reconciliations",
        action="store_true",
        help="List successful payments needing manual review instead of expiring checkouts",
    )
    args = parser.parse_args()

    if args.reconciliations:
        result = list_pending_reconciliations(args.batch_size)
    else:
        result = expire_pending_checkouts(args.batch_size)

    print(json.dumps(result, default=str))


if __name__ == "__main__":
    main()
