import os

from flask import jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix

DEFAULT_ORIGINS = (
    "https://frontend-lac-phi-92.vercel.app,"
    "http://localhost:5173"
)

LIMITED_ENDPOINTS = [
    "auth.login",
    "auth.register",
    "auth.verify_otp",
    "auth.resend_verification",
]

limiter = Limiter(key_func=get_remote_address, default_limits=[])


def init_security(app):
    """Call after all blueprints are registered."""
    raw = os.environ.get("ALLOWED_ORIGINS", DEFAULT_ORIGINS)
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    CORS(app, origins=origins)

    # Railway sits behind one proxy: read the real client IP from it
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1)

    enabled = os.environ.get("RATE_LIMITS_ENABLED", "true").lower()
    app.config["RATELIMIT_ENABLED"] = enabled != "false"
    limiter.init_app(app)

    for endpoint in LIMITED_ENDPOINTS:
        view = app.view_functions.get(endpoint)
        if view is not None:
            app.view_functions[endpoint] = limiter.limit(
                "10 per minute"
            )(view)

    @app.errorhandler(429)
    def too_many_requests(_error):
        return jsonify({
            "error": "Too many requests. Please try again later."
        }), 429