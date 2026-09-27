# Goal Workspace / Goal Detail — Design Document

## Purpose

Let a user work on one goal at `/goal/:id`, inspect its target and status, update its tracker, review check-ins/history, and finalize it for a verdict. Dashboard goal selection also opens a slide-over detail surface with overlapping goal actions.

## User Goal

Understand current progress and take the next concrete action on a goal.

## Layout

Shared `AppLayout` header with a chat CTA; horizontally scrollable goal switcher; goal header; one dynamic tracker chosen by goal type; optional verdict; two-column check-ins and progress log below; finalization confirmation modal. Dashboard offers a separate `GoalDetailSlideOver` entry point.

## Visual Direction

- Background: pale neutral app canvas; white components, navy borders, teal highlights.
- Primary element: tracker-specific progress number/checklist/log.
- Depth/Layering: tactile bordered panels and offset shadows; modal overlays the page.
- Animation: tracker button transitions, progress changes, modal/slide-over transitions.
- 3D elements: no 3D; no distinct progress ring observed.

## Component Inventory

| Component        | Type                    | State                      | Notes                                       |
| ---------------- | ----------------------- | -------------------------- | ------------------------------------------- |
| Goal switcher    | Horizontal link list    | Active goal                | Links to `/goal/:id`.                       |
| GoalHeader       | Summary/actions         | Active/finalizable         | Displays goal metadata and finalize action. |
| CounterTracker   | Numeric tracker         | Increment/decrement/note   | Updates current value.                      |
| ChecklistTracker | Checklist               | checked/unchecked/add item | Persists item list through GoalContext.     |
| ManualTracker    | Reflection form/history | sentiment/entry            | Stores qualitative entries.                 |
| CheckIn          | Check-in panel          | pending/responded          | Uses goal check-in data.                    |
| ProgressLog      | History list            | empty/populated            | Chronological log surface.                  |
| Verdict          | Result panel            | passed/failed              | Shown when goal has a verdict.              |
| Modal            | Finalize confirmation   | open/closed                | Confirms local finalization.                |

## States

### Default

Selected goal loads and the matching tracker renders.

### Empty

If no matching goal is available, show “Goal Not Found” with dashboard CTA.

### Loading

Loader appears while `activeGoal` is absent and context is loading.

### Error

`ErrorState` is shown from GoalContext; retry currently clears the error.

### Completed/missed

Finalized status and verdict are displayed; current mock adapter uses an 80% pass threshold when finalize is explicitly called.

### Deadline

No automatic deadline transition is implemented in this page.

## Copy & Microcopy

| Element        | Copy                                                                         | Notes                                                   |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| Page title     | “Goal Workspace”                                                             | Shared shell title.                                     |
| Subtitle       | “Intelligent execution radar, dynamic tracker, and accountability timeline.” | Product positioning copy.                               |
| Chat CTA       | “Chat with Nemotron”                                                         | Routes to `/chat`.                                      |
| Finalize modal | “Finalize Goal & Run AI Verdict?”                                            | Finalization is user-triggered, not deadline-triggered. |
| Confirm        | “Confirm & Score Verdict”                                                    | Calls local finalize simulation.                        |
| Cancel         | “Keep Tracking”                                                              | Closes modal.                                           |

## Interactions

| Trigger              | Action                       | Animation                     | Result                                   |
| -------------------- | ---------------------------- | ----------------------------- | ---------------------------------------- |
| Select goal switcher | Navigate to another goal URL | Route transition              | Selected goal loads.                     |
| Use tracker controls | Log/update progress          | Component transition          | Goal and progress log update locally.    |
| Respond to check-in  | Call `respondToCheckIn`      | Component state update        | Response recorded through local adapter. |
| Select finalize      | Open confirmation modal      | Modal transition              | User reviews implications.               |
| Confirm finalize     | Call `finalizeGoal`          | Verdict appears on completion | Local threshold-based result.            |

## API Calls

| Endpoint                                | Method    | Trigger                          | Response used for                 |
| --------------------------------------- | --------- | -------------------------------- | --------------------------------- |
| `api.getGoal` (simulated local adapter) | Mock GET  | Select goal                      | Goal object from browser storage. |
| `api.updateGoal`                        | Mock PUT  | Checklist/update                 | Updated goal object.              |
| `api.logProgress`                       | Mock POST | Counter/manual/check-in progress | Updated progress log.             |
| `api.finalizeGoal`                      | Mock POST | Confirm finalize                 | Locally calculated verdict.       |
| `api.respondToCheckIn`                  | Mock POST | Submit response                  | Updated check-in state.           |

## Responsive Behavior

- 1440px: Full-width tracker with check-ins and history side-by-side.
- 1024px: Bottom panels may switch to one column around `lg`; verify tracker control fit.
- 768px: Single-column content; goal switcher scrolls horizontally; counter actions wrap/compact; modal actions remain visible.

## Accessibility

- Goal switcher uses links; trackers should expose checked/pressed state and progress semantically.
- Checklist rows currently use clickable containers; keyboard activation and checkbox semantics need audit.
- Modal needs focus trap, Escape handling, and focus return.
- Progress changes and verdict should be announced; contrast/keyboard audit not complete.

## References to Feature Docs

- [Dynamic tracker](../features/dynamic-tracker.md)
- [Verdict](../features/verdict.md)
- [Work-block](../features/work-block.md) — requested feature not present on this screen.
