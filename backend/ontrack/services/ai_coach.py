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
    max_tokens: int = 256,
    temperature: float = 0.7,
) -> str:
    """Send message to Nemotron AI Coach with optional retrieved context.

    If retrieved_context is non-empty, it prepends the history to the prompt.
    If retrieved_context is empty/None, it functions without added context.
    """
    if retrieved_context is None:
        retrieved_context = []

    system_prompt = (
        "You are OnTrack AI Assistant. You help the user stay productive, answer questions accurately, "
        "and track progress on their goals. You can discuss coding, architecture, strategy, and general topics. "
        "Remember that the user can set trackers in OnTrack at any time: Counter trackers (for numerical habits like pushups or sales), "
        "Checklist trackers (for step-by-step milestones or projects), and Daily Reflection trackers (for journaling and mindset). "
        "When appropriate, remind or suggest to the user that they can set a tracker for their targets. "
        "Be concise, direct, helpful, and constructive."
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

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

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
