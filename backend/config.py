import os

class Config:
    DATABASE_URL = os.environ.get("DATABASE_URL")
    JWT_SECRET = os.environ.get("JWT_SECRET")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_HOURS = 2

 # Email Verification
    RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
    EMAIL_FROM = os.environ.get("EMAIL_FROM")
    EMAIL_VERIFICATION_BASE_URL = os.environ.get(
        "EMAIL_VERIFICATION_BASE_URL",
        "http://localhost:5000"
    )
    EMAIL_VERIFICATION_EXPIRATION_HOURS = 24