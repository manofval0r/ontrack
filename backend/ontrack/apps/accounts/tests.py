"""Shared JWT helper + auth/handler hardening tests (deliverables 3 & 5)."""
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

TEST_SECRET = "endpoint-test-secret"


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
