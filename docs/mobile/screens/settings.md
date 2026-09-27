# Settings — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Provide an organized entry point to profile, audio, notification, and integration preferences in Tab 4, “Settings”. Recommend a native navigation list with a separate pushed screen per section rather than a dense single-page settings form.

## Navigation Context

Persistent bottom tab. Selecting a row pushes a settings subsection; stack back returns to Settings. Sign Out is placed at the bottom of the account section, not mixed into routine preferences. Delete-account flow is not specified.

## Layout

Safe-area header with “Settings”; grouped rows with simple section labels and trailing chevrons; account actions below preference links.

```text
┌────────────────────────────┐
│ Settings                   │
│                            │
│ ACCOUNT                    │
│ Profile                ›   │
│                            │
│ PREFERENCES                │
│ Audio & voice          ›   │
│ Notifications           ›   │
│ Integrations            ›   │
│                            │
│ Sign out                   │
│ Home Chat Goals Settings   │
└────────────────────────────┘
```

## Visual Direction

- Background: shared light neutral with white/neutral grouped rows and navy text.
- Primary element: clear subsection labels and predictable list navigation.
- Depth/Layering: flat grouped list with separators; avoid nested cards.
- 3D elements: none.
- Animation: native push transition; subtle selected-row press state.

## Component Inventory

| Component       | RN Primitive / Library | State              | Notes                                        |
| --------------- | ---------------------- | ------------------ | -------------------------------------------- |
| Settings header | `View`, `Text`         | Default            | Title and optional account summary.          |
| Section label   | `Text`                 | Default            | Account / Preferences.                       |
| Settings row    | `Pressable`            | Default/focused    | Profile, Audio, Notifications, Integrations. |
| Sign Out        | `Pressable`            | Default/confirming | Bottom of account list with confirmation.    |
| Bottom tabs     | Tab navigator          | Settings active    | Persistent.                                  |

## Touch Targets

| Element      | Min Size         | Position         | Gesture Type      |
| ------------ | ---------------- | ---------------- | ----------------- |
| Settings row | 48pt / 48dp high | Main list        | Tap               |
| Sign Out     | 48pt / 48dp high | Lower list       | Tap, then confirm |
| Bottom tab   | 44pt / 48dp      | Bottom safe area | Tap               |

## States

### Default

Grouped list of four settings destinations.

### Empty

Not applicable; profile data may be incomplete but rows remain available.

### Loading

Only needed if the account summary is fetched; use a small placeholder without blocking settings navigation.

### Error

Inline account/load error with retry; local preferences remain accessible when possible.

### Sign-out confirmation

Clarify unsynced local data/session consequences before clearing credentials.

## Copy & Microcopy

| Element      | Copy                                                        | Notes                                             |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------- |
| Title        | “Settings”                                                  | Bottom-tab label.                                 |
| Rows         | “Profile”, “Audio & voice”, “Notifications”, “Integrations” | Names match subsection screens.                   |
| Sign out     | “Sign out”                                                  | Destructive styling without alarmist color alone. |
| Confirmation | “Sign out of OnTrack?”                                      | Exact session/data effects TBD.                   |

## Gestures

| Gesture                  | Target       | Result                   |
| ------------------------ | ------------ | ------------------------ |
| Tap                      | Settings row | Push subsection.         |
| System back / edge swipe | Subsection   | Return to Settings list. |
| Tap                      | Sign out     | Open confirmation.       |

## Haptics

| Trigger       | Haptic Type       | RN API Call                                                    |
| ------------- | ----------------- | -------------------------------------------------------------- |
| Row selection | None or selection | `Haptics.selectionAsync()` only if shared haptic map approves. |

## Animations

| Element    | Trigger    | Animation              | Library                 |
| ---------- | ---------- | ---------------------- | ----------------------- |
| Subsection | Select row | Native push transition | Navigation library TBD. |
| Row        | Press      | Native pressed state   | `Pressable`.            |

## Safe Area

- Top: Header below top inset/status bar.
- Bottom: List scroll padding clears bottom tab and system inset.
- Landscape: One-column list remains scrollable.

## Platform Notes

- iOS: Native navigation title/back behavior and edge swipe.
- Android: System back returns from subsection; selected row state should not remain misleading.

## API Calls

| Endpoint         | Method | Trigger              | Response used for                                |
| ---------------- | ------ | -------------------- | ------------------------------------------------ |
| User preferences | TBD    | Load settings / save | Profile and preference values; API not supplied. |
| Sign out         | TBD    | Confirm sign out     | Revoke/clear session; exact behavior TBD.        |

## Accessibility

- Group rows semantically, expose destination and selected state, and keep reading order predictable.
- Sign-out confirmation must clearly distinguish cancel from destructive action.
- Minimum targets 44pt/48dp; verify contrast and screen-reader focus after navigation.

## References to Feature Docs

- [Mobile design index](../index.md)
- [Safe-area guide](../safe-area.md)
