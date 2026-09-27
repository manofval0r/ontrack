# Mobile Haptic Feedback Map

## Status and Principles

Recommendations for a future Expo app; haptics are not implemented. Use sparingly, make them optional/system-respectful, and never make vibration the only confirmation. Suggested APIs use Expo Haptics (`expo-haptics`); exact availability varies by device and platform.

| Trigger                  | Suggested haptic type               | Suggested API                                                         | Notes                                                 |
| ------------------------ | ----------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------- |
| Tab/filter selection     | Selection                           | `Haptics.selectionAsync()`                                            | Optional; avoid firing on every scroll.               |
| Goal created and saved   | Light impact / success notification | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` | Only after server confirmation.                       |
| Counter progress logged  | Light impact                        | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`              | Not on failed request.                                |
| Checklist item completed | Selection or light impact           | `Haptics.selectionAsync()`                                            | Avoid heavy impact per row.                           |
| Goal target achieved     | Success notification                | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` | One event, not duplicate tracker + verdict vibration. |
| Verdict delivered        | Selection or none                   | `Haptics.selectionAsync()`                                            | No negative/error vibration for missed goal.          |
| Streak milestone         | Medium impact, optional             | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)`             | Milestone threshold and user setting are TBD.         |
| Work-block starts/ends   | Light impact, optional              | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`              | Avoid every timer tick.                               |
| Validation/network error | None by default                     | —                                                                     | Communicate in accessible text.                       |

## Controls and Accessibility

- Provide a master haptics preference if product wants users to disable them; respect OS silent/accessibility settings where possible.
- Do not use heavy/impact haptics for routine interactions.
- Guard APIs for simulator/device support and handle rejected promises without blocking the action.
- Audit triggers to prevent double-firing when a server response updates multiple components.

## Open Decisions

Which events are approved, intensity, preference scope, platform-specific availability, and whether notification-style haptics require a system permission.

## References

- [Home](screens/home.md)
- [Goal Detail](screens/goal-detail.md)
- [Work-Block](screens/work-block.md)
