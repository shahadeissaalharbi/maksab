from unittest.mock import MagicMock, patch

import jwt
import pytest

from config import Config
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    return app.test_client()


def supplier_headers(user_id=2):
    token = jwt.encode(
        {"sub": str(user_id), "role": "supplier"},
        Config.JWT_SECRET,
        algorithm=Config.JWT_ALGORITHM,
    )
    return {"Authorization": f"Bearer {token}"}


def mock_database(supplier_id=2, current_status="paid"):
    connection = MagicMock()
    cursor = MagicMock()

    connection.__enter__.return_value = connection
    connection.cursor.return_value.__enter__.return_value = cursor

    cursor.fetchone.side_effect = [
        (supplier_id, current_status, "merchant@example.com"),
        (4, "processing"),
    ]

    return connection


def test_status_update_sends_notification(client):
    connection = mock_database()

    with (
        patch("routes.orders.psycopg.connect", return_value=connection),
        patch("routes.orders.send_order_notification") as notification,
    ):
        response = client.patch(
            "/api/supplier/orders/4/status",
            json={"status": "processing"},
            headers=supplier_headers(),
        )

    assert response.status_code == 200
    notification.assert_called_once_with(
        "order_processing",
        "merchant@example.com",
        {"order_id": 4},
    )


def test_email_failure_does_not_block_order(client):
    connection = mock_database()

    with (
        patch("routes.orders.psycopg.connect", return_value=connection),
        patch(
            "routes.orders.send_order_notification",
            side_effect=RuntimeError("Email unavailable"),
        ),
    ):
        response = client.patch(
            "/api/supplier/orders/4/status",
            json={"status": "processing"},
            headers=supplier_headers(),
        )

    assert response.status_code == 200


def test_other_supplier_cannot_update_order(client):
    connection = mock_database(supplier_id=3)

    with (
        patch("routes.orders.psycopg.connect", return_value=connection),
        patch("routes.orders.send_order_notification") as notification,
    ):
        response = client.patch(
            "/api/supplier/orders/4/status",
            json={"status": "processing"},
            headers=supplier_headers(user_id=2),
        )

    assert response.status_code == 403
    notification.assert_not_called()
