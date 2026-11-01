import hmac
import secrets
import hashlib
from datetime import datetime, timedelta, timezone

from config import Config


def generate_verification_token():
    """Generate a secure random token and its SHA-256 hash."""

    token = secrets.token_urlsafe(32)

    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    expires_at = datetime.now(timezone.utc) + timedelta(
        hours=Config.EMAIL_VERIFICATION_EXPIRATION_HOURS
    )

    return token, token_hash, expires_at


def hash_verification_token(token):
    """Hash an incoming verification token for database lookup."""

    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def generate_otp(user_id):
    """Generate a secure six-digit OTP."""

    code = f"{secrets.randbelow(1_000_000):06d}"

    code_hash = hash_otp(user_id, code)

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=10
    )

    return code, code_hash, expires_at


def hash_otp(user_id, code):
    """Generate a keyed hash for an OTP."""

    message = f"{user_id}:{code}".encode("utf-8")
    secret = Config.JWT_SECRET.encode("utf-8")

    return hmac.new(
        secret,
        message,
        hashlib.sha256
    ).hexdigest()


def verify_otp_hash(user_id, code, stored_hash):
    """Compare OTP hashes securely."""

    expected_hash = hash_otp(user_id, code)

    return hmac.compare_digest(
        expected_hash,
        stored_hash
    )
