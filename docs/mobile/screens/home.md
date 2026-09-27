# Home / Dashboard — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Give the user a fast read on what needs attention and a one-thumb path to create a goal or resume work. This is Tab 1, “Home”. Recommendations below fill unanswered prompts and remain subject to product approval.

## Navigation Context

Visible after successful signup/login. Bottom tabs: Home, Chat, Goals, Settings. Goal cards open the Goal Detail full-screen modal. New Goal opens a Goal Creation modal. Notification links can open a goal detail if the destination is valid.

## Layout

Portrait, 390pt reference. Scrollable content beneath a compact safe-area header; New Goal remains in the lower-right thumb zone.

```text
┌────────────────────────────┐
│ safe area  Good morning    │
│ Israel              🔥 14  │
│                            │
│ TODAY'S FOCUS              │
│ [urgent goal + progress]   │
│                            │
│ Due soon                   │
│ [goal row]                 │
│                            │
│ Active goals         See all│
│ [goal card]                │
│ [goal card]                │
│                            │
│                 [+ Goal]   │ [THUMB ZONE]
│ Home Chat Goals Settings   │
│ bottom safe area           │
└────────────────────────────┘
```

Recommended hierarchy: time-of-day greeting and streak; optional Today's Focus only when a goal can be deterministically selected; due-soon list; vertical active-goal list; small, real-data stats only after metric definitions exist. FAB opens goal creation. Empty state replaces lists with one clear first-goal CTA.

## Visual Direction

- Background: `#F8FAFB` / white with navy text, turquoise primary progress/action, teal success, aqua secondary accent; Fraunces/DM Sans.
- Primary element: next actionable goal and progress, not decorative metrics.
- Depth/Layering: compact tactile surfaces; preserve card radius/shadow only if it remains legible at phone density.
- 3D elements: none recommended.
- Animation: subtle press feedback and progress change; respect reduced motion.

## Component Inventory

| Component       | RN Primitive / Library      | State                         | Notes                                                               |
| --------------- | --------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| Home header     | `View`, `Text`, `Pressable` | Greeting/streak               | Date optional; avoid crowding.                                      |
| Today's Focus   | Goal summary component      | Present/absent                | Selection rule must be defined; do not silently pin arbitrary goal. |
| Due soon        | Horizontal section/list     | Empty/populated               | Avoid duplicating every goal if no urgency.                         |
| Active goals    | `FlatList`                  | Loading/empty/populated/error | Vertical list recommended.                                          |
| Stats summary   | Text/stat tiles             | Data/hidden                   | Only verified metrics; no demo values.                              |
| New Goal FAB    | `Pressable`                 | Default                       | Opens Goal Creation modal.                                          |
| Bottom tabs     | Navigation tab bar          | Home active                   | Persistent per guide; badge behavior pending.                       |
| Pull-to-refresh | `RefreshControl`            | Refreshing                    | Recommended for remote data.                                        |

## Touch Targets

| Element         | Min Size                    | Position                | Gesture Type  |
| --------------- | --------------------------- | ----------------------- | ------------- |
| Bottom tab item | 44pt / 48dp                 | Bottom safe area        | Tap           |
| Goal card       | 48pt high minimum           | Main list               | Tap to detail |
| New Goal FAB    | 48pt minimum, preferably 56 | Bottom-right thumb zone | Tap           |
| Refresh control | Native minimum              | List top                | Pull          |

## States

### Default

Greeting, urgent focus (if one qualifies), due-soon items, active goals, and FAB.

### Empty

Brief welcome, explain first-goal value in one sentence, primary “Create your first goal” action; no empty chart decoration.

### Loading

Use content-shaped skeletons or a concise loader; preserve tab bar and FAB only if action is safe before data loads.

### Error

Inline retry for dashboard fetch; retain cached data when available and distinguish stale content.

### Data edge cases

No active goals, only completed goals, no deadlines, overdue goals, or timezone mismatch each need an explicit label/order rule.

## Copy & Microcopy

| Element        | Copy                     | Notes                                          |
| -------------- | ------------------------ | ---------------------------------------------- |
| Greeting       | “Good morning, [name]”   | Time-based; fallback “Welcome back”.           |
| Focus header   | “Today's focus”          | Only show with a defined selection rule.       |
| Due section    | “Due today” / “Due soon” | Define time window and local timezone.         |
| Empty state    | “Start with one goal.”   | Proposed.                                      |
| Primary action | “New goal”               | FAB accessible name includes verb and purpose. |

## Gestures

| Gesture         | Target     | Result                                                             |
| --------------- | ---------- | ------------------------------------------------------------------ |
| Tap             | Goal card  | Open Goal Detail modal.                                            |
| Pull down       | Goals list | Refresh remote data, if supported.                                 |
| Swipe goal card | Goal card  | No destructive swipe action recommended; use explicit menu/action. |
| Tap FAB         | New Goal   | Open Goal Creation modal.                                          |

## Haptics

| Trigger                   | Haptic Type         | RN API Call                                                             |
| ------------------------- | ------------------- | ----------------------------------------------------------------------- |
| Open goal / tab selection | Selection, optional | `Haptics.selectionAsync()`; include only if shared haptic map approves. |

## Animations

| Element      | Trigger      | Animation               | Library                                          |
| ------------ | ------------ | ----------------------- | ------------------------------------------------ |
| Goal card    | Press        | Native pressed state    | `Pressable`                                      |
| List refresh | Pull         | Platform-native spinner | `RefreshControl`                                 |
| Progress     | New response | Short fill transition   | Reanimated/Animated TBD; respect reduced motion. |

## Safe Area

- Top: Safe-area inset for status bar, notch, Dynamic Island.
- Bottom: Tab bar sits above home indicator/system navigation; scroll content gets matching bottom padding.
- Landscape: Keep list usable; FAB must not obscure rows.

## Platform Notes

- iOS: Use native pull-to-refresh and safe-area-aware tab bar; support edge navigation into Goal Detail.
- Android: Use native refresh affordance and system back; prevent FAB overlap with gesture/system navigation insets.

## API Calls

| Endpoint          | Method | Trigger                      | Response used for                                            |
| ----------------- | ------ | ---------------------------- | ------------------------------------------------------------ |
| Dashboard summary | TBD    | Home focus / pull-to-refresh | Goals, activity, and defined metrics; contract not supplied. |
| Goals list        | TBD    | Initial load / refresh       | Active goal rows and status.                                 |

## Accessibility

- VoiceOver/TalkBack order: greeting → focus → due-soon → active list → FAB → tabs.
- Announce loading/refresh completion and changed goal progress; chart/stat values need text equivalents.
- Minimum targets 44pt iOS / 48dp Android; never encode urgency by color alone.
- Contrast audit remains required.

## References to Feature Docs

- [Goal card](../features/goal-card/mobile-design.md)
- [Stats & charts](../features/stats-charts/mobile-design.md)
