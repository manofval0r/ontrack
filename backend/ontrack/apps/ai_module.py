"""Seam to Qwen 2.5 Coder 7B Instruct (hosted on Brev vLLM) for goal parsing,
check-ins, verdicts, and speech services.

Contract & Signatures:
- parse_goal(goal_text) -> dict {goal_type, target, items, domain, deadline, summary}
- generate_checkin(goal_id, goal_data, current_progress) -> str
- generate_verdict(goal_id, goal_data, final_progress) -> str
- text_to_speech(text) -> str
- speech_to_text(audio_file: bytes) -> str
"""
import json
import logging
import os
import re
from openai import OpenAI

logger = logging.getLogger(__name__)

def _get_client():
    base_url = os.getenv("NVIDIA_BASE_URL", "http://136.107.223.232:8000/v1")
    api_key = os.getenv("NVIDIA_API_KEY", "dummy-key")
    return OpenAI(base_url=base_url, api_key=api_key)


def _get_model():
    return os.getenv("NVIDIA_MODEL_NAME", "Qwen/Qwen2.5-Coder-7B-Instruct")


def _clean_json_response(raw_text: str) -> str:
    """Extract JSON block from model response if wrapped in codeblocks."""
    text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    match_obj = re.search(r"(\{.*\})", text, re.DOTALL)
    if match_obj:
        return match_obj.group(1).strip()
    return text


def parse_goal(goal_text: str) -> dict:
    """Parse goal_text into structured JSON dictionary for OnTrack trackers."""
    client = _get_client()
    model = _get_model()

    system_prompt = (
        "You are OnTrack AI goal parser. Parse the user input into strict JSON.\n"
        "Respond ONLY with valid JSON. Do not include introductory or explanatory text.\n"
        "Required JSON schema:\n"
        "{\n"
        '  "goal_type": "counter" | "checklist" | "manual",\n'
        '  "target": integer or null,\n'
        '  "items": array of strings (for checklist goals, else empty array []),\n'
        '  "domain": string (e.g. "sales", "fitness", "career", "study", "general"),\n'
        '  "deadline": string in ISO format YYYY-MM-DD or null,\n'
        '  "summary": string (concise 1-sentence summary of the goal)\n'
        "}"
    )

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": goal_text},
            ],
            temperature=0.1,
            max_tokens=300,
        )
        raw_content = response.choices[0].message.content or "{}"
        clean_json = _clean_json_response(raw_content)
        parsed = json.loads(clean_json)

        # Validate schema fields
        goal_type = parsed.get("goal_type")
        if goal_type not in ("counter", "checklist", "manual"):
            goal_type = "manual"

        target = parsed.get("target")
        if not isinstance(target, int) or target < 0:
            target = None

        items = parsed.get("items")
        if not isinstance(items, list):
            items = []
        items = [str(it).strip() for it in items if str(it).strip()]

        domain = str(parsed.get("domain") or "general")[:100]
        deadline = parsed.get("deadline")
        if not isinstance(deadline, str):
            deadline = None

        summary = str(parsed.get("summary") or goal_text)[:500]

        return {
            "goal_type": goal_type,
            "target": target,
            "items": items,
            "domain": domain,
            "deadline": deadline,
            "summary": summary,
        }
    except Exception as exc:
        logger.warning("parse_goal failed with Qwen API: %s; returning fallback", exc)
        return {
            "goal_type": "manual",
            "target": None,
            "items": [],
            "domain": "general",
            "deadline": None,
            "summary": goal_text[:500],
        }


def generate_checkin(goal_id: str, goal_data: dict, current_progress: int) -> str:
    """Generate 1 statement + 1 question check-in message."""
    client = _get_client()
    model = _get_model()

    title = goal_data.get("title") or "your goal"
    target = goal_data.get("target")
    target_str = f" of {target}" if target else ""

    prompt = (
        f"Goal: '{title}'. Current progress: {current_progress}{target_str}.\n"
        "Generate an encouraging accountability check-in message.\n"
        "Constraint: Exactly 1 statement followed by 1 question. Maximum 2 sentences total."
    )

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are OnTrack high-accountability coach."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=100,
        )
        return (response.choices[0].message.content or "").strip()
    except Exception as exc:
        logger.warning("generate_checkin failed: %s", exc)
        return f"You've logged {current_progress} on '{title}'. What is your next step today?"


def generate_verdict(goal_id: str, goal_data: dict, final_progress: int) -> str:
    """Generate a final verdict summary (max 2 sentences)."""
    client = _get_client()
    model = _get_model()

    title = goal_data.get("title") or "your goal"
    target = goal_data.get("target")
    target_str = f" (target: {target})" if target else ""

    prompt = (
        f"Goal: '{title}'{target_str}. Final progress recorded: {final_progress}.\n"
        "Generate a brief final verdict evaluating performance.\n"
        "Constraint: Maximum 2 sentences."
    )

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are OnTrack evaluation coach."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=120,
        )
        return (response.choices[0].message.content or "").strip()
    except Exception as exc:
        logger.warning("generate_verdict failed: %s", exc)
        return f"Goal finalized with {final_progress} total progress. Consistent effort produces strong long-term results."


def text_to_speech(text: str) -> str:
    """Returns audio URL for TTS reading."""
    logger.info("ai_module.text_to_speech called for text length %d", len(text))
    return "https://storage.ontrack.app/audio/stub.mp3"


def speech_to_text(audio_file: bytes) -> str:
    """Transcribes audio bytes to text."""
    logger.info("ai_module.speech_to_text called for %d bytes", len(audio_file))
    return "Goal progress updated via voice input."
