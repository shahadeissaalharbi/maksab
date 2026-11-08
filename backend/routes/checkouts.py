from decimal import Decimal

import psycopg
from flask import Blueprint, current_app, jsonify, request

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

                # Create the checkout (one payment for all orders)
                cursor.execute("""
                    INSERT INTO checkouts (
                        merchant_id,
                        total_amount,
                        currency,
                        status
                    )
                    VALUES (%s, %s, 'SAR', 'pending')
                    RETURNING id;
                """, (request.user_id, grand_total))

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

        # Moyasar expects the amount in halalas (1 SAR = 100 halalas)
        amount_halalas = int(
            (grand_total * 100).quantize(Decimal("1"))
        )

        return jsonify({
            "message": "Checkout created successfully",
            "checkout": {
                "id": checkout_id,
                "status": "pending",
                "currency": "SAR",
                "total_amount": str(grand_total),
                "amount_halalas": amount_halalas,
                "description": f"Maksab checkout #{checkout_id}",
                "metadata": {"checkout_id": str(checkout_id)},
                "publishable_key": Config.MOYASAR_PUBLISHABLE_KEY or None
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