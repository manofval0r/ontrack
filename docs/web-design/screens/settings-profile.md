# Settings — Profile — Design Document

## Purpose

Let the user view and edit local display name, email, accountability persona, and timezone in the Profile tab of `/settings`.

## User Goal

Update identity and how the accountability assistant addresses them.

## Layout

A single white form panel with heading/description, two-column fields at `sm` and above, save feedback, and a primary Save Changes button. No profile photo, stats summary, sign-out, or delete-account action is present in this panel.

## Visual Direction

- Background: shared settings canvas, white panel, navy text and turquoise focus accent.
- Primary element: editable profile fields and persona selector.
- Depth/Layering: 2px navy panel border and solid offset shadow.
- Animation: brief save confirmation is shown for 2.5 seconds.
- 3D elements: none.

## Component Inventory

| Component     | Type           | State         | Notes                                  |
| ------------- | -------------- | ------------- | -------------------------------------- |
| Display name  | Text input     | Editable      | Required.                              |
| Account email | Email input    | Editable      | Required; local value only.            |
| Persona       | Select         | Three options | Direct, empathetic, sprint/analytical. |
| Timezone      | Text input     | Editable      | Free text, not a timezone picker.      |
| Save feedback | Status message | Hidden/saved  | No server confirmation.                |
| Save Changes  | Submit button  | Default       | Calls local GoalContext setter.        |

## States

### Default

Fields initialized from local `user` profile.

### Empty

Required name/email fields; browser form validation may apply.

### Loading

No saving state.

### Error

No update error state.

### Saved

Success message appears for 2.5 seconds after local update.

## Copy & Microcopy

| Element      | Copy                                                                                       | Notes                                          |
| ------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Heading      | “Account & Accountability Profile”                                                         | Current copy.                                  |
| Description  | “Manage your personal details and how Nemotron addresses your goals.”                      | Current copy.                                  |
| Fields       | “Display Name”, “Account Email”, “Nemotron AI Partner Persona”, “Timezone (For Check-Ins)” | Labels.                                        |
| Save         | “Save Changes”                                                                             | Updates local profile.                         |
| Confirmation | “Profile settings updated successfully!”                                                   | Local state only; not cloud sync confirmation. |

## Interactions

| Trigger                  | Action                   | Animation              | Result                     |
| ------------------------ | ------------------------ | ---------------------- | -------------------------- |
| Edit field/select option | Update component state   | Focus border change    | Pending local form values. |
| Submit form              | Call `updateUserProfile` | Success notice timeout | Context profile updated.   |

## API Calls

| Endpoint                         | Method       | Trigger | Response used for                                                                        |
| -------------------------------- | ------------ | ------- | ---------------------------------------------------------------------------------------- |
| GoalContext local profile setter | Local update | Save    | No network endpoint; current “local and cloud session” copy is not backed by this panel. |

## Responsive Behavior

- 1440px: Two-column field grid in one panel.
- 1024px: Same two-column grid.
- 768px: Fields stack at narrow widths; save action remains visible at panel end.

## Accessibility

- Ensure every control has an explicit `label`/`htmlFor`; the current labels do not all expose `htmlFor`/IDs.
- Announce the saved message as a status/live region and preserve focus.
- Timezone should use a validated, discoverable control if required.
- Contrast and full keyboard audit not performed.

## References to Feature Docs

- None.
