from datetime import timedelta
from decimal import Decimal

import psycopg
from flask import Blueprint, current_app, jsonify, request

from checkout_lifecycle import (
    CheckoutLifecycleConflict,
    close_pending_checkout,
    payment_attempts_are_safe,
    utc_now,
)
from config import Config
from decorators import token_required


checkouts_bp = Blueprint("checkouts", __name__)


@checkouts_bp.route("/api/checkouts", methods=["POST"])
@token_required
def create_checkout():
    # Only merchants can start a checkout
    if request.user_role != "merchant":
        return jsonify({"error": "Only merchants can create checkouts"}), 403

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON body"}), 400

    items = data.get("items")

    if not isinstance(items, list) or not items:
        return jsonify({"error": "Items must be a non-empty list"}), 400

    # Combine duplicate products and validate quantities
    wanted = {}

    for item in items:
        if not isinstance(item, dict):
            return jsonify({"error": "Invalid item format"}), 400

        product_id = item.get("product_id")
        quantity = item.get("quantity")

        if (
            not isinstance(product_id, int)
            or isinstance(product_id, bool)
            or product_id <= 0
            or not isinstance(quantity, int)
            or isinstance(quantity, bool)
            or quantity <= 0
        ):
            return jsonify({
                "error": "product_id and quantity must be positive integers"
            }), 400

        wanted[product_id] = wanted.get(product_id, 0) + quantity

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:

                # Lock products to prevent overselling
                cursor.execute("""
                    SELECT
                        id,
                        supplier_id,
                        price,
                        stock_quantity,
                        COALESCE(moq, 1),
                        name
                    FROM products
                    WHERE id = ANY(%s)
                    ORDER BY id
                    FOR UPDATE;
                """, (list(wanted.keys()),))

                products = {
                    row[0]: {
                        "supplier_id": row[1],
                        "price": row[2],
                        "stock": row[3],
                        "moq": row[4],
                        "name": row[5]
                    }
                    for row in cursor.fetchall()
                }

                if len(products) != len(wanted):
                    return jsonify({
                        "error": "One or more products do not exist"
                    }), 404

                # Validate all products before creating anything
                for product_id, quantity in wanted.items():
                    product = products[product_id]

                    if product["supplier_id"] is None:
                        return jsonify({
                            "error": f"Product {product_id} has no supplier"
                        }), 400

                    if quantity < product["moq"]:
                        return jsonify({
                            "error": (
                                f"Minimum quantity for product "
                                f"{product_id} is {product['moq']}"
                            ),
                            "code": "below_min_order",
                            "product_id": product_id,
                            "product_name": product["name"],
                            "min_order": product["moq"],
                            "requested": quantity
                        }), 400

                    if quantity > product["stock"]:
                        return jsonify({
                            "error": (
                                f"Insufficient stock for product "
                                f"{product_id}"
                            ),
                            "code": "insufficient_stock",
                            "product_id": product_id,
                            "product_name": product["name"],
                            "available": product["stock"],
                            "requested": quantity
                        }), 400

                # Group products by supplier
                supplier_orders = {}

                for product_id, quantity in wanted.items():
                    product = products[product_id]

                    supplier_orders.setdefault(
                        product["supplier_id"], []
                    ).append({
                        "product_id": product_id,
                        "quantity": quantity,
                        "price": product["price"]
                    })

                grand_total = sum(
                    (
                        item["quantity"] * item["price"]
                        for supplier_items in supplier_orders.values()
                        for item in supplier_items
                    ),
                    Decimal("0")
                )

                expires_at = utc_now() + timedelta(
                    minutes=Config.CHECKOUT_EXPIRATION_MINUTES
                )

                # Create the checkout (one payment for all orders)
                cursor.execute("""
                    INSERT INTO checkouts (
                        merchant_id,
                        total_amount,
                        currency,
                        status,
                        payment_state,
                        expires_at
                    )
                    VALUES (%s, %s, 'SAR', 'pending', 'not_started', %s)
                    RETURNING id;
                """, (
                    request.user_id,
                    grand_total,
                    expires_at,
                ))

                checkout_id = cursor.fetchone()[0]

                created_orders = []

                for supplier_id, supplier_items in supplier_orders.items():

                    total_amount = sum(
                        (
                            item["quantity"] * item["price"]
                            for item in supplier_items
                        ),
                        Decimal("0")
                    )

                    cursor.execute("""
                        INSERT INTO orders (
                            merchant_id,
                            supplier_id,
                            total_amount,
                            status,
                            checkout_id
                        )
                        VALUES (%s, %s, %s, 'pending', %s)
                        RETURNING id;
                    """, (
                        request.user_id,
                        supplier_id,
                        total_amount,
                        checkout_id
                    ))

                    order_id = cursor.fetchone()[0]

                    for item in supplier_items:
                        cursor.execute("""
                            INSERT INTO order_items (
                                order_id,
                                product_id,
                                quantity,
                                unit_price
                            )
                            VALUES (%s, %s, %s, %s);
                        """, (
                            order_id,
                            item["product_id"],
                            item["quantity"],
                            item["price"]
                        ))

                        cursor.execute("""
                            UPDATE products
                            SET
                                stock_quantity = stock_quantity - %s,
                                stock_status = CASE
                                    WHEN stock_quantity - %s > 0
                                    THEN 'in_stock'
                                    ELSE 'out_of_stock'
                                END,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = %s;
                        """, (
                            item["quantity"],
                            item["quantity"],
                            item["product_id"]
                        ))

                    created_orders.append({
                        "id": order_id,
                        "supplier_id": supplier_id,
                        "total_amount": str(total_amount),
                        "status": "pending"
                    })

        return jsonify({
            "message": "Checkout created successfully",
            "checkout": {
                "id": checkout_id,
                "status": "pending",
                "currency": "SAR",
                "total_amount": str(grand_total),
                "payment_state": "not_started",
                "payment_initialization_required": True,
                "payment_initialization_endpoint": (
                    f"/api/checkouts/{checkout_id}/payment-attempts"
                ),
                "expires_at": expires_at.isoformat(),
            },
            "orders": created_orders,
            "count": len(created_orders)
        }), 201

    except psycopg.Error:
        current_app.logger.exception(
            "Database error while creating checkout"
        )

        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503


@checkouts_bp.route(
    "/api/checkouts/<int:checkout_id>/payment-attempts",
    methods=["POST"],
)
@token_required
def create_payment_attempt(checkout_id):
    if request.user_role != "merchant":
        return jsonify({"error": "Only merchants can pay for checkouts"}), 403

    if not Config.MOYASAR_PUBLISHABLE_KEY:
        return jsonify({"error": "Payment service is not configured"}), 503

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT
                        id, merchant_id, status, payment_state,
                        expires_at, total_amount
                    FROM checkouts
                    WHERE id = %s
                    FOR UPDATE;
                """, (checkout_id,))
                checkout = cursor.fetchone()

                if checkout is None:
                    return jsonify({"error": "Checkout not found"}), 404

                if checkout[1] != request.user_id:
                    return jsonify({"error": "Access denied"}), 403

                if checkout[2] != "pending":
                    return jsonify({
                        "error": f"Checkout is {checkout[2]}",
                        "status": checkout[2],
                    }), 409

                now = utc_now()
                if checkout[4] <= now:
                    try:
                        close_pending_checkout(cursor, checkout, "expired")
                    except CheckoutLifecycleConflict as error:
                        return jsonify({
                            "error": str(error),
                            "code": error.code,
                        }), 409
                    return jsonify({
                        "error": "Checkout has expired",
                        "status": "expired",
                    }), 410

                if not payment_attempts_are_safe(
                    cursor, checkout_id, checkout[3]
                ):
                    return jsonify({
                        "error": (
                            "A payment attempt is already active or "
                            "its status is uncertain"
                        ),
                        "code": "payment_attempt_uncertain",
                    }), 409

                cursor.execute("""
                    INSERT INTO checkout_payment_attempts (
                        checkout_id, status
                    )
                    VALUES (%s, 'in_progress')
                    RETURNING id;
                """, (checkout_id,))
                attempt_id = cursor.fetchone()[0]

                cursor.execute("""
                    UPDATE checkouts
                    SET payment_state = 'in_progress',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s;
                """, (checkout_id,))

        amount_halalas = int(
            (Decimal(checkout[5]) * 100).quantize(Decimal("1"))
        )

        return jsonify({
            "payment": {
                "amount": amount_halalas,
                "currency": "SAR",
                "description": f"Maksab checkout #{checkout_id}",
                "metadata": {
                    "checkout_id": str(checkout_id),
                    "payment_attempt_id": str(attempt_id),
                },
                "publishable_key": Config.MOYASAR_PUBLISHABLE_KEY,
            },
            "payment_attempt_id": attempt_id,
        }), 200

    except psycopg.Error:
        current_app.logger.exception(
            "Database error while initializing checkout payment"
        )
        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503


@checkouts_bp.route("/api/checkouts/<int:checkout_id>/cancel", methods=["POST"])
@token_required
def cancel_checkout(checkout_id):
    if request.user_role != "merchant":
        return jsonify({"error": "Only merchants can cancel checkouts"}), 403

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, merchant_id, status, payment_state, expires_at
                    FROM checkouts
                    WHERE id = %s
                    FOR UPDATE;
                """, (checkout_id,))
                checkout = cursor.fetchone()

                if checkout is None:
                    return jsonify({"error": "Checkout not found"}), 404

                if checkout[1] != request.user_id:
                    return jsonify({"error": "Access denied"}), 403

                if checkout[2] == "cancelled":
                    return jsonify({
                        "message": "Checkout already cancelled",
                        "status": "cancelled",
                        "already_cancelled": True,
                        "restored_products": [],
                    }), 200

                if checkout[2] == "paid":
                    return jsonify({
                        "error": "Paid checkouts cannot be cancelled",
                        "status": "paid",
                    }), 409

                if checkout[2] != "pending":
                    return jsonify({
                        "error": f"Checkout is {checkout[2]}",
                        "status": checkout[2],
                    }), 409

                try:
                    restored_products = close_pending_checkout(
                        cursor, checkout, "cancelled"
                    )
                except CheckoutLifecycleConflict as error:
                    return jsonify({
                        "error": str(error),
                        "code": error.code,
                    }), 409

        return jsonify({
            "message": "Checkout cancelled and stock restored",
            "status": "cancelled",
            "already_cancelled": False,
            "restored_products": restored_products,
        }), 200

    except psycopg.Error:
        current_app.logger.exception(
            "Database error while cancelling checkout"
        )
        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503


@checkouts_bp.route("/api/checkouts/<int:checkout_id>", methods=["GET"])
@token_required
def get_checkout(checkout_id):
    # Only merchants can view their own checkouts
    if request.user_role != "merchant":
        return jsonify({"error": "Access denied"}), 403

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:

                cursor.execute("""
                    SELECT
                        id,
                        merchant_id,
                        total_amount,
                        currency,
                        status,
                        payment_id,
                        payment_state,
                        paid_at,
                        created_at,
                        expires_at,
                        cancelled_at,
                        expired_at
                    FROM checkouts
                    WHERE id = %s;
                """, (checkout_id,))

                checkout = cursor.fetchone()

                if checkout is None:
                    return jsonify({"error": "Checkout not found"}), 404

                if checkout[1] != request.user_id:
                    return jsonify({"error": "Access denied"}), 403

                cursor.execute("""
                    SELECT id, supplier_id, total_amount, status
                    FROM orders
                    WHERE checkout_id = %s
                    ORDER BY id;
                """, (checkout_id,))

                orders = [
                    {
                        "id": row[0],
                        "supplier_id": row[1],
                        "total_amount": str(row[2]),
                        "status": row[3]
                    }
                    for row in cursor.fetchall()
                ]

        return jsonify({
            "checkout": {
                "id": checkout[0],
                "total_amount": str(checkout[2]),
                "currency": checkout[3],
                "status": checkout[4],
                "payment_id": checkout[5],
                "payment_state": checkout[6],
                "paid_at": (
                    checkout[7].isoformat()
                    if checkout[7] is not None
                    else None
                ),
                "created_at": (
                    checkout[8].isoformat()
                    if checkout[8] is not None
                    else None
                ),
                "expires_at": checkout[9].isoformat(),
                "cancelled_at": (
                    checkout[10].isoformat()
                    if checkout[10] is not None
                    else None
                ),
                "expired_at": (
                    checkout[11].isoformat()
                    if checkout[11] is not None
                    else None
                ),
            },
            "orders": orders,
            "count": len(orders)
        }), 200

    except psycopg.Error:
        current_app.logger.exception(
            "Database error while fetching checkout"
        )

        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503