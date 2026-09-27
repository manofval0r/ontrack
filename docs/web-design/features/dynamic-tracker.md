# Dynamic Tracker — Feature Design

## Status

Three tracker components are present and selected by `goal_type` in onboarding preview and the dedicated goal workspace. The type is supplied by local keyword rules or fixture data, not an AI service in the current frontend.

## Type Selection

`counter` renders a numeric count, `checklist` renders milestone items, and `manual` renders a qualitative reflection form. Unknown/missing types have no documented fallback. Mid-goal type conversion is not supported.

## Tracker Variants

| Type      | Current anatomy                                                                                                            | Interaction and feedback                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Counter   | Current/target values, percentage, decrement 1, increment 1, increment 5 (hidden below `sm`), progress bar, optional note. | Async callback sets a submitting state; no dedicated success animation beyond bar/button transitions.     |
| Checklist | Completed count/percentage, progress bar, item rows with checked styling, add-item form.                                   | Click toggles item; local optimistic update; row currently uses a clickable `div`, not a native checkbox. |
| Manual    | Sentiment selection, reflection textarea, submit button, recent log list.                                                  | Entry is added to local log; sentiment options use color plus icon/label.                                 |

## Progress Display

- Counter uses a large number and horizontal progress bar; no ring is present.
- Checklist uses completion count and horizontal progress bar.
- Manual tracker displays number of entries, not a target-based completion percentage.
- Percentages are capped at 100 for counters; zero-target behavior should be validated.

## Loading, Error, and Completion

- Controls disable while their update callback is pending in the component.
- No consistent per-tracker error message or rollback design is specified.
- Counter displays “Goal Reached!” when value meets target; checklist does not have a distinct completed celebration state.
- The tracker does not itself produce a final verdict or automatically change type.

## Accessibility

- Use native buttons/checkboxes and expose pressed/checked state; current checklist rows need keyboard semantics.
- Give progress bars accessible labels/current values and announce updates without excessive speech.
- Ensure sentiment is a single-choice control with a non-color selected indicator.
- Maintain focus after adding items or submitting a log.

## Open Decisions

- Whether target and deadline can be edited in place.
- How to handle empty checklists, duplicate/reordered items, invalid values, units, and updates exceeding target.
- Whether tracker type can change mid-goal and how old progress is migrated.
- Whether progress indicator should remain a bar, add a ring, and what completion motion/haptic-equivalent is appropriate.
- Reconcile color use across variants (current checklist uses green and manual uses purple despite shared brand guidance).

## References

- [Goal workspace](../screens/goal-workspace.md)
- [Onboarding goal entry](../screens/onboarding-create-goal.md)
- [Onboarding ready](../screens/onboarding-goal-ready.md)
