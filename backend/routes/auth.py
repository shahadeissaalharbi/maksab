from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import jwt
import psycopg
from flask import Blueprint, jsonify, request, current_app
from werkzeug.security import generate_password_hash, check_password_hash

from config import Config
from decorators import token_required
# from email_service import send_verification_email
from email_service import send_otp_email
from verification_tokens import (
    generate_otp,
    verify_otp_hash,
)


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def get_db_connection():
    return psycopg.connect(Config.DATABASE_URL)

def save_otp(cursor, user_id, code_hash, expires_at):
    """Save a new OTP and invalidate previous unused codes."""

    cursor.execute("""
        UPDATE email_verification_tokens
        SET used_at = NOW()
        WHERE user_id = %s
          AND used_at IS NULL;
    """, (user_id,))

    cursor.execute("""
        INSERT INTO email_verification_tokens (
            user_id,
            token_hash,
            expires_at,
            attempts
        )
        VALUES (%s, %s, %s, 0);
    """, (user_id, code_hash, expires_at))

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

                code, code_hash, expires_at = generate_otp(user_id)

                save_otp(
                    cursor,
                    user_id,
                    code_hash,
                    expires_at
                )

        send_otp_email(email, code)

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

    except Exception:
        current_app.logger.exception(
            "OTP email delivery failed"
        )
        return jsonify({
            "error": "Unable to send verification email. Please try again."
        }), 503

    return jsonify({
        "message": "Account created. Check your email for the verification code.",
        "user_id": user_id,
        "verification_required": True
    }), 201


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data"}), 400

    email = data.get("email")
    code = data.get("code")

    if (
        not isinstance(email, str)
        or not isinstance(code, str)
        or len(code) != 6
        or not code.isascii()
        or not code.isdigit()
    ):
        return jsonify({"error": "Invalid verification code"}), 400

    email = email.strip().lower()

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email"}), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, is_verified
                    FROM users
                    WHERE email = %s
                    FOR UPDATE;
                """, (email,))

                user = cursor.fetchone()

                if not user:
                    return jsonify({"error": "Invalid verification code"}), 400

                user_id, is_verified = user

                if is_verified:
                    return jsonify({
                        "error": "Invalid verification code"
                    }), 400

                cursor.execute("""
                    SELECT id, token_hash, expires_at, attempts
                    FROM email_verification_tokens
                    WHERE user_id = %s
                      AND used_at IS NULL
                    ORDER BY created_at DESC, id DESC
                    LIMIT 1
                    FOR UPDATE;
                """, (user_id,))

                token = cursor.fetchone()

                if not token:
                    return jsonify({"error": "Invalid verification code"}), 400

                token_id, stored_hash, expires_at, attempts = token

                if attempts >= 5:
                    return jsonify({"error": "Too many attempts"}), 429

                if expires_at <= datetime.now(timezone.utc):
                    return jsonify({"error": "Verification code expired"}), 410

                if not verify_otp_hash(user_id, code, stored_hash):
                    cursor.execute("""
                        UPDATE email_verification_tokens
                        SET attempts = attempts + 1
                        WHERE id = %s;
                    """, (token_id,))

                    connection.commit()

                    return jsonify({"error": "Invalid verification code"}), 400

                cursor.execute("""
                    UPDATE email_verification_tokens
                    SET used_at = NOW()
                    WHERE id = %s;
                """, (token_id,))

                cursor.execute("""
                    UPDATE users
                    SET is_verified = TRUE,
                        email_verified_at = NOW()
                    WHERE id = %s;
                """, (user_id,))

    except psycopg.Error:
        current_app.logger.exception("OTP verification database error")
        return jsonify({"error": "Database unavailable"}), 503

    return jsonify({
        "message": "Email verified successfully"
    }), 200


@auth_bp.route("/verify-email", methods=["GET"])
def verify_email():
    return jsonify({
        "error": "This verification method is no longer supported.",
        "verification_method": "otp"
    }), 410

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

    if not user[5]:
        return jsonify({
            "error": "Email verification required",
            "verification_required": True
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
@auth_bp.route("/resend-otp", methods=["POST"])
def resend_verification():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data"}), 400

    email = data.get("email")

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email"}), 400

    email = email.strip().lower()

    generic_response = {
        "message": "If verification is required, a code will be sent."
    }

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, is_verified
                    FROM users
                    WHERE email = %s
                    FOR UPDATE;
                """, (email,))

                user = cursor.fetchone()

                if not user or user[1]:
                    return jsonify(generic_response), 200

                user_id = user[0]

                cursor.execute("""
                    SELECT created_at
                    FROM email_verification_tokens
                    WHERE user_id = %s
                    ORDER BY created_at DESC, id DESC
                    LIMIT 1;
                """, (user_id,))

                latest = cursor.fetchone()

                if latest:
                    elapsed = (
                        datetime.now(timezone.utc) - latest[0]
                    ).total_seconds()

                    if elapsed < 60:
                        return jsonify(generic_response), 200

                code, code_hash, expires_at = generate_otp(user_id)

                save_otp(cursor, user_id, code_hash, expires_at)

        send_otp_email(email, code)

    except psycopg.Error:
        current_app.logger.exception("OTP resend database error")
        return jsonify({"error": "Database unavailable"}), 503

    except Exception:
        current_app.logger.exception("OTP resend email error")
        return jsonify({
            "error": "Unable to send verification code"
        }), 503

    return jsonify(generic_response), 200