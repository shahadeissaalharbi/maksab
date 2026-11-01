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