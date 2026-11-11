import jwt
import pytest
from flask import Flask
from werkzeug.security import check_password_hash, generate_password_hash

from config import Config
from routes import profile
from routes.profile import profile_bp


OLD_PASSWORD = "OldPassword1"
NEW_PASSWORD = "NewPassword2"


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(Config, "JWT_SECRET", "test-jwt-secret")

    app = Flask(__name__)
    app.register_blueprint(profile_bp)
    return app.test_client()


def headers():
    token = jwt.encode(
        {"sub": "1", "role": "merchant"},
        Config.JWT_SECRET,
        algorithm=Config.JWT_ALGORITHM,
    )
    return {"Authorization": f"Bearer {token}"}


class FakeCursor:
    def __init__(self, rows):
        self.rows = list(rows)
        self.queries = []

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def execute(self, sql, params=None):
        self.queries.append((sql.strip(), params))

    def fetchone(self):
        return self.rows.pop(0) if self.rows else None

    def statements(self, keyword):
        return [
            q for q in self.queries if q[0].startswith(keyword)
        ]


class FakeConnection:
    def __init__(self, cursor):
        self._cursor = cursor

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def cursor(self):
        return self._cursor


def use_db(monkeypatch, rows):
    cursor = FakeCursor(rows)
    monkeypatch.setattr(
        profile.psycopg, "connect",
        lambda *args, **kwargs: FakeConnection(cursor)
    )
    return cursor


def user_row():
    return (generate_password_hash(OLD_PASSWORD),)


# ---------- PUT /api/users/password ----------

def password_body(**overrides):
    body = {
        "current_password": OLD_PASSWORD,
        "new_password": NEW_PASSWORD,
    }
    body.update(overrides)
    return body


def test_password_requires_token(client):
    response = client.put("/api/users/password", json=password_body())
    assert response.status_code == 401


def test_password_missing_fields(client):
    response = client.put("/api/users/password", json={},
                          headers=headers())
    assert response.status_code == 400


def test_password_too_short(client):
    response = client.put(
        "/api/users/password",
        json=password_body(new_password="short"),
        headers=headers(),
    )
    assert response.status_code == 400
    assert response.get_json()["code"] == "weak_password"


def test_password_same_as_old(client):
    response = client.put(
        "/api/users/password",
        json=password_body(new_password=OLD_PASSWORD),
        headers=headers(),
    )
    assert response.status_code == 400
    assert response.get_json()["code"] == "same_password"


def test_password_wrong_current(client, monkeypatch):
    cursor = use_db(monkeypatch, [user_row()])
    response = client.put(
        "/api/users/password",
        json=password_body(current_password="WrongPass99"),
        headers=headers(),
    )
    assert response.status_code == 400
    assert response.get_json()["code"] == "wrong_password"
    assert cursor.statements("UPDATE") == []


def test_password_user_not_found(client, monkeypatch):
    use_db(monkeypatch, [])
    response = client.put("/api/users/password", json=password_body(),
                          headers=headers())
    assert response.status_code == 404


def test_password_changed(client, monkeypatch):
    cursor = use_db(monkeypatch, [user_row()])
    response = client.put("/api/users/password", json=password_body(),
                          headers=headers())
    assert response.status_code == 200

    updates = cursor.statements("UPDATE")
    assert len(updates) == 1

    new_hash = updates[0][1][0]
    assert check_password_hash(new_hash, NEW_PASSWORD)
    assert new_hash != OLD_PASSWORD


# ---------- DELETE /api/users/profile ----------

def test_delete_requires_token(client):
    response = client.delete("/api/users/profile",
                             json={"password": OLD_PASSWORD})
    assert response.status_code == 401


def test_delete_requires_password(client):
    response = client.delete("/api/users/profile", json={},
                             headers=headers())
    assert response.status_code == 400


def test_delete_wrong_password(client, monkeypatch):
    cursor = use_db(monkeypatch, [user_row()])
    response = client.delete("/api/users/profile",
                             json={"password": "WrongPass99"},
                             headers=headers())
    assert response.status_code == 400
    assert cursor.statements("DELETE") == []


def test_delete_blocked_when_account_has_data(client, monkeypatch):
    cursor = use_db(monkeypatch, [user_row(), (True, False, False)])
    response = client.delete("/api/users/profile",
                             json={"password": OLD_PASSWORD},
                             headers=headers())
    assert response.status_code == 409
    assert response.get_json()["code"] == "account_has_data"
    assert cursor.statements("DELETE") == []


def test_delete_account(client, monkeypatch):
    cursor = use_db(monkeypatch, [user_row(), (False, False, False)])
    response = client.delete("/api/users/profile",
                             json={"password": OLD_PASSWORD},
                             headers=headers())
    assert response.status_code == 200
    assert len(cursor.statements("DELETE")) == 1