"""Smoke test for Supabase JWT auth (deliverable 3).

Run: python3 scripts/smoke_auth.py
Uses a throwaway test secret; signs fake JWTs and checks both paths:
valid token -> user_id attached; every invalid variant -> AUTH_INVALID.
"""
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
os.environ["SUPABASE_JWT_SECRET"] = "smoke-test-secret"
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import django  # noqa: E402

django.setup()

import jwt  # noqa: E402
from django.test import RequestFactory  # noqa: E402
from rest_framework.test import APIRequestFactory  # noqa: E402
from rest_framework.views import APIView  # noqa: E402
from rest_framework.response import Response  # noqa: E402

from apps.accounts.authentication import (  # noqa: E402
    AuthInvalid,
    SupabaseJWTAuthentication,
)

SECRET = "smoke-test-secret"
USER_ID = uuid.uuid4()
PASS = 0
FAIL = 0


def check(name, cond, extra=""):
    global PASS, FAIL
    if cond:
        PASS += 1
        print(f"  PASS {name} {extra}")
    else:
        FAIL += 1
        print(f"  FAIL {name} {extra}")


def mint(payload, secret=SECRET):
    return jwt.encode(payload, secret, algorithm="HS256")


def base_payload():
    return {
        "sub": str(USER_ID),
        "aud": "authenticated",  # Supabase-style; must NOT break verification
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }


factory = APIRequestFactory()
auth = SupabaseJWTAuthentication()

print("== direct authenticate() ==")
req = factory.get("/", HTTP_AUTHORIZATION=f"Bearer {mint(base_payload())}")
user, token = auth.authenticate(req)
check("valid token returns user", user is not None and user.user_id == USER_ID)
check("request.user_id attached", getattr(req, "user_id", None) == USER_ID)

for name, token, headers in [
    ("wrong secret", mint(base_payload(), secret="other-secret"), None),
    ("expired", mint({**base_payload(), "exp": datetime.now(timezone.utc) - timedelta(seconds=10)}), None),
    ("no sub", mint({k: v for k, v in base_payload().items() if k != "sub"}), None),
    ("non-uuid sub", mint({**base_payload(), "sub": "not-a-uuid"}), None),
    ("garbage token", "this.is.not.a.jwt", None),
    ("malformed header", None, {"HTTP_AUTHORIZATION": "Bearer"}),
    ("wrong scheme", None, {"HTTP_AUTHORIZATION": "Token abc123"}),
]:
    r = factory.get("/", **(headers or ({"HTTP_AUTHORIZATION": f"Bearer {token}"} if token else {})))
    try:
        auth.authenticate(r)
        check(name, False, "(no exception raised!)")
    except AuthInvalid as e:
        check(name, e.detail.code == "auth_invalid", f"code={e.detail.code}")

r = factory.get("/")
check("missing header returns None", auth.authenticate(r) is None)

print("== full DRF cycle (permission + exception handler) ==")


class PingView(APIView):
    def get(self, request):
        return Response({"ok": True, "user_id": str(request.user_id)})


view = PingView.as_view()
rf = RequestFactory()

resp = view(rf.get("/", HTTP_AUTHORIZATION=f"Bearer {mint(base_payload())}"))
check("valid -> 200 + user_id", resp.status_code == 200 and resp.data["user_id"] == str(USER_ID), f"got={resp.data}")

resp = view(rf.get("/", HTTP_AUTHORIZATION="Bearer bad.token.here"))
check("bad token -> 401 AUTH_INVALID", resp.status_code == 401 and resp.data.get("code") == "AUTH_INVALID", f"got={resp.data}")

resp = view(rf.get("/"))
check("no token -> 401 AUTH_INVALID", resp.status_code == 401 and resp.data.get("code") == "AUTH_INVALID", f"got={resp.data}")

print(f"\n{PASS} passed, {FAIL} failed")
sys.exit(1 if FAIL else 0)
