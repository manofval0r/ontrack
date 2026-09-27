# OnTrack — Frontend Web Plan

## 1. Our Role

**Chioma + Eniola — Frontend Web**

We are responsible for designing and building the web interface in React:

- Onboarding
- Auth
- Chat
- Goal creation
- Dynamic trackers
- Dashboard
- Goal details
- Settings
- TTS/voice UI
- Loading, error, and empty states
- Responsive design
- Final UI polish

We are **not responsible for the mobile UI**.

---

## 2. Frontend Approach

The frontend work happens in two main stages:

### Stage 1 — Design

Define the screens, states, user flow, and design system before implementation.

### Stage 2 — Build

Recreate the approved interface in React.

Initially, the UI can use mock/static data. Once Evans provides the dummy API endpoints and API contract, the UI can be wired to those endpoints.

We do **not** need to wait for Nemotron or the final AI implementation before building the interface.

---

## 3. What We Do Before Designing

### Step 1 — Confirm the MVP

Our main web flow is:

**Onboarding → Auth → Chat → Create Goal → AI Parses Goal → Tracker Appears → Update Progress → Dashboard**

The design should support the hackathon demo first.

### Step 2 — Determine Screens and States

Initial screen list:

- Onboarding — Welcome
- Onboarding — How OnTrack Works
- Onboarding — Create First Goal
- Onboarding — Goal Ready
- Onboarding — Optional Skip/Later
- Auth — Login
- Auth — Sign Up
- Dashboard
- Chat / Goal Creation
- Goal Workspace / Dynamic Tracker
- Goal Details / Check-ins / Verdict
- Settings
- Audio Preferences
- Notifications
- Integrations
- 404

Important states:

- Empty
- Loading
- Error
- Goal creation
- Goal created
- Voice recording
- Progress update
- Check-in
- Verdict

**Note:** Empty, loading, and error states are application states, not onboarding screens.

### Step 3 — Confirm the API Contract

Evans will provide dummy JSON endpoints by the end of Sprint 1.

We need to understand:

- What data we send
- What data we receive
- Goal response structure
- Progress response structure
- Dashboard response structure
- Error format
- Loading/error behavior

Standard backend errors:

```json
{
  "error": "...",
  "code": "..."
}
```

---

## 4. Onboarding

The onboarding should be designed as a **desktop web experience**, not as a mobile-app flow.

Recommended sequence:

1. **Welcome** — Introduce OnTrack and its purpose.
2. **How OnTrack Works** — Explain the three-step experience.
3. **Create Your First Goal** — Let the user describe a goal using text or voice.
4. **Goal Ready** — Show the goal and the tracker OnTrack created.
5. **Optional Skip/Later** — Allow users who are not ready to start to enter the main app.

The first four screens form the main onboarding journey. The fifth is optional and can be removed if the team wants a shorter onboarding.

Keep onboarding focused so the user reaches their first goal quickly.

---

## 5. UI/UX Direction

The Chat interface is the main visual benchmark for the product.

The rest of the web interface should use the same advanced conversational design language rather than looking like a separate generic productivity dashboard.

Key characteristics:

- Desktop-first web layouts
- Spacious composition
- Strong typography
- Conversational presentation
- Clear hierarchy
- Refined cards and panels
- Subtle motion and state changes
- Persistent web navigation where appropriate
- Teal/mint visual accents
- Goal information presented as an intelligent workspace rather than a basic card

The chat should feel like an accountability assistant, not a normal messaging application.

---

## 6. UI/UX Research

Research only what is relevant to OnTrack:

1. **AI/chat interfaces**
   - Chat layout
   - AI responses
   - Loading/thinking states
   - Goal confirmation
   - Suggested actions

2. **Goal trackers**
   - Counter
   - Checklist
   - Manual logging
   - Progress states

3. **Dashboard**
   - Active goals
   - Progress
   - Stats
   - History
   - Charts

4. **Voice UI**
   - Mic interaction
   - Recording state
   - Transcription
   - Audio playback

5. **Onboarding**
   - Welcome screens
   - Product explanation
   - Goal setup
   - Skip/continue patterns

For each reference, record:

- What we like
- What we can adapt
- What does not fit OnTrack

Do not just collect screenshots.

---

## 7. Design System

### Color Palette

| Role | Color |
|---|---|
| Primary | `#14BBA6` |
| Secondary / Accent | `#2DD4BF` |
| Light Accent | `#99F6E4` |
| Light Background | `#ECFEFF` |
| Dark / Primary Text | `#13444A` |

Use the palette consistently across:

- Backgrounds
- Text
- Buttons
- Cards
- Chat bubbles
- Progress indicators
- Status states
- Navigation highlights
- Charts and data visualizations

Additional neutral colors may be introduced for borders, disabled states, secondary text, and other accessibility needs.

### Other Design Decisions

- Typography
- Heading/body sizes
- Spacing
- Border radius
- Buttons
- Cards
- Chat bubbles
- Progress indicators
- Status badges
- Icons
- Charts
- Responsive breakpoints
- Hover/focus/active states

Both frontend developers should use the same design system.

---

## 8. First Wireframes / Screen Designs

Design the main web journey first.

### Onboarding

- Welcome
- How OnTrack Works
- Create First Goal
- Goal Ready
- Optional Skip/Later

### Auth

- Login
- Sign Up
- Validation/error states

### Chat

- Empty state
- Personalized greeting
- Suggested actions
- User message
- AI response
- Goal confirmation
- Input
- Mic
- TTS
- Loading/thinking state

### Goal Workspace / Tracker

- Goal title
- Target
- Deadline
- Progress
- Dynamic tracker
- Update action
- Progress history
- Check-ins
- Verdict

### Dashboard

- Active goals
- Progress overview
- Stats
- Weekly progress/chart
- Recent activity/history
- New Goal
- Quick actions

### Settings

Main Settings acts as a navigation screen with entries for:

- Profile
- Audio Preferences
- Notifications
- Integrations

Each important settings section should have its own detailed UI.

### Audio Preferences

Include:

- Voice type
- Voice speed
- Test voice
- TTS settings
- ASR / voice input toggle

### Notifications

Include:

- Master notification toggle
- Goal reminders
- Check-ins
- Goal updates
- Streak alerts

Individual notification types can be enabled/disabled.

### Integrations

Include:

- Available integrations
- Connection status
- Connect button
- Connected state
- Disconnect/manage action where required

The MVP can keep the actual integrations limited while still providing the UI structure.

---

## 9. Dynamic Tracker Structure

| Type | Example | UI |
|---|---|---|
| Counter | Sell 5 cars | `3/5` + `+1` |
| Checklist | Complete 5 tasks | Checklist + completion |
| Manual | Daily reflection | Text input + log |

The UI should make it obvious that **AI determines the tracker type** based on the goal.

The tracker should feel like part of the goal workspace and conversation, not an unrelated widget.

---

## 10. Component Structure

Use reusable components instead of separate UI for every page.

```text
Layout
├── Navbar / Sidebar

Onboarding
├── Welcome
├── Intro
├── GoalStart
└── GoalReady

Auth
├── LoginForm
└── SignupForm

Chat
├── ChatWindow
├── MessageBubble
├── SuggestedAction
├── ChatInput
├── VoiceInput
└── TTSPlayer

Trackers
├── CounterTracker
├── ChecklistTracker
└── ManualTracker

Goals
├── GoalCard
├── GoalHeader
├── Progress
├── Countdown
├── ProgressLog
├── CheckIn
└── Verdict

Dashboard
├── ActiveGoals
├── Stats
├── ProgressChart
└── History

Settings
├── SettingsMenu
├── AudioPreferences
├── Notifications
└── Integrations

Common
├── Button
├── Input
├── Modal
├── Loader
├── EmptyState
├── ErrorState
└── StatusBadge
```

---

## 11. How Chioma + Eniola Work Together

Use one shared design system and one agreed product structure.

1. Agree on the product flow.
2. Determine screens and states.
3. Research separately where useful.
4. Share findings.
5. Agree on the visual direction.
6. Build the design system.
7. Create screen designs together.
8. Review the complete flow.
9. Get manager/team approval.
10. Build reusable React components.
11. Review each other's implementation for consistency.

Screen ownership can be divided after the structure is agreed.

---

## 12. Frontend Development Order

Once the screen designs are approved:

1. Set up React/Vite structure.
2. Build shared layout/components.
3. Build Onboarding.
4. Build Auth UI.
5. Build Chat.
6. Build tracker components.
7. Build Goal Workspace.
8. Build Dashboard.
9. Build Settings and settings sub-pages.
10. Use mock/static data initially.
11. Connect to Evans' dummy API contract.
12. Add ASR/TTS UI integration when available.
13. Add loading/error/empty states.
14. Make the website responsive.
15. Test the full demo flow.
16. Polish the UI.

---

## 13. Backend Contract

Evans will provide dummy JSON endpoints by the end of Sprint 1 so the frontend can wire against the actual API structure before Nemotron is fully integrated.

Relevant endpoints:

- `POST/GET /api/goals`
- `GET/PUT /api/goals/:id`
- `POST /api/goals/:id/finalize`
- `POST /api/progress`
- `GET /api/dashboard`
- `POST /api/tts`
- `POST /api/asr`

The frontend should be built so these API responses can replace mock data without requiring a redesign.

---

## 14. Priority

### P0 — Must work

- Onboarding
- Auth UI
- Chat
- Goal creation UI
- AI response UI
- Dynamic tracker
- Progress update UI
- Dashboard
- Main demo flow

### P1 — Add if stable

- Voice input
- TTS
- AI check-ins
- Verdict UI
- Charts and richer progress visualization
- Better animations
- Responsive polish

### P2 — Only if time remains

- Integrations beyond the MVP requirement
- Advanced settings
- Extra animations
- Non-essential features

---

## 15. Immediate Next Steps

- [ ] Get the MVP plan accepted.
- [ ] Determine the exact screens and states.
- [ ] Agree on the onboarding flow.
- [ ] Split UI/UX research between Chioma and Eniola.
- [ ] Agree on the Chat visual direction using the provided reference as inspiration.
- [ ] Set up the color palette and design system.
- [ ] Create the web screen designs for Onboarding → Auth → Chat → Goal Workspace → Dashboard.
- [ ] Design Settings, Audio Preferences, Notifications, and Integrations as separate UI screens.
- [ ] Review the complete screen set with the manager/team.
- [ ] Build the approved UI in React.
- [ ] Connect the UI to Evans' dummy API contract.
- [ ] Test the full demo flow.

**Main principle:** Design the actual MVP web experience first, get the screens approved, build the approved interface second, and integrate the backend/API contract as soon as the dummy endpoints are available.
