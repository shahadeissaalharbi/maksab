import psycopg
from flask import Blueprint, request, jsonify, current_app

from config import Config
from decorators import token_required

profile_bp = Blueprint("profile", __name__)


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