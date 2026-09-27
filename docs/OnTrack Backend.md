*Evans — Backend Lead + Security*

*Scope:* Data models, all REST API endpoints, authentication, security hardening, dual Render deployment. Not touching AI prompts (David) or any frontend.

*Data Model (Postgres via Supabase, shared by both backend instances)*
- `Goal` — user_id, title, goal_type (counter/checklist/manual), target, domain, deadline, status, result_value
- `GoalItem` — checklist sub-items
- `ProgressLog` — goal_id, value, note, timestamp
- `CheckIn` — AI check-in message + user response
- `AudioCache` — cached TTS results by text hash

*Endpoints I own*
- `POST/GET /api/goals`, `GET/PUT /api/goals/:id`, `POST /api/goals/:id/finalize`
- `POST /api/progress`
- `GET /api/dashboard`
- `POST /api/tts`, `POST /api/asr` (thin wrappers — David's functions do the actual AI call)
- `GET /api/debug` (judge-facing, key-protected)
- `GET /api/health`

Standard error format everywhere: `{"error": "...", "code": "..."}`

*Auth*
Supabase issues the JWT on signup/login (frontend side). Django doesn't create its own auth — it just verifies the incoming JWT and pulls `user_id` from it. No local user table needed.

*Security (my scored differentiator)*
- Rate limiting on goal creation + voice input (abuse/cost surface)
- Input validation + sanitization before anything reaches Nemotron (prompt-injection defense)
- `/api/debug` gated by a separate access key, not open to the public
- Secrets only in env vars, never hardcoded, never logged
- CORS locked to actual Vercel/Expo origins, no wildcard
- Every AI call failure (Nemotron/TTS/ASR) falls back gracefully — never blocks a user action or 500s

*Deployment*
Same Django codebase, two Render instances (`ontrack-api-web`, `ontrack-api-mobile`), separate env vars, one shared Supabase DB. Migrations run from exactly one instance to avoid race conditions. Each instance independently deployable — one going down doesn't touch the other.

*What I need from David by end of Sprint 1*
Function signatures for `parse_goal()`, `generate_checkin()`, `generate_verdict()`, `text_to_speech()`, `speech_to_text()` — I plug these into my endpoints as soon as I have the shapes.

*What I need from Chioma/Eniola/Israel*
Nothing blocking yet — I'll have all endpoints returning dummy JSON by end of Sprint 1 so you can start wiring against the real API contract immediately instead of waiting on Nemotron integration.