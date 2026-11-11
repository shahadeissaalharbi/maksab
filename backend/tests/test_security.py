import importlib

import pytest


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://allowed.example")
    monkeypatch.setenv("RATE_LIMITS_ENABLED", "true")

    import app as app_module
    app_module = importlib.reload(app_module)
    app_module.app.config["TESTING"] = True
    return app_module.app.test_client()


def test_cors_allows_listed_origin(client):
    res = client.get(
        "/api/products", headers={"Origin": "https://allowed.example"}
    )
    assert res.headers.get("Access-Control-Allow-Origin") == (
        "https://allowed.example"
    )


def test_cors_blocks_unknown_origin(client):
    res = client.get(
        "/api/products", headers={"Origin": "https://evil.example"}
    )
    assert "Access-Control-Allow-Origin" not in res.headers


def test_login_is_rate_limited(client):
    codes = [
        client.post("/api/auth/login", json={}).status_code
        for _ in range(12)
    ]
    assert 429 in codes
    assert codes[0] == 400