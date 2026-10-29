-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,

    merchant_id INTEGER NOT NULL
        REFERENCES users(id),

    supplier_id INTEGER NOT NULL
        REFERENCES users(id),

    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0
        CHECK (total_amount >= 0),

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',
            'paid',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        )),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,

    order_id INTEGER NOT NULL
        REFERENCES orders(id) ON DELETE CASCADE,

    product_id INTEGER NOT NULL
        REFERENCES products(id),

    quantity INTEGER NOT NULL
        CHECK (quantity > 0),

    unit_price NUMERIC(10, 2) NOT NULL
        CHECK (unit_price >= 0),

    subtotal NUMERIC(10, 2)
        GENERATED ALWAYS AS (quantity * unit_price) STORED,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id
    ON orders(merchant_id);

CREATE INDEX IF NOT EXISTS idx_orders_supplier_id
    ON orders(supplier_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
    ON order_items(order_id);