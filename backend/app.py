import psycopg
from decorators import token_required
from config import Config
from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.auth import auth_bp
from products import products_bp
from routes.supplier import supplier_bp
from routes.profile import profile_bp
from routes.orders import orders_bp
from routes.cart import cart_bp
from routes.calculator import calculator_bp
app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(supplier_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(calculator_bp)
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
                        name VARCHAR(100) NOT NULL,
                        email VARCHAR(120) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        role VARCHAR(50) DEFAULT 'merchant' NOT NULL,
                        is_verified BOOLEAN DEFAULT FALSE NOT NULL,
                        email_verified_at TIMESTAMPTZ,
                        otp_code VARCHAR(10),
                        otp_expires_at TIMESTAMP,
                        phone VARCHAR(20),
                        business_name VARCHAR(150),
                        commercial_register VARCHAR(50),
                        address_text TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                    CREATE TABLE IF NOT EXISTS products (
                        id SERIAL PRIMARY KEY,
                        supplier_id INTEGER REFERENCES users(id),
                        name VARCHAR(150) NOT NULL,
                        description TEXT,
                        price NUMERIC(10, 2) NOT NULL,
                        stock_quantity INTEGER DEFAULT 0 NOT NULL,
                        category_id INTEGER,
                        unit VARCHAR(50),
                        moq INTEGER DEFAULT 1,
                        stock_status VARCHAR(50) DEFAULT 'in_stock',
                        image_url VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                    CREATE TABLE IF NOT EXISTS categories (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        type VARCHAR(50) NOT NULL DEFAULT 'raw_material'
                    );
                    CREATE TABLE IF NOT EXISTS email_verification_tokens (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        token_hash VARCHAR(64) NOT NULL UNIQUE,
                        expires_at TIMESTAMPTZ NOT NULL,
                        used_at TIMESTAMPTZ,
                        attempts INTEGER NOT NULL DEFAULT 0,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                    CREATE TABLE IF NOT EXISTS orders (
                        id SERIAL PRIMARY KEY,
                        merchant_id INTEGER NOT NULL REFERENCES users(id),
                        supplier_id INTEGER NOT NULL REFERENCES users(id),
                        total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
                        status VARCHAR(30) NOT NULL DEFAULT 'pending',
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                    CREATE TABLE IF NOT EXISTS cart_items (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                        quantity INTEGER NOT NULL CHECK (quantity > 0),
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT unique_user_cart_product UNIQUE (user_id, product_id)
                    );
                    CREATE INDEX IF NOT EXISTS idx_cart_items_user_id
                    ON cart_items(user_id);
                    CREATE TABLE IF NOT EXISTS order_items (
                        id SERIAL PRIMARY KEY,
                        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                        product_id INTEGER NOT NULL REFERENCES products(id),
                        quantity INTEGER NOT NULL CHECK (quantity > 0),
                        unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
                        subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                conn.commit()
        print("✨ تم التحقق من الجداول وإنشاؤها بنجاح في قاعدة البيانات!")
    except Exception as e:
        print(f"ملاحظة أثناء إنشاء الجداول: {e}")

# تشغيل إنشاء الجداول فور تحميل التطبيق لضمان عملها على Railway ومحلياً
with app.app_context():
    init_db()

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
    app.run(host="0.0.0.0", port=5000)