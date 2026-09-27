# Settings — Audio Preferences — Mobile Design Document

## Platform

React Native (Expo) | iOS + Android

## Purpose

Manage spoken responses and voice input: TTS and ASR switches, voice persona, speech speed, and an explicit test action. Mobile implementation/provider is not present; current web settings are local prototype controls.

## Navigation Context

Pushed from Settings. Tapping Test Voice uses a short sample; voice input permission is requested only when the user first activates the mic in Chat or onboarding.

## Layout

Scrollable single-column settings screen with grouped TTS/ASR switches, voice persona selection, speed slider, optional auto-play preference, and a bottom “Test voice” button.

## Visual Direction

- Background: light neutral; white setting rows with navy text and turquoise selected/focus accents.
- Primary element: independent TTS/ASR settings with explicit labels.
- Depth/Layering: flat list/grouped controls, not desktop cards.
- 3D elements: none.
- Animation: native switch/slider feedback; no waveform preview by default.

## Component Inventory

| Component           | RN Primitive / Library | State                        | Notes                                                     |
| ------------------- | ---------------------- | ---------------------------- | --------------------------------------------------------- |
| TTS switch          | `Switch`               | On/off                       | Spoken AI responses.                                      |
| ASR switch          | `Switch`               | On/off                       | Voice input; permission still requested contextually.     |
| Voice persona       | Accessible radio list  | Selected                     | Reuse web personas unless provider exposes actual voices. |
| Speed               | `Slider`               | 0.75x–1.5x recommended range | Confirm provider support; show numeric value.             |
| Auto-play check-ins | `Switch`               | Proposed on/off              | Unanswered; default off recommended.                      |
| Test voice          | `Pressable`            | Idle/loading/playing/error   | Uses short preview, stops safely on navigation.           |
| Player              | Expo audio playback    | Playing/paused/stopped       | `expo-audio`/`expo-av` choice TBD; guide names expo-av.   |

## Touch Targets

| Element          | Min Size            | Position      | Gesture Type        |
| ---------------- | ------------------- | ------------- | ------------------- |
| TTS/ASR switches | 44pt / 48dp         | Settings rows | Tap                 |
| Persona choice   | 44pt / 48dp         | List          | Tap                 |
| Speed slider     | 44pt control height | Mid-screen    | Drag/tap increments |
| Test voice       | 48pt high           | Lower content | Tap                 |

## States

### Default

Settings loaded with TTS/ASR status and persona/speed values.

### Empty

Not applicable; use default profile voice settings.

### Loading

Load/save and audio initialization states are distinct.

### Error

Provider/audio failure preserves text responses and offers retry; permission denial keeps text input usable.

### Playing

Show pause/stop state and current sample; don't auto-play on entering settings.

### Audio interruption

Handle phone call, other audio focus, route change, headphones, and app backgrounding.

## Copy & Microcopy

| Element   | Copy                           | Notes                                                                   |
| --------- | ------------------------------ | ----------------------------------------------------------------------- |
| Title     | “Audio & voice”                | Settings label.                                                         |
| TTS       | “Read OnTrack responses aloud” | Clear toggle label.                                                     |
| ASR       | “Voice input”                  | Mic permission requested only at first use.                             |
| Persona   | “Coach style”                  | Current web labels: Nemotron Direct, Accountability Coach, Calm Mentor. |
| Speed     | “Speech speed”                 | Show selected multiplier.                                               |
| Test      | “Play sample”                  | No automatic playback.                                                  |
| Auto-play | “Play check-ins automatically” | Optional; default off pending decision.                                 |

## Gestures

| Gesture | Target         | Result                                              |
| ------- | -------------- | --------------------------------------------------- |
| Tap     | Switch/persona | Toggle/select preference.                           |
| Drag    | Slider         | Change speed; expose accessible increment controls. |
| Tap     | Play sample    | Start/stop sample playback.                         |

## Haptics

| Trigger              | Haptic Type         | RN API Call                                        |
| -------------------- | ------------------- | -------------------------------------------------- |
| Preference selection | Selection, optional | `Haptics.selectionAsync()` if shared map approves. |

## Animations

| Element      | Trigger   | Animation                                  | Library                                 |
| ------------ | --------- | ------------------------------------------ | --------------------------------------- |
| Switch       | Toggle    | Platform-native                            | React Native `Switch`.                  |
| Speed slider | Drag      | Native thumb movement                      | Slider implementation TBD.              |
| Audio state  | Play/stop | Small icon/state change; waveform optional | Expo audio API + accessible text state. |

## Safe Area

- Top: Title below status/cutout inset.
- Bottom: Test action and tab bar clear system bottom inset.
- Landscape: Scroll groups; slider remains reachable.

## Platform Notes

- iOS: Handle audio session category, interruptions, route changes, and VoiceOver custom actions.
- Android: Handle audio focus/ducking, output route, and TalkBack slider adjustments.

## API Calls

| Endpoint               | Method | Trigger               | Response used for                                |
| ---------------------- | ------ | --------------------- | ------------------------------------------------ |
| User audio preferences | TBD    | Load/save             | TTS/ASR/persona/speed values.                    |
| TTS service            | TBD    | Test/play response    | Audio stream/file and playback metadata.         |
| ASR service            | TBD    | First voice recording | Transcription, locale, errors; contract pending. |

## Accessibility

- Switches announce label and on/off; persona uses radio-group semantics; slider exposes value and increments.
- Announce playback state and errors; keep transcript text accessible when TTS is disabled.
- Respect reduced motion and OS speech/audio accessibility settings; targets 44pt/48dp.

## References to Feature Docs

- [Voice input](../features/voice-input/mobile-design.md)
- [TTS player](../features/tts-player/mobile-design.md)
