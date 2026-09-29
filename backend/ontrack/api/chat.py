"""Chat endpoint with retrieval-augmented context for OnTrack AI Assistant."""
import logging
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.throttles import GoalsBurstThrottle
from apps.goals.views import clean_text
from services.ai_coach import call_ai_coach
from services.retrieval import get_relevant_context

logger = logging.getLogger(__name__)

GENERIC_ASSISTANT_FALLBACK = (
    "I'm here to assist you with your tasks, answer questions, or check your integrations. "
    "Remember that you can set a tracker (Counter, Checklist, or Reflection) whenever you want to track progress!"
)


class ChatView(APIView):
    """POST /api/chat — Conversational AI Assistant endpoint with RAG context."""

    throttle_classes = [GoalsBurstThrottle]

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        raw_message = data.get("message") or data.get("prompt") or ""
        message = clean_text(raw_message, field="message", max_length=2000)

        goal_id = data.get("goal_id")
        user_id = getattr(request, "user_id", None) or getattr(request.user, "id", None)

        # Call retrieval.py BEFORE ai_coach — no try/except here; retrieval guarantees it never raises
        retrieved_context = get_relevant_context(
            user_id=user_id,
            current_message=message,
            goal_id=goal_id,
        )

        # Call the existing ai_coach service function with the retrieved context
        used_fallback = False
        try:
            ai_response = call_ai_coach(
                message=message,
                retrieved_context=retrieved_context,
            )
            if not isinstance(ai_response, str) or not ai_response.strip():
                raise ValueError("empty ai response")
            ai_response = ai_response.strip()[:5000]
        except Exception:
            logger.warning(
                "ai_coach.call_ai_coach failed; using generic fallback",
                exc_info=True,
            )
            ai_response = GENERIC_ASSISTANT_FALLBACK
            used_fallback = True

        return Response(
            {
                "reply": ai_response,
                "message": ai_response,
                "ai_response_text": ai_response,
                "retrieved_context": retrieved_context,
                "rag_active": len(retrieved_context) > 0,
                "ai_fallback_used": used_fallback,
            },
            status=status.HTTP_200_OK,
        )
