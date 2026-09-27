# Mobile Modal and Bottom-Sheet Behavior

## Global Modal Rules

- Use native navigation/modal presentation where practical; bottom sheets are reserved for focused tasks, not every settings subsection.
- Entry should rise from the bottom with a short platform-appropriate transition; respect reduced motion.
- Provide a visible close/back affordance and Android system-back support. Swipe dismissal supplements, never replaces, the close action.
- If unsaved user data exists, ask before discarding. Work-Block always remains escapable.
- Snap points depend on content; do not guess fixed percentages before device testing.

| Surface                   | Recommended presentation                       | Dismissal and snap behavior                                                              | Notes                                                |
| ------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Goal Detail               | Full-screen modal/stack screen                 | Close button, iOS edge swipe, Android back; swipe-down when safe                         | Confirm before discarding unsaved edits.             |
| Voice Input               | Medium-to-expanded bottom sheet                | Expand for transcript review; swipe-down only when idle; explicit cancel while recording | Recording stop/cancel must be visible.               |
| Work-Block                | Full-screen modal                              | Explicit End action and system back route to confirmation; never trap                    | No reliable app-close blocking.                      |
| Goal Creation             | Expanded bottom sheet or full-screen modal     | Start expanded for keyboard; dismiss preserves draft or confirms discard                 | Goal-first onboarding may use a full screen instead. |
| Auth                      | Full-screen stack screens                      | Native back; no dismissible sheet                                                        | Avoid accidental loss during account creation.       |
| Integration authorization | OS/browser provider flow or full-screen detail | Return through validated callback; cancel returns to prior list                          | Not a generic draggable sheet.                       |
| Sign-out confirmation     | Native alert/modal                             | Explicit cancel/confirm                                                                  | Explain session/local-data effect.                   |

## Accessibility and Gestures

- Modal title is announced; focus enters and returns to opener on dismiss.
- Avoid gesture conflicts with nested lists, checklists, and edge-back navigation.
- Provide a visible dismiss control at 44pt/48dp minimum; ensure actions clear safe areas.
- Test screen reader focus, large text, keyboard open, and landscape.

## Open Decisions

Exact navigation library, detents/snap points, dimming/backdrop, interactive dismiss thresholds, and unsaved-data persistence.

## References

- [Goal Detail](screens/goal-detail.md)
- [Work-Block](screens/work-block.md)
- [Voice Input](features/voice-input/mobile-design.md)
- [Safe-area guide](safe-area.md)
