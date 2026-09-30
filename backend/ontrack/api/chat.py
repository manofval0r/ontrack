"""Chat endpoint with retrieval-augmented context for OnTrack AI Assistant."""
import logging
import re
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.throttles import GoalsBurstThrottle
from apps.goals.models import Goal
from apps.goals.views import clean_text, parse_goal_safely
from services.ai_coach import call_ai_coach
from services.retrieval import get_relevant_context

logger = logging.getLogger(__name__)

GENERIC_ASSISTANT_FALLBACK = (
    "I'm here to assist you with your tasks, answer questions, or check your integrations. "
    "If there's an area you'd like to make progress in (like fitness, reading, or coding), "
    "should I draft a plan and make it a goal you can commit to?"
)

FITNESS_FALLBACK = (
    "Being fit provides massive physical vitality, sharper mental focus, better sleep quality, and long-term resilience. "
    "Consistent physical activity also boosts dopamine and lowers stress, making daily challenges easier to conquer.\n\n"
    "Putting this into practice with a steady routine (like 3–4 sessions a week) turns fitness into a permanent habit. "
    "Should I draft a plan and make it a goal you can commit to?"
)

TOPIC_KEYWORDS = [
    ("fitness", ("fit", "fitness", "workout", "gym", "exercise", "pushup", "run", "running", "squat", "cardio", "health")),
    ("study", ("study", "reading", "book", "read", "learn", "course", "exam", "research")),
    ("coding", ("code", "coding", "python", "javascript", "developer", "software", "github", "bug", "repo")),
    ("sales", ("sale", "sales", "deal", "close deals", "client", "quota", "revenue")),
    ("mindset", ("meditat", "mindful", "journal", "reflect", "gratitude", "sleep", "routine", "morning routine")),
]


def _extract_trackable_topic(message: str, history: list[dict] = None) -> str | None:
    """Infer the trackable topic (e.g. fitness, study) from message or recent history."""
    all_texts = [message or ""]
    if history:
        for turn in reversed(history[-4:]):
            if isinstance(turn, dict) and turn.get("content"):
                all_texts.append(str(turn.get("content")))

    combined = " ".join(all_texts).lower()
    for topic, words in TOPIC_KEYWORDS:
        if any(w in combined for w in words):
            return topic
    return None


def _is_plan_confirmation(message: str) -> bool:
    """Detect if the user is confirming or requesting to draft a plan / goal."""
    msg = message.strip().lower()
    if re.search(r"^(yes|sure|yep|yeah|draft a plan|make it a goal|let'?s do it|yes please|please do|create (the|a) goal|go ahead|sounds good|i'?d love that|draft it|yes draft|set it up|make it a goal you can commit to)\b", msg):
        return True
    if "draft a plan" in msg or "make it a goal" in msg:
        return True
    return False


class ChatView(APIView):
    """POST /api/chat — Conversational AI Assistant endpoint with RAG context and proactive goal drafting."""

    throttle_classes = [GoalsBurstThrottle]

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        raw_message = data.get("message") or data.get("prompt") or ""
        message = clean_text(raw_message, field="message", max_length=2000)

        goal_id = data.get("goal_id")
        user_id = getattr(request, "user_id", None) or getattr(request.user, "id", None)
        raw_history = data.get("history") or data.get("conversation_history") or []
        conversation_history = [
            turn for turn in raw_history if isinstance(turn, dict) and turn.get("content")
        ][-8:]

        # Call retrieval.py BEFORE ai_coach — no try/except here; retrieval guarantees it never raises
        retrieved_context = get_relevant_context(
            user_id=user_id,
            current_message=message,
            goal_id=goal_id,
        )

        # Check if the user is confirming an AI suggestion to draft a plan or asking to make it a goal
        topic = _extract_trackable_topic(message, conversation_history)
        has_prior_suggestion = any(
            isinstance(t, dict) and ("draft a plan" in str(t.get("content", "")).lower() or "make it a goal" in str(t.get("content", "")).lower())
            for t in conversation_history
        )
        wants_plan_draft = data.get("draft_goal") or (_is_plan_confirmation(message) and (has_prior_suggestion or topic is not None))

        if wants_plan_draft:
            topic_label = topic or "wellness and productivity"
            draft_prompt = f"Plan for {topic_label}: 3 weekly sessions" if topic == "fitness" else f"Goal plan for {topic_label}"
            goal_type, target, items, domain, deadline, summary, goal_template, used_fb = parse_goal_safely(draft_prompt)

            # Build a crisp, actionable proposal
            proposal = {
                "title": summary or f"{topic_label.capitalize()} Commitment Plan",
                "goal_type": goal_type if goal_type != Goal.GOAL_TYPE_MANUAL else Goal.GOAL_TYPE_COUNTER,
                "goal_template": goal_template,
                "target": target if target is not None else (3 if goal_type == Goal.GOAL_TYPE_COUNTER or goal_type == Goal.GOAL_TYPE_MANUAL else 4),
                "items": items if items else (["Week 1: Build momentum", "Week 2: Deepen routine", "Week 3: Consistency check", "Week 4: Review milestone"] if goal_type == Goal.GOAL_TYPE_CHECKLIST else []),
                "domain": domain or (topic if topic in ("fitness", "sales", "learning") else "general"),
                "deadline": deadline.date().isoformat() if hasattr(deadline, "date") and deadline else None,
                "summary": summary or f"A structured plan to achieve consistency in {topic_label}.",
            }

            reply_text = (
                f"I've drafted a structured plan for your {topic_label} goal! "
                f"I configured it as a {proposal['goal_type']} tracker with a target of {proposal['target']}. "
                "Review the proposal card below and click 'Activate Tracker' to start tracking your progress."
            )

            return Response(
                {
                    "reply": reply_text,
                    "message": reply_text,
                    "ai_response_text": reply_text,
                    "goal_proposal": proposal,
                    "is_goal": True,
                    "retrieved_context": retrieved_context,
                    "rag_active": len(retrieved_context) > 0,
                    "ai_fallback_used": False,
                },
                status=status.HTTP_200_OK,
            )

        # Call the existing ai_coach service function with the retrieved context and history
        used_fallback = False
        try:
            ai_response = call_ai_coach(
                message=message,
                retrieved_context=retrieved_context,
                conversation_history=conversation_history,
            )
            if not isinstance(ai_response, str) or not ai_response.strip():
                raise ValueError("empty ai response")
            ai_response = ai_response.strip()[:5000]
        except Exception:
            logger.warning(
                "ai_coach.call_ai_coach failed; using generic fallback",
                exc_info=True,
            )
            if topic == "fitness" or "fit" in message.lower():
                ai_response = FITNESS_FALLBACK
            else:
                ai_response = GENERIC_ASSISTANT_FALLBACK
            used_fallback = True

        # Check if the AI suggested drafting a plan/goal so the frontend can offer an interactive action chip
        suggested_goal_prompt = None
        lower_resp = ai_response.lower()
        if any(phrase in lower_resp for phrase in ("draft a plan", "make it a goal", "goal you can commit to", "set a tracker")):
            inferred_topic = topic or "your goal"
            suggested_goal_prompt = f"Draft a plan and make it a goal you can commit to for {inferred_topic}"

        return Response(
            {
                "reply": ai_response,
                "message": ai_response,
                "ai_response_text": ai_response,
                "retrieved_context": retrieved_context,
                "rag_active": len(retrieved_context) > 0,
                "ai_fallback_used": used_fallback,
                "suggested_goal_prompt": suggested_goal_prompt,
                "suggested_topic": topic,
            },
            status=status.HTTP_200_OK,
        )

