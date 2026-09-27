# Splash / App Launch — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Show the operating system's static launch artwork while the native app starts, then route directly to onboarding, login, or Home according to first-run and session state. Product owner chose native static launch only; there is no additional animated in-app splash screen.

## Navigation Context

First surface on cold launch. OS launch screen hands off to app startup routing. Returning-user biometric prompt is offered only for a previously opted-in account/device. Exact session restoration and destination precedence remain open.

## Layout

Native launch artwork only; no interactive React Native layout. Proposed portrait composition: centered OnTrack wordmark on a flat brand surface, kept within platform launch-screen constraints. No spinner or loading copy.

```text
┌────────────────────────────┐
│ system status area         │
│                            │
│                            │
│          OnTrack           │
│                            │
│                            │
│ system navigation area     │
└────────────────────────────┘
```

## Visual Direction

- Background: current web light background `#F8FAFB` or white; final launch color approval pending.
- Primary element: OnTrack logo/wordmark, static.
- Depth/Layering: none; avoid shadow/glow that may not render consistently in a native launch asset.
- 3D elements: none.
- Animation: none. OS launch duration is controlled by app readiness, not a timed brand animation.

## Component Inventory

| Component             | RN Primitive / Library           | State     | Notes                                                             |
| --------------------- | -------------------------------- | --------- | ----------------------------------------------------------------- |
| Native launch artwork | Expo native splash configuration | Static    | Asset dimensions/background and light/dark behavior TBD.          |
| Startup router        | App bootstrap/navigation layer   | Resolving | Not part of the splash screen itself; session logic not designed. |

## Touch Targets

No tappable elements; the launch surface is static.

## States

### Default

Native static artwork during process launch.

### Empty

Not applicable.

### Loading

No in-app spinner or progress animation. OS launch remains until the app is ready.

### Error

Startup/session errors should route to a recoverable app screen; launch artwork must not remain indefinitely. Exact retry/error behavior is open.

### First launch

Route to mobile onboarding, then signup after first-goal preview.

### Returning user

Restore session; route to Home or request opted-in biometrics before protected content. Destination precedence is open.

## Copy & Microcopy

| Element       | Copy           | Notes                                        |
| ------------- | -------------- | -------------------------------------------- |
| Wordmark      | “OnTrack”      | Use logo asset; avoid adding loading claims. |
| Loading/error | None on splash | Show errors only after app UI mounts.        |

## Gestures

No gestures or controls on the native launch surface.

## Haptics

| Trigger    | Haptic Type | RN API Call          |
| ---------- | ----------- | -------------------- |
| App launch | None        | No haptic on launch. |

## Animations

| Element          | Trigger            | Animation                      | Library                              |
| ---------------- | ------------------ | ------------------------------ | ------------------------------------ |
| Launch artwork   | App launch         | Static; no animation           | Native Expo splash configuration.    |
| Route transition | Bootstrap complete | Standard navigation transition | Navigation library decision pending. |

## Safe Area

- Top: Platform launch layout handles status bar/cutout; do not bake critical logo detail into inset areas.
- Bottom: Platform launch layout handles home indicator/navigation bar.
- Landscape: Supply platform-compatible artwork or a centered scalable mark; exact asset behavior depends on Expo configuration.

## Platform Notes

- iOS: Use the static launch screen configuration; launch duration is system/app-readiness driven. Do not attempt a timed animation on the native launch screen.
- Android: Configure a compatible splash theme/icon and background; handle system splash API behavior by supported Android version.

## API Calls

| Endpoint            | Method | Trigger                    | Response used for                                                |
| ------------------- | ------ | -------------------------- | ---------------------------------------------------------------- |
| Session restoration | TBD    | App bootstrap after launch | Determine authenticated destination; auth contract not provided. |

## Accessibility

- Treat launch art as decorative when the app name is otherwise announced by the OS; expose a meaningful app name for assistive technology.
- Do not use an animated spinner as the only readiness signal.
- Native launch screen contrast/accessibility audit remains outstanding.

## References to Feature Docs

- [Mobile design index](../index.md)
- [Mobile design questionnaire](../../../../mobile_design.md)
