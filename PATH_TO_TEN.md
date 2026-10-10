# Path to Ten: OnTrack as a Chat-First Ecosystem
**Date:** 10 Oct 2026 · **Companion:** `STARTUP_AUDIT_REPORT.md` (the scores) — this is the route.
**Thesis:** stop being a goal tracker with chat attached. Become the chat layer that runs a person's entire follow-through life: goals, proof, witnesses, stakes, verdicts — every integration reporting into one conversation.

---

## 0. The four signature systems (everything hangs off these)

| # | System | Stolen from | Why it wins |
|---|---|---|---|
| 1 | **The Board**: Pending → Active → Done, WIP-limited | Personal Kanban (2 rules: visualize work, limit WIP) + Jira | Fights the #1 failure mode (10 ambitious goals at once). WIP limit of 3 active goals IS the retention mechanic. |
| 2 | **Proof graph**: every goal fed by automatic evidence | Beeminder autodata (dozens of integrations + Zapier/IFTTT doing the work) | Kills self-report lies; frictionless logging is Beeminder's proven retention unlock. |
| 3 | **Witnesses & stakes**: referees, supporters, pledge ladder | stickK (RCT: ~50% success vs 10% usual care; referees binding; 19.5% of forfeits = revenue) | Only mechanics with clinical proof. Social cuts churn 30–50%. |
| 4 | **Verdicts**: post-deadline judgment with teeth | Nobody (your exclusive edge) | Turns endings into beginnings: verdict → next contract. Solves the 16% "goal achieved, churn" segment. |

Chat is the OS all four live in (WeChat/ClawBot pattern: agent as contact, services as mini-programs, conversation > push — Telegram mini-app notifications hit 80% open vs 3–5% push).

---

## Pillar 1 — Market demand: 8 → 10
**10 looks like:** owning a named wedge inside the $1–3B habit market instead of floating in it.
- **Name the wedge**: "verified follow-through" — every competitor tracks; only you *prove*. All copy, onboarding, and App Store keywords rewritten around proof, witnesses, verdicts.
- **Two-lane positioning**: consumers get warmth (Finch lesson: gentle, characterful, never guilt-tripping); performers get teeth (Beeminder lesson: bright lines, pledges). One app, two tones, switched by goal type — never mixed in one screen.
- **Acceptance:** top-10 App Store keywords for "accountability" + "commitment contract" owned; landing converts cold traffic at ≥8% signup (measure it — currently unmeasured).

## Pillar 2 — Differentiation: 4 → 10
**10 looks like:** three things competitors structurally can't copy without rebuilding.
1. **Proof-native goals** (§Pillar 8 + integration matrix below): a goal whose progress bar moves because GitHub/Health/Todoist said so. StickK can't (manual reports), Finch won't (warmth brand), Habitica doesn't (game loop).
2. **Verdict engine**: every deadline ends in a scored post-mortem (pace vs plan, proof coverage, witness confirmations) that drafts the *next* contract in one tap. Turns endings into retention.
3. **Chat as control plane**: settings, integrations, stakes, referees ALL operable from conversation ("block Twitter till Friday", "raise my pledge to $30", "add Ada as referee") — WeChat-mini-program depth, nobody in the genre has it.
- **Acceptance:** a reviewer can describe OnTrack without saying "goal tracker" or "habit app."

## Pillar 3 — Retention: 3 → 10
Layer all four proven mechanics — no single one retains everyone:
1. **WIP-limited Board** (Personal Kanban): max 3 Active. Fourth goal waits in Pending with a visible queue. Overwhelm is *structurally impossible*. Weekly Friday review ritual (Pluralsight pattern: 15-min retrospective → Done column empties → pride + reset).
2. **Witnesses**: every Active goal prompts one referee (binding confirm, stickK model) or supporter (cheer-only). Referee confirm required to close high-stakes goals. Feed of witness activity = the 30–50% churn cut.
3. **Stakes ladder**: $0 → $5 → $10 → $30 → $90, capped, charity/anti-charity routing (stickK proved anti-charity motivates hardest). Only ~23% will opt in (NBER data) — that's fine; they're your highest-LTV segment.
4. **Verification**: autodata first, manual second, referee third. Self-report always flagged "unverified" in UI — social pressure against lying without calling anyone a liar.
5. **Anti-achieved-churn**: verdict screen's single CTA is the next contract (drafted, one tap). The 16% who'd leave after winning never see an exit.
- **Acceptance:** D30 retention ≥15% (5× category median), D90 ≥10%, witness-users churn 30%+ below solo users (instrument both from day one).

## Pillar 4 — Monetization: 2 → 10
Three rails, shipped in order:
1. **Plus ($35/yr, Finch-priced)**: unlimited goals, advanced analytics (pace graphs, proof coverage), themes, widgets. Warmth-tier, broad funnel.
2. **Pledge rails (Beeminder economics)**: Stripe-held stakes, 19.5% of forfeits as revenue (stickK's published cut), anti-charity routing. High-LTV niche, self-selecting.
3. **Teams/B2B seat ($6 PEPM, Woliba-priced)**: only after Pillar 5's foundation — manager analytics, corporate referees, rewards (stickK Corporate precedent: employers assign referees + fund rewards).
- **Guardrails**: per-user AI token budgets ship WITH billing (audit §8: unthrottled TTS is your cost leak); entitlements enforced server-side, never client flags.
- **Acceptance:** blended ARPU ≥ $4/mo within 12 months of Plus launch; pledge revenue tracked separately as proof the teeth work.

## Pillar 5 — B2B: 2 → 10 (12-month fuse, prep now)
- **Now (no build)**: keep `org_id`-shaped hole in data model; write every goal event to an append-only log (future admin analytics feed); fix the landing lie ("data stays in browser").
- **Month 6**: Teams v1 — shared board (Jira-style: Pending/Active/Done columns per team), corporate referees, rewards pool. Price $6 PEPM, min 10 seats.
- **Month 12**: HRIS-adjacent integrations (calendar-first: the buyer already lives in Google Workspace), engagement dashboard, DPA + encryption-at-rest + audit log = enterprise checklist.
- **Why it can win**: incumbents (Virgin Pulse/Personify) are office-worker-oriented and PEPM-bloated at 15–30% engagement; your wedge is verified-follow-through for performance cultures (sales orgs, agencies, gyms — stickK Corporate's exact segments).
- **Acceptance:** 3 paying teams ≥10 seats by month 12; SOC2-Type-I-ready posture (encrypted vault, audit log, DPA template).

## Pillar 6 — Craft: 7 → 10
- **Board UI**: the Goals tab becomes the Kanban — Pending / Active (WIP 3, counter in header) / Done columns as swipeable lanes on mobile, drag columns on web. Cards keep the tactile system; column headers carry the counts. This is the Jira/Kanban ask, adapted: Jira's power is *states + WIP*, not its chrome.
- **Motion**: adopt emil-design-eng rules project-wide — transform/opacity only, ≤300ms UI, custom ease-out curves, origin-aware popovers, stagger 30–80ms, `@starting-style` enters, reduced-motion keeps fades. One audit pass over chat.tsx/settings.tsx/_layout.tsx.
- **Purge**: delete dead dashboard/layout/navs (~600 lines), dedupe Login/Signup + 3 goal parsers, kill/replace fake social + preview-reel shipping as real, purge "Israel" fixtures, fix landing copy, resize logo/favicon/mockup, route-split (React.lazy) — every item already evidenced in the audit.
- **Phone design language**: Original Surfer display + tactile cards stays; add empty-state illustrations parity web/mobile.
- **Acceptance:** zero dead routes, LCP <2.5s on landing, keyboard-only pass on all core flows, no hardcoded personal data in repo.

## Pillar 7 — Foundation: 3 → 10
In dependency order:
1. **Green harness**: fix backend venv (pgvector), smoke tests mobile/web, unblock CI billing. No feature work without a green build.
2. **Schema-validated boundaries**: zod (web) + zod-equivalent or io-ts style runtime checks (mobile) on every API payload; kill 100+ untyped `any` chains at store/api first.
3. **Offline outbox**: NetInfo + persisted mutation queue with auto-replay; SecureStore → AsyncStorage/SQLite for goal snapshots (SecureStore is for secrets).
4. **Latency budget**: embed+chat ≤ 30s gunicorn timeout — parallelize embedding with chat call, stream responses, circuit-break dead providers to instant fallback.
5. **Kill daemon-thread embeddings**: proper job queue (even in-process first, then worker); retry + backfill + metric.
6. **Spec freeze**: contract-from-traffic doc replaces backendendpoint.md drift; frontend/backend CI contract tests.
- **Acceptance:** 80%+ coverage on store/api/auth/chat-classifier, p95 chat <8s, zero silent data-loss paths (each covered by a regression test).

## Pillar 8 — AI: 4 → 10
- **One brain**: delete the client regex router; server owns intent (mobile sends text + history, renders what comes back). Thresholds can't disagree if they exist once.
- **Evals**: 50-case golden set (goal parses, status Qs, adversarial logs) run in CI; quality regressions block merge.
- **Injection hardening**: structured parsing (function-calling/JSON mode) instead of string-interpolated prompts; treat retrieved logs as untrusted data, never system text; strip control chars AND instruction patterns.
- **Cost architecture**: per-user token budgets, TTS cache keyed (text+voice+speed), ASR caching for repeats, kill the 33% base64 tax (multipart per spec).
- **Proactive agent** (WeChat pattern): scheduled check-ins via conversation (80%-open-rate channel), morning briefs generated server-side, escalation to referee when user goes dark.
- **Acceptance:** eval pass rate ≥90% in CI, prompt-injection red-team clean, AI cost/user/month known to the cent and under $0.50 free-tier.

## Pillar 9 — Trust: 2 → 10 (P0, before everything)
1. Tokens vault-only, never localStorage; encrypt `access_token`/`meta` at rest (KMS); rotate-and-expire flow.
2. Every mutation: server truth or explicit error + queued retry. Delete every silent fork (list them from the audit: web create/update/delete/log/settings ×5).
3. Append-only event log per user (powers future admin analytics + dispute resolution on stakes).
4. Honest states: unverified/manual badges, "waiting for proof" states, sync status everywhere.
5. Privacy story that survives reading: fix copy, publish data-flow doc, DPA template ready.
- **Acceptance:** external security review finds no P1s; you can demo airplane-mode logging without losing a byte.

## Pillar 10 — Execution: 9 → 10
- Keep the velocity; add the guardrails: green CI gating merges, golden-eval gate, weekly device-pass ritual, metrics dashboard (D1/D7/D30, witness-rate, proof-coverage, ARPU) reviewed every Monday.
- Bus factor: docs (this file + audit + runbooks) mean a new hire ships week one. The 10th point is *sustainable* speed: tests + CI + contracts so 163-commit months don't compound risk.

---

## Integration matrix — "every single integration," sequenced not simultaneous

**Rule (Beeminder's lesson): build the webhook + Zapier/Make channel FIRST; native integrations only where proof-quality demands it.**

| Wave | Integrations | Why this order |
|---|---|---|
| 0 | Generic webhook-in (`POST /proof`), Zapier + Make + IFTTT apps | Every future integration rides free; platforms do the work (Beeminder's "quantum leap"). |
| 1 (proof-grade native) | Health Connect / Apple HealthKit, GitHub (finish: commits→checks), Todoist, Google Calendar | Highest proof value per build cost; calendar is also the B2B wedge. |
| 2 | Strava, RescueTime-style screen-time (Android UsageStats), Duolingo, YNAB-style finance (read-only) | Fitness + focus + learning + money = the four goal arenas. |
| 3 | Slack (team witness channel), Notion (verdict export, real sync), Spotify (focus sessions)? | Ecosystem depth; Slack doubles as B2B land-and-expand. |
| Never (say it) | Anything requiring credential types you can't vault securely; anything without a dispute path for stakes. |

Each integration ships with: proof-coverage badge in UI, dispute flow (referee override), and a chat command ("sync my runs", "what did Strava see?").

## Phased roadmap

- **Q4 2026 (P0):** Trust sprint (vault, outbox, green harness, injection hardening) + Board UI + WIP limits + verdict engine v1. Kill list executed.
- **Q1 2027:** Witnesses + stakes ladder + Plus tier + webhook/Zapier channel + Wave-1 natives. First ARPU. D30 ≥10%.
- **Q2 2027:** Proactive agent, evals ≥90%, Wave-2 natives, Friday-review ritual, Teams private beta. D30 ≥15%.
- **Q3 2027:** Teams GA ($6 PEPM), compliance posture, pledge rails scale. B2B fuse lit.

## What NOT to do (anti-list)
- No new surfaces (no iOS, no watch, no desktop) until D30 ≥15%.
- No B2B build before Plus + witnesses prove retention.
- No automation without dispute paths — stakes + unverifiable proof = support hell + chargebacks.
- No warmth/teeth mixing in one screen — Finch users flee dread; Beeminder users distrust softness.
- No feature that can't be operated from chat — if it needs a settings page, it's not ecosystem, it's an app.
