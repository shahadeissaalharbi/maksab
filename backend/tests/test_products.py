import jwt
import psycopg
import pytest
from flask import Flask

import products
from config import Config
from products import products_bp


class FakeCursor:
    """Returns the prepared rows one by one instead of querying a database."""

    def __init__(self, fetchone=None):
        self._fetchone = list(fetchone or [])
        self.queries = []

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def execute(self, sql, params=None):
        self.queries.append((sql, params))

    def fetchone(self):
        return self._fetchone.pop(0)


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
    monkeypatch.setattr(Config, "JWT_SECRET", "test-jwt-secret-for-product-tests-0123456789")
    app = Flask(__name__)
    app.register_blueprint(products_bp)
    return app.test_client()


def auth(role="supplier", user_id=1):
    token = jwt.encode(
        {"sub": str(user_id), "role": role},
        Config.JWT_SECRET,
        algorithm=Config.JWT_ALGORITHM,
    )
    return {"Authorization": f"Bearer {token}"}


def use_cursor(monkeypatch, cursor):
    monkeypatch.setattr(
        products.psycopg, "connect", lambda *a, **k: FakeConnection(cursor)
    )


def database_down(monkeypatch):
    def boom(*a, **k):
        raise psycopg.OperationalError("down")

    monkeypatch.setattr(products.psycopg, "connect", boom)


VALID = {"name": "Dates", "price": "12.50", "stock_quantity": 10, "moq": 2}


# ---------- POST /api/products ----------

def test_create_requires_token(client):
    assert client.post("/api/products", json=VALID).status_code == 401


def test_create_rejects_merchant(client):
    response = client.post("/api/products", json=VALID, headers=auth("merchant"))
    assert response.status_code == 403


def test_create_rejects_missing_json(client):
    response = client.post("/api/products", headers=auth())
    assert response.status_code == 400


@pytest.mark.parametrize(
    "change",
    [
        {"name": ""},
        {"name": "x" * 151},
        {"price": "abc"},
        {"price": -1},
        {"price": "1.234"},
        {"price": "100000000"},
        {"stock_quantity": -1},
        {"stock_quantity": True},
        {"moq": 0},
        {"moq": True},
        {"category_id": 0},
        {"category_id": True},
        {"unit": "x" * 51},
        {"image_url": 123},
        {"image_url": "https://img.example/" + "a" * 260},
    ],
)
def test_create_rejects_invalid_values(client, change):
    response = client.post("/api/products", json={**VALID, **change}, headers=auth())
    assert response.status_code == 400


def test_create_rejects_unverified_supplier(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[None]))
    response = client.post("/api/products", json=VALID, headers=auth())
    assert response.status_code == 403


def test_create_rejects_unknown_category(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(1,), None]))
    response = client.post(
        "/api/products", json={**VALID, "category_id": 5}, headers=auth()
    )
    assert response.status_code == 400


def test_create_saves_image_url_and_prices(client, monkeypatch):
    cursor = FakeCursor(fetchone=[(1,), (42,)])
    use_cursor(monkeypatch, cursor)
    url = "https://res.cloudinary.com/demo/image/upload/dates.jpg"

    response = client.post(
        "/api/products", json={**VALID, "image_url": url}, headers=auth()
    )

    assert response.status_code == 201
    product = response.get_json()["product"]
    assert product["id"] == 42
    assert product["image_url"] == url
    assert product["price"] == "12.50"
    assert product["stock_status"] == "in_stock"
    # the image link goes straight into the INSERT
    assert url in cursor.queries[-1][1]


def test_create_zero_stock_is_out_of_stock(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(1,), (7,)]))
    response = client.post(
        "/api/products", json={**VALID, "stock_quantity": 0}, headers=auth()
    )
    assert response.status_code == 201
    assert response.get_json()["product"]["stock_status"] == "out_of_stock"


def test_create_database_error(client, monkeypatch):
    database_down(monkeypatch)
    response = client.post("/api/products", json=VALID, headers=auth())
    assert response.status_code == 503


# ---------- PUT /api/products/<id> ----------

def test_update_rejects_merchant(client):
    response = client.put("/api/products/1", json={"price": 5}, headers=auth("merchant"))
    assert response.status_code == 403


def test_update_rejects_missing_json(client):
    assert client.put("/api/products/1", headers=auth()).status_code == 400


@pytest.mark.parametrize(
    "body",
    [
        {},
        {"unknown": 1},
        {"name": ""},
        {"description": 5},
        {"price": "abc"},
        {"price": True},
        {"price": "1.234"},
        {"stock_quantity": -1},
        {"stock_quantity": "5"},
        {"moq": 0},
        {"category_id": 0},
        {"unit": "x" * 51},
        {"image_url": "x" * 256},
        {"image_url": 5},
    ],
)
def test_update_rejects_invalid_fields(client, body):
    response = client.put("/api/products/1", json=body, headers=auth())
    assert response.status_code == 400


def test_update_product_not_found(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[None]))
    response = client.put("/api/products/9", json={"price": 5}, headers=auth())
    assert response.status_code == 404


def test_update_other_suppliers_product_denied(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(2,)]))
    response = client.put("/api/products/9", json={"price": 5}, headers=auth(user_id=1))
    assert response.status_code == 403


def test_update_unknown_category(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(1,), None]))
    response = client.put("/api/products/9", json={"category_id": 5}, headers=auth())
    assert response.status_code == 400


def test_update_success_changes_stock_status(client, monkeypatch):
    row = (9, "Dates", None, 5, 0, "out_of_stock", 1, None, None, 1, "https://img/a.jpg")
    use_cursor(monkeypatch, FakeCursor(fetchone=[(1,), row]))

    response = client.put(
        "/api/products/9", json={"stock_quantity": 0, "price": 5}, headers=auth()
    )

    assert response.status_code == 200
    product = response.get_json()["product"]
    assert product["stock_status"] == "out_of_stock"
    assert product["image_url"] == "https://img/a.jpg"


def test_update_database_error(client, monkeypatch):
    database_down(monkeypatch)
    response = client.put("/api/products/9", json={"price": 5}, headers=auth())
    assert response.status_code == 503


# ---------- DELETE /api/products/<id> ----------

def test_delete_rejects_merchant(client):
    assert client.delete("/api/products/1", headers=auth("merchant")).status_code == 403


def test_delete_success(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[(9,)]))
    response = client.delete("/api/products/9", headers=auth())
    assert response.status_code == 200
    assert response.get_json()["product_id"] == 9


def test_delete_not_found(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[None, None]))
    assert client.delete("/api/products/9", headers=auth()).status_code == 404


def test_delete_other_suppliers_product_denied(client, monkeypatch):
    use_cursor(monkeypatch, FakeCursor(fetchone=[None, (9,)]))
    assert client.delete("/api/products/9", headers=auth()).status_code == 403


def test_delete_database_error(client, monkeypatch):
    database_down(monkeypatch)
    assert client.delete("/api/products/9", headers=auth()).status_code == 503