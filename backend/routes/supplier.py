import psycopg
from flask import Blueprint, current_app, jsonify, request

from config import Config
from decorators import token_required


supplier_bp = Blueprint("supplier", __name__)


def get_db_connection():
    return psycopg.connect(Config.DATABASE_URL)


@supplier_bp.route("/api/supplier/home", methods=["GET"])
@token_required
def supplier_home():
    if request.user_role != "supplier":
        return jsonify({"error": "Access denied"}), 403

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, business_name
                    FROM users
                    WHERE id = %s AND role = 'supplier';
                """, (request.user_id,))

                supplier = cursor.fetchone()

                if supplier is None:
                    return jsonify({"error": "Supplier not found"}), 404

                cursor.execute("""
                    SELECT id, name, price, stock_status
                    FROM products
                    WHERE supplier_id = %s
                    ORDER BY id;
                """, (request.user_id,))

                rows = cursor.fetchall()

    except psycopg.Error:
        current_app.logger.exception("Database error in supplier home")
        return jsonify({"error": "Database temporarily unavailable"}), 503

    products = [
        {
            "id": row[0],
            "name": row[1],
            "price": str(row[2]),
            "stock_status": row[3]
        }
        for row in rows
    ]

    return jsonify({
        "message": "Welcome to supplier home",
        "supplier": {
            "id": supplier[0],
            "name": supplier[1],
            "business_name": supplier[2]
        },
        "total_products": len(products),
        "products": products
    }), 200


@supplier_bp.route("/api/supplier/dashboard", methods=["GET"])
@token_required
def supplier_dashboard():
    if request.user_role != "supplier":
        return jsonify({"error": "Access denied"}), 403

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, business_name
                    FROM users
                    WHERE id = %s AND role = 'supplier';
                """, (request.user_id,))

                supplier = cursor.fetchone()

                if supplier is None:
                    return jsonify({"error": "Supplier not found"}), 404

                cursor.execute("""
                    SELECT
                        COUNT(*),
                        COUNT(*) FILTER (
                            WHERE stock_quantity > 0
                            AND stock_status = 'in_stock'
                        )
                    FROM products
                    WHERE supplier_id = %s;
                """, (request.user_id,))

                total_products, available_products = cursor.fetchone()

                cursor.execute("""
                    SELECT
                        COUNT(*),
                        COUNT(*) FILTER (
                            WHERE status = 'pending'
                        ),
                        COALESCE(
                            SUM(total_amount) FILTER (
                                WHERE status IN (
                                    'paid', 'processing',
                                    'shipped', 'delivered'
                                )
                            ), 0
                        ),
                        COALESCE(
                            SUM(total_amount) FILTER (
                                WHERE status IN (
                                    'paid', 'processing',
                                    'shipped', 'delivered'
                                )
                                AND created_at >= DATE_TRUNC(
                                    'month', CURRENT_TIMESTAMP
                                )
                                AND created_at < DATE_TRUNC(
                                    'month', CURRENT_TIMESTAMP
                                ) + INTERVAL '1 month'
                            ), 0
                        )
                    FROM orders
                    WHERE supplier_id = %s;
                """, (request.user_id,))

                total_orders, new_orders, total_sales, month_sales = cursor.fetchone()

                cursor.execute("""
                    SELECT
                        o.id,
                        o.merchant_id,
                        o.total_amount,
                        o.status,
                        o.created_at,
                        COALESCE(NULLIF(u.business_name, ''), u.name) AS customer,
                        (
                            SELECT COUNT(*)
                            FROM order_items oi
                            WHERE oi.order_id = o.id
                        ) AS items_count
                    FROM orders o
                    JOIN users u ON u.id = o.merchant_id
                    WHERE o.supplier_id = %s
                    ORDER BY o.created_at DESC, o.id DESC
                    LIMIT 5;
                """, (request.user_id,))

                rows = cursor.fetchall()

    except psycopg.Error:
        current_app.logger.exception("Database error in supplier dashboard")
        return jsonify({"error": "Database temporarily unavailable"}), 503

    recent_orders = [
        {
            "id": row[0],
            "merchant_id": row[1],
            "total_amount": str(row[2]),
            "total": float(row[2]),
            "status": row[3],
            "created_at": row[4].isoformat() if row[4] else None,
            "customer": row[5],
            "items_count": row[6],
            "district": None
        }
        for row in rows
    ]

    stats = {
        "total_products": total_products,
        "available_products": available_products,
        "total_orders": total_orders,
        "new_orders": new_orders,
        "total_sales": str(total_sales),
        "month_sales": str(month_sales)
    }

    return jsonify({
        "supplier": {
            "id": supplier[0],
            "name": supplier[1],
            "business_name": supplier[2]
        },
        "stats": stats,
        "orders": recent_orders,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_sales": str(total_sales),
        "recent_orders": recent_orders
    }), 200