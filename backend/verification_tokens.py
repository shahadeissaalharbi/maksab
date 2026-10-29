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