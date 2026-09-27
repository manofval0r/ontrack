# Work-Block Overlay — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Support a focused work interval tied to a goal. The mobile guide identifies this as a full-screen overlay and distinctive feature. This is a design proposal; duration, data persistence, and OS capabilities remain to be agreed.

## Navigation Context

Started from Goal Detail. Full-screen modal overlays the app; the bottom tab bar is hidden. A visible, accessible exit remains available. The app cannot reliably prevent a user from closing or backgrounding it.

## Layout

Dark, focused surface over the goal context; goal name and session intent above a prominent remaining-time display; progress summary and pause/exit controls in reachable lower areas.

```text
┌────────────────────────────┐
│ safe area     Work session │
│ Goal title                 │
│                            │
│       25:00                │
│     time remaining         │
│                            │
│ progress · target          │
│ [ Pause ]                  │
│ [ End session ]            │ [THUMB ZONE]
│ bottom safe area           │
└────────────────────────────┘
```

Recommendation: dark focused theme with high-contrast timer, optional circular ring plus numeric countdown, and no “lock” language. Default duration and urgency colors remain decisions; use neutral/teal until a final timing rule is selected.

## Visual Direction

- Background: deep navy `#071E2D` with readable white and turquoise, not a blurred/blocked underlying screen.
- Primary element: remaining session time, always paired with numeric text.
- Depth/Layering: one full-screen surface, minimal controls.
- 3D elements: none.
- Animation: subtle timer/ring updates; no second-by-second screen reader announcements; respect reduced motion.

## Component Inventory

| Component          | RN Primitive / Library                 | State                   | Notes                                                     |
| ------------------ | -------------------------------------- | ----------------------- | --------------------------------------------------------- |
| Full-screen modal  | Native modal/screen                    | Active/exiting          | Must remain escapable.                                    |
| Timer              | `Text` + optional `Animated.View` ring | Running/paused/complete | Persist session semantics TBD.                            |
| Goal context       | `Text`, progress label                 | Active                  | Read-only summary.                                        |
| Pause/resume       | `Pressable`                            | Running/paused          | Decision to include pause pending.                        |
| End session        | `Pressable`                            | Confirm/cancel          | Keep Working default action in confirmation.              |
| Session completion | Result panel                           | Complete/interrupted    | Store work duration only if user consent/data policy set. |

## Touch Targets

| Element      | Min Size    | Position          | Gesture Type      |
| ------------ | ----------- | ----------------- | ----------------- |
| Pause/resume | 48pt / 48dp | Lower half        | Tap               |
| End session  | 48pt / 48dp | Bottom thumb zone | Tap, then confirm |
| Close/back   | 44pt / 48dp | Top trailing      | Tap/system back   |

## States

### Default

Active session with goal context, timer, and clear exit.

### Empty

Not applicable; no goal means do not start the overlay.

### Loading

Briefly initialize timer/session; if persistence fails, return to Goal Detail with a recoverable message.

### Error

Timer/service failure must not trap the user; allow exit and report whether the session was saved.

### Paused

Show remaining time and explicit resume/end options if pause is approved.

### Interrupted/backgrounded

Reconcile using timestamps; no promise that the app prevents backgrounding or closing.

### Complete

Show session elapsed/goal progress and a route back to Goal Detail.

### Exit confirmation

Dialog asks whether to end session; default focus/action is “Keep working”.

## Copy & Microcopy

| Element      | Copy                     | Notes                                                |
| ------------ | ------------------------ | ---------------------------------------------------- |
| Header       | “Work session”           | Avoid “locked in” or coercive copy.                  |
| Timer label  | “Time remaining”         | Always pair with numeric time.                       |
| Pause        | “Pause” / “Resume”       | Include only if pause supported.                     |
| Exit         | “End session”            | Clear, persistent escape action.                     |
| Confirmation | “End this work session?” | Actions “Keep working” and “End session”.            |
| Completion   | “Session complete”       | Do not equate timer completion with goal completion. |

## Gestures

| Gesture                  | Target           | Result                                                    |
| ------------------------ | ---------------- | --------------------------------------------------------- |
| Tap                      | Pause/resume     | Toggle session state if supported.                        |
| Tap                      | End session      | Confirmation before leaving.                              |
| System back / swipe down | Overlay          | Open same exit confirmation, never trap.                  |
| App background/close     | Operating system | Resume/reconcile on return; no reliable close prevention. |

## Haptics

| Trigger        | Haptic Type                    | RN API Call                                                                                                   |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Session begins | Light impact, optional         | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`; map requires approval.                              |
| Session ends   | Success notification, optional | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`; do not use for an interrupted session. |

## Animations

| Element    | Trigger       | Animation                        | Library                                     |
| ---------- | ------------- | -------------------------------- | ------------------------------------------- |
| Overlay    | Start session | Native slide/fade presentation   | Navigation/modal library TBD.               |
| Timer ring | Time passes   | Smooth but nonessential progress | Reanimated/Animated TBD.                    |
| Completion | Timer expires | Brief transition to summary      | Respect reduced motion; no forced confetti. |

## Safe Area

- Top: Timer/close controls clear status bar, notch, Dynamic Island.
- Bottom: End action clears home indicator/system gesture area.
- Landscape: Preserve timer readability and visible exit; support scrolling if controls no longer fit.

## Platform Notes

- iOS: App lifecycle/backgrounding can interrupt visible timer; no claim that closing is blocked. Dynamic Island/Live Activity is explicitly a stretch goal, not part of baseline.
- Android: System back enters confirmation; notification/foreground-service timer behavior needs platform review. Widgets are stretch goals only.

## API Calls

| Endpoint             | Method | Trigger                  | Response used for                               |
| -------------------- | ------ | ------------------------ | ----------------------------------------------- |
| Start work session   | TBD    | Activate overlay         | Session ID, duration, server time if persisted. |
| End/complete session | TBD    | Exit or timer completion | End reason and session summary.                 |
| Goal progress        | TBD    | Optional in-session log  | Persist tracker update if enabled in overlay.   |

## Accessibility

- Timer accessible as a changing value at a restrained interval; provide a static readable duration too.
- Always expose an accessible exit; never use friction that blocks the user from leaving.
- High contrast, large type, switch/keyboard access, and reduced-motion fallback required.
- Test VoiceOver/TalkBack and system text scaling.

## References to Feature Docs

- [Work-block feature](../features/work-block/mobile-design.md)
- [Goal detail](goal-detail.md)
- [Safe-area guide](../safe-area.md)
