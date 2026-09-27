# Goal Card — Mobile Feature Design

## Purpose

Summarize one goal in Home and Goals lists so a user can understand status and open the Goal Detail screen quickly.

## Anatomy and Hierarchy

1. Goal title (up to two lines without truncating the only identifier).
2. Status label and deadline/remaining time.
3. Numeric progress and labeled progress bar when a measurable target exists.
4. Optional domain label; no domain-specific card fill unless color system is approved.
5. Entire row opens Goal Detail; separate overflow menu only for confirmed actions.

## Variants and States

Active, due soon, overdue, completed, missed, no deadline, counter/checklist/manual, loading skeleton, and error. Define status precedence when due soon and active overlap. Do not show countdown in multiple competing formats.

## Interaction

- Recommended vertical cards/list rows for thumb scroll and comparison.
- Tap row opens detail; swipe-to-delete/complete is not recommended by default. Any quick action needs an explicit, reversible affordance.
- Long-press context menu is not part of baseline.

## Visual Direction

Current mobile palette and typography; neutral surfaces, navy text, turquoise progress, teal success. Use borders/separators to create scan hierarchy and avoid nested cards. Tap feedback only; no parallax.

## Accessibility

Accessible action name includes goal title/status; progress exposes value/max and unit; status is text, not color-only. Support dynamic type and 44pt/48dp touch targets.

## Open Decisions

Maximum cards/active goals, domain taxonomy, sorting/pinning, deadline thresholds, overflow actions, and whether a focus goal is pinned.

## API Calls

Consumes goal model with title, type, target/current value, unit, deadline, and status; exact schema must match web.

## References

- [Home](../../screens/home.md)
- [Goals list](../../screens/goals.md)
- [Goal card web spec](../../../web-design/features/goal-card.md)
