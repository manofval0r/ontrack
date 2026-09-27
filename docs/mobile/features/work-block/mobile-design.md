# Work-Block — Mobile Feature Design

## Purpose

Run a focused timer associated with a goal in a full-screen modal. The user must always be able to exit; the overlay may add a confirmation step but must not trap the user or claim to prevent closing the app.

## Activation and Active State

- Start from Goal Detail with a duration choice or a clearly stated default; duration presets and default remain unapproved.
- Show goal title, remaining time as large numeric text, optional progress ring, and any in-session tracker action.
- The remaining timer stays numeric and accessible even if the ring is animated.
- Pause/extend behavior, notification/background behavior, and timer persistence require product/backend decisions.

## Close/Exit and Expiration

- Close, Android back, and swipe-down route through the same optional confirmation: “Keep working” is the default action, “End session” exits.
- Never block OS app switching, home navigation, or accessibility escape.
- When timer expires, present a session summary and return path; do not treat timer expiry as goal completion.
- If user completes the goal, allow exit to the normal verdict flow; no automatic confetti assumed.

## Visual Direction

Focused dark navy surface with high-contrast white/turquoise; minimal ambient content, no blurred card stack. Urgency color transitions are not defined; avoid red unless it communicates an actual warning and is also labeled.

## Accessibility

Timer changes are announced sparingly (start, pause, thresholds, complete), not each second. Exit always visible and reachable. Provide reduced-motion timer presentation and screen-reader labels. VoiceOver/TalkBack users must have same ability to leave.

## Platform Notes

iOS backgrounding/closing cannot be prevented; Dynamic Island/Live Activities are stretch goals. Android foreground service and notification behavior requires native policy review; Android widget is a stretch goal.

## API Calls

Session start/end, duration, state persistence, and optional progress events are TBD. Define server time authority and recovery after process death before implementation.

## References

- [Work-block screen](../../screens/work-block.md)
- [Goal Detail](../../screens/goal-detail.md)
- [Work-block web spec](../../../web-design/features/work-block.md)
- [Modal behavior](../../modal-behavior.md)
