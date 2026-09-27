# Settings — Audio Preferences — Design Document

## Purpose

Configure text-to-speech, speech input, assistant voice persona, playback speed, and a sample playback from the Audio tab in `/settings`.

## User Goal

Choose whether voice features are enabled and tune spoken responses to a comfortable style and pace.

## Layout

Shared settings tabs above a white panel. The panel contains separate TTS and ASR toggles, three persona choices, a continuous speed slider from 0.75x to 1.5x, and a test-voice action.

## Visual Direction

- Background: pale gray app canvas, white bordered panel, navy/turquoise.
- Primary element: persona choices and playback speed.
- Depth/Layering: outlined preference groups and offset shadows.
- Animation: toggle/selection transitions; player may animate during speech.
- 3D elements: none.

## Component Inventory

| Component      | Type                | State                    | Notes                                                                                                   |
| -------------- | ------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------- |
| TTS toggle     | Binary switch       | On/off                   | Independent of ASR.                                                                                     |
| ASR toggle     | Binary switch       | On/off                   | Controls intended voice-input availability; confirm it gates the mic.                                   |
| Voice persona  | Single-select cards | Three options            | Nemotron Direct, Accountability Coach, Calm Mentor; these are personas, not identified provider voices. |
| Playback speed | Range input         | 0.75x–1.5x in 0.05 steps | Applied through local settings context.                                                                 |
| Test Voice     | Button              | Idle/playing/disabled    | Disabled when TTS off or sample playing.                                                                |

## States

### Default

Settings loaded from context; default persona and speed shown.

### Empty

Not applicable.

### Loading

No provider setup/loading state.

### Error

No provider failure state in the panel.

### Playback

Test action invokes `playTTS`; actual engine/provider and rate application need verification.

## Copy & Microcopy

| Element | Copy                                                     | Notes                                          |
| ------- | -------------------------------------------------------- | ---------------------------------------------- |
| Heading | “Audio & Voice Preferences”                              | Current copy.                                  |
| Toggles | “Text-to-Speech (TTS)”; “Speech-to-Text (ASR)”           | Independent controls.                          |
| Persona | “Nemotron Direct”, “Accountability Coach”, “Calm Mentor” | Copy describes tone rather than gender/accent. |
| Slider  | “Playback Speed”; 0.75x–1.5x                             | Exact visible values.                          |
| Test    | “Test Voice Audio” / “Playing Sample...”                 | Sample sentence is fixed in code.              |

## Interactions

| Trigger        | Action                      | Animation             | Result                                    |
| -------------- | --------------------------- | --------------------- | ----------------------------------------- |
| Toggle TTS/ASR | Update local audio settings | Toggle movement/color | Preference changes in context.            |
| Select persona | Set `voice_type`            | Selected card styling | Persona saved locally.                    |
| Adjust speed   | Update `voice_speed`        | Native range movement | Selected speed is shown.                  |
| Test voice     | Call `playTTS` with sample  | Player state          | Speech depends on context/browser engine. |

## API Calls

| Endpoint                         | Method        | Trigger              | Response used for                                              |
| -------------------------------- | ------------- | -------------------- | -------------------------------------------------------------- |
| GoalContext local audio settings | Local update  | Toggle/select/slider | Browser-local preference values; no provider API defined here. |
| TTS playback context             | Client action | Test button          | No external audio endpoint confirmed.                          |

## Responsive Behavior

- 1440px: Two toggle cards side-by-side; personas in three columns.
- 1024px: Same grid where space allows; panel remains one column vertically.
- 768px: Toggle cards and persona options stack; speed slider spans panel width; test action may wrap.

## Accessibility

- Binary controls must expose switch semantics and checked state; current toggle buttons need explicit accessible labels/state.
- Persona group should be keyboard operable as a radio group or equivalent.
- Range input needs a programmatic label and readable current value; sample playback needs status announcement.
- Reduced-motion preference and contrast need review; no audit completed.

## References to Feature Docs

- [Voice input](../features/voice-input.md)
- [TTS player](../features/tts-player.md)
