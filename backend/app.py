import os

import psycopg
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ["DATABASE_URL"]
from datetime import datetime, timedelta, timezone

import jwt
import psycopg
from flask import Flask, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash


DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 2


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



@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data"}), 400

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "merchant")

    if not all([
        isinstance(full_name, str) and full_name.strip(),
        isinstance(email, str) and email.strip(),
        isinstance(password, str) and len(password) >= 8
    ]):
        return jsonify({"error": "Invalid name, email or password"}), 400

    if role not in ["merchant", "supplier"]:
        return jsonify({"error": "Invalid role"}), 400

    full_name = full_name.strip()
    email = email.strip().lower()

    if "@" not in email or len(email) > 120:
        return jsonify({"error": "Invalid email"}), 400

    if len(full_name) > 100:
        return jsonify({"error": "Name is too long"}), 400

    password_hash = generate_password_hash(password)

    try:
        with psycopg.connect(DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO users (full_name, email, password, role)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                """, (full_name, email, password_hash, role))

                user_id = cursor.fetchone()[0]

        return jsonify({
            "message": "Account created successfully",
            "user_id": user_id
        }), 201

    except psycopg.errors.UniqueViolation:
        return jsonify({"error": "Email already registered"}), 409

    except psycopg.Error:
        app.logger.exception("Registration database error")
        return jsonify({"error": "Database unavailable"}), 503


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data"}), 400

    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"error": "Email and password are required"}), 400

    email = email.strip().lower()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        with psycopg.connect(DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, full_name, email, password, role
                    FROM users
                    WHERE email = %s;
                """, (email,))

                user = cursor.fetchone()

    except psycopg.Error:
        app.logger.exception("Login database error")
        return jsonify({"error": "Database unavailable"}), 503

    if not user or not check_password_hash(user[3], password):
        return jsonify({"error": "Invalid email or password"}), 401

    now = datetime.now(timezone.utc)

    token = jwt.encode({
        "sub": str(user[0]),
        "role": user[4],
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRATION_HOURS)
    }, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user[0],
            "full_name": user[1],
            "email": user[2],
            "role": user[4]
        }
    }), 200


@app.route("/api/auth/me", methods=["GET"])
def get_current_user():
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

        user_id = int(payload["sub"])

    except (jwt.InvalidTokenError, ValueError, KeyError):
        return jsonify({"error": "Invalid or expired token"}), 401

    try:
        with psycopg.connect(DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, full_name, email, role
                    FROM users
                    WHERE id = %s;
                """, (user_id,))

                user = cursor.fetchone()

    except psycopg.Error:
        app.logger.exception("Database error while fetching user")
        return jsonify({"error": "Database unavailable"}), 503

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "user": {
            "id": user[0],
            "full_name": user[1],
            "email": user[2],
            "role": user[3]
        }
    }), 200


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    return jsonify({
        "message": "Remove the token on the client to log out"
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
