# 404 / Not Found — Design Document

## Purpose

Help a user recover from an unknown route via the catch-all route in `App.tsx`. The pulled redesign uses an OnTrack-specific illustration and links back to the dashboard, home, onboarding, and settings.

## User Goal

Recognize that the requested route is unavailable and get back to a useful destination.

## Layout

Standalone full-height dot-grid page; header with logo and dashboard link; centered bordered card containing error label, illustration, heading, explanation, two primary destinations, and quick links; small footer.

## Visual Direction

- Background: pale dot-grid with navy/turquoise palette.
- Primary element: illustration and “Whoops! You're Off Track.” heading.
- Depth/Layering: large white panel, heavy solid navy offset shadow.
- Animation: small illustration hover scale and badge pulse.
- 3D elements: none.

## Component Inventory

| Component          | Type             | State   | Notes                                            |
| ------------------ | ---------------- | ------- | ------------------------------------------------ |
| Logo               | Brand link       | Default | Links to dashboard.                              |
| Dashboard action   | Link             | Default | Header and main action both route to dashboard.  |
| Error illustration | Image            | Default | `/illustrations/undraw_page-not-found_6wni.svg`. |
| Recovery links     | Navigation links | Default | Home, dashboard, onboarding, settings.           |
| Footer             | Brand text       | Default | No further action.                               |

## States

### Default

Static 404 recovery page.

### Empty

Not applicable.

### Loading

Not applicable.

### Error

The page itself is the catch-all error state; route-specific server errors are not represented.

## Copy & Microcopy

| Element       | Copy                                                                    | Notes                                                              |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Error label   | “Route Desynchronized · Error 404”                                      | Technical/brand wording; confirm tone.                             |
| Heading       | “Whoops! You're Off Track.”                                             | Playful brand copy.                                                |
| Description   | “The screen or tracker you're searching for took an unexpected detour…” | Claims user data safety; verify against auth/storage architecture. |
| Primary CTA   | “Return to Dashboard”                                                   | Dashboard may require a session, but route guard is absent.        |
| Secondary CTA | “Go to Home Page”                                                       | Routes to `/`.                                                     |
| Quick links   | “Trackers Overview”, “New Goal Flow”, “Account Settings”                | Navigate to dashboard/onboarding/settings.                         |

## Interactions

| Trigger                         | Action                   | Animation        | Result               |
| ------------------------------- | ------------------------ | ---------------- | -------------------- |
| Select dashboard action         | Navigate to `/dashboard` | Route navigation | Dashboard.           |
| Select home action              | Navigate to `/`          | Route navigation | Landing page.        |
| Select onboarding/settings link | Navigate to route        | Route navigation | Selected route.      |
| Hover illustration              | Scale slightly           | CSS transition   | Decorative feedback. |

## API Calls

| Endpoint | Method | Trigger    | Response used for |
| -------- | ------ | ---------- | ----------------- |
| None     | —      | Route miss | Static content.   |

## Responsive Behavior

- 1440px: Centered card with header/footer and illustration at medium width.
- 1024px: Same composition with fluid card width.
- 768px: Card padding and illustration height reduce; recovery actions stack; quick links wrap.

## Accessibility

- Illustration has alt text; links are native anchors.
- Heading hierarchy and visible focus should be preserved; decorative pulsing badge should not communicate essential state alone.
- Validate that the dashboard destination is sensible for signed-out users.
- Contrast and keyboard audit not performed.

## References to Feature Docs

- None.
