# Voice Input — Mobile Feature Design

## Purpose and Placement

A touch-first voice capture flow available from the Chat composer and first-goal input. Present as a bottom-sheet/modal surface over the originating screen. Request microphone access only when the user explicitly taps the mic for the first time.

## Recording States

| State              | UI and behavior                                                                  | Recovery                                               |
| ------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Idle               | Mic control with visible label/accessibility name.                               | Text input remains available.                          |
| Permission request | Explain why mic is needed before OS prompt.                                      | Denial does not block typing.                          |
| Listening          | Recording timer, clear stop control, accessible waveform or static “Listening”.  | User can cancel.                                       |
| Transcribing       | Show partial transcript if provider supports it and a distinct processing state. | Keep audio/transcript until user confirms or discards. |
| Review             | Editable transcript plus Re-record, Edit, Confirm.                               | User explicitly confirms before sending.               |
| Error              | Permission denied, no speech, unsupported device, ASR/network failure.           | Retry or continue with text.                           |

## Visual Direction

- Use current mobile tokens; recording status may use a clear red/error accent, never color alone.
- Keep listening controls in the lower thumb zone; elapsed time and cancel/confirm are readable.
- Avoid full-screen sound-wave decoration; a restrained waveform should reflect actual input only.

## Interaction Contract

1. Tap mic → explain/request permission if needed.
2. Start recording only after permission is granted; show an explicit recording state.
3. Stop → transcribe and open review; do not auto-send.
4. User may edit, re-record, confirm, or cancel.
5. On permission denial, link to system settings only when OS disallows another prompt.

## Expo / Service Notes

- `expo-av`/`expo-audio` can capture audio and play audio; neither alone performs speech recognition. The mobile guide names `expo-av`, but real-time/final transcription requires a configured ASR service or supported native speech-recognition module.
- Confirm Expo SDK/API choice, supported languages, locale, audio format, upload/streaming policy, and retention before implementation.

## Accessibility

- VoiceOver/TalkBack announce permission rationale, recording started/stopped, transcription ready, and error.
- Do not announce every partial token; expose the editable transcript as a labeled text field.
- Keyboard/text path is always available. Ensure 44pt/48dp targets and reduced-motion waveform fallback.

## API Calls

ASR start/upload/stream/result/error contract is TBD. Never present a fabricated sample transcript as real speech.

## References

- [Chat screen](../../screens/chat.md)
- [Onboarding](../../screens/onboarding.md)
- [Voice input web spec](../../../web-design/features/voice-input.md)
- [Mobile index](../../index.md)
