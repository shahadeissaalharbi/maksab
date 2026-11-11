-- Track checkout lifecycle and payment uncertainty before enabling stock release.
ALTER TABLE checkouts
    ADD COLUMN IF NOT EXISTS payment_state VARCHAR(20) NOT NULL DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ;

-- Existing checkouts may already have payments in flight, so never assume safe.
UPDATE checkouts
SET expires_at = created_at + INTERVAL '30 minutes'
WHERE expires_at IS NULL;

ALTER TABLE checkouts
    ALTER COLUMN expires_at SET NOT NULL;

ALTER TABLE checkouts
    DROP CONSTRAINT IF EXISTS checkouts_status_check;

ALTER TABLE checkouts
    ADD CONSTRAINT checkouts_status_check
    CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'expired'));

ALTER TABLE checkouts
    DROP CONSTRAINT IF EXISTS checkouts_payment_state_check;

ALTER TABLE checkouts
    ADD CONSTRAINT checkouts_payment_state_check
    CHECK (payment_state IN (
        'not_started',
        'in_progress',
        'failed',
        'paid',
        'unknown',
        'late_paid'
    ));

CREATE TABLE IF NOT EXISTS checkout_payment_attempts (
    id SERIAL PRIMARY KEY,
    checkout_id INTEGER NOT NULL
        REFERENCES checkouts(id) ON DELETE CASCADE,
    moyasar_payment_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'failed', 'paid', 'unknown')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_checkout_payment_attempts_checkout
    ON checkout_payment_attempts(checkout_id, id);

CREATE TABLE IF NOT EXISTS checkout_payment_reconciliations (
    id SERIAL PRIMARY KEY,
    checkout_id INTEGER REFERENCES checkouts(id) ON DELETE SET NULL,
    moyasar_payment_id VARCHAR(100) NOT NULL UNIQUE,
    amount BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    provider_status VARCHAR(30) NOT NULL,
    reason VARCHAR(50) NOT NULL,
    resolution_status VARCHAR(30) NOT NULL DEFAULT 'pending_review'
        CHECK (resolution_status IN ('pending_review', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_checkout_reconciliations_pending
    ON checkout_payment_reconciliations(created_at)
    WHERE resolution_status = 'pending_review';

CREATE INDEX IF NOT EXISTS idx_checkouts_expiration
    ON checkouts(expires_at, id)
    WHERE status = 'pending';
