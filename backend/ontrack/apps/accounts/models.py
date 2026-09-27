"""Read-only mirror of Supabase's `public.profiles` table (real schema).

- Supabase owns this table (linked to auth.users.id). Django MUST NOT
  create/alter it -> `managed = False`, so `makemigrations` ignores this
  model (verified via `makemigrations --check`).
- Fields match the confirmed Supabase schema exactly: id, display_name,
  email, streak, total_goals, completed_goals, created_at, updated_at.
  (DB defaults are 0, but READ paths still return null on any DatabaseError —
  see apps/accounts/profiles.py — so a missing row never fakes a 0.)
- No local users table: identity still comes from the JWT `sub` claim only.
"""
import uuid

from django.db import models


class Integration(models.Model):
    """Per-user third-party credential vault (Evans).

    One row per (user, provider). `access_token` is stored in plaintext for
    the hackathon window — flag: move to KMS/encrypted field before real PII.
    Tokens are NEVER serialized to clients (views whitelist fields).
    """

    PROVIDER_GITHUB = "github"
    PROVIDER_GOOGLE_CAL = "google-cal"
    PROVIDER_SLACK = "slack"
    PROVIDER_NOTION = "notion"
    PROVIDER_CHOICES = [
        (PROVIDER_GITHUB, "GitHub"),
        (PROVIDER_GOOGLE_CAL, "Google Calendar"),
        (PROVIDER_SLACK, "Slack"),
        (PROVIDER_NOTION, "Notion"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Supabase auth user id; plain UUID, deliberately no FK (no local users).
    user_id = models.UUIDField(db_index=True)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    access_token = models.TextField(default="", blank=True)
    # Provider extras: slack {webhook_url}, notion {api_token, database_id},
    # github/google {login, scopes}. Never secrets beyond access_token.
    meta = models.JSONField(default=dict, blank=True)
    connected = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user_id", "provider"], name="uniq_integration_user_provider"
            )
        ]
        indexes = [models.Index(fields=["user_id", "provider"])]

    def __str__(self):
        return f"{self.provider} for {self.user_id} ({'on' if self.connected else 'off'})"


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    display_name = models.CharField(max_length=255, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    streak = models.IntegerField(default=0)
    total_goals = models.IntegerField(default=0)
    completed_goals = models.IntegerField(default=0)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "profiles"

    def __str__(self):
        return f"profile:{self.id}"
