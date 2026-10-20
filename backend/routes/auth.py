from datetime import datetime, timedelta, timezone

import jwt
import psycopg

from flask import Blueprint, jsonify, request, current_app
from werkzeug.security import generate_password_hash, check_password_hash

from config import Config
from decorators import token_required


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# --------------------------------------------------
# Register
# --------------------------------------------------

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data"}), 400

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "merchant")

    # Validate user input
    if not all([
        isinstance(full_name, str) and full_name.strip(),
        isinstance(email, str) and email.strip(),
        isinstance(password, str) and len(password) >= 8
    ]):
        return jsonify({
            "error": "Invalid name, email or password"
        }), 400

    if role not in ["merchant", "supplier"]:
        return jsonify({"error": "Invalid role"}), 400

    full_name = full_name.strip()
    email = email.strip().lower()

    if "@" not in email or len(email) > 120:
        return jsonify({"error": "Invalid email"}), 400

    if len(full_name) > 100:
        return jsonify({"error": "Name is too long"}), 400

    # Hash password before saving
    password_hash = generate_password_hash(password)

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO users (name, email, password_hash, role)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                """, (full_name, email, password_hash, role))

                user_id = cursor.fetchone()[0]

    except psycopg.errors.UniqueViolation:
        return jsonify({
            "error": "Email already registered"
        }), 409

    except psycopg.Error:
        current_app.logger.exception("Registration database error")
        return jsonify({
            "error": "Database unavailable"
        }), 503

    return jsonify({
        "message": "Account created successfully",
        "user_id": user_id
    }), 201


# --------------------------------------------------
# Login
# --------------------------------------------------

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data"}), 400

    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({
            "error": "Email and password are required"
        }), 400

    email = email.strip().lower()

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, email, password_hash, role
                    FROM users
                    WHERE email = %s;
                """, (email,))

                user = cursor.fetchone()

    except psycopg.Error:
        current_app.logger.exception("Login database error")
        return jsonify({
            "error": "Database unavailable"
        }), 503

    # Verify password
    if not user or not check_password_hash(user[3], password):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # Generate JWT token
    now = datetime.now(timezone.utc)

    token = jwt.encode({
        "sub": str(user[0]),
        "role": user[4],
        "iat": now,
        "exp": now + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)

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


# --------------------------------------------------
# Current User
# --------------------------------------------------

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, email, role
                    FROM users
                    WHERE id = %s;
                """, (request.user_id,))

                user = cursor.fetchone()

    except psycopg.Error:
        current_app.logger.exception("Get current user database error")
        return jsonify({
            "error": "Database unavailable"
        }), 503

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify({
        "user": {
            "id": user[0],
            "full_name": user[1],
            "email": user[2],
            "role": user[3]
        }
    }), 200


# --------------------------------------------------
# Logout
# --------------------------------------------------

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({
        "message": "Remove the token on the client to log out"
    }), 200