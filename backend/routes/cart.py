import psycopg
from flask import Blueprint, jsonify, request

from config import Config
from decorators import token_required


cart_bp = Blueprint("cart", __name__)


@cart_bp.route("/api/cart", methods=["GET"])
@token_required
def get_cart():
    if request.user_role != "merchant":
        return jsonify({"error": "Only merchants can access the cart"}), 403

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT
                        ci.id,
                        ci.product_id,
                        p.name,
                        p.price,
                        ci.quantity,
                        p.stock_quantity,
                        p.moq,
                        p.supplier_id
                    FROM cart_items AS ci
                    JOIN products AS p
                        ON p.id = ci.product_id
                    WHERE ci.user_id = %s
                    ORDER BY ci.id;
                """, (request.user_id,))

                rows = cursor.fetchall()

                items = []
                total = 0

                for row in rows:
                    subtotal = row[3] * row[4]
                    total += subtotal

                    items.append({
                        "id": row[0],
                        "product_id": row[1],
                        "product_name": row[2],
                        "price": str(row[3]),
                        "quantity": row[4],
                        "stock_quantity": row[5],
                        "moq": row[6],
                        "supplier_id": row[7],
                        "subtotal": str(subtotal)
                    })

                return jsonify({
                    "items": items,
                    "total": str(total),
                    "items_count": len(items)
                }), 200

    except psycopg.Error:
        return jsonify({"error": "Database error"}), 500

@cart_bp.route("/api/cart", methods=["POST"])
@token_required
def add_to_cart():
    if request.user_role != "merchant":
        return jsonify({"error": "Only merchants can use the cart"}), 403

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON body is required"}), 400

    product_id = data.get("product_id")
    quantity = data.get("quantity")

    if (
        type(product_id) is not int
        or product_id < 1
        or type(quantity) is not int
        or quantity < 1
    ):
        return jsonify({
            "error": "product_id and quantity must be positive integers"
        }), 400

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT stock_quantity, COALESCE(moq, 1)
                    FROM products
                    WHERE id = %s
                    FOR UPDATE;
                """, (product_id,))

                product = cursor.fetchone()

                if product is None:
                    return jsonify({"error": "Product not found"}), 404

                stock_quantity, moq = product

                cursor.execute("""
                    SELECT quantity
                    FROM cart_items
                    WHERE user_id = %s AND product_id = %s
                    FOR UPDATE;
                """, (request.user_id, product_id))

                existing = cursor.fetchone()
                current_quantity = existing[0] if existing else 0
                new_quantity = current_quantity + quantity

                if new_quantity < moq:
                    return jsonify({
                        "error": f"Minimum order quantity is {moq}"
                    }), 400

                if new_quantity > stock_quantity:
                    return jsonify({
                        "error": "Requested quantity exceeds available stock"
                    }), 400

                cursor.execute("""
                    INSERT INTO cart_items (user_id, product_id, quantity)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (user_id, product_id)
                    DO UPDATE SET
                        quantity = EXCLUDED.quantity,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id, product_id, quantity;
                """, (request.user_id, product_id, new_quantity))

                row = cursor.fetchone()

                return jsonify({
                    "message": "Product added to cart",
                    "item": {
                        "id": row[0],
                        "product_id": row[1],
                        "quantity": row[2]
                    }
                }), 201 if existing is None else 200

    except psycopg.Error:
        return jsonify({"error": "Database error"}), 500

@cart_bp.route("/api/cart", methods=["PATCH"])
@token_required
def update_cart():
    if request.user_role != "merchant":
        return jsonify({"error": "Only merchants can use the cart"}), 403

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON body is required"}), 400

    product_id = data.get("product_id")
    quantity = data.get("quantity")

    if (
        type(product_id) is not int
        or product_id < 1
        or type(quantity) is not int
        or quantity < 1
    ):
        return jsonify({
            "error": "product_id and quantity must be positive integers"
        }), 400

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:

                cursor.execute("""
                    SELECT
                        ci.id,
                        p.stock_quantity,
                        COALESCE(p.moq, 1)
                    FROM cart_items AS ci
                    JOIN products AS p
                        ON p.id = ci.product_id
                    WHERE ci.user_id = %s
                      AND ci.product_id = %s
                    FOR UPDATE OF ci, p;
                """, (request.user_id, product_id))

                row = cursor.fetchone()

                if row is None:
                    return jsonify({"error": "Product not found in cart"}), 404

                cart_item_id, stock_quantity, moq = row

                if quantity < moq:
                    return jsonify({
                        "error": f"Minimum order quantity is {moq}"
                    }), 400

                if quantity > stock_quantity:
                    return jsonify({
                        "error": "Requested quantity exceeds available stock"
                    }), 400

                cursor.execute("""
                    UPDATE cart_items
                    SET quantity = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, product_id, quantity;
                """, (quantity, cart_item_id))

                updated = cursor.fetchone()

                return jsonify({
                    "message": "Cart updated successfully",
                    "item": {
                        "id": updated[0],
                        "product_id": updated[1],
                        "quantity": updated[2]
                    }
                }), 200

    except psycopg.Error:
        return jsonify({"error": "Database error"}), 500

@cart_bp.route("/api/cart", methods=["DELETE"])
@token_required
def delete_from_cart():
    if request.user_role != "merchant":
        return jsonify({"error": "Only merchants can use the cart"}), 403

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON body is required"}), 400

    product_id = data.get("product_id")

    if type(product_id) is not int or product_id < 1:
        return jsonify({
            "error": "product_id must be a positive integer"
        }), 400

    try:
        with psycopg.connect(Config.DATABASE_URL) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM cart_items
                    WHERE user_id = %s
                      AND product_id = %s
                    RETURNING id, product_id;
                """, (request.user_id, product_id))

                deleted = cursor.fetchone()

                if deleted is None:
                    return jsonify({
                        "error": "Product not found in cart"
                    }), 404

                return jsonify({
                    "message": "Product removed from cart",
                    "deleted_item": {
                        "id": deleted[0],
                        "product_id": deleted[1]
                    }
                }), 200

    except psycopg.Error:
        return jsonify({"error": "Database error"}), 500
