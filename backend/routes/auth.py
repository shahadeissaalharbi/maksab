from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import jwt
import psycopg
from flask import Blueprint, jsonify, request, current_app
from werkzeug.security import generate_password_hash, check_password_hash

from config import Config
from decorators import token_required
from email_service import send_verification_email
from verification_tokens import (
    generate_verification_token,
    hash_verification_token,
)


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def get_db_connection():
    return psycopg.connect(Config.DATABASE_URL)


def is_valid_email(email):
    return isinstance(email, str) and "@" in email and len(email.strip()) <= 120

@auth_bp.route("/register", methods=["POST"])
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
        return jsonify({
            "error": "Invalid name, email or password"
        }), 400

    if role not in ["merchant", "supplier"]:
        return jsonify({"error": "Invalid role"}), 400

    full_name = full_name.strip()
    email = email.strip().lower()

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email"}), 400

    if len(full_name) > 100:
        return jsonify({"error": "Name is too long"}), 400

    password_hash = generate_password_hash(password)

    # Generate verification token
    token, token_hash, expires_at = generate_verification_token()

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:

                cursor.execute("""
                    INSERT INTO users (
                        name,
                        email,
                        password_hash,
                        role,
                        is_verified
                    )
                    VALUES (%s, %s, %s, %s, FALSE)
                    RETURNING id;
                """, (
                    full_name,
                    email,
                    password_hash,
                    role
                ))

                user_id = cursor.fetchone()[0]

                cursor.execute("""
                    INSERT INTO email_verification_tokens (
                        user_id,
                        token_hash,
                        expires_at
                    )
                    VALUES (%s, %s, %s);
                """, (
                    user_id,
                    token_hash,
                    expires_at
                ))

    except psycopg.errors.UniqueViolation:
        return jsonify({
            "error": "Email already registered"
        }), 409

    except psycopg.Error:
        current_app.logger.exception(
            "Registration database error"
        )
        return jsonify({
            "error": "Database unavailable"
        }), 503

    verification_url = (
        f"{Config.EMAIL_VERIFICATION_BASE_URL.rstrip('/')}"
        f"/api/auth/verify-email?"
        f"{urlencode({'token': token})}"
    )

    # Send verification email
    try:
        send_verification_email(email, verification_url)

    except Exception:
        current_app.logger.exception(
            "Failed to resend verification email"
        )

        # Delete only the token created by this failed attempt.
        try:
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        DELETE FROM email_verification_tokens
                        WHERE token_hash = %s
                          AND user_id = %s
                          AND used_at IS NULL;
                    """, (token_hash, user_id))

        except psycopg.Error:
            current_app.logger.exception(
                "Failed to clean up verification token"
            )

        return jsonify({
            "error": "Verification email could not be sent"
        }), 502

    return jsonify({
        "message": "Account created. Please verify your email.",
        "user_id": user_id
    }), 201

@auth_bp.route("/verify-email", methods=["GET"])
def verify_email():
    token = request.args.get("token")

    if not token:
        return jsonify({
            "error": "Verification token is required"
        }), 400

    token_hash = hash_verification_token(token)

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:

                cursor.execute("""
                    SELECT id, user_id
                    FROM email_verification_tokens
                    WHERE token_hash = %s
                      AND used_at IS NULL
                      AND expires_at > NOW()
                    FOR UPDATE;
                """, (token_hash,))

                verification = cursor.fetchone()

                if not verification:
                    return jsonify({
                        "error": "Invalid or expired verification link"
                    }), 400

                verification_id, user_id = verification

                # Activate account
                cursor.execute("""
                    UPDATE users
                    SET is_verified = TRUE,
                        email_verified_at = NOW()
                    WHERE id = %s;
                """, (user_id,))

                # Mark token as used
                cursor.execute("""
                    UPDATE email_verification_tokens
                    SET used_at = NOW()
                    WHERE id = %s;
                """, (verification_id,))

    except psycopg.Error:
        current_app.logger.exception(
            "Email verification database error"
        )

        return jsonify({
            "error": "Database unavailable"
        }), 503

    return jsonify({
        "message": "Email verified successfully. You can now log in."
    }), 200

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
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT
                        id,
                        name,
                        email,
                        password_hash,
                        role,
                        is_verified
                    FROM users
                    WHERE email = %s;
                """, (email,))

                user = cursor.fetchone()

    except psycopg.Error:
        current_app.logger.exception(
            "Login database error"
        )

        return jsonify({
            "error": "Database unavailable"
        }), 503

    if not user or not check_password_hash(user[3], password):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # Prevent login before email verification
    if not user[5]:
        return jsonify({
            "error": "Please verify your email before logging in"
        }), 403

    now = datetime.now(timezone.utc)

    token = jwt.encode({
        "sub": str(user[0]),
        "role": user[4],
        "iat": now,
        "exp": now + timedelta(
            hours=Config.JWT_EXPIRATION_HOURS
        )
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

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, email, role
                    FROM users
                    WHERE id = %s;
                """, (request.user_id,))

                user = cursor.fetchone()

    except psycopg.Error:
        current_app.logger.exception(
            "Get current user database error"
        )

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

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({
        "message": "Remove the token on the client to logout"
    }), 200
@auth_bp.route("/resend-verification", methods=["POST"])
def resend_verification():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data"}), 400

    email = data.get("email")

    if not isinstance(email, str):
        return jsonify({"error": "Valid email is required"}), 400

    email = email.strip().lower()

    if not is_valid_email(email):
        return jsonify({"error": "Valid email is required"}), 400

    # Same response whether the account exists or is already verified.
    generic_response = {
        "message": "If this account needs verification, an email will be sent."
    }

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, is_verified
                    FROM users
                    WHERE email = %s;
                """, (email,))

                user = cursor.fetchone()

                if not user or user[1]:
                    return jsonify(generic_response), 200

                user_id = user[0]

                # Limit requests: one new token per 5 minutes.
                cursor.execute("""
                    SELECT 1
                    FROM email_verification_tokens
                    WHERE user_id = %s
                      AND created_at > NOW() - INTERVAL '5 minutes'
                    LIMIT 1;
                """, (user_id,))

                if cursor.fetchone():
                    return jsonify(generic_response), 200

                token, token_hash, expires_at = generate_verification_token()

                cursor.execute("""
                    INSERT INTO email_verification_tokens (
                        user_id,
                        token_hash,
                        expires_at
                    )
                    VALUES (%s, %s, %s);
                """, (user_id, token_hash, expires_at))

    except psycopg.Error:
        current_app.logger.exception("Resend verification database error")
        return jsonify({"error": "Database unavailable"}), 503

    verification_url = (
        f"{Config.EMAIL_VERIFICATION_BASE_URL.rstrip('/')}"
        f"/api/auth/verify-email?"
        f"{urlencode({'token': token})}"
    )

    try:
        send_verification_email(email, verification_url)

    except Exception:
        current_app.logger.exception(
            "Failed to resend verification email"
        )

        # Delete the token created by this failed attempt only.
        try:
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        DELETE FROM email_verification_tokens
                        WHERE token_hash = %s
                          AND user_id = %s
                          AND used_at IS NULL;
                    """, (token_hash, user_id))

        except psycopg.Error:
            current_app.logger.exception(
                "Failed to clean up verification token"
            )

        return jsonify({
            "error": "Verification email could not be sent"
        }), 502
    return jsonify(generic_response), 200