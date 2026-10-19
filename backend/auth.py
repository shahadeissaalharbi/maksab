import os

import psycopg
from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import generate_password_hash

auth_bp = Blueprint("auth", __name__)

DATABASE_URL = os.environ["DATABASE_URL"]


@auth_bp.route("/api/auth/register", methods=["POST"])
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

    if (
        email.count("@") != 1
        or email.startswith("@")
        or "." not in email.split("@")[-1]
        or len(email) > 120
    ):
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
        current_app.logger.exception("Registration database error")
        return jsonify({"error": "Database unavailable"}), 503