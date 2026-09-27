# Onboarding — Welcome — Design Document

## Purpose

Set context for a first-time visitor who enters `/onboarding`. The first state frames the experience as immediate goal creation, then advances into the goal prompt; it does not collect account details.

## User Goal

Understand that they can describe a goal in their own words and begin without setup.

## Layout

Standalone full-height flow with a slim header (back control only when applicable and four-segment progress indicator), centered illustration card, heading, short description, and one primary action. On step 1 there is no logo or main navigation.

## Visual Direction

- Background: pale dot-grid, navy text, turquoise accents.
- Primary element: custom step illustration inside a tactile white bordered panel.
- Depth/Layering: outlined card with solid offset shadow and soft turquoise glow.
- Animation: content fade-in and hover lift; progress segments animate between states.
- 3D elements: none.

## Component Inventory

| Component            | Type                   | State       | Notes                                       |
| -------------------- | ---------------------- | ----------- | ------------------------------------------- |
| Progress indicator   | Accessible progressbar | Step 1 of 4 | Steps are welcome, prompt, building, ready. |
| Welcome illustration | Image                  | Default     | `/illustrations/step-1.svg`.                |
| Intro copy           | Heading and paragraph  | Default     | Focuses on setting the first goal.          |
| “Let's go”           | Primary button         | Enabled     | Advances to step 2.                         |

## States

### Default

Welcome illustration, explanatory copy, and CTA.

### Empty

Not applicable.

### Loading

No loading state.

### Error

No welcome-specific error state.

### Return visit

The route does not check onboarding completion before rendering; behavior depends on caller/navigation.

## Copy & Microcopy

| Element     | Copy                                                               | Notes                                                             |
| ----------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Heading     | “You're in. Let's set your first goal.”                            | Current copy.                                                     |
| Description | “Say it however you'd say it out loud. We'll figure out the rest.” | “Say” is aspirational here; step 2 currently has text input only. |
| CTA         | “Let's go”                                                         | Advances locally; no network call.                                |
| Status pill | “Zero setup required · Voice or text input”                        | Voice input is not visibly available on this step. Clarify claim. |

## Interactions

| Trigger           | Action             | Animation | Result           |
| ----------------- | ------------------ | --------- | ---------------- |
| Select “Let's go” | Set flow to step 2 | Fade-in   | Goal entry form. |

## API Calls

| Endpoint | Method | Trigger     | Response used for           |
| -------- | ------ | ----------- | --------------------------- |
| None     | —      | Step render | State is local to the page. |

## Responsive Behavior

- 1440px: Centered, narrow content column with generous whitespace.
- 1024px: Same centered composition.
- 768px: Illustration and heading scale down; CTA remains centered and full text remains visible.

## Accessibility

- Progress uses `role="progressbar"` and value attributes.
- Illustration has alternative text; CTA is a native button.
- Confirm that the progressbar label describes the full onboarding flow and that focus moves predictably after step change.
- Contrast audit not performed.

## References to Feature Docs

- None.
