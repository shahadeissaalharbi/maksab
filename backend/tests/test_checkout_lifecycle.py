import threading
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import jwt
import pytest
from flask import Flask

from config import Config
from expire_checkouts import expire_pending_checkouts
from routes import webhooks
from routes.checkouts import checkouts_bp
from routes.webhooks import webhooks_bp


WEBHOOK_SECRET = "checkout-webhook-test-secret"


@pytest.fixture(autouse=True)
def enable_stock_release_only_in_isolated_tests(monkeypatch):
    monkeypatch.setattr(Config, "CHECKOUT_STOCK_RELEASE_ENABLED", True)


class CheckoutStore:
    def __init__(self):
        self.checkouts = {
            7: {
                "id": 7,
                "merchant_id": 1,
                "status": "pending",
                "payment_state": "not_started",
                "total_amount": Decimal("27.50"),
                "currency": "SAR",
                "payment_id": None,
                "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
                "cancelled_at": None,
                "expired_at": None,
            }
        }
        self.orders = [
            {
                "id": 10,
                "checkout_id": 7,
                "supplier_id": 20,
                "status": "pending",
            },
            {
                "id": 11,
                "checkout_id": 7,
                "supplier_id": 21,
                "status": "pending",
            },
        ]
        self.items = [
            {"order_id": 10, "product_id": 3, "quantity": 2},
            {"order_id": 10, "product_id": 4, "quantity": 5},
            {"order_id": 11, "product_id": 3, "quantity": 1},
        ]
        self.products = {
            3: {"stock_quantity": 8, "stock_status": "in_stock"},
            4: {"stock_quantity": 0, "stock_status": "out_of_stock"},
        }
        self.attempts = {}
        self.reconciliations = {}
        self.next_attempt_id = 1
        self.lock_guard = threading.Lock()
        self.checkout_locks = {}

    def checkout_lock(self, checkout_id):
        with self.lock_guard:
            return self.checkout_locks.setdefault(
                checkout_id, threading.Lock()
            )


class FakeCursor:
    def __init__(self, store, connection):
        self.store = store
        self.connection = connection
        self.result = None

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def execute(self, sql, params=None):
        params = params or ()
        normalized = " ".join(sql.split()).lower()
        self.result = None

        if normalized.startswith("select") and "from checkouts" in normalized:
            if "where status = 'pending'" in normalized:
                now, limit = params
                rows = sorted(
                    (
                        checkout
                        for checkout in self.store.checkouts.values()
                        if checkout["status"] == "pending"
                        and checkout["expires_at"] <= now
                    ),
                    key=lambda checkout: (checkout["expires_at"], checkout["id"]),
                )
                locked = []
                for checkout in rows:
                    lock = self.store.checkout_lock(checkout["id"])
                    if lock.acquire(blocking=False):
                        self.connection.locks.append(lock)
                        locked.append(self._checkout_tuple(checkout, normalized))
                    if len(locked) == limit:
                        break
                self.result = locked
                return

            checkout_id = params[0]
            lock = self.store.checkout_lock(checkout_id)
            if "for update" in normalized and lock not in self.connection.locks:
                lock.acquire()
                self.connection.locks.append(lock)
            checkout = self.store.checkouts.get(checkout_id)
            self.result = (
                self._checkout_tuple(checkout, normalized)
                if checkout else None
            )
            return

        if normalized.startswith("select status from checkout_payment_attempts"):
            checkout_id = params[0]
            self.result = [
                (attempt["status"],)
                for attempt in self.store.attempts.values()
                if attempt["checkout_id"] == checkout_id
            ]
            return

        if normalized.startswith("select id, checkout_id, status from checkout_payment_attempts"):
            payment_id = params[0]
            attempt = next(
                (
                    attempt for attempt in self.store.attempts.values()
                    if attempt["payment_id"] == payment_id
                ),
                None,
            )
            self.result = (
                (attempt["id"], attempt["checkout_id"], attempt["status"])
                if attempt else None
            )
            return

        if normalized.startswith("select id, status from checkout_payment_attempts"):
            attempt_id, checkout_id = params
            attempt = self.store.attempts.get(attempt_id)
            self.result = (
                (attempt["id"], attempt["status"])
                if attempt and attempt["checkout_id"] == checkout_id
                else None
            )
            return

        if normalized.startswith("select id, status from orders"):
            checkout_id = params[0]
            self.result = [
                (order["id"], order["status"])
                for order in sorted(self.store.orders, key=lambda row: row["id"])
                if order["checkout_id"] == checkout_id
            ]
            return

        if normalized.startswith("select oi.product_id, sum(oi.quantity)"):
            checkout_id = params[0]
            quantities = {}
            order_ids = {
                order["id"] for order in self.store.orders
                if order["checkout_id"] == checkout_id
            }
            for item in self.store.items:
                if item["order_id"] in order_ids:
                    product_id = item["product_id"]
                    quantities[product_id] = (
                        quantities.get(product_id, 0) + item["quantity"]
                    )
            self.result = sorted(quantities.items())
            return

        if normalized.startswith("select id from products"):
            product_ids = set(params[0])
            self.result = [
                (product_id,)
                for product_id in sorted(product_ids)
                if product_id in self.store.products
            ]
            return

        if normalized.startswith("insert into checkout_payment_attempts"):
            if "moyasar_payment_id" in normalized:
                checkout_id, payment_id = params
                attempt_id = self.store.next_attempt_id
                self.store.next_attempt_id += 1
                self.store.attempts[attempt_id] = {
                    "id": attempt_id,
                    "checkout_id": checkout_id,
                    "status": "paid",
                    "payment_id": payment_id,
                }
                return

            checkout_id = params[0]
            attempt_id = self.store.next_attempt_id
            self.store.next_attempt_id += 1
            self.store.attempts[attempt_id] = {
                "id": attempt_id,
                "checkout_id": checkout_id,
                "status": "in_progress",
                "payment_id": None,
            }
            self.result = (attempt_id,)
            return

        if normalized.startswith("insert into checkout_payment_reconciliations"):
            checkout_id, payment_id, amount, currency, provider_status, reason = params
            self.store.reconciliations.setdefault(
                payment_id,
                {
                    "checkout_id": checkout_id,
                    "amount": amount,
                    "currency": currency,
                    "provider_status": provider_status,
                    "reason": reason,
                },
            )
            return

        if normalized.startswith("update checkout_payment_attempts"):
            payment_id, attempt_id = params
            attempt = self.store.attempts[attempt_id]
            attempt["payment_id"] = payment_id
            attempt["status"] = (
                "failed" if "status = 'failed'" in normalized
                else "paid" if "status = 'paid'" in normalized
                else "unknown"
            )
            return

        if normalized.startswith("update checkouts"):
            if "status = 'cancelled'" in normalized:
                checkout_id = params[0]
                checkout = self.store.checkouts[checkout_id]
                checkout["status"] = "cancelled"
                checkout["cancelled_at"] = datetime.now(timezone.utc)
            elif "status = 'expired'" in normalized:
                checkout_id = params[0]
                checkout = self.store.checkouts[checkout_id]
                checkout["status"] = "expired"
                checkout["expired_at"] = datetime.now(timezone.utc)
            elif "status = 'paid'" in normalized:
                payment_id, checkout_id = params
                checkout = self.store.checkouts[checkout_id]
                checkout["status"] = "paid"
                checkout["payment_id"] = payment_id
                checkout["payment_state"] = "paid"
            else:
                if "payment_state = 'late_paid'" in normalized:
                    payment_state, checkout_id = "late_paid", params[0]
                elif "payment_state = 'in_progress'" in normalized:
                    payment_state, checkout_id = "in_progress", params[0]
                elif "payment_state = 'unknown'" in normalized:
                    payment_state, checkout_id = "unknown", params[0]
                else:
                    payment_state, checkout_id = params
                self.store.checkouts[checkout_id]["payment_state"] = payment_state
            return

        if normalized.startswith("update orders"):
            checkout_id = params[0]
            new_status = (
                "paid" if "status = 'paid'" in normalized else "cancelled"
            )
            for order in self.store.orders:
                if (
                    order["checkout_id"] == checkout_id
                    and order["status"] == "pending"
                ):
                    order["status"] = new_status
            return

        if normalized.startswith("update products"):
            quantity, _, product_id = params
            product = self.store.products[product_id]
            product["stock_quantity"] += quantity
            product["stock_status"] = (
                "in_stock" if product["stock_quantity"] > 0 else "out_of_stock"
            )

    def _checkout_tuple(self, checkout, normalized):
        if "total_amount, currency, status" in normalized:
            return (
                checkout["id"],
                checkout["total_amount"],
                checkout["currency"],
                checkout["status"],
                checkout["payment_id"],
                checkout["payment_state"],
            )
        if "total_amount" in normalized:
            return (
                checkout["id"],
                checkout["merchant_id"],
                checkout["status"],
                checkout["payment_state"],
                checkout["expires_at"],
                checkout["total_amount"],
            )
        return (
            checkout["id"],
            checkout["merchant_id"],
            checkout["status"],
            checkout["payment_state"],
            checkout["expires_at"],
        )

    def fetchone(self):
        return self.result

    def fetchall(self):
        return self.result or []


class FakeConnection:
    def __init__(self, store):
        self.store = store
        self.locks = []

    def __enter__(self):
        return self

    def __exit__(self, *args):
        for lock in reversed(self.locks):
            lock.release()
        return False

    def cursor(self):
        return FakeCursor(self.store, self)


@pytest.fixture
def store(monkeypatch):
    database = CheckoutStore()

    def connect(*args, **kwargs):
        return FakeConnection(database)

    monkeypatch.setattr("routes.checkouts.psycopg.connect", connect)
    monkeypatch.setattr("expire_checkouts.psycopg.connect", connect)
    monkeypatch.setattr("routes.webhooks.psycopg.connect", connect)
    monkeypatch.setattr(
        Config, "JWT_SECRET", "checkout-test-jwt-secret-long-enough-for-hs256"
    )
    monkeypatch.setattr(
        Config, "MOYASAR_WEBHOOK_SECRET", WEBHOOK_SECRET
    )
    monkeypatch.setattr(Config, "MOYASAR_SECRET_KEY", "sk_test_dummy")
    monkeypatch.setattr(Config, "MOYASAR_PUBLISHABLE_KEY", "pk_test_dummy")
    return database


@pytest.fixture
def client(store, monkeypatch):
    monkeypatch.setattr(webhooks, "notify_checkout_paid", lambda _id: None)
    app = Flask(__name__)
    app.register_blueprint(checkouts_bp)
    app.register_blueprint(webhooks_bp)
    return app.test_client()


def headers(user_id=1, role="merchant"):
    token = jwt.encode(
        {"sub": str(user_id), "role": role},
        Config.JWT_SECRET,
        algorithm=Config.JWT_ALGORITHM,
    )
    return {"Authorization": f"Bearer {token}"}


def paid_event(payment_id="pay_lifecycle_1", attempt_id=None):
    metadata = {"checkout_id": "7"}
    if attempt_id is not None:
        metadata["payment_attempt_id"] = str(attempt_id)
    return {
        "type": "payment_paid",
        "secret_token": WEBHOOK_SECRET,
        "data": {"id": payment_id},
        "metadata": metadata,
    }


def moyasar_paid(
    monkeypatch, payment_id="pay_lifecycle_1", attempt_id=None, **overrides
):
    metadata = {"checkout_id": "7"}
    if attempt_id is not None:
        metadata["payment_attempt_id"] = str(attempt_id)
    payment = {
        "id": payment_id,
        "status": "paid",
        "amount": 2750,
        "currency": "SAR",
        "metadata": metadata,
    }
    payment.update(overrides)
    monkeypatch.setattr(
        webhooks, "fetch_moyasar_payment", lambda _payment_id: payment
    )


def test_cancel_requires_authentication(client):
    assert client.post("/api/checkouts/7/cancel").status_code == 401


def test_supplier_cannot_cancel_checkout(client):
    response = client.post(
        "/api/checkouts/7/cancel", headers=headers(role="supplier")
    )
    assert response.status_code == 403


def test_merchant_cannot_cancel_another_merchants_checkout(client):
    response = client.post(
        "/api/checkouts/7/cancel", headers=headers(user_id=99)
    )
    assert response.status_code == 403


def test_successful_cancel_restores_exact_quantities_and_cancels_orders(
    client, store
):
    before = {
        product_id: product["stock_quantity"]
        for product_id, product in store.products.items()
    }

    response = client.post("/api/checkouts/7/cancel", headers=headers())

    assert response.status_code == 200
    assert response.get_json()["restored_products"] == [3, 4]
    assert store.checkouts[7]["status"] == "cancelled"
    assert store.products[3]["stock_quantity"] == before[3] + 3
    assert store.products[4]["stock_quantity"] == before[4] + 5
    assert {order["supplier_id"] for order in store.orders} == {20, 21}
    assert all(order["status"] == "cancelled" for order in store.orders)
    assert store.products[4]["stock_status"] == "in_stock"


def test_cancellation_rejected_after_payment(client, store):
    store.checkouts[7]["status"] = "paid"
    store.checkouts[7]["payment_state"] = "paid"
    response = client.post("/api/checkouts/7/cancel", headers=headers())
    assert response.status_code == 409
    assert store.products[3]["stock_quantity"] == 8


def test_repeated_cancellation_is_idempotent(client, store):
    first = client.post("/api/checkouts/7/cancel", headers=headers())
    stock_after_first = store.products[3]["stock_quantity"]
    second = client.post("/api/checkouts/7/cancel", headers=headers())

    assert first.status_code == second.status_code == 200
    assert second.get_json()["already_cancelled"] is True
    assert store.products[3]["stock_quantity"] == stock_after_first
    assert client.post(
        "/api/checkouts/7/payment-attempts", headers=headers()
    ).status_code == 409


def test_cancellation_rejected_when_payment_state_is_uncertain(client, store):
    store.checkouts[7]["payment_state"] = "unknown"
    response = client.post("/api/checkouts/7/cancel", headers=headers())
    assert response.status_code == 409
    assert store.checkouts[7]["status"] == "pending"
    assert store.products[3]["stock_quantity"] == 8


def test_concurrent_cancellations_restore_inventory_once(client, store):
    responses = []
    response_lock = threading.Lock()

    def cancel():
        with client.application.test_client() as thread_client:
            response = thread_client.post(
                "/api/checkouts/7/cancel", headers=headers()
            )
            with response_lock:
                responses.append(response)

    threads = [threading.Thread(target=cancel) for _ in range(2)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(timeout=5)

    assert all(not thread.is_alive() for thread in threads)
    assert [response.status_code for response in responses] == [200, 200]
    assert store.products[3]["stock_quantity"] == 11
    assert store.products[4]["stock_quantity"] == 5


def test_payment_attempt_is_recorded_before_initialization(client, store):
    response = client.post(
        "/api/checkouts/7/payment-attempts", headers=headers()
    )

    assert response.status_code == 200
    payload = response.get_json()
    attempt_id = payload["payment_attempt_id"]
    assert payload["payment"]["metadata"]["payment_attempt_id"] == str(attempt_id)
    assert store.checkouts[7]["payment_state"] == "in_progress"
    assert store.attempts[attempt_id]["status"] == "in_progress"
    assert client.post(
        "/api/checkouts/7/cancel", headers=headers()
    ).status_code == 409


def test_paid_webhook_before_cancel_wins_and_notifies_once(
    client, store, monkeypatch
):
    store.checkouts[7]["payment_state"] = "in_progress"
    store.attempts[1] = {
        "id": 1,
        "checkout_id": 7,
        "status": "in_progress",
        "payment_id": None,
    }
    moyasar_paid(monkeypatch, attempt_id=1)
    notifications = []
    monkeypatch.setattr(
        webhooks, "notify_checkout_paid", notifications.append
    )

    response = client.post(
        "/api/webhooks/moyasar",
        json=paid_event(attempt_id=1),
    )
    cancel = client.post("/api/checkouts/7/cancel", headers=headers())

    assert response.status_code == 200
    assert cancel.status_code == 409
    assert store.checkouts[7]["status"] == "paid"
    assert notifications == [7]


def test_verified_failed_payment_can_be_cancelled(client, store, monkeypatch):
    store.checkouts[7]["payment_state"] = "in_progress"
    store.attempts[1] = {
        "id": 1,
        "checkout_id": 7,
        "status": "in_progress",
        "payment_id": None,
    }
    payment = {
        "id": "pay_failed",
        "status": "failed",
        "amount": 2750,
        "currency": "SAR",
        "metadata": {
            "checkout_id": "7",
            "payment_attempt_id": "1",
        },
    }
    monkeypatch.setattr(
        webhooks, "fetch_moyasar_payment", lambda _payment_id: payment
    )
    event = paid_event("pay_failed", attempt_id=1)
    event["type"] = "payment_failed"

    failed = client.post("/api/webhooks/moyasar", json=event)
    cancelled = client.post("/api/checkouts/7/cancel", headers=headers())

    assert failed.status_code == 200
    assert store.checkouts[7]["payment_state"] == "failed"
    assert cancelled.status_code == 200
    assert store.checkouts[7]["status"] == "cancelled"
    assert store.products[3]["stock_quantity"] == 11


def test_paid_webhook_after_cancel_is_recorded_for_reconciliation(
    client, store, monkeypatch
):
    assert client.post(
        "/api/checkouts/7/cancel", headers=headers()
    ).status_code == 200
    moyasar_paid(monkeypatch)

    response = client.post(
        "/api/webhooks/moyasar", json=paid_event()
    )

    assert response.status_code == 202
    assert response.get_json()["reconciliation_required"] is True
    assert store.checkouts[7]["status"] == "cancelled"
    assert store.checkouts[7]["payment_state"] == "late_paid"
    assert store.reconciliations["pay_lifecycle_1"]["reason"] == (
        "payment_after_checkout_closed"
    )


def test_duplicate_late_payment_webhook_creates_one_reconciliation(
    client, store, monkeypatch
):
    client.post("/api/checkouts/7/cancel", headers=headers())
    moyasar_paid(monkeypatch)
    first = client.post("/api/webhooks/moyasar", json=paid_event())
    second = client.post("/api/webhooks/moyasar", json=paid_event())

    assert first.status_code == second.status_code == 202
    assert len(store.reconciliations) == 1


def test_webhook_api_unavailable_retains_reservation(
    client, store, monkeypatch
):
    def unavailable(_payment_id):
        raise webhooks.urllib.error.URLError("unavailable")

    monkeypatch.setattr(webhooks, "fetch_moyasar_payment", unavailable)
    response = client.post(
        "/api/webhooks/moyasar", json=paid_event()
    )

    assert response.status_code == 503
    assert store.checkouts[7]["status"] == "pending"
    assert store.products[3]["stock_quantity"] == 8


def test_processing_payment_stays_uncertain_and_cannot_expire(
    client, store, monkeypatch
):
    store.checkouts[7]["payment_state"] = "in_progress"
    store.attempts[1] = {
        "id": 1,
        "checkout_id": 7,
        "status": "in_progress",
        "payment_id": None,
    }
    payment = {
        "id": "pay_processing",
        "status": "initiated",
        "amount": 2750,
        "currency": "SAR",
        "metadata": {
            "checkout_id": "7",
            "payment_attempt_id": "1",
        },
    }
    monkeypatch.setattr(
        webhooks, "fetch_moyasar_payment", lambda _payment_id: payment
    )
    event = paid_event("pay_processing", attempt_id=1)
    event["type"] = "payment_failed"

    response = client.post("/api/webhooks/moyasar", json=event)
    store.checkouts[7]["expires_at"] = datetime.now(timezone.utc) - timedelta(
        minutes=1
    )
    expired = expire_pending_checkouts()

    assert response.status_code == 200
    assert store.checkouts[7]["payment_state"] == "unknown"
    assert expired["expired"] == 0
    assert expired["deferred_payment_uncertain"] == 1
    assert store.products[3]["stock_quantity"] == 8


def test_expiration_restores_stock_and_is_idempotent(store, monkeypatch):
    store.checkouts[7]["expires_at"] = datetime.now(timezone.utc) - timedelta(
        minutes=1
    )
    monkeypatch.setattr(
        "expire_checkouts.psycopg.connect",
        lambda *args, **kwargs: FakeConnection(store),
    )

    first = expire_pending_checkouts()
    stock_after_first = store.products[3]["stock_quantity"]
    second = expire_pending_checkouts()

    assert first["expired"] == 1
    assert second["expired"] == 0
    assert store.checkouts[7]["status"] == "expired"
    assert store.products[3]["stock_quantity"] == stock_after_first == 11
