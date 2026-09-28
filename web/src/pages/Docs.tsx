import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Logo } from '../components/Logo'

// ─── Docs content model ─────────────────────────────────────────────

type DocSection = {
  id: string
  kicker: string
  title: string
  body: string
  bullets: string[]
  links: { label: string; href: string }[]
}

const SECTIONS: DocSection[] = [
  {
    id: 'design-system',
    kicker: 'Headliner · Design system',
    title: 'Tactile, high-contrast, calm',
    body: 'Every OnTrack surface uses the same tokens, typefaces and tactile shapes. No ad-hoc hex, no foreign palettes. If it is not navy, turquoise, teal or aqua on off-white — it does not ship.',
    bullets: [
      'Tokens: turquoise #00C4B3 (accent) · navy #071E2D (ink, borders, shadows) · teal #006D6A (success tags) · aqua #33D6C5 (hover glow) · canvas #F8FAFB / #F3F6F8 · white #FFFFFF.',
      'Type: Fraunces 700 for display headlines and numbers · DM Sans 400–700 for UI, body and buttons.',
      'Shape: 2px solid navy borders, solid offset shadows (3px pills, 4px cards, 6px CTA), full-pill buttons with inner bubble, 20px cards, dot-grid canvas.',
      'Restraint: no tan/sand, no purple, no neon gradient washes. Source: docs/design.md + web/src/index.css.',
    ],
    links: [
      { label: 'Design reference', href: '#design-system' },
      { label: 'Components', href: '#web-screens' },
      { label: 'Cross-platform parity', href: '#mobile' },
    ],
  },
  {
    id: 'product',
    kicker: 'Product · Project plan',
    title: 'Say your goal. Get your tracker.',
    body: 'OnTrack is a conversational goal and accountability tracker: plain-English goals become adaptive trackers, with AI check-ins and honest deadline verdicts. Source: docs/OnTrack Project Plan.md.',
    bullets: [
      'Stack: Django REST + Supabase (Postgres + Auth) + NVIDIA Nemotron · React/Vite web · Expo SDK 57 mobile (shipped to preview).',
      'Flow: onboarding → auth → chat → AI parse → tracker (counter / checklist / log) → progress → dashboard → verdict.',
      'MVP: Supabase auth, chat goal creation, dynamic trackers, 30-min check-ins, verdicts, streaks, TTS/ASR via POST /api/tts + /api/asr.',
      'Deploy: one Django codebase, two Render instances (web + mobile); web on Vercel, mobile on Expo Go.',
    ],
    links: [
      { label: 'Backend scope', href: '#backend' },
      { label: 'Web scope', href: '#frontend' },
      { label: 'API contract', href: '#api' },
    ],
  },
  {
    id: 'backend',
    kicker: 'Backend · Django + Supabase',
    title: 'Verifies, never mints',
    body: 'Django verifies Supabase JWTs (HS256 legacy secret or ES256 JWKS) and derives user_id from the sub claim. There is no local user table. Source: docs/OnTrack Backend.md + backend/ontrack/apps/accounts/authentication.py.',
    bullets: [
      'Models: Goal, GoalItem, ProgressLog, CheckIn, AudioCache on shared Supabase Postgres.',
      'Auth header: Authorization: Bearer <supabase-jwt> → request.user_id. verify_aud is off; signature + expiry is the boundary.',
      'Errors are uniform: { error, code } — e.g. 401 AUTH_INVALID, 404 GOAL_NOT_FOUND, 429 RATE_LIMIT_EXCEEDED.',
      'Ops: CORS allow-list, throttles, prompt-injection sanitising, key-gated /api/debug, migrations from one instance only.',
    ],
    links: [
      { label: 'API endpoints', href: '#api' },
      { label: 'GitHub setup guide', href: '#github' },
    ],
  },
  {
    id: 'frontend',
    kicker: 'Frontend · React web',
    title: 'Conversation first, dashboard second',
    body: 'Web owns onboarding, auth, chat, dynamic trackers, dashboard, goal workspace, settings, voice UI and all loading/error/empty states. Source: docs/OnTrack Frontend Web.md + docs/web-design/index.md.',
    bullets: [
      'Routes: / · /onboarding · /login · /signup · /dashboard · /chat · /goal/:id · /settings · 404.',
      'Auth: Supabase email/password + Google/GitHub via /auth/v1/authorize?provider=…; JWT stored as ontrack_token.',
      'Known gap (flagged): landing/chat/settings use teal-navy tokens while dashboard uses a light-gray/orange dock-rail — convergence is an open owner decision.',
      'State today: local mock/browser storage; real API wiring, TTS verdicts and notifications are staged next.',
    ],
    links: [
      { label: 'Web screens', href: '#web-screens' },
      { label: 'Settings + integrations', href: '#web-screens' },
    ],
  },
  {
    id: 'api',
    kicker: 'API · v1 contract',
    title: 'One base, predictable errors',
    body: 'Base /api. JSON everywhere except multipart for /api/asr. Source: docs/backendendpoint.md.',
    bullets: [
      'Auth: GET /api/auth/me · Settings: GET/PUT /api/settings (profile, audio, notifications, integrations).',
      'Goals: GET/POST /api/goals · GET/PUT/DELETE /api/goals/:id · POST :id/checkin · POST :id/checkins/:cid/respond · POST :id/finalize.',
      'Progress + dashboard: POST /api/progress { goal_id, value:int, note? } · GET /api/dashboard · POST /api/chat/parse-goal.',
      'Voice: POST /api/tts { text } → { audio_url, cached } · POST /api/asr { audio: base64 } → { transcript }.',
    ],
    links: [
      { label: 'Backend detail', href: '#backend' },
      { label: 'Mobile parity', href: '#mobile' },
    ],
  },
  {
    id: 'github',
    kicker: 'Guide · GitHub integration',
    title: 'Login today, sync tomorrow',
    body: 'GitHub login needs zero backend code — it is a Supabase Auth provider. Activity sync (commits/PRs) is designed but not implemented.',
    bullets: [
      'Step 1 — GitHub OAuth App at github.com/settings/developers: callback = https://<project-ref>.supabase.co/auth/v1/callback.',
      'Step 2 — Supabase Dashboard → Authentication → Providers → GitHub → Enable, paste Client ID + Secret. See backend/ontrack/.env.example.',
      'Step 3 — web buttons already call /auth/v1/authorize?provider=github (see Login and Signup pages). Test in an incognito window.',
      'Roadmap: per-user GitHub token vault + GET /api/integrations/github/* to auto-log commits, merges and streaks.',
    ],
    links: [
      { label: 'Web auth screens', href: '#web-screens' },
      { label: 'Mobile integrations', href: '#mobile' },
    ],
  },
  {
    id: 'web-screens',
    kicker: 'Web · Screens + features',
    title: '18 screens, 8 feature specs',
    body: 'As-built reference at docs/web-design/. Each screen doc separates what is built from demo data and open decisions.',
    bullets: [
      'Flows: landing · onboarding (welcome, how-it-works, create-goal, goal-ready) · login · signup · dashboard · chat · goal-workspace.',
      'Settings family: main, profile, audio, notifications, integrations (local toggle only — no live OAuth yet).',
      'Features: voice-input, tts-player, chat-messages, dynamic-tracker, goal-card, stats-charts, work-block, verdict.',
      'Rule: check the screen doc header (As built vs Demo vs Open) before treating any mock as contract.',
    ],
    links: [
      { label: 'Design system', href: '#design-system' },
      { label: 'Product plan', href: '#product' },
    ],
  },
  {
    id: 'mobile',
    kicker: 'Mobile · Expo SDK 57, shipped',
    title: 'The app in your pocket',
    body: 'The Expo app is live: 5-tab floating dock (Home, Goals, center Chat action, Settings, You), SecureStore session, expo-audio voice, Reanimated motion, Original Surfer display type. Source: mobile/ + docs/mobile/index.md.',
    bullets: [
      'Nav: floating dock with joined center Chat action (not a nav link); full-screen modals for goal detail, voice, work-block, integrations; custom "You are off track" 404 with sitemap.',
      'Screens as built: M1 Splash (logo + session routing) · M2 illustrated onboarding with goal-first draft · M3/M4 email + Google/GitHub auth with deep-link receiver (app/auth.tsx) · M5 Home (focus, streak, cards) · M6 conversational chat (intents, dictation, TTS, starters, daily brief) · M7 Goals (active/completed) · M8 template-personalized detail (GitHub-style headers, week strip, activity) · M9 escapable work-block timer · M10–M14 settings (profile, audio, coach cadence, notifications, quiet hours, focus, integrations, data export, about).',
      'Voice: inline chat dictation (record → POST /api/asr → editable input) plus full-screen voice modal; TTS replay per message with autoplay toggle; expo-audio playback with device-speech fallback.',
      'Auth: Supabase JWT in SecureStore as ontrack_token; Google/GitHub via system browser; ontrack://auth deep link + in-app listener; integration connects vault provider tokens (never swap the login session).',
      'Backend parity: goal_template selects presentation; template_context (streak, weekly logs, last activity) powers headers; current_value + progress_logs render real progress; dashboard progress_pct enriches lists.',
      'Platform rules kept: 44pt/48dp targets · safe-area roots (docs/mobile/safe-area.md) · keyboard-aware composer · haptics map (docs/mobile/haptics.md) · modal behavior per docs/mobile/modal-behavior.md.',
    ],
    links: [
      { label: 'Cross-platform notes', href: '#design-system' },
      { label: 'Web screens', href: '#web-screens' },
    ],
  },
]

const QUICK_LINKS = [
  { label: 'Design system', href: '#design-system' },
  { label: 'Product', href: '#product' },
  { label: 'Backend', href: '#backend' },
  { label: 'Frontend', href: '#frontend' },
  { label: 'API', href: '#api' },
  { label: 'GitHub guide', href: '#github' },
  { label: 'Web screens', href: '#web-screens' },
  { label: 'Mobile', href: '#mobile' },
]

// ─── Small atoms ────────────────────────────────────────────────────

const Pill: React.FC<{ children: React.ReactNode; tone?: 'dark' | 'light' }> = ({ children, tone = 'light' }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 font-sans text-[11px] font-bold tracking-wide uppercase ${
      tone === 'dark'
        ? 'bg-[#071E2D] text-white border-[#071E2D]'
        : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]'
    }`}
  >
    {children}
  </span>
)

// ─── Page ───────────────────────────────────────────────────────────

export const Docs: React.FC = () => {
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id)
  const itemRefs = React.useRef<Record<string, HTMLLIElement | null>>({})
  const [pill, setPill] = useState({ top: 0, height: 0, visible: false })

  const filtered = SECTIONS.filter((s) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      s.title.toLowerCase().includes(q) ||
      s.body.toLowerCase().includes(q) ||
      s.bullets.some((b) => b.toLowerCase().includes(q))
    )
  })

  // Scroll-spy: highlight the section currently in view.
  React.useEffect(() => {
    const articles = filtered
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el)
    if (articles.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    )
    articles.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [filtered])

  // Glide the pill to the active nav item.
  React.useEffect(() => {
    const el = itemRefs.current[activeId]
    if (el) {
      setPill({ top: el.offsetTop, height: el.offsetHeight, visible: true })
    } else {
      setPill((p) => ({ ...p, visible: false }))
    }
  }, [activeId, filtered])

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFB] dark:bg-[#07141E] text-[#071E2D] dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        {/* Hero — design-system headliner */}
        <section className="bg-dot-grid border-b-2 border-[#071E2D]/10 dark:border-white/10 pt-10 pb-10 sm:pt-14 sm:pb-14 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <Pill>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C4B3]" />
              Product docs · v1
            </Pill>
            <h1
              className="text-[#071E2D] dark:text-white tracking-tight leading-[1.05] mt-4 mb-3"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Everything OnTrack, <span className="text-[#00C4B3]">in one place.</span>
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#071E2D]/70 dark:text-slate-300 leading-relaxed max-w-2xl mb-6">
              Design tokens first, then product, backend, web, API, GitHub setup and the shipped mobile app —
              distilled from <span className="font-semibold">docs/</span> into one scannable page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-6">
              <label htmlFor="docs-search" className="sr-only">Search docs</label>
              <input
                id="docs-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trackers, auth, verdicts, tokens…"
                className="w-full sm:max-w-sm px-5 py-3 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] font-sans text-sm outline-none focus:border-[#00C4B3] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500"
              />
              <Link to="/signup" className="btn-pill btn-pill-primary text-sm py-2.5 px-5 pl-6">
                <span>Start tracking</span>
                <span className="btn-bubble bg-white text-[#006D6A]" aria-hidden="true">→</span>
              </Link>
            </div>
            {/* Quick links */}
            <nav aria-label="Quick links" className="flex flex-wrap gap-2">
              {QUICK_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="btn-pill btn-pill-white !py-1.5 !px-4 text-xs">
                  <span>{l.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* Token strip — the headliner made tangible */}
        <section aria-label="Design tokens" className="bg-white dark:bg-[#07141E] border-b-2 border-[#071E2D]/10 dark:border-white/10 px-4 sm:px-6 py-6">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { n: 'Turquoise', h: '#00C4B3', r: 'Accent' },
              { n: 'Navy', h: '#071E2D', r: 'Ink' },
              { n: 'Teal', h: '#006D6A', r: 'Success' },
              { n: 'Aqua', h: '#33D6C5', r: 'Glow' },
              { n: 'Canvas', h: '#F8FAFB', r: 'Surface' },
              { n: 'Fraunces / DM Sans', h: 'Aa', r: 'Type' },
            ].map((t) => (
              <div key={t.n} className="card-tactile p-3 flex items-center gap-2.5">
                <span
                  className="w-9 h-9 rounded-xl border-2 border-[#071E2D] dark:border-white/20 flex-shrink-0 flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: t.h.startsWith('#') ? t.h : '#071E2D', color: t.n.startsWith('Fraunces') ? '#fff' : t.n === 'Canvas' ? '#071E2D' : '#fff' }}
                  aria-hidden="true"
                >
                  {!t.h.startsWith('#') && t.h}
                </span>
                <span>
                  <span className="block font-sans font-bold text-xs">{t.n}</span>
                  <span className="block font-sans text-[11px] opacity-60">{t.h} · {t.r}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sticky quick-nav with scroll-spy pill */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 card-tactile p-5">
              <p className="font-sans font-bold text-xs uppercase tracking-wider mb-3 opacity-70">On this page</p>
              <ul className="relative flex flex-col gap-1.5 list-none p-0 m-0">
                <span
                  aria-hidden="true"
                  className="absolute left-0 w-1 rounded-full bg-[#00C4B3] transition-all duration-300 ease-out motion-reduce:transition-none"
                  style={{
                    top: pill.top,
                    height: pill.height,
                    opacity: pill.visible ? 1 : 0,
                  }}
                />
                {SECTIONS.map((s) => {
                  const isActive = s.id === activeId
                  return (
                    <li
                      key={s.id}
                      ref={(el) => {
                        itemRefs.current[s.id] = el
                      }}
                    >
                      <a
                        href={`#${s.id}`}
                        aria-current={isActive ? 'location' : undefined}
                        className={`block font-sans text-sm rounded-lg pl-4 pr-2 py-1 transition-colors ${
                          isActive
                            ? 'font-bold text-[#006D6A] dark:text-[#00C4B3] bg-[#00C4B3]/10'
                            : 'font-medium opacity-75 hover:opacity-100 hover:text-[#006D6A] dark:hover:text-[#00C4B3]'
                        }`}
                      >
                        {s.title}
                      </a>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4 pt-4 border-t border-[#071E2D]/10 dark:border-white/10">
                <p className="font-sans text-[11px] opacity-60 leading-relaxed">Source of truth stays in docs/ + code. This page is the map, not a fork.</p>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9 flex flex-col gap-5">
            {filtered.map((s) => (
              <article key={s.id} id={s.id} className="card-tactile p-6 sm:p-8 scroll-mt-24">
                <Pill>{s.kicker}</Pill>
                <h2
                  className="tracking-tight mt-3 mb-2"
                  style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
                >
                  {s.title}
                </h2>
                <p className="font-sans text-sm sm:text-[15px] leading-relaxed opacity-75 mb-4 max-w-2xl">{s.body}</p>
                <ul className="flex flex-col gap-2.5 mb-5">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 font-sans text-sm leading-relaxed">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#00C4B3]/15 border border-[#00C4B3]/40 text-[#006D6A] dark:text-[#00C4B3] flex items-center justify-center text-[11px] font-bold flex-shrink-0" aria-hidden="true">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {s.links.map((l) => (
                    <a key={l.label} href={l.href} className="btn-pill btn-pill-ghost !py-1.5 !px-4 text-xs">
                      <span>{l.label} →</span>
                    </a>
                  ))}
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="card-tactile p-8 text-center">
                <p className="font-sans text-sm opacity-70">No sections match “{query}”. Try “auth”, “tracker” or “token”.</p>
              </div>
            )}

            {/* CTA */}
            <div className="bg-[#071E2D] dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl shadow-[6px_6px_0px_#071E2D] dark:shadow-[6px_6px_0px_#000000] p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <h3 className="text-white tracking-tight" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
                  Ready to become a full-fledged product?
                </h3>
                <p className="font-sans text-sm text-white/70 mt-1">Docs get you oriented. A goal gets you moving.</p>
              </div>
              <Link to="/signup" className="btn-pill btn-pill-white text-sm py-3 px-6 pl-7 flex-shrink-0">
                <span>Say your first goal</span>
                <span className="btn-bubble bg-[#00C4B3] text-white" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-white dark:bg-[#06121B] border-t-2 border-[#071E2D]/10 dark:border-white/10 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <nav aria-label="Docs footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-sans text-sm opacity-70">
            <Link to="/" className="hover:opacity-100">Home</Link>
            <a href="#design-system" className="hover:opacity-100">Design</a>
            <a href="#api" className="hover:opacity-100">API</a>
            <a href="#github" className="hover:opacity-100">GitHub</a>
          </nav>
          <p className="font-sans text-xs opacity-50">© 2026 OnTrack Docs</p>
        </div>
      </footer>
    </div>
  )
}
