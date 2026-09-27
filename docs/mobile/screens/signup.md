# Auth — Sign Up — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Create an account after a new user has previewed their first goal. The repository has no mobile auth implementation; this specification describes the intended native screen using the web auth form as a content reference.

## Navigation Context

New-user flow: onboarding welcome → goal entry → tracker preview → Sign Up → authenticated bottom tabs. Login is a separate screen. Preserve the pending first goal through signup; the persistence/hand-off contract is still to be defined. Android back and iOS edge-swipe return to the tracker preview where appropriate.

## Layout

Portrait wireframe, approximately 390pt wide:

```text
┌────────────────────────────┐
│ safe area                  │
│ ‹ Back to your goal        │  [REACH ZONE]
│                            │
│ Create your account        │
│ Keep your first goal...    │
│                            │
│ Full name                  │
│ [______________________]   │
│ Email                      │
│ [______________________]   │
│ Password                   │
│ [______________________]   │
│ At least 8 characters      │
│                            │
│ [ Create account ]         │  [THUMB ZONE]
│                            │
│ [ Continue with Google ]   │  [THUMB ZONE]
│                            │
│ Already have an account?   │
│ Log in                     │
│ bottom safe area           │
└────────────────────────────┘
```

Use a **full-screen form**, not a bottom sheet. The product owner confirmed this on 2026-09-27. Use a scroll container with keyboard-aware insets; keep the focused input visible and the primary action reachable.

## Visual Direction

- Background: white/very light neutral using web tokens; navy text, turquoise focus and primary action accents.
- Primary element: short, vertically ordered account form that continues the goal-first flow.
- Depth/Layering: low-depth inputs and tactile CTA treatment adapted to native press states; do not copy desktop split layout.
- 3D elements: none.
- Animation: standard platform screen transition; restrained press/focus feedback. Avoid decorative movement during keyboard presentation.

## Component Inventory

| Component           | RN Primitive / Library                             | State                           | Notes                                                             |
| ------------------- | -------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| Safe-area container | `SafeAreaView` / Expo-compatible safe-area library | Default                         | Respect top and bottom insets.                                    |
| Back action         | `Pressable`                                        | Default                         | Returns to goal preview.                                          |
| Signup form         | `ScrollView`, `TextInput`                          | Editing / invalid / submitting  | Full name, email, password.                                       |
| Password visibility | `Pressable`                                        | Hidden / visible                | Accessible toggle name.                                           |
| Create account      | `Pressable`                                        | Enabled / submitting / disabled | Primary thumb-zone action.                                        |
| Google sign-in      | `Pressable` + provider SDK                         | Idle / loading / error          | Provider integration and response contract TBD.                   |
| Apple sign-in       | Not in current scope                               | Deferred                        | Google only for now; revisit App Store policy before iOS release. |
| Login link          | `Pressable` / navigation link                      | Default                         | Opens separate login screen.                                      |

## Touch Targets

| Element             | Min Size                | Position                        | Gesture Type             |
| ------------------- | ----------------------- | ------------------------------- | ------------------------ |
| Back action         | 44pt iOS / 48dp Android | Top leading edge                | Tap; native back gesture |
| Text fields         | 48pt high minimum       | Middle, scrollable              | Tap/type                 |
| Password visibility | 44pt / 48dp             | Trailing edge of password field | Tap                      |
| Create account      | 48pt high minimum       | Lower form / thumb zone         | Tap                      |
| Google button       | 48pt high minimum       | Below primary action            | Tap                      |
| Login link          | 44pt / 48dp hit area    | Form footer                     | Tap                      |

## States

### Default

Three empty fields and provider choices. Keep the first goal context intact but do not imply the account exists yet.

### Empty

Required fields remain visible; explain missing values inline after submit rather than relying only on native validation.

### Loading

Disable duplicate submissions, show a concise progress label/indicator, and preserve field values.

### Error

Show a clear inline field or form-level message for invalid email, weak password, provider cancellation/failure, and network/auth errors. Exact API error mapping is not defined.

### Success

Create authenticated session, associate the pending first goal, then enter the Home tab. Whether signup automatically saves the goal or shows a final confirmation remains to be confirmed.

### Keyboard open

Scroll/shift the focused field above the keyboard; allow dismissal and ensure the primary action is reachable. Handle password autofill and email keyboard types.

## Copy & Microcopy

| Element          | Copy                              | Notes                                                                 |
| ---------------- | --------------------------------- | --------------------------------------------------------------------- |
| Heading          | “Create your account”             | Matches current web signup.                                           |
| Name             | “Full name”                       | Matches web label.                                                    |
| Email            | “Email”                           | Use email keyboard/autofill.                                          |
| Password         | “Password”                        | Web reference says minimum 8 characters; backend policy must confirm. |
| Primary action   | “Create account”                  | Show a busy label while submitting.                                   |
| Provider action  | “Continue with Google”            | Google requested on both platforms; Apple deferred for now.           |
| Login link       | “Already have an account? Log in” | Separate auth screen.                                                 |
| Validation/error | TBD                               | Use concise, actionable copy; API contract not yet defined.           |

## Gestures

| Gesture                  | Target   | Result                                                   |
| ------------------------ | -------- | -------------------------------------------------------- |
| Tap                      | Input    | Focus and open appropriate keyboard.                     |
| Tap eye control          | Password | Toggle secure text entry.                                |
| Tap submit/provider      | Action   | Submit credentials or begin Google auth.                 |
| Scroll                   | Form     | Bring fields/actions into view around keyboard.          |
| System back / edge swipe | Screen   | Return to goal preview unless submission is in progress. |

## Haptics

| Trigger                  | Haptic Type                  | RN API Call                                                                                                |
| ------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Field focus / validation | None recommended             | No haptic by default; avoid noisy form feedback.                                                           |
| Signup success           | Light confirmation, optional | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`; confirm with the global haptic map. |

## Animations

| Element    | Trigger              | Animation                        | Library                                                        |
| ---------- | -------------------- | -------------------------------- | -------------------------------------------------------------- |
| Screen     | Navigate into signup | Native push/stack transition     | Expo Router or React Navigation; choose with app architecture. |
| Submit     | Press                | Native pressed/disabled feedback | `Pressable` state; no library required.                        |
| Keyboard   | Focus field          | Keyboard-aware scroll/resize     | Platform keyboard insets / chosen keyboard-avoiding library.   |
| Error text | Validation fails     | Immediate, no layout jump        | Native layout; avoid custom spring unless needed.              |

## Safe Area

- Top: Apply top inset for status bar/cutout; back action must not overlap the sensor area.
- Bottom: Apply bottom inset for home indicator/navigation bar; keep final link and primary action above it.
- Landscape: Allow scrolling; do not compress fields into a fixed-height panel.
- Keyboard: Combine safe-area and keyboard insets without double-padding.

## Platform Notes

- iOS: Use email/password autofill and secure password content type. Google only is the current decision; review App Store policy for Sign in with Apple before release. Respect Face ID consent only on the login flow.
- Android: Use email/password autofill hints, system back behavior, and resize/pan insets that keep focused fields visible. Google sign-in can use the configured provider SDK.

## API Calls

| Endpoint                 | Method          | Trigger            | Response used for                                                |
| ------------------------ | --------------- | ------------------ | ---------------------------------------------------------------- |
| Auth endpoint            | TBD             | Submit credentials | Session/user; backend contract not provided.                     |
| Google identity provider | OAuth / SDK TBD | Select Google      | Provider identity/session; configure for both platforms.         |
| Apple identity provider  | Not in scope    | —                  | Revisit App Store policy before iOS release.                     |
| Pending-goal association | TBD             | Auth success       | Save/associate pre-auth goal; contract and failure recovery TBD. |

## Accessibility

- VoiceOver/TalkBack labels for fields, password visibility, provider buttons, and errors; announce submit/loading/success states.
- Focus order: back → name → email → password → create account → providers → login link. Keep keyboard focus stable on errors.
- Minimum touch targets: 44pt iOS / 48dp Android. Do not rely on color alone for invalid/disabled state.
- Meet WCAG 2.2 AA contrast for text and controls; numeric contrast verification remains outstanding.

## References to Feature Docs

- [Cross-platform design reference](../../web-design/index.md)
- [Mobile design questionnaire](../../../../mobile_design.md)
