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
- [x] Flagship polish batch: tokens, a11y roles/labels/states, error/loading/empty states, copy, dead code, splits (David) — `a8eb2ae`
- [x] `/docs` route wired + DashboardChatPanel honest proactive copy (David)

## In progress

- [ ] Supabase redirect allowlist: `ontrack://auth` + Expo dev URL (Owner — dashboard, 5 min; without this, mobile OAuth lands on web)
- [ ] EAS preview APK rebuild with bundle fix (Owner runs `eas build --platform android --profile preview`)
- [ ] Fresh Qwen tunnel URL from owner Brev env (Owner) → verify live parse → chat lights up

## Done — revival build (mobile)- [x] OAuth receiver `app/auth.tsx` + global URL listener (cold/deferred deep links)
- [x] OAuth separation: login swaps session, integrations vault provider tokens (no more sign-in hijack/hang); exp:// dev URLs accepted; auth screen never hangs
- [x] Custom `+not-found` ("You are off track" + sitemap) + web NotFound upgrade
- [x] Floating dock tab bar with joined center action (Duolingo-style)
- [x] Signup redesign (hero, social-first, pending-goal chip, Original Surfer)
- [x] Chat intent router (greeting/clarify/status/progress/goal), honesty badges, busy guards, starters, daily brief, TTS autoplay, timestamps
- [x] Integrations connect (GitHub + Calendar scopes via vault) + full settings map
- [x] Celebration pass (confetti, streak flicker, TTS equalizer) + Original Surfer display font
- [x] Round 2: 5-tab dock (Home/Goals/Chat-center/Settings/You), Profile tab, headerless chat, composer dock clearance, expressive type expansion, integration detail screens (repos/commits/PRs, calendar sync, capability toggles, sync-to-goal), staggered lists
- [x] OAuth separation fix: login-only session swap, warm-path vaulting, exp:// dev URLs, no-hang auth screen
- [x] Mockup updated (dock, signup, 404, font preview)
- [x] Bug-fix round (device feedback): animated BackdropArt backgrounds (onboarding/auth), explicit placeholder colors on all inputs, streak View/Text nesting fix, work-block pause-in-place, signup email-confirmation gate, onboarding tracker preview, TTS prefetch + 8s fast fallback, optimistic progress with rollback, canned-fallback badge, package quality-gate scripts
- [x] Fullness round 2: visible animated backdrops (stronger blobs/dots), onboarding overhaul (1.3x art, captions, 34px titles, big dots), type scale wave 2 (40 greeting, 36 headers, 17 body/button, 22 cards, 17 chat)
- [x] OTA updates: expo-updates installed, runtimeVersion appVersion policy + updates URL in app.json, preview/production channels in eas.json, `lib/updates.ts` check/download/restart hook, Settings → App updates card with progress bar, `update:preview` / `update:production` scripts
- [x] OAuth separation fix: single-owner redirect claims (warm vs cold double-processing), integration connects never swap the login session, duplicate-POST tolerance, mode-aware error routing, allowlist redirect printed in errors
- [x] Web parity visuals: dot-grid canvas base in BackdropArt (24px / 0.14 alpha), full backdrops on auth + onboarding, dots on Home/Goals/Settings; web press physics (sink 2px → 1px shadow) on PillButton/SocialButton/GoalCard-adjacent
- [x] Auth screens: shared BrandMark, true Google G + GitHub mark icons (ProviderIcons), SocialButton primitive, login redesigned social-first to match signup
- [ ] Dock draggable pill: plan in `artifacts/dock-pill-plan.md` — AWAITING APPROVAL, not implemented
- [ ] Home goal cards: 4 concepts (A Verdict / B Ticket / C Week strip / D Coach) in mockup — AWAITING PICK
- [x] Concept C shipped as type-aware cards: counters get week-strip + inline −/+ stepper with toast feedback, checklists get tap-to-check rows, manuals get entries + Log entry CTA; all cards carry time-remaining
- [x] Dock pill implemented (Underpass, live-scrub, chat glow ring) + GestureHandlerRootView at root; needs fresh preview build (native dep)
- [x] OTA verify pass: fixed stuck downloading flag pre-reload; config reviewed (channels preview/production, appVersion runtime) — device checklist in chat
- [x] Toasts: native Reanimated toast system (`lib/toast.tsx`, goey-toast-inspired API, maxQueue drop-oldest, actions) mounted at root; foreground notifications arrive as toasts
- [x] Reminders/alarms: `lib/reminders.ts` local scheduling (cadence nudges, 8am streak ping, per-goal deadline alarms), quiet-hours-safe daytime triggers, permission-gated toggles, passive resync on goal changes
- [x] Hackathon gaps closed (mobile-side): time-remaining on cards, quick-log from card, swipe-to-delete on Goals, check-in cadence wired to real nudges, deadline alarms, sync status everywhere
- [x] RefreshArc: chunky arc→tick sync mark on Home + Goals (Reanimated+SVG, no three.js — documented why in code)
- [x] Absorbed teammate merges (legal pages, voice/integrations overhaul, audio plugin): no conflicts, tsc clean, backend consumes new serializer fields

## Left — Web (Eniola unless noted)

- [ ] Dashboard stat grid: switch local computation to backend `dashboard.stats` once Evans ships serializer enrichment (plan §16)

## Left — Mobile (David/Israel)

- [ ] Device pass: mic dictation, TTS playback, work-block timer on real hardware
- [ ] Android app-blocking implementation (approved scope — see blocking plan §4)
- [ ] Settings "Focus & blocking" section (after blocking lands)

## Left — Backend (Evans)

- [x] Serializer enrichment PARTIAL: `current_value` + `progress_logs` shipped — mobile consumes them (remaining: `unit`, `template_context` on goal list)
- [ ] REGRESSION (teammate merge `c4fd9df`, 2026-09-28): 3 backend tests fail —
  `test_es256_without_jwks_url_is_401` (200 not 401: ES256 accepted without JWKS,
  possible fail-open), `test_create_goal_ai_raise_still_201_manual` (got
  `checklist`, expected `manual` fallback), `test_create_goal_bad_deadline_ignored_not_fatal`
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

## AI liveness check (2026-09-28)

- Cloudflare Qwen tunnel (`jay-tomorrow-blessed-composite.trycloudflare.com`):
  **DEAD** — DNS no longer resolves (`getaddrinfo failed`).
- Mobile backend `/api/health`: **UP** (`{"status":"ok","instance":"mobile"}`, ~1s).
- NVIDIA direct (`integrate.api.nvidia.com/v1`): **reachable** (HTTP 200, no key
  needed for `/models`) — viable if Evans sets `NVIDIA_API_KEY` on Render.
- Unknown: what `NVIDIA_BASE_URL` the Render mobile instance currently holds.
  Chat revival is ON HOLD until a live model endpoint is confirmed.
- 2026-09-28: tunnel revival runbook delivered to owner (Brev terminal → vLLM →
  cloudflared → URL to Evans). Awaiting fresh URL, then verify + build.
