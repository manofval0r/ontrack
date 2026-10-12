"""Verdict engine v1 + deadline enforcement (M2).

The numbers must be derived, never narrated: these pin exact scores.
"""
import uuid
from datetime import timedelta
from unittest import mock

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.tests import TEST_SECRET, mint_token
from apps.goals import verdicts
from apps.goals.models import Goal, ProgressLog

GOOD_PARSE = {
    "goal_type": "counter",
    "target": 5,
    "domain": "fitness",
    "deadline": None,
    "summary": "",
}


class VerdictMathTests(TestCase):
    """Pure scoring. No DB, no clock — `now` is always passed in."""

    NOW = timezone.now()

    def test_full_target_on_time_scores_100(self):
        score, passed, completion, _pace = verdicts.score_goal(
            10, 10, start_at=self.NOW - timedelta(days=5),
            deadline=self.NOW + timedelta(days=5), now=self.NOW,
        )
        self.assertEqual(score, 100)
        self.assertTrue(passed)
        self.assertEqual(completion, 1.0)

    def test_behind_pace_is_scaled_but_never_zeroed(self):
        # Half the window gone, 30% of the work shipped -> factor 0.6.
        score, passed, _c, pace = verdicts.score_goal(
            30, 100, start_at=self.NOW - timedelta(days=5),
            deadline=self.NOW + timedelta(days=5), now=self.NOW,
        )
        self.assertAlmostEqual(pace, 0.5, places=2)
        self.assertEqual(score, 18)  # 0.30 completion * 0.60 pace factor
        self.assertFalse(passed)

    def test_pace_floor_protects_slow_starters(self):
        # 10% shipped at 99% of the window: factor would be ~0.10, floored at 0.5.
        score, _passed, _c, _pace = verdicts.score_goal(
            10, 100, start_at=self.NOW - timedelta(days=99),
            deadline=self.NOW + timedelta(days=1), now=self.NOW,
        )
        self.assertEqual(score, 5)

    def test_overdue_halves_the_score_and_fails(self):
        score, passed, _c, _pace = verdicts.score_goal(
            100, 100, start_at=self.NOW - timedelta(days=10),
            deadline=self.NOW - timedelta(days=1), now=self.NOW,
        )
        self.assertEqual(score, 50)
        self.assertFalse(passed)

    def test_targetless_goal_scores_by_log_count(self):
        self.assertEqual(verdicts.completion_fraction(3, None), 1.0)
        self.assertEqual(verdicts.completion_fraction(1, None), 1 / 3)
        self.assertEqual(verdicts.completion_fraction(9, None), 1.0)

    def test_score_never_exceeds_100_or_goes_negative(self):
        self.assertEqual(verdicts.score_goal(500, 10, now=self.NOW)[0], 100)
        self.assertEqual(verdicts.score_goal(-5, 10, now=self.NOW)[0], 0)

    def test_no_deadline_means_no_pace_penalty(self):
        score, passed, _c, pace = verdicts.score_goal(
            80, 100, start_at=self.NOW - timedelta(days=90), now=self.NOW
        )
        self.assertIsNone(pace)
        self.assertEqual(score, 80)
        self.assertTrue(passed)

    def test_text_states_the_claim(self):
        text = verdicts.verdict_text(
            8, 10, unit="reps", passed=True, overdue=False, score=80
        )
        self.assertIn("80/100", text)
        self.assertIn("8 of 10 reps", text)
        self.assertIn("Met it", text)

    def test_overdue_text_does_not_claim_success(self):
        text = verdicts.verdict_text(
            10, 10, unit="reps", passed=False, overdue=True, score=50
        )
        self.assertIn("after the deadline", text)
        self.assertNotIn("Met it", text)


@override_settings(SUPABASE_JWT_SECRET=TEST_SECRET)
class DeadlineEnforcementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_id = uuid.uuid4()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {mint_token(self.user_id)}"
        )
        self.now = timezone.now()

    def _goal(self, **kwargs):
        defaults = dict(
            user_id=self.user_id, title="Ship the thing", goal_type="counter",
            target=10, board_rank=0,
        )
        defaults.update(kwargs)
        return Goal.objects.create(**defaults)

    def test_reading_goals_flips_lapsed_to_missed(self):
        goal = self._goal(deadline=self.now - timedelta(hours=1))
        ProgressLog.objects.create(goal=goal, user_id=self.user_id, value=4)
        resp = self.client.get("/api/goals")
        self.assertEqual(resp.status_code, 200, resp.content)
        goal.refresh_from_db()
        self.assertEqual(goal.status, Goal.STATUS_MISSED)
        # 4 of 10 shipped (40%), closed overdue -> halved to 20.
        self.assertEqual(goal.verdict_score, 20)
        self.assertFalse(goal.verdict_passed)
        self.assertIn("after the deadline", goal.verdict)
        self.assertIsNotNone(goal.finished_at)

    def test_future_deadline_stays_active(self):
        goal = self._goal(deadline=self.now + timedelta(days=2))
        self.client.get("/api/goals")
        goal.refresh_from_db()
        self.assertEqual(goal.status, Goal.STATUS_ACTIVE)
        self.assertIsNone(goal.verdict_score)

    def test_sweep_is_idempotent(self):
        goal = self._goal(deadline=self.now - timedelta(hours=1))
        self.client.get("/api/goals")
        goal.refresh_from_db()
        first = goal.verdict
        self.assertNotEqual(first, "")
        self.client.get("/api/goals")
        goal.refresh_from_db()
        self.assertEqual(goal.verdict, first)

    def test_sweep_does_not_touch_other_users(self):
        other = uuid.uuid4()
        goal = self._goal(user_id=other, deadline=self.now - timedelta(hours=1))
        self.client.get("/api/goals")
        goal.refresh_from_db()
        self.assertEqual(goal.status, Goal.STATUS_ACTIVE)


@override_settings(SUPABASE_JWT_SECRET=TEST_SECRET)
class FinalizeScoringTests(TestCase):
    """The score on a finalized goal comes from the engine, not the model."""

    def setUp(self):
        self.client = APIClient()
        self.user_id = uuid.uuid4()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {mint_token(self.user_id)}"
        )
        self.now = timezone.now()

    def test_finalize_stores_engine_score_even_when_ai_says_great_job(self):
        with mock.patch(
            "apps.goals.views.ai_module.parse_goal", return_value=dict(GOOD_PARSE)
        ):
            created = self.client.post(
                "/api/goals", {"text": "do ten reps"}, format="json"
            ).json()
        ProgressLog.objects.create(
            goal=Goal.objects.get(pk=created["id"]), user_id=self.user_id, value=1
        )
        with mock.patch(
            "apps.goals.views.ai_module.generate_verdict",
            return_value="Outstanding effort, you crushed it!",
        ):
            resp = self.client.post(f"/api/goals/{created['id']}/finalize")
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        # Parse gave target 5; 1 of 5 shipped, no deadline -> 20, failed.
        # The prose is kept as-is: the model may color, never score.
        self.assertEqual(body["verdict_score"], 20)
        self.assertFalse(body["verdict_passed"])
        self.assertEqual(body["verdict"], "Outstanding effort, you crushed it!")

    def test_finalize_without_ai_falls_back_to_derived_text(self):
        with mock.patch(
            "apps.goals.views.ai_module.parse_goal", return_value=dict(GOOD_PARSE)
        ):
            created = self.client.post(
                "/api/goals", {"text": "do ten reps"}, format="json"
            ).json()
        goal = Goal.objects.get(pk=created["id"])
        ProgressLog.objects.create(goal=goal, user_id=self.user_id, value=10)
        with mock.patch(
            "apps.goals.views.ai_module.generate_verdict",
            side_effect=RuntimeError("brain down"),
        ):
            resp = self.client.post(f"/api/goals/{created['id']}/finalize")
        body = resp.json()
        self.assertTrue(body["ai_fallback_used"])
        self.assertEqual(body["verdict_score"], 100)
        self.assertTrue(body["verdict_passed"])
        self.assertIn("100/100", body["verdict"])
