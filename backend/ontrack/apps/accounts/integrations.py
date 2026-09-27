"""Third-party integrations: credential vault + server-side proxies.

- GET/POST /api/integrations, DELETE /api/integrations/:id — per-user
  credential rows. Access tokens are NEVER returned to clients.
- POST /api/integrations/slack/notify — post via the stored Slack webhook
  (server-side so browser CORS is a non-issue).
- POST /api/integrations/notion/export — create a goal-verdict page via the
  stored Notion token (server-side for the same CORS reason).

All failures degrade to {"error","code"} — never 500, never a leak.
"""
import json
import logging
import urllib.request

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import Integration
from apps.goals.models import Goal
from apps.goals.views import clean_text
from config.exceptions import ApiError

logger = logging.getLogger(__name__)

PROVIDERS = {c[0] for c in Integration.PROVIDER_CHOICES}
PROXY_TIMEOUT_SECONDS = 10


def serialize(row):
    meta = row.meta if isinstance(row.meta, dict) else {}
    if row.provider == Integration.PROVIDER_GITHUB:
        label = "Connected as %s" % meta.get("login", "GitHub") if row.connected else "Not connected"
    elif row.provider == Integration.PROVIDER_GOOGLE_CAL:
        label = "Calendar sync on" if row.connected else "Not connected"
    elif row.provider == Integration.PROVIDER_SLACK:
        label = "Posting to %s" % meta.get("channel", "webhook") if row.connected else "Not connected"
    elif row.provider == Integration.PROVIDER_NOTION:
        label = "Exporting to Notion DB" if row.connected else "Not connected"
    else:
        label = "Connected" if row.connected else "Not connected"
    return {
        "id": str(row.id),
        "provider": row.provider,
        "connected": row.connected,
        "status_label": label,
        "updated_at": row.updated_at,
    }


def _post_json(url, payload, headers, timeout=PROXY_TIMEOUT_SECONDS):
    """Server-side POST helper for Slack/Notion (no CORS in play)."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
            try:
                body = json.loads(raw) if raw.strip() else {}
            except ValueError:
                body = {"text": raw}  # e.g. Slack answers plain "ok"
            return resp.status, body
    except Exception:
        logger.warning("Integration proxy call failed", exc_info=True)
        raise ApiError("integration provider unreachable", "INTEGRATION_ERROR", 502)


class IntegrationListCreateView(APIView):
    def get(self, request):
        rows = Integration.objects.filter(user_id=request.user_id).order_by("provider")
        return Response([serialize(r) for r in rows])

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        provider = data.get("provider")
        if provider not in PROVIDERS:
            raise ApiError(
                "provider must be one of %s" % sorted(PROVIDERS), "VALIDATION_ERROR"
            )
        token = data.get("access_token", "")
        if token is None:
            token = ""
        if not isinstance(token, str):
            raise ApiError("access_token must be a string", "VALIDATION_ERROR")
        meta = data.get("meta", {})
        if meta is None:
            meta = {}
        if not isinstance(meta, dict):
            raise ApiError("meta must be an object", "VALIDATION_ERROR")
        row, _ = Integration.objects.update_or_create(
            user_id=request.user_id,
            provider=provider,
            defaults={"access_token": token[:4000], "meta": meta, "connected": True},
        )
        return Response(serialize(row), status=status.HTTP_201_CREATED)


class IntegrationDetailView(APIView):
    def delete(self, request, integration_id):
        row = get_object_or_404(
            Integration, pk=integration_id, user_id=request.user_id
        )
        rid = str(row.id)
        row.delete()
        return Response({"message": "Integration disconnected.", "id": rid})


class SlackNotifyView(APIView):
    """POST /api/integrations/slack/notify {text?} — via stored webhook."""

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        row = Integration.objects.filter(
            user_id=request.user_id,
            provider=Integration.PROVIDER_SLACK,
            connected=True,
        ).first()
        if row is None:
            raise ApiError("slack is not connected", "NOT_FOUND", 404)
        webhook = (row.meta if isinstance(row.meta, dict) else {}).get("webhook_url", "")
        if not isinstance(webhook, str) or not webhook.startswith("https://"):
            raise ApiError("slack webhook_url is not configured", "VALIDATION_ERROR")
        text = data.get("text") or "OnTrack check-in: stay on pace — consistency beats intensity."
        if not isinstance(text, str):
            raise ApiError("text must be a string", "VALIDATION_ERROR")
        code, _ = _post_json(
            webhook,
            {"text": clean_text(text, field="text", max_length=2000)},
            {"Content-Type": "application/json"},
        )
        if code not in (200, 201, 204):
            raise ApiError("slack rejected the message", "INTEGRATION_ERROR", 502)
        return Response({"ok": True})


class NotionExportView(APIView):
    """POST /api/integrations/notion/export {goal_id} — verdict page."""

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        if not data.get("goal_id"):
            raise ApiError("goal_id is required", "VALIDATION_ERROR")
        row = Integration.objects.filter(
            user_id=request.user_id,
            provider=Integration.PROVIDER_NOTION,
            connected=True,
        ).first()
        if row is None:
            raise ApiError("notion is not connected", "NOT_FOUND", 404)
        meta = row.meta if isinstance(row.meta, dict) else {}
        api_token = meta.get("api_token", "")
        database_id = meta.get("database_id", "")
        if not isinstance(api_token, str) or not api_token:
            raise ApiError("notion api_token is not configured", "VALIDATION_ERROR")
        if not isinstance(database_id, str) or not database_id:
            raise ApiError("notion database_id is not configured", "VALIDATION_ERROR")
        goal = get_object_or_404(Goal, pk=data.get("goal_id"), user_id=request.user_id)
        verdict = goal.verdict or "No verdict yet."
        code, body = _post_json(
            "https://api.notion.com/v1/pages",
            {
                "parent": {"database_id": database_id},
                "properties": {
                    "title": [{"text": {"content": goal.title[:100]}}],
                },
                "children": [
                    {
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [{"text": {"content": verdict[:2000]}}]
                        },
                    }
                ],
            },
            {
                "Content-Type": "application/json",
                "Authorization": "Bearer %s" % api_token,
                "Notion-Version": "2022-06-28",
            },
        )
        if code not in (200, 201):
            raise ApiError("notion rejected the export", "INTEGRATION_ERROR", 502)
        page_id = body.get("id", "") if isinstance(body, dict) else ""
        return Response({"ok": True, "page_id": page_id}, status=status.HTTP_201_CREATED)
