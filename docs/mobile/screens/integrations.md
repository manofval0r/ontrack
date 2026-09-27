# Settings — Integrations — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Display available connected services and explain their connection state. The web prototype shows Google Calendar, Slack, Notion, and GitHub cards but toggles only local flags; mobile must not imply live OAuth/sync until providers are integrated.

## Navigation Context

Pushed from Settings. Each provider row opens a detail/authorization flow; back returns to the integration list. Android app-switch/OAuth return behavior must preserve the pending connection.

## Layout

Single-column list of integration rows with logo/icon, name, short purpose, connection status, and one action. Selecting a row opens detail/confirmation; avoid a multi-column card grid on phone.

## Visual Direction

- Background: neutral settings surface, white rows, navy type, turquoise connected accents.
- Primary element: service name and accurate connection state.
- Depth/Layering: flat rows with dividers; provider brand marks used only where allowed.
- 3D elements: none.
- Animation: native navigation and pressed feedback.

## Component Inventory

| Component         | RN Primitive / Library     | State                               | Notes                                    |
| ----------------- | -------------------------- | ----------------------------------- | ---------------------------------------- |
| Integration row   | `Pressable`                | Connected/not connected/unavailable | Provider icon, name, description.        |
| Connection status | `Text`/badge               | Syncing/connected/error             | Must come from actual service state.     |
| Connect action    | `Pressable`                | Idle/authorizing/error              | OAuth implementation TBD.                |
| Disconnect action | `Pressable` + confirmation | Connected/disconnecting             | Explain data/sync impact.                |
| Provider detail   | Native pushed screen/modal | Loading/error/ready                 | Permissions/scopes and last-sync status. |

## Touch Targets

| Element            | Min Size         | Position     | Gesture Type |
| ------------------ | ---------------- | ------------ | ------------ |
| Integration row    | 48pt / 48dp high | Main list    | Tap          |
| Connect/disconnect | 48pt high        | Row/detail   | Tap          |
| Disconnect confirm | 48pt high        | Confirmation | Tap          |

## States

### Default

Provider list and real connection states.

### Empty

No providers available: explain availability and do not show fake connected states.

### Loading

Provider status loads independently; skeleton rows.

### Error

Provider authorization/sync error with retry and support route; preserve unrelated connections.

### Connected

Show account label, last sync, permission scope, and disconnect control when backed by provider data.

### Not available

Show “Coming later” only if product owner confirms planned provider; avoid disabled “Connect” that looks broken.

## Copy & Microcopy

| Element    | Copy                                       | Notes                                    |
| ---------- | ------------------------------------------ | ---------------------------------------- |
| Title      | “Integrations”                             | Settings destination.                    |
| State      | “Connected”, “Not connected”, “Sync issue” | Use only accurate server state.          |
| Connect    | “Connect”                                  | Opens provider authorization.            |
| Disconnect | “Disconnect”                               | Require confirmation and explain effect. |
| Empty      | “No integrations connected.”               | Proposed neutral copy.                   |

## Gestures

| Gesture     | Target              | Result                                     |
| ----------- | ------------------- | ------------------------------------------ |
| Tap         | Provider row        | Open details.                              |
| Tap         | Connect             | Launch OAuth/native account authorization. |
| Tap         | Disconnect          | Confirm then revoke.                       |
| System back | OAuth return/detail | Restore integration list state.            |

## Haptics

| Trigger            | Haptic Type                  | RN API Call                                                                                   |
| ------------------ | ---------------------------- | --------------------------------------------------------------------------------------------- |
| Connection success | Light notification, optional | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` if shared map approves. |

## Animations

| Element         | Trigger    | Animation                              | Library                    |
| --------------- | ---------- | -------------------------------------- | -------------------------- |
| Provider detail | Select row | Native push transition                 | Navigation library TBD.    |
| Connect action  | Authorize  | Busy indicator and return-state update | Native activity indicator. |

## Safe Area

- Top: Header below system status/cutout.
- Bottom: List and bottom tabs respect home indicator.
- Landscape: One-column list stays scrollable.

## Platform Notes

- iOS: Provider OAuth return must handle universal-link/app-switch lifecycle; never copy secrets into UI logs.
- Android: Handle browser/custom-tab return and process recreation; system back should not leave a phantom connected state.

## API Calls

| Endpoint                   | Method | Trigger            | Response used for                    |
| -------------------------- | ------ | ------------------ | ------------------------------------ |
| Integration catalog/status | TBD    | Enter screen       | Providers, status, scope, last sync. |
| OAuth start/callback       | TBD    | Connect provider   | Authorization/session state.         |
| Disconnect/revoke          | TBD    | Confirm disconnect | Revocation result and updated state. |

## Accessibility

- Provider row announces provider, purpose, and connection state in that order.
- Confirm disconnect with a named dialog and accessible cancel action.
- Do not rely on provider logo/color; 44pt/48dp touch target.

## References to Feature Docs

- [Mobile design index](../index.md)
- [Safe-area guide](../safe-area.md)
