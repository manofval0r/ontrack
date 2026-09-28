"""Supabase JWT verification. Django verifies — it never mints tokens.

Two trust paths; the token's `alg` header decides (key material is pinned
per branch, so there is no algorithm-confusion risk):
- HS256: legacy shared secret SUPABASE_JWT_SECRET.
- ES256: Supabase asymmetric keys via SUPABASE_JWKS_URL (fetched + cached).

Flow: `Authorization: Bearer <token>` -> verify signature + exp
-> `sub` claim (a UUID string) becomes `request.user_id`.

Verified API notes (PyJWT 2.10.1):
- `jwt.decode(token, key, algorithms=[...])` verifies signature AND `exp`
  by default; failures raise subclasses of `jwt.PyJWTError`.
- `jwt.get_unverified_header(token)` reads `alg`/`kid` without verifying.
- Supabase tokens carry an `aud` claim whose value varies per project, so we
  pass `options={"verify_aud": False}` and deliberately do NOT enforce it.
  Signature + expiry is the trust boundary here.
- ES256 needs the `cryptography` package (in requirements.txt); without it
  ES256 tokens fail closed as unconfigured.
"""
import json
import logging
import time
import urllib.request
import uuid

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)

_JWKS_TTL_SECONDS = 3600
# kid -> EC public-key object. Reset in tests; never holds secrets (public).
_jwks_cache = {"fetched_at": 0.0, "keys": {}}


class AuthInvalid(AuthenticationFailed):
    """Auth failure with the spec's error code.

    The global exception handler uppercases `default_code`, so clients see
    {"error": "<detail>", "code": "AUTH_INVALID"} with HTTP 401, never a 500.
    """

    status_code = 401
    default_detail = "invalid or missing authentication credentials"
    default_code = "auth_invalid"


class SupabaseUser:
    """Minimal user object — there is deliberately no local user table."""

    def __init__(self, user_id: uuid.UUID):
        self.id = user_id
        self.pk = user_id
        self.user_id = user_id

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return f"supabase-user:{self.id}"


def _fetch_jwks(url):
    """Download + parse the JWKS document. Raises on any failure."""
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=5) as resp:
        doc = json.loads(resp.read().decode("utf-8"))
    keys = doc.get("keys")
    if not isinstance(keys, list):
        raise ValueError("JWKS has no keys list")
    return keys


def _ec_key_for_kid(kid):
    """EC public-key object for `kid`, fetching JWKS on miss/staleness.

    A fresh-cache miss still refetches once, so key rotation never locks
    out valid tokens for longer than one request.
    """
    cached = _jwks_cache["keys"].get(kid)
    fresh = time.monotonic() - _jwks_cache["fetched_at"] < _JWKS_TTL_SECONDS
    if cached is not None and fresh:
        return cached
    jwks_url = getattr(settings, "SUPABASE_JWKS_URL", "")
    if not jwks_url:
        supabase_url = getattr(settings, "SUPABASE_URL", "https://destcakvqdzhkzemdugo.supabase.co")
        jwks_url = f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json" if supabase_url else ""
    if not jwks_url:
        logger.error("SUPABASE_JWKS_URL is not configured; rejecting ES256 token")
        raise AuthInvalid("authentication is not configured")
    try:
        entries = _fetch_jwks(jwks_url)
    except AuthInvalid:
        raise
    except Exception:
        # Log type only — the URL may contain secrets, the body is untrusted.
        logger.warning("Supabase JWKS fetch failed", exc_info=True)
        raise AuthInvalid("authentication is not configured")
    try:
        from jwt.algorithms import ECAlgorithm
    except ImportError:
        logger.error("cryptography package missing; cannot verify ES256 tokens")
        raise AuthInvalid("authentication is not configured")
    parsed = {}
    for entry in entries:
        try:
            if not isinstance(entry, dict) or entry.get("kty") != "EC":
                continue
            entry_kid = entry.get("kid")
            if not entry_kid:
                continue
            parsed[entry_kid] = ECAlgorithm.from_jwk(json.dumps(entry))
        except Exception:
            logger.warning("Skipping unparsable JWKS entry")
            continue
    _jwks_cache["keys"] = parsed
    _jwks_cache["fetched_at"] = time.monotonic()
    key = parsed.get(kid)
    if key is None:
        logger.info("Rejected Supabase JWT: unknown kid")
        raise AuthInvalid("invalid token")
    return key


class SupabaseJWTAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate_header(self, request):
        # Lets DRF keep 401 (with a WWW-Authenticate header) instead of
        # coercing auth failures to 403.
        return f'{self.keyword} realm="ontrack"'

    def authenticate(self, request):
        header = request.headers.get("Authorization", "")
        if not header:
            return None  # No credentials: let the permission layer 401.
        parts = header.split()
        if len(parts) != 2 or parts[0] != self.keyword or not parts[1]:
            raise AuthInvalid("malformed authorization header")
        return self._authenticate_token(request, parts[1])

    def _authenticate_token(self, request, token):
        try:
            unverified = jwt.get_unverified_header(token)
        except jwt.PyJWTError:
            logger.info("Rejected Supabase JWT: unreadable header")
            raise AuthInvalid("invalid token")
        alg = unverified.get("alg")
        if alg == "ES256":
            credentials = _ec_key_for_kid(unverified.get("kid"))
            algorithms = ["ES256"]
        elif alg == "HS256":
            secret = settings.SUPABASE_JWT_SECRET
            if not secret:
                # Fail closed: without a secret nothing can be trusted.
                logger.error("SUPABASE_JWT_SECRET is not configured; rejecting token")
                raise AuthInvalid("authentication is not configured")
            credentials = secret
            algorithms = ["HS256"]
        else:
            logger.info("Rejected Supabase JWT: unsupported alg")
            raise AuthInvalid("invalid token")
        try:
            payload = jwt.decode(
                token,
                credentials,
                algorithms=algorithms,
                options={"verify_aud": False},
            )
        except jwt.ExpiredSignatureError:
            raise AuthInvalid("token has expired")
        except jwt.PyJWTError:
            # Covers bad signature, malformed token, bad claims, etc.
            # Log only the error type — never the token or the secret.
            logger.info("Rejected Supabase JWT: verification failed")
            raise AuthInvalid("invalid token")
        sub = payload.get("sub")
        if not sub:
            raise AuthInvalid("token has no subject claim")
        try:
            user_id = uuid.UUID(str(sub))
        except (ValueError, AttributeError, TypeError):
            logger.info("Rejected Supabase JWT: sub claim is not a UUID")
            raise AuthInvalid("invalid token subject")
        request.user_id = user_id
        return (SupabaseUser(user_id), token)
