import psycopg

from flask import Flask, jsonify, request
from flask_cors import CORS

from config import Config
from decorators import token_required
from routes.auth import auth_bp
from products import products_bp
from routes.supplier import supplier_bp

# Create Flask application
app = Flask(__name__)
CORS(app)


# Register API Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(supplier_bp)

# Database configuration
DATABASE_URL = Config.DATABASE_URL


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Maksab API is running"
    }), 200


# --------------------------------------------------
# Trader Home
# --------------------------------------------------

@app.route("/api/trader/home", methods=["GET"])
@token_required
def trader_home():

    # Allow merchants only
    if request.user_role != "merchant":
        return jsonify({
            "error": "Access denied"
        }), 403

    # Validate pagination parameters
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))

    except (ValueError, TypeError):
        return jsonify({
            "error": "page and limit must be numbers"
        }), 400

    if page < 1 or limit < 1 or limit > 100:
        return jsonify({
            "error": "Invalid page or limit"
        }), 400

    offset = (page - 1) * limit

    # Fetch available products
    try:
        with psycopg.connect(DATABASE_URL) as connection:
            with connection.cursor() as cursor:

                # Count available products
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM products
                    WHERE stock_quantity > 0;
                """)

                total = cursor.fetchone()[0]

                # Fetch paginated products
                cursor.execute("""
                    SELECT
                        id,
                        name,
                        description,
                        price,
                        stock_quantity
                    FROM products
                    WHERE stock_quantity > 0
                    ORDER BY id
                    LIMIT %s OFFSET %s;
                """, (limit, offset))

                rows = cursor.fetchall()

    except psycopg.Error:
        app.logger.exception(
            "Database error while fetching trader home"
        )

        return jsonify({
            "error": "Database unavailable"
        }), 503

    # Convert database rows into JSON objects
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
        "page": page,
        "limit": limit,
        "total": total
    }), 200


# --------------------------------------------------
# Run Application
# --------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
    )