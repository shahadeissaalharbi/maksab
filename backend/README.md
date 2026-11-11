# Backend checkout lifecycle

## Checkout API

Create a checkout with the authenticated merchant token:

```http
POST /api/checkouts
Authorization: Bearer <JWT>
Content-Type: application/json

{"items":[{"product_id":12,"quantity":3}]}
```

The response contains the checkout ID, `pending` state, and
`payment_initialization_endpoint`. Payment parameters are not returned until a
payment attempt has been recorded.

Before handing a checkout to the Moyasar client SDK, the authenticated owning
merchant must call:

```http
POST /api/checkouts/42/payment-attempts
Authorization: Bearer <JWT>
```

The response contains `payment.amount` in halalas, `payment.currency`,
`payment.publishable_key`, and metadata containing both `checkout_id` and
`payment_attempt_id`. Include this metadata in the Moyasar payment request.
The attempt is recorded before the parameters are returned, so cancellation
and expiration will retain the stock reservation while payment is in progress
or uncertain.

Cancel a checkout using:

```http
POST /api/checkouts/42/cancel
Authorization: Bearer <JWT>
```

A successful cancellation returns:

```json
{
  "message": "Checkout cancelled and stock restored",
  "status": "cancelled",
  "already_cancelled": false,
  "restored_products": [12]
}
```

Only the owning merchant can cancel. Repeating an already completed
cancellation returns `200` with `already_cancelled: true`. A paid checkout,
an expired checkout, an order that is no longer pending, or an unverified or
active payment attempt returns `409` and does not restore stock.

`GET /api/checkouts/<id>` reports `payment_state`, `expires_at`,
`cancelled_at`, and `expired_at`.

## State and inventory rules

Checkout states are `pending`, `paid`, `cancelled`, and `expired` (the
pre-existing `failed` value remains accepted). Payment states are
`not_started`, `in_progress`, `failed`, `paid`, `unknown`, and `late_paid`.

- A new checkout starts as `pending` / `not_started`.
- Payment initialization changes it to `in_progress` before client handoff.
- Only a Moyasar-verified terminal failure changes a tracked attempt to
  `failed`. A retry can then be explicitly initialized.
- Cancellation or expiration restores exact order-item quantities only when
  there are no attempts (`not_started`) or every recorded attempt has a
  verified `failed` status.
- Checkout closure, order cancellation, and inventory restoration run in one
  PostgreSQL transaction. Checkout and order row locks serialize cancellation,
  expiration, payment initialization, and webhook processing.
- `paid`, `in_progress`, `unknown`, and `late_paid` never release inventory.
  An uncertain checkout remains pending with its stock reserved.
- The order schema already permits `cancelled`; only pending orders are
  cancelled during checkout closure.

### Late payment reconciliation

A Moyasar-verified payment arriving after a checkout was cancelled or expired
does not change the checkout back to `paid`, does not change cancelled orders,
and does not send the normal paid-order notifications. Instead, it is
persisted once in `checkout_payment_reconciliations` as `pending_review` and
the webhook returns `202` with `reconciliation_required: true`.

Run this command to list payments that need manual financial resolution:

```powershell
Set-Location backend
python expire_checkouts.py --reconciliations
```

Review each payment in Moyasar and resolve it through the normal finance
process (for example, refund it in the Moyasar dashboard or manually arrange
fulfillment). This application intentionally does not issue refunds.
Update a reconciliation row to `resolved` only after that external action has
been confirmed and recorded by the responsible operator.

## Expiration worker

Set `CHECKOUT_EXPIRATION_MINUTES` to a positive integer; the default is `30`.
New checkouts expire after that many minutes. Existing checkouts are assigned
a 30-minute expiration timestamp by migration `008`; their payment state is
set to `unknown` because older versions did not track payment handoff.

Schedule the worker from the `backend` directory. It processes a bounded
batch, uses PostgreSQL `FOR UPDATE SKIP LOCKED` to avoid overlapping workers,
and is safe to run repeatedly:

```powershell
python expire_checkouts.py
```

For production, schedule it every few minutes (for example, with cron or
Windows Task Scheduler). Review the JSON summary and alert on
`deferred_payment_uncertain` and `deferred_order_state`. A deferred checkout
retains its reservation; do not manually mark it safe without confirming its
payment state with Moyasar.

## Migration and deployment

Apply migrations in numeric order. For an existing installation, apply
`migrations/008_checkout_lifecycle.sql` once with the normal database
migration process before deploying this backend version. The migration
preserves checkout and order rows, adds lifecycle timestamps and payment
tracking tables, and marks existing checkouts `unknown` so they cannot be
expired or cancelled based on a NULL payment ID.

Set `CHECKOUT_EXPIRATION_MINUTES` in the backend environment and deploy the
backend. No migration is run automatically by the application or worker.
Do not run the worker until migration 008 has been applied.

## Payment integration limits

The current frontend cart uses the legacy `/api/orders` endpoint and does not
call `/api/checkouts` or Moyasar. The `/api/checkouts` creation response no
longer exposes payment initialization data; clients using this endpoint must
call the authenticated payment-attempt endpoint first.

The payment-attempt endpoint records the attempt before returning data for the
client-side Moyasar SDK; it does not create the payment with Moyasar
server-to-server. Integrations must use the returned metadata and must not
initialize a payment directly from checkout-creation data. A direct-to-Moyasar
client that bypasses this API cannot be reliably detected before its webhook
arrives. Such a payment is reconciled if it arrives after closure, but inventory
may already have been released. Consequently, this implementation is safe for
the tracked backend-controlled client flow; it cannot guarantee safe stock
release for untracked direct payment clients. Full protection against such
clients requires server-side payment creation or an equivalent provider-side
mechanism that prevents untracked payment attempts.

Existing pending checkouts are deliberately `unknown` after migration. Check
their Moyasar state before deciding on a manual resolution; the worker will
not release their stock automatically.
