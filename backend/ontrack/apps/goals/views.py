"""Goal endpoints. AI (David's ai_module) is best-effort everywhere:
a raise or malformed return falls back and NEVER blocks the request."""
import logging
import re
from datetime import datetime, timedelta
from datetime import timezone as datetime_timezone

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps import ai_module
from apps.accounts.profiles import get_profile_stats
from apps.accounts.throttles import GoalsBurstThrottle
from apps.goals.models import CheckIn, Goal, GoalItem, ProgressLog
from apps.goals.serializers import GoalSerializer, ProgressLogSerializer
from config.exceptions import ApiError

logger = logging.getLogger(__name__)

CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
GOAL_TYPES = {Goal.GOAL_TYPE_COUNTER, Goal.GOAL_TYPE_CHECKLIST, Goal.GOAL_TYPE_MANUAL}
GOAL_TEMPLATES = {
    Goal.TEMPLATE_SALES_COUNTER,
    Goal.TEMPLATE_FITNESS_COUNTER,
    Goal.TEMPLATE_GITHUB_CHECKLIST,
    Goal.TEMPLATE_STUDY_CHECKLIST,
    Goal.TEMPLATE_REFLECTION_MANUAL,
    Goal.TEMPLATE_GENERIC,
}
STATUSES = {Goal.STATUS_ACTIVE, Goal.STATUS_COMPLETED, Goal.STATUS_MISSED}
GENERIC_VERDICT = (
    "Goal finalized. No detailed verdict is available right now — "
    "consistency beats intensity, keep going."
)
GENERIC_CHECKIN = (
    "Checked in. Log your latest progress — consistency beats intensity."
)


def clean_text(text, *, field="text", max_length=500):
    """Strip control chars; require a non-empty string within max_length."""
    if not isinstance(text, str):
        raise ApiError(f"{field} must be a string", "VALIDATION_ERROR")
    cleaned = CONTROL_CHARS.sub("", text).strip()
    if not 1 <= len(cleaned) <= max_length:
        raise ApiError(
            f"{field} must be between 1 and {max_length} characters",
            "VALIDATION_ERROR",
        )
    return cleaned


def _is_int(value):
    return isinstance(value, int) and not isinstance(value, bool)


def _parse_deadline(raw):
    """Lenient deadline parsing: valid ISO-8601 -> aware datetime, anything
    else -> None (deadline never sinks an otherwise good parse)."""
    if raw is None:
        return None
    if not isinstance(raw, str) or not raw.strip():
        return None
    try:
        parsed = datetime.fromisoformat(raw.strip())
    except ValueError:
        logger.warning("ai_module.parse_goal returned unparseable deadline; ignoring")
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=datetime_timezone.utc)
    return parsed


def _clean_items(raw, goal_type):
    """Lenient checklist items: list[str] -> cleaned titles (max 20 x 255).
    Anything off -> []. Non-checklist goals always get [] (per contract).
    Never raises, never sinks an otherwise good parse."""
    if goal_type != Goal.GOAL_TYPE_CHECKLIST:
        return []
    if not isinstance(raw, list):
        return []
    cleaned = []
    for item in raw:
        if not isinstance(item, str):
            continue
        title = CONTROL_CHARS.sub("", item).strip()[:255]
        if title:
            cleaned.append(title)
        if len(cleaned) >= 20:
            break
    return cleaned


def coerce_parse_result(raw):
    """Validate ai_module.parse_goal output ({goal_type, target, items,
    domain, deadline, summary, goal_template}).

    Core fields (goal_type/target/domain) are strict: anything off ->
    ("manual", None, [], "", None, None, "generic", True). Extras
    (items/deadline/summary/goal_template) are lenient: malformed values
    are dropped, never fatal. Never raises.
    """
    fallback = (Goal.GOAL_TYPE_MANUAL, None, [], "", None, None, Goal.TEMPLATE_GENERIC, True)
    if not isinstance(raw, dict):
        return fallback
    goal_type = raw.get("goal_type")
    if goal_type not in GOAL_TYPES:
        return fallback
    target = raw.get("target")
    if target is not None and (not _is_int(target) or target < 0):
        return fallback
    domain = raw.get("domain", "")
    if not isinstance(domain, str):
        return fallback
    domain = domain[:100]
    summary = raw.get("summary") or None
    if summary is not None and not isinstance(summary, str):
        summary = None
    if summary is not None:
        summary = CONTROL_CHARS.sub("", summary).strip()[:2000] or None
    deadline = _parse_deadline(raw.get("deadline"))
    items = _clean_items(raw.get("items"), goal_type)
    template = raw.get("goal_template")
    if template not in GOAL_TEMPLATES:
        template = Goal.TEMPLATE_GENERIC
    return (goal_type, target, items, domain, deadline, summary, template, False)


def parse_goal_safely(text):
    """Call David's parser; on ANY failure return the manual fallback.

    The template still comes from local keyword rules even on fallback,
    so the tracker renders sensibly without an LLM round-trip.
    """
    rel_deadline_str = ai_module.parse_relative_deadline(text)
    rel_deadline = None
    if rel_deadline_str:
        try:
            rel_deadline = datetime.fromisoformat(rel_deadline_str)
        except Exception:
            rel_deadline = None

    try:
        parsed = coerce_parse_result(ai_module.parse_goal(text))
    except Exception:
        logger.warning("ai_module.parse_goal failed; using manual fallback", exc_info=True)
        return (
            Goal.GOAL_TYPE_MANUAL, None, [], "", rel_deadline, None,
            ai_module.infer_goal_template(text), True,
        )
    if parsed[-1]:
        logger.warning("ai_module.parse_goal returned malformed data; using manual fallback")
        return (
            Goal.GOAL_TYPE_MANUAL, None, [], "", rel_deadline, None,
            ai_module.infer_goal_template(text), True,
        )
    # If the parser did not determine a deadline, use the relative expression parser
    if not parsed[4] and rel_deadline:
        parsed_list = list(parsed)
        parsed_list[4] = rel_deadline
        parsed = tuple(parsed_list)
    return parsed


class GoalListCreateView(APIView):
    throttle_classes = [GoalsBurstThrottle]

    def get(self, request):
        status_filter = request.query_params.get("status")
        if status_filter is not None and status_filter not in STATUSES:
            raise ApiError(
                f"status must be one of {sorted(STATUSES)}", "VALIDATION_ERROR"
            )
        goals = Goal.objects.filter(user_id=request.user_id).prefetch_related("items", "progress_logs")
        if status_filter:
            goals = goals.filter(status=status_filter)
        return Response(GoalSerializer(goals, many=True).data)

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        text = clean_text(data.get("text"), max_length=500)
        goal_type, target, items, domain, deadline, summary, goal_template, used_fallback = parse_goal_safely(text)

        # Honor explicitly confirmed client fields if valid
        if data.get("goal_type") in (Goal.GOAL_TYPE_COUNTER, Goal.GOAL_TYPE_CHECKLIST, Goal.GOAL_TYPE_MANUAL):
            goal_type = data.get("goal_type")
        if _is_int(data.get("target")) and int(data.get("target")) >= 0:
            target = int(data.get("target"))
        if data.get("deadline"):
            try:
                deadline = datetime.fromisoformat(str(data.get("deadline")).replace("Z", "+00:00"))
            except Exception:
                pass
        if data.get("domain") and isinstance(data.get("domain"), str):
            domain = str(data.get("domain"))[:100]

        goal = Goal.objects.create(
            user_id=request.user_id,
            title=text[:255],
            goal_type=goal_type,
            goal_template=goal_template,
            target=target,
            domain=domain,
            deadline=deadline,
            parse_result={} if used_fallback else {
                "goal_type": goal_type,
                "target": target,
                "items": items,
                "domain": domain,
                "deadline": deadline.isoformat() if deadline else None,
                "summary": summary or "",
                "goal_template": goal_template,
            },
        )
        if goal_type == Goal.GOAL_TYPE_CHECKLIST and items:
            GoalItem.objects.bulk_create(
                [GoalItem(goal=goal, title=title) for title in items]
            )
        payload = GoalSerializer(goal).data
        payload["ai_fallback_used"] = used_fallback
        return Response(payload, status=status.HTTP_201_CREATED)


class GoalDetailView(APIView):
    def get(self, request, goal_id):
        goal = get_object_or_404(
            Goal.objects.prefetch_related("items", "progress_logs"),
            pk=goal_id,
            user_id=request.user_id,
        )
        payload = GoalSerializer(goal).data
        payload["template_context"] = _template_context(goal)
        # Newest 20 logs from the prefetched cache (no extra query).
        # Manual-tracker feeds and history UIs need these; the list
        # serializer deliberately omits them to avoid N+1 on /api/goals.
        logs = list(goal.progress_logs.all())
        logs.sort(key=lambda entry: entry.logged_at, reverse=True)
        payload["progress_logs"] = ProgressLogSerializer(logs[:20], many=True).data
        return Response(payload)

    def put(self, request, goal_id):
        """Partial update: title/target/domain/deadline/status/items/current_value.
        Unknown fields ignored."""
        goal = get_object_or_404(Goal, pk=goal_id, user_id=request.user_id)
        data = request.data if isinstance(request.data, dict) else {}
        updated = []
        if "title" in data:
            goal.title = clean_text(data.get("title"), field="title", max_length=255)
            updated.append("title")
        if "target" in data:
            target = data.get("target")
            if target is not None and (not _is_int(target) or target < 0):
                raise ApiError("target must be a non-negative integer", "VALIDATION_ERROR")
            goal.target = target
            updated.append("target")
        if "domain" in data:
            domain = data.get("domain", "")
            if not isinstance(domain, str):
                raise ApiError("domain must be a string", "VALIDATION_ERROR")
            goal.domain = domain[:100]
            updated.append("domain")
        if "deadline" in data:
            goal.deadline = _parse_deadline(data.get("deadline"))
            updated.append("deadline")
        if "status" in data:
            new_status = data.get("status")
            if new_status not in STATUSES:
                raise ApiError(
                    f"status must be one of {sorted(STATUSES)}", "VALIDATION_ERROR"
                )
            goal.status = new_status
            if new_status in (Goal.STATUS_COMPLETED, Goal.STATUS_MISSED) and not goal.finished_at:
                goal.finished_at = timezone.now()
            updated.append("status")
        if "items" in data and isinstance(data.get("items"), list):
            raw_items = data.get("items")
            GoalItem.objects.filter(goal=goal).delete()
            new_items = []
            for it in raw_items:
                if isinstance(it, dict):
                    t = clean_text(it.get("title", ""), field="item.title", max_length=255)
                    c = bool(it.get("completed", False))
                    new_items.append(GoalItem(goal=goal, title=t, completed=c))
                elif isinstance(it, str):
                    t = clean_text(it, field="item.title", max_length=255)
                    new_items.append(GoalItem(goal=goal, title=t, completed=False))
            if new_items:
                GoalItem.objects.bulk_create(new_items)
            if hasattr(goal, "updated_at"):
                updated.append("updated_at")
        if not updated and "items" not in data:
            raise ApiError("no updatable fields provided", "VALIDATION_ERROR")
        if updated:
            goal.save(update_fields=updated + (["finished_at"] if "finished_at" in updated or "status" in updated else []))
        goal = Goal.objects.prefetch_related("items", "progress_logs").get(pk=goal.pk)
        return Response(GoalSerializer(goal).data)

    def delete(self, request, goal_id):
        goal = get_object_or_404(Goal, pk=goal_id, user_id=request.user_id)
        gid = str(goal.id)
        goal.delete()
        return Response({"message": "Goal successfully deleted.", "id": gid})


class ProgressCreateView(APIView):
    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        raw_value = data.get("value")
        if not _is_int(raw_value):
            raise ApiError("value must be an integer", "VALIDATION_ERROR")
        if raw_value < 0:
            raise ApiError("value must be >= 0", "VALIDATION_ERROR")
        note = data.get("note", "")
        if note is None:
            note = ""
        if not isinstance(note, str):
            raise ApiError("note must be a string", "VALIDATION_ERROR")
        note = CONTROL_CHARS.sub("", note).strip()
        if len(note) > 500:
            raise ApiError("note must be at most 500 characters", "VALIDATION_ERROR")
        if not data.get("goal_id"):
            raise ApiError("goal_id is required", "VALIDATION_ERROR")
        goal = get_object_or_404(Goal, pk=data.get("goal_id"), user_id=request.user_id)
        log = ProgressLog.objects.create(
            goal=goal, user_id=request.user_id, value=raw_value, note=note
        )
        payload = ProgressLogSerializer(log).data
        payload["exceeded"] = goal.target is not None and raw_value > goal.target
        return Response(payload, status=status.HTTP_201_CREATED)


def _template_context(goal):
    """Per-goal tracker context for template copy/icons.

    Uses the already-prefetched progress_logs (no extra queries):
    - streak_days: consecutive days with logs, anchored today/yesterday.
    - commits_this_week: log count in the last 7 days (stored count for now).
    - last_activity: newest logged_at ISO or None.
    """
    logs = list(getattr(goal, "progress_logs").all())
    if not logs:
        return {"streak_days": 0, "commits_this_week": 0, "last_activity": None}
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    commits_this_week = sum(1 for log in logs if log.logged_at >= week_ago)
    last_activity = max(log.logged_at for log in logs).isoformat()
    day_set = {log.logged_at.date() for log in logs}
    today = now.date()
    cursor = today if today in day_set else today - timedelta(days=1)
    streak = 0
    while cursor in day_set:
        streak += 1
        cursor -= timedelta(days=1)
    return {
        "streak_days": streak,
        "commits_this_week": commits_this_week,
        "last_activity": last_activity,
    }


def _progress_pct(goal):
    if goal.goal_type == Goal.GOAL_TYPE_COUNTER:
        if not goal.target:
            return None
        total = sum(log.value for log in goal.progress_logs.all())
        return round(total / goal.target * 100)
    if goal.goal_type == Goal.GOAL_TYPE_CHECKLIST:
        items = list(goal.items.all())
        if not items:
            return 0
        done = sum(1 for item in items if item.completed)
        return round(done / len(items) * 100)
    if goal.goal_type == Goal.GOAL_TYPE_MANUAL:
        logs = list(goal.progress_logs.all())
        if goal.target and goal.target > 0:
            return min(100, round(len(logs) / goal.target * 100))
        return min(100, len(logs) * 20) if logs else 0
    return None


class DashboardView(APIView):
    """7 queries by construction: goals + 2 prefetches + weekly count +
    streak dates + history + external profiles read. The smoke test pins
    this with assertNumQueries."""

    def get(self, request):
        user_id = request.user_id
        now = timezone.now()
        week_start = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        goals = (
            Goal.objects.filter(user_id=user_id, status=Goal.STATUS_ACTIVE)
            .prefetch_related("items", "progress_logs")
            .order_by("-start_at")
        )
        active = [
            {
                "id": str(goal.id),
                "title": goal.title,
                "goal_type": goal.goal_type,
                "goal_template": goal.goal_template,
                "target": goal.target,
                "progress_pct": _progress_pct(goal),
            }
            for goal in goals
        ]

        week_completed = Goal.objects.filter(
            user_id=user_id,
            status=Goal.STATUS_COMPLETED,
            finished_at__gte=week_start,
        ).count()

        day_values = list(
            ProgressLog.objects.filter(user_id=user_id).dates(
                "logged_at", "day", order="DESC"
            )
        )
        day_set = set(day_values)
        today = now.date()
        cursor = today if today in day_set else today - timedelta(days=1)
        streak = 0
        while cursor in day_set:
            streak += 1
            cursor -= timedelta(days=1)

        history_logs = (
            ProgressLog.objects.filter(user_id=user_id)
            .select_related("goal")
            .order_by("-logged_at")[:10]
        )
        history = [
            {
                "id": str(log.id),
                "goal_id": str(log.goal_id),
                "goal_title": log.goal.title,
                "value": log.value,
                "note": log.note,
                "logged_at": log.logged_at,
            }
            for log in history_logs
        ]
        return Response(
            {
                "active_goals": active,
                "week_completed_count": week_completed,
                "streak_days": streak,
                "history": history,
                # External Supabase table; nulls when unavailable (see
                # apps/accounts/profiles.py). TODO: confirm real schema.
                "profile": get_profile_stats(user_id),
            }
        )


class GoalCheckinView(APIView):
    """On-demand check-in only (Decision 1). No auto-triggers, no background
    jobs. AI is best-effort: failure stores + returns the generic fallback."""

    throttle_classes = [GoalsBurstThrottle]

    def post(self, request, goal_id):
        goal = get_object_or_404(Goal, pk=goal_id, user_id=request.user_id)
        logs = list(goal.progress_logs.all())
        current_progress = _current_progress(goal, logs)
        goal_data = {
            "title": goal.title,
            "goal_type": goal.goal_type,
            "target": goal.target,
            "domain": goal.domain,
            "status": goal.status,
        }
        try:
            message = ai_module.generate_checkin(
                str(goal.id), goal_data, current_progress
            )
            if not isinstance(message, str) or not message.strip():
                raise ValueError("empty check-in")
            message = message.strip()[:5000]
        except Exception:
            logger.warning(
                "ai_module.generate_checkin failed; using generic check-in",
                exc_info=True,
            )
            message = GENERIC_CHECKIN
        checkin = CheckIn.objects.create(goal=goal, ai_message=message)
        return Response(
            {
                "check_in_message": message,
                "check_in_id": str(checkin.id),
                "created_at": checkin.checked_in_at,
            },
            status=status.HTTP_201_CREATED,
        )


def _current_progress(goal, logs):
    """Shared progress math for check-in/finalize: counter=sum, checklist=
    completed count, manual=latest value or 0. Never raises on empty logs."""
    if goal.goal_type == Goal.GOAL_TYPE_COUNTER:
        return sum(log.value for log in logs)
    if goal.goal_type == Goal.GOAL_TYPE_CHECKLIST:
        return goal.items.filter(completed=True).count()
    if logs and _is_int(logs[0].value):
        return logs[0].value
    return 0


class CheckinRespondView(APIView):
    """POST /api/goals/:id/checkins/:checkin_id/respond — store the user's
    reply on an existing check-in. No new Nemotron call (verdict_preview is
    a deterministic acknowledgement, not AI)."""

    def post(self, request, goal_id, checkin_id):
        goal = get_object_or_404(Goal, pk=goal_id, user_id=request.user_id)
        checkin = get_object_or_404(CheckIn, pk=checkin_id, goal=goal)
        data = request.data if isinstance(request.data, dict) else {}
        reply = clean_text(data.get("user_response"), field="user_response", max_length=2000)
        checkin.user_response = reply
        checkin.save(update_fields=["user_response"])
        return Response(
            {
                "id": str(checkin.id),
                "goal_id": str(goal.id),
                "status": "responded",
                "user_response": reply,
                "verdict_preview": "Noted — keep pushing toward your target.",
            }
        )


class ChatParseGoalView(APIView):
    """POST /api/chat/parse-goal — proposal only, no DB write.
    Frontend shows the proposal, then creates via POST /api/goals {text}."""

    throttle_classes = [GoalsBurstThrottle]

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        prompt = clean_text(data.get("prompt"), field="prompt", max_length=500)
        stripped = prompt.strip()
        lower = stripped.lower()

        # Check for greetings
        if re.match(r"^(hi|hello|hey|heya|howdy|yo|sup|hiya|greetings|good\s+(morning|afternoon|evening|day))[\s!.]*$", stripped, re.IGNORECASE):
            return Response({
                "ai_response_text": "Hey there! Ready to hit your targets today? Tell me what you'd like to achieve (e.g., 'Sell 4 books today' or 'Run 5km weekly'), and I'll configure a live tracker for you.",
                "goal_proposal": None,
                "is_goal": False,
            })

        # Check for casual affirmations / acknowledgments
        if re.match(r"^(ok|okay|cool|nice|thanks|thank you|thx|ty|got it|awesome|great|sure|alright|perfect|sounds good|yes|no)[\s!.]*$", stripped, re.IGNORECASE):
            return Response({
                "ai_response_text": "Locked in! Whenever you're ready to log progress or start tracking a new goal, just say the word.",
                "goal_proposal": None,
                "is_goal": False,
            })

        # Too short or generic questions without action target
        if len(stripped) < 4 and not any(char.isdigit() for char in stripped):
            return Response({
                "ai_response_text": "I'm your AI accountability coach. Tell me what goal or target you'd like to work on!",
                "goal_proposal": None,
                "is_goal": False,
            })

        goal_type, target, items, domain, deadline, summary, goal_template, used_fallback = parse_goal_safely(prompt)
        proposal = {
            "title": summary or prompt[:255],
            "goal_type": goal_type,
            "goal_template": goal_template,
            "target": target,
            "items": items,
            "domain": domain,
            "deadline": deadline.date().isoformat() if deadline else None,
            "summary": summary or "",
        }
        if used_fallback:
            ai_text = "Got it — I set this up as a manual goal. You can adjust the details."
        elif goal_type == "checklist":
            ai_text = f"Understood! I structured this as a checklist with {len(items)} items."
        else:
            ai_text = f"Understood! I structured this as a {goal_type} goal (target {target})."
        return Response({"ai_response_text": ai_text, "goal_proposal": proposal, "is_goal": True})


class GoalFinalizeView(APIView):
    def post(self, request, goal_id):
        goal = get_object_or_404(Goal, pk=goal_id, user_id=request.user_id)
        logs = list(goal.progress_logs.all())
        if goal.goal_type == Goal.GOAL_TYPE_COUNTER:
            result_value = sum(log.value for log in logs)
        elif goal.goal_type == Goal.GOAL_TYPE_CHECKLIST:
            result_value = goal.items.filter(completed=True).count()
        else:
            result_value = logs[0].value if logs else None  # logs are newest-first

        used_fallback = False
        final_progress = result_value if _is_int(result_value) else 0
        goal_data = {
            "title": goal.title,
            "goal_type": goal.goal_type,
            "target": goal.target,
            "domain": goal.domain,
            "status": goal.status,
        }
        try:
            verdict = ai_module.generate_verdict(
                str(goal.id), goal_data, final_progress
            )
            if not isinstance(verdict, str) or not verdict.strip():
                raise ValueError("empty verdict")
            verdict = verdict.strip()[:5000]
        except Exception:
            logger.warning(
                "ai_module.generate_verdict failed; using generic verdict",
                exc_info=True,
            )
            verdict = GENERIC_VERDICT
            used_fallback = True

        goal.result_value = result_value
        goal.verdict = verdict
        goal.status = Goal.STATUS_COMPLETED
        goal.finished_at = timezone.now()
        goal.save(
            update_fields=["result_value", "verdict", "status", "finished_at"]
        )
        payload = GoalSerializer(goal).data
        payload["ai_fallback_used"] = used_fallback
        return Response(payload)
