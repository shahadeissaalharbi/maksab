import psycopg
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash, generate_password_hash

from config import Config
from decorators import token_required

profile_bp = Blueprint("profile", __name__)

MIN_PASSWORD_LENGTH = 8


@profile_bp.route("/api/users/profile", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return jsonify({
            "error": "Valid JSON body is required"
        }), 400

    allowed_fields = {
    "name": 100,
    "phone": 20,
    "business_name": 150,
    "commercial_register": 50,
    "address_text": None
}

    if any(field not in allowed_fields for field in data):
        return jsonify({
            "error": "Invalid profile fields"
        }), 400

    updates = {}

    for field, value in data.items():
        if value is not None and not isinstance(value, str):
            return jsonify({
                "error": f"Invalid {field}"
            }), 400

        if isinstance(value, str):
            value = value.strip()

        if field == "name" and not value:
            return jsonify({
                "error": "Name is required"
            }), 400

        max_length = allowed_fields[field]

        if value is not None and max_length is not None:
            if len(value) > max_length:
                return jsonify({
                    "error": f"{field} is too long"
                }), 400

        updates[field] = value

    columns = list(updates.keys())

    assignments = ", ".join(
        f"{column} = %s" for column in columns
    )

    values = [updates[column] for column in columns]
    values.append(request.user_id)

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    UPDATE users
                    SET {assignments}
                    WHERE id = %s
                    RETURNING
                        id,
                        name,
                        email,
                        phone,
                        role,
                        business_name,
                        commercial_register,
                        address_text
                    """,
                    values
                )

                user = cursor.fetchone()

                if user is None:
                    return jsonify({
                        "error": "User not found"
                    }), 404

        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "phone": user[3],
                "role": user[4],
                "business_name": user[5],
                "commercial_register": user[6],
                "address_text": user[7]
            }
        }), 200

    except psycopg.Error:
        current_app.logger.exception(
            "Database error while updating profile"
        )

        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503


@profile_bp.route("/api/users/password", methods=["PUT"])
@token_required
def change_password():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Valid JSON body is required"
        }), 400

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if (
        not isinstance(current_password, str)
        or not isinstance(new_password, str)
        or not current_password
    ):
        return jsonify({
            "error": "Current and new password are required"
        }), 400

    if len(new_password) < MIN_PASSWORD_LENGTH:
        return jsonify({
            "error": (
                f"New password must be at least "
                f"{MIN_PASSWORD_LENGTH} characters"
            ),
            "code": "weak_password"
        }), 400

    if new_password == current_password:
        return jsonify({
            "error": "New password must be different",
            "code": "same_password"
        }), 400

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT password_hash
                    FROM users
                    WHERE id = %s;
                """, (request.user_id,))

                user = cursor.fetchone()

                if user is None:
                    return jsonify({"error": "User not found"}), 404

                # 400 (not 401) so the app does not treat it as an
                # expired session and log the user out
                if not check_password_hash(user[0], current_password):
                    return jsonify({
                        "error": "Current password is incorrect",
                        "code": "wrong_password"
                    }), 400

                cursor.execute("""
                    UPDATE users
                    SET password_hash = %s
                    WHERE id = %s;
                """, (
                    generate_password_hash(new_password),
                    request.user_id
                ))

        return jsonify({
            "message": "Password changed successfully"
        }), 200

    except psycopg.Error:
        current_app.logger.exception(
            "Database error while changing password"
        )

        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503


@profile_bp.route("/api/users/profile", methods=["DELETE"])
@token_required
def delete_account():
    data = request.get_json(silent=True)
    password = data.get("password") if isinstance(data, dict) else None

    if not isinstance(password, str) or not password:
        return jsonify({
            "error": "Password is required to delete the account"
        }), 400

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT password_hash
                    FROM users
                    WHERE id = %s;
                """, (request.user_id,))

                user = cursor.fetchone()

                if user is None:
                    return jsonify({"error": "User not found"}), 404

                if not check_password_hash(user[0], password):
                    return jsonify({
                        "error": "Password is incorrect",
                        "code": "wrong_password"
                    }), 400

                # Accounts with orders, checkouts or products are kept
                cursor.execute("""
                    SELECT
                        EXISTS (
                            SELECT 1 FROM orders
                            WHERE merchant_id = %s OR supplier_id = %s
                        ),
                        EXISTS (
                            SELECT 1 FROM products
                            WHERE supplier_id = %s
                        ),
                        EXISTS (
                            SELECT 1 FROM checkouts
                            WHERE merchant_id = %s
                        );
                """, (
                    request.user_id,
                    request.user_id,
                    request.user_id,
                    request.user_id
                ))

                if any(cursor.fetchone()):
                    return jsonify({
                        "error": (
                            "This account has orders or products "
                            "and cannot be deleted"
                        ),
                        "code": "account_has_data"
                    }), 409

                cursor.execute("""
                    DELETE FROM users
                    WHERE id = %s;
                """, (request.user_id,))

        return jsonify({
            "message": "Account deleted successfully"
        }), 200

    except psycopg.errors.ForeignKeyViolation:
        current_app.logger.exception(
            "Account %s is still referenced", request.user_id
        )

        return jsonify({
            "error": (
                "This account has related data "
                "and cannot be deleted"
            ),
            "code": "account_has_data"
        }), 409

    except psycopg.Error:
        current_app.logger.exception(
            "Database error while deleting account"
        )

        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503