# OnTrack — Project Plan

## 1. Project Overview

**What:** Conversational accountability tracker for any goal (career, fitness, sales, school). Chat-first, blocks distractions, tracks progress, verifies completion.

**Why:** People set goals, lose track, don't ship. OnTrack forces commitment + proof + accountability.

**Platforms:** Web (React) + Mobile (React Native/Expo)

**Timeline:** 11 hours (9:00 AM – 8:00 PM, Sept 27, 2026)

---

## 2. Tech Stack (Final)

### Backend (Single Codebase, Dual Deployment)
- **Django** (REST API, business logic, Nemotron integration)
- **Supabase** (PostgreSQL + Auth, shared across web + mobile)
- **NVIDIA Nemotron** (Agentic AI: goal parsing, check-ins, verdicts)
- **NVIDIA Riva / NeMo TTS** (Text-to-speech for feedback, read-outs)
- **NVIDIA Riva / NeMo ASR** (Speech-to-text for voice input, transcription)

### Frontend (Web)
- **React** (Vite)
- Calls Django API (web instance)
- TTS/transcription via Brev APIs

### Frontend (Mobile)
- **React Native** (Expo)
- Calls Django API (mobile instance)
- TTS/transcription via Brev APIs

### Deployment
- **Backend:** Django codebase deployed **twice** on Render (Docker)
  - `ontrack-backend-web` (for web frontend)
  - `ontrack-backend-mobile` (for mobile frontend)
  - Same code, separate instances, separate .env (to prevent cascading failure)
- **Web:** Vercel
- **Mobile:** Expo Go (for demo), EAS Build (if time)

---

## 3. Team & Roles

| Name | Role | Responsibilities |
|------|------|------------------|
| **David (Valor)** | Mobile Lead + AI | React Native (Expo) development, work-block, mobile UX, TTS/ASR integration, coordinate with Evans on backend |
| **Evans** | Backend Lead + Web Server | Django API (both instances), Nemotron/TTS/ASR integration, Render deployment (web + mobile), error handling, `/api/debug` |
| **Eniola** | Frontend (Web) | React UI, chat, trackers, dashboard, settings, TTS player, transcription UI, polish |
| **Israel** | Mobile Developer | React Native (Expo), UI components, work-block overlay, mobile TTS/ASR UI, collaborate with David |

---

## 4. Feature Breakdown

### Core Features (MVP)

1. **Authentication**
   - Sign up / Login (email + password via Supabase)
   - Persist user session

2. **Goal Creation (Chat-First)**
   - User types: "I want to sell 5 cars this week"
   - AI parses intent → creates commitment (what, target, repo/domain, deadline)
   - User confirms or adjusts

3. **Goal Tracking Screens (Dynamic)**
   - Counter (pushups, sales, deliveries) → +1 button
   - Checklist (tasks, reading list) → checkboxes
   - Manual Log (text input)
   - Render based on goal type, not hardcoded UI

4. **Progress Updates**
   - User updates tracker (click, check, type)
   - Logged to DB

5. **AI Check-Ins**
   - Every 30 min or on-demand
   - Nemotron generates status prompt: "You aimed for X, currently at Y. On pace?"
   - User responds in chat

6. **Verdict & Summary**
   - At deadline, AI judges: "You aimed for 5, shipped 4. 80% delivered."
   - Logged to history

7. **Dashboard**
   - Today's active goals + status
   - This week's shipping (goals completed, success rate)
   - History / past goals
   - Streaks

8. **Work-Block (Mobile)**
   - Timer showing active goal
   - Warning when closing app mid-session
   - Visual reminder: "You're working on: [goal]"

9. **Settings & Profile**
   - Edit integrations (GitHub, Notion, Fitbit — optional)
   - Notification preferences
   - Work-block settings (apps to block, quiet hours)
   - Profile: stats, streaks, history export

10. **Integrations (Optional MVP)**
    - Manual log (always available)
    - Optional: GitHub API (verify commits)
    - Optional: Notion (read goal list from Notion database)

---

## 4A. Audio Features (New)

### Text-to-Speech (NVIDIA Riva/NeMo TTS via Brev)
- **AI Verdict Read-Out:** When goal finishes, TTS reads verdict aloud ("You shipped 4 out of 5. Strong pace.")
- **Goal Summary:** On dashboard, click icon to hear goal summary
- **Check-In Prompts:** AI check-in message can be played as audio

### Speech-to-Text (NVIDIA Riva/NeMo ASR via Brev)
- **Voice Goal Creation:** User can say goal instead of typing ("I want to sell 5 cars this week")
- **Voice Progress Log:** User can say progress instead of clicking/typing ("I just sold another car")
- **Transcription UI:** Shows real-time transcription as user speaks

### Backend Endpoints
- `POST /api/tts` — input text, return audio URL (cached)
- `POST /api/asr` — input audio file, return transcription
- Both use NVIDIA Brev models, calls made server-side (never expose keys to frontend)

---

## 5. Web Pages (React + Vercel)

### Page Structure

```
/                              (Home/Dashboard if logged in, else redirect to /auth)
├── /auth
│   ├── /signup               Main signup page
│   └── /login                Main login page
│
├── /dashboard                Main dashboard (after login)
│   ├── Active Goals Section  Today's goals with progress bars
│   ├── Stats Widget          This week's shipping rate, total completed
│   ├── History Section       Past 10 goals, results
│   ├── Quick Stats           Streaks, completion rate
│   └── Action: New Goal Btn  Opens chat modal or redirects to /chat
│
├── /chat                     Conversational goal creation + check-ins
│   ├── Chat Bubbles         AI + user messages
│   ├── Input Box            Type goal, ask questions, respond to check-ins
│   ├── Audio Input Button   🎤 Open transcription (voice → text via ASR)
│   ├── Audio Output         🔊 Listen to AI response (TTS)
│   └── Goal History         Recent conversations
│
├── /goal/:id                 Active goal details
│   ├── Goal Header          Title, deadline, target, current progress
│   ├── Tracker Screen       Dynamic (counter/checklist/manual)
│   ├── Progress Log         Timeline of updates
│   ├── TTS Output           🔊 Button to hear goal summary + progress
│   ├── Action Buttons       Update Progress, Check In, View Verdict
│   └── Timer Widget         Time remaining (countdown to deadline)
│
├── /settings
│   ├── Profile              User info, stats, streaks
│   │   ├── Display Name
│   │   ├── Email
│   │   ├── Total Goals / Completion Rate
│   │   └── Streak Counter
│   ├── Audio Preferences    Enable/disable TTS, ASR, playback speed
│   ├── Notifications        Email, in-app alerts
│   ├── Integrations         (Optional) GitHub, Notion, etc.
│   └── Account              Sign out, delete account
│
└── /404                      Not found
```

### Key Features per Page

**Dashboard:**
- "New Goal" button → opens chat modal
- Click goal card → goes to /goal/:id
- Listen button 🔊 for goal summaries (TTS)
- Stats display: this week's completion rate, total goals, streaks

**Chat (/chat):**
- Real-time message display (AI + user)
- Input: text field OR 🎤 voice input (ASR → transcription)
- Output: text response OR 🔊 listen button (TTS)
- Shows: current goal, progress, checklist items (if applicable)

**Goal Detail (/goal/:id):**
- Live countdown timer to deadline
- Dynamic tracker UI (counter/checklist/manual)
- Update progress button
- View all check-ins + responses
- Verdict at deadline with TTS playback
- Progress log (all updates)

**Settings:**
- Toggle TTS on/off
- Toggle ASR on/off
- Audio playback speed (0.75x, 1x, 1.25x, 1.5x)
- Notification preferences
- Profile stats and analytics

---

## 6. Mobile Screens (React Native/Expo + Expo Go)

### Navigation Structure (Tab Bar)

```
Bottom Tab Bar (4 tabs)
├── 🏠 Home / Dashboard
├── 💬 Chat
├── ✓ Goals (Active)
└── ⚙️ Settings
```

### Screen Details

**1. Home / Dashboard (Tab)**
- Active goals list (card view, swipeable)
  - Goal title
  - Progress bar (visual indicator)
  - Time remaining
  - 🔊 Tap to hear summary (TTS)
  - Tap card → opens Goal Detail modal
- Quick stats: today's goal count, weekly completion rate
- "+" floating action button to create new goal

**2. Chat (Tab)**
- Full-screen chat interface
- Message bubbles (AI on left, user on right)
- Input area at bottom:
  - Text input field
  - 🎤 Mic button (tap → start recording → live transcription)
  - Send button
  - Real-time transcript display as user speaks
- 🔊 Button next to each AI message to replay (TTS)
- Chat history (scroll up to see past messages)
- Auto-scroll to latest message

**3. Goals (Active) (Tab)**
- List of all active goals
- Each goal card shows:
  - Title
  - Progress (counter/checklist %)
  - Time remaining
  - Status badge (On track / Behind / Complete)
- Tap goal card → opens Goal Detail modal
- Swipe left for quick actions (archive, delete)

**4. Settings (Tab)**
- Profile section
  - Display name
  - Email
  - Stats (total goals, completed, streak)
  - Edit button
- Audio Settings
  - Toggle TTS enable/disable
  - Toggle ASR enable/disable
  - Playback speed slider (0.75x to 1.5x)
  - Volume control
- Notifications
  - Toggle check-in reminders
  - Toggle deadline reminders
  - Quiet hours (start/end time)
- About
  - App version
  - Legal links
- Sign out button

---

### Modal / Full-Screen Overlays (Mobile)

**Goal Detail Modal** (appears when user taps goal from dashboard or goals list)
- Header: Goal title, deadline, target
- Large countdown timer (prominent, large font, bold color)
- Current progress display (big numbers, percentage)
- Dynamic tracker UI (full-width)
  - Counter: large +1 button, large current number
  - Checklist: swipeable items, big checkboxes
  - Manual log: full-width text input + send button
- Buttons:
  - "Update Progress" (primary action)
  - "Check In" (ask AI for status prompt)
  - "View Summary" 🔊 (TTS playback)
  - "Close" or back arrow (dismiss modal)
- Work-Block Overlay (only appears if goal is active session):
  - Semi-transparent dark background overlay
  - Large timer in center (ticking down)
  - Text: "You are working on: [goal title]"
  - Text: "Time remaining: XX min"
  - "Close this app?" button (with confirmation: "Are you sure?")
  - "Keep working" button
  - Option to extend deadline if needed

**Voice Input Modal**
- Full-screen modal while recording
- Large animated mic icon (pulsing)
- Text: "Listening..."
- Real-time transcript display (grows as user speaks)
- Timer showing recording duration
- "Stop" button or auto-stop on silence (3 sec of silence)
- After recording:
  - Show full transcript
  - "Sounds good" (submit) button
  - "Re-record" button (start over)
  - "Edit" button (open text editor to fix)

**Goal Creation Modal**
- Text input: "What's your goal?" (placeholder)
- Voice option: "Or tap 🎤 to say it"
- Mic button (opens Voice Input Modal)
- "Next" button (submit and parse goal)
- Feedback: show parsed goal type ("Looks like a counter goal...")

**Goal Summary Modal** (when viewing past goal or at completion)
- Goal title
- Target vs achieved
- Timeline of updates
- AI verdict text
- 🔊 Button to hear verdict (TTS)
- "Archive" or "Delete" button

---

## Web vs Mobile Summary

| Feature | Web | Mobile |
|---------|-----|--------|
| Goal creation | Chat page or modal | Chat tab + voice option |
| Progress tracking | /goal/:id page | Goal Detail full-screen modal |
| Work-block | Timer widget (visible on page) | Full-screen overlay with timer |
| TTS | 🔊 Button on goal page + chat | 🔊 Button on all screens, auto-play option |
| ASR (voice input) | 🎤 In /chat page | 🎤 In Chat tab + voice creation modal |
| Navigation | URL routing (React Router) | Bottom tab bar + modal stack (React Navigation) |
| Viewport | Desktop-first responsive | Mobile-first, full-screen |
| Timer display | Sidebar widget | Center of full-screen overlay |
| Work-block warning | Modal dialog | Full-screen overlay with prominent timer |

---

## 7. Data Model (Supabase/PostgreSQL)

### Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  created_at TIMESTAMP,
  streak INT DEFAULT 0,
  total_goals INT DEFAULT 0
);

-- Goals (Commitments)
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  title VARCHAR,
  target INT (e.g., "5 cars"),
  goal_type VARCHAR (counter | checklist | manual),
  start_at TIMESTAMP,
  deadline TIMESTAMP,
  status VARCHAR (active | completed | missed),
  result_value INT (actual achieved),
  created_at TIMESTAMP,
  finished_at TIMESTAMP
);

-- Progress Logs
CREATE TABLE progress_logs (
  id UUID PRIMARY KEY,
  goal_id UUID FOREIGN KEY,
  user_id UUID FOREIGN KEY,
  value INT (increment, or 0/1 for checklist),
  note VARCHAR (optional user note),
  logged_at TIMESTAMP
);

-- Goal Checklist Items (if goal_type = checklist)
CREATE TABLE goal_items (
  id UUID PRIMARY KEY,
  goal_id UUID FOREIGN KEY,
  title VARCHAR,
  completed BOOLEAN,
  created_at TIMESTAMP
);

-- Check-Ins (AI conversations)
CREATE TABLE check_ins (
  id UUID PRIMARY KEY,
  goal_id UUID FOREIGN KEY,
  ai_message VARCHAR (Nemotron prompt response),
  user_response VARCHAR (what user said back),
  checked_in_at TIMESTAMP
);

-- Integrations (optional)
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  type VARCHAR (github | notion | fitbit),
  access_token VARCHAR (encrypted),
  created_at TIMESTAMP
);
```

---

## 8. AI & Audio Integration (NVIDIA Brev)

### Nemotron Integration (Agentic AI)

**Prompts & Flows**

**1. Goal Parsing**
```
User: "I want to sell 5 cars this week"

System Prompt to Nemotron:
"User stated a goal. Parse this into:
- goal_type: (counter | checklist | manual)
- target: (numeric, or list of items)
- domain: (sales | fitness | career | school | lifestyle)
- estimated_deadline: (end of week = Friday 5pm)

Respond only as JSON:
{
  goal_type: 'counter',
  target: 5,
  domain: 'sales',
  deadline: '2026-09-26T21:00:00Z'
}"

Nemotron Response:
{
  goal_type: 'counter',
  target: 5,
  domain: 'sales',
  deadline: '2026-09-26T21:00:00Z'
}

Backend: Save goal, respond to user in chat:
"Got it. You want to sell 5 cars by Friday 5pm. Starting now. I'll check in every 30 min."
```

**2. Check-In**
```
Trigger: 30 min elapsed, or user asks "How am I doing?"

System Prompt to Nemotron:
"Goal: Sell 5 cars.
Started: [time]
Elapsed: [time]
Current progress: 2 cars.

Generate a brief check-in. Ask about pace, blockers, confidence.
Max 1 sentence + 1 question."

Nemotron Response:
"You're at 2/5. On track for Friday?"

Backend: Send to chat. User responds. Log response.
```

**3. Verdict**
```
Trigger: Deadline reached

System Prompt to Nemotron:
"Goal: Sell 5 cars.
Target: 5
Achieved: 4
Deadline: Friday 5pm (now)

Generate a brief verdict + summary. No more than 2 sentences.
Format: '[Achievement]. [Pattern/insight].'
Examples:
- 'You shipped 4/5. Strong pace mid-week, slowed Friday.'
- 'You hit 4/5. One shy, but solid given blockers you mentioned.'"

Nemotron Response:
"You shipped 4/5. Strong pace mid-week, slowed Friday."

Backend: Log verdict, update goal status, update dashboard.
```

### Brev Integration

- **Endpoint:** `https://api.nvidia.com/v1/messages` (or via NVIDIA Build)
- **Model:** `nemotron-4-340b-instruct` (or latest available)
- **API Key:** Stored in Django env var, never exposed to frontend
- **Rate Limiting:** ~1 call per goal creation, ~1 per check-in, ~1 per verdict (3–5 calls per active user per day)

---

## 9. Implementation Timeline (11 Hours)

### Team Structure for Sprint

**Backend Team (Shared):**
- David (AI/Mobile)
- Evans (Backend Lead)

**Web Team:**
- Evans (Backend)
- Eniola (Frontend)

**Mobile Team:**
- David (Lead + AI)
- Israel (Frontend/UX)

**Backend Deployment:**
- Two Django instances on Render (same codebase, separate deployments)
- One for web frontend, one for mobile frontend
- Shared Supabase database (both instances read/write to same DB)

---

### Pre-Build: 10:15–11:15 (Setup)

**David:**
- Activate NVIDIA Brev voucher (Nemotron, TTS, ASR)
- Set up Django project (manage.py, requirements.txt)
- Set up Supabase project, create schema
- Repo structure (GitHub)
- Test TTS/ASR endpoints locally

**Evans:**
- Review data model
- Set up Django apps (users, goals, progress, audio for TTS/ASR)
- Plan API endpoints (including `/api/tts`, `/api/asr`)
- Plan Render deployment strategy (2 instances)

**Eniola:**
- Finalize React wire-frames (Figma)
- Agree on web design system (colors, typography, spacing)
- Component list for web: Chat, Tracker, Dashboard, Settings

**Israel:**
- Finalize React Native wire-frames
- Agree on mobile design system (colors, typography)
- Plan tab bar navigation + modals
- Plan audio UI components (mic button, TTS player)

---

### Sprint 1: 11:15–13:00 (Foundation & AI)

**David:**
- Write 3 Nemotron prompts (goal parse, check-in, verdict)
- Add TTS prompt (convert text to speech request)
- Add ASR prompt (convert audio to text, then parse as goal)
- Django API skeleton: `/api/goals`, `/api/progress`, `/api/tts`, `/api/asr`
- Wire Nemotron + TTS + ASR into backend

**Evans:**
- Django models fully implemented (users, goals, progress_logs, audio_cache)
- Database migrations
- Serialize JSON responses
- Set up error handling pattern
- Create `/api/debug` skeleton

**Eniola:**
- Build Chat component (text bubbles, input, audio buttons)
- Build Tracker components (counter, checklist, manual — base styles)
- Build Dashboard skeleton
- Test designs against wire-frames

**Israel:**
- Set up Expo navigation (bottom tab bar)
- Build Chat screen (mobile version)
- Build Goal Detail modal (skeleton)
- Build Voice Input modal (skeleton)
- Sync colors + typography with design system

---

### Lunch: 13:00–13:45

---

### Sprint 2: 13:45–15:30 (Integration & Polish)

**David:**
- Goal-type detection (counter vs checklist vs manual)
- Dynamic tracker rendering logic
- Chat state management
- TTS caching (store audio URLs to avoid re-rendering)
- ASR transcription display (real-time)
- Test all AI flows locally

**Evans:**
- Implement `/progress` endpoint (user submits update, logs to DB)
- Implement `/dashboard` endpoint (today's goals, history, stats)
- Implement `/api/goals/:id/finalize` (at deadline, call Nemotron for verdict)
- Implement TTS/ASR endpoints (call NVIDIA Brev, cache results)
- Build `/api/debug` endpoint (show goals, Nemotron calls, audio outputs)
- Error handling for all endpoints (timeouts, invalid input, etc.)

**Eniola:**
- Wire Chat component to `/api/goals` (text input → API call → Nemotron response)
- Wire Chat to `/api/asr` (mic button → send audio → get transcription)
- Wire Chat to `/api/tts` (text → get audio URL → play)
- Wire Tracker to `/api/progress` (update button → API call → log progress)
- Wire Dashboard to `/api/dashboard` (fetch goals, display stats)
- Add loading/error states
- Polish styling: spacing, colors, animations

**Israel:**
- Build Goal Detail modal (full-screen on mobile)
  - Wire to `/api/goals/:id` for goal data
  - Wire tracker to `/api/progress`
  - Wire TTS button to `/api/tts`
- Build Voice Input modal
  - Mic button → ASR → transcription display
  - Re-record option
- Build Work-Block overlay
  - Timer display
  - "Close app?" confirmation
- Sync design with Chioma & Eniola (same colors, spacing)
- Wire mobile app to Django API (same as web)

---

### 15:30–15:45: Checkpoint

- **Web:** Type goal in chat → see tracker render → click update → progress logged
- **Mobile:** Same flow via mobile UI
- **Audio:** Type goal OR say goal via mic → parse correctly
- **TTS:** Click 🔊 on any AI message → hear it played back
- Demo: `/api/debug` endpoint shows recent goals + Nemotron/TTS calls

---

### Sprint 3: 15:45–17:00 (Polish & Final Testing)

**David:**
- Fix bugs from checkpoint
- Test all AI flows end-to-end (goal parse, TTS, ASR, verdict)
- Backup for Israel if mobile has blockers
- Code cleanup + comments on critical sections

**Evans:**
- Final backend polish: error messages are clear + helpful
- Make sure `/api/debug` is crystal clear (judges should understand every field)
- Test edge cases: goal after deadline, progress > target, missing fields
- Prepare deployment: create `.env` for both Render instances
- Test both backend instances independently

**Eniola:**
- Final UI polish: animations, clarity, mobile responsiveness on web
- Test all flows: create goal (text or voice) → update → check dashboard
- Verify TTS player works on all pages
- Verify ASR transcription displays correctly
- Mobile + web parity (design consistency)

**Israel:**
- Final mobile UX: timer is prominent, close app warning is clear
- Work-block overlay: test with real mobile device (if available) or simulator
- Test all modals: Goal Detail, Voice Input, Work-Block
- TTS playback on mobile
- Ask David for help on any AI/backend issues

---

### Final: 17:00–17:30 (Deployment & Submission)

**David:**
- Final code push to GitHub
- Verify code is clean + commented
- Help Evans with Render deployment if needed

**Evans:**
- Deploy Django to Render (2 instances):
  - Instance 1: `ontrack-api-web` (env var: `CLIENT_TYPE=web`)
  - Instance 2: `ontrack-api-mobile` (env var: `CLIENT_TYPE=mobile`)
- Run migrations on both
- Test health checks: `/api/health` returns 200 on both
- Test `/api/debug` on both instances
- Prepare deployment explanation for judges

**Eniola:**
- Deploy React to Vercel (auto-deploy from GitHub)
- Test web app live: create goal, see tracker, update progress
- Record final screenshot/video of web flow
- Submit web app link

**Israel:**
- Verify mobile app runs on Expo Go
- Test with real Expo Go (if available) or simulator
- Record final screenshot/video of mobile flow
- Prepare Expo link or .apk for demo

**90-Second Demo:**
1. Open web chat: "I want to sell 5 cars by Friday"
2. AI parses, creates counter tracker
3. Click +1 three times (show progress = 3/5)
4. Show dashboard with goal + progress
5. Switch to mobile app, show work-block timer running for same goal
6. Done

---

## 10. Role-Specific Hooks (Detailed Plans)

### David (Mobile Lead + AI Integration)

**Your detailed plan should cover:**

1. **AI Integration (Nemotron, TTS, ASR)**
   - 3 core Nemotron prompts: goal parse, check-in, verdict
   - TTS prompt: convert AI response to speech request
   - ASR workflow: audio file → transcription → parse as goal
   - Error handling: timeouts, bad JSON, empty responses
   - Brev credit budgeting: how many calls per user per day?
   - Caching strategy: store TTS audio URLs to avoid re-rendering

2. **Django Backend Collaboration with Evans**
   - Critical endpoints: `/api/goals`, `/api/progress`, `/api/tts`, `/api/asr`, `/api/goals/:id/finalize`
   - What goes in each endpoint? Who owns what?
   - How do you test AI flows locally before Evans integrates into web?
   - Rate limiting + error handling plan

3. **Mobile Development (React Native + Expo)**
   - Navigation structure: bottom tab bar (Home, Chat, Goals, Settings)
   - Chat screen: how do you wire mic button to ASR?
   - Goal Detail modal: wire tracker to `/api/progress`, TTS to `/api/tts`
   - Work-Block overlay: timer display, close confirmation
   - How do you reuse David's React components vs rebuild for native?

4. **Backup for Israel**
   - Specific weak points: where might Expo/navigation fail?
   - Can you jump into mobile UI if Israel is blocked?

---

### Evans (Backend Lead + Web Infrastructure)

**Your detailed plan should cover:**

1. **Data Model & Migrations**
   - Exact SQL for: users, goals, progress_logs, goal_items, audio_cache (for TTS)
   - goal_type: single column with enum (counter | checklist | manual)
   - audio_cache: store TTS results to avoid re-rendering
   - Indexes: user_id on goals/progress_logs, goal_id on progress_logs, deadline on goals (for batch finalize)

2. **API Endpoints (All Required)**
   - Authentication: `/api/auth/signup`, `/api/auth/login` (Supabase JWT)
   - Goals: `/api/goals` (POST create, GET list), `/api/goals/:id` (GET, PUT update)
   - Progress: `/api/progress` (POST log update)
   - Dashboard: `/api/dashboard` (GET today's goals + stats)
   - Finalize: `/api/goals/:id/finalize` (POST, call Nemotron for verdict at deadline)
   - AI/Audio: `/api/tts` (POST text → get audio URL), `/api/asr` (POST audio → get transcription)
   - Debug: `/api/debug` (GET recent goals, recent Nemotron calls, audio outputs — judges only)
   - Health: `/api/health` (GET simple 200 response)
   - Error response format: `{"error": "message", "code": "ERROR_CODE"}`

3. **Audio Integration (TTS + ASR)**
   - TTS endpoint: cache audio URLs (don't re-generate same text)
   - ASR endpoint: accept audio file, return transcription
   - Both endpoints call NVIDIA Brev (via David's prompts)
   - Handle timeouts gracefully (return error, don't block)

4. **Error Handling & Edge Cases**
   - Deadline passed: verdict still generated, goal marked "missed"
   - Progress > target: allow it, judge as "exceeded"
   - Progress < 0: reject with error
   - Nemotron timeout: fallback to generic verdict ("You worked on this goal")
   - DB slow: add timeout + circuit breaker pattern
   - Supabase auth fails: return 401 Unauthorized

5. **Deployment Plan (Dual Backend)**
   - Two separate Render deployments from same GitHub repo
   - `ontrack-api-web`: env var `INSTANCE_NAME=web`, `DATABASE_URL=<supabase>`, `NVIDIA_API_KEY=<key>`
   - `ontrack-api-mobile`: env var `INSTANCE_NAME=mobile`, `DATABASE_URL=<same>`, `NVIDIA_API_KEY=<key>`
   - Both share same Supabase (single DB source of truth)
   - Both independently deployable (one can fail without affecting other)
   - Health checks: each instance monitored separately

6. **Debugging Tools**
   - `/api/debug` shows:
     - Last 5 goals (creation time, target, current progress, status)
     - Last 5 Nemotron calls (prompt, response, latency)
     - Last 5 TTS calls (text input, audio URL, latency)
     - Server instance name + uptime
   - Judges can inspect one goal's full flow: creation → parsing → progress → verdict

---

### Eniola (Frontend Web)

**Your detailed plan should cover:**

1. **Web Pages & Routes**
   - `/auth` (signup/login)
   - `/dashboard` (today's goals, stats, history)
   - `/chat` (conversational goal creation)
   - `/goal/:id` (goal detail, tracker, progress log)
   - `/settings` (profile, audio preferences, notifications)
   - Layout: navbar, sidebar, main content area

2. **React Components (Web)**
   - Chat component: message history (array of {role, content}), input field, send button
   - Audio inputs: 🎤 mic button (opens transcription modal), TTS playback button 🔊
   - Tracker components: counter (big +1 button), checklist (checkboxes), manual (text input)
   - Dashboard: goal cards (title, progress bar, deadline), stats widget, history list
   - Error states: loading spinners, error messages, empty states

3. **Audio Features (TTS + ASR)**
   - ASR integration: mic button in chat → call `/api/asr` with audio → display transcript
   - TTS integration: 🔊 button on AI messages → call `/api/tts` → play audio
   - TTS playback controls: play, pause, speed (0.75x, 1x, 1.25x, 1.5x)
   - Error handling: if TTS fails, show transcript as fallback

4. **Styling & Design System**
   - Color scheme: define primary, secondary, neutral colors
   - Typography: font family, sizes for desktop (heading, body, caption)
   - Spacing: standard margin/padding scale
   - Responsive breakpoints: desktop (1200px+), tablet (768px-1199px)
   - Animations: fade-in for modals, slide-in for notifications

5. **User Flows (Step-by-Step)**
   - Sign up → sign in → create goal (text OR voice via mic) → tracker renders → update progress → check dashboard
   - Check-in flow: AI check-in message appears → listen via TTS → respond in chat
   - Verdict flow: deadline hits → AI verdict via TTS → view on dashboard
   - Edge cases: goal deadline passed, progress > target, empty states, audio playback fails

6. **Collaboration with Evans**
   - Which endpoints do you need? (Evans provides complete API spec)
   - Error format: how should failed API calls be displayed to user?
   - State management: how do you handle loading/error states?

---

### Israel (Mobile Developer / React Native + Expo + Audio)

**Your detailed plan should cover:**

1. **Expo Setup & Navigation**
   - Project structure: screens folder (Home, Chat, Goals, Settings), modals folder
   - Navigation: bottom tab bar (Home, Chat, Goals, Settings) + modal stack for overlays
   - Networking: use fetch or axios to call Django API (`ontrack-api-mobile` instance)
   - State management: how do you manage goals, chat history, user session?

2. **Mobile Screens (Tab Navigation)**
   - **Home/Dashboard:** goal cards (swipeable), quick stats, + button to create goal
   - **Chat:** message bubbles, text input, 🎤 mic button (ASR), 🔊 TTS button
   - **Goals:** list of active goals, tap to open Goal Detail modal
   - **Settings:** profile, audio preferences (TTS/ASR toggle, volume, speed), notifications

3. **Modals & Overlays**
   - **Goal Detail Modal:** full-screen, countdown timer, tracker UI, progress log
   - **Voice Input Modal:** mic icon, "Listening...", real-time transcript, re-record option
   - **Work-Block Overlay:** semi-transparent dark background, large timer, "Close app?" confirmation
   - **Goal Creation Modal:** text input OR 🎤 voice option

4. **Audio Features (TTS + ASR) on Mobile**
   - **ASR (Speech-to-Text):** mic button in chat → record audio → call `/api/asr` → display transcription
   - **TTS (Text-to-Speech):** 🔊 button on AI messages → call `/api/tts` → play audio with controls (play, pause, speed)
   - Audio playback: use React Native Audio API, handle errors gracefully
   - Transcription display: real-time as user speaks, editable before submit

5. **Tracker Screens (Dynamic)**
   - **Counter:** large +1 button (tap to increment), big numbers display
   - **Checklist:** swipeable list, large checkboxes, edit item names
   - **Manual Log:** full-width text input, keyboard-optimized for mobile
   - All trackers wire to `/api/progress` endpoint (same as web)

6. **Work-Block Component**
   - Timer display: center of overlay, large font, ticking countdown
   - "You are working on: [goal title]" — always visible
   - "Close this app?" button → confirmation modal ("Are you sure?" + "Keep working" button)
   - Visual prominence: work-block should feel like "you can't escape this goal"

7. **Design System Sync**
   - Colors: get from David/Chioma & Eniola (primary, secondary, neutral)
   - Typography: same font sizes as web (scaled for mobile)
   - Spacing: same margin/padding constants as web
   - File: store in `/constants/colors.js`, `/constants/spacing.js`
   - Visual consistency: chat bubbles, trackers, buttons look same on web + mobile

8. **Testing & Deployment**
   - Test on Expo Go (iOS + Android simulator)
   - Real device test if available
   - Error states: network fails, audio playback fails, API timeout

9. **Collaboration with David**
   - What does David provide? (AI/TTS/ASR endpoints, Nemotron prompts, error handling)
   - Specific blockers: where might you need David's help?
   - Code organization: how do you handle shared logic (API calls, state) between web + mobile?

---

## 11. Deployment Plan

### Deployment Architecture

```
Supabase (Shared Database)
         ↓
    ↙                    ↘
Render Web             Render Mobile
(ontrack-api-web)      (ontrack-api-mobile)
Same Django code,      Same Django code,
separate instances     separate instances
         ↓                    ↓
    Vercel             Expo Go / EAS
    (React Web)        (React Native)
```

### By 17:30

**Backend (Django) — Dual Instances on Render:**

Instance 1: `ontrack-api-web`
- [ ] Render: new Docker deployment
  - Dockerfile: Python 3.9, Django, gunicorn
  - .env: `INSTANCE_NAME=web`, `DATABASE_URL=<supabase>`, `NVIDIA_API_KEY=<key>`, `SECRET_KEY=<random>`
- [ ] Run migrations: `python manage.py migrate` (only run once per DB, either instance)
- [ ] Health check: `GET /api/health` returns 200
- [ ] Test endpoints: `POST /api/goals`, `GET /api/dashboard`, `GET /api/debug`

Instance 2: `ontrack-api-mobile`
- [ ] Render: new Docker deployment (same code, separate instance)
  - Dockerfile: same as Instance 1
  - .env: `INSTANCE_NAME=mobile`, `DATABASE_URL=<same>`, `NVIDIA_API_KEY=<key>`, `SECRET_KEY=<random>`
  - Skip migrations (already run by instance 1)
- [ ] Health check: `/api/health` returns 200
- [ ] Test endpoints independently

**Web Frontend (React) — Deployed to Vercel:**
- [ ] Vercel: connect GitHub repo, auto-deploy on push
  - .env: `REACT_APP_API_URL=https://ontrack-api-web.render.com`
  - .env: `REACT_APP_SUPABASE_URL=<supabase>`, `REACT_APP_SUPABASE_KEY=<anon-key>`
- [ ] Test live: create goal (text + voice), see tracker, update progress
- [ ] Test audio: mic button works, TTS playback works
- [ ] Share deployment URL with judges

**Mobile Frontend (React Native/Expo):**
- [ ] Environment config: `API_URL=https://ontrack-api-mobile.render.com`
- [ ] Expo Go: app runs on local machine + simulator (iOS + Android)
  - OR: EAS Build (if time, creates .apk/.ipa)
- [ ] Test: create goal, chat works, tracker works, audio works
- [ ] Share Expo Go link (or .apk) with judges

**GitHub Repository:**
- [ ] Push all code to main branch
  - Backend (Django app)
  - Web (React + Vite)
  - Mobile (React Native)
  - Dockerfile + docker-compose.yml

**Submission Package:**
- [ ] README: setup instructions, env vars, deployment steps
- [ ] 90-second demo video
  - Web: create goal (text or voice) → tracker → update progress → check TTS playback
  - Mobile: same flow on Expo Go
- [ ] Project card submitted
  - Title: "OnTrack"
  - One-line: "Conversational accountability tracker with voice input/output"
  - Team: David, Evans, Eniola, Israel
  - Tech: Django, React, React Native, Supabase, NVIDIA Brev
  - What built: chat-first goal tracker, dynamic trackers, TTS/ASR, work-block, dual backend

**Links to Provide:**
- [ ] GitHub repo link
- [ ] Vercel (web) deployment link
- [ ] Expo Go link OR .apk (mobile)
- [ ] `/api/debug` endpoint on both backend instances (for judges to inspect)

---

## 12. Success Criteria (Rubric Scoring)

| Criterion | Points | OnTrack Plan |
|-----------|--------|--------------|
| **Problem + User Value** | 20 | Freelancers/students/salespeople set goals and lose track → OnTrack forces accountability + proof |
| **Functional Execution** | 20 | Chat → goal parsing → tracker → progress → verdict. All components work live. |
| **Quality of AI Use + NVIDIA Brev** | 20 | Nemotron orchestrates entire flow: parsing, check-ins, verdicts. Real agentic work. Brev credits visibly used. |
| **Testing + Reliability** | 15 | Edge cases handled (deadline passed, progress > target). Error states clear. Backend `/debug` shows confidence. |
| **Experience + Demo** | 15 | Chat is intuitive. Mobile work-block is clear. 90-sec demo is crisp. |
| **Responsible AI + Data** | 10 | Supabase auth secure. Goal data private. Nemotron prompts don't expose PII. Clear data deletion. |

**Target: 100/100**

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Nemotron API times out | High | Fallback: use hardcoded default goal type (counter). Still works. |
| Supabase auth fails | High | Test signup/login by 11:30. Have backup auth plan (simple JWT). |
| React/React Native components aren't responsive by 15:30 | Medium | Cut fancy animations. Focus on functional UI. Polish last. |
| Israel blocked on Expo | Medium | David jumps in. Pre-test Expo setup by 11:15. |
| Goal parsing is vague (user says "get better") | Medium | Nemotron prompt includes: "If ambiguous, ask clarifying questions." |
| Judges can't understand backend logic | Medium | Evans builds `/api/debug` endpoint with verbose logging. David annotates code. |

---

## 14. Final Checklist (17:30)

- [ ] Code committed to GitHub
- [ ] Backend live (Heroku/Railway) + health check passes
- [ ] Web app live (Vercel) + calls backend
- [ ] Mobile app runs on Expo Go (test on simulator)
- [ ] Demo video recorded (90 sec)
- [ ] Project card submitted (title, team, tech, description)
- [ ] All API endpoints respond correctly
- [ ] `/api/debug` shows recent goals + Nemotron calls
- [ ] Chat → tracker → progress → verdict flow works end-to-end
- [ ] Dashboard displays results
- [ ] Work-block shows on mobile
- [ ] No console errors (React, Expo)
- [ ] Credentials stored in .env (not hardcoded)

---

## 15. Questions to Resolve Before 10:15

1. **Supabase Project URL** — where is it? (David + Evans)
2. **NVIDIA Brev Voucher** — activated? What's the API endpoint? (David)
3. **GitHub Repo** — created? Anyone with push access? (David)
4. **Expo Org Account** — created? (Israel)
5. **Vercel Account** — set up? (Eniola or whoever deploys web)
6. **Heroku/Railway Account** — set up? (Evans or David)
7. **Figma Design File** — shared? (Eniola)

---

**This plan is your north star. Each role should now write their own detailed breakdown (1 page each) using these hooks. Good luck. Ship it.**
