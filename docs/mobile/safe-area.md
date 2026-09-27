# Mobile Safe-Area Guide

## Global Rules

- Use a safe-area-aware root for every React Native screen/modal; never hard-code status-bar or home-indicator heights.
- Apply keyboard/IME insets separately from safe area; avoid double bottom padding.
- Scrollable content includes bottom padding for persistent tabs and system navigation.
- Respect dynamic type/text scaling; content may scroll rather than overlap.
- Reference devices in screen wireframes use portrait around 390pt, but layouts must adapt to actual insets and widths.

| Screen/surface             | Top inset                                 | Bottom inset                                                          | Keyboard / landscape notes                                    |
| -------------------------- | ----------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| Native splash              | OS-managed                                | OS-managed                                                            | Static mark remains clear across aspect ratios.               |
| Onboarding                 | Header below status/notch                 | Primary action above home indicator                                   | Goal form scrolls above keyboard; landscape scrolls.          |
| Signup/login               | Back/header below top system area         | Form/footer clears home indicator                                     | Keyboard-aware scrolling keeps focused field/action visible.  |
| Home/Goals                 | Header below status bar                   | List clears tab bar plus home indicator                               | FAB above tab bar; landscape maintains list scroll.           |
| Chat                       | Header below top inset                    | Composer above keyboard; tabs above bottom inset when keyboard closed | Transcript resizes and scrolls; input caps height.            |
| Goal Detail modal          | Modal header below top inset              | Actions above home indicator                                          | Full-screen scrolling; keyboard applies for manual updates.   |
| Work-Block                 | Timer/close below system chrome           | Exit above home indicator                                             | Timer text remains visible in landscape; overlay never traps. |
| Settings subsections       | Title below top inset                     | List clears tab bar                                                   | Forms scroll around keyboard.                                 |
| Voice/Goal Creation sheets | Sheet respects top inset at expanded snap | Actions above home indicator                                          | Keyboard expands sheet/scrolls content.                       |

## Platform Notes

- iOS: Safe area accounts for notch/Dynamic Island/status bar and home indicator; interactive edge gestures must not overlap controls.
- Android: Respect status/navigation bars, edge-to-edge configuration, display cutouts, gesture navigation, and IME insets.
- Use platform APIs/library-provided insets and test multiple devices; do not assume one fixed pixel/point value.

## Verification Checklist

- Test compact iPhone with notch/Dynamic Island, iPhone with home indicator, Android gesture navigation, and Android three-button navigation.
- Test keyboard open in signup, login, goal entry, and chat.
- Test landscape, large text, VoiceOver/TalkBack, and modal expansion/dismissal.
- Confirm tab bar and FAB never overlap scroll content or system gestures.

## References

- [Mobile index](index.md)
- [Mobile questionnaire](../../../mobile_design.md)
