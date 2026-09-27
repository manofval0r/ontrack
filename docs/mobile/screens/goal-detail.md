# Goal Detail — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Show a selected goal’s target, tracker, updates, history, check-ins, and verdict. Per the mobile guide, detail opens as a full-screen modal; the user can still reach the goal list beneath it after dismissal.

## Navigation Context

Opened by tapping a Home/Goals card or notification deep link. Presented as a full-screen modal with a visible close action and native back gesture. Work-Block Overlay is launched from this surface.

## Layout

Safe-area top row with close, concise goal title, and overflow actions; scrollable goal header and tracker; check-in/status region; progress history; bottom action row for Request Check-In and Start Work Session where available.

```text
┌────────────────────────────┐
│ ‹ Goals      Goal title  ⋯ │ [REACH ZONE]
│ target · deadline · status │
│ progress summary           │
│                            │
│ [dynamic tracker]          │
│                            │
│ [Request check-in]         │
│ Progress history     View  │
│ [recent update]            │
│                            │
│ [ Start Work Session ]     │ [THUMB ZONE]
│ bottom safe area           │
└────────────────────────────┘
```

## Visual Direction

- Background: light neutral with white surfaces; navy/turquoise shared tokens.
- Primary element: tracker action/current progress, with title and deadline visible in the header.
- Depth/Layering: full-height sheet with stable surface; confirmation dialogs use native modal treatment.
- 3D elements: progress ring is optional and unapproved; prefer clear bar/number until tested.
- Animation: bottom-up presentation and interactive dismiss where safe; reduced-motion equivalent.

## Component Inventory

| Component           | RN Primitive / Library      | State                     | Notes                                             |
| ------------------- | --------------------------- | ------------------------- | ------------------------------------------------- |
| Modal shell         | Native stack modal / screen | Open/closing              | Navigation library TBD.                           |
| Goal header         | `View`, `Text`, `Pressable` | Active/completed/missed   | Close, title, status, deadline.                   |
| Dynamic tracker     | Counter/checklist/manual    | Editing/saving/error      | Reuse mobile feature spec.                        |
| Check-in section    | List/card                   | Pending/responded/empty   | Request action visibility policy TBD.             |
| Progress history    | `FlatList` / timeline       | Empty/populated           | May open a history sheet; not required initially. |
| Verdict panel       | Result component            | Not ready/achieved/missed | Existing verdict data contract TBD.               |
| Work session action | `Pressable`                 | Available/active          | Launches full-screen overlay.                     |

## Touch Targets

| Element            | Min Size    | Position          | Gesture Type     |
| ------------------ | ----------- | ----------------- | ---------------- |
| Close              | 44pt / 48dp | Top leading       | Tap; system back |
| Overflow menu      | 44pt / 48dp | Top trailing      | Tap              |
| Tracker controls   | 44pt / 48dp | Main content      | Tap/check/input  |
| Request Check-In   | 48pt high   | Lower content     | Tap              |
| Start Work Session | 48pt high   | Bottom thumb zone | Tap              |

## States

### Default

Goal header and matching tracker, with check-ins/history below.

### Empty

Goal not found/removed: explain and offer return to Goals; never show a blank modal.

### Loading

Show goal header placeholder and tracker skeleton; retain modal frame.

### Error

Retry goal/progress fetch; preserve unsaved input locally until retry or explicit discard.

### Completed/missed

Keep read-only goal data and verdict visible; hide actions that cannot apply.

### Deadline elapsed, verdict pending

State policy is open; do not auto-claim a result until service confirms it.

### Unsaved edits

Confirm discard only if the user changed unsaved data; swiping down should not silently lose edits.

## Copy & Microcopy

| Element      | Copy                                  | Notes                                           |
| ------------ | ------------------------------------- | ----------------------------------------------- |
| Close        | “Close goal details”                  | Accessible label.                               |
| Check-in     | “Request a check-in”                  | Availability/throttling rule TBD.               |
| Work session | “Start a work session”                | Opens work-block overlay.                       |
| Error        | “Couldn't load this goal. Try again.” | Proposed.                                       |
| Completion   | “Goal complete” / “Goal missed”       | Outcome labels require agreed status semantics. |

## Gestures

| Gesture                       | Target            | Result                                                          |
| ----------------------------- | ----------------- | --------------------------------------------------------------- |
| Swipe from edge / system back | Modal             | Dismiss to prior tab when no unsaved work.                      |
| Swipe down                    | Full-screen modal | Recommended dismiss gesture; confirm if unsaved edits.          |
| Tap tracker                   | Controls          | Log progress/update checklist/reflection.                       |
| Pull up                       | History section   | No nested sheet recommended initially; use explicit “View all”. |

## Haptics

| Trigger         | Haptic Type          | RN API Call                                                                                           |
| --------------- | -------------------- | ----------------------------------------------------------------------------------------------------- |
| Progress logged | Light impact         | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`; shared map approval needed.                 |
| Goal completed  | Notification success | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` if verdict confirms completion. |

## Animations

| Element        | Trigger       | Animation                          | Library                                          |
| -------------- | ------------- | ---------------------------------- | ------------------------------------------------ |
| Modal          | Open/close    | Platform-native slide from bottom  | Navigation library TBD.                          |
| Progress       | Save succeeds | Short bar/number update            | Reanimated/Animated TBD.                         |
| Checklist item | Toggle        | Check transition                   | Native/reduced-motion fallback.                  |
| Verdict        | Arrives       | Small emphasis, no forced confetti | Reanimated/Animated TBD; respect reduced motion. |

## Safe Area

- Top: Modal header below cutout/status bar.
- Bottom: Scroll content and persistent actions clear home indicator; use bottom inset.
- Landscape: Scroll; keep close visible and tracker actions reachable.

## Platform Notes

- iOS: Support edge-swipe and swipe-down dismissal; coordinate gestures so tracker rows do not conflict.
- Android: System back dismisses modal; hardware/gesture back should confirm unsaved changes.

## API Calls

| Endpoint                  | Method | Trigger                               | Response used for                              |
| ------------------------- | ------ | ------------------------------------- | ---------------------------------------------- |
| Goal detail               | TBD    | Open modal / refresh                  | Goal, tracker, status, deadline.               |
| Progress update           | TBD    | Tracker action                        | Persist new progress and history item.         |
| Check-in request/response | TBD    | Request/respond                       | Check-in state and assistant content.          |
| Finalize/verdict          | TBD    | Explicit finalize or deadline service | Status and verdict; trigger policy unresolved. |

## Accessibility

- Modal title and close action announced; focus moves into the modal and returns to originating card on close.
- Progress uses accessible values; tracker controls expose state and result.
- Do not trap focus or require gestures to exit.
- At least 44pt/48dp targets and WCAG 2.2 AA contrast; test with VoiceOver/TalkBack.

## References to Feature Docs

- [Dynamic tracker](../features/dynamic-tracker/mobile-design.md)
- [Work-block](../features/work-block/mobile-design.md)
- [Verdict](../features/verdict/mobile-design.md)
