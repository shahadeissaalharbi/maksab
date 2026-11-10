import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from email_service import send_order_notification


@pytest.mark.parametrize(
    "notification_type",
    [
        "new_order",
        "order_processing",
        "order_shipped",
        "order_delivered",
        "payment_success",
    ],
)
def test_order_notifications(notification_type):
    with patch("email_service.send_email") as mock_send:
        send_order_notification(
            notification_type,
            "merchant@example.com",
            {"order_id": 123},
        )

        mock_send.assert_called_once()

        recipient, subject, html = mock_send.call_args.args

        assert recipient == "merchant@example.com"
        assert subject
        assert "123" in html


def test_email_failure_does_not_raise():
    with patch(
        "email_service.send_email",
        side_effect=RuntimeError("Email service unavailable"),
    ):
        result = send_order_notification(
            "payment_success",
            "merchant@example.com",
            {"order_id": 123},
        )

        assert result is None


def test_invalid_notification_type():
    with pytest.raises(ValueError):
        send_order_notification(
            "invalid_type",
            "merchant@example.com",
            {"order_id": 123},
        )


def test_invalid_recipient():
    with pytest.raises(ValueError):
        send_order_notification(
            "payment_success",
            "",
            {"order_id": 123},
        )
