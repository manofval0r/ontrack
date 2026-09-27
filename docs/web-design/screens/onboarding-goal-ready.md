# Onboarding — Goal Ready — Design Document

## Purpose

Show the first parsed goal and allow a visitor to interact with its tracker preview before starting. This is step 4 of `/onboarding`; the intervening step 3 is a short local loading transition.

## User Goal

Check whether the inferred goal type and target feel right, optionally test the tracker, and begin tracking.

## Layout

Four-segment progress header; celebratory header panel with illustration and goal summary; rendered counter, checklist, or manual tracker; primary “Start tracking” action; secondary link back to edit the goal. There is no account creation prompt or parsed-field editing form.

## Visual Direction

- Background: pale dot grid, navy/turquoise palette.
- Primary element: tracker preview and “Your tracker is ready!” heading.
- Depth/Layering: large tactile panels with navy borders and offset shadows.
- Animation: fade-in on state change; tracker controls retain their normal tactile interactions.
- 3D elements: none.

## Component Inventory

| Component            | Type                               | State          | Notes                                                                     |
| -------------------- | ---------------------------------- | -------------- | ------------------------------------------------------------------------- |
| Progress indicator   | Progressbar                        | Step 4 of 4    | Header.                                                                   |
| Ready summary        | Illustration, title, summary       | Default        | Shows inferred tracker label and original text.                           |
| Tracker preview      | Counter/checklist/manual component | Interactive    | Edits local preview state only.                                           |
| Start tracking       | Primary button                     | Idle/finishing | Creates the goal via local GoalContext adapter, then routes to dashboard. |
| Try a different goal | Text button                        | Default        | Returns to step 2; goal text persists.                                    |

## States

### Default

Parsed tracker preview is shown at initial progress.

### Empty

Not applicable after a nonempty submission.

### Loading

CTA changes to “Entering Dashboard…” while local create is pending.

### Error

A create failure is logged to console but the `finally` block still marks onboarding complete and navigates to dashboard. This is a prototype limitation, not the intended error design.

### Edited preview

Counter/checklist/manual controls can mutate in-memory preview values before saving; behavior should be confirmed for persistence.

## Copy & Microcopy

| Element          | Copy                                                                 | Notes                                                        |
| ---------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| Status label     | “★ Tracker Configured”                                               | Current copy.                                                |
| Heading          | “Your tracker is ready!”                                             | Current copy.                                                |
| Summary          | “We built a customized [counter/checklist/log] tracker for: [goal].” | Keyword heuristic output.                                    |
| Primary CTA      | “Start tracking”                                                     | Saves locally and goes to dashboard; does not prompt signup. |
| Secondary action | “Not quite right? Try a different goal”                              | Returns to goal entry.                                       |

## Interactions

| Trigger                 | Action                                           | Animation                          | Result                                    |
| ----------------------- | ------------------------------------------------ | ---------------------------------- | ----------------------------------------- |
| Use preview control     | Change preview value/items/log                   | Tracker-specific                   | Local preview state updates.              |
| Select primary CTA      | Call `createGoal`, set onboarding flag, navigate | Button label changes while pending | Dashboard.                                |
| Select secondary action | Set step to 2                                    | Fade-in                            | Previously entered text remains in state. |
| Select back arrow       | Set step to 2                                    | Fade-in                            | Same input state retained.                |

## API Calls

| Endpoint                                   | Method             | Trigger        | Response used for                                         |
| ------------------------------------------ | ------------------ | -------------- | --------------------------------------------------------- |
| `api.createGoal` (simulated local adapter) | Mock POST contract | Start tracking | Adds goal to browser `localStorage`; not an HTTP request. |

## Responsive Behavior

- 1440px: Header summary pairs illustration and text; tracker spans constrained content width.
- 1024px: Same composition, tracker forms adapt through their own responsive layouts.
- 768px: Summary stacks illustration above text; primary action remains centered and the tracker becomes single-column.

## Accessibility

- Native buttons and tracker inputs provide keyboard access; verify tracker-specific focus and state announcements.
- Progress preview changes and completion need accessible status announcements.
- CTA pending state should expose a disabled/busy state and report create failures instead of silently navigating.
- No contrast or screen-reader audit completed.

## References to Feature Docs

- [Dynamic tracker](../features/dynamic-tracker.md)
