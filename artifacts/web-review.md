# Web Review — ranked issues for the full-stack web dev

Owner: full-stack web guy. Mobile and backend are out of scope here — do not touch.
Source: master-review of `web/` (3 specialist passes + lead validation reads).
Status: OPEN. None of these are fixed — implement, then check off.

## Critical

### 1. OAuth callback stores unvalidated tokens — session fixation via crafted link
**File:** `web/src/utils/auth.ts:29-31`
`captureAuthFromUrl()` writes any `#access_token=` value straight to
`ontrack_token` — no JWT shape check, no `mock_` rejection. A link like
`/dashboard#access_token=<attacker-JWT>` plants the attacker's session in the
victim's browser. Fix: require 3-segment JWT (or successful
`profileFromAccessToken` decode) and reject `mock_` prefixes before persisting.

### 2. Supabase JWT saved as third-party provider token — credential confusion
**File:** `web/src/utils/auth.ts:37-42`
`stored[provider] = providerToken || access` — when Supabase returns no
`provider_token` (normal for Google), the user's **Supabase access JWT is filed
as the GitHub/Google credential** and later POSTed to `/api/integrations`.
Fix: only store when `providerToken` is truthy.

### 3. Counter double-count in offline fallback — corrupt progress math
**File:** `web/src/context/GoalContext.tsx:469-474`
Callers send **absolute** values, but the fallback adds again (5 + sent 7 = 12).
Fix: one contract — fallback sets `current_value = numVal` for counters.

## Major

### 4. `mapGoal` crashes on null, yields NaN, passes strings through
**File:** `web/src/services/api.ts:195-221` — entry guard, `Number.isFinite`
coercion, unwrap `{goals}` shapes.

### 5. `updateGoal` drops `current_value`, then fakes it back over server truth
**File:** `web/src/services/api.ts:346-369` — send `current_value`, drop the
override, rethrow auth failures instead of returning fake success.

### 6. Checklist writes diverge across three surfaces
**File:** `web/src/pages/GoalWorkspace.tsx:87-89`, `GoalDetailSlideOver.tsx:120-131`
Workspace logs a string + rewrites `target` per toggle; slide-over never writes
`progress_logs`. Fix: integer `completedCount` everywhere, one log policy, stop
clobbering custom targets.

### 7. Double-Activate creates duplicate goals
**File:** `web/src/components/chat/MessageBubble.tsx:112-123`, `ChatWindow.tsx:129-147`
No pending/disabled state. Fix: per-message activating state + idempotency.
(Note: `createGoal` never throws — returns local fallback — so failures also
"navigate" silently.)

### 8. Unhandled send path + null proposal builds bogus goals
**File:** `web/src/components/chat/ChatWindow.tsx:45-53,86-102`
No `isThinking` guard (suggestions bypass it); backend `goal_proposal: null`
(greetings) still builds a proposal card from user text. Fix: send guard +
`if (!goal_proposal)` text-only branch.

### 9. Stale cache-first goal loading, unsynced checklist state
**File:** `web/src/context/GoalContext.tsx:285-290`, `ChecklistTracker.tsx:11`
Cache hit never revalidates; tracker snapshots items once. Fix: background
revalidate + sync state from props.

### 10. OAuth `code` (PKCE) flow unhandled — silent social-login death
**File:** `web/src/pages/Login.tsx:73-91`, `Signup`, `utils/auth.ts:22`
No `response_type` requested, no `code` exchange. Fix: `grant_type=authorization_code`
exchange + session store.

### 11. Social logins get no refresh token — hourly logout persists for them
Authorize URLs request no offline access. Fix: `access_type=offline&prompt=consent`
(or PKCE) and verify `ontrack_refresh_token` post-OAuth.

### 12. `ProtectedRoute` isn't reactive — dead dashboard after purge
**File:** `web/src/App.tsx:30-34` — reads localStorage with no subscription.
Fix: reactive auth signal + redirect on `UNAUTHORIZED`.

### 13. Reset-password conflates tokens, leaks hash, drops rotation
**File:** `web/src/pages/ResetPassword.tsx:57-74,109-117` — recovery-only token,
`replaceState` cleanup, persist rotation, `.catch` on `res.json()`.

### 14. Hardcoded demo stats in `DashboardStats` + `AppLayout`
**File:** `DashboardStats.tsx:10-26` (`78`/`7`), `AppLayout.tsx:50,79-80`
(`/goal/goal-1`, streak `7`, `'+24% Pace'`). Derive everything, default `0`,
fallback path to `/dashboard/goals`.

### 15. Dashboard tracker cards mouse-only + dead branch
**File:** `DashboardCards.tsx:146-162` — line-45 early return makes the
`goals.length === 0` branch dead; cards are `div onClick`. Fix: `<button>`s,
delete one empty path.

### 16. Pointer-only controls (TopNav rows, squad/calendar rows, `Card` onClick)
**Files:** `Landing.tsx:426-429`, `DashboardTopNav.tsx:275-282,332-348,421-437`,
`CommunityPanel.tsx:127-134`, `CalendarPanel.tsx:290-294`, `Card.tsx:21-22`.
Fix: `<button>`s (or role+tabIndex+onKeyDown), `aria-pressed` on selects.

### 17. Toggles, labels, table semantics
**Files:** `AudioPreferences.tsx:40-68`, `Notifications.tsx:80-90`,
`Profile.tsx:49-101` (labels lack `htmlFor`/`id`),
`DashboardRecentActivity.tsx:236-253` (no caption/scope).

## Minor

- `mock_` tokens forwarded by `api.ts:74-77`/`isAuthenticated` — choke-point filter.
- Integration empty-token POST, double OAuth parsing, unconditional hash wipe.
- `CounterTracker.tsx:15` NaN on target 0; rapid taps silently dropped.
- ChatPanel failures banner-only (dead ambiguity retry); CheckIn silent; sentiment dropped.
- VoiceInput swallows `onerror`, no `onend` resync, finals joined without separator.
- `ProgressChart` blank on dateless entries + no empty state; `DashboardChart` bare axes.
- Palette strays (TopNav indigo, Notifications gray, ReportsPanel CSV-via-encodeURI, unscoped print, dialog without Escape, Modal without focus trap, Community fake partner stats, Landing demo numbers, placeholder handle).
- Copy drift (brand casing, check-in spelling), Onboarding unprotected + double-submit, auth JSON/validation gaps, drawer backdrop without Escape.

## Test coverage: FAIL (no framework in `web/`)
Minimum suite: mock-token rejection, crafted-hash rejection, parse-once + cleanup,
PKCE exchange, 401-refresh-retry (exactly 2 calls), dead-refresh purge, mapper
null-safety, progress integer contract, exactly-one-AI-reply, activate idempotency,
null-proposal branch, voice exactly-once, checklist cross-surface consistency,
stats-from-data, keyboard traversal, label association, async states, palette lint,
CSV unicode, navigation fallbacks.

Suggested fix order: 1 → 2 → 3 → 8 → 7 → 6 → 14 → 5 → 4 → 12 → rest.
