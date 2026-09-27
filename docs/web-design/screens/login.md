# Auth — Log In — Design Document

## Purpose

Provide returning users access through `/login`. The visual design supports email/password and provider actions, but the current page routes to the dashboard without authenticating credentials.

## User Goal

Sign in quickly or recover access if the password is forgotten.

## Layout

Shared public navbar and responsive split main area. The form includes email, password, visibility toggle, forgot-password link, primary submit, social buttons, and signup link. Desktop pairs the form with an OnTrack illustration; smaller widths hide that illustration.

## Visual Direction

- Background: white, navy typography, turquoise focus color.
- Primary element: compact email/password form.
- Depth/Layering: low-depth inputs and tactile navy CTA.
- Animation: hover/active movement on controls.
- 3D elements: none.

## Component Inventory

| Component           | Type              | State               | Notes                                                   |
| ------------------- | ----------------- | ------------------- | ------------------------------------------------------- |
| Navbar              | Shared navigation | Default             | Public links.                                           |
| Email/password form | Form              | Editable            | Submit handler currently navigates to dashboard.        |
| Password visibility | Icon button       | Visible/hidden      | Accessible label changes.                               |
| Forgot password     | Link              | Default             | Currently `href="#"`; recovery flow is not implemented. |
| Error example       | Alert             | Rendered demo state | Static sample error, not tied to validation.            |
| Provider actions    | Icon buttons      | Default             | Provider availability unconfirmed.                      |
| Auth illustration   | Image/panel       | Desktop only        | Hidden below `lg`.                                      |

## States

### Default

Fields are empty; an example invalid-credentials alert is rendered in the current UI.

### Empty

HTML required fields exist, but `noValidate` disables browser form validation UI.

### Loading

No auth request or submitting state.

### Error

A static `role="alert"` example exists; it is not driven by submitted credentials.

### Success

Handler navigates to `/dashboard` without verifying credentials; treat as mock behavior.

## Copy & Microcopy

| Element         | Copy                                              | Notes                                                       |
| --------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| Heading         | “Log in”                                          | Current copy.                                               |
| Forgot password | “Forgot password?”                                | Placeholder anchor only.                                    |
| Error example   | “That email and password don't match. Try again.” | Static demo; must not be represented as an actual response. |
| Submit          | “Log in”                                          | Current handler navigates directly.                         |
| Signup link     | “Don't have an account? Sign up”                  | Routes to `/signup`.                                        |

## Interactions

| Trigger                | Action                                       | Animation        | Result                          |
| ---------------------- | -------------------------------------------- | ---------------- | ------------------------------- |
| Submit                 | Prevent default and navigate to `/dashboard` | Route navigation | Demo dashboard; no auth check.  |
| Toggle password        | Switch input type                            | None             | Reveals/conceals password.      |
| Select forgot password | Navigate to `#`                              | None             | No recovery flow.               |
| Select provider        | Provider button action                       | Hover            | No provider contract confirmed. |
| Select signup link     | Navigate to `/signup`                        | Route navigation | Signup form.                    |

## API Calls

| Endpoint | Method | Trigger | Response used for     |
| -------- | ------ | ------- | --------------------- |
| None     | —      | Submit  | No network auth call. |

## Responsive Behavior

- 1440px: Form/illustration split with centered max-width layout.
- 1024px: Split remains at `lg`; verify form fit at the breakpoint.
- 768px: Form-only, full width within a readable max-width; provider actions remain centered.

## Accessibility

- Labels are associated to fields; password toggle has an accessible name; error sample uses `role="alert"`.
- `noValidate` means a real validation design is still needed. `href="#"` is not a working recovery action.
- Preserve keyboard focus and announce server errors when auth is connected.
- Contrast and complete keyboard audit not performed.

## References to Feature Docs

- None.
