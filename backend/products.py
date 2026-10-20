from functools import wraps
from flask import Blueprint, request, jsonify
import jwt
from config import Config

products_bp = Blueprint('products', __name__)

def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token required"}), 401

        try:
            payload = jwt.decode(auth_header[7:], Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
            request.user_id = int(payload["sub"])
            request.user_role = payload["role"]
        except (jwt.InvalidTokenError, ValueError, KeyError):
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)
    return wrapper

@products_bp.route('/', methods=['GET'])
@token_required
def get_products():
    return jsonify({"message": "Welcome to products API"})
