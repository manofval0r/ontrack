"""Shared settings. Secrets come from env vars only — nothing hardcoded.

Verified API notes:
- `environ.Env.read_env()` reads a `.env` file (django-environ 0.11.2).
- `env.db()` parses DATABASE_URL into Django's DATABASES dict.
- `CORS_ALLOWED_ORIGINS` is the correct django-cors-headers setting key.
"""
import environ
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_ORIGINS=(str, ""),
    INSTANCE_NAME=(str, "web"),
    RUN_MIGRATIONS=(bool, False),
)

# Read .env at repo root if present; real env vars take precedence.
_env_file = BASE_DIR / ".env"
if _env_file.exists():
    environ.Env.read_env(_env_file, overwrite=False)

SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-only-insecure-secret-key")
DEBUG = env("DEBUG")

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["*"] if DEBUG else [])

INSTANCE_NAME = env("INSTANCE_NAME")
if INSTANCE_NAME not in ("web", "mobile"):
    raise ValueError('INSTANCE_NAME must be "web" or "mobile", got %r' % INSTANCE_NAME)

SUPABASE_JWT_SECRET = env("SUPABASE_JWT_SECRET", default="")
SUPABASE_URL = env("SUPABASE_URL", default="https://destcakvqdzhkzemdugo.supabase.co")
SUPABASE_PUBLISHABLE_KEY = env("SUPABASE_PUBLISHABLE_KEY", default="")
SUPABASE_SECRET_KEY = env("SUPABASE_SECRET_KEY", default="")
_default_jwks = f"{SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json" if SUPABASE_URL else "https://destcakvqdzhkzemdugo.supabase.co/auth/v1/.well-known/jwks.json"
SUPABASE_JWKS_URL = env("SUPABASE_JWKS_URL", default=_default_jwks)
DEBUG_ACCESS_KEY = env("DEBUG_ACCESS_KEY", default="")

# --- AI (David owns the bodies in apps/ai_module.py; backend reads config) ---
# Defaults point at NVIDIA Build cloud; override per-env (e.g. David's box).
NVIDIA_BASE_URL = env(
    "NVIDIA_BASE_URL", default="https://integrate.api.nvidia.com/v1"
)
NVIDIA_MODEL_NAME = env(
    "NVIDIA_MODEL_NAME", default="nvidia/llama-3.1-nemotron-nano-8b-v1"
)
NVIDIA_API_KEY = env("NVIDIA_API_KEY", default="")
# --- Voice (Riva/NIM audio; same key, OpenAI-compatible audio endpoints) ---
NVIDIA_TTS_MODEL = env("NVIDIA_TTS_MODEL", default="tts-1")
NVIDIA_TTS_VOICE = env("NVIDIA_TTS_VOICE", default="Aria")
NVIDIA_ASR_MODEL = env("NVIDIA_ASR_MODEL", default="whisper-1")

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "corsheaders",
    "rest_framework",
    "apps.accounts",
    "apps.goals",
    "apps.audio",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# Minimal templates: no project templates exist, but DRF's browsable API
# (rest_framework/api.html) needs APP_DIRS to resolve its own templates.
# Without this, browser hits (Accept: text/html) 500 instead of rendering.
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
    }
]

# Postgres via DATABASE_URL (Supabase pooler, port 6543) when set;
# otherwise a local SQLite fallback so check/runserver work pre-Supabase.
if env("DATABASE_URL", default=""):
    DATABASES = {"default": env.db("DATABASE_URL")}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Explicit origins only — never "*". Empty env => no origins allowed.
CORS_ALLOWED_ORIGINS = [
    o.strip() for o in env("ALLOWED_ORIGINS").split(",") if o.strip()
]
CORS_ALLOW_ALL_ORIGINS = False

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.accounts.authentication.SupabaseJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "apps.accounts.permissions.HasSupabaseUser",
    ],
    # Any unhandled exception -> {"error","code"} shape, never a stack trace.
    "EXCEPTION_HANDLER": "config.exceptions.standard_exception_handler",
    # 10/min per user on burst endpoints (scoped throttles, see views).
    "DEFAULT_THROTTLE_RATES": {
        "goals_burst": "10/min",
        "asr_burst": "10/min",
    },
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
TIME_ZONE = "UTC"  # API backend: Supabase timestamps and day-boundary math are UTC.
