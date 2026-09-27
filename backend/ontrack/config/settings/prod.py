"""Production settings: Postgres required, debug off, strict hosts."""
from .base import *  # noqa
from .base import env

DEBUG = False

if not env("DATABASE_URL", default=""):
    raise ValueError("DATABASE_URL must be set in production.")

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])
if not ALLOWED_HOSTS:
    raise ValueError("ALLOWED_HOSTS must be set in production (comma-separated).")

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
