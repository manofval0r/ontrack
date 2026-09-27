"""Seam to David's Nemotron/TTS/ASR logic — STUB ONLY, do not put prompt
logic here. Evans (backend) owns the contract; David owns the bodies.

Contract (views validate everything; all functions raise on failure and the
views fall back / degrade gracefully — AI failure must never block):
- parse_goal(goal_text) -> dict {goal_type, target, items, domain, deadline, summary}
  (items: list[str] for checklist only, [] otherwise — David extracts upfront)
- generate_checkin(goal_id, goal_data, current_progress) -> str
  (On-demand only: POST /api/goals/:id/checkin calls this. No auto-triggers.)
- generate_verdict(goal_id, goal_data, final_progress) -> str
- text_to_speech(text) -> str (audio URL; TTS endpoint caches by text hash)
- speech_to_text(audio_file: bytes) -> str (transcript; one-shot, NOT cached)

These canned defaults let backend smoke tests run before David wires the
real implementations; replace the bodies, keep the signatures.
"""
import logging

logger = logging.getLogger(__name__)


def parse_goal(goal_text):
    logger.info("ai_module.parse_goal stub called")
    return {
        "goal_type": "counter",
        "target": 10,
        "items": [],
        "domain": "general",
        "deadline": None,
        "summary": "",
    }


def generate_checkin(goal_id, goal_data, current_progress):
    logger.info("ai_module.generate_checkin stub called")
    return "Stub check-in message."


def generate_verdict(goal_id, goal_data, final_progress):
    logger.info("ai_module.generate_verdict stub called")
    return f"Stub verdict for goal {goal_id}: progress={final_progress}."


def text_to_speech(text):
    logger.info("ai_module.text_to_speech stub called")
    return "https://example.com/audio/stub.mp3"


def speech_to_text(audio_file):
    logger.info("ai_module.speech_to_text stub called")
    return "stub transcript"
