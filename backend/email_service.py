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


def send_otp_email(to_email, code):
    """Send a six-digit email verification code."""

    if not Config.RESEND_API_KEY or not Config.EMAIL_FROM:
        raise RuntimeError("Email service is not configured")

    resend.api_key = Config.RESEND_API_KEY

    response = resend.Emails.send({
        "from": Config.EMAIL_FROM,
        "to": [to_email],
        "subject": "Maksab - Email Verification Code",
        "html": f"""
            <div style="font-family: Arial, sans-serif;
                        max-width: 480px; margin: auto;
                        text-align: center;">

                <h2>Welcome to Maksab!</h2>

                <p>Use the following code to verify your email:</p>

                <h1 style="letter-spacing: 8px;
                           color: #2563eb;">
                    {code}
                </h1>

                <p>This code expires in 10 minutes.</p>

                <p>If you did not create this account,
                   you can ignore this email.</p>

            </div>
        """
    })

    return response