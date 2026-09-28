# OnTrack Task Tracker

Live checklist. Mark `[x]` when done; keep one line per task with owner + proof.
Updated: 2026-09-28.

## Done (verified)

- [x] Web OAuth hash parser + mock-token guard (David) — `GoalContext`, `App.tsx`
- [x] Web voice Done-button real-transcript fix (David)
- [x] Web dashboard empty state + real goal cards (David)
- [x] Backend `goal_template` + `template_context` + GitHub settings stub (Evans) — live-verified
- [x] Backend real TTS/ASR wiring, stub strings gone (Evans)
- [x] Mobile Expo SDK 52 → 57, `expo-av` → `expo-audio` (David) — boots on :8081
- [x] Mobile brand splash/logo, animated onboarding, motion pass, GitHub OAuth button (David)
- [x] Mobile template goal detail, chat dictation, icons, FAB fix (David)
- [x] EAS preview config + project linked (David) — `eas build --platform android --profile preview`
- [x] App-blocking research → Android-scoped plan (David) — `artifacts/app-blocking-plan.md`
- [x] Web mock-identity cleanup: sidebar/TTS-test name, dashboard fake stats, voice-empty behavior (David)

## In progress

- [ ] Supabase redirect allowlist: `ontrack://auth` + Expo dev URL (Owner — dashboard, 5 min)
- [ ] Apple Family Controls request forms ×4 (Owner — portal, weeks of lead time)

## Left — Web (Eniola unless noted)

- [ ] Dashboard stat grid: replace `*150/*120/850` scalers with backend `dashboard.stats` (blocked on Evans serializer note in plan §16)
- [ ] DashboardChatPanel: honest proactive copy (no fabricated "since yesterday" claims)
- [ ] Chat fallback proposal: infer goal_type from keywords instead of always `manual`
- [ ] `/docs` route: page exists, unreachable — wire `Route path="/docs"` + nav link
- [ ] Remove `mock_*_oauth_token` dev fallbacks in Login/Signup (dead code vs `ProtectedRoute`)

## Left — Mobile (David/Israel)

- [ ] Device pass: mic dictation, TTS playback, work-block timer on real hardware
- [ ] Android app-blocking implementation (approved scope — see blocking plan §4)
- [ ] Settings "Focus & blocking" section (after blocking lands)
- [ ] EAS preview APK build + install test (Owner runs `eas build --platform android --profile preview`)

## Left — Backend (Evans)

- [ ] Serializer enrichment: computed `current_value`, last-20 `progress_logs`, `unit`; `template_context` on goal list (plan §16)
- [ ] FocusSession + BlockedSelection tables/endpoints (after plan approval)
- [ ] GitHub activity sync beyond connect stub (commits → progress); Calendar event sync scope answer (connect-only today)
- [ ] Render deploy both instances + `/api/health` + `/api/debug` verification

## Left — Product/Ops (Owner)

- [ ] 90-second demo video (web + mobile per plan §11)
- [ ] Project card submission
- [ ] Vercel env vars + deploy check after each web push
- [ ] GitHub Actions: UNBLOCKED only after billing lock cleared (see CI note below)

## CI note (2026-09-28)

All 3 jobs pass locally (backend 54 OK incl. ES256, web build OK, mobile `tsc` OK;
lockfiles in sync). GitHub runs fail in ~5s with **"account is locked due to a
billing issue"** — no code fix possible. Clear billing, then re-run failed jobs.
