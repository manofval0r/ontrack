# Rebuild Timeline: Milestones, Checklists & the OpenRouter Brain
**Start:** 10 Oct 2026 · **Companion docs:** `STARTUP_AUDIT_REPORT.md` (scores) → `PATH_TO_TEN.md` (strategy) → **this file (execution).**
**Your guess was right: the model brain swap is Step 0.** It's config-level work that kills the dead-tunnel dependency and unblocks every AI feature. Details in §1.

## Ownership contract (read first)
- **David owns the entire rebuild** — backend, mobile, web, AI wiring, tests, releases. Every milestone below is David's unless a line says otherwise.
- **Evans owns exactly three things:** (1) Render dashboard env vars on request (values supplied by David, applied within 24h), (2) non-blocking backend advisory (reviews, Django-specific answers), (3) nothing on the critical path — **no milestone may depend on Evans-side code landing.** If an Evans item slips, David works around it and the timeline doesn't move.
- Standing env-var request list lives in §4. Evans applies; David verifies from the app side.

---

## §1. The hybrid brain — free OpenRouter models (researched Oct 2026)

### The lineup

| Layer | Role | Primary (free) | Fallbacks (free, in order) | Why |
|---|---|---|---|---|
| Router | intent + parse-goal proposals, structured outputs | `nvidia/nemotron-3.5-lightning:free` | `google/gemma-4-26b-a4b-it:free` | Fast, tools-capable, cheapest latency; classification doesn't need quality 58 |
| Coach | chat, check-ins, nudges | `qwen/qwen3.8-27b:free` | `nvidia/nemotron-3-ultra-550b-a55b:free` → `meta-llama/llama-3.3-70b-instruct:free` → `openrouter/free` | Qwen 27B is the top-rated free model (quality 58, 262K ctx, tools+vision). Nemotron-ultra keeps you in the family you know. Llama 3.3 70B is battle-tested. `openrouter/free` auto-filters for tool support as last resort |
| Deep reason | verdicts, weekly reviews | `thinkingmachines/inkling-small:free` | `thinkingmachines/inkling:free` | 1M context + reasoning; verdicts are rare and worth the latency |
| Embeddings | RAG vectors | paid `openai/text-embedding-3-small` @ 384 dims | free `liquid/lfm-2.5-embedding-350m:free` later | **Dimension trap:** your pgvector column is 384-dim; LFM emits 1024-dim (needs migration + backfill). 3-small accepts `dimensions: 384` = zero migration, ~$0.02/1M tokens ≈ free at your volume |
| STT | dictation, voice goals | OpenRouter `/audio/transcriptions` (Whisper-large-v3 or Groq Whisper) | — | Your mobile already sends base64 JSON — maps 1:1 to their endpoint |
| TTS | replies, summaries | cheapest speech model (`voxtral-mini-tts` / `gpt-4o-mini-tts`), mp3 | — | No free TTS exists. Per-character pricing; pennies at your volume. **Must fix first:** the cache column is 2KB, real MP3s are ~50KB — migrate to file/URL storage or every TTS call 500s |

### Quota math (the part that decides architecture)
- $0 balance: **50 free req/day, 20 RPM** — dev-only, one tester burns it by lunch.
- **One-time $10 credit purchase (never expires): 1,000 free req/day**, 20 RPM fixed. **Do this day one.**
- At ~20 AI req/user/day → ~50 daily actives fully free. Past that: paid overflow with `max_price` caps (DeepSeek V4 Flash ≈ $0.02/1M in; GLM-5.3-flash $0.15/0.50; GPT-OSS-20b $0.018/0.09).
- **Failed requests burn quota.** No blind retries — exponential backoff (1s→2s→4s→8s), then honest fallback. A retry loop that misfires eats the day's 1,000 before producing anything.
- Free roster **rotates** — monthly model review is a checklist item, not optional. OpenRouter's native `models` fallback array absorbs rotations without deploys.

### Plumbing rules (non-negotiable)
1. Single `OPENROUTER_API_KEY`, base URL `https://openrouter.ai/api/v1` (OpenAI-compatible — your `urllib` client barely changes).
2. `provider: {"data_collection": "deny"}` on every call — **free endpoints may log prompts for training.** Strip PII pre-send regardless.
3. Per-user token budgets from day one (the audit's cost-abuse hole); monitor via `GET /api/v1/key` (`free_model_daily_requests.used/remaining`).
4. Parallelize embedding + chat (the 35s > 30s gunicorn-kill bug dies here); circuit-break dead providers to instant fallback.
5. Delete the client regex brain (mobile `chat.tsx`) in the same PR — server owns intent once the brain is reliable. Thresholds can't disagree if they exist once.

**Gaps filled:** embeddings endpoint exists (`/api/v1/embeddings`, OpenAI-shaped) ✓ · STT endpoint takes your exact base64-JSON shape ✓ · TTS endpoint is OpenAI Speech-shaped, mp3/pcm ✓ · voice-cloning available later (Fish S2.1) for a "coach with a voice" Plus perk — parked, not now.

---

## §2. Milestone timeline (dated)

### M0 — Brain transplant · 10–17 Oct 2026 · Owner: David (Evans: applies env vars from §4 only)
- [ ] Create OpenRouter account, key, one-time $10 credit load (unlocks 1,000/day) — David
- [ ] **Evans:** set `OPENROUTER_API_KEY`, `AI_CHAT_MODEL`, `AI_ROUTER_MODEL`, `AI_REASON_MODEL`, `AI_EMBED_MODEL` on **both** Render services from §4 (no code, no redeploy design — values only)
- [ ] Backend: base-URL swap to `openrouter.ai/api/v1`, model map (router/coach/reason/embeddings per §1), native fallback arrays — David
- [ ] Embeddings: 3-small @384 dims (no migration); keep deterministic-hash fallback
- [ ] STT/TTS routed via OpenRouter endpoints; TTS cache column migrated (file/URL, not 2KB text)
- [ ] Backoff + circuit-breaker + quota monitor wired; per-user token budgets live
- [ ] Delete mobile client regex router; golden-eval set seeded (20 cases)
- [ ] **Acceptance:** chat/check-in/verdict/TTS/ASR all green on free tier; p95 chat <8s; tunnel code deleted

### M1 — Trust lockdown · 18 Oct – 1 Nov · Owner: David (end to end; Evans: nothing blocking)
- [ ] Tokens vault-only (purge localStorage copies); `access_token`/`meta` encrypted at rest; hardcoded Supabase fallbacks deleted (3 web + 1 mobile)
- [ ] Offline outbox both clients (queue + auto-replay); SecureStore→AsyncStorage/SQLite for snapshots; airplane-mode demo loses zero bytes
- [ ] Kill all 5 silent-fork paths; every mutation = server truth or explicit error
- [ ] Backend venv fixed (pgvector), 62 tests executing, CI billing unblocked, merges gated green
- [ ] Prompt-injection hardening (function-calling/JSON mode, retrieved-logs-as-data); injection red-team clean
- [ ] **Acceptance:** external-minded self-review finds no P1s; eval pass ≥70% (floor, growing to 90)

### M2 — The Board + Verdicts · 2–22 Nov · Owner: David (fluxaro assists on web UI only)
- [ ] Goals tab → Pending / Active (WIP 3 enforced) / Done lanes (mobile swipe-lanes, web drag columns)
- [ ] Friday review ritual (clear Done, pride recap, reset); `STATUS_MISSED` written + deadline enforcement (worker/cron v1)
- [ ] Verdict engine v1 (reasoning model, scored post-mortem → one-tap next contract)
- [ ] Kill list: dead dashboard/layout/navs, parser dedupes, fixtures purge, LCP fixes (logo/favicon/mockup), route splitting, landing-copy fixes
- [ ] **Acceptance:** D7 ≥25%; zero dead routes; landing LCP <2.5s; reviewer describes app without "goal tracker"

### M3 — Witnesses & Stakes · 23 Nov – 20 Dec · Owner: David (Evans: advisory reviews only, never blocking)
- [ ] Referees (binding confirm) + supporters (cheer-only); witness activity feed; referee-required close on staked goals
- [ ] Pledge ladder $0→$5→$10→$30→$90, caps, charity/anti-charity routing; Stripe holds; 19.5% forfeit accounting; dispute flow (referee override)
- [ ] Append-only per-user event log (disputes + future admin analytics)
- [ ] **Acceptance:** witness-users churn 30%+ below solo; first pledge revenue recorded; dispute path tested end-to-end

### M4 — Plus + Proof graph v1 · Jan 2027 · Owner: full team
- [ ] Plus $35/yr: unlimited goals, pace/proof analytics, themes, widgets; server-enforced entitlements
- [ ] Wave-0 integrations: generic webhook-in + Zapier/Make apps; Wave-1 natives: Health, GitHub-finish, Todoist, Calendar
- [ ] Proof-coverage badges in UI; "waiting for proof" states; chat commands per integration
- [ ] **Acceptance:** blended ARPU ≥$2 (climbing to $4); ≥20% of active goals proof-fed; AI cost/user/month ≤$0.50

### M5 — Proactive agent + Evals 90 · Feb–Mar 2027
- [ ] Server-generated morning briefs, conversational check-ins (not push), dark-user escalation to referee
- [ ] Golden set to 50 cases, CI-gated ≥90%; monthly model-roster review ritual running
- [ ] Wave-2 natives (Strava, screen-time, Duolingo, finance read-only)
- [ ] **Acceptance:** D30 ≥15%; evals ≥90%; AI bill per user known to the cent

### M6 — Teams beta → GA · Q2–Q3 2027
- [ ] Shared team board, corporate referees, rewards pool; $6 PEPM, min 10 seats; 3 design-partner teams
- [ ] DPA template, audit log, encryption-at-rest → enterprise checklist; HRIS-adjacent (calendar-first) integrations
- [ ] **Acceptance:** 3 paying teams ≥10 seats; SOC2-Type-I-ready posture

---

## §3. Start-first order (if everything burns, do these three)
1. **$10 OpenRouter load + base-URL swap** (M0, day 1–2) — unblocks all AI, kills tunnel, costs less than lunch.
2. **Vault-only tokens + kill silent forks** (M1) — the two trust holes that can end the company.
3. **Board with WIP 3** (M2) — the single cheapest retention mechanic ever measured for overload-quitters.

## §4. Standing env-var request list (Evans: Render dashboard, both services)
Values supplied by David; Evans applies within 24h; David verifies from the app side. No code, no redesign, never blocking — if a var slips, David ships with a fallback default and the timeline doesn't move.
- [ ] `OPENROUTER_API_KEY` (+ `HTTP-Referer`/`X-Title` noted in code, not env)
- [ ] `AI_ROUTER_MODEL=nvidia/nemotron-3.5-lightning:free`
- [ ] `AI_CHAT_MODEL=qwen/qwen3.8-27b:free`
- [ ] `AI_REASON_MODEL=thinkingmachines/inkling-small:free`
- [ ] `AI_EMBED_MODEL=openai/text-embedding-3-small` (+ `AI_EMBED_DIMS=384`)
- [ ] `AI_STT_MODEL=openai/whisper-large-v3` · `AI_TTS_MODEL=<cheapest speech model at setup time>`
- [ ] Monthly: confirm no rotation breakage (David pings when fallback logs show a dead model; Evans never touches code for this — fallbacks are config)

## Sources (this round)
OpenRouter docs (limits, lowest-cost guide, free-models collection, embeddings/STT/TTS API refs, audio announcement May 2026); costgoat Oct 2026 free-model ranking (Qwen3.8-27B quality 58, Nemotron-3-Ultra #8 popularity); pricepertoken free-tier table; OpenRouter Zendesk rate-limit policy (50→1,000/day, 20 RPM, quota-burn warning); Qwen function-calling docs; DeepSeek-R1 tool-calling notes; `backend/ontrack` audit §§3–6 (timeouts, dims, TTS column, threads).
