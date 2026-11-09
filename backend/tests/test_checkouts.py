import urllib.error
from decimal import Decimal

import jwt
import pytest
from flask import Flask

from config import Config
from routes import webhooks
from routes.checkouts import checkouts_bp
from routes.webhooks import webhooks_bp


SECRET = "test-webhook-secret"


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(Config, "JWT_SECRET", "test-jwt-secret")
    monkeypatch.setattr(Config, "MOYASAR_WEBHOOK_SECRET", SECRET)
    monkeypatch.setattr(Config, "MOYASAR_SECRET_KEY", "sk_test_dummy")

    app = Flask(__name__)
    app.register_blueprint(checkouts_bp)
    app.register_blueprint(webhooks_bp)
    return app.test_client()


def headers(role="merchant"):
    token = jwt.encode(
        {"sub": "1", "role": role},
        Config.JWT_SECRET,
        algorithm=Config.JWT_ALGORITHM,
    )
    return {"Authorization": f"Bearer {token}"}


class FakeCursor:
    def __init__(self, row):
        self.row = row
        self.queries = []

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def execute(self, sql, params=None):
        self.queries.append(sql)

    def fetchone(self):
        return self.row

    def updates(self):
        return [q for q in self.queries if q.strip().startswith("UPDATE")]


class FakeConnection:
    def __init__(self, cursor):
        self._cursor = cursor

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def cursor(self):
        return self._cursor


def use_checkout(monkeypatch, status="pending", amount="100.00"):
    cursor = FakeCursor((Decimal(amount), "SAR", status))
    monkeypatch.setattr(
        webhooks.psycopg, "connect",
        lambda *args, **kwargs: FakeConnection(cursor)
    )
    return cursor


def moyasar_returns(monkeypatch, **overrides):
    payment = {
        "status": "paid",
        "amount": 10000,
        "currency": "SAR",
        "metadata": {"checkout_id": "5"},
    }
    payment.update(overrides)
    monkeypatch.setattr(
        webhooks, "fetch_moyasar_payment", lambda payment_id: payment
    )


def event(**overrides):
    body = {
        "type": "payment_paid",
        "secret_token": SECRET,
        "data": {"id": "pay_1"},
    }
    body.update(overrides)
    return body


# ---------- POST /api/checkouts ----------

def test_checkout_requires_token(client):
    assert client.post("/api/checkouts", json={}).status_code == 401


def test_checkout_supplier_forbidden(client):
    response = client.post("/api/checkouts", json={},
                           headers=headers("supplier"))
    assert response.status_code == 403


def test_checkout_empty_items(client):
    response = client.post("/api/checkouts", json={"items": []},
                           headers=headers())
    assert response.status_code == 400


def test_checkout_invalid_quantity(client):
    response = client.post(
        "/api/checkouts",
        json={"items": [{"product_id": 1, "quantity": 0}]},
        headers=headers(),
    )
    assert response.status_code == 400


def test_get_checkout_supplier_forbidden(client):
    response = client.get("/api/checkouts/1", headers=headers("supplier"))
    assert response.status_code == 403


# ---------- POST /api/webhooks/moyasar ----------

def test_webhook_not_configured(client, monkeypatch):
    monkeypatch.setattr(Config, "MOYASAR_WEBHOOK_SECRET", "")
    response = client.post("/api/webhooks/moyasar", json=event())
    assert response.status_code == 503


def test_webhook_wrong_secret(client):
    response = client.post("/api/webhooks/moyasar",
                           json=event(secret_token="wrong"))
    assert response.status_code == 401


def test_webhook_missing_secret(client):
    body = event()
    del body["secret_token"]
    response = client.post("/api/webhooks/moyasar", json=body)
    assert response.status_code == 401


def test_webhook_failed_payment_is_ignored(client, monkeypatch):
    cursor = use_checkout(monkeypatch)
    response = client.post("/api/webhooks/moyasar",
                           json=event(type="payment_faild"))
    assert response.status_code == 200
    assert cursor.updates() == []


def test_webhook_marks_checkout_paid(client, monkeypatch):
    cursor = use_checkout(monkeypatch)
    moyasar_returns(monkeypatch)
    response = client.post("/api/webhooks/moyasar", json=event())
    assert response.status_code == 200
    assert response.get_json()["message"] == "Payment recorded"
    # one UPDATE for the checkout and one for its orders
    assert len(cursor.updates()) == 2


def test_webhook_duplicate_does_nothing(client, monkeypatch):
    cursor = use_checkout(monkeypatch, status="paid")
    moyasar_returns(monkeypatch)
    response = client.post("/api/webhooks/moyasar", json=event())
    assert response.status_code == 200
    assert response.get_json()["message"] == "Already processed"
    assert cursor.updates() == []


def test_webhook_amount_mismatch(client, monkeypatch):
    cursor = use_checkout(monkeypatch)
    moyasar_returns(monkeypatch, amount=5000)
    response = client.post("/api/webhooks/moyasar", json=event())
    assert response.status_code == 400
    assert cursor.updates() == []


def test_webhook_payment_not_paid(client, monkeypatch):
    use_checkout(monkeypatch)
    moyasar_returns(monkeypatch, status="failed")
    response = client.post("/api/webhooks/moyasar", json=event())
    assert response.status_code == 400


def test_webhook_moyasar_unreachable(client, monkeypatch):
    def fail(payment_id):
        raise urllib.error.URLError("down")

    monkeypatch.setattr(webhooks, "fetch_moyasar_payment", fail)
    response = client.post("/api/webhooks/moyasar", json=event())
    assert response.status_code == 503