import psycopg
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import Config
from decorators import token_required
from routes.auth import auth_bp
from products import products_bp
from routes.supplier import supplier_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(supplier_bp)

DATABASE_URL = Config.DATABASE_URL

def get_db_connection():
    return psycopg.connect(DATABASE_URL)

# --- دالة إنشاء الجداول تلقائياً وبشكل آمن ---
def init_db():
    try:
        if not DATABASE_URL:
            print("تحذير: DATABASE_URL غير معرف، تم تخطي إنشاء الجداول.")
            return
        
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        full_name VARCHAR(100) NOT NULL,
                        email VARCHAR(120) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        role VARCHAR(50) DEFAULT 'merchant' NOT NULL,
                        is_verified BOOLEAN DEFAULT FALSE NOT NULL,
                        otp_code VARCHAR(10),
                        otp_expires_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                    CREATE TABLE IF NOT EXISTS products (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(150) NOT NULL,
                        description TEXT,
                        price NUMERIC(10, 2) NOT NULL,
                        stock_quantity INTEGER DEFAULT 0 NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                conn.commit()
        print("✨ تم التحقق من الجداول وإنشاؤها بنجاح في قاعدة البيانات!")
    except Exception as e:
        print(f"ملاحظة أثناء إنشاء الجداول: {e}")

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Maksab API is running"
    }), 200

@app.route("/api/home/products", methods=["GET"])
def get_home_products():
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, description, price, stock_quantity
                    FROM products
                    WHERE stock_quantity > 0
                    ORDER BY id DESC
                    LIMIT 10;
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
        app.logger.exception("Database error while fetching home products")
        return jsonify({"error": "Database unavailable"}), 503

@app.route("/api/trader/home", methods=["GET"])
@token_required
def trader_home():
    if request.user_role != "merchant":
        return jsonify({"error": "Access denied"}), 403

    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
    except (ValueError, TypeError):
        return jsonify({"error": "page and limit must be numbers"}), 400

    if page < 1 or limit < 1 or limit > 100:
        return jsonify({"error": "Invalid page or limit"}), 400

    offset = (page - 1) * limit

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM products
                    WHERE stock_quantity > 0;
                """)
                total = cursor.fetchone()[0]

                cursor.execute("""
                    SELECT id, name, description, price, stock_quantity
                    FROM products
                    WHERE stock_quantity > 0
                    ORDER BY id
                    LIMIT %s OFFSET %s;
                """, (limit, offset))
                rows = cursor.fetchall()

    except psycopg.Error:
        app.logger.exception("Database error while fetching trader home")
        return jsonify({"error": "Database unavailable"}), 503

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
        "page": page,
        "limit": limit,
        "total": total
    }), 200

if __name__ == "__main__":
    with app.app_context():
        init_db()
    app.run(host="0.0.0.0", port=5000)