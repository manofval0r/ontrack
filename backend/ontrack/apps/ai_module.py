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
- parse_goal(goal_text) -> dict {goal_type, target, items, domain, deadline,
  summary, goal_template} (items: list[str] for checklist only, [] otherwise
  — extracted upfront; goal_template is a LOCAL keyword rule, not an LLM
  redesign — it only selects tracker copy/icons)
- generate_checkin(goal_id, goal_data, current_progress) -> str
  (On-demand only: POST /api/goals/:id/checkin calls this. No auto-triggers.)
- generate_verdict(goal_id, goal_data, final_progress) -> str
- text_to_speech(text) -> str (audio URL; TTS endpoint caches by text hash)
- speech_to_text(audio_file: bytes) -> str (transcript; one-shot, NOT cached)

Voice goes to real Riva/NIM OpenAI-compatible audio endpoints off the same
NVIDIA_BASE_URL + NVIDIA_API_KEY ({base}/audio/speech,
{base}/audio/transcriptions). Any failure raises and views map it to 503 —
no fixed-string stub, so ASR always echoes the actual audio bytes.
"""
import json
import logging
import re
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 20
AUDIO_TIMEOUT_SECONDS = 25

# Canonical tracker templates. The LLM is NOT redesigned per goal —
# parse_goal() picks one of these with local keyword rules only; the
# frontend uses it to select tracker copy/icons.
GOAL_TEMPLATE_SALES_COUNTER = "sales_counter"
GOAL_TEMPLATE_FITNESS_COUNTER = "fitness_counter"
GOAL_TEMPLATE_GITHUB_CHECKLIST = "github_checklist"
GOAL_TEMPLATE_STUDY_CHECKLIST = "study_checklist"
GOAL_TEMPLATE_REFLECTION_MANUAL = "reflection_manual"
GOAL_TEMPLATE_GENERIC = "generic"
GOAL_TEMPLATES = frozenset(
    {
        GOAL_TEMPLATE_SALES_COUNTER,
        GOAL_TEMPLATE_FITNESS_COUNTER,
        GOAL_TEMPLATE_GITHUB_CHECKLIST,
        GOAL_TEMPLATE_STUDY_CHECKLIST,
        GOAL_TEMPLATE_REFLECTION_MANUAL,
        GOAL_TEMPLATE_GENERIC,
    }
)

# Keyword rules (checked in this order — first match wins).
_TEMPLATE_KEYWORDS = (
    (GOAL_TEMPLATE_GITHUB_CHECKLIST, ("ship", "task", "repo", "commit", "pr", "merge", "issue", "github")),
    (GOAL_TEMPLATE_STUDY_CHECKLIST, ("book", "read", "study", "learn", "course", "exam")),
    (GOAL_TEMPLATE_FITNESS_COUNTER, ("pushup", "push-up", "push up", "run", "workout", "gym", "fitness", "squat", "mile", "km", "exercise", "swim", "lift")),
    (GOAL_TEMPLATE_SALES_COUNTER, ("deal", "car", "sell", "sale", "client", "close", "revenue", "quota")),
    (GOAL_TEMPLATE_REFLECTION_MANUAL, ("reflect", "journal", "meditat", "mood", "gratitude", "reflection")),
)


def infer_goal_template(text):
    """Local keyword rule -> one of GOAL_TEMPLATES. Never raises."""
    lowered = str(text or "").lower()
    for template, keywords in _TEMPLATE_KEYWORDS:
        for kw in keywords:
            if kw and kw in lowered:
                return template
    return GOAL_TEMPLATE_GENERIC


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
    template = parsed.get("goal_template")
    if template not in GOAL_TEMPLATES:
        # Local keyword rule on the raw input — not an LLM redesign.
        template = infer_goal_template(goal_text)
    return {
        "goal_type": goal_type,
        "target": target,
        "items": items,
        "domain": domain,
        "deadline": deadline,
        "summary": summary,
        "goal_template": template,
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


def _audio_config():
    """Return (base_url, key, tts_model, tts_voice, asr_model) or raise."""
    base = (getattr(settings, "NVIDIA_BASE_URL", "") or "").rstrip("/")
    key = getattr(settings, "NVIDIA_API_KEY", "") or ""
    tts_model = getattr(settings, "NVIDIA_TTS_MODEL", "") or "tts-1"
    tts_voice = getattr(settings, "NVIDIA_TTS_VOICE", "") or "Aria"
    asr_model = getattr(settings, "NVIDIA_ASR_MODEL", "") or "whisper-1"
    if not base or not key:
        raise RuntimeError("NVIDIA audio is not configured")
    return base, key, tts_model, tts_voice, asr_model


def text_to_speech(text):
    """POST real Riva/NIM TTS; return a playable audio URL string.

    The NIM response is raw audio bytes -> returned as a
    data:audio/mpeg;base64,... URL (cacheable by the TTS endpoint's text
    hash). A JSON response carrying a url/audio_url is passed through.
    Any failure raises and the view maps it to 503. No stub audio.
    """
    if not isinstance(text, str) or not text.strip():
        raise ValueError("text must be a non-empty string")
    base, key, tts_model, tts_voice, _ = _audio_config()
    payload = json.dumps(
        {
            "model": tts_model,
            "input": text.strip()[:2000],
            "voice": tts_voice,
            "response_format": "mp3",
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        "%s/audio/speech" % base,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer %s" % key,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=AUDIO_TIMEOUT_SECONDS) as resp:
            content_type = ""
            try:
                content_type = (resp.headers.get("Content-Type") or "").lower()
            except Exception:
                content_type = ""
            raw = resp.read()
    except Exception:
        logger.warning("TTS call failed", exc_info=True)
        raise RuntimeError("TTS call failed")
    if not raw:
        raise RuntimeError("TTS returned empty response")
    if "application/json" in content_type:
        try:
            body = json.loads(raw.decode("utf-8"))
        except ValueError:
            raise RuntimeError("TTS returned malformed JSON")
        if isinstance(body, dict):
            for field in ("audio_url", "url", "audio"):
                value = body.get(field)
                if isinstance(value, str) and value.strip():
                    return value.strip()
            data = body.get("data")
            if isinstance(data, str) and data.strip():
                return data.strip()
        raise RuntimeError("TTS returned malformed response")
    import base64

    return "data:audio/mpeg;base64,%s" % base64.b64encode(raw).decode("ascii")


def speech_to_text(audio_file):
    """POST real Riva/NIM ASR; return the transcript of THESE bytes.

    Multipart POST to {base}/audio/transcriptions (OpenAI-compatible).
    Different audio bytes always produce a fresh provider call, so the
    fixed-string "same transcription" stub bug cannot recur. Any failure
    raises and the view maps it to 503.
    """
    if not isinstance(audio_file, (bytes, bytearray)) or not len(audio_file):
        raise ValueError("audio_file must be non-empty bytes")
    raw_bytes = bytes(audio_file)
    base, key, _, _, asr_model = _audio_config()
    import uuid as _uuid

    boundary = "ontrack-%s" % _uuid.uuid4().hex
    CRLF = b"\r\n"

    def _field(name, value):
        return (
            b"--" + boundary.encode() + CRLF
            + ('Content-Disposition: form-data; name="%s"' % name).encode()
            + CRLF + CRLF + str(value).encode() + CRLF
        )

    body = _field("model", asr_model)
    body += (
        b"--" + boundary.encode() + CRLF
        + b'Content-Disposition: form-data; name="file"; filename="audio.webm"'
        + CRLF + b"Content-Type: application/octet-stream" + CRLF + CRLF
        + raw_bytes + CRLF
    )
    body += b"--" + boundary.encode() + b"--" + CRLF
    req = urllib.request.Request(
        "%s/audio/transcriptions" % base,
        data=body,
        headers={
            "Content-Type": "multipart/form-data; boundary=%s" % boundary,
            "Authorization": "Bearer %s" % key,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=AUDIO_TIMEOUT_SECONDS) as resp:
            payload = resp.read().decode("utf-8")
    except Exception:
        logger.warning("ASR call failed", exc_info=True)
        raise RuntimeError("ASR call failed")
    try:
        data = json.loads(payload)
    except ValueError:
        raise RuntimeError("ASR returned malformed response")
    transcript = ""
    if isinstance(data, dict):
        for field in ("text", "transcription", "transcript"):
            value = data.get(field)
            if isinstance(value, str) and value.strip():
                transcript = value.strip()
                break
    if not transcript:
        raise RuntimeError("ASR returned empty transcript")
    return transcript[:5000]
