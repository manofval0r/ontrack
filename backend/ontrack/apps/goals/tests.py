"""Endpoint smoke tests: goals, progress, dashboard, finalize (deliverable 4).

Happy path + one failure path each. Run: python3 manage.py test
"""
import uuid
from unittest import mock

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.accounts.tests import TEST_SECRET, mint_token
from apps.goals.models import CheckIn, Goal, ProgressLog

GOOD_PARSE = {
    "goal_type": "counter",
    "target": 5,
    "domain": "fitness",
    "deadline": None,
    "summary": "",
}


@override_settings(SUPABASE_JWT_SECRET=TEST_SECRET)
class GoalEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_id = uuid.uuid4()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {mint_token(self.user_id)}"
        )

    def test_create_goal_happy_path(self):
        with mock.patch(
            "apps.goals.views.ai_module.parse_goal", return_value=dict(GOOD_PARSE)
        ):
            resp = self.client.post("/api/goals", {"text": "run 5k"}, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        body = resp.json()
        self.assertEqual(body["goal_type"], "counter")
        self.assertEqual(body["target"], 5)
        self.assertFalse(body["ai_fallback_used"])

    def test_create_goal_rejects_empty_text(self):
        resp = self.client.post("/api/goals", {"text": "   "}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "VALIDATION_ERROR")

    def test_create_goal_ai_raise_still_201_manual(self):
        with mock.patch(
            "apps.goals.views.ai_module.parse_goal", side_effect=RuntimeError("nemotron down")
        ):
            resp = self.client.post("/api/goals", {"text": "read more"}, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        body = resp.json()
        self.assertEqual(body["goal_type"], "manual")
        self.assertIsNone(body["target"])
        self.assertTrue(body["ai_fallback_used"])

    def test_create_goal_ai_malformed_still_201_manual(self):
        with mock.patch(
            "apps.goals.views.ai_module.parse_goal",
            return_value={"goal_type": "bogus", "target": "lots"},
        ):
            resp = self.client.post("/api/goals", {"text": "x" * 10}, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()["goal_type"], "manual")

    def test_create_goal_stores_deadline_and_summary(self):
        parse = {"goal_type": "counter", "target": 3, "domain": "health",
                 "deadline": "2030-01-01T00:00:00Z", "summary": "Run regularly"}
        with mock.patch("apps.goals.views.ai_module.parse_goal", return_value=parse):
            resp = self.client.post("/api/goals", {"text": "run more"}, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        body = resp.json()
        self.assertTrue(body["deadline"].startswith("2030-01-01"))
        self.assertEqual(body["parse_result"]["summary"], "Run regularly")
        self.assertFalse(body["ai_fallback_used"])

    def test_create_goal_bad_deadline_ignored_not_fatal(self):
        parse = {"goal_type": "counter", "target": 3, "domain": "health",
                 "deadline": "not-a-date", "summary": ""}
        with mock.patch("apps.goals.views.ai_module.parse_goal", return_value=parse):
            resp = self.client.post("/api/goals", {"text": "run more"}, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        body = resp.json()
        self.assertEqual(body["goal_type"], "counter")
        self.assertIsNone(body["deadline"])
        self.assertFalse(body["ai_fallback_used"])

    def test_goal_detail_and_foreign_goal_404(self):
        goal = Goal.objects.create(
            user_id=self.user_id, title="mine", goal_type="manual"
        )
        resp = self.client.get(f"/api/goals/{goal.id}")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["id"], str(goal.id))

        other = Goal.objects.create(
            user_id=uuid.uuid4(), title="theirs", goal_type="manual"
        )
        resp = self.client.get(f"/api/goals/{other.id}")
        self.assertEqual(resp.status_code, 404)
        self.assertEqual(resp.json()["code"], "NOT_FOUND")

    def test_goal_list_status_filter(self):
        Goal.objects.create(user_id=self.user_id, title="a", goal_type="manual")
        Goal.objects.create(
            user_id=self.user_id, title="b", goal_type="manual",
            status=Goal.STATUS_COMPLETED,
        )
        resp = self.client.get("/api/goals")
        self.assertEqual(len(resp.json()), 2)
        resp = self.client.get("/api/goals", {"status": "completed"})
        self.assertEqual(len(resp.json()), 1)
        resp = self.client.get("/api/goals", {"status": "bogus"})
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "VALIDATION_ERROR")

    def test_rate_limit_goals_burst(self):
        with mock.patch(
            "apps.goals.views.ai_module.parse_goal", return_value=dict(GOOD_PARSE)
        ):
            statuses = [
                self.client.post("/api/goals", {"text": f"g{i}"}, format="json").status_code
                for i in range(11)
            ]
        self.assertEqual(statuses[:10], [201] * 10)
        self.assertEqual(statuses[10], 429)


@override_settings(SUPABASE_JWT_SECRET=TEST_SECRET)
class ProgressEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_id = uuid.uuid4()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {mint_token(self.user_id)}"
        )
        self.goal = Goal.objects.create(
            user_id=self.user_id, title="pushups", goal_type="counter", target=5
        )

    def test_log_progress_happy(self):
        resp = self.client.post(
            "/api/progress",
            {"goal_id": str(self.goal.id), "value": 3, "note": "morning set"},
            format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        body = resp.json()
        self.assertEqual(body["value"], 3)
        self.assertFalse(body["exceeded"])

    def test_log_progress_exceeded_flag_not_error(self):
        resp = self.client.post(
            "/api/progress", {"goal_id": str(self.goal.id), "value": 8}, format="json"
        )
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(resp.json()["exceeded"])

    def test_log_progress_negative_rejected(self):
        resp = self.client.post(
            "/api/progress", {"goal_id": str(self.goal.id), "value": -1}, format="json"
        )
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "VALIDATION_ERROR")

    def test_log_progress_foreign_goal_404(self):
        other = Goal.objects.create(
            user_id=uuid.uuid4(), title="theirs", goal_type="counter", target=5
        )
        resp = self.client.post(
            "/api/progress", {"goal_id": str(other.id), "value": 1}, format="json"
        )
        self.assertEqual(resp.status_code, 404)


@override_settings(SUPABASE_JWT_SECRET=TEST_SECRET)
class DashboardFinalizeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_id = uuid.uuid4()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {mint_token(self.user_id)}"
        )

    def test_dashboard_shape_and_query_count(self):
        active = Goal.objects.create(
            user_id=self.user_id, title="run", goal_type="counter", target=10
        )
        ProgressLog.objects.create(goal=active, user_id=self.user_id, value=4)
        ProgressLog.objects.create(goal=active, user_id=self.user_id, value=3)
        done = Goal.objects.create(
            user_id=self.user_id, title="old", goal_type="manual",
            status=Goal.STATUS_COMPLETED,
        )
        from django.utils import timezone

        done.finished_at = timezone.now()
        done.save(update_fields=["finished_at"])

        with self.assertNumQueries(7):
            resp = self.client.get("/api/dashboard")
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        self.assertEqual(len(body["active_goals"]), 1)
        self.assertEqual(body["active_goals"][0]["progress_pct"], 70)
        self.assertEqual(body["week_completed_count"], 1)
        self.assertGreaterEqual(body["streak_days"], 1)
        self.assertEqual(len(body["history"]), 2)
        # No profiles table in the test DB -> defensive nulls, no crash.
        self.assertEqual(body["profile"], {"streak": None, "total_goals": None})

    def test_dashboard_reads_external_profiles_table(self):
        from django.db import connection

        with connection.cursor() as cursor:
            cursor.execute(
                "CREATE TABLE profiles "
                "(id CHAR(32) NOT NULL PRIMARY KEY, "
                "streak INTEGER NULL, total_goals INTEGER NULL)"
            )
            cursor.execute(
                "INSERT INTO profiles (id, streak, total_goals) VALUES (%s, %s, %s)",
                [self.user_id.hex, 12, 30],
            )
        resp = self.client.get("/api/dashboard")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["profile"], {"streak": 12, "total_goals": 30})

    def test_dashboard_profile_row_missing_returns_nulls(self):
        from django.db import connection

        with connection.cursor() as cursor:
            cursor.execute(
                "CREATE TABLE profiles "
                "(id CHAR(32) NOT NULL PRIMARY KEY, "
                "streak INTEGER NULL, total_goals INTEGER NULL)"
            )
        resp = self.client.get("/api/dashboard")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["profile"], {"streak": None, "total_goals": None})

    def test_dashboard_requires_auth(self):
        self.client.credentials()
        resp = self.client.get("/api/dashboard")
        self.assertEqual(resp.status_code, 401)

    def test_finalize_happy_path(self):
        goal = Goal.objects.create(
            user_id=self.user_id, title="run", goal_type="counter", target=10
        )
        ProgressLog.objects.create(goal=goal, user_id=self.user_id, value=6)
        with mock.patch(
            "apps.goals.views.ai_module.generate_verdict", return_value="Great work!"
        ) as m:
            resp = self.client.post(f"/api/goals/{goal.id}/finalize")
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        self.assertEqual(body["status"], "completed")
        self.assertEqual(body["result_value"], 6)
        self.assertEqual(body["verdict"], "Great work!")
        self.assertFalse(body["ai_fallback_used"])
        m.assert_called_once_with(
            str(goal.id),
            {"title": "run", "goal_type": "counter", "target": 10,
             "domain": "", "status": "active"},
            6,
        )

    def test_finalize_ai_failure_uses_generic_verdict(self):
        goal = Goal.objects.create(
            user_id=self.user_id, title="run", goal_type="counter", target=10
        )
        with mock.patch(
            "apps.goals.views.ai_module.generate_verdict",
            side_effect=RuntimeError("nemotron down"),
        ):
            resp = self.client.post(f"/api/goals/{goal.id}/finalize")
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        self.assertEqual(body["status"], "completed")
        self.assertTrue(body["ai_fallback_used"])
        self.assertTrue(body["verdict"])

    def test_finalize_foreign_goal_404(self):
        other = Goal.objects.create(
            user_id=uuid.uuid4(), title="theirs", goal_type="manual"
        )
        resp = self.client.post(f"/api/goals/{other.id}/finalize")
        self.assertEqual(resp.status_code, 404)


@override_settings(SUPABASE_JWT_SECRET=TEST_SECRET, DEBUG_ACCESS_KEY="dbg-key")
class HealthDebugTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_no_auth(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["status"], "ok")
        self.assertIn("instance", body)

    def test_debug_requires_key(self):
        resp = self.client.get("/api/debug")
        self.assertEqual(resp.status_code, 403)
        resp = self.client.get("/api/debug", HTTP_X_DEBUG_KEY="wrong")
        self.assertEqual(resp.status_code, 403)

    def test_debug_happy_path(self):
        user_id = uuid.uuid4()
        goal = Goal.objects.create(
            user_id=user_id, title="g", goal_type="manual",
            parse_result={"goal_type": "manual"},
        )
        CheckIn.objects.create(goal=goal, ai_message="hi")
        resp = self.client.get("/api/debug", HTTP_X_DEBUG_KEY="dbg-key")
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        for key in ("instance", "uptime_seconds", "recent_goals",
                    "recent_checkins", "recent_audio_cache"):
            self.assertIn(key, body)
        self.assertEqual(len(body["recent_goals"]), 1)
