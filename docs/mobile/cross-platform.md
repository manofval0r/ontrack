# Web and Mobile Design Parity

## Purpose

Track intentional differences and shared product contracts between the web and future React Native/Expo apps. Mobile designs are native adaptations, not scaled web layouts. This is a living checklist; parity is not yet verifiable because the mobile app does not exist.

## Current Baseline

| Area            | Web reference                                                                      | Mobile direction                                                                             | Status                                            |
| --------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Color/type      | Current web tokens: `#00C4B3`, `#071E2D`, `#006D6A`, `#33D6C5`; DM Sans/Fraunces.  | Product owner selected current web tokens over the older mobile questionnaire palette.       | Confirmed for mobile docs.                        |
| Dashboard style | Web dashboard has an orange/charcoal redesign that diverges from shared teal/navy. | Mobile should follow shared teal/navy tokens.                                                | Web visual divergence remains unresolved.         |
| Navigation      | Web route layout and dashboard dock/top nav.                                       | Bottom tabs: Home, Chat, Goals, Settings; auth stack; modal detail/work-block/goal creation. | Mobile guide baseline.                            |
| Signup order    | Web landing/signup and onboarding routes are separate; prototype auth is not real. | New users: onboarding/goal preview, then signup.                                             | Product owner selected.                           |
| Auth methods    | Web UI shows Google/Apple/Facebook buttons, currently inert.                       | Google requested both platforms; Apple deferred pending iOS policy review.                   | Provider integration TBD.                         |
| Trackers        | Counter/checklist/manual in web prototype.                                         | Same goal types with touch-first controls.                                                   | Shared semantics; API pending.                    |
| Voice/TTS       | Browser APIs/prototype handlers; not production AI.                                | Native capture/playback plus actual ASR/TTS service.                                         | Service contracts pending.                        |
| Work-block      | Not implemented as a real timer in web.                                            | Full-screen mobile modal per guide.                                                          | Mobile feature requires product/backend contract. |
| Persistence/API | Web currently uses local mock adapter/browser storage.                             | Mobile API must use shared backend, not local-only assumptions.                              | API parity not achieved.                          |

## Contract Checklist

- [ ] Shared goal, tracker, progress, check-in, and verdict schemas.
- [ ] Same auth/session provider contract; define pending-goal handoff.
- [ ] Same validation/error envelope and retry/idempotency behavior.
- [ ] Equivalent status, deadline, time-zone, and completion semantics.
- [ ] Same user-facing labels for goal status and tracker types, except platform-fit wording approved by product.
- [ ] Defined deep-link routes and notification destinations.
- [ ] Data/privacy policy for audio recordings, transcripts, TTS, and lock-screen notifications.
- [ ] Document intentional feature gaps and platform-specific capabilities.

## Naming Guidance

Reuse domain terms across platforms (`Goal`, `GoalCard`, `CounterTracker`, `ChecklistTracker`, `ManualTracker`, `Verdict`). Component implementation names may differ by platform; API/domain names should not.

## Verification

Compare design tokens and copy tables, then contract-test web/mobile API requests and responses once both clients exist. Do not claim feature parity from visual similarity alone.

## References

- [Web design index](../web-design/index.md)
- [Mobile design index](index.md)
- [Mobile questionnaire](../../../mobile_design.md)
