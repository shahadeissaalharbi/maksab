import resend
from config import Config


def send_verification_email(to_email, verification_url):
    if not Config.RESEND_API_KEY or not Config.EMAIL_FROM:
        raise RuntimeError("Email service is not configured")

    resend.api_key = Config.RESEND_API_KEY

    response = resend.Emails.send({
        "from": Config.EMAIL_FROM,
        "to": [to_email],
        "subject": "Verify your email - Maksab",
        "html": f"""
            <h2>Welcome to Maksab!</h2>
            <p>Thank you for registering.</p>
            <p>Click the button below to verify your email:</p>
            <a href="{verification_url}">Verify Email</a>
            <p>This link expires in 24 hours.</p>
            <p>If you did not create this account, ignore this email.</p>
        """
    })

    return response