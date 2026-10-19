import os
from functools import wraps

import jwt
import psycopg
from flask import Flask, jsonify, request
from flask_cors import CORS

from auth import auth_bp


app = Flask(__name__)
CORS(app)
app.register_blueprint(auth_bp)

DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"


# -------------------------
# JWT Authentication
# -------------------------

def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token required"}), 401

        token = auth_header[7:]

        try:
            payload = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=[JWT_ALGORITHM]
            )

            request.user_id = int(payload["sub"])
            request.user_role = payload["role"]

        except (jwt.InvalidTokenError, ValueError, KeyError):
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)

    return wrapper


# -------------------------
# Health Check
# -------------------------

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Maksab API is running"
    }), 200


# -------------------------
# Products
# -------------------------

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
                        "stock_quantity": row[4]
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


# -------------------------
# Trader Home
# -------------------------

@app.route("/api/trader/home", methods=["GET"])
@token_required
def trader_home():
    if request.user_role != "merchant":
        return jsonify({"error": "Access denied"}), 403

    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))

    except ValueError:
        return jsonify({
            "error": "page and limit must be numbers"
        }), 400

    if page < 1 or limit < 1 or limit > 100:
        return jsonify({
            "error": "Invalid page or limit"
        }), 400

    offset = (page - 1) * limit

    try:
        with psycopg.connect(DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""

                    SELECT COUNT(*)
                    FROM products
                    WHERE stock_quantity > 0;
                """)

                total = cursor.fetchone()[0]

                cursor.execute("""
                    SELECT id, name, description, price, stock_quantity
                    FROM products
                    WHERE stock_quantity > 0
                    ORDER BY id
                    LIMIT %s OFFSET %s;
                """, (limit, offset))

                rows = cursor.fetchall()

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

    except psycopg.Error:
        app.logger.exception("Database error while fetching trader home")
        return jsonify({
            "error": "Database unavailable"
        }), 503


# -------------------------
# Current User
# -------------------------

@app.route("/api/auth/me", methods=["GET"])
@token_required
def get_current_user():
    try:
        with psycopg.connect(DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, email, role
                    FROM users
                    WHERE id = %s;
                """, (request.user_id,))

                user = cursor.fetchone()

    except psycopg.Error:
        app.logger.exception("Database error while fetching user")
        return jsonify({
            "error": "Database unavailable"
        }), 503

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "user": {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[3]
        }
    }), 200


# -------------------------
# Run Flask
# -------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)