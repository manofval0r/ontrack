"""TTS/ASR endpoints. Only /api/tts checks AudioCache first (by sha256 of
the text) before calling text_to_speech(). /api/asr is one-shot: it calls
speech_to_text() directly with NO caching (AudioCache.transcript stays in
the schema for potential future use). Any AI failure ->
503 {"error":"audio service unavailable","code":"AI_SERVICE_ERROR"}, never 500.
"""
import base64
import hashlib
import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

from django.db import IntegrityError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps import ai_module
from apps.accounts.throttles import AsrBurstThrottle
from apps.goals.models import AudioCache
from apps.goals.views import clean_text
from config.exceptions import ApiError

logger = logging.getLogger(__name__)

AI_TIMEOUT_SECONDS = 10


def text_hash(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def call_ai_with_timeout(fn, *args, timeout=AI_TIMEOUT_SECONDS):
    """Run a stub AI function with a hard timeout. Threads can't be killed,
    so a hung provider still holds its worker briefly — but the client always
    gets a 503 within `timeout` seconds instead of hanging."""
    with ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(fn, *args)
        try:
            return future.result(timeout=timeout)
        except FuturesTimeoutError:
            logger.warning("ai_module call timed out after %ss", timeout)
            raise ApiError(
                "audio service unavailable",
                "AI_SERVICE_ERROR",
                status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except ApiError:
            raise
        except Exception:
            logger.warning("ai_module call failed", exc_info=True)
            raise ApiError(
                "audio service unavailable",
                "AI_SERVICE_ERROR",
                status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class TtsView(APIView):
    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        text = clean_text(data.get("text"), max_length=2000)
        digest = text_hash(text)
        cached = AudioCache.objects.filter(text_hash=digest).first()
        if cached and cached.audio_url:
            return Response({"audio_url": cached.audio_url, "cached": True})
        audio_url = call_ai_with_timeout(ai_module.text_to_speech, text)
        if not isinstance(audio_url, str) or not audio_url.strip():
            logger.warning("ai_module.text_to_speech returned invalid data")
            raise ApiError(
                "audio service unavailable",
                "AI_SERVICE_ERROR",
                status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            AudioCache.objects.create(text_hash=digest, audio_url=audio_url.strip())
        except IntegrityError:
            # Lost a race with a concurrent request; serve the winner's row.
            logger.info("AudioCache race on TTS hash; reusing existing row")
            cached = AudioCache.objects.filter(text_hash=digest).first()
            if cached and cached.audio_url:
                return Response({"audio_url": cached.audio_url, "cached": True})
            raise ApiError(
                "audio service unavailable",
                "AI_SERVICE_ERROR",
                status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"audio_url": audio_url.strip(), "cached": False})


class AsrView(APIView):
    """One-shot transcription: no cache read, no cache write."""

    throttle_classes = [AsrBurstThrottle]

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        # JSON transport carries bytes as base64; David's speech_to_text
        # takes raw bytes, so decode at the boundary (up to ~7.5MB audio).
        audio_b64 = clean_text(data.get("audio"), field="audio", max_length=10_000_000)
        try:
            audio_bytes = base64.b64decode("".join(audio_b64.split()), validate=True)
        except ValueError:
            raise ApiError("audio must be valid base64-encoded audio", "VALIDATION_ERROR")
        if not audio_bytes:
            raise ApiError("audio must be valid base64-encoded audio", "VALIDATION_ERROR")
        transcript = call_ai_with_timeout(ai_module.speech_to_text, audio_bytes)
        if not isinstance(transcript, str) or not transcript.strip():
            logger.warning("ai_module.speech_to_text returned invalid data")
            raise ApiError(
                "audio service unavailable",
                "AI_SERVICE_ERROR",
                status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"transcript": transcript.strip()})
