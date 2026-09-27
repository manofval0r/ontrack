# TTS Player — Feature Design

## Status

An inline button is rendered under AI messages and a test button exists in audio settings. Playback is delegated to GoalContext; this spec does not assume a particular NVIDIA voice service or browser engine.

## Placement

- Inline on AI-authored chat messages, after message text.
- Test playback in Settings → Audio Preferences.
- No persistent/floating player is present.
- Goal summaries/verdicts do not currently show a dedicated player unless rendered through a message.

## States and Controls

| State   | Current presentation                             | Design requirement / gap                                                           |
| ------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Idle    | “Nemotron Voice” pill with speaker icon.         | Keep control adjacent to the message it reads.                                     |
| Loading | No explicit state observed in the component.     | Add only if the selected playback engine needs startup time.                       |
| Playing | Button changes to Pause and shows animated bars. | Ensure “Pause” actually pauses rather than stops; callback currently invokes stop. |
| Paused  | No distinct component state.                     | Decide whether playback can resume or always restarts.                             |
| Error   | No player error state observed.                  | Expose a concise retry message and preserve the text response.                     |

## Playback Behavior

- Current message control calls `playTTS(message.content)` and `stopTTS()` through GoalContext.
- The button label and accessible name switch based on whether this message is currently speaking.
- Per-message speed override, seek, close, queue, and cross-page persistence are not present in the component.
- Actual speech provider, voice selection, playback rate application, and lifecycle across navigation must be confirmed in GoalContext/provider wiring before this document is treated as an implementation contract.

## Accessibility

- Use a button with a changing accessible name that accurately says Play, Pause, Resume, or Stop.
- Provide a non-animated state cue and respect `prefers-reduced-motion`.
- Keep the text response fully available when audio is disabled or fails.
- Announce playback failure without moving focus.

## Open Decisions

- Choose pause/resume semantics versus stop/restart; current accessible label says Stop while visible label says Pause.
- Confirm voice provider and supported voice choices; settings currently offers personas, not gender/accent options.
- Decide whether global speed applies to every player and whether a per-play override is needed.
- Confirm whether speech continues during scroll/navigation and whether only one message may play at once.

## References

- [Chat screen](../screens/chat.md)
- [Audio settings](../screens/settings-audio.md)
