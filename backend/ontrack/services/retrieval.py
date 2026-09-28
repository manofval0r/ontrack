# IMPLEMENTATION APPROACH: OPTION A (Real vector similarity search using pgvector)
"""Retrieval service for Ontrack AI Coach.

Retrieves relevant past goal and progress history for the authenticated user,
grounding the AI Coach's responses in the user's actual progress data.

Guarantees:
1. Strict user-isolation: Every query is scoped to the authenticated user's ID.
2. Resilience: Wrapped in top-level try/except. Never raises an exception;
   returns an empty list [] on any failure (API error, database timeout, etc.).
3. Return format: Plain list of human-readable context strings.
"""
import logging
import math
import uuid
from typing import Any

from django.db import connection
from django.utils import timezone

logger = logging.getLogger(__name__)


def _normalize_user_id(uid: Any) -> uuid.UUID | None:
    """Safely convert int, str, or UUID to a valid UUIDField-compatible UUID."""
    if uid is None:
        return None
    if isinstance(uid, uuid.UUID):
        return uid
    uid_str = str(uid).strip()
    try:
        return uuid.UUID(uid_str)
    except (ValueError, AttributeError):
        # Deterministic UUID from int or non-UUID string (e.g. user ID 1 -> consistent UUID)
        return uuid.uuid5(uuid.NAMESPACE_DNS, f"ontrack-user-{uid_str}")


def _cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Calculate cosine similarity between two float vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a < 1e-9 or norm_b < 1e-9:
        return 0.0
    return dot / (norm_a * norm_b)


def get_relevant_context(
    user_id: Any, current_message: str, goal_id: Any = None
) -> list[str]:
    """Retrieve relevant goal and progress history for user_id.

    Args:
        user_id: Authenticated user ID (int, str, or UUID).
        current_message: The text of the user's current chat message.
        goal_id: Optional goal ID to focus context on a specific goal.

    Returns:
        List of short descriptive text strings ready to be injected into prompt.
        Always returns a list (empty if no data found or on any failure).
    """
    try:
        # Strict user boundary check
        norm_user_id = _normalize_user_id(user_id)
        if not norm_user_id:
            return []

        if not current_message or not isinstance(current_message, str):
            current_message = ""

        from apps.goals.models import Goal, ProgressLog
        from services.embeddings import generate_embedding

        # 1. Generate query embedding for similarity search (Option A)
        query_embedding = generate_embedding(current_message)

        # 2. Normalize optional goal_id
        norm_goal_id = None
        if goal_id is not None:
            try:
                norm_goal_id = uuid.UUID(str(goal_id))
            except (ValueError, AttributeError):
                norm_goal_id = None

        results = []

        # 3. Attempt pgvector query (works on Supabase Postgres with pgvector extension)
        is_postgres = connection.vendor == "postgresql"
        if is_postgres:
            try:
                from pgvector.django import L2Distance

                qs = ProgressLog.objects.filter(
                    user_id=norm_user_id,
                    embedding__isnull=False,
                ).select_related("goal")

                if norm_goal_id:
                    qs = qs.filter(goal_id=norm_goal_id)

                # Order by L2 vector distance
                pg_results = list(
                    qs.order_by(L2Distance("embedding", query_embedding))[:5]
                )
                if pg_results:
                    results = pg_results
            except Exception as pg_err:
                logger.debug("Postgres pgvector query fallback: %s", pg_err)

        # 4. Fallback if pgvector didn't return results (e.g. SQLite test database,
        # or embeddings not yet generated for old logs)
        if not results:
            qs = ProgressLog.objects.filter(user_id=norm_user_id).select_related("goal")
            if norm_goal_id:
                qs = qs.filter(goal_id=norm_goal_id)

            logs = list(qs.order_by("-logged_at")[:15])

            if logs:
                # If logs have embeddings, score by cosine similarity in Python
                logs_with_embeddings = [log for log in logs if log.embedding is not None]
                if logs_with_embeddings:
                    scored_logs = [
                        (log, _cosine_similarity(query_embedding, list(log.embedding)))
                        for log in logs_with_embeddings
                    ]
                    # Sort descending by similarity
                    scored_logs.sort(key=lambda x: x[1], reverse=True)
                    results = [log for log, score in scored_logs[:5]]
                else:
                    # Pure recency fallback (Option B fallback within Option A)
                    results = logs[:5]

        # 5. Format results into human-readable strings
        context_items: list[str] = []
        for log in results:
            goal_title = log.goal.title if log.goal else "goal"
            date_str = (
                log.logged_at.strftime("%a, %b %d")
                if log.logged_at
                else timezone.now().strftime("%a, %b %d")
            )
            note_part = f": {log.note.strip()}" if log.note and log.note.strip() else ""
            context_items.append(
                f"Logged {log.value} on '{goal_title}' on {date_str}{note_part}"
            )

        # 6. If few or no progress logs, optionally include active goals metadata for this user
        if len(context_items) < 3:
            goal_qs = Goal.objects.filter(
                user_id=norm_user_id, status=Goal.STATUS_ACTIVE
            )
            if norm_goal_id:
                goal_qs = goal_qs.filter(id=norm_goal_id)
            for g in goal_qs[:2]:
                target_str = f"target {g.target}" if g.target else f"{g.goal_type} tracker"
                context_items.append(
                    f"Active goal: '{g.title}' ({target_str}, current progress: {g.result_value or 0})"
                )

        return context_items[:5]

    except Exception as e:
        # Requirement: On ANY exception, log and return empty list — never raise.
        logger.warning(
            "get_relevant_context failed for user %s: %s", user_id, e, exc_info=True
        )
        return []
