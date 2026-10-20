import psycopg

from flask import Blueprint, current_app, jsonify, request

from config import Config
from decorators import token_required


supplier_bp = Blueprint("supplier", __name__)


@supplier_bp.route("/api/supplier/home", methods=["GET"])
@token_required
def supplier_home():

    # Only suppliers can access this endpoint
    if request.user_role != "supplier":
        return jsonify({
            "error": "Access denied"
        }), 403

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:

                # Get supplier information
                cursor.execute("""
                    SELECT id, name, business_name
                    FROM users
                    WHERE id = %s AND role = 'supplier';
                """, (request.user_id,))

                supplier = cursor.fetchone()

                if supplier is None:
                    return jsonify({
                        "error": "Supplier not found"
                    }), 404

                # Get supplier products
                cursor.execute("""
                    SELECT id, name, price, stock_status
                    FROM products
                    WHERE supplier_id = %s
                    ORDER BY id;
                """, (request.user_id,))

                rows = cursor.fetchall()

    except psycopg.Error:
        current_app.logger.exception(
            "Database error in supplier home"
        )

        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503

    # Convert products into JSON
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