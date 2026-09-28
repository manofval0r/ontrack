# OnTrack App Revival Plan — research + design (NO BUILD YET)

Status: PLAN ONLY. Nothing below is implemented. Review, cut, approve — then build in order.
Date: 2026-09-28 · Scope: mobile app (Expo SDK 57) + web verify + backend diagnostics.
Constraint from owner: mobile is our territory — make it interactive and immersive;
web font/territory untouched; no emoji anywhere; Original Surfer for display on mobile.

Evidence used: your 3 screenshots (floating + button gap, `ontrack://auth` Unmatched
Route, Duolingo-style joined-FAB reference), `mobile/app-mockup.html`, backend
`apps/goals/views.py:491-508` (canned manual fallback), mobile `lib/auth.ts`
(no URL listener, no `auth` route), mobile settings (text-only integration rows).

---

## 1. OAuth redirect — root cause, nailed

**What your screenshot proves:** expo-router rendered its default Unmatched Route page
for `ontrack://auth`. That means the deep link REACHED the app (Supabase allowlist
works — token was very likely issued) but the app has nowhere to receive it:

- There is no `mobile/app/auth.tsx` route, and no `Linking` URL listener anywhere
  in the app (verified by search). Any delivery of `ontrack://auth` as navigation —
  cold start, or Android handing the Custom Tab redirect to the activity as an
  intent instead of returning it to `openAuthSessionAsync` — can only 404.
- `openAuthSessionAsync` + `maybeCompleteAuthSession()` only covers the warm
  browser-session path. The cold/deferred paths are unhandled.

**Fix (S):**
- Add `mobile/app/auth.tsx`: parses `access_token`/`refresh_token` (hash AND query
  forms) from the incoming URL via `useLocalSearchParams` + `Linking.parse`,
  calls `setSession()`, then `router.replace('/(tabs)')`; shows error state with
  retry if tokens are absent.
- Add a global `Linking.addEventListener('url')` handler (in `_layout`) that
  forwards any `ontrack://auth*` URL to the same parser — covers intents that
  arrive while the app is already open.
- Keep the existing `openAuthSessionAsync` flow untouched (it handles the warm path).
- Regression test matrix: Google + GitHub × (fresh install / logged-out return /
  app killed mid-flow) × (Expo Go dev / preview APK).

**Verify on web (S):** web sends `redirect_to=<origin>/dashboard` and `GoalContext`
parses `#access_token` from the hash. Confirm on the Vercel build: (a) Google login
lands on `/dashboard` with `ontrack_token` set; (b) inspect whether Supabase returns
`?code=` (PKCE) instead of `#access_token` (implicit) — if `code` appears, web needs
a code-exchange call added. Report which form arrives before building anything.

## 2. Signup screen redesign (M)

Today: centered card, 3 inputs, 3 stacked buttons — "plain and sad". Redesign:
- **Hero header:** logo mark + Original Surfer headline ("Join the shipped-it club"),
  subline with real value prop; animated mark draw-in (reuse OnboardingArt motif).
- **Social first:** Google + GitHub as two tactile side-by-side buttons with brand
  glyphs (Ionicons `logo-google`/`logo-github`), divider ("or continue with email"),
  then the email form. Matches user behavior (social is the happy path).
- **Pending-goal banner:** when arriving with `pendingGoal`, show it as a mini
  tracker chip ("First up: …") instead of small teal text.
- **Micro-motion:** staggered field entrances, button press springs, error shake
  (Reanimated, transform-only, reduced-motion respected).
- Keep: validation, password hint, pending-goal handoff, SecureStore session.

## 3 + 4. Tab bar: taller, joined center FAB (M)

Your screenshots: bar looks compressed, FAB floats detached with a dead gap.
Target the Duolingo reference: 4 tabs + a raised center action fused into the bar.
- Custom `tabBar={(props) => <FloatingDock/>}` in `(tabs)/_layout.tsx`: height
  ~76px + safe-area inset, 2px navy border, 20px radius, 4px offset shadow.
- Center slot is NOT a nav link: a 60px turquoise circle, overlapping the bar by
  ~18px top, with ring highlight and press-spring → routes to `/(tabs)/chat`
  (chat creates goals; voice modal stays reachable from the composer).
- Active tab: turquoise pill background + icon pop (replace the 4px top rail,
  which reads compressed at small heights); inactive: navy outline glyphs.
- Labels 11px semibold stay; add `accessibilityState={{selected}}` per tab.
- Mockup `app-mockup.html` interactive phone gets the same dock.

## 5. Chat: from canned replies to a real conversational main (L, the core bet)

**Why "hi" always gets the manual-goal message (three stacked causes):**
1. Backend `ChatParseGoalView` (`views.py:502-503`): ANY parse failure or malformed
   AI output returns the identical canned string "Got it — I set this up as a
   manual goal…" — including for greetings that were never goals.
2. If the mobile Render instance lacks working NVIDIA env (key/base URL), EVERY
   call raises → fallback every time. Check `ai_fallback_used` + `/api/debug`
   before assuming client bugs.
3. Mobile `send()` catch shows a manual-style proposal for every error, and
   `activate()` fires goal creation with no busy guard.

**Chat revival design:**
- **Intent router (client, cheap; model stays server-side):** greeting/small-talk
  → personality reply, never a tracker; vague input ("get better") → clarifying
  question with quick-reply chips ("Fitness?", "Study?", "Work?"); goal-like →
  existing parse flow; progress-like ("did 15 pushups") → log flow already in
  DashboardChatPanel — port it here; "how am I doing" → summary from dashboard
  data; check-in threads per goal.
- **Honesty layer:** surface `ai_fallback_used` as a subtle "offline mode" badge
  on AI messages; offline proposals labeled device-only; retry affordance on
  errors; `activate()` busy guard (no double goals).
- **Qwen linkage (Evans):** confirm mobile-instance env (`NVIDIA_BASE_URL`,
  `NVIDIA_MODEL_NAME=qwen2.5-coder-7b-instruct`, key) returns real parses;
  log one `/api/debug` trace per intent class as acceptance proof.
- **Use cases to build toward:** template gallery ("start from sales/fitness/
  study"), streak celebrations, verdict cards with share, voice-first mode
  (continuous dictation), per-goal check-in threads, suggested-prompt carousel,
  daily brief ("today's focus" auto-message on open).
- **Design tweaks:** typing indicator with coach avatar, message timestamps on
  long-press, swipe-to-retry on failed sends, proposal cards with template icon
  + animated fill, TTS auto-play toggle in header.

**Integrations (M):** settings rows are inert text today. Plan: per-provider
Connect buttons — GitHub via OAuth web flow (`WebBrowser`) exchanging code
through a backend vault endpoint (`POST /api/integrations {provider, access_token,
meta}` — Evans; vault table exists in backend models, confirm endpoint wiring);
show connected state with repo/branch (already returned by settings stub).
- **Google Calendar (easy win, reuse client ID):** add `scope=https://www.googleapis.com/auth/calendar.events`
  to the Supabase authorize URL, store the provider token server-side; use cases:
  (a) deadline → calendar event with reminders on goal creation; (b) check-in
  nudges as events honoring quiet hours; (c) verdict/share summary export;
  (d) streak milestones as all-day events. Backend: token vault field + 2–3
  Calendar proxy endpoints (same pattern as Slack/Notion proxies). UI: connect
  toggle + "sync deadlines" switch + per-goal "add to calendar" action.

**Settings content map (M):** Profile (avatar, name, stats row: goals/shipped/
streak), Appearance (theme: system/light/dark — wire the existing tokens!),
Audio (TTS/ASR/speed/voice pick), Coach (check-in frequency, TTS auto-play),
Notifications (reminders, deadlines, quiet hours), Focus & blocking — Android
(see blocking plan; iOS parked), Integrations (GitHub/Google Calendar/Slack/
Notion with real Connect states), Data (export JSON, delete account), About
(version, build, legal, diagnostics shortcut), Sign out (destructive styling).

## 6. "You are off track" unmatched-route screens (M)

- **Mobile `app/+not-found.tsx`:** replaces expo-router's default. Full-screen navy,
  Original Surfer headline "You are off track.", animated SVG scene (lost arrow
  mark re-drawing itself in a loop, floating dots), copy line ("This page wandered
  off the plan — let's get you back."), primary "Back on track" (router.back with
  fallback to `/(tabs)`), secondary grid: Home / Chat / Goals / Settings pills,
  mini-sitemap list of all routes, support link. Reduced-motion static fallback.
- **Web:** upgrade existing `NotFound.tsx` to the same concept (CSS keyframes,
  no new deps — web territory stays dependency-frozen): same headline, sitemap
  of real routes (`/`, `/docs`, `/dashboard`, `/chat`, `/goal/:id`, `/settings`),
  search box filtering the sitemap, back + home actions.

## 7. Fullness system: font, motion, playfulness (M, cross-cutting)

- **Font:** add `@expo-google-fonts/original-surfer` (`Original_Surfer_400Regular`)
  via `expo-font`/`useFonts`; use for display accents ONLY — splash wordmark,
  section headlines, big numbers, empty-state titles, verdict headlines, work-block
  timer. Body stays DM Sans, data stays Fraunces. Never body copy (legibility).
  (Web font untouched per owner constraint.)
- **Motion language (@animate):** hero moment = goal-completion celebration
  (confetti burst + haptic + verdict card spring); feedback = press springs
  everywhere (already partially in); transitions = shared-element goal card →
  detail (Reanimated `sharedTransitionTag`), modal slide+fade; delight = streak
  flame flicker, empty-state float, onboarding loops (exist), TTS equalizer bars
  on playing messages; guidance = coach typing pulse, FAB attention nudge on
  empty home (once per install). All behind `useReduceMotion`; transform/opacity
  only; no bounce/elastic easings.
- **Density:** populate bare screens (settings map above, goals sections, activity
  feed on detail), skeleton shimmers retained, never blank screens.

## 8. Suggested build order + sizes

1. `app/auth.tsx` + URL listener + web verify (S) — unblocks all OAuth testing.
2. Custom `+not-found` mobile + web NotFound upgrade (M).
3. Tab dock + joined FAB + signup redesign + Original Surfer wiring (M).
4. Chat intent router + honesty layer + busy guards (M); Qwen env confirm (Evans, S).
5. Integrations connect buttons + Calendar scopes/plan with Evans (M).
6. Settings content fill (M).
7. Celebration/motion pass (M).

Open questions for owner: (a) confirm Qwen model name/env on the mobile Render
instance; (b) Calendar: deadlines auto-sync on, or opt-in per goal?
