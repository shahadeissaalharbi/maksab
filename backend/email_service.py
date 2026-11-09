import json
import urllib.request

import resend
from config import Config

BREVO_URL = "https://api.brevo.com/v3/smtp/email"


def build_otp_html(code):
    return f"""
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif;
                    max-width: 480px; margin: auto; text-align: center;">
            <h2>أهلًا في مكسب!</h2>
            <p>رمز التحقق حقك:</p>
            <h1 style="letter-spacing: 8px; color: #006B52;">{code}</h1>
            <p>الرمز صالح لمدة 10 دقايق.</p>
            <p>إذا ما سجلت في مكسب، تجاهل هذا الإيميل.</p>
        </div>
    """


def send_with_brevo(to_email, subject, html):
    # Brevo يرسل لأي إيميل من مرسل موثق، عن طريق HTTPS (يشتغل على Railway)
    body = {
        "sender": {"name": "مكسب", "email": Config.EMAIL_FROM},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html,
    }
    request = urllib.request.Request(
        BREVO_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "api-key": Config.BREVO_API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8") or "{}")


def send_with_resend(to_email, subject, html):
    resend.api_key = Config.RESEND_API_KEY
    return resend.Emails.send({
        "from": Config.EMAIL_FROM,
        "to": [to_email],
        "subject": subject,
        "html": html,
    })


def send_email(to_email, subject, html):
    if not Config.EMAIL_FROM:
        raise RuntimeError("Email service is not configured")

    # إذا فيه مفتاح Brevo نستخدمه، وإلا Resend مثل قبل
    if Config.BREVO_API_KEY:
        return send_with_brevo(to_email, subject, html)

    if Config.RESEND_API_KEY:
        return send_with_resend(to_email, subject, html)

    raise RuntimeError("Email service is not configured")


def send_otp_email(to_email, code):
    """Send a six-digit email verification code."""
    return send_email(to_email, "رمز التحقق - مكسب", build_otp_html(code))


def send_verification_email(to_email, verification_url):
    html = f'<p>رابط التوثيق: <a href="{verification_url}">توثيق البريد</a></p>'
    return send_email(to_email, "توثيق بريدك - مكسب", html)
# Order notifications

import logging
from html import escape

logger = logging.getLogger(__name__)

ORDER_NOTIFICATION_SUBJECTS = {
    "new_order": "طلب جديد - مكسب",
    "order_processing": "طلبك قيد التجهيز - مكسب",
    "order_shipped": "تم شحن طلبك - مكسب",
    "order_delivered": "تم تسليم طلبك - مكسب",
    "payment_success": "تم تأكيد الدفع - مكسب",
}

ORDER_NOTIFICATION_MESSAGES = {
    "new_order": "لديك طلب جديد في مكسب.",
    "order_processing": "بدأ المورد بتجهيز طلبك.",
    "order_shipped": "تم شحن طلبك.",
    "order_delivered": "تم تسليم طلبك.",
    "payment_success": "تم تأكيد دفع طلبك بنجاح.",
}


def send_order_notification(notification_type, recipient, order_data):
    """Send an order notification without interrupting the main operation."""

    if notification_type not in ORDER_NOTIFICATION_SUBJECTS:
        raise ValueError("Unsupported notification type")

    if not isinstance(order_data, dict):
        raise ValueError("order_data must be a dictionary")

    if not isinstance(recipient, str) or not recipient.strip():
        raise ValueError("A recipient email is required")

    order_id = escape(str(order_data.get("order_id", "غير محدد")))

    subject = ORDER_NOTIFICATION_SUBJECTS[notification_type]
    message = ORDER_NOTIFICATION_MESSAGES[notification_type]

    html = f"""
    <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif;
                          max-width: 600px; margin: auto;">
        <h2 style="color: #006B52;">مكسب</h2>
        <p>{message}</p>
        <p><strong>رقم الطلب:</strong> {order_id}</p>
        <p>شكرًا لاستخدامك منصة مكسب.</p>
    </div>
    """

    try:
        return send_email(recipient, subject, html)
    except Exception:
        logger.exception(
            "Failed to send %s notification for order %s",
            notification_type,
            order_id,
        )
        return None
