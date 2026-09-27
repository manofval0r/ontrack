"""Shims for the frontend contract (backendendpoint.md): auth/me + settings.

Stateless by design — no new tables in the 11h window. Settings are
sensible defaults; PUT echoes back a merged object so the settings UI can
link today and persist for real later.
"""
from rest_framework.response import Response
from rest_framework.views import APIView

from config.exceptions import ApiError


DEFAULT_SETTINGS = {
    "profile": {
        "name": "",
        "email": "",
        "accountability_persona": "Nemotron High-Accountability Coach",
        "timezone": "UTC",
    },
    "audio": {
        "voice_type": "nemotron-direct",
        "voice_speed": 1.0,
        "tts_enabled": True,
        "asr_enabled": True,
    },
    "notifications": {
        "master_enabled": True,
        "goal_reminders": True,
        "check_ins": True,
        "goal_updates": True,
        "streak_alerts": True,
        "sound_enabled": True,
    },
    "integrations": [],
}


class AuthMeView(APIView):
    def get(self, request):
        # JWT carries only sub (UUID); email/name live in Supabase, not Django.
        return Response(
            {
                "user_id": str(request.user_id),
                "email": None,
                "name": None,
                "accountability_persona": "Nemotron High-Accountability Coach",
                "timezone": "UTC",
            }
        )


class SettingsView(APIView):
    def get(self, request):
        payload = {k: (dict(v) if isinstance(v, dict) else list(v)) for k, v in DEFAULT_SETTINGS.items()}
        payload["profile"] = dict(payload["profile"])
        payload["profile"]["user_id"] = str(request.user_id)
        payload["integrations"] = [_github_integration(request.user_id)]
        return Response(payload)

    def put(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        if not data:
            raise ApiError("no settings fields provided", "VALIDATION_ERROR")
        merged = {k: (dict(v) if isinstance(v, dict) else list(v)) for k, v in DEFAULT_SETTINGS.items()}
        for section in ("profile", "audio", "notifications"):
            if isinstance(data.get(section), dict):
                merged[section].update(data[section])
        if "integrations" in data and isinstance(data["integrations"], list):
            merged["integrations"] = data["integrations"]
        else:
            merged["integrations"] = [_github_integration(request.user_id)]
        merged["profile"]["user_id"] = str(request.user_id)
        return Response(merged)


def _github_integration(user_id):
    """GitHub connect stub: {connected, repo, branch}.

    Reads the per-user github Integration row when present (repo/branch
    from its meta, falling back to stub defaults); otherwise disconnected.
    Any DB hiccup degrades to the disconnected stub — never 500, never
    leaks tokens.
    """
    from django.db import DatabaseError

    from apps.accounts.models import Integration

    try:
        row = Integration.objects.filter(
            user_id=user_id, provider=Integration.PROVIDER_GITHUB
        ).first()
    except DatabaseError:
        row = None
    if row is not None and row.connected:
        meta = row.meta if isinstance(row.meta, dict) else {}
        repo = meta.get("repo") or meta.get("login") or "ontrack"
        branch = meta.get("branch") or "main"
        return {
            "id": "github",
            "name": "GitHub",
            "connected": True,
            "repo": repo,
            "branch": branch,
            "status_label": "Connected to %s (%s)" % (repo, branch),
        }
    return {
        "id": "github",
        "name": "GitHub",
        "connected": False,
        "repo": None,
        "branch": "main",
        "status_label": "Not connected",
    }
