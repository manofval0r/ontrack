# Chat — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Provide the conversational surface for creating goals, logging progress, requesting check-ins, and receiving verdicts. The conversation is central to OnTrack but must remain usable with text alone.

## Navigation Context

Tab 2, “Chat”; tab bar remains visible while idle and is covered by the keyboard when necessary. Goal Creation modal may prefill a prompt and return to the chat or route to Goal Detail after confirmation. Active work-block context is represented with a small header status, not a different chat mode.

## Layout

Safe-area header, scrollable transcript, optional starter prompts, and a keyboard-attached composer anchored at the bottom.

```text
┌────────────────────────────┐
│ OnTrack coach          ⋯   │
│                            │
│ AI message             🔊  │
│                 user msg   │
│ AI goal proposal card      │
│                            │
│ Suggested: Check progress  │
│ [mic] [Type a message…] [↑]│ [THUMB ZONE]
│ Home Chat Goals Settings   │
└────────────────────────────┘
```

Input grows to a recommended 4–5 text lines, then scrolls internally. Mic sits inside the leading edge, send at trailing edge. Composer remains above keyboard; transcript scrolls to the latest message without stealing focus.

## Visual Direction

- Background: light canvas and white transcript surfaces, navy/turquoise tokens.
- Primary element: readable assistant response and contextual goal proposal.
- Depth/Layering: clear separation through alignment, labels, and restrained surface contrast rather than color alone.
- 3D elements: none.
- Animation: subtle typing/thinking state; reduced-motion alternative is static status text.

## Component Inventory

| Component         | RN Primitive / Library            | State                             | Notes                                         |
| ----------------- | --------------------------------- | --------------------------------- | --------------------------------------------- |
| Chat header       | `View`, `Text`, `Pressable`       | Default/work-block context        | Conversation title and optional status.       |
| Transcript        | `FlatList`                        | Empty/populated/loading/error     | Virtualize long history; persistence API TBD. |
| Message bubble    | `View`, `Text`                    | User/AI/proposal/check-in/verdict | Structured renderers; plain text fallback.    |
| Thinking state    | `ActivityIndicator`/animated view | Thinking                          | Accessible status.                            |
| Suggested prompts | `Pressable` list                  | First use/hidden                  | Optional and dismissible.                     |
| Composer          | `TextInput`, `Pressable`          | Idle/typing/listening/sending     | Keyboard-aware and multiline.                 |
| Bottom tabs       | Tab navigator                     | Chat active                       | Keep visible except keyboard/system modal.    |

## Touch Targets

| Element            | Min Size    | Position          | Gesture Type                         |
| ------------------ | ----------- | ----------------- | ------------------------------------ |
| Message TTS action | 44pt / 48dp | On AI message     | Tap                                  |
| Mic                | 44pt / 48dp | Leading composer  | Tap/hold only if explicitly designed |
| Send               | 44pt / 48dp | Trailing composer | Tap                                  |
| Suggested prompt   | 44pt / 48dp | Above composer    | Tap                                  |
| Bottom tab         | 44pt / 48dp | Bottom safe area  | Tap                                  |

## States

### Default

Welcome message or restored conversation; composer remains reachable.

### Empty

First-use intro with optional suggested prompts; no blank-chat dead end.

### Loading

Show “Thinking…” with a non-color indicator; disable duplicate submission but allow safe navigation.

### Error

Keep the user's unsent text; show retry and text fallback. Never fabricate an AI response.

### Goal proposal

Inline structured card with editable/reject/confirm decision still open; activating creates/persists the goal.

### Keyboard open

Composer attaches above IME, transcript resizes/scrolls, tabs may be obscured; preserve scroll position when keyboard closes.

### Offline

Keep draft locally if privacy/storage policy allows; queue/retry behavior is an open API decision.

## Copy & Microcopy

| Element      | Copy                                         | Notes                                               |
| ------------ | -------------------------------------------- | --------------------------------------------------- |
| Welcome      | “Tell me what you want to make progress on.” | Proposed mobile copy; use approved assistant voice. |
| Thinking     | “Thinking…”                                  | Avoid model/provider claims unless live.            |
| Composer     | “Message OnTrack…”                           | Accessible hint clarifies it accepts text.          |
| Retry        | “Couldn't send. Try again.”                  | Keep draft.                                         |
| Proposal CTA | “Use this tracker”                           | Recommended; confirm exact goal card actions.       |

## Gestures

| Gesture     | Target           | Result                                                               |
| ----------- | ---------------- | -------------------------------------------------------------------- |
| Tap         | Suggested prompt | Prefill or send, behavior to choose consistently.                    |
| Scroll      | Transcript       | Browse messages; preserve bottom position for new reply.             |
| Pull down   | Transcript       | No refresh gesture recommended; avoid conflict with message history. |
| Tap mic     | Composer         | Open Voice Input modal / request permission on first use.            |
| Tap speaker | AI message       | Play/stop TTS.                                                       |

## Haptics

| Trigger      | Haptic Type     | RN API Call                                                                             |
| ------------ | --------------- | --------------------------------------------------------------------------------------- |
| Message sent | Light, optional | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`; shared map approval required. |

## Animations

| Element            | Trigger          | Animation                    | Library                                                   |
| ------------------ | ---------------- | ---------------------------- | --------------------------------------------------------- |
| New message        | Response arrives | Short fade/translate         | Reanimated or Animated TBD; disable/reduce by preference. |
| Thinking indicator | Request pending  | Subtle pulse or static label | Avoid essential motion-only cue.                          |
| Composer           | Keyboard opens   | Resize/translate with IME    | Native keyboard insets.                                   |

## Safe Area

- Top: Header below status/cutout inset.
- Bottom: Composer above keyboard and home indicator; tab bar has bottom inset when keyboard is closed.
- Landscape: Transcript remains scrollable; composer can grow only to its max height.

## Platform Notes

- iOS: Respect interactive keyboard dismissal and native edge-swipe navigation.
- Android: Handle IME resize/insets and system back closing keyboard before leaving the tab.

## API Calls

| Endpoint             | Method | Trigger                             | Response used for                                            |
| -------------------- | ------ | ----------------------------------- | ------------------------------------------------------------ |
| Chat / AI response   | TBD    | Send message                        | Assistant text and structured goal/check-in/verdict payload. |
| Conversation history | TBD    | Tab open / restore                  | Prior messages; persistence not specified.                   |
| Goal create/update   | TBD    | Confirm proposal or progress intent | Persist structured goal/progress.                            |

## Accessibility

- Announce new assistant messages and thinking completion politely; do not reread the entire transcript.
- Provide sender and timestamp context in accessible order; distinguish speakers with labels, not color alone.
- Ensure multiline input, mic, send, and TTS work with VoiceOver/TalkBack and switch access.
- Target 44pt/48dp and WCAG 2.2 AA contrast; audit required.

## References to Feature Docs

- [Voice input](../features/voice-input/mobile-design.md)
- [TTS player](../features/tts-player/mobile-design.md)
- [Chat messages](../features/chat-messages/mobile-design.md)
