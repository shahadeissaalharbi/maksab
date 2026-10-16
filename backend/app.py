import os

import psycopg
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ["DATABASE_URL"]


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Maksab API is running"
    }), 200


@app.route("/api/products", methods=["GET"])
def get_products():
    try:
        with psycopg.connect(DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, description, price, stock_quantity
                    FROM products
                    ORDER BY id;
                """)

                rows = cursor.fetchall()

                products = [
                    {
                        "id": row[0],
                        "name": row[1],
                        "description": row[2],
                        "price": str(row[3]),
                        "stock_quantity": row[4],
                    }
                    for row in rows
                ]

        return jsonify({
            "products": products,
            "count": len(products)
        }), 200

    except psycopg.Error:
        app.logger.exception("Database error while fetching products")

        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
