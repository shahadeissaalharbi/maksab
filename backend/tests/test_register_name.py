import pytest
from flask import Flask

from routes.auth import auth_bp


@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(auth_bp)
    return app.test_client()


@pytest.mark.parametrize("name", ["A", " a ", "12", "!!", "٣٤"])
def test_register_rejects_invalid_name(client, name):
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": name,
            "email": "name.test@example.com",
            "password": "Password123",
        },
    )

    assert response.status_code == 400
    assert response.get_json()["error"] == (
        "Name must be at least 2 characters"
    )