"""Verdict engine v1 (M2).

A verdict is a claim about whether a goal was met. It therefore has to be
*derived*, not narrated. The AI writes the sentence; the numbers come from
here, so a free model being unavailable or verbose can never inflate a score.

Scoring, in order:
  1. completion = current / target (target <= 0 -> no target, fall back to logs)
  2. pace       = fraction of the window already elapsed (deadline - start)
  3. score      = completion x 100, scaled by pace when behind, halved when
                  the goal is finalized after its deadline
  4. passed     = completion >= 0.8 and not overdue

Pure functions, no DB, no clock read inside the math (callers pass `now`) so
tests pin exact numbers.
"""
from datetime import datetime, timezone as dt_timezone

# Completion at or above this fraction counts as met.
PASS_THRESHOLD = 0.8
# Floor on the pace multiplier: a slow start still earns credit for the work
# actually shipped, it is never multiplied to zero.
MIN_PACE_FACTOR = 0.5
# Penalty for closing a goal after its deadline.
OVERDUE_FACTOR = 0.5
# Log count treated as "done" for targetless goals.
LOGS_AS_TARGET = 3


def completion_fraction(current, target):
    """0.0-1.0+ share of target shipped. Targetless goals score by log count."""
    if isinstance(target, int) and target > 0:
        return max(0.0, current / target)
    return min(1.0, current / float(LOGS_AS_TARGET))


def _aware(dt):
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=dt_timezone.utc)
    return dt


def pace_fraction(start_at, deadline, now):
    """Share of the goal's window already spent, clamped to (0, 1]. None when
    the goal has no usable window (no deadline, or deadline before start)."""
    start = _aware(start_at)
    end = _aware(deadline)
    if start is None or end is None or end <= start:
        return None
    now = _aware(now) or datetime.now(dt_timezone.utc)
    return max(0.0, min(1.0, (now - start).total_seconds() / (end - start).total_seconds()))


def score_goal(current, target, *, start_at=None, deadline=None, now=None, overdue=None):
    """Return (score 0-100, passed, completion, pace).

    `overdue` defaults to "deadline is in the past" so callers that already
    know (a sweep flipping status to missed) can pass it explicitly.
    """
    now = _aware(now) or datetime.now(dt_timezone.utc)
    completion = completion_fraction(current, target)
    if overdue is None:
        deadline_aware = _aware(deadline)
        overdue = bool(deadline_aware and now > deadline_aware)

    factor = 1.0
    if overdue:
        factor = OVERDUE_FACTOR
    else:
        pace = pace_fraction(start_at, deadline, now)
        if pace is not None and pace > 0 and completion < pace:
            # Behind schedule: scale by how far behind, never below the floor.
            factor = max(MIN_PACE_FACTOR, completion / pace)

    score = int(round(min(1.0, completion) * factor * 100))
    passed = (not overdue) and completion >= PASS_THRESHOLD
    return max(0, min(100, score)), passed, completion, pace_fraction(start_at, deadline, now)


def verdict_text(current, target, *, unit="", passed=False, overdue=False, score=0):
    """One honest sentence built from the numbers. The AI may add color on top
    of this; it may not contradict it."""
    completion = completion_fraction(current, target)
    pct = int(round(completion * 100))
    if overdue:
        head = f"Closed after the deadline at {score}/100."
    elif passed:
        head = f"Met it — {score}/100."
    else:
        head = f"Missed it — {score}/100."
    if isinstance(target, int) and target > 0:
        detail = f" {current} of {target}{(' ' + unit) if unit else ''} shipped ({pct}%)."
    else:
        detail = f" {current} update{('' if current == 1 else 's')} logged."
    if passed:
        tail = " Verdict: you did what you said you'd do."
    elif overdue:
        tail = " Verdict: the deadline was the commitment; it passed unmet."
    else:
        tail = " Verdict: the target is still unmet."
    return head + detail + tail
