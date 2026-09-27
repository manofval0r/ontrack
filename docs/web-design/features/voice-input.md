# Voice Input — Feature Design

## Status

Partially implemented in `VoiceInput.tsx` using browser Web Speech Recognition when available. No backend ASR integration is established. This document separates observed behavior from decisions needed for a production experience.

## Placement and States

The control is embedded in `ChatInput` and is also advertised during onboarding, although onboarding step 2 itself currently exposes only a textarea.

| State        | Current presentation                                                                     | Gap / required behavior                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Idle         | Round microphone button with title and accessible name.                                  | Respect the ASR preference and supported-browser capability.                                            |
| Listening    | Red pulsing recording panel, elapsed timer, animated bars, Done and cancel actions.      | Provide a non-color cue and a reduced-motion equivalent.                                                |
| Transcribing | No distinct state. Recognition may deliver final results while recording remains active. | Show partial transcript and explicit processing state.                                                  |
| Error        | No visible recognition/permission error state.                                           | Explain permission denied, unsupported browser, no speech, network failure, and allow retry/text entry. |
| Review       | No explicit review/confirm state. Done immediately stops and submits.                    | Let users edit transcript before sending/using it.                                                      |

## Recording UX

- Browser recognition is continuous, interim-results enabled, and configured for `en-US`.
- A timer and waveform-like bars are shown while recording.
- Current Done handler stops recording and also submits a hard-coded sample sentence as fallback. This is demo behavior and must not be specified as production transcription.
- Current callbacks can surface finalized text while listening; there is no confidence score, correction UI, or explicit re-record action.

## Interaction Contract

| Trigger             | Action                                                  | Result                                                                   |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| Activate microphone | Start recording and browser recognition where available | Listening state.                                                         |
| Recognition result  | Pass recognized final text to parent                    | Parent updates/sends transcription according to caller.                  |
| Done                | Stop and finish capture                                 | Current demo may inject fallback sample text.                            |
| Cancel              | Stop/cancel current capture                             | Return to idle without retaining transcription (verify caller behavior). |

## Accessibility

- Preserve a keyboard-operable text entry path at all times.
- Announce listening, elapsed time only when useful, transcription updates, and errors through polite status regions; avoid announcing every interim token.
- Provide visible focus, accessible names for Done/Cancel, and permission instructions that do not depend on color or animation.
- Support reduced motion; no haptic feedback is available on the web.

## Open Decisions

- Browser support baseline versus server ASR; supported languages and locale selection.
- Whether transcript is editable before submission, and exact confirm/re-record controls.
- Recording duration limit, no-speech timeout, cancellation semantics, and privacy/retention copy.
- Permission denied, recognition unavailable, and recognition service failure UX.
- Whether voice input is available in onboarding and whether the ASR preference gates it.

## References

- [Chat screen](../screens/chat.md)
- [Onboarding goal entry](../screens/onboarding-create-goal.md)
