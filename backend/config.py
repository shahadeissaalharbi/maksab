import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Database
    DATABASE_URL = os.environ.get("DATABASE_URL")

    # Authentication
    JWT_SECRET = os.environ.get("JWT_SECRET")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_HOURS = 2

    # Email Verification
    RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
    BREVO_API_KEY = os.environ.get("BREVO_API_KEY")
    EMAIL_FROM = os.environ.get("EMAIL_FROM")

    EMAIL_VERIFICATION_BASE_URL = os.environ.get(
        "EMAIL_VERIFICATION_BASE_URL",
        "http://localhost:5000"
    )

    EMAIL_VERIFICATION_EXPIRATION_HOURS = 24

    # Moyasar payments (sandbox keys: sk_test_ / pk_test_)
    MOYASAR_SECRET_KEY = os.environ.get("MOYASAR_SECRET_KEY", "").strip()
    MOYASAR_PUBLISHABLE_KEY = os.environ.get(
        "MOYASAR_PUBLISHABLE_KEY", ""
    ).strip()
    MOYASAR_WEBHOOK_SECRET = os.environ.get(
        "MOYASAR_WEBHOOK_SECRET", ""
    ).strip()
    MOYASAR_API_URL = "https://api.moyasar.com/v1"