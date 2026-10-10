# OnTrack: Hackathon → Startup Audit
**Date:** 10 Oct 2026 · **Basis:** full codebase audit (mobile + web + backend, 3 auditors) + market research (7 searches, 2 rounds) · **163 commits, 3 contributors, 5 days**

## THE SCORES — one look

| # | Pillar | Score | One line |
|---|---|---|---|
| 1 | Market demand & timing | **8/10** | ~$1–3B habit-app market, ~10–15% CAGR; corporate wellness ~$110B. Demand is real. |
| 2 | Differentiation / moat | **4/10** | "Talk to your goal" now has 6+ shipped competitors. Only edges: proof-verification + verdicts — both half-built. |
| 3 | Retention mechanics | **3/10** | Runs on streaks + reminders — the exact mechanics the genre's 95% 3-month death rate already disproves. |
| 4 | Monetization path | **2/10** | No paywall, no pricing, no pledge rails. Nothing to charge for today. |
| 5 | B2B readiness | **2/10** | Real money ($4–6 PEPM) but needs org model, admin analytics, compliance. Product is 12+ months out. |
| 6 | Product craft | **7/10** | Genuinely good for its origin: tactile system, motion, honest AI states. Dragged down by dead code + fixtures. |
| 7 | Technical foundation | **3/10** | Demo-deep. Zero tests in all 3 repos, `any` at every boundary, real data-loss paths. |
| 8 | AI leverage | **4/10** | RAG wired, fallbacks honest — but client regex shadows the server, no evals, injection surface open. |
| 9 | Trust & data integrity | **2/10** | Silent local data forks, OAuth tokens in localStorage, plaintext credential vault. Worst category. |
| 10 | Execution velocity | **9/10** | 163 commits in 5 days, device-tested, absorbs merges cleanly. The team ships. |

**Verdict: worth reconstructing, not worth scaling.** Idea 8, product 3. The next build must fix trust + one retention mechanic + one paid tier, in that order. Everything else is polish on a leak.

---

## 1. Market demand — 8/10
- Habit-tracking apps: $1.05B (VerifiedMarketReports, 2025) to $2.79B (WiseGuy, 2025); forecasts $1.5–7.8B by early 2030s, CAGR roughly 5–15% depending on source. Direction unanimous: growing.
- Android ≈ 39–45% of usage — your Android-first build matches where the users are.
- Corporate wellness: $58B (2020) → ~$110B (2028) at ~8% CAGR; employee wellness software $6.3B → $12.5B by 2035.
- Deductions: market is fragmented, no dominant winner — an opening, but also proof nobody has cracked retention (see §3).

## 2. Differentiation — 4/10
- Direct "AI accountability chat" competitors already shipped: Habit Coach AI ($9–39/mo, voice calls), Habitten (100-day challenge), HabitCoach.ai, Accountability Coach AI (SMART framework), Streak AI (peer groups), AI Accountability Coach (per-goal coaches), Habit AI.
- Your claimed edge — *chat builds the tracker, zero setup* — is their headline too.
- Your two ACTUAL edges: **(a)** verification against real proof (GitHub commits — Beeminder proves auto-verified data is the retention unlock), **(b)** honest verdicts at deadlines (nobody else does post-mortems). Both are currently stubs: commit sync "beyond connect stub" is unbuilt; `STATUS_MISSED` is never written.
- Score says: you have a differentiation *thesis*, not a moat. The moat only exists if (a) and (b) ship.

## 3. Retention — 3/10 (the genre's graveyard)
- Benchmarks: ~50% of habit-app users gone week one, 77% by month one, 95% inactive by month three. Fitness apps keep 3–4% at day 30. Category churn ≈ 11%/month.
- Top cancellation reasons: lost motivation 43%, free alternatives suffice 25%, goal achieved 16%, subscription fatigue 11%.
- What actually retains: **social witnesses cut churn 30–50%**; financial stakes retain a niche deeply (Beeminder, profitable since 2011 on pledges alone, 4 staff); Habitica's RPG loop holds ~40% at 6 months (outlier).
- Your current mechanics — streak flame, reminders, toasts, confetti — are the industry's failed defaults. Your social layer is localStorage theater (web Community never hits network). Your stakes layer doesn't exist. Your verification layer is a stub.
- Brutal truth: nothing in the current product addresses the #1 churn driver. Reconstruction must pick ONE tooth: witnesses, stakes, or verification — evidence favors witnesses for breadth, stakes for depth.

## 4. Monetization — 2/10
- Benchmarks: category ARPU ≈ $6/mo; Finch does ~$1M/mo iOS revenue at $35/year (≈300K downloads/mo); Beeminder sustains a team on escalating pledges ($5→$10→$30→$90…) + $16–32/mo premium.
- You have: no paywall, no premium tier, no pledge rails, no billing provider, no entitlement system.
- The gap is also the opportunity: pledge-ladder code is ~2 tables + Stripe. But charging requires the trust fixes in §9 first — nobody puts a card in an app that loses data.

## 5. B2B — 2/10
- Buyers pay $4–6 per employee/month (Woliba price list), large enterprises dominate spend, and deals hinge on HRIS integrations (Workday, SAP), admin analytics, and engagement reporting. Entrants win on "bill on engagement" because average participation is 15–30%.
- Your blockers: no org/team data model, no admin console, plaintext third-party credentials in Postgres, no audit trail, no SOC2-adjacent posture, buyer-facing privacy story contradicted by your own landing copy ("data stays in browser" — false for logged-in users).
- Verdict: keep B2B as a slide, not a roadmap. Earliest honest entry: 12 months. Don't build anything now that blocks multi-tenancy later (keep a `org_id`-shaped hole in the data model).

## 6. Product craft — 7/10
- Real strengths: coherent tactile design system on both platforms, genuinely good dock/chat/motion work, honest AI states (badged fallbacks, staged thinking), a11y roles + reduced-motion respected, living HTML mockup most startups never bother with.
- Deductions: ~600 lines of dead web code (whole alternate dashboard + layout still maintained), 4 competing navs, hardcoded personal fixtures ("Israel") in production code, stale docs claiming the API "is staged next" when it's live, 2.5MB LCP image + 760KB unsplit JS + ~1.9MB of logo-as-PNG.
- Highest-craft item that ships to prod but is fake: Preview Features reel and Community social layer. Kill or label them before any public launch.

## 7. Technical foundation — 3/10
- Zero test files in mobile, web, and (runnable) backend — the committed backend venv can't even import pgvector, so 62 tests execute nowhere.
- `any` at every API/store boundary; backend payloads trusted blindly — a field rename breaks at runtime, silently.
- Latency budget (15s embed + 20s chat) exceeds the 30s gunicorn kill timeout → tail-latency 502s under exactly the degraded-provider conditions you need graceful fallback for.
- RAG embeddings ride fire-and-forget daemon threads: lost on every deploy, no retry, no backfill — the "AI memory" decays from day one with no metric showing it.
- Voice transport contradicts its own spec (base64-in-JSON ≈ +33% bloat); the TTS cache column physically cannot hold real TTS output (2KB column, ~50KB values).
- Settings endpoints echo defaults without persisting; dashboard/goal contracts drift from the spec doc — freezing the real contract from traffic is a prerequisite to any rewrite.

## 8. AI leverage — 4/10
- Credit: RAG over pgvector is actually wired (embed → top-5 → recency + goal metadata), fallbacks always return 200 with a flag instead of 500ing, TTS/ASR degrade to 503 honestly.
- Debits: a 821-line client regex brain shadows the server classifier (thresholds already disagree: 0.35 vs 0.3); the model endpoint has died before (tunnel DNS) with no health-gated UX; zero evals — no test asserts answer quality; prompt-injection "sanitization" is control-char stripping while goal titles/notes interpolate raw into prompts (stored injection re-served via RAG and exported to Notion).
- No per-user token budget; the unthrottled TTS endpoint is the most expensive one. One abusive user × free tier = your inference bill.

## 9. Trust & data integrity — 2/10, fix first
Ranked by user harm:
1. **Web silently forks data**: failed creates return fake `goal-{timestamp}` objects stored in one browser, shown as success, never retried. Users believe goals are saved; they exist nowhere else.
2. **OAuth tokens in plaintext localStorage** (web) + **plaintext credential vault** in Postgres (GitHub/Google/Slack/Notion) — any XSS or backup leak becomes account takeover.
3. **No offline story**: no queue, no outbox, no NetInfo. A subway ride eats logs; the streak product punishes users for the app's own gap.
4. No audit trail anywhere; export dumps raw internal JSON.

## 10. Execution — 9/10
- 163 commits / 3 people / 5 days, device-driven iteration, merges absorbed without conflicts, branches kept in sync, releases cut (Expo builds + OTA + QR + demos).
- Deduction of one point: velocity without tests or CI (billing-locked Actions) means speed compounds risk. Green the harness before the rebuild, not after.

---

## RECONSTRUCTION PLAN — sequenced, no blabber

**P0 — Trust (sprint 1–2). Nothing else matters until this is green.**
1. Kill silent forks: every mutation returns server truth or explicit failure; add offline outbox with auto-replay.
2. Secrets: tokens vault-only (never localStorage), encrypt `access_token`/`meta` at rest, kill hardcoded Supabase fallbacks.
3. Green harness: fix backend venv (pgvector), add smoke tests mobile/web, unblock CI billing.

**P1 — One retention tooth (sprint 3–4). Pick witnesses.**
1. Ship real accountability pairs/groups (the 30–50% churn-cut mechanic with broadest appeal).
2. Close the verification loop second: GitHub commit sync → auto-check checklist items.
3. Wire `STATUS_MISSED` + deadline enforcement so verdicts mean something.

**P2 — One paid tier (sprint 5).**
1. Finch-style $35/yr "Plus" (warmth + analytics + unlimited) OR Beeminder-style pledge ladder via Stripe. Not both. Plus first — broader funnel.
2. Entitlements + paywall UI; per-user AI token budgets at the same time (cost control).

**P3 — Cut the dead weight (parallel, cheap).**
Delete dead dashboard/layout/navs, dedupe Login/Signup + goal parsers, lazy-split routes, resize logo/favicon/mockup, purge personal fixtures, fix landing copy, freeze API contract from traffic.

**Explicitly deferred:** B2B (12 mo), app-blocking, iOS, quizzes. Keep `org_id` out of the way but don't build for it.

## Sources
- Market: GlobalGrowthInsights habit-tracking report; WiseGuy habit-tracker report; MarketIntelo outlook 2025–34; VerifiedMarketReports; RetentionCheck 2026 churn benchmarks; RawHabit retention analysis; RevenueCat usage-churn; Adjust reattribution; GlobeNewswire corporate wellness Feb 2026; WiseGuy employee-wellness software; GoPivot PEPM vs pay-for-performance; Woliba G2 pricing sheet.
- Competitors: beeminder.com/about + /money + help (pledge ladder, premium); stickK App Store listing; Habitica Tracxn + exit-report retention; finchcare.com + Sensor Tower estimates (300K dl / $1M iOS, 600K / $700K Android); habitcoachai.com, habitcoach.ai, habitten.com, accountabilitycoach.ai, streakai.app, Habit AI.
- Codebase: `mobile/`, `web/`, `backend/ontrack` audits 10 Oct 2026 (see auditor reports in session); `artifacts/task-tracker.md`; `git log` (163 commits).
