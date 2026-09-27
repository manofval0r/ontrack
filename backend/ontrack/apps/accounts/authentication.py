"""Supabase JWT verification. Django verifies — it never mints tokens.

Flow: `Authorization: Bearer <token>` -> HS256 verify with SUPABASE_JWT_SECRET
-> `sub` claim (a UUID string) becomes `request.user_id`.

Verified API notes (PyJWT 2.10.1):
- `jwt.decode(token, key, algorithms=["HS256"])` verifies signature AND `exp`
  by default; failures raise subclasses of `jwt.PyJWTError` (verified via the
  smoke test in scripts/smoke_auth.py).
- Supabase tokens carry an `aud` claim whose value varies per project, so we
  pass `options={"verify_aud": False}` and deliberately do NOT enforce it.
  Signature + expiry is the trust boundary here.
"""
import logging
import uuid

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)


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
        secret = settings.SUPABASE_JWT_SECRET
        if not secret:
            # Fail closed: without a secret nothing can be trusted.
            logger.error("SUPABASE_JWT_SECRET is not configured; rejecting token")
            raise AuthInvalid("authentication is not configured")
        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
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
