import psycopg
from flask import Blueprint, current_app, jsonify, request

from config import Config
from decorators import token_required


orders_bp = Blueprint("orders", __name__)


@orders_bp.route("/api/orders", methods=["GET"])
@token_required
def get_orders():

    # Only merchants and suppliers can view their own orders
    if request.user_role not in ("merchant", "supplier"):
        return jsonify({"error": "Access denied"}), 403

    user_column = (
        "merchant_id"
        if request.user_role == "merchant"
        else "supplier_id"
    )

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:

                cursor.execute(f"""
                    SELECT
                        o.id,
                        o.merchant_id,
                        o.supplier_id,
                        o.total_amount,
                        o.status,
                        o.created_at,
                        o.updated_at,
                        COALESCE(
                            NULLIF(s.business_name, ''),
                            s.name
                        ) AS supplier_name
                    FROM orders AS o
                    JOIN users AS s
                        ON s.id = o.supplier_id
                    WHERE o.{user_column} = %s
                    ORDER BY o.created_at DESC, o.id DESC;
                """, (request.user_id,))

                order_rows = cursor.fetchall()
                orders = []

                for row in order_rows:
                    order_id = row[0]

                    cursor.execute("""
                        SELECT
                            oi.id,
                            oi.product_id,
                            p.name,
                            oi.quantity,
                            oi.unit_price,
                            oi.subtotal
                        FROM order_items AS oi
                        JOIN products AS p
                            ON p.id = oi.product_id
                        WHERE oi.order_id = %s
                        ORDER BY oi.id;
                    """, (order_id,))

                    item_rows = cursor.fetchall()

                    items = [
                        {
                            "id": item[0],
                            "product_id": item[1],
                            "product_name": item[2],
                            "quantity": item[3],
                            "unit_price": str(item[4]),
                            "subtotal": str(item[5])
                        }
                        for item in item_rows
                    ]

                    items_summary = ", ".join(
                        item["product_name"]
                        for item in items
                    )

                    orders.append({
                        "id": row[0],
                        "merchant_id": row[1],
                        "supplier_id": row[2],
                        "supplier_name": row[7],
                        "total_amount": str(row[3]),
                        "total": str(row[3]),
                        "status": row[4],
                        "created_at": (
                            row[5].strftime("%Y-%m-%d")
                            if row[5] is not None
                            else None
                        ),
                        "updated_at": (
                            row[6].isoformat()
                            if row[6] is not None
                            else None
                        ),
                        "items_summary": items_summary,
                        "items": items
                    })

    except psycopg.Error:
        current_app.logger.exception(
            "Database error while fetching orders"
        )
        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503

    return jsonify({
        "orders": orders,
        "count": len(orders)
    }), 200

@orders_bp.route("/api/orders", methods=["POST"])
@token_required
def create_order():
    # Only merchants can create orders
    if request.user_role != "merchant":
        return jsonify({"error": "Only merchants can create orders"}), 403

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
                        COALESCE(moq, 1)
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
                        "moq": row[4]
                    }
                    for row in cursor.fetchall()
                }

                if len(products) != len(wanted):
                    return jsonify({
                        "error": "One or more products do not exist"
                    }), 404

                # Validate all products before creating orders
                for product_id, quantity in wanted.items():
                    product = products[product_id]

                    if product["supplier_id"] is None:
                        return jsonify({
                            "error": f"Product {product_id} has no supplier"
                        }), 400

                    if quantity < product["moq"]:
                        return jsonify({
                            "error": f"Minimum quantity for product {product_id} is {product['moq']}"
                        }), 400

                    if quantity > product["stock"]:
                        return jsonify({
                            "error": f"Insufficient stock for product {product_id}"
                        }), 400

                # Group products by supplier
                supplier_orders = {}

                for product_id, quantity in wanted.items():
                    product = products[product_id]
                    supplier_id = product["supplier_id"]

                    supplier_orders.setdefault(supplier_id, []).append({
                        "product_id": product_id,
                        "quantity": quantity,
                        "price": product["price"]
                    })

                created_orders = []

                for supplier_id, supplier_items in supplier_orders.items():

                    total_amount = sum(
                        item["quantity"] * item["price"]
                        for item in supplier_items
                    )

                    cursor.execute("""
                        INSERT INTO orders (
                            merchant_id,
                            supplier_id,
                            total_amount,
                            status
                        )
                        VALUES (%s, %s, %s, 'pending')
                        RETURNING id;
                    """, (
                        request.user_id,
                        supplier_id,
                        total_amount
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
            "message": "Orders created successfully",
            "orders": created_orders,
            "count": len(created_orders)
        }), 201

    except psycopg.Error:
        current_app.logger.exception(
            "Database error while creating orders"
        )

        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503


@orders_bp.route("/api/supplier/orders/<int:order_id>/status", methods=["PATCH"])
@orders_bp.route("/api/orders/<int:order_id>/status", methods=["PATCH"])
@token_required
def update_order_status(order_id):
    # Only suppliers can update order fulfillment status
    if request.user_role != "supplier":
        return jsonify({"error": "Only suppliers can update order status"}), 403

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON body"}), 400

    new_status = data.get("status")

    allowed_transitions = {
        "paid": "processing",
        "processing": "shipped",
        "shipped": "delivered",
    }

    if not isinstance(new_status, str):
        return jsonify({"error": "Status must be a string"}), 400

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                # Lock order to prevent concurrent status updates
                cursor.execute(
                    """
                    SELECT supplier_id, status
                    FROM orders
                    WHERE id = %s
                    FOR UPDATE;
                    """,
                    (order_id,),
                )

                order = cursor.fetchone()

                if order is None:
                    return jsonify({"error": "Order not found"}), 404

                supplier_id, current_status = order

                if supplier_id != request.user_id:
                    return jsonify({"error": "Access denied"}), 403

                expected_status = allowed_transitions.get(current_status)

                if expected_status != new_status:
                    return jsonify({
                        "error": "Invalid status transition",
                        "current_status": current_status,
                        "allowed_next_status": expected_status,
                    }), 409

                cursor.execute(
                    """
                    UPDATE orders
                    SET status = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, status;
                    """,
                    (new_status, order_id),
                )

                updated_order = cursor.fetchone()

        return jsonify({
            "message": "Order status updated successfully",
            "order": {
                "id": updated_order[0],
                "status": updated_order[1],
            },
        }), 200

    except psycopg.Error:
        current_app.logger.exception(
            "Database error while updating order status"
        )
        return jsonify({"error": "Database temporarily unavailable"}), 503
