import jwt
import pytest
from flask import Flask

from config import Config
from routes.calculator import calculator_bp


@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(calculator_bp)
    return app.test_client()


def headers(role="merchant"):
    token = jwt.encode(
        {"sub": "1", "role": role},
        Config.JWT_SECRET,
        algorithm=Config.JWT_ALGORITHM,
    )
    return {"Authorization": f"Bearer {token}"}


def post(client, **overrides):
    body = {"material": 20, "packaging": 5, "labor": 10,
            "quantity": 10, "margin": 30}
    body.update(overrides)
    return client.post("/api/calculator/price", json=body, headers=headers())


def test_case_1(client):
    response = post(client)
    assert response.status_code == 200
    assert response.get_json() == {
        "total_cost": 35.0, "cost_per_unit": 3.5,
        "suggested_price": 5.0, "profit_per_unit": 1.5,
    }


def test_case_2(client):
    response = post(client, material=100, packaging=20, labor=30,
                    quantity=50, margin=25)
    assert response.status_code == 200
    assert response.get_json() == {
        "total_cost": 150.0, "cost_per_unit": 3.0,
        "suggested_price": 4.0, "profit_per_unit": 1.0,
    }


def test_quantity_zero(client):
    assert post(client, quantity=0).status_code == 400


def test_margin_100(client):
    assert post(client, margin=100).status_code == 400


def test_negative_cost(client):
    assert post(client, material=-5).status_code == 400


def test_requires_token(client):
    assert client.post("/api/calculator/price", json={}).status_code == 401


def test_supplier_forbidden(client):
    response = client.post("/api/calculator/price", json={},
                           headers=headers("supplier"))
    assert response.status_code == 403
