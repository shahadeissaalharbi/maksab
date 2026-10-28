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
import psycopg
from decimal import Decimal, InvalidOperation
from flask import current_app


@products_bp.route("/api/products", methods=["POST"])
@token_required
def create_product():
    if request.user_role != "supplier":
        return jsonify({"error": "Only suppliers can add products"}), 403

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON body is required"}), 400

    name = data.get("name")
    description = data.get("description")
    category_id = data.get("category_id")
    unit = data.get("unit")
    image_url = data.get("image_url")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Product name is required"}), 400

    if len(name.strip()) > 150:
        return jsonify({"error": "Product name is too long"}), 400

    try:
        price = Decimal(str(data["price"]))
        stock_quantity = int(data["stock_quantity"])
        moq = int(data.get("moq", 1))
    except (KeyError, TypeError, ValueError, InvalidOperation):
        return jsonify({"error": "Invalid price, stock quantity or MOQ"}), 400

    if not price.is_finite() or price < 0 or price > Decimal("99999999.99"):
        return jsonify({"error": "Invalid price"}), 400

    if price.as_tuple().exponent < -2:
        return jsonify({"error": "Price cannot exceed two decimal places"}), 400

    if stock_quantity < 0 or moq < 1:
        return jsonify({"error": "Invalid stock quantity or MOQ"}), 400

    if isinstance(data.get("stock_quantity"), bool) or isinstance(data.get("moq"), bool):
        return jsonify({"error": "Quantity and MOQ must be integers"}), 400

    if category_id is not None:
        if isinstance(category_id, bool):
            return jsonify({"error": "Invalid category_id"}), 400
        try:
            category_id = int(category_id)
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid category_id"}), 400
        if category_id < 1:
            return jsonify({"error": "Invalid category_id"}), 400

    if unit is not None and (not isinstance(unit, str) or len(unit) > 50):
        return jsonify({"error": "Invalid unit"}), 400

    if image_url is not None and (
        not isinstance(image_url, str) or len(image_url) > 255
    ):
        return jsonify({"error": "Invalid image_url"}), 400

    stock_status = "in_stock" if stock_quantity > 0 else "out_of_stock"

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id
                    FROM users
                    WHERE id = %s AND role = 'supplier' AND is_verified = TRUE
                    """,
                    (request.user_id,)
                )

                if cursor.fetchone() is None:
                    return jsonify({"error": "Verified supplier not found"}), 403

                if category_id is not None:
                    cursor.execute(
                        "SELECT id FROM categories WHERE id = %s",
                        (category_id,)
                    )
                    if cursor.fetchone() is None:
                        return jsonify({"error": "Category not found"}), 400

                cursor.execute(
                    """
                    INSERT INTO products (
                        name, description, price, stock_quantity,
                        supplier_id, category_id, stock_status,
                        unit, moq, image_url
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        name.strip(), description, price, stock_quantity,
                        request.user_id, category_id, stock_status,
                        unit, moq, image_url
                    )
                )

                product_id = cursor.fetchone()[0]

        return jsonify({
            "message": "Product created successfully",
            "product": {
                "id": product_id,
                "name": name.strip(),
                "price": str(price),
                "stock_quantity": stock_quantity,
                "stock_status": stock_status,
                "supplier_id": request.user_id,
                "category_id": category_id,
                "moq": moq,
                "unit": unit,
                "image_url": image_url
            }
        }), 201

    except psycopg.Error:
        current_app.logger.exception("Database error while creating product")
        return jsonify({"error": "Database temporarily unavailable"}), 503


@products_bp.route("/api/products/<int:product_id>", methods=["PUT"])
@token_required
def update_product(product_id):
    if request.user_role != "supplier":
        return jsonify({"error": "Only suppliers can update products"}), 403

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON body is required"}), 400

    allowed_fields = {
        "name", "description", "price", "stock_quantity",
        "category_id", "unit", "moq", "image_url"
    }

    if not data or any(key not in allowed_fields for key in data):
        return jsonify({"error": "Invalid product fields"}), 400

    updates = {}

    if "name" in data:
        name = data["name"]
        if not isinstance(name, str) or not name.strip() or len(name.strip()) > 150:
            return jsonify({"error": "Invalid product name"}), 400
        updates["name"] = name.strip()

    if "description" in data:
        if data["description"] is not None and not isinstance(data["description"], str):
            return jsonify({"error": "Invalid description"}), 400
        updates["description"] = data["description"]

    if "price" in data:
        try:
            price = Decimal(str(data["price"]))
        except (InvalidOperation, TypeError, ValueError):
            return jsonify({"error": "Invalid price"}), 400

        if (
            isinstance(data["price"], bool)
            or not price.is_finite()
            or price < 0
            or price > Decimal("99999999.99")
            or price.as_tuple().exponent < -2
        ):
            return jsonify({"error": "Invalid price"}), 400

        updates["price"] = price

    for field in ("stock_quantity", "moq"):
        if field in data:
            value = data[field]

            if isinstance(value, bool) or not isinstance(value, int):
                return jsonify({"error": f"Invalid {field}"}), 400

            if value < (1 if field == "moq" else 0):
                return jsonify({"error": f"Invalid {field}"}), 400

            updates[field] = value

    if "category_id" in data:
        value = data["category_id"]

        if value is not None:
            if isinstance(value, bool) or not isinstance(value, int) or value < 1:
                return jsonify({"error": "Invalid category_id"}), 400

        updates["category_id"] = value

    for field, max_length in (("unit", 50), ("image_url", 255)):
        if field in data:
            value = data[field]

            if value is not None and (
                not isinstance(value, str) or len(value) > max_length
            ):
                return jsonify({"error": f"Invalid {field}"}), 400

            updates[field] = value

    if "stock_quantity" in updates:
        updates["stock_status"] = (
            "in_stock" if updates["stock_quantity"] > 0 else "out_of_stock"
        )

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    "SELECT supplier_id FROM products WHERE id = %s",
                    (product_id,)
                )
                row = cursor.fetchone()

                if row is None:
                    return jsonify({"error": "Product not found"}), 404

                if row[0] != request.user_id:
                    return jsonify({"error": "Access denied"}), 403

                if updates.get("category_id") is not None:
                    cursor.execute(
                        "SELECT id FROM categories WHERE id = %s",
                        (updates["category_id"],)
                    )
                    if cursor.fetchone() is None:
                        return jsonify({"error": "Category not found"}), 400

                columns = list(updates.keys())
                assignments = ", ".join(
                    f"{column} = %s" for column in columns
                )

                query = f"""
                    UPDATE products
                    SET {assignments}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s AND supplier_id = %s
                    RETURNING id, name, description, price,
                              stock_quantity, stock_status,
                              supplier_id, category_id, unit, moq, image_url
                """

                values = [updates[column] for column in columns]
                values.extend([product_id, request.user_id])

                cursor.execute(query, values)
                product = cursor.fetchone()

        return jsonify({
            "message": "Product updated successfully",
            "product": {
                "id": product[0],
                "name": product[1],
                "description": product[2],
                "price": str(product[3]),
                "stock_quantity": product[4],
                "stock_status": product[5],
                "supplier_id": product[6],
                "category_id": product[7],
                "unit": product[8],
                "moq": product[9],
                "image_url": product[10]
            }
        }), 200

    except psycopg.Error:
        current_app.logger.exception("Database error while updating product")
        return jsonify({"error": "Database temporarily unavailable"}), 503

@products_bp.route("/api/products/<int:product_id>", methods=["DELETE"])
@token_required
def delete_product(product_id):
    if request.user_role != "supplier":
        return jsonify({"error": "Only suppliers can delete products"}), 403

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM products
                    WHERE id = %s AND supplier_id = %s
                    RETURNING id
                    """,
                    (product_id, request.user_id)
                )

                deleted_product = cursor.fetchone()

                if deleted_product is None:
                    cursor.execute(
                        "SELECT id FROM products WHERE id = %s",
                        (product_id,)
                    )

                    if cursor.fetchone() is None:
                        return jsonify({"error": "Product not found"}), 404

                    return jsonify({"error": "Access denied"}), 403

        return jsonify({
            "message": "Product deleted successfully",
            "product_id": deleted_product[0]
        }), 200

    except psycopg.Error:
        current_app.logger.exception("Database error while deleting product")
        return jsonify({"error": "Database temporarily unavailable"}), 503
        
@products_bp.route("/api/products", methods=["GET"])
def list_products():
    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, description, price, stock_quantity
                    FROM products
                    WHERE stock_quantity > 0
                    ORDER BY id DESC;
                """)
                rows = cursor.fetchall()

        products = [
            {
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "price": str(row[3]),
                "stock_quantity": row[4]
            }
            for row in rows
        ]

        return jsonify({
            "products": products,
            "count": len(products)
        }), 200

    except psycopg.Error:
        current_app.logger.exception("Database error while fetching products")
        return jsonify({"error": "Database temporarily unavailable"}), 503
@products_bp.route("/api/categories", methods=["GET"])
def get_categories():
    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, type
                    FROM categories
                    ORDER BY id;
                """)
                rows = cursor.fetchall()

        categories = [
            {
                "id": row[0],
                "name": row[1],
                "type": row[2]
            }
            for row in rows
        ]

        return jsonify({
            "categories": categories,
            "count": len(categories)
        }), 200

    except psycopg.Error:
        current_app.logger.exception("Database error while fetching categories")
        return jsonify({"error": "Database temporarily unavailable"}), 503