# Auth — Sign Up — Design Document

## Purpose

Let a new user create an account from `/signup`. The current page is an auth-themed form surface, but account creation and provider authentication are placeholders.

## User Goal

Enter an email and password, or choose a displayed provider option, and continue into the product.

## Layout

Shared public navbar; split main region with a narrow form column on the left and goal-tracking illustration on the right at `lg` and above. On smaller screens the form occupies the page and the illustration is hidden. Includes email/password fields, password visibility control, primary action, social provider buttons, and link to login.

## Visual Direction

- Background: white form surface with navy text and turquoise focus accents.
- Primary element: signup form; visual counterweight is the product illustration.
- Depth/Layering: restrained borders, rounded fields, tactile primary button.
- Animation: hover/active button movement; no staged reveal specified.
- 3D elements: none.

## Component Inventory

| Component         | Type                            | State          | Notes                                                                                       |
| ----------------- | ------------------------------- | -------------- | ------------------------------------------------------------------------------------------- |
| Navbar            | Shared navigation               | Default        | Public navigation.                                                                          |
| Signup form       | Name/email/password fields      | Editable       | Includes “At least 8 characters.” helper; `noValidate` means no enforced inline validation. |
| Password control  | Icon button                     | Visible/hidden | Toggles password presentation.                                                              |
| Provider actions  | Google, Apple, Facebook buttons | Default        | Buttons have no handlers; displayed options are not configured OAuth.                       |
| Auth illustration | Illustration panel              | Desktop only   | Supporting product artwork.                                                                 |
| Login link        | Navigation link                 | Default        | Routes to `/login`.                                                                         |

## States

### Default

Empty fields and submit action.

### Empty

Required-field behavior depends on native/form implementation; no successful account creation contract documented.

### Loading

No confirmed production request/busy state.

### Error

No confirmed server-backed signup error flow.

### Success

Target route and whether onboarding goal is preserved remain open decisions.

## Copy & Microcopy

| Element               | Copy                                                           | Notes                                                                   |
| --------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Heading               | “Create your account”                                          | Current copy.                                                           |
| Fields                | “Full name”, “Email”, “Password”                               | Password helper: “At least 8 characters.”                               |
| Primary action        | “Create account”                                               | Current handler routes to `/onboarding`; it does not create an account. |
| Secondary link        | “Already have an account? Log in”                              | Routes to `/login`.                                                     |
| Illustration headline | “Type or speak in plain language. Ontrack builds the tracker.” | Supporting product illustration.                                        |

## Interactions

| Trigger                    | Action                       | Animation        | Result                                                                        |
| -------------------------- | ---------------------------- | ---------------- | ----------------------------------------------------------------------------- |
| Submit form                | Prevent default and navigate | Route navigation | `/onboarding`; no account is created and values are not passed into the flow. |
| Toggle password visibility | Change input type            | None             | Password shown or concealed.                                                  |
| Choose provider            | Provider button action       | Hover state      | OAuth availability is unconfirmed.                                            |
| Select login link          | Navigate to `/login`         | Route navigation | Login page.                                                                   |

## API Calls

| Endpoint | Method | Trigger | Response |
| -------- | ------ | ------- | -------- |
| None     | —      | Submit  | Static   |

## Responsive Behavior

- 1440px: Split form and illustration; content centered in max-width container.
- 1024px: Split layout at `lg` boundary; ensure illustration does not compete with form.
- 768px: Form-only layout; single-column fields and provider controls.

## Accessibility

- Associate labels and inputs; current fields set `autocomplete="name"`, `email`, and `new-password`.
- Password visibility control needs an accessible changing name; provider icons need explicit labels.
- Announce field and server errors beside the relevant fields; preserve focus after failed submit.
- Contrast and complete keyboard audit not performed.

## References to Feature Docs

- None.
