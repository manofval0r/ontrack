# Chat Messages — Mobile Feature Design

## Purpose

Render the mobile conversation as a readable, accessible timeline. Support user/assistant text and structured goal proposal, check-in, progress, and verdict content without treating all message bodies as unstructured markdown.

## Message Patterns

| Type          | Mobile treatment                                                                                   | Actions                                                  |
| ------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| User          | Trailing aligned bubble with “You” context.                                                        | No extra action by default.                              |
| Assistant     | Leading aligned content with “OnTrack”/assistant label.                                            | TTS control when enabled.                                |
| Goal proposal | Structured inline card with title, tracker type, target, deadline, editable/reject/confirm states. | Confirm creates; revise/reject remain product decisions. |
| Check-in      | Distinct prompt card with response action.                                                         | Reply inline or open composer.                           |
| Verdict       | Outcome and summary card with text and optional TTS.                                               | Next-goal/share actions only after approved.             |
| System/error  | Plain status row with retry where safe.                                                            | Preserve user draft.                                     |

## Layout and Behavior

- Use a virtualized inverted or chronological list with stable message IDs; choose implementation after navigation/chat architecture.
- Keep timestamp and sender context available without wasting narrow width.
- Auto-scroll only when user is already near the latest message; otherwise show a “New response” affordance.
- Markdown subset, link handling, attachments, history persistence, and long-message collapsing are open decisions.

## States

Loading/thinking, failed send, failed response, offline draft, empty first conversation, proposal confirmed/rejected, and restored history must be distinct. Never synthesize successful AI output from a local timer in production.

## Accessibility

Announce new messages politely; avoid reading the full transcript again. Structured cards have headings and labeled values. Actions are buttons, sender identity is not color-only, and links are safe/sanitized if markdown is supported.

## API Calls

Conversation, message send/receive, history, and structured card payload schemas are TBD; should match web API contracts when defined.

## References

- [Chat screen](../../screens/chat.md)
- [Voice input](../voice-input/mobile-design.md)
- [TTS player](../tts-player/mobile-design.md)
- [Chat messages web spec](../../../web-design/features/chat-messages.md)
- [Mobile index](../../index.md)
