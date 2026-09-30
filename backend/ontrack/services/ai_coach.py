"""AI Coach service interfacing with NVIDIA Nemotron.

Accepts optional retrieved_context to ground responses in user's history.
"""
import logging
from apps.ai_module import _chat, _llm_config

logger = logging.getLogger(__name__)


def call_ai_coach(
    message: str,
    goal_data: dict | None = None,
    retrieved_context: list[str] = None,
    conversation_history: list[dict] = None,
    max_tokens: int = 500,
    temperature: float = 0.7,
) -> str:
    """Send message to Nemotron AI Coach with optional retrieved context and history.

    If retrieved_context is non-empty, it prepends the history to the prompt.
    If conversation_history is provided, it incorporates previous dialogue turns.
    """
    if retrieved_context is None:
        retrieved_context = []
    if conversation_history is None:
        conversation_history = []

    system_prompt = (
        "You are OnTrack AI Assistant, an elite accountability and habit coach. "
        "You help users stay productive, achieve ambitious targets, build consistent habits, and track their progress.\n\n"
        "CORE CAPABILITIES & TRACKER TYPES:\n"
        "OnTrack supports three tracker types:\n"
        "- Counter trackers: for numerical habits and volume targets (e.g. pushups, workout sessions, sales calls, running miles, water intake).\n"
        "- Checklist trackers: for structured step-by-step milestones, sprints, or projects (e.g. 4-week fitness starter plan, study modules, feature shipping).\n"
        "- Daily Reflection trackers: for journaling, mindset, gratitude, and evening reviews.\n\n"
        "INFORMAL GOAL & TRACKER CONVERSION GUIDELINE:\n"
        "Users frequently ask questions or talk informally about topics that have natural tracking potential "
        "(for example: 'what are the advantages of being fit', 'how do I learn Python faster', 'why should I wake up early', 'tips to close more sales', 'how to read more books').\n"
        "When a user asks about or discusses an aspirational, wellness, learning, productivity, or habit topic:\n"
        "1. Give a thorough, inspiring, and high-value answer addressing their query directly.\n"
        "2. Connect the topic to actionable daily execution and highlight how tracking it drives real results.\n"
        "3. Actively suggest setting it up as a goal/tracker in OnTrack by asking:\n"
        "   'Should I draft a plan and make it a goal you can commit to?' or\n"
        "   'Would you like me to draft a plan and make it a goal you can commit to?'\n\n"
        "If the user agrees (e.g., saying 'yes', 'sure', 'draft a plan', 'let's do it', 'make it a goal'):\n"
        "Lay out a crisp, actionable draft plan with clear targets, cadence, and format, and invite them to launch the tracker!"
    )

    clean_message = str(message or "").strip()

    if retrieved_context:
        history_lines = "\n".join(f"- {item}" for item in retrieved_context if item.strip())
        user_prompt = (
            f"Relevant history for this user:\n{history_lines}\n\n"
            f"Now respond to their message: {clean_message}"
        )
    else:
        user_prompt = clean_message

    messages = [{"role": "system", "content": system_prompt}]

    # Include sanitized previous dialogue turns if provided
    for turn in conversation_history[-6:]:
        if isinstance(turn, dict) and turn.get("content"):
            role = "assistant" if turn.get("role") in ("assistant", "ai") else "user"
            messages.append({"role": role, "content": str(turn.get("content"))[:2000]})

    messages.append({"role": "user", "content": user_prompt})

    return _chat(messages, max_tokens=max_tokens, temperature=temperature)



def generate_checkin(
    goal_id,
    goal_data,
    current_progress,
    retrieved_context: list[str] = None,
) -> str:
    """Generate check-in message grounded in optional retrieved history."""
    if retrieved_context is None:
        retrieved_context = []

    goal_data = goal_data if isinstance(goal_data, dict) else {}
    title = goal_data.get("title") or "your goal"
    target = goal_data.get("target")
    target_str = f" of {target}" if target else ""

    base_prompt = (
        f"Goal: '{title}'. Current progress: {current_progress}{target_str}.\n"
        "Generate an encouraging accountability check-in message.\n"
        "Constraint: Exactly 1 statement followed by 1 question. Maximum 2 sentences total."
    )

    if retrieved_context:
        history_lines = "\n".join(f"- {item}" for item in retrieved_context if item.strip())
        user_prompt = (
            f"Relevant history for this user:\n{history_lines}\n\n"
            f"Now respond to their message: {base_prompt}"
        )
    else:
        user_prompt = base_prompt

    messages = [
        {"role": "system", "content": "You are OnTrack AI Assistant."},
        {"role": "user", "content": user_prompt},
    ]

    return _chat(messages, max_tokens=100, temperature=0.7)[:5000]


def generate_verdict(
    goal_id,
    goal_data,
    final_progress,
    retrieved_context: list[str] = None,
) -> str:
    """Generate final verdict grounded in optional retrieved history."""
    if retrieved_context is None:
        retrieved_context = []

    goal_data = goal_data if isinstance(goal_data, dict) else {}
    title = goal_data.get("title") or "your goal"
    target = goal_data.get("target")
    target_str = f" (target: {target})" if target else ""

    base_prompt = (
        f"Goal: '{title}'{target_str}. Final progress recorded: {final_progress}.\n"
        "Generate a brief final verdict evaluating performance.\n"
        "Constraint: Maximum 2 sentences."
    )

    if retrieved_context:
        history_lines = "\n".join(f"- {item}" for item in retrieved_context if item.strip())
        user_prompt = (
            f"Relevant history for this user:\n{history_lines}\n\n"
            f"Now respond to their message: {base_prompt}"
        )
    else:
        user_prompt = base_prompt

    messages = [
        {"role": "system", "content": "You are OnTrack AI Assistant."},
        {"role": "user", "content": user_prompt},
    ]

    return _chat(messages, max_tokens=120, temperature=0.5)[:5000]
