# OnTrack — Master Documentation

> **Status:** Android preview live via Expo · Web app + landing live · iOS on roadmap
> **Period covered:** 27 Sep → 1 Oct 2026 · **163 commits** · Last verified: `6edea8f`
> **Author of this record:** David Ayonifemi Idowu (mobile lead), compiled with repo evidence (`git log`, `artifacts/task-tracker.md`).

---

## 1. What OnTrack Is

OnTrack turns plain-English goals into live trackers. Say *"I want to run 3 mornings a week"* and the app builds a counter, checklist, or log — then keeps count as you report back by chat or voice, checks in before deadlines, and delivers an honest verdict at the end.

Three surfaces, one product:

| Surface | Stack | Lives in |
|---|---|---|
| Web app | React + Vite + Tailwind, Fraunces/DM Sans | `web/` |
| Mobile app | Expo SDK 57, React Native, Reanimated, Expo Router | `mobile/` |
| Backend | Django + Supabase (auth DB), pgvector RAG coach | `backend/` |

Brand language (shared everywhere): turquoise `#00C4B3` + navy `#071E2D`, 2px navy borders, hard offset shadows (no blur glow), pill buttons that sink 2px on press, Original Surfer display type on mobile / Fraunces on web.

---

## 2. My Role in OnTrack

**David Ayonifemi Idowu — Mobile App Lead & Owner (85 of 163 commits).**

What that meant in practice:

- **Owned the entire Expo app end-to-end**: SDK upgrade, navigation, all 5 tabs, chat engine, trackers, OAuth, settings, reminders, OTA updates, EAS preview builds, device testing via Expo Go.
- **Design authority on mobile**: expressive type scale, tactile component system (`Card`, `PillButton`, `SocialButton`, `StatusPill`), motion system, animated backdrops, three.js showpiece — all mirrored in a living HTML mockup (`mobile/app-mockup.html`) kept in sync file-for-file with the implementation.
- **Integration point with backend**: consumed Evans' `/api/chat` contract (history + `draft_goal`), serializer fields (`current_value`, `progress_logs`), GitHub/Calendar integration stubs; filed precise backend gaps (failing tests, missing serializer fields, health-check flapping).
- **Security contributor**: wrote and verified the defense-in-depth Supabase RLS policy set; diagnosed the post-merge fail-open regression.
- **Release manager**: EAS preview channel, OTA update pipeline with in-app UI, demo videos (recorded, Drive-hosted, embedded), install QR code, `/app` showcase page.
- **Repo hygiene**: absorbed teammate merges without conflicts, kept `main`/`master` in sync, kept local-only files (`opencode.json`, E2E reports, tunnel credentials) out of git.

Teammates: **Mr Evans (Flames)** — backend (Django, auth, RLS deny-by-default, AI liveness, tests); **fluxaro (Israel)** — web frontend (RAG coach chat, trackers, legal pages, integrations context); **enniewealth209** — minor contributions.

---

## 3. Timeline

- **27 Sep** — Repo assembled (frontend → `web/`, Django → `backend/`). Backend foundations: check-in endpoint, Supabase env/JWKS.
- **28 Sep** — Web feature wave (RAG coach, legal pages, integrations). Mobile revival rounds: OAuth separation, 5-tab dock, chat engine. CI found green locally, red on GitHub (billing lock — see §5).
- **29 Sep** — Mobile depth: type scale, backdrops, onboarding overhaul, OTA pipeline, Concept-C cards, draggable dock pill, toasts, reminders, RefreshArc, RLS policies, three.js hero, tunnel runbook.
- **30 Sep** — Chat contract with server, session auto-refresh, dock crash fixes, pull-to-refresh on both tabs, thinking indicator v2, single-trip actions, web `/app` showcase page.
- **1 Oct** — Device-feedback rounds (pill overlap, gestures, toast dedupe, Fuel revamp, preview reel), card-tap/swipe fixes, Drive demo videos on landing + `/app`, autoplay fix, hero app pill, new Expo build link + themed install QR, interactive tour phones.

---

## 4. Mobile App — What Was Built

### Screens & flows
- **Splash → Onboarding (3 steps)** — three.js hero (twin extruded chevrons, orbiting proof-blocks) with flat-art fallback and reduced-motion single frame; live tracker preview; goal draft preview.
- **Login / Signup** — social-first, true Google G + GitHub marks, visible placeholders, pending-goal chip, email-confirmation gate.
- **Home** — greeting + streak flame, Today's Focus card, Daily Fuel (dark navy hero card: domain kicker, Surfer headline, Log-a-win + shuffle, position dots), goals shortcut.
- **Goals** — active/completed sections, native pull-to-refresh, per-row left-swipe Delete with confirm, explicit details chevron per card (cards deliberately **not** tappable).
- **Chat** — client intent router (greeting / clarify / status / progress / goal), honesty badges (offline/fallback), starter chips, morning brief, TTS autoplay, dictation inline in composer, command center (settings/alarms/theme/navigation with revert phrases), SOURCES chips, staged thinking indicator.
- **Goal detail (modal sheet)** — per-template headers (incl. GitHub-style repo panel with week strip), `TrackerBody`, check-in, work-block entry, finalize + verdict with share.
- **Settings** — profile, audio, check-in cadence, notifications + quiet hours, focus timer entry, integrations (GitHub/Calendar connect via vault), export, theme (light/dark/teal), OTA update card with progress, sign out.
- **You** — profile stats, quick links incl. Preview Features reel (sharing, GitHub worktree, Notion, fitness, app-blocking concepts).
- **Work-block, Voice, Integration detail, Preview Features, Auth receiver, Off-track 404.**

### Systems
- **Floating dock**: one shared pill glides between measured tab stops, drag-to-navigate with duck-under center Chat island, glow-ring home.
- **GoalCard v2**: type-aware (counter week-strip + stepper, checklist tick rows, manual log button), PaceDial ring-vs-needle, slim by design.
- **Toast system**: native Reanimated, dedupe-shake on repeat events, stacking for distinct events, actions, max-queue drop-oldest.
- **Reminders**: cadence nudges, 8am streak ping, per-goal deadline alarms, quiet-hours-safe, permission-gated.
- **Store**: stale-while-revalidate with SecureStore cache (instant paint), optimistic progress with rollback, session auto-refresh on 401 with single-flight retry.
- **OTA**: `expo-updates`, appVersion runtime policy, preview/production channels, in-app check/download/restart UI. JS-only updates ship without store round-trips.

---

## 5. Problems Faced → Solutions

| # | Problem | Solution | Proof |
|---|---|---|---|
| 1 | EAS bundle builds failed silently | Root-caused: root `.gitignore` `lib/` rule excluded `mobile/lib/` from uploads. Fixed with a negation — rule documented as never-to-remove | commits Sep 29 |
| 2 | OAuth redirect claimed twice (warm vs cold), hijacking login sessions | Single-owner redirect claims; login/integration session separation; provider tokens vaulted, never swapped into session | `lib/auth.ts`, `app/auth.tsx` |
| 3 | Dock pill drop crashed release builds | Worklets may only touch shared values: moved nearest-stop math to React-land, worklet only `scheduleOnRN`s a state update | `_layout.tsx` header comment |
| 4 | React 19.3.0 vs Expo-expected 19.2.3 | Kept 19.3.0 (downgrade broke npm resolution), silenced via install exclude | — |
| 5 | `expo-av` dead weight | Replaced with `expo-audio` + config plugin; SVG+Reanimated illustrations instead of Skia so Expo Go keeps working | — |
| 6 | Goals: swipe-to-delete felt dead, taps fired on release | `friction={2}` halved finger travel so swipes never crossed threshold → `friction={1}`, threshold 32, tap-suppression window on swipe-open | `039d091` |
| 7 | Goals: scroll only worked from side gaps | Custom pull-pan `GestureDetector` wrapped the list and fought it for touches → removed on Goals; native `RefreshControl` owns refresh, list owns scroll, rows own swipes | `d97f29f` |
| 8 | Cards swallowed taps / ambiguous tap targets | Stripped tap from cards entirely; explicit chevron + overflow links navigate to details | `d97f29f` |
| 9 | Toasts stacked duplicates annoyingly | Same-event dedupe: visible twin shakes + timer restarts; distinct events still stack (max 3) | `lib/toast.tsx`, `b9c9a18` |
| 10 | Pill border overlapped tab labels | Resized pill 52² → 60×40, re-seated on icon row; labels fully clear | `b9c9a18` |
| 11 | Videos needed a tap to start | React sets `muted` as attribute; browsers gate autoplay on the DOM property → ref sets `el.muted = true` + `play()` | `ec1db8e` |
| 12 | Drive web demo wouldn't stream in `<video>` | Verified with headers: Drive serves a confirm page for that file → automatic fallback to Drive preview iframe | `DriveVideo.tsx`, `8f9230c` |
| 13 | GitHub Actions fail in ~5s | "Account locked due to billing" — no code fix possible; documented, all 3 jobs verified green locally | `task-tracker.md` CI note |
| 14 | Cloudflare Qwen tunnel died (DNS) | Diagnosed venv-vs-system-python mismatch; locked winning vLLM launch recipe (flashinfer 0.6.18, eager, ctx 2048) in runbook + tmux/UptimeRobot | `artifacts/local/tunnel-runbook.md` |
| 15 | RLS fail-open regression after teammate merge | 3 backend tests failing (ES256-without-JWKS 200, wrong fallback, fatal deadline) — flagged to Evans with test names | task tracker §Left |
| 16 | OTA export failure | Scoped updates to `--platform android` (no web bundle) | — |
| 17 | Local `master` drifted 7 commits behind | `push origin main:master` only moved remote → fast-forwarded local branch; all four refs now equal at `6edea8f` | session 1 Oct |

---

## 6. Feats

- **Revival**: took a stalled scaffold to a shippable Android preview (SDK 57, 5 tabs, chat, trackers, OTA) in ~5 days.
- **Zero-native OTA pipeline**: JS-only fixes reach devices without rebuilds, with progress UI in Settings.
- **Gesture correctness**: measured-stop dock pill, friction-tuned swipe-to-delete, tap-vs-swipe disambiguation — all from real device feedback.
- **Honest AI UX**: every fallback badged, staged thinking indicator, elapsed timers — the app never pretends.
- **Security**: owner-scoped RLS + TRUNCATE revocation, verified in dashboard.
- **Showcase**: `/app` page with streaming demos, themed install QR (decode-verified), and 7 live interactive tour phones visitors can actually tap.
- **Mockup discipline**: `app-mockup.html` mirrors the implementation file-for-file, including rejected Concept A/B/D proposals.

---

## 7. Web Work (by me)

- `/app` showcase: hero with Expo download CTA + install QR, app demo video, 7-stop interactive tour (now **live**: working steppers, checklists, chat, sign-in, push sim, OTA sim), roadmap, final CTA.
- Landing: "See it in action" web-demo video section, hero Android-app pill, footer/nav cross-links.
- `DriveVideo` component: Drive-streamed `<video>` with iframe fallback, muted-autoplay fix, reduced-motion respect.
- Install QR (`public/expo-qr.png`): navy-on-white, EC-H, decode-verified to the `ccaa1b65` build URL.

---

## 8. Still Open / Roadmap

- **Owner (you)**: fresh preview build per release; Supabase redirect allowlist (`ontrack://auth`); fresh tunnel URL; device pass (mic, TTS, haptics); demo video refresh as features land.
- **Mobile**: Android app-blocking implementation (plan approved: `artifacts/app-blocking-plan.md`); Focus & blocking settings section; iOS Screen Time (parked).
- **Backend (Evans)**: serializer enrichment remainder (`unit`, `template_context` on goal list); FocusSession/BlockedSelection endpoints; GitHub commit sync beyond stub; Render health 503 flapping; 3 failing tests from §5.15.
- **Ops**: GitHub billing unlock → CI re-run; Vercel env check per web push; 90-sec demo video cut.

---

## 9. Ship Commands

```powershell
# Type checks / builds
cd mobile; npx tsc --noEmit
cd web; npm run build

# Preview build (owner runs)
eas build --platform android --profile preview

# OTA, JS-only (matching runtime)
eas update --branch preview --platform android --message "..."

# Keep branches together
git push origin main; git push origin main:master
```

## 10. Key File Map

- `mobile/app/(tabs)/` — Home, Goals, Chat, Settings, You, floating dock `_layout.tsx`
- `mobile/components/GoalCard.tsx` — type-aware cards (not tappable by design)
- `mobile/lib/` — `auth.ts` (OAuth+vault), `store.tsx` (cache/SWR), `toast.tsx` (dedupe-shake), `reminders.ts`, `updates.ts`, `speech.ts`
- `mobile/app-mockup.html` — living design mirror + rejected concepts
- `web/src/pages/MobileApp.tsx` — showcase + live tour · `Landing.tsx` — landing + web demo
- `web/src/components/DriveVideo.tsx` — streamed demos · `web/public/expo-qr.png` — install QR
- `artifacts/` — `task-tracker.md`, `app-blocking-plan.md`, `app-revival-plan.md`, `dock-pill-plan.md`, `demo-video-flow.md`, `supabase-rls-policies.sql`, `local/` (git-ignored)
