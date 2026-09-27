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
