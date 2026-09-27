# Goals List — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Let users scan active and past goals, filter by outcome, and open a goal to work on it. This is Tab 3, “Goals”.

## Navigation Context

Persistent bottom-tab destination. Selecting a goal opens the Goal Detail full-screen modal. New Goal action opens Goal Creation. Home can link to this tab’s filtered list.

## Layout

Safe-area header with “Goals” and a search/filter action; segmented status filter; vertical goal list; optional sort menu. Use a vertical list recommendation rather than horizontal carousels so titles, progress, and deadlines remain scannable.

```text
┌────────────────────────────┐
│ Goals                 Search│
│ [Active] [Done] [Missed]   │
│ Sort: Deadline soonest     │
│                            │
│ [goal title                │
│  progress bar · due date]  │
│ [goal title                │
│  progress bar · due date]  │
│                            │
│                 [+ Goal]   │ [THUMB ZONE]
│ Home Chat Goals Settings   │
└────────────────────────────┘
```

## Visual Direction

- Background: shared light neutral, navy text, turquoise progress; consistent with mobile Home.
- Primary element: goal title and progress/deadline in each list item.
- Depth/Layering: low elevation; compact row cards, avoid nested card-in-card treatment.
- 3D elements: none.
- Animation: filter transition and pressed state only; no swipe-to-delete animation recommended.

## Component Inventory

| Component       | RN Primitive / Library                 | State                         | Notes                                                            |
| --------------- | -------------------------------------- | ----------------------------- | ---------------------------------------------------------------- |
| Header          | `View`, `Text`, `Pressable`            | Default/search                | Search behavior TBD.                                             |
| Status filter   | Segmented control / accessible buttons | Active/completed/missed       | No color-only state.                                             |
| Goal list       | `FlatList`                             | Loading/empty/error/populated | Vertical, stable keys.                                           |
| Goal card       | Shared GoalCard                        | Status/progress               | Link semantics and progress label.                               |
| Sort control    | `Pressable` + action sheet             | Deadline/recent/etc.          | Default ordering recommendation: nearest deadline, active first. |
| New Goal action | FAB or header action                   | Default                       | Reuse Home placement decision.                                   |

## Touch Targets

| Element       | Min Size          | Position         | Gesture Type  |
| ------------- | ----------------- | ---------------- | ------------- |
| Status filter | 44pt / 48dp       | Top content      | Tap           |
| Goal card     | 48pt high minimum | List             | Tap to detail |
| Search/sort   | 44pt / 48dp       | Header/trailing  | Tap           |
| New Goal      | 48pt / 48dp       | Thumb zone       | Tap           |
| Bottom tab    | 44pt / 48dp       | Bottom safe area | Tap           |

## States

### Default

Active goals shown first; recommend nearest deadline first with completed/missed in their filters.

### Empty

Filter-specific copy: “No active goals yet”, “No completed goals yet”, “No missed goals”. Provide a create action only where appropriate.

### Loading

Skeleton rows that match final card height.

### Error

Retry control with current filter preserved.

### Search

No-result state, clear query action, and preserved filters; search scope is an open decision.

### Long list

Virtualized rows, stable scroll position when goal updates.

## Copy & Microcopy

| Element      | Copy                            | Notes                                                       |
| ------------ | ------------------------------- | ----------------------------------------------------------- |
| Title        | “Goals”                         | Tab title.                                                  |
| Filters      | “Active”, “Completed”, “Missed” | Match status semantics with API model.                      |
| Empty active | “No active goals yet.”          | Proposed; CTA “Create a goal”.                              |
| Sort         | “Deadline soonest”              | Recommended default; timezone and no-deadline behavior TBD. |

## Gestures

| Gesture            | Target    | Result                                                     |
| ------------------ | --------- | ---------------------------------------------------------- |
| Tap                | Goal card | Open Goal Detail.                                          |
| Swipe horizontally | Goal card | No destructive quick action by default; use explicit menu. |
| Pull down          | List      | Refresh if backend supports it.                            |
| Long-press         | Goal card | No context menu recommended until actions are defined.     |

## Haptics

| Trigger       | Haptic Type         | RN API Call                                           |
| ------------- | ------------------- | ----------------------------------------------------- |
| Filter change | Selection, optional | `Haptics.selectionAsync()` if included in shared map. |

## Animations

| Element       | Trigger       | Animation                  | Library                          |
| ------------- | ------------- | -------------------------- | -------------------------------- |
| Filtered list | Filter select | Short crossfade/row update | Native layout or Reanimated TBD. |
| Goal card     | Press         | Native feedback            | `Pressable`.                     |

## Safe Area

- Top: Header respects status/cutout inset.
- Bottom: List padding clears tab bar and home indicator; FAB sits above tab bar.
- Landscape: Keep filter controls horizontal-scrollable if required; list remains vertical.

## Platform Notes

- iOS: Native edge swipe from goal detail returns to list; avoid binding horizontal row swipe.
- Android: Back returns to list/filter/scroll position; system back closes search first if active.

## API Calls

| Endpoint    | Method | Trigger                   | Response used for                                           |
| ----------- | ------ | ------------------------- | ----------------------------------------------------------- |
| Goals list  | TBD    | Enter tab / change filter | Goal rows, status, progress, deadline.                      |
| Goal search | TBD    | Submit query              | Matching goals; may be client-side if list is fully cached. |

## Accessibility

- Filter state uses selected/checked semantics and readable labels.
- Cards announce title, status, progress, and deadline in a useful order.
- Avoid swipe-only actions; expose controls via buttons/menu.
- 44pt/48dp touch target and contrast audit required.

## References to Feature Docs

- [Goal card](../features/goal-card/mobile-design.md)
- [Dynamic tracker](../features/dynamic-tracker/mobile-design.md)
