# OnTrack — Backend API Endpoints Specification (`backendendpoint.md`)

> **Lead Architect / Backend:** Evans  
> **Frontend Integration:** Chioma, Eniola, Israel  
> **AI / Prompts Lead:** David  
> **Version:** 1.0.0 (Production & Hackathon API Contract)  
> **Base URL:** `/api/` (Deployed on Render: `https://api.ontrack.app/api` / Local: `http://127.0.0.1:8000/api`)

---

## 1. Architectural Overview & Protocols

### 1.1 Authentication & Authorization
- **Mechanism:** Supabase Auth (JWT).
- The frontend logs in/signs up directly via Supabase Auth and receives an access token (`JWT`).
- Every authenticated request to the Django backend MUST include the header:
  ```http
  Authorization: Bearer <supabase_jwt_token>
  ```
- **Backend responsibility:** Django verifies the incoming JWT signature against the Supabase JWT secret and extracts the `user_id` (`sub` claim). No local password/user table is required in Django.

### 1.2 Headers & Content Types
- `Content-Type: application/json` (for all JSON endpoints)
- `Content-Type: multipart/form-data` (for audio upload `/api/asr`)
- `Accept: application/json`

### 1.3 Universal Error Format
All endpoints MUST return standard error responses on HTTP `4xx` and `5xx` statuses using this exact shape:

```json
{
  "error": "Human-readable description of what went wrong.",
  "code": "ERROR_CODE_IDENTIFIER"
}
```

#### Standard Error Codes:
| HTTP Status | Error Code (`code`) | Meaning |
|---|---|---|
| `400` | `INVALID_PAYLOAD` | Missing required fields or malformed data |
| `400` | `VALIDATION_FAILED` | Target is non-numeric, deadline in past, or invalid type |
| `401` | `UNAUTHORIZED` | Missing or invalid Supabase JWT |
| `403` | `FORBIDDEN` | Attempting to access another user's goal |
| `404` | `GOAL_NOT_FOUND` | Goal with the specified ID does not exist |
| `404` | `CHECKIN_NOT_FOUND`| Check-in ID does not exist |
| `429` | `RATE_LIMIT_EXCEEDED`| Rate limit exceeded on AI goal creation / voice ASR |
| `500` | `AI_SERVICE_ERROR` | Nemotron/TTS/ASR call failed (fallback gracefully applied) |
| `500` | `INTERNAL_ERROR` | Database or unhandled server exception |

---

## 2. Core Data Models (Postgres / Supabase)

```
┌────────────────────────────────────────────────────────┐
│                        Goal                            │
├────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                          │
│ user_id (UUID / String, Indexed)                       │
│ title (VarChar 255)                                    │
│ description (Text, Nullable)                           │
│ goal_type ('counter' | 'checklist' | 'manual')         │
│ target (Numeric / Integer, Default 1)                  │
│ current_value (Numeric, Default 0)                     │
│ unit (VarChar 50, e.g. 'deals', 'tasks', 'km')         │
│ domain ('sales'|'engineering'|'fitness'|'mindset'|...) │
│ deadline (Date, YYYY-MM-DD)                            │
│ status ('active' | 'completed' | 'paused' | 'failed')   │
│ result_value (VarChar 100, Nullable)                   │
│ created_at (Timestamp)                                 │
│ updated_at (Timestamp)                                 │
└───────────┬────────────────────────────────┬───────────┘
            │ 1:N                            │ 1:N
┌───────────▼────────────┐       ┌───────────▼───────────┐
│       GoalItem         │       │      ProgressLog      │
├────────────────────────┤       ├───────────────────────┤
│ id (UUID, PK)          │       │ id (UUID, PK)         │
│ goal_id (FK -> Goal)   │       │ goal_id (FK -> Goal)  │
│ title (VarChar 255)    │       │ value (String/Numeric)│
│ completed (Boolean)    │       │ note (Text, Nullable) │
│ order (Integer)        │       │ timestamp (Timestamp) │
└────────────────────────┘       └───────────────────────┘
            │ 1:N
┌───────────▼────────────┐       ┌───────────────────────┐
│        CheckIn         │       │      AudioCache       │
├────────────────────────┤       ├───────────────────────┤
│ id (UUID, PK)          │       │ id (UUID, PK)         │
│ goal_id (FK -> Goal)   │       │ text_hash (VarChar 64)│
│ ai_message (Text)      │       │ audio_url (VarChar)   │
│ user_response (Text)   │       │ duration (Float)      │
│ status ('pending'|...) │       │ created_at (Timestamp)│
│ verdict_preview (Text) │       └───────────────────────┘
│ timestamp (Timestamp)  │
└────────────────────────┘
```

---

## 3. Complete Endpoint Reference

### 3.1 Authentication & Session
#### `GET /api/auth/me`
Fetches current authenticated profile verified from the Supabase JWT.

- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "user_id": "usr_94b1a8f2",
    "email": "israel@ontrack.app",
    "name": "Israel",
    "accountability_persona": "Nemotron High-Accountability Coach",
    "timezone": "GMT+1"
  }
  ```

---

### 3.2 Goals (`/api/goals`)

#### `GET /api/goals`
Retrieves all goals belonging to the authenticated user.

- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `status` *(optional)*: `active` | `completed` | `paused` | `failed` | `all` (default: `all`)
  - `goal_type` *(optional)*: `counter` | `checklist` | `manual`
  - `domain` *(optional)*: `sales` | `engineering` | `fitness` | `learning` | `mindset` | `general`
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "goal-1",
      "user_id": "usr_94b1a8f2",
      "title": "Close 5 Enterprise Deals",
      "description": "Outreach to top 20 SaaS prospects and close 5 contracts.",
      "goal_type": "counter",
      "target": 5,
      "current_value": 3,
      "unit": "deals",
      "domain": "sales",
      "deadline": "2026-10-05",
      "status": "active",
      "created_at": "2026-09-20",
      "items": [],
      "progress_logs": [
        {
          "id": "log-3",
          "goal_id": "goal-1",
          "value": 3,
          "note": "Finalized enterprise agreement with HyperScale Labs",
          "timestamp": "2026-09-26 16:45"
        }
      ],
      "check_ins": [
        {
          "id": "ci-1",
          "goal_id": "goal-1",
          "ai_message": "Israel, you are at 3 out of 5 deals with 8 days remaining.",
          "user_response": "Sent proposal to CloudCore today.",
          "timestamp": "2026-09-26 09:00",
          "status": "responded",
          "verdict_preview": "Pacing strong. If CloudCore converts, only 1 more deal needed."
        }
      ]
    }
  ]
  ```

---

#### `POST /api/goals`
Creates a new goal record (typically following conversational AI parsing).

- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Ship OnTrack Web Frontend MVP",
    "description": "Complete onboarding, chat, dynamic trackers, and dashboard in React.",
    "goal_type": "checklist",
    "target": 4,
    "unit": "milestones",
    "domain": "engineering",
    "deadline": "2026-10-02",
    "items": [
      { "title": "Tactile Neo-brutalist Design System & Tokens", "order": 1 },
      { "title": "Desktop-first 5-Step Onboarding Flow", "order": 2 },
      { "title": "Conversational Chat & Voice Mic Architecture", "order": 3 },
      { "title": "Interactive Goal Workspace (Counter, Checklist, Manual)", "order": 4 }
    ]
  }
  ```
- **Validation Rules:**
  - `title`: String, min 3 characters, max 255.
  - `goal_type`: Must be one of `['counter', 'checklist', 'manual']`.
  - `target`: Positive number (> 0).
  - `deadline`: Must be a valid date `YYYY-MM-DD` (equal to or after today).
- **Response `201 Created`:**
  ```json
  {
    "id": "goal-2026092701",
    "user_id": "usr_94b1a8f2",
    "title": "Ship OnTrack Web Frontend MVP",
    "description": "Complete onboarding, chat, dynamic trackers, and dashboard in React.",
    "goal_type": "checklist",
    "target": 4,
    "current_value": 0,
    "unit": "milestones",
    "domain": "engineering",
    "deadline": "2026-10-02",
    "status": "active",
    "created_at": "2026-09-27",
    "items": [
      { "id": "it-1", "title": "Tactile Neo-brutalist Design System & Tokens", "completed": false, "order": 1 },
      { "id": "it-2", "title": "Desktop-first 5-Step Onboarding Flow", "completed": false, "order": 2 },
      { "id": "it-3", "title": "Conversational Chat & Voice Mic Architecture", "completed": false, "order": 3 },
      { "id": "it-4", "title": "Interactive Goal Workspace (Counter, Checklist, Manual)", "completed": false, "order": 4 }
    ],
    "progress_logs": [],
    "check_ins": []
  }
  ```

---

#### `GET /api/goals/:id`
Retrieves a single goal with full relation tree (all sub-items, progress ledger, check-ins, verdict).

- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:** Full `Goal` object.
- **Response `404 Not Found`:**
  ```json
  {
    "error": "Goal with id 'goal-99' not found.",
    "code": "GOAL_NOT_FOUND"
  }
  ```

---

#### `PUT /api/goals/:id`
Updates goal parameters, status, or checklist sub-items.

- **Method:** `PUT`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body (partial fields allowed):**
  ```json
  {
    "title": "Ship OnTrack Web Frontend MVP (Updated)",
    "current_value": 2,
    "items": [
      { "id": "it-1", "title": "Design System", "completed": true, "order": 1 },
      { "id": "it-2", "title": "Onboarding Flow", "completed": true, "order": 2 },
      { "id": "it-3", "title": "Chat & Voice", "completed": false, "order": 3 },
      { "id": "it-4", "title": "Goal Workspace", "completed": false, "order": 4 }
    ]
  }
  ```
- **Response `200 OK`:** Updated `Goal` object.

---

#### `DELETE /api/goals/:id`
Archives or deletes a goal.

- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "message": "Goal successfully deleted.",
    "id": "goal-2026092701"
  }
  ```

---

#### `POST /api/goals/:id/finalize`
Concludes a goal, evaluates execution against target and deadline, calls Nemotron AI to generate a comprehensive verdict score, summary, and recommendation, and marks status as `completed` or `failed`.

- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{}` (empty or optional `{ "user_closing_note": "Finished final demo" }`)
- **Backend Action:**
  1. Computes `score = min(100, round((current_value / target) * 100))`.
  2. Sets `passed = score >= 80`.
  3. Calls David's `generate_verdict(goal)` using NVIDIA Nemotron 70B.
  4. Updates goal status to `completed` if `passed`, else `failed`.
- **Response `200 OK`:**
  ```json
  {
    "id": "goal-1",
    "title": "Close 5 Enterprise Deals",
    "status": "completed",
    "current_value": 5,
    "target": 5,
    "result_value": "5/5 deals",
    "verdict": {
      "score": 100,
      "passed": true,
      "summary": "Outstanding execution! Target met 100% ahead of deadline with strong pipeline velocity.",
      "recommendation": "Maintain outreach momentum; consider expanding target deal size by 20% for Q4.",
      "date": "2026-09-27"
    }
  }
  ```

---

### 3.3 Progress Updates (`/api/progress`)

#### `POST /api/progress`
Logs progress against any goal format (Counter, Checklist, or Manual Reflection).

- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "goal_id": "goal-1",
    "value": 4,
    "note": "Signed contract with CloudCore ($22k ARR)"
  }
  ```
  *(For checklist goals, `value` can be `"3/4 milestones complete"`; for manual reflection goals, `value` can be the sentiment rating like `"Laser Focused"` and `note` is the reflection text).*
- **Backend Action:**
  1. Creates a `ProgressLog` row.
  2. Increments/updates `current_value` on the parent `Goal`.
  3. If `current_value >= target`, automatically marks goal `status: 'completed'`.
  4. Increments user active streak count.
- **Response `201 Created`:** Updated `Goal` object with new log prepended.

---

### 3.4 AI Accountability Check-Ins (`/api/checkins`)

#### `POST /api/goals/:id/checkins/generate`
Triggered automatically by background cron or manually requested by user.

- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Backend Action:** Calls David's `generate_checkin(goal)` using Nemotron AI to evaluate days left, velocity pace, and ask a targeted accountability question.
- **Response `201 Created`:**
  ```json
  {
    "id": "ci-2026092702",
    "goal_id": "goal-1",
    "ai_message": "Israel, you have 3 days left and need 1 more deal to hit 5. What is your primary blocker today?",
    "status": "pending",
    "timestamp": "2026-09-27 10:30"
  }
  ```

---

#### `POST /api/goals/:id/checkins/:checkin_id/respond`
Submits user reply to an active accountability check-in.

- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "user_response": "Negotiating legal terms with DataStack. Expecting signature by Thursday afternoon."
  }
  ```
- **Backend Action:**
  1. Stores `user_response`.
  2. Updates check-in status to `responded`.
  3. Calls Nemotron to generate `verdict_preview` acknowledging user's reply.
- **Response `200 OK`:**
  ```json
  {
    "id": "ci-2026092702",
    "status": "responded",
    "user_response": "Negotiating legal terms with DataStack. Expecting signature by Thursday afternoon.",
    "verdict_preview": "Nemotron noted: DataStack signature will fulfill target. Prioritize legal turnaround."
  }
  ```

---

### 3.5 Dashboard Overview (`/api/dashboard`)

#### `GET /api/dashboard`
Aggregated dashboard payload providing all metrics, active trackers, charts, and activity streams in a single performant query.

- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "stats": {
      "active_goals_count": 3,
      "completed_goals_count": 1,
      "streak_days": 7,
      "accountability_score": 94,
      "velocity_pace": "+24% Pace"
    },
    "active_goals": [
      {
        "id": "goal-1",
        "title": "Close 5 Enterprise Deals",
        "goal_type": "counter",
        "current_value": 3,
        "target": 5,
        "unit": "deals",
        "domain": "sales",
        "deadline": "2026-10-05",
        "status": "active"
      }
    ],
    "recent_activity": [
      {
        "id": "log-1",
        "goal_id": "goal-1",
        "value": 3,
        "note": "Finalized enterprise agreement with HyperScale Labs",
        "timestamp": "2026-09-26 16:45"
      }
    ],
    "weekly_chart": [
      { "day": "Mon", "date": "Sep 22", "completed_count": 2, "logged_count": 4 },
      { "day": "Tue", "date": "Sep 23", "completed_count": 1, "logged_count": 3 },
      { "day": "Wed", "date": "Sep 24", "completed_count": 3, "logged_count": 5 },
      { "day": "Thu", "date": "Sep 25", "completed_count": 2, "logged_count": 4 },
      { "day": "Fri", "date": "Sep 26", "completed_count": 4, "logged_count": 6 },
      { "day": "Sat", "date": "Sep 27", "completed_count": 3, "logged_count": 5, "isToday": true },
      { "day": "Sun", "date": "Sep 28", "completed_count": 1, "logged_count": 2 }
    ]
  }
  ```

---

### 3.6 AI Conversational Chat & Prompt Parsing

#### `POST /api/chat/parse-goal`
Transforms plain English conversational input (text or transcribed audio) into structured goal tracker parameters using NVIDIA Nemotron 70B.

- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "prompt": "I want to close 5 enterprise software deals before the end of next week",
    "conversation_history": [
      { "sender": "user", "content": "I want to set a sales goal" },
      { "sender": "ai", "content": "Great, how many deals and what is your timeframe?" }
    ]
  }
  ```
- **Backend Logic (David's `parse_goal()`):**
  Uses structured JSON output prompt with Nemotron 70B to extract:
  - `title`: string
  - `description`: string
  - `goal_type`: `"counter" | "checklist" | "manual"`
  - `target`: number
  - `unit`: string
  - `domain`: string
  - `deadline`: string (`YYYY-MM-DD`)
  - `suggested_milestones`: optional array of strings
  - `ai_response_text`: conversational feedback message
- **Response `200 OK`:**
  ```json
  {
    "ai_response_text": "Understood! I've structured this as a Counter Tracker with a target of 5 deals. I set a 14-day horizon with daily check-ins.",
    "goal_proposal": {
      "title": "Close 5 Enterprise Software Deals",
      "description": "Outreach, demos, and closing 5 enterprise client agreements.",
      "goal_type": "counter",
      "target": 5,
      "unit": "deals",
      "domain": "sales",
      "deadline": "2026-10-05"
    }
  }
  ```

---

### 3.7 Speech Synthesis & Recognition (TTS / ASR)

#### `POST /api/tts`
Synthesizes speech audio for Nemotron responses.

- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "text": "Israel, you are at 3 out of 5 deals with 8 days remaining.",
    "voice_type": "nemotron-direct",
    "voice_speed": 1.0
  }
  ```
- **Backend Action:**
  1. Computes `SHA-256` hash of `(text + voice_type + voice_speed)`.
  2. Checks `AudioCache` table. If cached, immediately returns cached URL.
  3. If cache miss, calls TTS API, uploads output to Supabase storage, writes to `AudioCache`, and returns public URL.
- **Response `200 OK`:**
  ```json
  {
    "audio_url": "https://storage.ontrack.app/audio/tts_a91b4c3.mp3",
    "duration": 3.8,
    "cached": true
  }
  ```

---

#### `POST /api/asr`
Transcribes spoken audio recorded from user's microphone.

- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data:**
  - `audio`: Binary audio file (`.wav`, `.webm`, `.mp4`, or `.ogg`)
- **Backend Action:**
  Sends audio to ASR speech-to-text pipeline (David's `speech_to_text(audio)`).
- **Response `200 OK`:**
  ```json
  {
    "text": "I want to close 5 enterprise software deals before the end of next week",
    "confidence": 0.98
  }
  ```

---

### 3.8 Settings & Connected Integrations

#### `GET /api/settings`
Fetches user settings for Audio, Notifications, Profile, and Integrations.

- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "profile": {
      "name": "Israel",
      "email": "israel@ontrack.app",
      "accountability_persona": "Nemotron High-Accountability Coach",
      "timezone": "GMT+1"
    },
    "audio": {
      "voice_type": "nemotron-direct",
      "voice_speed": 1.0,
      "tts_enabled": true,
      "asr_enabled": true
    },
    "notifications": {
      "master_enabled": true,
      "goal_reminders": true,
      "check_ins": true,
      "goal_updates": true,
      "streak_alerts": true,
      "sound_enabled": true
    },
    "integrations": [
      { "id": "google-cal", "name": "Google Calendar", "connected": true, "status_label": "Syncing at 08:00 AM" },
      { "id": "slack", "name": "Slack", "connected": false, "status_label": "Not connected" },
      { "id": "notion", "name": "Notion", "connected": true, "status_label": "Connected to Personal Workspace" },
      { "id": "github", "name": "GitHub", "connected": false, "status_label": "Not connected" }
    ]
  }
  ```

#### `PUT /api/settings`
Updates audio, notification, or profile preferences.

- **Method:** `PUT`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body (partial update):**
  ```json
  {
    "audio": {
      "voice_type": "accountability-coach",
      "voice_speed": 1.15
    }
  }
  ```
- **Response `200 OK`:** Updated settings object.

---

### 3.9 Diagnostics & Operational Health

#### `GET /api/health`
Health check for Render instances and uptime probes.

- **Method:** `GET`
- **Headers:** None required
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-27T11:40:00Z",
    "database": "connected",
    "version": "1.0.0"
  }
  ```

#### `GET /api/debug`
Judge-facing debug inspection endpoint (gated by secret key as specified by Evans).

- **Method:** `GET`
- **Headers:** `X-Debug-Key: <SECRET_DEBUG_KEY>`
- **Response `200 OK`:**
  ```json
  {
    "service": "ontrack-api-web",
    "environment": "production",
    "active_connections": 14,
    "nemotron_status": "operational",
    "tts_cache_size": 248,
    "rate_limits": {
      "goals_per_hour": 30,
      "voice_minutes_per_hour": 15
    }
  }
  ```

---

## 4. Security, Sanitization & Performance Directives

As specified in Evans' backend architecture:

1. **Input Sanitization against Prompt Injection:**
   - Any raw text passed into `prompt` or `user_response` MUST be scrubbed of delimiter attacks before forwarding to Nemotron (e.g. stripping `"""system`, `Ignore previous instructions`, etc.).
2. **Rate Limiting:**
   - Goal creation: maximum 30 goals / hour per user.
   - Voice ASR / TTS: maximum 20 requests / 5 minutes per user to prevent API cost abuse.
3. **Graceful Degradation:**
   - If NVIDIA Nemotron or external TTS/ASR is unavailable or times out (> 4.5s), the API MUST NOT return HTTP 500. It MUST fall back gracefully to standard deterministic response templates.
4. **CORS Headers:**
   - Allowed origins:
     - `http://localhost:5173` (Vite dev)
     - `http://127.0.0.1:5173`
     - Production Vercel/Render frontend URLs.
   - Disallow wildcard `*` with credentials.
