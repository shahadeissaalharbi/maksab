from decimal import Decimal
from unittest.mock import patch

import jwt
import psycopg
import pytest
from flask import Flask

from config import Config
from routes import orders
from routes.orders import orders_bp


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
    monkeypatch.setattr(Config, "JWT_SECRET", "test-jwt-secret-for-order-tests-0123456789")
    app = Flask(__name__)
    app.register_blueprint(orders_bp)
    return app.test_client()


def auth(role="merchant", user_id=1):
    token = jwt.encode(
        {"sub": str(user_id), "role": role},
        Config.JWT_SECRET,
        algorithm=Config.JWT_ALGORITHM,
    )
    return {"Authorization": f"Bearer {token}"}


def use_cursor(monkeypatch, cursor):
    monkeypatch.setattr(
        orders.psycopg, "connect", lambda *a, **k: FakeConnection(cursor)
    )


def database_down(monkeypatch):
    def boom(*a, **k):
        raise psycopg.OperationalError("down")

    monkeypatch.setattr(orders.psycopg, "connect", boom)


# product row: (id, supplier_id, price, stock, moq, name)
def product(pid, supplier=10, price="5.00", stock=100, moq=1, name="Dates"):
    return (pid, supplier, Decimal(price), stock, moq, name)


# ---------- GET /api/orders ----------

def test_list_orders_requires_token(client):
    assert client.get("/api/orders").status_code == 401


def test_list_orders_rejects_other_roles(client):
    assert client.get("/api/orders", headers=auth("admin")).status_code == 403


# ---------- POST /api/orders ----------

def test_create_order_rejects_supplier(client):
    response = client.post(
        "/api/orders", json={"items": []}, headers=auth("supplier")
    )
    assert response.status_code == 403


def test_create_order_rejects_missing_json(client):
    assert client.post("/api/orders", headers=auth()).status_code == 400


@pytest.mark.parametrize(
    "items",
    [
        None,
        [],
        "x",
        ["x"],
        [{"product_id": 0, "quantity": 1}],
        [{"product_id": 1, "quantity": 0}],
        [{"product_id": True, "quantity": 1}],
        [{"product_id": 1, "quantity": "2"}],
        [{"product_id": 1}],
    ],
)
def test_create_order_rejects_invalid_items(client, items):
    response = client.post("/api/orders", json={"items": items}, headers=auth())
    assert response.status_code == 400


def test_create_order_product_not_found(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchall=[[]]))
    response = client.post(
        "/api/orders",
        json={"items": [{"product_id": 1, "quantity": 1}]},
        headers=auth(),
    )
    assert response.status_code == 404


def test_create_order_product_without_supplier(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchall=[[product(1, supplier=None)]]))
    response = client.post(
        "/api/orders",
        json={"items": [{"product_id": 1, "quantity": 1}]},
        headers=auth(),
    )
    assert response.status_code == 400


def test_create_order_below_minimum(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchall=[[product(1, moq=10)]]))
    response = client.post(
        "/api/orders",
        json={"items": [{"product_id": 1, "quantity": 3}]},
        headers=auth(),
    )
    assert response.status_code == 400
    assert response.get_json()["code"] == "below_min_order"


def test_create_order_insufficient_stock(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchall=[[product(1, stock=2)]]))
    response = client.post(
        "/api/orders",
        json={"items": [{"product_id": 1, "quantity": 5}]},
        headers=auth(),
    )
    assert response.status_code == 400
    assert response.get_json()["code"] == "insufficient_stock"


def test_create_order_success_total_and_stock_update(client, monkeypatch):
    cursor = FakeCursor(fetchall=[[product(1, price="5.00")]], fetchone=[(77,)])
    use_cursor(monkeypatch, cursor)

    response = client.post(
        "/api/orders",
        # the same product twice is combined into one line of 3
        json={"items": [
            {"product_id": 1, "quantity": 1},
            {"product_id": 1, "quantity": 2},
        ]},
        headers=auth(),
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["count"] == 1
    assert body["orders"][0] == {
        "id": 77, "supplier_id": 10, "total_amount": "15.00", "status": "pending",
    }
    # the stock is reduced by the ordered quantity
    stock_update = [q for q in cursor.queries if "UPDATE products" in q[0]][0]
    assert stock_update[1][0] == 3


def test_create_order_splits_by_supplier(client, monkeypatch):
    cursor = FakeCursor(
        fetchall=[[product(1, supplier=10), product(2, supplier=20)]],
        fetchone=[(1,), (2,)],
    )
    use_cursor(monkeypatch, cursor)

    response = client.post(
        "/api/orders",
        json={"items": [
            {"product_id": 1, "quantity": 1},
            {"product_id": 2, "quantity": 1},
        ]},
        headers=auth(),
    )

    assert response.status_code == 201
    assert response.get_json()["count"] == 2


def test_create_order_database_error(client, monkeypatch):
    database_down(monkeypatch)
    response = client.post(
        "/api/orders",
        json={"items": [{"product_id": 1, "quantity": 1}]},
        headers=auth(),
    )
    assert response.status_code == 503


# ---------- PATCH /api/orders/<id>/status ----------

def patch_status(client, status, user_id=2, role="supplier"):
    return client.patch(
        "/api/orders/4/status",
        json={"status": status},
        headers=auth(role, user_id),
    )


def test_status_rejects_merchant(client):
    assert patch_status(client, "processing", role="merchant").status_code == 403


def test_status_rejects_missing_json(client):
    response = client.patch("/api/orders/4/status", headers=auth("supplier", 2))
    assert response.status_code == 400


def test_status_must_be_string(client):
    assert patch_status(client, 5).status_code == 400


def test_status_order_not_found(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[None]))
    assert patch_status(client, "processing").status_code == 404


def test_status_other_suppliers_order_denied(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(99, "pending", "m@example.com")]))
    assert patch_status(client, "processing", user_id=2).status_code == 403


@pytest.mark.parametrize(
    "current,new",
    [
        ("pending", "shipped"),
        ("processing", "delivered"),
        ("shipped", "processing"),
        ("delivered", "shipped"),
    ],
)
def test_status_invalid_transition(client, monkeypatch, current, new):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(2, current, "m@example.com")]))
    response = patch_status(client, new)
    assert response.status_code == 409
    assert response.get_json()["error"] == "Invalid status transition"


@pytest.mark.parametrize(
    "current,new",
    [
        ("pending", "processing"),
        ("paid", "processing"),
        ("processing", "shipped"),
        ("shipped", "delivered"),
    ],
)
def test_status_valid_transition_sends_notification(client, monkeypatch, current, new):
    use_cursor(
        monkeypatch,
        FakeCursor(fetchone=[(2, current, "m@example.com"), (4, new)]),
    )
    with patch("routes.orders.send_order_notification") as notify:
        response = patch_status(client, new)

    assert response.status_code == 200
    assert response.get_json()["order"]["status"] == new
    notify.assert_called_once_with(f"order_{new}", "m@example.com", {"order_id": 4})


def test_status_database_error(client, monkeypatch):
    database_down(monkeypatch)
    assert patch_status(client, "processing").status_code == 503