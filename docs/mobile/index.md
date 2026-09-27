# OnTrack Mobile Design Documentation

Status: documentation set drafted from the questionnaire. These are specifications for a future React Native + Expo application; this repository currently has no Expo app. Mobile screens adapt the [web design reference](../web-design/index.md), not descriptions of an existing mobile implementation. Confirmed owner choices are separated from recommended defaults and open product/API decisions.

## Confirmed Foundation

- Platform: React Native with Expo; iOS and Android, cross-platform behavior.
- Color/type direction: inherit the current web tokens and fonts: turquoise `#00C4B3`, navy `#071E2D`, teal `#006D6A`, aqua `#33D6C5`, Fraunces and DM Sans. This supersedes the older mobile-guide palette (`#14BBA6`, `#13444A`) pending a future brand change.
- New-user order: onboarding and first-goal preview before signup; returning users authenticate.
- Auth: separate signup and login screens. Full-screen signup confirmed.
- Keyboard: shift/scroll the form above the keyboard so the focused field and submit action remain usable.
- Login: automatically offer biometrics at launch for returning users; a first-use opt-in and secure credential fallback are recommended and require confirmation.
- Provider: Google sign-in requested for both platforms. Apple is deferred; review Sign in with Apple requirements before iOS release.
- Launch/onboarding: native static launch only; one screen at a time for onboarding; request notification permission after signup when explaining reminders and microphone permission only when voice input is first used.
- Navigation baseline from the mobile guide: Home, Chat, Goals, Settings bottom tabs; auth stack before tabs; Goal Detail, Voice Input, Work-Block, and Goal Creation are modal surfaces. The goal-first onboarding sequence precedes signup for new users.
- Native affordances: touch targets at least 44pt on iOS and 48dp on Android; respect safe areas, keyboard insets, VoiceOver/TalkBack, and reduced motion.

## Screens

| Screen                        | Document                                  |
| ----------------------------- | ----------------------------------------- |
| M1 — Splash / App Launch      | [Splash](screens/splash.md)               |
| M2 — Mobile Onboarding        | [Onboarding](screens/onboarding.md)       |
| M3 — Auth: Sign Up            | [Signup](screens/signup.md)               |
| M4 — Auth: Log In             | [Login](screens/login.md)                 |
| M5 — Home / Dashboard tab     | [Home](screens/home.md)                   |
| M6 — Chat tab                 | [Chat](screens/chat.md)                   |
| M7 — Goals List tab           | [Goals](screens/goals.md)                 |
| M8 — Goal Detail modal        | [Goal Detail](screens/goal-detail.md)     |
| M9 — Work-Block Overlay       | [Work-Block](screens/work-block.md)       |
| M10 — Settings tab            | [Settings](screens/settings.md)           |
| M11 — Settings: Profile       | [Profile](screens/profile.md)             |
| M12 — Settings: Audio         | [Audio Preferences](screens/audio.md)     |
| M13 — Settings: Notifications | [Notifications](screens/notifications.md) |
| M14 — Settings: Integrations  | [Integrations](screens/integrations.md)   |

## Feature Documents

| Feature         | Document                                                            |
| --------------- | ------------------------------------------------------------------- |
| Voice Input     | [Mobile voice input](features/voice-input/mobile-design.md)         |
| TTS Player      | [Mobile TTS player](features/tts-player/mobile-design.md)           |
| Chat Messages   | [Mobile chat messages](features/chat-messages/mobile-design.md)     |
| Dynamic Tracker | [Mobile dynamic tracker](features/dynamic-tracker/mobile-design.md) |
| Work-Block      | [Mobile work-block](features/work-block/mobile-design.md)           |
| Verdict         | [Mobile verdict](features/verdict/mobile-design.md)                 |
| Goal Card       | [Mobile goal card](features/goal-card/mobile-design.md)             |
| Stats & Charts  | [Mobile stats & charts](features/stats-charts/mobile-design.md)     |

## Mobile-Wide References

| Reference                       | Document                                        |
| ------------------------------- | ----------------------------------------------- |
| Haptic feedback map             | [Haptics](haptics.md)                           |
| Push notification templates     | [Push notifications](push-notifications.md)     |
| Safe-area guide                 | [Safe areas](safe-area.md)                      |
| Modal and bottom-sheet behavior | [Modal behavior](modal-behavior.md)             |
| Web/mobile parity               | [Cross-platform consistency](cross-platform.md) |

## Open Decisions

- App-level foundation questions in `mobile_design.md` that remain unanswered: tab-bar appearance/badges/hide behavior, modal snap points, quiet hours and push timing, Dynamic Island/Android widgets, and global haptic intensity.
- Recommended Home hierarchy (Today's Focus selection rule, due-soon window, chart metrics), list sorting/search, modal details, and some copy are proposals rather than owner approvals.
- Expo navigation, audio, biometric, haptic, notification, chart, and safe-area library choices are not established by this repository.
- Auth/API/session contracts, pending-goal persistence, notification registration/deep links, ASR/TTS services, work-block lifecycle, and verdict trigger/model remain undefined.
- Google is requested on both platforms; Apple sign-in is deferred for now. Review App Store policy before release.
- The mobile guide's original palette conflicts with the existing web tokens; the product owner selected the current web tokens for this pass. See [cross-platform parity](cross-platform.md).

## Links

- [Mobile questionnaire and agent guide](../../../mobile_design.md)
- [Web design documentation](../web-design/index.md)
- [Shared web design-system reference](../../web/design.md)

This index is the mobile entry point. Questionnaire items without explicit answers are represented as recommendations/open decisions in the linked documents, not silently treated as requirements.
