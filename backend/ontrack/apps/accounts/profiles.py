"""Defensive read of the external `public.profiles` table.

The table may not exist yet (teammate creates it Supabase-side), or its
columns may differ from our placeholders. Any database-level failure ->
nulls, never a crashed endpoint. Application bugs still raise.
"""
import logging

from django.db import DatabaseError

from apps.accounts.models import Profile

logger = logging.getLogger(__name__)


def get_profile_stats(user_id):
    """Return {"streak": int|None, "total_goals": int|None} for a Supabase user.

    Missing table/columns/row -> {"streak": None, "total_goals": None}.
    (Nulls, not zeros: 0 would be a false reading of a real streak.)
    """
    try:
        row = (
            Profile.objects.filter(pk=user_id)
            .values("streak", "total_goals")
            .first()
        )
    except DatabaseError as exc:
        # Covers missing table (UndefinedTable) and missing columns, on both
        # Postgres and SQLite. Log the DB message only — it holds identifiers,
        # never secrets.
        logger.warning("public.profiles unreadable; returning nulls: %s", exc)
        return {"streak": None, "total_goals": None}
    if row is None:
        return {"streak": None, "total_goals": None}
    return {"streak": row["streak"], "total_goals": row["total_goals"]}
