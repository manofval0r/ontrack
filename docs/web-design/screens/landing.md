# Landing / Welcome — Design Document

## Purpose

Introduce OnTrack to a prospective user at `/`, explain the goal-to-tracker loop, and route them to signup or product onboarding. This is a public marketing page, not an authenticated dashboard.

## User Goal

Understand the product quickly and choose whether to start tracking or inspect how it works.

## Layout

Sticky public navbar; centered hero with credibility pill, headline, product description, two CTAs; wide product showcase with the `/mockup.png` image between static side panels; feature guarantee pills; subsequent explanatory sections and footer. The landing page is the only current home for the four-step “How it works” explainer.

## Visual Direction

- Background: pale gray dot-grid canvas with restrained turquoise ambient glow.
- Primary element: Fraunces headline and three-screen product mockup.
- Depth/Layering: white panels, 2px navy outlines, solid offset shadows, rounded corners.
- Animation: button/card hover lift; no required scroll choreography observed.
- 3D elements: none; static product imagery and decorative charts.

## Component Inventory

| Component        | Type                   | State   | Notes                                                        |
| ---------------- | ---------------------- | ------- | ------------------------------------------------------------ |
| Navbar           | Shared navigation      | Default | Links to public routes; CTA to signup.                       |
| Hero             | Marketing section      | Default | Headline, description, credibility label, two actions.       |
| Product showcase | Static mockup + panels | Default | Displays sample progress and AI copy; not live account data. |
| How it works     | Four-step section      | Default | Illustrations and explanatory text.                          |
| Feature pills    | Decorative labels      | Default | “Ready in seconds”, “Any goal type”, “Zero configuration”.   |

## States

### Default

Page content and sample showcase render together.

### Empty

Not applicable; no user data is requested.

### Loading

No application loading state identified.

### Error

No landing-specific error state. Broken image behavior is not customized.

### Responsive

Mockup and side panels stack below the wide-screen breakpoint; navbar and hero actions wrap.

## Copy & Microcopy

| Element          | Copy                                                       | Notes                                       |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------- |
| Hero heading     | “Track Your Ambitions With Personalized Confidence”        | Current implementation copy.                |
| Primary CTA      | “Start Tracking Free”                                      | Routes to `/signup`.                        |
| Secondary CTA    | “Explore Features”                                         | Anchors to `#how-it-works`.                 |
| Product showcase | “Goal Velocity”, “Active Target”, “Tips For Success”       | Static illustrative sample, not user state. |
| Guarantee label  | “Verified AI Accountability · Designed for Follow-Through” | Claim should be reviewed before production. |

## Interactions

| Trigger               | Action                                | Animation               | Result                       |
| --------------------- | ------------------------------------- | ----------------------- | ---------------------------- |
| Select primary CTA    | Navigate to `/signup`                 | Link navigation         | Signup page.                 |
| Select secondary CTA  | Scroll to `#how-it-works`             | Browser anchor behavior | Four-step explanation.       |
| Select navbar links   | Navigate to their public destinations | Link navigation         | Login/signup or page anchor. |
| Hover showcase panels | Raise panel slightly                  | CSS transition          | Visual feedback only.        |

## API Calls

| Endpoint | Method | Trigger     | Response used for           |
| -------- | ------ | ----------- | --------------------------- |
| None     | —      | Page render | Showcase content is static. |

## Responsive Behavior

- 1440px: Centered hero, mockup flanked by two side-panel columns.
- 1024px: Showcase begins to stack; keep the product image legible and avoid side-panel compression.
- 768px: Single-column showcase, wrapped CTAs, reduced hero spacing. Exact tablet screenshots remain unverified.

## Accessibility

- Use a single page-level `h1`; provide meaningful alternative text for product images and step illustrations.
- Keep all nav and CTA links keyboard-operable and visibly focused.
- Credibility pill and static data panels should not imply verified live metrics; screen-reader copy should identify them as examples.
- Contrast and full keyboard/zoom behavior have not been audited.

## References to Feature Docs

- [Stats & charts](../features/stats-charts.md) — static showcase chart treatment only.
