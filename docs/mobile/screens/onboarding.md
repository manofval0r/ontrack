# Auth — Onboarding — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Introduce OnTrack and guide a new user through first-goal creation before signup. Product owner chose a one-screen-at-a-time sequence; mobile onboarding is not a scrollable web page or swipe-only carousel.

## Navigation Context

First-run route after native launch. Sequence: Welcome → How It Works → Create First Goal → Goal Ready → Sign Up. Signup and login remain separate auth screens; successful signup enters the four bottom tabs. Returning users skip first-run onboarding according to stored completion state, but persistence details remain open.

## Layout

Portrait, approximately 390pt wide. Each step uses a safe-area-aware screen with a compact top progress indicator, focused central content, and explicit Back/Continue actions anchored near the bottom safe area. The primary action stays in the bottom 40% thumb zone. Do not require horizontal swipes to advance.

```text
┌────────────────────────────┐
│ safe area                  │
│ Back                 ● ● ○ ○│  [REACH ZONE]
│                            │
│      step illustration     │
│                            │
│      Step heading          │
│      Short explanation     │
│                            │
│      [step content]        │
│                            │
│ [ Back ]   [ Continue ]    │  [THUMB ZONE]
│ bottom safe area           │
└────────────────────────────┘
```

### Step content

1. Welcome: explain the accountability promise and invite the user to begin.
2. How It Works: present the goal → tracker → progress/check-in loop as a short vertical set of three concepts.
3. Create First Goal: text-first goal input with examples; voice becomes available only after the user taps the mic and accepts permission.
4. Goal Ready: show inferred goal and matching tracker preview; continue to signup.

## Visual Direction

- Background: light neutral `#F8FAFB` / white, navy `#071E2D`, turquoise `#00C4B3`, teal `#006D6A`, aqua `#33D6C5`; inherit Fraunces and DM Sans where available.
- Primary element: one clear illustration or goal/tracker preview per step; avoid desktop split-screen composition.
- Depth/Layering: restrained tactile surfaces and shadows from web, adapted for touch and compact vertical space.
- 3D elements: none specified.
- Animation: simple step transition and progress update; respect reduced motion. Use explicit buttons as accessible alternatives to swiping.

## Component Inventory

| Component              | RN Primitive / Library                             | State                    | Notes                                                                     |
| ---------------------- | -------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| Safe-area screen shell | `SafeAreaView` / Expo-compatible safe-area library | Per step                 | Apply top and bottom insets.                                              |
| Progress indicator     | `View` + accessible progress semantics             | Steps 1–4                | Announce current step; not interactive.                                   |
| Step content           | `View`, `Text`, illustration asset                 | Welcome/info/goal/ready  | Keep each screen focused and brief.                                       |
| Goal input             | `TextInput`                                        | Empty/editing            | Keyboard-aware, multiline as needed.                                      |
| Example prompts        | `Pressable` chips/list rows                        | Unselected/selected      | Populate text; user can edit.                                             |
| Voice input entry      | `Pressable`                                        | Idle/listening           | Request mic permission only on explicit use.                              |
| Tracker preview        | Type-specific native components                    | Counter/checklist/manual | Preview behavior and persistence need an API contract.                    |
| Back/Continue          | `Pressable`                                        | Enabled/disabled/loading | Fixed above bottom safe area.                                             |
| Permission prompt      | OS permission sheet                                | Not asked/allowed/denied | Notification permission is requested after signup; mic only on first use. |

## Touch Targets

| Element                   | Min Size                | Position                | Gesture Type                    |
| ------------------------- | ----------------------- | ----------------------- | ------------------------------- |
| Back                      | 44pt iOS / 48dp Android | Top leading; reach zone | Tap; native back gesture        |
| Continue / Start tracking | 48pt high minimum       | Bottom thumb zone       | Tap                             |
| Example prompt            | 44pt / 48dp minimum     | Mid/lower content       | Tap                             |
| Goal input                | 48pt minimum height     | Middle, keyboard-aware  | Tap/type                        |
| Mic control               | 44pt / 48dp minimum     | Adjacent to goal input  | Tap; OS permission on first use |

## States

### Default

Current step content, step indicator, and explicit navigation actions.

### Empty

Goal step shows examples and disabled Continue/Build action until non-whitespace text exists.

### Loading

During goal parsing, show a short progress state with non-technical status text; actual AI/API behavior is not defined yet.

### Error

Keep entered goal text and provide retry/edit path if parsing or goal persistence fails; exact copy/API error mapping remains open.

### Permission denied

Voice remains unavailable but text input continues to work. Explain how to enable microphone permission in system settings without blocking onboarding.

### Goal Ready

Show parsed goal, target/deadline/type and an interactive preview where supported. Signup must preserve the pending goal; storage/handoff contract remains open.

### Skip / resume

Skip behavior and whether users can resume onboarding from Settings have not been decided.

## Copy & Microcopy

| Element                | Copy                                         | Notes                                                               |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| Welcome heading        | TBD                                          | Adapt the existing web welcome copy after mobile tone is confirmed. |
| How it works           | “Set a goal. Track progress. Get a verdict.” | Proposed summary, not final approved copy.                          |
| Goal prompt            | “What's your goal?”                          | Current web copy; mobile keyboard/action labels need review.        |
| Build action           | “Build my tracker”                           | Current web label; use a busy label while processing.               |
| Ready heading          | “Your tracker is ready!”                     | Current web copy.                                                   |
| Permission explanation | TBD                                          | Explain benefit before OS dialog; do not ask on first render.       |

## Gestures

| Gesture                      | Target              | Result                                                        |
| ---------------------------- | ------------------- | ------------------------------------------------------------- |
| Tap Back/Continue            | Navigation controls | Move one step backward/forward.                               |
| System back / iOS edge swipe | Current step        | Return to previous onboarding step; do not discard goal text. |
| Tap example                  | Prompt              | Fill goal input; remain editable.                             |
| Tap microphone               | Voice input         | Explain/request microphone permission on first explicit use.  |
| Swipe horizontally           | Screen              | Not required; explicit controls provide step navigation.      |

## Haptics

| Trigger            | Haptic Type                 | RN API Call                                                              |
| ------------------ | --------------------------- | ------------------------------------------------------------------------ |
| Step navigation    | None specified              | Defer to the shared haptic feedback map.                                 |
| Goal preview ready | Optional light confirmation | Product-owner decision pending; do not add until haptic map is approved. |

## Animations

| Element            | Trigger          | Animation                           | Library                                                    |
| ------------------ | ---------------- | ----------------------------------- | ---------------------------------------------------------- |
| Step content       | Continue/back    | Short horizontal or fade transition | Navigation library and reduced-motion behavior TBD.        |
| Progress indicator | Step changes     | Color/segment transition            | Native layout/Animated or Reanimated after stack choice.   |
| Goal parsing       | Submit goal      | Progress indicator/status change    | Do not imply live AI streaming unless backend supports it. |
| Tracker preview    | User interaction | Small tactile state feedback        | Native press state; avoid layout jumps.                    |

## Safe Area

- Top: Keep back and progress controls below status bar/notch/Dynamic Island.
- Bottom: Keep primary action above home indicator/navigation bar; apply keyboard inset on goal entry.
- Landscape: Allow vertical scrolling; ensure the primary action stays reachable and input is not trapped behind keyboard.
- Permission sheets: OS-managed; do not imitate native permission dialogs.

## Platform Notes

- iOS: Respect edge-swipe navigation, keyboard safe-area behavior, and OS microphone permission text. Notification prompt waits until after signup; mic permission waits until first voice action.
- Android: Respect system back, resize/IME insets, and runtime microphone permission. Provide a route to system settings after denial.

## API Calls

| Endpoint                                    | Method | Trigger                           | Response used for                                                     |
| ------------------------------------------- | ------ | --------------------------------- | --------------------------------------------------------------------- |
| Goal parsing                                | TBD    | Submit first goal                 | Parsed goal/tracker; service contract not supplied.                   |
| Goal persistence / pending-goal association | TBD    | Confirm preview or signup success | Preserve the first goal across auth; ownership and timing unresolved. |
| Notification registration                   | TBD    | After signup and permission grant | Device token/preferences; push contract not supplied.                 |

## Accessibility

- VoiceOver/TalkBack should announce screen title, “Step X of 4,” and available actions; update progress without repeatedly reading the whole screen.
- Keep focus on the heading after step changes; move focus to validation text/input on errors.
- Text input, examples, microphone, and navigation must work with screen readers and keyboard/switch access.
- Minimum touch targets: 44pt iOS / 48dp Android. Meet WCAG 2.2 AA contrast; numeric audit remains outstanding.

## References to Feature Docs

- [Voice input](../features/voice-input/mobile-design.md)
- [Dynamic tracker](../features/dynamic-tracker/mobile-design.md)
- [Mobile design index](../index.md)
- [Mobile design questionnaire](../../../../mobile_design.md)
