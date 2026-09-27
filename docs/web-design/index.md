# OnTrack Web Design Documentation

Status: as-built reference and design-decision backlog. Reviewed against `origin/main` after fast-forwarding to `f2c184f` on 2026-09-27. This documentation describes the current web UI; it is not approval to expand or change implementation.

## Source of truth

- Current route and component behavior: `web/src/` on `main` at `f2c184f`.
- Existing palette, typography, and component rules: [Web design-system reference](../../web/design.md).
- Product scope and earlier web flow: [Frontend web plan](../OnTrack%20Frontend%20Web.md).
- Screen and feature coverage requirements: [Web design questionnaire](../../../WEB_DESIGN_QUESTIONNAIRE.md).
- The documents here distinguish **As built**, **Demo data**, and **Open decision**. Do not present a prototype behavior as a live backend capability.

## Important design reconciliation

The existing design-system reference is a useful description of the teal/navy tactile language used by the landing page, onboarding, chat, goal workspace, and settings. The pulled dashboard is a separate light-gray, charcoal, and orange visual language, with compact rounded cards, a dock rail, a top navigation row, charts, and slide-over goal details. This is an observed inconsistency, not an approved rebrand. Keep both descriptions explicit until the product/design owner decides whether the dashboard is an intentional exception or should converge.

The frontend currently uses local mock data and browser storage; the `api` functions are simulated and do not issue HTTP requests. Some dashboard totals, chart series, suggested metrics, and onboarding parsing outputs are hard-coded or heuristic. Real auth, remote AI parsing, server persistence, push notifications, integrations, and a work-block timer are not established by the current UI.

## Screen documents

| Screen                         | Route / surface                      | Document                                               |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------ |
| Landing / Welcome              | `/`                                  | [Landing](screens/landing.md)                          |
| Onboarding — Welcome           | `/onboarding`, step 1                | [Onboarding welcome](screens/onboarding-welcome.md)    |
| Onboarding — How It Works      | Landing section; no onboarding step  | [How it works](screens/onboarding-how-it-works.md)     |
| Onboarding — Create First Goal | `/onboarding`, step 2                | [Create first goal](screens/onboarding-create-goal.md) |
| Onboarding — Goal Ready        | `/onboarding`, step 4                | [Goal ready](screens/onboarding-goal-ready.md)         |
| Sign Up                        | `/signup`                            | [Sign up](screens/signup.md)                           |
| Log In                         | `/login`                             | [Log in](screens/login.md)                             |
| Dashboard                      | `/dashboard`                         | [Dashboard](screens/dashboard.md)                      |
| Chat / Goal Creation           | `/chat`                              | [Chat](screens/chat.md)                                |
| Goal Workspace                 | `/goal/:id` and dashboard slide-over | [Goal workspace](screens/goal-workspace.md)            |
| Settings — Main                | `/settings`                          | [Settings main](screens/settings-main.md)              |
| Settings — Profile             | `/settings`, Profile tab             | [Profile](screens/settings-profile.md)                 |
| Settings — Audio               | `/settings`, Audio tab               | [Audio preferences](screens/settings-audio.md)         |
| Settings — Notifications       | `/settings`, Notifications tab       | [Notifications](screens/settings-notifications.md)     |
| Settings — Integrations        | `/settings`, Integrations tab        | [Integrations](screens/settings-integrations.md)       |
| 404 / Not Found                | route catch-all                      | [Not found](screens/not-found.md)                      |

The questionnaire's onboarding confirmation step is presented as the Goal Ready screen above. The landing page contains a four-item “How it works” section; onboarding itself has four states (welcome, goal entry, building, tracker ready), not a separate explainer step. There is no distinct skip/later step in the current flow.

## Feature documents

| Feature                    | Document                                       |
| -------------------------- | ---------------------------------------------- |
| Voice input                | [Voice input](features/voice-input.md)         |
| TTS player                 | [TTS player](features/tts-player.md)           |
| Chat message rendering     | [Chat messages](features/chat-messages.md)     |
| Dynamic tracker            | [Dynamic tracker](features/dynamic-tracker.md) |
| Work-block mode            | [Work-block](features/work-block.md)           |
| Verdict                    | [Verdict](features/verdict.md)                 |
| Dashboard goal card        | [Goal card](features/goal-card.md)             |
| Dashboard stats and charts | [Stats and charts](features/stats-charts.md)   |

## Cross-screen standards and unresolved decisions

### Navigation and transitions

Public routes are `/`, `/login`, and `/signup`; `/onboarding` is a standalone four-state flow; app routes are `/dashboard`, `/chat`, `/goal/:id`, and `/settings`. The dashboard has its own rail/top-nav composition. Other app pages use `AppLayout`. Route guarding and authenticated-session behavior are not implemented in the route table. Dashboard goal selection opens a slide-over; the goal title can also lead to the dedicated workspace.

### Visual system

The current shared app tokens are defined in `web/src/index.css`, with the teal/navy palette and DM Sans/Fraunces. The dashboard is a notable orange-accented exception with its own local styles. Screen documents describe the actual screen first and identify consistency gaps rather than claiming a unified approved system.

### Loading, empty, errors, and feedback

Loading/error components exist in some app surfaces, but behavior is not global or uniform. Do not imply toast behavior or a global skeleton system: neither is established by the reviewed screens. Route-specific states are listed in each screen document.

### Responsive behavior

The implementation uses Tailwind breakpoints, primarily `sm`, `md`, `lg`, `xl`, and `2xl`. Unless stated otherwise, descriptions at 1440px, 1024px, and 768px are observations from those responsive classes, not verified screenshot measurements. Narrow-screen QA and complete responsive acceptance criteria remain open.

### Accessibility

Visible focus styles and several labels/ARIA attributes are present, but no documented contrast audit or full keyboard/screen-reader audit was found. Each screen records observed accessibility support and known gaps; do not state WCAG conformance without testing.

## Decisions to confirm with the product/design owner

- Confirm the foundation answers from the questionnaire: brand personality, intended tone, approved type, app navigation, light/dark mode, motion, assistant naming, and copy voice.
- Decide whether the dashboard's orange/charcoal redesign is intentional or should follow the teal/navy system; resolve its financial-product motifs and replace demo metrics before presenting them as OnTrack data.
- Confirm whether a standalone onboarding “How It Works” step and skip/later path are required. Current onboarding omits both; the landing page has a product explainer section.
- Confirm when account creation should happen. Current onboarding creates a goal and enters the dashboard without signup; login/signup currently navigate without validating credentials.
- Confirm production API contracts and ownership for AI parsing, goal persistence, auth, notifications, integrations, work-block, and verdict timing. Current adapters are local simulations.
- Confirm design behavior for chat history, voice transcription correction/permission errors, TTS provider and playback controls, automatic/early verdict triggers, and responsive/accessibility acceptance.
