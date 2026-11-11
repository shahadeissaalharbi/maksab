from config import Config
from datetime import datetime, timezone


class CheckoutLifecycleConflict(Exception):
    def __init__(self, message, code):
        super().__init__(message)
        self.code = code


def payment_attempts_are_safe(cursor, checkout_id, payment_state):
    cursor.execute("""
        SELECT status
        FROM checkout_payment_attempts
        WHERE checkout_id = %s
        ORDER BY id
        FOR UPDATE;
    """, (checkout_id,))
    statuses = [row[0] for row in cursor.fetchall()]

    if payment_state == "not_started":
        return not statuses

    return payment_state == "failed" and bool(statuses) and all(
        status == "failed" for status in statuses
    )


def restore_checkout_inventory(cursor, checkout_id):
    cursor.execute("""
        SELECT id, status
        FROM orders
        WHERE checkout_id = %s
        ORDER BY id
        FOR UPDATE;
    """, (checkout_id,))
    orders = cursor.fetchall()

    if any(status != "pending" for _, status in orders):
        raise CheckoutLifecycleConflict(
            "Checkout orders are no longer pending",
            "orders_not_pending",
        )

    cursor.execute("""
        SELECT oi.product_id, SUM(oi.quantity)
        FROM order_items AS oi
        JOIN orders AS o ON o.id = oi.order_id
        WHERE o.checkout_id = %s
        GROUP BY oi.product_id
        ORDER BY oi.product_id;
    """, (checkout_id,))
    quantities = cursor.fetchall()

    if not quantities:
        return []

    product_ids = [product_id for product_id, _ in quantities]
    cursor.execute("""
        SELECT id
        FROM products
        WHERE id = ANY(%s)
        ORDER BY id
        FOR UPDATE;
    """, (product_ids,))
    locked_product_ids = {row[0] for row in cursor.fetchall()}

    if locked_product_ids != set(product_ids):
        raise CheckoutLifecycleConflict(
            "One or more reserved products no longer exist",
            "products_missing",
        )

    for product_id, quantity in quantities:
        cursor.execute("""
            UPDATE products
            SET stock_quantity = stock_quantity + %s,
                stock_status = CASE
                    WHEN stock_quantity + %s > 0 THEN 'in_stock'
                    ELSE 'out_of_stock'
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s;
        """, (quantity, quantity, product_id))

    return product_ids


def close_pending_checkout(cursor, checkout, target_status):
    if not Config.CHECKOUT_STOCK_RELEASE_ENABLED:
        raise CheckoutLifecycleConflict(
            "Stock release disabled until payment initiation is secured",
            "stock_release_disabled",
        )

    checkout_id, _, status, payment_state = checkout[:4]

    if status != "pending":
        raise CheckoutLifecycleConflict(
            f"Checkout is already {status}",
            "checkout_not_pending",
        )

    if not payment_attempts_are_safe(cursor, checkout_id, payment_state):
        raise CheckoutLifecycleConflict(
            "Payment status is uncertain; the stock reservation was retained",
            "payment_uncertain",
        )

    restored_products = restore_checkout_inventory(cursor, checkout_id)

    if target_status == "cancelled":
        cursor.execute("""
            UPDATE checkouts
            SET status = 'cancelled',
                cancelled_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND status = 'pending';
        """, (checkout_id,))
    elif target_status == "expired":
        cursor.execute("""
            UPDATE checkouts
            SET status = 'expired',
                expired_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND status = 'pending';
        """, (checkout_id,))
    else:
        raise ValueError(f"Unsupported checkout close status: {target_status}")

    cursor.execute("""
        UPDATE orders
        SET status = 'cancelled',
            updated_at = CURRENT_TIMESTAMP
        WHERE checkout_id = %s AND status = 'pending';
    """, (checkout_id,))

    return restored_products


def utc_now():
    return datetime.now(timezone.utc)
