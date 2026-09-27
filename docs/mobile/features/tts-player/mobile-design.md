# TTS Player — Mobile Feature Design

## Purpose and Placement

Play assistant responses and explicitly requested check-in/verdict speech. Place a labeled play/pause control adjacent to each supported AI response and provide an optional test action in Audio Preferences. Do not auto-play by default.

## Player States

| State             | UI and behavior                                            | Notes                                                           |
| ----------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| Idle              | Play button, response remains readable.                    | TTS off still leaves text.                                      |
| Loading           | Progress indicator and cancel/stop option.                 | Avoid blocking chat navigation.                                 |
| Playing           | Pause/stop, progress if seek is supported, elapsed state.  | One active item at a time recommended.                          |
| Paused            | Resume or stop; preserve position if provider supports it. | Confirm supported engine behavior.                              |
| Error/interrupted | Short error and retry; text stays available.               | Handle audio focus, route changes, phone calls, app background. |

## Controls

- Minimum play/pause hit target 44pt/48dp.
- Speed control follows the user's global setting (web reference offers 0.75x–1.5x); whether per-play override exists is open.
- Stop when leaving a message/session unless background playback is explicitly designed.
- Voice/persona labels represent tone, not gender/accent unless provider voices exist.

## Expo / Service Notes

The mobile guide names `expo-av` for playback. Confirm the supported Expo SDK package and provider/audio format. Provider service, voice IDs, playback-rate support, caching, and offline behavior are not defined.

## Accessibility

- Accessible label reflects the real action: Play, Pause, Resume, or Stop.
- Expose playback state and any progress as text; do not rely on waveform animation.
- Respect VoiceOver/TalkBack, audio interruptions, and reduced motion.

## Open Decisions

Provider/voice catalog, auto-play policy, background continuation, queueing, speed override, seek control, and usage of TTS on check-ins/verdicts.

## References

- [Chat screen](../../screens/chat.md)
- [Audio preferences](../../screens/audio.md)
- [TTS player web spec](../../../web-design/features/tts-player.md)
- [Mobile index](../../index.md)
