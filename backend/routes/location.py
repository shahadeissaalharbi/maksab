import math

import psycopg
from flask import Blueprint, jsonify, request

from config import Config
from decorators import token_required

location_bp = Blueprint("location", __name__)


def is_valid_location(latitude, longitude):
    """Validate geographic coordinates."""

    if isinstance(latitude, bool) or isinstance(longitude, bool):
        return False

    try:
        lat = float(latitude)
        lng = float(longitude)
    except (TypeError, ValueError, OverflowError):
        return False

    return (
        math.isfinite(lat)
        and math.isfinite(lng)
        and -90 <= lat <= 90
        and -180 <= lng <= 180
    )


def location_json(latitude, longitude):
    """Convert database coordinates to JSON."""

    if latitude is None or longitude is None:
        return None

    return {
        "latitude": float(latitude),
        "longitude": float(longitude),
    }


@location_bp.route("/api/users/location", methods=["GET"])
@token_required
def get_user_location():
    """Return the authenticated user's saved location."""

    if not Config.DATABASE_URL:
        return jsonify({"error": "Database unavailable"}), 503

    try:
        with psycopg.connect(Config.DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT latitude, longitude
                    FROM users
                    WHERE id = %s
                    """,
                    (request.user_id,),
                )
                user = cur.fetchone()

        if user is None:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "location": location_json(user[0], user[1])
        }), 200

    except psycopg.Error:
        return jsonify({"error": "Database unavailable"}), 503


@location_bp.route("/api/users/location", methods=["PUT"])
@token_required
def update_user_location():
    """Save or update the authenticated user's location."""

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON body"}), 400

    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not is_valid_location(latitude, longitude):
        return jsonify({"error": "Invalid coordinates"}), 400

    if not Config.DATABASE_URL:
        return jsonify({"error": "Database unavailable"}), 503

    try:
        with psycopg.connect(Config.DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE users
                    SET latitude = %s,
                        longitude = %s
                    WHERE id = %s
                    RETURNING latitude, longitude
                    """,
                    (
                        float(latitude),
                        float(longitude),
                        request.user_id,
                    ),
                )
                updated_user = cur.fetchone()

        if updated_user is None:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "message": "Location saved successfully",
            "location": location_json(
                updated_user[0],
                updated_user[1],
            ),
        }), 200

    except psycopg.Error:
        return jsonify({"error": "Database unavailable"}), 503