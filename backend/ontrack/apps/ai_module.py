"""Backend <-> AI bridge (Evans owns the contract; David owns the prompts).

Real client over any OpenAI-compatible chat API (stdlib urllib only, no extra
deps — the `openai` package is deliberately NOT required). Config comes from
Django settings (env vars, so Render + local .env both work):

- NVIDIA_BASE_URL  e.g. https://integrate.api.nvidia.com/v1 (or David's box)
- NVIDIA_MODEL_NAME e.g. nvidia/llama-3.1-nemotron-nano-8b-v1
- NVIDIA_API_KEY    nvapi-... key (never logged, never sent to frontend)

Contract (views validate everything; these RAISE on any failure and the
views fall back / degrade gracefully — AI failure must never block, and the
views must be able to tell real AI output from fallback via ai_fallback_used):
- parse_goal(goal_text) -> dict {goal_type, target, items, domain, deadline, summary}
  (items: list[str] for checklist only, [] otherwise — extracted upfront)
- generate_checkin(goal_id, goal_data, current_progress) -> str
  (On-demand only: POST /api/goals/:id/checkin calls this. No auto-triggers.)
- generate_verdict(goal_id, goal_data, final_progress) -> str
- text_to_speech(text) -> str (audio URL; TTS endpoint caches by text hash)
- speech_to_text(audio_file: bytes) -> str (transcript; one-shot, NOT cached)

NOTE: text_to_speech / speech_to_text are still provider stubs (NVIDIA Riva
NIM wiring is a separate step owned by David). The LLM trio above is live.
"""
import json
import logging
import re
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 20


def _llm_config():
    """Return (base_url, model, key) or raise (views turn this into fallback)."""
    base = (settings.NVIDIA_BASE_URL or "").rstrip("/")
    model = settings.NVIDIA_MODEL_NAME or ""
    key = settings.NVIDIA_API_KEY or ""
    if not base or not model or not key:
        raise RuntimeError("NVIDIA AI is not configured")
    return base, model, key


def _chat(messages, *, max_tokens=256, temperature=0.1):
    """POST one chat completion; return the assistant text or raise."""
    base, model, key = _llm_config()
    payload = json.dumps(
        {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        "%s/chat/completions" % base,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer %s" % key,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT_SECONDS) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception:
        # Log type only — never the prompt, key, or URL (URL may hold secrets).
        logger.warning("AI chat call failed", exc_info=True)
        raise RuntimeError("AI call failed")
    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise RuntimeError("AI returned malformed response")
    if not isinstance(content, str) or not content.strip():
        raise RuntimeError("AI returned empty response")
    return content.strip()


def _clean_json_response(raw_text):
    """Extract the JSON object even if wrapped in fences or prose (David)."""
    text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    match_obj = re.search(r"(\{.*\})", text, re.DOTALL)
    if match_obj:
        return match_obj.group(1).strip()
    return text


def parse_goal(goal_text):
    """Parse goal_text into structured JSON dictionary for OnTrack trackers."""
    if not isinstance(goal_text, str) or not goal_text.strip():
        raise ValueError("goal_text must be a non-empty string")
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
    content = _chat(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": goal_text.strip()[:500]},
        ],
        max_tokens=300,
        temperature=0.1,
    )
    try:
        parsed = json.loads(_clean_json_response(content))
    except ValueError:
        raise RuntimeError("parse_goal: model did not return JSON")
    if not isinstance(parsed, dict):
        raise RuntimeError("parse_goal: model did not return an object")

    # Normalize (David) — views re-validate via coerce_parse_result as well.
    goal_type = parsed.get("goal_type")
    if goal_type not in ("counter", "checklist", "manual"):
        goal_type = "manual"
    target = parsed.get("target")
    if not isinstance(target, int) or isinstance(target, bool) or target < 0:
        target = None
    items = parsed.get("items")
    if not isinstance(items, list):
        items = []
    items = [str(it).strip() for it in items if str(it).strip()][:20]
    domain = str(parsed.get("domain") or "general")[:100]
    deadline = parsed.get("deadline")
    if not isinstance(deadline, str):
        deadline = None
    summary = str(parsed.get("summary") or "")[:500]
    return {
        "goal_type": goal_type,
        "target": target,
        "items": items,
        "domain": domain,
        "deadline": deadline,
        "summary": summary,
    }


def generate_checkin(goal_id, goal_data, current_progress):
    """Generate 1 statement + 1 question check-in message."""
    goal_data = goal_data if isinstance(goal_data, dict) else {}
    title = goal_data.get("title") or "your goal"
    target = goal_data.get("target")
    target_str = " of %s" % target if target else ""
    content = _chat(
        [
            {"role": "system", "content": "You are OnTrack high-accountability coach."},
            {
                "role": "user",
                "content": (
                    "Goal: '%s'. Current progress: %s%s.\n"
                    "Generate an encouraging accountability check-in message.\n"
                    "Constraint: Exactly 1 statement followed by 1 question. "
                    "Maximum 2 sentences total." % (title, current_progress, target_str)
                ),
            },
        ],
        max_tokens=100,
        temperature=0.7,
    )
    return content[:5000]


def generate_verdict(goal_id, goal_data, final_progress):
    """Generate a final verdict summary (max 2 sentences)."""
    goal_data = goal_data if isinstance(goal_data, dict) else {}
    title = goal_data.get("title") or "your goal"
    target = goal_data.get("target")
    target_str = " (target: %s)" % target if target else ""
    content = _chat(
        [
            {"role": "system", "content": "You are OnTrack evaluation coach."},
            {
                "role": "user",
                "content": (
                    "Goal: '%s'%s. Final progress recorded: %s.\n"
                    "Generate a brief final verdict evaluating performance.\n"
                    "Constraint: Maximum 2 sentences." % (title, target_str, final_progress)
                ),
            },
        ],
        max_tokens=120,
        temperature=0.5,
    )
    return content[:5000]


def text_to_speech(text):
    """Returns audio URL for TTS reading (Riva wiring pending — David)."""
    logger.info("ai_module.text_to_speech called for text length %d", len(text))
    return "https://storage.ontrack.app/audio/stub.mp3"


def speech_to_text(audio_file):
    """Transcribes audio bytes to text (Riva wiring pending — David)."""
    logger.info("ai_module.speech_to_text called for %d bytes", len(audio_file))
    return "Goal progress updated via voice input."
