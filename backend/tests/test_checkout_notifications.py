from unittest.mock import MagicMock, patch

from email_service import notify_checkout_paid


def mock_checkout_db(checkout, orders=None):
    connection = MagicMock()
    cursor = MagicMock()

    connection.__enter__.return_value = connection
    connection.cursor.return_value.__enter__.return_value = cursor

    cursor.fetchone.return_value = checkout
    cursor.fetchall.return_value = orders or []

    return connection


def test_paid_checkout_notifies_suppliers_and_merchant():
    connection = mock_checkout_db(
        (1, "merchant@example.com"),
        [
            (10, "supplier1@example.com"),
            (11, "supplier2@example.com"),
        ],
    )

    with (
        patch("psycopg.connect", return_value=connection),
        patch("email_service.send_order_notification") as notify,
    ):
        result = notify_checkout_paid(5)

    assert result is True
    assert notify.call_count == 3

    notify.assert_any_call(
        "new_order",
        "supplier1@example.com",
        {"order_id": 10},
    )

    notify.assert_any_call(
        "new_order",
        "supplier2@example.com",
        {"order_id": 11},
    )

    notify.assert_any_call(
        "payment_success",
        "merchant@example.com",
        {"order_id": 10},
    )


def test_unpaid_checkout_sends_no_notifications():
    connection = mock_checkout_db(None)

    with (
        patch("psycopg.connect", return_value=connection),
        patch("email_service.send_order_notification") as notify,
    ):
        result = notify_checkout_paid(5)

    assert result is False
    notify.assert_not_called()


def test_checkout_without_paid_orders_sends_no_notifications():
    connection = mock_checkout_db(
        (1, "merchant@example.com"),
        [],
    )

    with (
        patch("psycopg.connect", return_value=connection),
        patch("email_service.send_order_notification") as notify,
    ):
        result = notify_checkout_paid(5)

    assert result is False
    notify.assert_not_called()
