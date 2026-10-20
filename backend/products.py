import os
import psycopg
from flask import Blueprint, jsonify

# Products Blueprint
products_bp = Blueprint("products_bp", __name__)

DATABASE_URL = os.environ["DATABASE_URL"]

@products_bp.route("/api/products", methods=["GET"])
def get_products():
    try:
        # الاتصال بقاعدة البيانات وجلب المنتجات
        with psycopg.connect(DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, description, price, stock_quantity
                    FROM products
                    ORDER BY id;
                """)
                rows = cursor.fetchall()

                # تحويل البيانات القادمة من الداتابيز إلى قائمة من الـ Dictionaries
                products = [
                    {
                        "id": row[0],
                        "name": row[1],
                        "description": row[2],
                        "price": str(row[3]),
                        "stock_quantity": row[4]
                    }
                    for row in rows
                ]

        return jsonify({
            "products": products,
            "count": len(products)
        }), 200

    except psycopg.Error:
        return jsonify({"error": "Database temporarily unavailable"}), 503
