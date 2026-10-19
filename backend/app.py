import os

import jwt
import psycopg
from flask import Flask, jsonify, request

from auth import auth_bp
from flask_cors import CORS  # للسماح بالتواصل بين الفرونت إند والباك إند وبدون مشاكل CORS

app = Flask(__name__)
CORS(app)# <--- هذي تفتح الاتصال بسلاسة مع الرياكت
app.register_blueprint(auth_bp)

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
                    SELECT id, name, email, role
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




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

