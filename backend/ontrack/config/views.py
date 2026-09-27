"""Unauthenticated system views: /api/health (public) and /api/debug
(X-Debug-Key header, never JWT)."""
import hmac
import time

from django.conf import settings
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.goals.models import AudioCache, CheckIn, Goal
from apps.goals.serializers import GoalSerializer

START_MONOTONIC = time.monotonic()


class HasDebugKey(BasePermission):
    message = "invalid debug key"

    def has_permission(self, request, view):
        expected = settings.DEBUG_ACCESS_KEY
        if not expected:
            return False  # Fail closed when no key is configured.
        provided = request.headers.get("X-Debug-Key", "")
        return hmac.compare_digest(provided, expected)


class HealthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"status": "ok", "instance": settings.INSTANCE_NAME})


class DebugView(APIView):
    permission_classes = [HasDebugKey]
    authentication_classes = []

    def get(self, request):
        goals = Goal.objects.order_by("-start_at")[:5]
        checkins = CheckIn.objects.select_related("goal").order_by("-checked_in_at")[:5]
        audio_rows = AudioCache.objects.order_by("-created_at")[:5]
        return Response(
            {
                "instance": settings.INSTANCE_NAME,
                "uptime_seconds": round(time.monotonic() - START_MONOTONIC, 1),
                "recent_goals": GoalSerializer(goals, many=True).data,
                "recent_checkins": [
                    {
                        "id": str(c.id),
                        "goal_id": str(c.goal_id),
                        "ai_message": c.ai_message,
                        "checked_in_at": c.checked_in_at,
                    }
                    for c in checkins
                ],
                "recent_audio_cache": [
                    {
                        "text_hash": a.text_hash[:16],
                        "has_audio": bool(a.audio_url),
                        "has_transcript": bool(a.transcript),
                        "created_at": a.created_at,
                    }
                    for a in audio_rows
                ],
            }
        )
