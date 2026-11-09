-- Create checkouts table
-- One checkout = one payment that can cover several supplier orders
CREATE TABLE IF NOT EXISTS checkouts (
    id SERIAL PRIMARY KEY,

    merchant_id INTEGER NOT NULL
        REFERENCES users(id),

    total_amount NUMERIC(10, 2) NOT NULL
        CHECK (total_amount >= 0),

    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',
            'paid',
            'failed',
            'cancelled'
        )),

    -- Moyasar payment id (unique so one payment is never applied twice)
    payment_id VARCHAR(100) UNIQUE,

    paid_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Link orders to a checkout (nullable: old orders and /api/orders keep working)
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS checkout_id INTEGER
        REFERENCES checkouts(id);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_checkouts_merchant_id
    ON checkouts(merchant_id);

CREATE INDEX IF NOT EXISTS idx_orders_checkout_id
    ON orders(checkout_id);