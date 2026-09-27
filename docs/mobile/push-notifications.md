# Push Notification Templates — Mobile

## Status

Templates below are proposed from the mobile questionnaire, not approved copy or implemented behavior. Push provider, schedule, quiet hours, device-token storage, and backend event contract are not defined.

| Type                 | Proposed title              | Proposed body                                                               | Deep link                          | Actions                          |
| -------------------- | --------------------------- | --------------------------------------------------------------------------- | ---------------------------------- | -------------------------------- |
| Daily reminder       | “Your goals for today”      | “Take a moment to choose the next step on [goal].”                          | Home → Today's Focus / goal detail | “Open OnTrack”                   |
| Check-in due         | “OnTrack check-in”          | “[Goal] is ready for a quick progress update.”                              | Goal Detail → check-in section     | “Respond” / dismiss if supported |
| Deadline approaching | “A goal is due soon”        | “[Goal] is due [time/date]. Review your progress.”                          | Goal Detail                        | “Review goal”                    |
| Streak at risk       | “Keep your streak going”    | “No progress has been logged today. Add an update if you worked on [goal].” | Goal Detail / progress input       | “Log progress”                   |
| Verdict ready        | “Your goal result is ready” | “See the outcome for [goal].”                                               | Goal Detail → verdict              | “View result”                    |

## Delivery Rules

- Ask for OS notification permission after signup in context, as selected by the product owner; do not block account setup if declined.
- Respect per-category preferences, OS permission state, time zone, quiet hours, and user-defined schedule if those features are approved.
- Avoid sensitive goal content on lock screens by default; offer a privacy setting before including titles/details.
- Deduplicate and expire stale deadline/check-in notifications. Deep links must validate auth, goal existence, and permission before navigation.
- Use neutral, non-shaming language; avoid “urgent” unless a real time-sensitive state exists.

## Platform Notes

- iOS: Configure notification categories/actions and permission states; route app/universal links to validated destinations.
- Android: Configure notification channels, importance, action buttons, and runtime permission by OS version.

## Open Decisions

Send windows, daily summary, quiet hours, deadline lead-time, action buttons, badge count, lock-screen privacy, retries, and deep-link fallback destination.

## References

- [Notifications settings](screens/notifications.md)
- [Safe-area guide](safe-area.md)
