"""Shared JWT helper + auth/handler hardening tests (deliverables 3 & 5)."""
import base64
import importlib.util
import uuid
from datetime import datetime, timedelta, timezone
from unittest import mock

import jwt
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.accounts import authentication

TEST_SECRET = "endpoint-test-secret"
HAS_CRYPTO = importlib.util.find_spec("cryptography") is not None


def mint_token(user_id, secret=TEST_SECRET, **overrides):
    payload = {
        "sub": str(user_id),
        "aud": "authenticated",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }
    payload.update(overrides)
    return jwt.encode(payload, secret, algorithm="HS256")


@override_settings(SUPABASE_JWT_SECRET=TEST_SECRET)
class AuthEnforcementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_id = uuid.uuid4()

    def auth(self, user_id=None, **kw):
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {mint_token(user_id or self.user_id, **kw)}"
        )

    def test_no_token_is_401_auth_invalid(self):
        resp = self.client.get("/api/goals")
        self.assertEqual(resp.status_code, 401)
        self.assertEqual(resp.json()["code"], "AUTH_INVALID")

    def test_bad_token_is_401_auth_invalid(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer bad.token.here")
        resp = self.client.get("/api/goals")
        self.assertEqual(resp.status_code, 401)
        self.assertEqual(resp.json()["code"], "AUTH_INVALID")

    def test_valid_token_passes(self):
        self.auth()
        resp = self.client.get("/api/goals")
        self.assertEqual(resp.status_code, 200)


@override_settings(SUPABASE_JWT_SECRET=TEST_SECRET)
class ExceptionHandlerTests(TestCase):
    def test_unhandled_exception_is_generic_500(self):
        from config.exceptions import standard_exception_handler

        resp = standard_exception_handler(ValueError("super-secret-boom"), {})
        self.assertEqual(resp.status_code, 500)
        self.assertEqual(
            resp.data, {"error": "internal server error", "code": "INTERNAL_ERROR"}
        )
        self.assertNotIn("boom", str(resp.data))

    def test_no_cors_wildcard(self):
        from django.conf import settings

        self.assertFalse(settings.CORS_ALLOW_ALL_ORIGINS)


def _b64u_int(n, length):
    return base64.urlsafe_b64encode(n.to_bytes(length, "big")).rstrip(b"=").decode()


def _make_ec_keypair(kid="test-kid-es256"):
    """Generate a P-256 keypair + public JWK. Requires cryptography."""
    from cryptography.hazmat.primitives.asymmetric import ec

    private = ec.generate_private_key(ec.SECP256R1())
    numbers = private.public_key().public_numbers()
    jwk = {
        "kty": "EC",
        "crv": "P-256",
        "x": _b64u_int(numbers.x, 32),
        "y": _b64u_int(numbers.y, 32),
        "kid": kid,
        "ext": True,
    }
    return private, jwk


def _mint_es256(user_id, private_key, kid="test-kid-es256", **overrides):
    payload = {
        "sub": str(user_id),
        "aud": "authenticated",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }
    payload.update(overrides)
    return jwt.encode(payload, private_key, algorithm="ES256", headers={"kid": kid})


@override_settings(
    SUPABASE_JWT_SECRET="",
    SUPABASE_JWKS_URL="https://jwks.test/.well-known/jwks.json",
)
class Es256AuthenticationTests(TestCase):
    """ES256 via JWKS. Skipped where `cryptography` is missing (fail-closed
    there is covered by Es256WithoutCryptoTests)."""

    def setUp(self):
        self.client = APIClient()
        self.user_id = uuid.uuid4()
        authentication._jwks_cache = {"fetched_at": 0.0, "keys": {}}
        if HAS_CRYPTO:
            self.private, self.jwk = _make_ec_keypair()

    def _auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def _jwks(self, keys):
        return mock.patch.object(
            authentication, "_fetch_jwks", return_value=keys
        )

    def test_es256_happy_path(self):
        if not HAS_CRYPTO:
            self.skipTest("cryptography not installed")
        token = _mint_es256(self.user_id, self.private)
        with self._jwks([self.jwk]):
            self._auth(token)
            resp = self.client.get("/api/goals")
        self.assertEqual(resp.status_code, 200, resp.content)

    def test_es256_unknown_kid_is_401(self):
        if not HAS_CRYPTO:
            self.skipTest("cryptography not installed")
        token = _mint_es256(self.user_id, self.private, kid="nope")
        with self._jwks([self.jwk]):
            self._auth(token)
            resp = self.client.get("/api/goals")
        self.assertEqual(resp.status_code, 401)
        self.assertEqual(resp.json()["code"], "AUTH_INVALID")

    def test_es256_tampered_token_is_401(self):
        if not HAS_CRYPTO:
            self.skipTest("cryptography not installed")
        token = _mint_es256(self.user_id, self.private)
        bad = token[:-4] + ("AAAA" if not token.endswith("AAAA") else "BBBB")
        with self._jwks([self.jwk]):
            self._auth(bad)
            resp = self.client.get("/api/goals")
        self.assertEqual(resp.status_code, 401)
        self.assertEqual(resp.json()["code"], "AUTH_INVALID")

    @override_settings(SUPABASE_JWKS_URL="")
    def test_es256_without_jwks_url_is_401(self):
        if not HAS_CRYPTO:
            self.skipTest("cryptography not installed")
        token = _mint_es256(self.user_id, self.private)
        with self._jwks([self.jwk]):
            self._auth(token)
            resp = self.client.get("/api/goals")
        self.assertEqual(resp.status_code, 401)
        self.assertEqual(resp.json()["code"], "AUTH_INVALID")


class Es256WithoutCryptoTests(TestCase):
    """Fail-closed when the EC stack is unavailable (no cryptography lib)."""

    def test_es256_fails_closed_without_lib(self):
        if HAS_CRYPTO:
            self.skipTest("cryptography installed; covered by Es256AuthenticationTests")
        authentication._jwks_cache = {"fetched_at": 0.0, "keys": {}}
        client = APIClient()
        # Well-formed ES256 header, bogus body/signature — must fail closed.
        fake = "eyJhbGciOiJFUzI1NiIsImtpZCI6IngifQ.e30.sig"
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {fake}")
        with mock.patch.object(authentication, "_fetch_jwks", return_value=[]):
            with override_settings(SUPABASE_JWKS_URL="https://jwks.test/j.json"):
                resp = client.get("/api/goals")
        self.assertEqual(resp.status_code, 401)
