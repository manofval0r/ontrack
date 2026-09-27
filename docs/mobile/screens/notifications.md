# Settings — Notifications — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Configure mobile push reminder categories and route users to system notification settings when OS permission is disabled. Push delivery is not implemented in this repository; categories and timings below follow the mobile guide and need backend confirmation.

## Navigation Context

Pushed from Settings. Permission is requested contextually after signup while explaining reminders. If permission is denied, the app continues to work and the settings screen links to OS settings; never repeatedly trigger the OS prompt.

## Layout

Permission status banner, master notifications switch, category rows, optional timing controls, and a “Notification settings” system link when OS permission is blocked.

## Visual Direction

- Background: light neutral and grouped white rows; navy text and turquoise enabled state.
- Primary element: permission status and clear per-category choices.
- Depth/Layering: flat settings list with separators.
- 3D elements: none.
- Animation: native switches; no attention-grabbing alert pulse.

## Component Inventory

| Component          | RN Primitive / Library                           | State                    | Notes                                                |
| ------------------ | ------------------------------------------------ | ------------------------ | ---------------------------------------------------- |
| Permission banner  | `View`, `Text`, `Pressable`                      | Granted/denied/not asked | Link to OS settings on denied.                       |
| Master switch      | `Switch`                                         | On/off                   | Controls in-app preference, not OS permission.       |
| Category switches  | `Switch` rows                                    | On/off                   | Daily reminder, check-in, deadline, streak, verdict. |
| Timing picker      | Native time/date picker                          | Optional                 | Quiet hours/reminder lead time remain undecided.     |
| OS settings action | `Linking.openSettings()` or supported equivalent | Available                | Verify Expo/platform APIs.                           |

## Touch Targets

| Element           | Min Size    | Position   | Gesture Type                                |
| ----------------- | ----------- | ---------- | ------------------------------------------- |
| Permission action | 48pt / 48dp | Top banner | Tap to system settings/request when allowed |
| Switch row        | 48pt high   | List       | Tap                                         |
| Time picker row   | 48pt / 48dp | List       | Tap                                         |

## States

### Default

Permission state and saved category preferences.

### Empty

No categories configured; show master switch and defaults only when backend policy is defined.

### Loading

Show permission/settings load state without blocking other settings.

### Error

Explain token registration or preference save failure; retry independently from OS permission.

### Permission not requested

Explain value before showing native prompt after signup; no prompt on every screen visit.

### Denied/blocked

Explain how to enable in OS settings; return to app and refresh permission state.

### Master off

Disable categories in UI but preserve individual choices unless user confirms reset.

## Copy & Microcopy

| Element           | Copy                                                                                        | Notes                                                          |
| ----------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Permission banner | “Notifications are off for OnTrack.”                                                        | Show only if OS permission denies delivery.                    |
| CTA               | “Open system settings”                                                                      | Opens platform settings.                                       |
| Categories        | “Daily reminder”, “Check-in due”, “Deadline approaching”, “Streak at risk”, “Verdict ready” | Proposed list from guide; product/backend confirmation needed. |
| Master            | “Allow OnTrack reminders”                                                                   | Distinguish app preference from OS authorization.              |
| Timing            | “Quiet hours” / “Remind me before deadline”                                                 | Optional; values remain open.                                  |

## Gestures

| Gesture       | Target               | Result                                   |
| ------------- | -------------------- | ---------------------------------------- |
| Tap           | Category switch      | Enable/disable category preference.      |
| Tap           | Open system settings | Leave app to OS settings.                |
| Return to app | Permission banner    | Re-check OS permission and update state. |

## Haptics

| Trigger           | Haptic Type         | RN API Call                                        |
| ----------------- | ------------------- | -------------------------------------------------- |
| Preference toggle | Selection, optional | `Haptics.selectionAsync()` if shared map approves. |

## Animations

| Element           | Trigger                  | Animation                | Library                    |
| ----------------- | ------------------------ | ------------------------ | -------------------------- |
| Permission banner | Permission state changes | Short fade/layout update | Native layout; no pulsing. |
| Switch            | Toggle                   | Platform-native          | React Native `Switch`.     |

## Safe Area

- Top: Permission banner below top inset.
- Bottom: List scrolls above tab bar/home indicator.
- Landscape: Keep row labels and switches separate; allow vertical scroll.

## Platform Notes

- iOS: Request authorization at a contextual moment; handle provisional/denied states and route to app notification settings.
- Android: Respect notification runtime permission on supported versions and channel/category settings; provide system settings route.

## API Calls

| Endpoint                  | Method         | Trigger                      | Response used for                                               |
| ------------------------- | -------------- | ---------------------------- | --------------------------------------------------------------- |
| Notification preferences  | TBD            | Load/change categories       | User preferences and schedules.                                 |
| Device token registration | TBD            | Permission grant/app startup | Push token and subscription status.                             |
| Notification deep link    | App navigation | Tap notification             | Destination goal/check-in/verdict; exact map in push templates. |

## Accessibility

- Master and category controls announce label, enabled state, and whether OS permission blocks delivery.
- Use explicit text and icons for permission state; no color-only status.
- Support system text scaling and switch navigation; 44pt/48dp targets.

## References to Feature Docs

- [Push notification templates](../push-notifications.md)
- [Safe-area guide](../safe-area.md)
