# Chat / Goal Creation — Design Document

## Purpose

Provide the conversational goal-creation and progress-update surface at `/chat`. The current UI frames messages as Nemotron responses, but goal parsing and responses are simulated in the browser.

## User Goal

Describe a goal in natural language, inspect the proposed tracker, activate it, or send a progress update through text or voice.

## Layout

`AppLayout` page heading/subtitle and capability banner above a centered chat window. The window contains a scrollable bordered transcript, suggested actions while the transcript is short, and a bottom input row with voice/send controls. A proposal is rendered inline with the AI message.

## Visual Direction

- Background: pale neutral canvas and white transcript panel, navy/turquoise accents.
- Primary element: conversational transcript and inline goal proposal.
- Depth/Layering: tactile navy borders and offset shadows consistent with the older shared system.
- Animation: thinking loader, transcript auto-scroll, voice recording indicator, message/player state feedback.
- 3D elements: none.

## Component Inventory

| Component         | Type                       | State                     | Notes                                                                                    |
| ----------------- | -------------------------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| AppLayout         | Shared app shell           | Default                   | Shared navigation/header.                                                                |
| Capability banner | Status strip               | Static                    | Claims Nemotron 70B and ASR/TTS active; verify production wiring.                        |
| ChatWindow        | Transcript controller      | Welcome/thinking/messages | Local response simulation after 1.2 seconds.                                             |
| MessageBubble     | Message renderer           | User/AI/proposal          | Supports proposal activation; markdown support requires review.                          |
| SuggestedAction   | Prompt buttons             | Initial transcript        | Hidden once message count grows.                                                         |
| ChatInput         | Text/voice controls        | Enabled/thinking          | Disabled while AI simulation is running.                                                 |
| VoiceInput        | Recording/transcription UI | Idle/listening            | Browser SpeechRecognition when available; current completion includes a sample fallback. |
| TTSPlayer         | Inline playback control    | Idle/playing              | Provider behavior is described separately.                                               |

## States

### Default

A seeded AI greeting appears; the transcript is not persisted between page mounts.

### Empty

No separate empty state; the seeded greeting prevents an empty transcript.

### Loading

Local `setTimeout` displays a thinking loader for about 1.2 seconds.

### Error

No parsing/API error response is represented; failure handling is not production-ready.

### Proposal

Keyword heuristics choose counter, checklist, or manual tracker and attach a goal proposal to the AI message.

### History

No server-backed conversation history or session switcher is present.

## Copy & Microcopy

| Element           | Copy                                                                  | Notes                                           |
| ----------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| Page title        | “Nemotron AI Accountability Partner”                                  | Current title.                                  |
| Banner            | “NVIDIA Nemotron 70B Conversational Engine”                           | Runtime/provider claim needs confirmation.      |
| Welcome           | “Speak or type your ambitious goal…”                                  | Voice path is browser capability-dependent.     |
| Loading           | “Nemotron is analyzing target, timeline, and tracker architecture...” | Describes simulated behavior currently.         |
| Suggested prompts | Defined in `SuggestedAction`                                          | List exact current choices when copy is frozen. |

## Interactions

| Trigger                 | Action                                              | Animation                         | Result                                                                   |
| ----------------------- | --------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------ |
| Send a message          | Append user message and run local keyword parse     | Thinking loader; scroll to bottom | AI text and goal proposal appear.                                        |
| Select proposal action  | Call local `createGoal` and navigate to `/goal/:id` | Route navigation                  | Goal workspace.                                                          |
| Select suggested prompt | Send it as a user message                           | Same as submit                    | Proposed response.                                                       |
| Start voice             | Start browser speech recognition if supported       | Red pulse/waveform                | Interim/final transcription behavior is limited; details in feature doc. |
| Select TTS action       | Invoke playback handler                             | Player state changes              | Speech behavior depends on GoalContext/browser support.                  |

## API Calls

| Endpoint                                   | Method             | Trigger           | Response used for                                         |
| ------------------------------------------ | ------------------ | ----------------- | --------------------------------------------------------- |
| None for assistant response                | —                  | Send message      | Parsing/reply are client-side heuristics and timeout.     |
| `api.createGoal` (simulated local adapter) | Mock POST contract | Activate proposal | Stores a goal in browser `localStorage`; no HTTP request. |

## Responsive Behavior

- 1440px: Centered transcript, max width around 4xl; input anchored below transcript.
- 1024px: Same single-column conversational layout within app shell.
- 768px: Transcript height and input controls need viewport testing; ensure voice controls and send remain usable without horizontal overflow.

## Accessibility

- Use a live region for new AI replies/thinking status without announcing the full transcript on every update.
- Ensure transcript can be navigated and input retains focus after send.
- Proposal action must have a clear button name; distinguish AI/user content semantically, not by color alone.
- Voice and TTS keyboard/accessibility requirements are in their feature documents. Full audit not performed.

## References to Feature Docs

- [Voice input](../features/voice-input.md)
- [TTS player](../features/tts-player.md)
- [Chat messages](../features/chat-messages.md)
- [Dynamic tracker](../features/dynamic-tracker.md)
