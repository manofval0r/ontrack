# Chat Message Rendering — Feature Design

## Status

`MessageBubble` currently renders plain text with preserved line breaks, sender/time labels, optional TTS, and an inline goal proposal card. No markdown renderer, check-in card, or verdict card is confirmed in the message path.

## Message Anatomy

| Message type     | Current treatment                                                             | Notes                                                                          |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| User             | Right-aligned, navy surface, white text, turquoise offset shadow.             | Label “You” and timestamp.                                                     |
| AI               | Left-aligned, white surface, navy border/shadow, “AI” mark and partner label. | Includes inline TTS button.                                                    |
| Goal proposal    | Separate pale turquoise panel below AI message.                               | Shows title, description, target, deadline, tracker type, and activate action. |
| Thinking         | Loader in transcript stream.                                                  | Not a message; generated while local timeout runs.                             |
| Check-in/verdict | Not shown as dedicated chat card in the reviewed component.                   | Workspace components own check-ins and verdicts.                               |

## Rendering Rules

- Preserve message order and timestamp context.
- Distinguish user and assistant semantically as well as visually.
- Treat proposal metadata as structured content, not markdown text.
- Markdown behavior is not supported by the current `<p>` rendering; confirm safe parsing and link policy before adding it.
- Keep proposal card readable at narrow width; its metadata grid drops to two columns and then three at `sm` per current classes.

## States and Interactions

- AI messages can invoke TTS.
- Goal proposals expose an “Activate Tracker & Launch Workspace” button, which creates through the local adapter and routes to the goal workspace.
- No edit/reject proposal action, retry response, failed-generation card, or chat history state is present.
- Auto-scroll occurs when messages or thinking state change.

## Accessibility

- Use headings/labels for message roles and structure; avoid conveying speaker identity with color alone.
- Make transcript updates available through a polite live region without reading the full history repeatedly.
- Give proposal fields a clear reading order and label all values; keep activation keyboard accessible.
- Use sanitized markdown only if a renderer is introduced; preserve plain-text fallback.

## Open Decisions

- Markdown subset and safe link behavior.
- Whether chat history persists and how sessions are named/switched.
- Whether multi-goal proposals can appear in one conversation.
- Whether users can edit proposal fields or ask the assistant to revise them.
- Dedicated card designs for check-ins, progress updates, and verdicts.

## References

- [Chat screen](../screens/chat.md)
- [Voice input](voice-input.md)
- [TTS player](tts-player.md)
- [Dynamic tracker](dynamic-tracker.md)
- [Verdict](verdict.md)
