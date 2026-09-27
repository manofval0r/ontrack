"""TTS/ASR smoke tests: TTS cache-first, ASR one-shot (no cache),
timeout, 503-never-500 (deliverable 4 + update 2B)."""
import base64
import uuid
from unittest import mock

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.accounts.tests import TEST_SECRET, mint_token


def b64(raw):
    return base64.b64encode(raw.encode()).decode()


@override_settings(SUPABASE_JWT_SECRET=TEST_SECRET)
class AudioEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_id = uuid.uuid4()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {mint_token(self.user_id)}"
        )

    def test_tts_happy_and_cache_hit(self):
        with mock.patch(
            "apps.audio.views.ai_module.text_to_speech",
            return_value="https://cdn.example/a.mp3",
        ) as m:
            first = self.client.post("/api/tts", {"text": "hello"}, format="json")
            second = self.client.post("/api/tts", {"text": "hello"}, format="json")
        self.assertEqual(first.status_code, 200, first.content)
        self.assertEqual(first.json(), {"audio_url": "https://cdn.example/a.mp3", "cached": False})
        self.assertEqual(second.json()["cached"], True)
        self.assertEqual(m.call_count, 1)  # second call served from AudioCache

    def test_tts_rejects_empty(self):
        resp = self.client.post("/api/tts", {"text": "  "}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_tts_ai_failure_is_503(self):
        with mock.patch(
            "apps.audio.views.ai_module.text_to_speech",
            side_effect=RuntimeError("tts down"),
        ):
            resp = self.client.post("/api/tts", {"text": "hello"}, format="json")
        self.assertEqual(resp.status_code, 503)
        self.assertEqual(resp.json()["code"], "AI_SERVICE_ERROR")

    def test_asr_happy_path_passes_bytes(self):
        with mock.patch(
            "apps.audio.views.ai_module.speech_to_text", return_value="hi there"
        ) as m:
            resp = self.client.post(
                "/api/asr", {"audio": b64("fake-audio-bytes")}, format="json"
            )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json(), {"transcript": "hi there"})
        m.assert_called_once_with(b"fake-audio-bytes")

    def test_asr_called_twice_for_same_input_no_cache(self):
        # Correction 2B: speech_to_text is one-shot, never cached.
        with mock.patch(
            "apps.audio.views.ai_module.speech_to_text", return_value="hi"
        ) as m:
            payload = {"audio": b64("same-bytes")}
            self.client.post("/api/asr", payload, format="json")
            self.client.post("/api/asr", payload, format="json")
        self.assertEqual(m.call_count, 2)

    def test_asr_rejects_invalid_base64(self):
        resp = self.client.post(
            "/api/asr", {"audio": "!!! not base64 !!!"}, format="json"
        )
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "VALIDATION_ERROR")

    def test_asr_ai_failure_is_503(self):
        with mock.patch(
            "apps.audio.views.ai_module.speech_to_text",
            side_effect=RuntimeError("asr down"),
        ):
            resp = self.client.post(
                "/api/asr", {"audio": b64("fake-audio-bytes")}, format="json"
            )
        self.assertEqual(resp.status_code, 503)
        self.assertEqual(resp.json()["code"], "AI_SERVICE_ERROR")

    def test_asr_rate_limited(self):
        with mock.patch(
            "apps.audio.views.ai_module.speech_to_text", return_value="t"
        ):
            statuses = [
                self.client.post(
                    "/api/asr", {"audio": b64(f"payload-{i}")}, format="json"
                ).status_code
                for i in range(11)
            ]
        self.assertEqual(statuses[:10], [200] * 10)
        self.assertEqual(statuses[10], 429)
