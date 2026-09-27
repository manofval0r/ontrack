# OnTrack — Django backend (Evans: models, API, auth/security, deploy)

## Start the server (local dev)
```sh
pip install -r requirements.txt
cp .env.example .env   # then fill in real values (see below)
python manage.py migrate
python manage.py runserver
```

## Run all smoke tests
```sh
./scripts/run_smoke.sh
```
Runs `scripts/smoke_auth.py` (13 JWT checks) + `python manage.py test`
(36 endpoint/hardening tests, isolated test DB).

## Database — Supabase pooled connection (port 6543)
Both Render instances share one Postgres via the pooler URL:
```
DATABASE_URL=postgres://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```
Use the **service_role** pooler connection (full read/write, bypasses RLS —
needed for the unmanaged `profiles` read), not the anon/JWT-scoped one.
Confirm once David sends the string.
Local dev without Supabase falls back to SQLite automatically. Migrations were
verified against real PostgreSQL 16 (native `uuid` PKs, `jsonb` parse_result).

## Deployment — one image, two Render instances
Same repo + same Dockerfile, behavior differs only by env vars:

| Instance | INSTANCE_NAME | RUN_MIGRATIONS | notes |
|----------|---------------|----------------|-------|
| web      | web           | true           | runs migrations on boot |
| mobile   | mobile        | false          | skips migrations (no race) |

Required env vars per instance: `DJANGO_SECRET_KEY`, `DJANGO_SETTINGS_MODULE=
config.settings.prod`, `DATABASE_URL`, `SUPABASE_JWT_SECRET`,
`DEBUG_ACCESS_KEY`, `ALLOWED_ORIGINS`, `ALLOWED_HOSTS`.

## User data — Supabase owns identity
No Django user model, no local users table. Supabase `auth.users` is the
source of truth; Django stores only `user_id` UUIDs. The teammate-owned
`public.profiles` table is read via an **unmanaged** model
(`apps/accounts/models.py`, `managed = False` — migrations ignore it) with
the confirmed real schema (`id`, `display_name`, `email`, `streak`,
`total_goals`, `completed_goals`, `created_at`, `updated_at`). `GET
/api/dashboard` includes `"profile": {"streak", "total_goals"}` and returns
nulls (not zeros) if the table/columns/row are unreachable — a missing row
never fakes a 0.

## Auth
Supabase issues HS256 JWTs; Django verifies with `SUPABASE_JWT_SECRET` and
reads `sub` (UUID) as `request.user_id`. No local user table. Failures return
`{"error","code":"AUTH_INVALID"}` (401), never 500. `/api/health` is public;
`/api/debug` uses `X-Debug-Key`, not JWT.

## AI seam (David's territory)
`apps/ai_module.py` holds importable stubs with the exact agreed signatures:
`parse_goal(goal_text) -> dict {goal_type, target, domain, deadline, summary}`,
`generate_checkin(goal_id, goal_data, current_progress) -> str` (no endpoint
calls it yet), `generate_verdict(goal_id, goal_data, final_progress) -> str`,
`text_to_speech(text) -> str` (TTS endpoint caches by text hash),
`speech_to_text(audio_file: bytes) -> str` (ASR is one-shot, never cached).
Views validate + fall back on any failure — AI can never block goal
creation/finalize, and TTS/ASR degrade to 503 `AI_SERVICE_ERROR`.
Replace stub bodies, keep signatures.
