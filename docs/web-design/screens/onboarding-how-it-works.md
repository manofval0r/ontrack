# Onboarding — How It Works — Design Document

## Purpose

Document the questionnaire's requested three-step onboarding explainer and map it to the current product. This is **not a current onboarding screen**: the deployed route has no explainer state. A four-step “How it works” section exists on the public landing page instead.

## User Goal

Learn the goal → tracker → progress/accountability loop before deciding whether to start. Whether this should be a standalone onboarding step is an open product decision.

## Layout

As built: landing page section with four numbered illustrated blocks in a responsive grid. There is no horizontal onboarding carousel, step-by-step navigation, or explainer route. Do not build a new screen from this document without confirming the flow decision in the master index.

## Visual Direction

- Background: pale gray/light neutral section, navy text and turquoise accents.
- Primary element: four numbered steps and their illustrations.
- Depth/Layering: tactile white cards with navy outlines and offset shadows.
- Animation: card hover lift/illustration scale; no sequence animation.
- 3D elements: none.

## Component Inventory

| Component              | Type                     | State   | Notes                                                                                      |
| ---------------------- | ------------------------ | ------- | ------------------------------------------------------------------------------------------ |
| Landing “How it works” | Four-item explainer grid | Default | “Say your goal”, “Your tracker builds itself”, “Log progress as you go”, “Get checked on”. |
| Illustrations          | SVG image                | Default | `/illustrations/step-1.svg` through `step-4.svg`.                                          |
| Onboarding stepper     | Progressbar              | Absent  | Current onboarding goes directly from welcome to goal entry.                               |

## States

### Default

Landing section renders four static explanatory items.

### Empty

Not applicable.

### Loading

No loading state.

### Error

No section-specific error state.

### Proposed standalone step

Not approved; questions about number of concepts, voice/work-block mention, and interaction remain open.

## Copy & Microcopy

| Element         | Copy                         | Notes                                                                            |
| --------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| Section heading | “How it works”               | Landing page.                                                                    |
| Step 1          | “Say your goal”              | Text or voice is described; current onboarding input is text.                    |
| Step 2          | “Your tracker builds itself” | Describes AI; current onboarding uses deterministic local heuristics.            |
| Step 3          | “Log progress as you go”     | Describes conversational updates.                                                |
| Step 4          | “Get checked on”             | Describes check-ins/verdict; scheduling is not implemented by the web prototype. |

## Interactions

| Trigger                  | Action                         | Animation      | Result               |
| ------------------------ | ------------------------------ | -------------- | -------------------- |
| Scroll to section anchor | Reveal section                 | Native scroll  | Explainer content.   |
| Hover item               | Slight lift/illustration scale | CSS transition | Decorative response. |

## API Calls

| Endpoint | Method | Trigger | Response |
| -------- | ------ | ------- | -------- |
| None     | —      | Render  | Static   |

## Responsive Behavior

- 1440px: Four-column grid.
- 1024px: Four-column grid begins at Tailwind `lg`; check card width at the exact breakpoint.
- 768px: Two-column grid begins at Tailwind `md`; it stacks below that breakpoint.

## Accessibility

- Use ordered headings and meaningful image alternatives; ensure each card remains understandable without its illustration.
- No interaction is required to access explanatory content.
- Keyboard and contrast audits not performed.

## References to Feature Docs

- [Dynamic tracker](../features/dynamic-tracker.md)
- [Verdict](../features/verdict.md)
