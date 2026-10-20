import os
from datetime import datetime, timedelta, timezone

import jwt
import psycopg
from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash


auth_bp = Blueprint("auth", __name__)

DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 2


# Register a new user
@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "merchant")

    if not all([
        isinstance(name, str) and name.strip(),
        isinstance(email, str) and email.strip(),
        isinstance(password, str) and len(password) >= 8
    ]):
        return jsonify({"error": "Invalid name, email or password"}), 400

    if role not in ["merchant", "supplier"]:
        return jsonify({"error": "Invalid role"}), 400

    name = name.strip()
    email = email.strip().lower()

    if (
        email.count("@") != 1
        or email.startswith("@")
        or "." not in email.split("@")[-1]
        or len(email) > 120
    ):
        return jsonify({"error": "Invalid email"}), 400

    if len(name) > 100:
        return jsonify({"error": "Name is too long"}), 400

    password_hash = generate_password_hash(password)

    try:
        with psycopg.connect(DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO users (name, email, password_hash, role)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                """, (name, email, password_hash, role))

                user_id = cursor.fetchone()[0]

        return jsonify({
            "message": "Account created successfully",
            "user_id": user_id
        }), 201

    except psycopg.errors.UniqueViolation:
        return jsonify({"error": "Email already registered"}), 409

    except psycopg.Error:
        current_app.logger.exception("Registration database error")
        return jsonify({"error": "Database unavailable"}), 503


# Log in an existing user
@auth_bp.route("/api/auth/login", methods=["POST"])
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
                    SELECT id, name, email, password_hash, role
                    FROM users
                    WHERE email = %s;
                """, (email,))

                user = cursor.fetchone()

    except psycopg.Error:
        current_app.logger.exception("Login database error")
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
            "name": user[1],
            "email": user[2],
            "role": user[4]
        }
    }), 200


# Log out the current user
@auth_bp.route("/api/auth/logout", methods=["POST"])
def logout():
    return jsonify({
        "message": "Remove the token on the client to log out"
    }), 200
