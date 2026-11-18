from decimal import Decimal

import jwt
import psycopg
import pytest
from flask import Flask

from config import Config
from routes import cart
from routes.cart import cart_bp


class FakeCursor:
    """Returns the prepared rows one by one instead of querying a database."""

    def __init__(self, fetchone=None, fetchall=None):
        self._fetchone = list(fetchone or [])
        self._fetchall = list(fetchall or [])
        self.queries = []

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def execute(self, sql, params=None):
        self.queries.append((sql, params))

    def fetchone(self):
        return self._fetchone.pop(0)

    def fetchall(self):
        return self._fetchall.pop(0)


class FakeConnection:
    def __init__(self, cursor):
        self._cursor = cursor

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def cursor(self):
        return self._cursor


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(Config, "JWT_SECRET", "test-jwt-secret-for-cart-tests-0123456789")
    app = Flask(__name__)
    app.register_blueprint(cart_bp)
    return app.test_client()


def auth(role="merchant"):
    token = jwt.encode(
        {"sub": "1", "role": role},
        Config.JWT_SECRET,
        algorithm=Config.JWT_ALGORITHM,
    )
    return {"Authorization": f"Bearer {token}"}


def use_cursor(monkeypatch, cursor):
    monkeypatch.setattr(
        cart.psycopg, "connect", lambda *a, **k: FakeConnection(cursor)
    )


def database_down(monkeypatch):
    def boom(*a, **k):
        raise psycopg.OperationalError("database is down")

    monkeypatch.setattr(cart.psycopg, "connect", boom)


INVALID_ITEMS = [
    {},
    {"product_id": 1},
    {"quantity": 1},
    {"product_id": 0, "quantity": 1},
    {"product_id": 1, "quantity": 0},
    {"product_id": "1", "quantity": 1},
    {"product_id": 1, "quantity": 1.5},
    {"product_id": True, "quantity": 1},
]


# ---------- GET /api/cart ----------

def test_get_cart_requires_token(client):
    assert client.get("/api/cart").status_code == 401


def test_get_cart_is_merchant_only(client):
    response = client.get("/api/cart", headers=auth("supplier"))
    assert response.status_code == 403


def test_get_cart_returns_items_and_total(client, monkeypatch):
    rows = [
        (1, 10, "Rice", Decimal("5.00"), 3, 50, 2, 7),
        (2, 11, "Oil", Decimal("20.00"), 1, 9, 1, 7),
    ]
    use_cursor(monkeypatch, FakeCursor(fetchall=[rows]))

    response = client.get("/api/cart", headers=auth())

    assert response.status_code == 200
    body = response.get_json()
    assert body["items_count"] == 2
    assert body["total"] == "35.00"
    assert body["items"][0]["product_name"] == "Rice"
    assert body["items"][0]["subtotal"] == "15.00"


def test_get_cart_empty(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchall=[[]]))

    response = client.get("/api/cart", headers=auth())

    assert response.status_code == 200
    assert response.get_json()["items"] == []
    assert response.get_json()["items_count"] == 0


def test_get_cart_database_error(client, monkeypatch):
    database_down(monkeypatch)
    assert client.get("/api/cart", headers=auth()).status_code == 500


# ---------- POST /api/cart ----------

def test_add_to_cart_is_merchant_only(client):
    response = client.post(
        "/api/cart", json={"product_id": 1, "quantity": 1}, headers=auth("supplier")
    )
    assert response.status_code == 403


def test_add_to_cart_requires_json_body(client):
    response = client.post("/api/cart", data="not json", headers=auth())
    assert response.status_code == 400


@pytest.mark.parametrize("payload", INVALID_ITEMS)
def test_add_to_cart_rejects_invalid_values(client, payload):
    response = client.post("/api/cart", json=payload, headers=auth())
    assert response.status_code == 400


def test_add_to_cart_product_not_found(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[None]))

    response = client.post(
        "/api/cart", json={"product_id": 99, "quantity": 1}, headers=auth()
    )

    assert response.status_code == 404


def test_add_to_cart_below_minimum_order(client, monkeypatch):
    # product has stock 100 and a minimum order of 5, nothing in the cart yet
    use_cursor(monkeypatch, FakeCursor(fetchone=[(100, 5), None]))

    response = client.post(
        "/api/cart", json={"product_id": 1, "quantity": 2}, headers=auth()
    )

    assert response.status_code == 400
    assert "5" in response.get_json()["error"]


def test_add_to_cart_exceeds_stock(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(10, 1), None]))

    response = client.post(
        "/api/cart", json={"product_id": 1, "quantity": 11}, headers=auth()
    )

    assert response.status_code == 400


def test_add_to_cart_creates_new_item(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(100, 1), None, (1, 10, 3)]))

    response = client.post(
        "/api/cart", json={"product_id": 10, "quantity": 3}, headers=auth()
    )

    assert response.status_code == 201
    assert response.get_json()["item"] == {"id": 1, "product_id": 10, "quantity": 3}


def test_add_to_cart_adds_to_existing_item(client, monkeypatch):
    # 2 already in the cart + 3 new = 5
    use_cursor(monkeypatch, FakeCursor(fetchone=[(100, 1), (2,), (1, 10, 5)]))

    response = client.post(
        "/api/cart", json={"product_id": 10, "quantity": 3}, headers=auth()
    )

    assert response.status_code == 200
    assert response.get_json()["item"]["quantity"] == 5


def test_add_to_cart_database_error(client, monkeypatch):
    database_down(monkeypatch)

    response = client.post(
        "/api/cart", json={"product_id": 1, "quantity": 1}, headers=auth()
    )

    assert response.status_code == 500


# ---------- PATCH /api/cart ----------

def test_update_cart_is_merchant_only(client):
    response = client.patch(
        "/api/cart", json={"product_id": 1, "quantity": 1}, headers=auth("supplier")
    )
    assert response.status_code == 403


def test_update_cart_requires_json_body(client):
    response = client.patch("/api/cart", data="not json", headers=auth())
    assert response.status_code == 400


@pytest.mark.parametrize("payload", INVALID_ITEMS)
def test_update_cart_rejects_invalid_values(client, payload):
    response = client.patch("/api/cart", json=payload, headers=auth())
    assert response.status_code == 400


def test_update_cart_item_not_in_cart(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[None]))

    response = client.patch(
        "/api/cart", json={"product_id": 1, "quantity": 2}, headers=auth()
    )

    assert response.status_code == 404


def test_update_cart_below_minimum_order(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(1, 100, 5)]))

    response = client.patch(
        "/api/cart", json={"product_id": 1, "quantity": 2}, headers=auth()
    )

    assert response.status_code == 400


def test_update_cart_exceeds_stock(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(1, 10, 1)]))

    response = client.patch(
        "/api/cart", json={"product_id": 1, "quantity": 11}, headers=auth()
    )

    assert response.status_code == 400


def test_update_cart_success(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(1, 100, 1), (1, 10, 4)]))

    response = client.patch(
        "/api/cart", json={"product_id": 10, "quantity": 4}, headers=auth()
    )

    assert response.status_code == 200
    assert response.get_json()["item"]["quantity"] == 4


def test_update_cart_database_error(client, monkeypatch):
    database_down(monkeypatch)

    response = client.patch(
        "/api/cart", json={"product_id": 1, "quantity": 1}, headers=auth()
    )

    assert response.status_code == 500


# ---------- DELETE /api/cart ----------

def test_delete_from_cart_is_merchant_only(client):
    response = client.delete(
        "/api/cart", json={"product_id": 1}, headers=auth("supplier")
    )
    assert response.status_code == 403


def test_delete_from_cart_requires_json_body(client):
    response = client.delete("/api/cart", data="not json", headers=auth())
    assert response.status_code == 400


@pytest.mark.parametrize("payload", [{}, {"product_id": 0}, {"product_id": "1"}, {"product_id": True}])
def test_delete_from_cart_rejects_invalid_product_id(client, payload):
    response = client.delete("/api/cart", json=payload, headers=auth())
    assert response.status_code == 400


def test_delete_from_cart_item_not_in_cart(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[None]))

    response = client.delete("/api/cart", json={"product_id": 1}, headers=auth())

    assert response.status_code == 404


def test_delete_from_cart_success(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(1, 10)]))

    response = client.delete("/api/cart", json={"product_id": 10}, headers=auth())

    assert response.status_code == 200
    assert response.get_json()["deleted_item"] == {"id": 1, "product_id": 10}


def test_delete_from_cart_database_error(client, monkeypatch):
    database_down(monkeypatch)

    response = client.delete("/api/cart", json={"product_id": 1}, headers=auth())

    assert response.status_code == 500