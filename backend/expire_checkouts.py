"""Cancel stale pending checkouts and give their stock back.

Usage (from the backend folder):
    python expire_checkouts.py              # cancel checkouts older than 60 min
    python expire_checkouts.py 120          # older than 120 minutes
    python expire_checkouts.py --dry-run    # only list, change nothing
"""
import sys

DEFAULT_MAX_AGE_MINUTES = 60


def expire_stale_checkouts(cursor, max_age_minutes=DEFAULT_MAX_AGE_MINUTES,
                           dry_run=False):
    """Return the list of checkout ids that were (or would be) cancelled."""
    cursor.execute("""
        SELECT id
        FROM checkouts
        WHERE status = 'pending'
          AND created_at < CURRENT_TIMESTAMP
                           - (%s * INTERVAL '1 minute')
        ORDER BY id
        FOR UPDATE SKIP LOCKED;
    """, (max_age_minutes,))

    checkout_ids = [row[0] for row in cursor.fetchall()]

    if dry_run:
        return checkout_ids

    for checkout_id in checkout_ids:
        cursor.execute("""
            SELECT oi.product_id, oi.quantity
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.checkout_id = %s
              AND o.status = 'pending';
        """, (checkout_id,))

        for product_id, quantity in cursor.fetchall():
            cursor.execute("""
                UPDATE products
                SET
                    stock_quantity = stock_quantity + %s,
                    stock_status = CASE
                        WHEN stock_quantity + %s > 0
                        THEN 'in_stock'
                        ELSE 'out_of_stock'
                    END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s;
            """, (quantity, quantity, product_id))

        cursor.execute("""
            UPDATE orders
            SET status = 'cancelled',
                updated_at = CURRENT_TIMESTAMP
            WHERE checkout_id = %s
              AND status = 'pending';
        """, (checkout_id,))

        cursor.execute("""
            UPDATE checkouts
            SET status = 'cancelled',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
              AND status = 'pending';
        """, (checkout_id,))

    return checkout_ids


def main(argv):
    import psycopg
    from config import Config

    dry_run = "--dry-run" in argv
    numbers = [a for a in argv if a.isdigit()]
    minutes = int(numbers[0]) if numbers else DEFAULT_MAX_AGE_MINUTES

    with psycopg.connect(Config.DATABASE_URL) as connection:
        with connection.cursor() as cursor:
            ids = expire_stale_checkouts(cursor, minutes, dry_run)

    label = "Would cancel" if dry_run else "Cancelled"
    print(f"{label} {len(ids)} checkout(s): {ids}")


if __name__ == "__main__":
    main(sys.argv[1:])