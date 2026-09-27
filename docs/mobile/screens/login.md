# Auth — Log In — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Authenticate a returning user and restore their OnTrack session before opening the bottom-tab app. This repository has no mobile auth implementation; the current web login is a visual placeholder and does not authenticate credentials.

## Navigation Context

Separate screen in the auth stack. New users can move to signup; returning users may choose password login or, if previously opted in, receive a biometric prompt automatically at launch. Cancel/failure must leave a credential fallback. After successful auth, open the Home tab or honor a notification deep link when that flow is defined.

## Layout

Portrait wireframe, approximately 390pt wide:

```text
┌────────────────────────────┐
│ safe area                  │
│ OnTrack                    │
│                            │
│ Welcome back               │
│                            │
│ [ Continue with Face ID ]  │  [THUMB ZONE]
│ (only if enrolled/opted in)│
│                            │
│ Email                      │
│ [______________________]   │
│ Password                   │
│ [______________________]   │
│ Forgot password?           │
│                            │
│ [ Log in ]                 │  [THUMB ZONE]
│                            │
│ [ Continue with Google ]   │  [THUMB ZONE]
│                            │
│ New to OnTrack? Sign up    │
│ bottom safe area           │
└────────────────────────────┘
```

Keep the credential form compact and scrollable. Do not show desktop illustration or require a multi-column layout.

## Visual Direction

- Background: white/light neutral using the confirmed web tokens; navy text with turquoise focus/action accents.
- Primary element: returning-user greeting and the most relevant sign-in action (biometric only for an opted-in device).
- Depth/Layering: restrained form surfaces and tactile primary CTA adapted to native pressed states.
- 3D elements: none.
- Animation: platform auth-screen transition; biometric system prompt uses OS UI.

## Component Inventory

| Component           | RN Primitive / Library                             | State                                 | Notes                                                                      |
| ------------------- | -------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| Safe-area container | `SafeAreaView` / Expo-compatible safe-area library | Default                               | Respect device insets.                                                     |
| Biometric action    | `Pressable` + `expo-local-authentication`          | Available / authenticating / fallback | Automatic prompt on launch only when user opted in and device supports it. |
| Email/password form | `ScrollView`, `TextInput`                          | Editing / invalid / submitting        | Credential fallback always available.                                      |
| Forgot password     | `Pressable`                                        | Default                               | Recovery flow is not defined.                                              |
| Log in              | `Pressable`                                        | Enabled / submitting                  | Primary credential action.                                                 |
| Provider actions    | `Pressable` + provider SDK                         | Idle / loading / error                | Google only for now; Apple deferred.                                       |
| Signup link         | `Pressable` / navigation link                      | Default                               | Opens separate signup screen.                                              |

## Touch Targets

| Element               | Min Size             | Position                 | Gesture Type        |
| --------------------- | -------------------- | ------------------------ | ------------------- |
| Biometric action      | 48pt / 48dp high     | Upper-middle, thumb zone | OS biometric prompt |
| Email/password fields | 48pt high minimum    | Middle, scrollable       | Tap/type            |
| Password visibility   | 44pt / 48dp          | Trailing field edge      | Tap                 |
| Forgot password       | 44pt / 48dp hit area | Near password field      | Tap                 |
| Log in                | 48pt high minimum    | Lower form / thumb zone  | Tap                 |
| Google button         | 48pt high minimum    | Below primary action     | Tap                 |
| Signup link           | 44pt / 48dp hit area | Form footer              | Tap                 |

## States

### Default

Email/password credential fallback is available. Biometric prompt/action appears only for an opted-in returning user on a supported device.

### Empty

Missing credentials receive inline feedback after submit.

### Loading

Disable repeated submits and show progress without clearing entered credentials.

### Error

Handle invalid credentials, network failure, provider cancellation/failure, unavailable/locked-out biometrics, and credential fallback. Recovery copy and API error mapping remain TBD.

### Biometric success

Establish/restore the session and continue to Home or a valid deep-link destination.

### Biometric cancel/failure

Return to the login form without trapping the user; allow password or Google fallback.

### Keyboard open

Shift/scroll the focused field above the keyboard and keep submit reachable.

## Copy & Microcopy

| Element          | Copy                                                  | Notes                                                                 |
| ---------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| Heading          | “Welcome back”                                        | Mobile adaptation; confirm final brand voice.                         |
| Biometric action | “Continue with Face ID” / “Continue with fingerprint” | Platform-specific label; OS prompt should carry security explanation. |
| Email/password   | “Email”, “Password”                                   | Match signup and web.                                                 |
| Forgot password  | “Forgot password?”                                    | Recovery flow and destination are not yet defined.                    |
| Primary action   | “Log in”                                              | Keep consistent with web.                                             |
| Provider action  | “Continue with Google”                                | Google requested on both platforms; Apple deferred.                   |
| Signup link      | “New to OnTrack? Sign up”                             | Routes to separate signup screen.                                     |
| Error            | TBD                                                   | Do not copy the web's static demo alert as a real auth response.      |

## Gestures

| Gesture                  | Target           | Result                                                 |
| ------------------------ | ---------------- | ------------------------------------------------------ |
| Tap                      | Biometric action | Invoke OS Face ID/fingerprint prompt.                  |
| Tap                      | Input field      | Focus and open appropriate keyboard.                   |
| Tap eye control          | Password         | Toggle secure text entry.                              |
| Tap submit/provider      | Action           | Authenticate with credentials or Google.               |
| System back / edge swipe | Screen           | Return to prior auth/onboarding screen as flow allows. |

## Haptics

| Trigger                   | Haptic Type                  | RN API Call                                                                                          |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| Credential errors         | None recommended             | Let accessible inline text convey the issue.                                                         |
| Successful authentication | Light confirmation, optional | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`; confirm in shared haptic map. |

## Animations

| Element   | Trigger           | Animation                    | Library                                                        |
| --------- | ----------------- | ---------------------------- | -------------------------------------------------------------- |
| Screen    | Navigate to login | Native stack transition      | Expo Router or React Navigation; choose with app architecture. |
| Biometric | Prompt            | Native OS modal              | `expo-local-authentication` / platform API.                    |
| Submit    | Press             | Native pressed/busy feedback | `Pressable`; no library required.                              |
| Keyboard  | Focus field       | Keyboard-aware scroll/resize | Platform keyboard insets / chosen keyboard-avoiding library.   |

## Safe Area

- Top: Respect status bar, camera cutout, and Dynamic Island; do not position title under system chrome.
- Bottom: Respect home indicator/navigation bar and keep form links/actions above it.
- Landscape: Scroll the form; ensure biometric and submit remain reachable.
- Keyboard: Combine safe-area and keyboard insets without double-padding.

## Platform Notes

- iOS: Use Face ID only after explicit opt-in and successful device capability check. Display Face ID permission purpose text if required by chosen implementation. Google only is the current provider decision; review App Store policy for Sign in with Apple before release.
- Android: Use `expo-local-authentication` for supported biometric modalities; label with the available modality rather than assuming fingerprint. Respect system back and lockout fallback.

## API Calls

| Endpoint                 | Method          | Trigger                | Response used for                                        |
| ------------------------ | --------------- | ---------------------- | -------------------------------------------------------- |
| Auth endpoint            | TBD             | Submit credentials     | Session/user; backend contract not provided.             |
| Google identity provider | OAuth / SDK TBD | Select Google          | Provider identity/session; configure for both platforms. |
| Apple identity provider  | Not in scope    | —                      | Revisit App Store policy before iOS release.             |
| Password recovery        | TBD             | Select forgot password | Recovery status; flow not designed yet.                  |

## Accessibility

- VoiceOver/TalkBack labels for form fields, password toggle, biometric action, provider buttons, and errors.
- Focus order: biometric action when available → email → password → forgot password → login → provider actions → signup.
- Announce biometric cancellation/failure and preserve a direct credential fallback.
- Minimum touch targets: 44pt iOS / 48dp Android. Verify WCAG 2.2 AA contrast; audit remains outstanding.

## References to Feature Docs

- [Cross-platform design reference](../../web-design/index.md)
- [Mobile design questionnaire](../../../../mobile_design.md)
