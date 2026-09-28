# OnTrack Web Frontend — Architecture & Implementation Guide

> **Say your goal. Get your tracker.**  
> A high-performance, conversational goal tracking and accountability platform built with React, TypeScript, Vite, and Tailwind CSS.

---

## 📑 Table of Contents
1. [System Architecture & Design Philosophy](#1-system-architecture--design-philosophy)
2. [Technology Stack](#2-technology-stack)
3. [Directory & File Structure](#3-directory--file-structure)
4. [Routing Matrix & Application Navigation](#4-routing-matrix--application-navigation)
5. [State Management & Data Synchronization](#5-state-management--data-synchronization)
6. [AI Coach & Natural Language Parsing Engine](#6-ai-coach--natural-language-parsing-engine)
7. [Adaptive Goal Trackers](#7-adaptive-goal-trackers)
8. [Speech & Audio Engine (Voice-to-Text & TTS)](#8-speech--audio-engine-voice-to-text--tts)
9. [Dashboard Subsystems & Panels](#9-dashboard-subsystems--panels)
10. [Third-Party Integrations & OAuth Authentication](#10-third-party-integrations--oauth-authentication)
11. [Legal, Compliance & User Trust](#11-legal-compliance--user-trust)
12. [Environment Configuration & Build Pipelines](#12-environment-configuration--build-pipelines)

---

## 1. System Architecture & Design Philosophy

OnTrack Web implements a **tactile neo-brutalist** design aesthetic designed to make digital personal accountability feel grounded, authoritative, and responsive:

* **Primary Palette**: Deep Navy (`#071E2D`), Vibrant Turquoise (`#00C4B3`), Deep Turquoise (`#006D6A`), Mint Ice (`#ECFEFF`), and Clean White (`#FFFFFF`).
* **Dark Mode Parity**: Dark Charcoal (`#07141E`) and Slate Navy (`#0E202D`) with high-contrast slate text and border accents (`#1E3A52`).
* **Tactile Styling**: 2px solid structural borders, sharp box shadows (`shadow-[2px_2px_0px_#071E2D]`, `shadow-[4px_4px_0px_#071E2D]`, `shadow-[6px_6px_0px_#00C4B3]`), pill buttons with interactive bubble icons, and micro-hover translations (`hover:-translate-y-0.5`).
* **Typography**: Editorial serif headlines with `Fraunces`, clean modern body copy with `DM Sans`, and tabular data with `Space Grotesk` and monospace tokens.

---

## 2. Technology Stack

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `^19.2.8` | Component model, concurrent rendering, and state management |
| **Language** | TypeScript | `~6.0.2` | Strict end-to-end type safety across domain models and API contracts |
| **Bundler / Tooling** | Vite | `^8.3.0` | High-speed HMR dev server and optimized Rollup production builds |
| **Routing** | React Router DOM | `^6.26.0` | Client-side routing, protected route guards, and nested layouts |
| **Styling** | Tailwind CSS v4 | `^4.3.3` | Utility-first CSS engine using native modern CSS features |
| **Icons** | Lucide React | `^1.48.0` | High-fidelity, consistent SVG icon system |
| **Celebrations** | Canvas Confetti | `^1.9.4` | Physics-driven particle celebration triggers on goal completion |
| **Speech Engine** | Web Speech API | Native | SpeechRecognition dictation and SpeechSynthesis voice output |

---

## 3. Directory & File Structure

```
FRONTEND/web/
├── index.html                   # HTML entrypoint, Google Fonts preconnect, and metadata
├── vite.config.ts               # Vite configuration with React plugin and Tailwind support
├── tsconfig.json                # Project TypeScript configuration references
├── package.json                 # Dependency declarations and build scripts
└── src/
    ├── main.tsx                 # Root React DOM entrypoint with strict mode
    ├── App.tsx                  # Master routing configuration and ProtectedRoute logic
    ├── index.css                # Global Tailwind tokens, color variables, and button utilities
    ├── App.css                  # Core layout reset
    │
    ├── assets/                  # High-resolution illustrations, badges, and brand assets
    │
    ├── types/
    │   └── index.ts             # Domain contracts: Goal, TrackerType, ProgressLog, UserProfile, etc.
    │
    ├── services/
    │   └── api.ts               # Authenticated fetch client, token refresh, and Render API endpoints
    │
    ├── context/
    │   ├── GoalContext.tsx       # Core state: goals CRUD, active tracking, cache & offline fallback
    │   └── ThemeContext.tsx      # Dark/Light mode management with localStorage persistence
    │
    ├── utils/
    │   ├── aiIntent.ts          # NLP classifier: conversational chat vs. goal creation & tracker parser
    │   ├── auth.ts              # URL token parser, OAuth redirection, and session hydration
    │   └── goalMetrics.ts       # Real-time progress math, task aggregation, and activity timelines
    │
    ├── components/
    │   ├── Navbar.tsx           # Global public navigation with mobile drawer and theme toggle
    │   ├── Logo.tsx             # Responsive SVG brand badge and typography mark
    │   ├── Button.tsx           # Reusable tactile pill buttons with hover micro-animations
    │   ├── Card.tsx             # Universal 2px-bordered tactile container
    │   ├── AuthIllustration.tsx # Split-screen auth illustration showcase with dynamic cards
    │   ├── Accordion.tsx        # Collapsible FAQ and documentation accordion
    │   ├── InputField.tsx       # Form input with validation states and label wrappers
    │   ├── FeaturePill.tsx      # Interactive feature tags and domain labels
    │   │
    │   ├── chat/                # AI Coach chat interface
    │   │   ├── ChatWindow.tsx   # Conversational thread, streaming state, and goal proposal cards
    │   │   ├── ChatInput.tsx    # Textarea with auto-resize, send triggers, and mic launcher
    │   │   ├── MessageBubble.tsx# Distinct sender styling (User vs. AI Coach Persona)
    │   │   ├── SuggestedAction.tsx # Clickable prompt chips for quick goal setting
    │   │   ├── VoiceInput.tsx   # Live Web Speech recorder with volume meter & error handling
    │   │   └── TTSPlayer.tsx    # Text-to-speech audio reader with pitch and rate controls
    │   │
    │   ├── trackers/            # Interactive adaptive goal tracking modules
    │   │   ├── CounterTracker.tsx   # Step increment/decrement, numeric target, notes & voice
    │   │   ├── ChecklistTracker.tsx # Milestone checklist with checkboxes & dynamic item additions
    │   │   └── ManualTracker.tsx    # Qualitative reflection logs, ratings & voice reflections
    │   │
    │   ├── goals/               # Goal management and inspection
    │   │   ├── GoalCard.tsx     # Overview card showing progress bar, deadline, and domain badge
    │   │   ├── GoalHeader.tsx   # Workspace header with status chips, edit modal, and actions
    │   │   ├── EditGoalModal.tsx# Edit goal title, deadline, target values, and tracker type
    │   │   ├── CheckIn.tsx      # Accountability check-in prompt and response dialog
    │   │   ├── ProgressLog.tsx  # Chronological history of counter increments and notes
    │   │   └── Verdict.tsx      # AI evaluation report card (pass/fail, score, summary)
    │   │
    │   ├── dashboard/           # Dashboard shell and widgets
    │   │   ├── DashboardShell.tsx       # Persistent sidebar, mobile header, and subroute outlet
    │   │   ├── DashboardSidebar.tsx     # Navigation links with active badges and user menu
    │   │   ├── DashboardTopNav.tsx      # Top bar with quick stats, search, and notification bell
    │   │   ├── DashboardStatGrid.tsx    # 4-card metric overview (Active, Completed, Velocity, Streak)
    │   │   ├── DashboardChart.tsx       # 7-day activity bar visualization
    │   │   ├── DashboardRecentActivity.tsx # Feed of recent check-ins, increments, and notes
    │   │   ├── DashboardChatPanel.tsx   # Slide-out AI Coach assistant within the dashboard
    │   │   ├── DashboardTrackerCard.tsx # Quick-action tracker card for pinned goals
    │   │   ├── GoalDetailSlideOver.tsx  # Deep-dive drawer for inspecting goal details
    │   │   └── panels/                  # Subroute dashboard views
    │   │       ├── ActivityPanel.tsx    # Full-page historical activity and audit log
    │   │       ├── ManagePanel.tsx      # Comprehensive list with bulk actions and filters
    │   │       ├── ProgramPanel.tsx     # Multi-week roadmap and milestone schedules
    │   │       ├── ReportsPanel.tsx     # Visual performance analytics and export options
    │   │       ├── CommunityPanel.tsx   # Community leaderboard and peer accountability
    │   │       ├── IntegrationsPanel.tsx# Connected platforms management (GitHub, Google, etc.)
    │   │       ├── CalendarPanel.tsx    # Interactive monthly and weekly deadline calendar
    │   │       └── AccountPanel.tsx     # User profile, persona selection, and security
    │   │
    │   └── settings/            # Settings configuration screens
    │       ├── Profile.tsx      # Name, email, timezone, and persona selection
    │       ├── Integrations.tsx # OAuth connect cards, scopes, and future roadmap modals
    │       ├── Notifications.tsx# Email, push, and audio notification preferences
    │       └── AudioPreferences.tsx # Voice coach type, playback speed, and speech defaults
    │
    └── pages/
        ├── Landing.tsx          # High-converting marketing landing page with interactive demo
        ├── Login.tsx            # Email/password and OAuth (Google, GitHub) authentication
        ├── Signup.tsx           # Registration flow with persona choice and legal agreement
        ├── ResetPassword.tsx    # Password recovery and reset request flow
        ├── Onboarding.tsx       # Multi-step questionnaire to establish coaching persona & first goal
        ├── DashboardOverview.tsx# Primary `/dashboard` landing view with metrics and active cards
        ├── GoalWorkspace.tsx    # Dedicated workspace for a single goal (`/goals/:goalId`)
        ├── Chat.tsx             # Full-screen conversational AI Coach interface (`/chat`)
        ├── PrivacyPolicy.tsx    # Comprehensive data sovereignty and audio privacy statement
        ├── TermsOfService.tsx   # Terms of service, acceptable use, and AI advice disclaimer
        ├── Settings.tsx         # Standalone settings management container
        ├── Docs.tsx             # In-app user guides, keyboard shortcuts, and FAQs
        └── NotFound.tsx         # Tactile 404 error page with quick navigation back to home
```

---

## 4. Routing Matrix & Application Navigation

Routing is declared in [`src/App.tsx`](./src/App.tsx) using React Router DOM v6. Protected routes are wrapped in `<ProtectedRoute>`, which checks for a valid Supabase JWT in `localStorage` (`ontrack_token`) and redirects unauthenticated users directly to `/login`.

### Public Routes
* `/` — [`Landing.tsx`](./src/pages/Landing.tsx): Value proposition, live tracker preview, testimonials, pricing, and FAQ.
* `/login` — [`Login.tsx`](./src/pages/Login.tsx): Authenticate via Supabase email/password or GitHub/Google OAuth.
* `/signup` — [`Signup.tsx`](./src/pages/Signup.tsx): New user registration with inline links to legal policies.
* `/reset-password` — [`ResetPassword.tsx`](./src/pages/ResetPassword.tsx): Request and confirm password reset tokens.
* `/privacy-policy` — [`PrivacyPolicy.tsx`](./src/pages/PrivacyPolicy.tsx): Privacy policy and data handling disclosures.
* `/terms-of-service` & `/terms` — [`TermsOfService.tsx`](./src/pages/TermsOfService.tsx): User terms of service and AI liability disclaimers.

### Authenticated Workspace Routes
* `/onboarding` — [`Onboarding.tsx`](./src/pages/Onboarding.tsx): Initial questionnaire to select coach persona and prime the first goal.
* `/chat` — [`Chat.tsx`](./src/pages/Chat.tsx): Full-page conversation with the AI coach.
* `/goals/:goalId` — [`GoalWorkspace.tsx`](./src/pages/GoalWorkspace.tsx): Deep-dive tracking interface for an active goal.
* `/dashboard` — [`DashboardShell.tsx`](./src/components/dashboard/DashboardShell.tsx): Nested dashboard layout hosting:
  * `/dashboard` (Index) — [`DashboardOverview.tsx`](./src/pages/DashboardOverview.tsx): KPI grid, active goals, weekly chart.
  * `/dashboard/activity` — [`ActivityPanel.tsx`](./src/components/dashboard/panels/ActivityPanel.tsx): Full timeline log.
  * `/dashboard/manage` — [`ManagePanel.tsx`](./src/components/dashboard/panels/ManagePanel.tsx): Goal filtering, archiving, deletion.
  * `/dashboard/program` — [`ProgramPanel.tsx`](./src/components/dashboard/panels/ProgramPanel.tsx): Multi-week accountability programs.
  * `/dashboard/reports` — [`ReportsPanel.tsx`](./src/components/dashboard/panels/ReportsPanel.tsx): Performance analytics and velocity stats.
  * `/dashboard/community` — [`CommunityPanel.tsx`](./src/components/dashboard/panels/CommunityPanel.tsx): Peer accountability boards.
  * `/dashboard/integrations` — [`IntegrationsPanel.tsx`](./src/components/dashboard/panels/IntegrationsPanel.tsx): GitHub, Google Calendar, etc.
  * `/dashboard/calendar` — [`CalendarPanel.tsx`](./src/components/dashboard/panels/CalendarPanel.tsx): Scheduled check-ins and deadlines.
  * `/dashboard/account` — [`AccountPanel.tsx`](./src/components/dashboard/panels/AccountPanel.tsx): Profile, persona, and notifications.

---

## 5. State Management & Data Synchronization

### `GoalContext.tsx`
The primary state hub of the application manages:
* **Goals Collection**: Fetches live goals from `https://ontrack-api-web.onrender.com/api/goals` with Supabase Bearer token authentication.
* **Optimistic Updates**: Incrementing a counter, checking off a milestone, or saving a note updates UI state immediately, then synchronizes asynchronously with the backend. If a network error occurs, state rolls back gracefully.
* **Offline & Cache Resilience**: Goals and active metrics are cached to `localStorage('ontrack_cached_goals')`. If the backend is waking up from cold standby (Render free tier), users experience zero layout disruption.
* **Real-time Percentage Aggregation**: Uses [`goalMetrics.ts`](./src/utils/goalMetrics.ts) to calculate incremental progress across all active goals without requiring all tasks to be finished before the percentage moves.

### `ThemeContext.tsx`
* Manages Light / Dark mode.
* Persists user preference in `localStorage('ontrack-theme')`.
* Toggles the `.dark` class on the root `<html>` element, enabling Tailwind's `dark:` selectors across the entire component tree.

---

## 6. AI Coach & Natural Language Parsing Engine

The AI subsystem operates through a multi-tier pipeline in [`src/utils/aiIntent.ts`](./src/utils/aiIntent.ts) and [`src/components/chat/ChatWindow.tsx`](./src/components/chat/ChatWindow.tsx):

### Intent Classification
Prevents everyday messages from mistakenly spawning unwanted goal trackers:
1. **Greetings & Social Pings**: Phrases like *"hi"*, *"hello"*, *"good morning"* return conversational warm welcomes.
2. **Acknowledgments**: Responses like *"cool"*, *"thanks"*, *"sounds good"* receive motivating acknowledgments.
3. **Casual & Physiological States**: Statements like *"I'm hungry"*, *"I'm tired"*, *"I'm bored"* provide mindful rest and recovery suggestions rather than creating goals.
4. **Motivational / Burnout Coaching**: Queries expressing procrastination or lack of focus trigger tactical encouragement and habit reframing.
5. **Progress Logging**: Messages stating completed actions (e.g. *"I just ran 5km"* or *"Finished 3 calls"*) automatically increment existing matched trackers.
6. **Goal Proposals**: Concrete intentions (e.g. *"Sell 10 tickets by Saturday"*) generate structured tracker proposals for confirmation.

### Retrieval-Augmented Generation (RAG) & Memory
For conversational questions, status inquiries, and check-ins:
* **pgvector Similarity Search**: Messages query the user's progress log embeddings (`ORDER BY embedding <-> query_embedding LIMIT 5`) scoped strictly to their authenticated account.
* **Grounded Responses**: Rather than responding generically, Nemotron AI Coach references specific numbers, milestones, and patterns from prior log entries.
* **UI Grounding Badge**: When RAG is active, message bubbles display an interactive badge indicating the number of retrieved items with an expandable toggle to inspect the exact progress logs used.
* **Zero Failure Tolerance**: If retrieval, embeddings, or network are unavailable, the conversation degrades gracefully to seamless contextual responses without errors.

### Smart Tracker Classification & Deadlines
* **Automatic Tracker Type Selection**:
  * Quantitative targets with numbers (e.g., *"Read 30 pages"*, *"Run 10km"*) &rarr; **`counter`**
  * Multi-step or phased projects (e.g., *"Launch my portfolio site"*) &rarr; **`checklist`**
  * Habitual or introspective prompts (e.g., *"Daily meditation"*, *"Evening journal"*) &rarr; **`manual`**
* **Saturday-Target Defaulting**: When a user specifies *"this week"* without an explicit date, deadlines resolve automatically to the upcoming Saturday at 23:59:59.

---

## 7. Adaptive Goal Trackers

Located in [`src/components/trackers/`](./src/components/trackers/):

### 1. Counter Tracker (`CounterTracker.tsx`)
* **Primary Use**: Quantitative numeric goals (sales volume, workout reps, pages read, cold calls).
* **Features**:
  * Big numeric dial showing `current_value` / `target` `unit`.
  * Increment (`+1`, `+5`, custom step) and Decrement (`-1`) tactile buttons.
  * Direct numeric input modal for instant progress adjustments.
  * Reflection and note box with **voice dictation** button to record notes hands-free.
  * Physics celebration trigger: Fires `canvas-confetti` when progress reaches or exceeds 100%.

### 2. Checklist Tracker (`ChecklistTracker.tsx`)
* **Primary Use**: Step-by-step milestone projects (software launches, event planning, course completion).
* **Features**:
  * Step items with tactile checkboxes and strike-through animations.
  * Real-time progress percentage based on completed versus total items.
  * Inline input to add new custom milestones at any time.
  * Drag-and-drop or reorder indicators.

### 3. Manual Tracker (`ManualTracker.tsx`)
* **Primary Use**: Qualitative reflections, habit consistency, and daily journaling.
* **Features**:
  * Daily check-in log with sentiment and rating indicators.
  * Markdown-capable reflection box.
  * Integrated microphone dictation to speak reflections naturally.
  * Historical log of previous entries with timestamps.

---

## 8. Speech & Audio Engine (Voice-to-Text & TTS)

### Voice Dictation (`VoiceInput.tsx`)
Enables zero-friction speech input across chat prompts, tracker notes, and daily reflections:
* **Microphone Permissions**: Explicitly verifies permissions using `navigator.mediaDevices.getUserMedia({ audio: true })` before initializing.
* **Browser Speech Recognition**: Interfaces with `webkitSpeechRecognition` or `SpeechRecognition`.
* **Visual Sound Meter**: Animated pulsing halo that reacts dynamically while listening.
* **Fault Tolerance**: Explicit human-readable alerts for `not-allowed` (permission denied), `no-speech` (silence timeout), and `network` issues.
* **Audio Track Cleanup**: Automatically stops all microphone hardware tracks on cancel or submit to prevent hardware battery drain.

### Text-to-Speech Output (`TTSPlayer.tsx`)
* Integrates browser `window.speechSynthesis`.
* Speaks coach verdicts and motivational responses aloud according to the user's selected persona speed and pitch settings.

---

## 9. Dashboard Subsystems & Panels

Located in [`src/components/dashboard/`](./src/components/dashboard/):

* **Top Navigation Bar (`DashboardTopNav.tsx`)**: Global search across all active trackers, quick goal creation shortcut, live streak counter, dark mode toggle, and notification drawer.
* **Stat Grid (`DashboardStatGrid.tsx`)**: High-level telemetry displaying Active Goals count, Completed Goals count, Current Streak (days), and Shipping Velocity pace.
* **Activity Chart (`DashboardChart.tsx`)**: 7-day bar chart displaying daily completions and logged actions.
* **Recent Activity Feed (`DashboardRecentActivity.tsx`)**: Real-time event stream showing milestone completions, tracker increments, and coach check-ins.
* **Calendar Panel (`CalendarPanel.tsx`)**: Visual monthly and weekly grid marking target deadlines, scheduled check-ins, and overdue warnings.
* **Reports Panel (`ReportsPanel.tsx`)**: Detailed breakdown of completion rates across domains (Engineering, Sales, Fitness, Mindset, Learning).

---

## 10. Third-Party Integrations & OAuth Authentication

Located in [`src/utils/auth.ts`](./src/utils/auth.ts) and [`src/components/settings/Integrations.tsx`](./src/components/settings/Integrations.tsx):

### OAuth Handlers
* **GitHub Integration**: Authorizes read-only repository activity (commits, pull requests, issues) to automatically increment engineering goals.
* **Google Calendar**: Connects user calendars to schedule check-in reminders and milestone deadlines.
* **Immediate Dashboard Redirection**: The `captureAuthFromUrl()` utility inspects incoming URL hashes and query parameters for tokens (e.g. Supabase `#access_token=...` or backend callback `?token=...`). It persists the session and routes users directly to `/dashboard` (or `/dashboard/integrations` if connecting a specific provider), avoiding landing page bounce.

### Future Roadmap Integrations (Slack & Notion)
* In accordance with product design rules, **Slack** and **Notion** remain visible in the Integrations catalog badged with a purple **`Future Implementation`** chip and status *"Scheduled for future release"*.
* Clicking their action card opens an interactive roadmap modal with a *"Notify Me When Live"* subscription confirmation rather than failing with broken network requests.

---

## 11. Legal, Compliance & User Trust

### Privacy Policy (`/privacy-policy`)
* **Data Sovereignty**: Affirms that personal goals, habit logs, and reflection entries belong exclusively to the user and are never sold or brokered.
* **AI Training Boundary**: Explicit guarantee that user entries are never used to train public or foundational AI models.
* **Audio Processing Protection**: Confirms that speech dictation is processed in-memory without persistent biometric voiceprint retention.
* **User Rights**: Clear provisions for exporting data and requesting permanent account deletion.

### Terms of Service (`/terms-of-service`)
* **Acceptable Use**: Guidelines prohibiting system scraping, reverse-engineering, harassment, or prompt exploitation.
* **Productivity Disclaimer**: Clarifies that AI Coach advice is strictly for productivity and habit accountability, not certified medical, legal, or financial counsel.
* **Cross-Linking**: Accessible from landing page footers, signup agreement notices, and privacy documentation.

---

## 12. Environment Configuration & Build Pipelines

### Environment Variables (`.env`)
```bash
# Backend REST API endpoint (Django on Render)
VITE_API_URL=https://ontrack-api-web.onrender.com

# Supabase Auth configuration
VITE_SUPABASE_URL=https://destcakvqdzhkzemdugo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_kT5JCbb2BFocdW23HIJYfw_jk879gsk
```

### Build & Run Commands

```powershell
# Install dependencies
npm install

# Start local development server (HMR on http://localhost:5173)
npm run dev

# Run TypeScript type check and production bundle compilation
npm run build

# Preview production build locally
npm run preview

# Run ESLint validation
npm run lint
```

---

*Documentation maintained by the OnTrack Engineering Team.*
