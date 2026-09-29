"""Tests for Retrieval-Augmented Generation (RAG) context in Ontrack AI Coach.

Covers the 4 required test scenarios:
1. User with zero prior progress logs -> chat responds normally (empty context, 200 OK).
2. User with prior logs on the same goal -> response grounds in relevant history.
3. Deliberately broken embedding step -> chat still returns valid 200 response with empty context (no 500).
4. Strict cross-user isolation -> User A never sees User B's data under any circumstance.
"""
import uuid
from unittest.mock import patch, MagicMock

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.tests import TEST_SECRET, mint_token
from apps.goals.models import Goal, ProgressLog
from services.ai_coach import call_ai_coach
from services.embeddings import generate_embedding
from services.retrieval import get_relevant_context


@override_settings(
    SUPABASE_JWT_SECRET=TEST_SECRET,
    # Force the deterministic offline embedding path: tests must never
    # depend on a developer .env or on network access to an AI server.
    NVIDIA_BASE_URL="",
    NVIDIA_API_KEY="",
    EMBEDDING_API_URL="",
)
class RetrievalAugmentedContextTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_a_id = uuid.uuid4()
        self.user_b_id = uuid.uuid4()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {mint_token(self.user_a_id)}"
        )

    def test_1_zero_prior_logs_chat_responds_normally(self):
        """Requirement 1: User with zero prior logs gets valid response with empty context."""
        with patch("services.ai_coach._chat", return_value="Great to hear! Tell me what you'd like to achieve today."):
            resp = self.client.post(
                "/api/chat",
                {"message": "Hello, how does this work?"},
                format="json",
            )

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("message", data)
        self.assertEqual(data["retrieved_context"], [])
        self.assertFalse(data["ai_fallback_used"])
        self.assertEqual(data["message"], "Great to hear! Tell me what you'd like to achieve today.")

    def test_2_user_with_prior_logs_references_history(self):
        """Requirement 2: User with prior logs has relevant context retrieved and passed to AI Coach."""
        goal = Goal.objects.create(
            user_id=self.user_a_id,
            title="Morning Pushup Challenge",
            goal_type=Goal.GOAL_TYPE_COUNTER,
            target=100,
        )

        log1 = ProgressLog.objects.create(
            goal=goal,
            user_id=self.user_a_id,
            value=25,
            note="Good form, chest to floor",
            embedding=generate_embedding("Morning Pushup Challenge 25 Good form, chest to floor"),
        )
        log2 = ProgressLog.objects.create(
            goal=goal,
            user_id=self.user_a_id,
            value=30,
            note="Felt shoulder fatigue on set 3",
            embedding=generate_embedding("Morning Pushup Challenge 30 Felt shoulder fatigue on set 3"),
        )

        captured_messages = []

        def fake_chat(messages, **kwargs):
            captured_messages.extend(messages)
            return "You previously logged 30 pushups with shoulder fatigue. Let's pace your next set cleanly."

        with patch("services.ai_coach._chat", side_effect=fake_chat):
            resp = self.client.post(
                "/api/chat",
                {"message": "How am I doing on my pushup goal?"},
                format="json",
            )

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(len(data["retrieved_context"]) > 0)
        
        # Verify retrieved context references the goal and values
        context_blob = " ".join(data["retrieved_context"])
        self.assertIn("Morning Pushup Challenge", context_blob)

        # Verify the prompt sent to Nemotron actually included the retrieved history
        user_prompt_sent = captured_messages[1]["content"]
        self.assertIn("Relevant history for this user:", user_prompt_sent)
        self.assertIn("Morning Pushup Challenge", user_prompt_sent)
        self.assertIn("How am I doing on my pushup goal?", user_prompt_sent)

    def test_3_deliberate_broken_embedding_still_returns_valid_200(self):
        """Requirement 3: Breaking the embedding step degrades gracefully to empty context without 500 error."""

        goal = Goal.objects.create(
            user_id=self.user_a_id,
            title="Daily Reading",
            goal_type=Goal.GOAL_TYPE_COUNTER,
            target=50,
        )
        ProgressLog.objects.create(
            goal=goal,
            user_id=self.user_a_id,
            value=10,
            note="Read chapter 1",
        )

        # Deliberately point embedding endpoint to invalid model endpoint
        with override_settings(
            NVIDIA_BASE_URL="https://invalid-model-endpoint.example.com/v1",
            EMBEDDING_API_URL="https://invalid-model-endpoint.example.com/v1",
            EMBEDDING_FORCE_FAIL=True,
        ):
            with patch("services.ai_coach._chat", return_value="Keep up your reading routine!"):
                resp = self.client.post(
                    "/api/chat",
                    {"message": "I read 10 pages today."},
                    format="json",
                )

        # Confirm the chat endpoint still returns a valid AI response with empty context, NOT a 500
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["retrieved_context"], [])
        self.assertEqual(data["message"], "Keep up your reading routine!")

    def test_4_strict_cross_user_isolation(self):
        """Requirement 4: Confirm no query in retrieval.py can return another user's data."""
        # Setup User A's data
        goal_a = Goal.objects.create(
            user_id=self.user_a_id,
            title="User A Secret Enterprise Sales",
            goal_type=Goal.GOAL_TYPE_COUNTER,
            target=10,
        )
        ProgressLog.objects.create(
            goal=goal_a,
            user_id=self.user_a_id,
            value=5,
            note="Confidential contract with Apex Corp",
            embedding=generate_embedding("User A Secret Enterprise Sales 5 Confidential contract with Apex Corp"),
        )

        # Setup User B's data
        goal_b = Goal.objects.create(
            user_id=self.user_b_id,
            title="User B Marathon Training",
            goal_type=Goal.GOAL_TYPE_COUNTER,
            target=42,
        )
        ProgressLog.objects.create(
            goal=goal_b,
            user_id=self.user_b_id,
            value=15,
            note="Long Sunday run in the rain",
            embedding=generate_embedding("User B Marathon Training 15 Long Sunday run in the rain"),
        )

        # Query as User B asking about sales/Apex (User A's topic)
        context_for_b = get_relevant_context(
            user_id=self.user_b_id,
            current_message="Tell me about Apex Corp enterprise sales deal",
        )

        # User B MUST NOT receive ANY of User A's data
        for item in context_for_b:
            self.assertNotIn("Apex Corp", item)
            self.assertNotIn("User A", item)
            self.assertNotIn("Secret Enterprise Sales", item)

        # Query as User A asking about marathon (User B's topic)
        context_for_a = get_relevant_context(
            user_id=self.user_a_id,
            current_message="Tell me about marathon run in rain",
        )

        # User A MUST NOT receive ANY of User B's data
        for item in context_for_a:
            self.assertNotIn("Marathon Training", item)
            self.assertNotIn("User B", item)
            self.assertNotIn("Sunday run in the rain", item)
