# Dynamic Tracker — Mobile Feature Design

## Purpose

Render the correct native progress control for a goal type: counter, checklist, or manual reflection. Keep each interaction thumb-friendly and preserve text/accessible progress feedback.

## Tracker Variants

| Type      | Mobile layout                                                                                                                 | Core action                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Counter   | Large current/target numbers; compact progress bar; prominent +1 button in lower area; optional note behind secondary action. | Increment; decrement/edit through a secondary explicit control. |
| Checklist | Full-width rows with native checkbox semantics, short titles, optional add item action.                                       | Toggle one milestone.                                           |
| Manual    | Sentiment choice as accessible single-select; multiline reflection field; submit button; recent entries below.                | Save qualitative log.                                           |

## State and Behavior

- Loading, saving, validation, success, and server error states are consistent across tracker types.
- Disable duplicate submissions while pending; on failure roll back optimistic state or clearly retain an unsaved draft.
- Goal completion is based on server/model status, not solely a local animation.
- Do not change tracker type silently; migration/edit policy is an open backend/product decision.

## Progress Visualization

Use a labeled bar and numeric text for counter/checklist. A ring is optional, not required; avoid duplicate indicators. Manual logs show entry count/history unless an explicit target exists.

## Haptics and Motion

Light impact for confirmed progress, selection haptic for checklist toggle, optional success notification on completed goal. Map approvals belong in the shared haptic doc. Keep motion short and respect reduced-motion preference.

## Accessibility

Native checkbox/switch semantics, accessible progress values, labels/units, screen-reader announcements after save, keyboard/switch access, and non-color selected states. Hit targets 44pt/48dp minimum.

## Open Decisions

Counter bounds and over-target behavior, checklist ordering/deletion, manual sentiment definitions, tracker-type conversion, target editing, offline writes, and progress ring use.

## API Calls

Goal detail/update/progress contracts TBD. Use the same request/response shapes on web and mobile once API parity is agreed.

## References

- [Goal Detail](../../screens/goal-detail.md)
- [Onboarding](../../screens/onboarding.md)
- [Dynamic tracker web spec](../../../web-design/features/dynamic-tracker.md)
- [Mobile index](../../index.md)
