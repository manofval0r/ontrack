"""OnTrack data models. UUID primary keys throughout.

Ownership note: goals are owned by a Supabase user UUID (`user_id`, no FK —
Django holds no local user table; Supabase is the source of truth).
"""
import uuid

from django.db import models


class Goal(models.Model):
    GOAL_TYPE_COUNTER = "counter"
    GOAL_TYPE_CHECKLIST = "checklist"
    GOAL_TYPE_MANUAL = "manual"
    GOAL_TYPE_CHOICES = [
        (GOAL_TYPE_COUNTER, "Counter"),
        (GOAL_TYPE_CHECKLIST, "Checklist"),
        (GOAL_TYPE_MANUAL, "Manual"),
    ]

    # Tracker template (selects frontend copy/icons only — never a full
    # per-goal LLM redesign). Set at creation via parse_goal() keyword rules.
    TEMPLATE_SALES_COUNTER = "sales_counter"
    TEMPLATE_FITNESS_COUNTER = "fitness_counter"
    TEMPLATE_GITHUB_CHECKLIST = "github_checklist"
    TEMPLATE_STUDY_CHECKLIST = "study_checklist"
    TEMPLATE_REFLECTION_MANUAL = "reflection_manual"
    TEMPLATE_GENERIC = "generic"
    TEMPLATE_CHOICES = [
        (TEMPLATE_SALES_COUNTER, "Sales counter"),
        (TEMPLATE_FITNESS_COUNTER, "Fitness counter"),
        (TEMPLATE_GITHUB_CHECKLIST, "GitHub checklist"),
        (TEMPLATE_STUDY_CHECKLIST, "Study checklist"),
        (TEMPLATE_REFLECTION_MANUAL, "Reflection manual"),
        (TEMPLATE_GENERIC, "Generic"),
    ]

    STATUS_ACTIVE = "active"
    STATUS_COMPLETED = "completed"
    STATUS_MISSED = "missed"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_MISSED, "Missed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Supabase auth user id; plain UUID, deliberately no FK.
    user_id = models.UUIDField(db_index=True)
    title = models.CharField(max_length=255)
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES)
    goal_template = models.CharField(
        max_length=30, choices=TEMPLATE_CHOICES, default=TEMPLATE_GENERIC
    )
    target = models.IntegerField(null=True, blank=True)
    domain = models.CharField(max_length=100, default="", blank=True)
    start_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE, db_index=True
    )
    result_value = models.IntegerField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    # Raw AI parse output kept for /api/debug and auditing. Empty on fallback.
    parse_result = models.JSONField(default=dict, blank=True)
    # Last verdict from ai_module.generate_verdict (or the generic fallback).
    verdict = models.TextField(default="", blank=True)

    class Meta:
        ordering = ["-start_at"]
        indexes = [
            models.Index(fields=["user_id", "status"]),
            models.Index(fields=["user_id", "deadline"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.status})"


class GoalItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name="items")
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{'[x]' if self.completed else '[ ]'} {self.title}"


class ProgressLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(
        Goal, on_delete=models.CASCADE, related_name="progress_logs"
    )
    user_id = models.UUIDField(db_index=True)
    value = models.IntegerField()
    note = models.CharField(max_length=500, default="", blank=True)
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-logged_at"]
        indexes = [models.Index(fields=["goal", "logged_at"])]

    def __str__(self):
        return f"+{self.value} on {self.goal_id}"


class CheckIn(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name="checkins")
    ai_message = models.TextField()
    user_response = models.TextField(default="", blank=True)
    checked_in_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-checked_in_at"]

    def __str__(self):
        return f"check-in on {self.goal_id} at {self.checked_in_at}"


class AudioCache(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # sha256 hex of the source text; unique=True already creates the index.
    text_hash = models.CharField(max_length=64, unique=True)
    # TTS rows fill audio_url; ASR rows fill transcript (cached recognition).
    audio_url = models.CharField(max_length=2048, default="", blank=True)
    transcript = models.TextField(default="", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"audio:{self.text_hash[:12]}"
