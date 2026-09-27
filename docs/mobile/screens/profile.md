# Settings — Profile — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Let the user view and update name, email, accountability persona, timezone, and account security details. Avatar upload, sharing stats, and delete-account behavior are not specified by the existing web reference.

## Navigation Context

Pushed from Settings. Back returns to Settings. Sign out remains in the Settings/account section; this screen focuses on identity and profile fields.

## Layout

Scrollable single-column form with an optional initials/avatar mark at top, editable display name, read-only or editable email depending on auth provider, persona choice, timezone picker, and bottom Save action.

```text
┌────────────────────────────┐
│ ‹ Profile                  │
│          [avatar]          │
│          Israel            │
│ Display name               │
│ [______________________]   │
│ Email                      │
│ [______________________]   │
│ Coach style             ›  │
│ Time zone               ›  │
│                            │
│ [ Save changes ]           │ [THUMB ZONE]
└────────────────────────────┘
```

## Visual Direction

- Background: light neutral, white form rows, navy type, turquoise focus.
- Primary element: identity information and editable name.
- Depth/Layering: flat form sections with separators; no card stack.
- 3D elements: none.
- Animation: native selection sheets; brief saved status.

## Component Inventory

| Component       | RN Primitive / Library           | State                   | Notes                                                     |
| --------------- | -------------------------------- | ----------------------- | --------------------------------------------------------- |
| Avatar/initials | `View`, `Text`, optional `Image` | Empty/populated         | Upload capability is open; initials fallback recommended. |
| Display name    | `TextInput`                      | Editing/invalid         | Required.                                                 |
| Email           | `TextInput` or static text       | Editable/read-only      | Depends on auth provider; web currently edits it locally. |
| Persona         | `Pressable` list/modal           | Selected                | Reuse web persona names unless voice team changes.        |
| Time zone       | Native picker / searchable list  | Selected                | Avoid free-form timezone entry.                           |
| Save action     | `Pressable`                      | Idle/saving/saved/error | Sticky footer if form scrolls.                            |

## Touch Targets

| Element              | Min Size    | Position          | Gesture Type     |
| -------------------- | ----------- | ----------------- | ---------------- |
| Avatar edit          | 44pt / 48dp | Upper content     | Tap if supported |
| Text fields          | 48pt high   | Form              | Tap/type         |
| Persona/timezone row | 48pt / 48dp | Form              | Tap/picker       |
| Save                 | 48pt high   | Bottom thumb zone | Tap              |

## States

### Default

Current profile values loaded.

### Empty

Initials avatar fallback and required-field validation.

### Loading

Show save progress and prevent duplicate submissions.

### Error

Keep edits and identify the field/server problem; retry save.

### Saved

Accessible status message confirms saved profile; distinguish local draft from server-synced data.

### Email managed by provider

Explain whether it can be changed in OnTrack or at the identity provider.

## Copy & Microcopy

| Element | Copy                                                | Notes                                |
| ------- | --------------------------------------------------- | ------------------------------------ |
| Title   | “Profile”                                           | Settings destination.                |
| Fields  | “Display name”, “Email”, “Coach style”, “Time zone” | Mobile adaptations of web fields.    |
| Save    | “Save changes”                                      | Lower thumb zone.                    |
| Success | “Profile updated.”                                  | Only after confirmed persistence.    |
| Avatar  | “Change profile photo”                              | Proposed; hide until feature exists. |

## Gestures

| Gesture  | Target               | Result                              |
| -------- | -------------------- | ----------------------------------- |
| Tap/type | Field                | Edit profile value.                 |
| Tap      | Persona/timezone row | Open native selection surface.      |
| Scroll   | Form                 | Reach lower fields and save action. |

## Haptics

| Trigger      | Haptic Type                  | RN API Call                                                                                          |
| ------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| Save success | Light notification, optional | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`; shared map approval required. |

## Animations

| Element     | Trigger | Animation           | Library                                |
| ----------- | ------- | ------------------- | -------------------------------------- |
| Picker      | Open    | Native sheet/picker | Platform control or chosen library.    |
| Save status | Success | Short fade          | Native layout; respect reduced motion. |

## Safe Area

- Top: Back/title below top inset.
- Bottom: Save action clears home indicator; keyboard insets when editing.
- Landscape: Scroll form; keep focused input visible.

## Platform Notes

- iOS: Use secure text/content types where applicable; native picker presentation.
- Android: Respect IME resize and system back from picker; timezone selection must support TalkBack.

## API Calls

| Endpoint      | Method             | Trigger     | Response used for                                 |
| ------------- | ------------------ | ----------- | ------------------------------------------------- |
| User profile  | TBD                | Load/save   | Name, email, persona, timezone; contract pending. |
| Avatar upload | TBD / not in scope | If approved | Image URL and upload status.                      |

## Accessibility

- Every field has an explicit label and validation association; successful save is announced as status.
- Persona/timezone controls expose selected value and keyboard navigation.
- 44pt/48dp target minimum; contrast and text scaling audit required.

## References to Feature Docs

- [Mobile design index](../index.md)
