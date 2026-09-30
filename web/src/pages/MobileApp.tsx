import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Logo } from '../components/Logo'

export const EXPO_BUILD_URL =
  'https://expo.dev/accounts/manofval0r/projects/onTrack/builds/68b6db32-387c-4641-bacc-c2313d78f855'

// ─── Mini phone frame (CSS mock, brand system — no screenshots needed) ──────

const Phone: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <div className="flex flex-col items-center gap-3">
    <div
      className="w-[280px] rounded-[2.5rem] border-[3px] border-[#071E2D] dark:border-white/20 bg-white dark:bg-[#0E202D] overflow-hidden shadow-[8px_8px_0px_#071E2D] dark:shadow-[8px_8px_0px_#000000]"
      aria-label={label}
      role="img"
    >
      <div className="flex justify-center pt-2.5">
        <div className="w-24 h-5 rounded-full bg-[#071E2D] dark:bg-white/20" />
      </div>
      <div className="p-4 flex flex-col gap-2.5 min-h-[380px]">{children}</div>
    </div>
  </div>
)

const MockBar: React.FC<{ width: string }> = ({ width }) => (
  <div className="h-2 rounded-full bg-[#F3F6F8] dark:bg-[#081723] border border-[#071E2D]/15 dark:border-white/10 overflow-hidden">
    <div className="h-full bg-[#00C4B3] rounded-full" style={{ width }} />
  </div>
)

const MockBubble: React.FC<{ children: React.ReactNode; me?: boolean }> = ({ children, me }) => (
  <div
    className={`max-w-[90%] px-3 py-2 rounded-2xl border-2 text-[11px] font-sans leading-snug ${
      me
        ? 'self-end bg-[#071E2D] text-white border-[#071E2D]'
        : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]'
    }`}
  >
    {children}
  </div>
)

const MockBtn: React.FC<{ children: React.ReactNode; primary?: boolean }> = ({ children, primary }) => (
  <div
    className={`rounded-full border-2 border-[#071E2D] dark:border-white/20 text-center text-[11px] font-bold font-sans py-1.5 ${
      primary ? 'bg-[#071E2D] text-white' : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white'
    }`}
  >
    {children}
  </div>
)

// ─── Tour data ──────────────────────────────────────────────────────────────

type TourStop = {
  id: string
  kicker: string
  title: string
  body: string
  phone: React.ReactNode
}

const TOUR: TourStop[] = [
  {
    id: 'chat',
    kicker: '01 · Speak naturally',
    title: 'Revamped chat UI',
    body: 'The whole app starts as a conversation. Say a goal in plain words — the tracker builds itself underneath while you keep talking.',
    phone: (
      <>
        <MockBubble>Welcome to OnTrack</MockBubble>
        <MockBubble me>I want to run 3 mornings a week</MockBubble>
        <MockBubble>
          <strong>Counter · target 3</strong>
          <br />
          This is what your words become.
        </MockBubble>
        <MockBtn primary>Preview my tracker</MockBtn>
      </>
    ),
  },
  {
    id: 'trackers',
    kicker: '02 · Three formats',
    title: 'Goal trackers',
    body: 'Counters for numbers, checklists for steps, logs for reflections. Each goal gets the format that fits — picked automatically.',
    phone: (
      <>
        <div className="font-sans font-bold text-xs text-[#071E2D] dark:text-white">Close 5 Enterprise Deals</div>
        <MockBar width="60%" />
        <div className="font-sans text-[11px] text-[#006D6A] dark:text-[#00C4B3] font-bold">3 of 5 deals · 60% shipped</div>
        <MockBtn primary>+1 Log progress</MockBtn>
        <div className="font-sans font-bold text-xs text-[#071E2D] dark:text-white mt-1">Morning pushups</div>
        <MockBar width="60%" />
      </>
    ),
  },
  {
    id: 'details',
    kicker: '03 · Proof inside',
    title: 'Goal details screen',
    body: 'Streaks, weekly logs and progress history per goal — the evidence view behind every tracker card.',
    phone: (
      <>
        <div className="font-sans font-bold text-xs text-[#071E2D] dark:text-white">Ship OnTrack mobile MVP</div>
        <div className="flex gap-1.5">
          {['14', '9', '67%'].map((v, i) => (
            <div key={i} className="flex-1 text-center rounded-xl border-2 border-[#071E2D] dark:border-white/20 py-1.5">
              <div className="font-bold text-sm text-[#071E2D] dark:text-white">{v}</div>
              <div className="text-[9px] text-[#006D6A] dark:text-[#00C4B3] font-semibold">
                {['day streak', 'logs', 'shipped'][i]}
              </div>
            </div>
          ))}
        </div>
        <MockBar width="82%" />
        <MockBtn primary>Check in</MockBtn>
        <MockBtn>Work-block</MockBtn>
      </>
    ),
  },
  {
    id: 'command',
    kicker: '04 · No menus needed',
    title: 'Chat controls settings',
    body: '“Turn off reminders.” “Dark mode.” The whole app obeys chat — settings flip without ever leaving the conversation.',
    phone: (
      <>
        <MockBubble me>Turn off reminders</MockBubble>
        <MockBubble>
          Reminders are off. No nudges, no alarms. Say “turn on reminders” any time to flip it back.
        </MockBubble>
        <MockBubble me>Teal theme</MockBubble>
        <MockBubble>Teal harmony on — dipped head to toe.</MockBubble>
      </>
    ),
  },
  {
    id: 'signin',
    kicker: '05 · One tap in',
    title: 'Sign-in flow',
    body: 'Email plus one-tap Google and GitHub. Brand header, visible placeholders, social-first — thirty seconds to your first goal.',
    phone: (
      <>
        <div className="font-sans text-center font-bold text-sm text-[#071E2D] dark:text-white">Welcome back</div>
        <div className="rounded-xl border-2 border-[#071E2D]/30 dark:border-white/20 px-3 py-2 font-sans text-[11px] opacity-60">you@example.com</div>
        <div className="rounded-xl border-2 border-[#071E2D]/30 dark:border-white/20 px-3 py-2 font-sans text-[11px] opacity-60">Password</div>
        <MockBtn primary>Log in</MockBtn>
        <div className="flex gap-1.5">
          <div className="flex-1"><MockBtn>Google</MockBtn></div>
          <div className="flex-1"><MockBtn primary>GitHub</MockBtn></div>
        </div>
      </>
    ),
  },
  {
    id: 'github',
    kicker: '06 · Proof, verified',
    title: 'GitHub integration',
    body: 'Connect once and your commits verify themselves against checklist goals. Green squares become shipped progress.',
    phone: (
      <>
        <div className="font-sans font-bold text-xs text-[#071E2D] dark:text-white">Ship OnTrack mobile MVP</div>
        <div className="font-sans text-[11px] text-[#006D6A] dark:text-[#00C4B3] font-semibold">manofval0r/ontrack · main</div>
        <div className="flex gap-1">
          {['#F3F6F8', '#99F6E4', '#00C4B3', '#00C4B3', '#F3F6F8', '#006D6A', '#00C4B3'].map((c, i) => (
            <div key={i} className="flex-1 h-6 rounded border border-[#071E2D]/20" style={{ backgroundColor: c }} />
          ))}
        </div>
        <MockBubble>9 commits this week — streak alive.</MockBubble>
        <MockBtn primary>Manage</MockBtn>
      </>
    ),
  },
  {
    id: 'updates',
    kicker: '07 · Always fresh',
    title: 'Check for updates',
    body: 'New build lands over the air from Settings — no store round-trip, no reinstall. Tap, restart, done.',
    phone: (
      <>
        <div className="font-sans font-bold text-xs text-[#071E2D] dark:text-white">App updates</div>
        <div className="font-sans text-[11px] opacity-60">Channel preview · Runtime 1.0.0</div>
        <MockBtn primary>Check for app updates</MockBtn>
        <MockBar width="100%" />
        <div className="font-sans text-[11px] font-bold text-center text-[#006D6A] dark:text-[#00C4B3]">Up to date</div>
      </>
    ),
  },
]

const ROADMAP: { title: string; body: string }[] = [
  { title: 'Siri shortcuts', body: '“Log my run” without opening the app — voice-first check-ins from the lock screen.' },
  { title: 'Encouragement feed', body: 'Opt-in pings from people chasing similar goals, powered by a news feed — momentum is contagious.' },
  { title: 'Shared stories', body: 'Publish a shipped goal as a story (only if you allow it) and borrow tactics from others.' },
  { title: 'App blocking', body: 'Distraction apps stay locked each day until you open OnTrack and log real progress.' },
  { title: 'Deep integrations', body: 'Notion pages, Slack threads and GitHub repos wired to specific goals — proof collected automatically.' },
  { title: 'Study quizzes', body: 'Connect a study app and get quizzed on your material — recall scored straight into the tracker.' },
]

// ─── Interactive tour stage ─────────────────────────────────────────────────
// One bold moment: a big phone stage driven by a step list. Phone content
// swaps with a 300ms ease-out rise (transform + opacity only); steps show
// pressed feedback; everything respects reduced motion.

const TourStage: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0)
  const stop = TOUR[activeIdx]
  const go = (dir: 1 | -1) => setActiveIdx((i) => (i + dir + TOUR.length) % TOUR.length)

  return (
    <>
      <style>{`
        @keyframes tour-in { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: none; } }
        .tour-swap { animation: tour-in 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
        @media (prefers-reduced-motion: reduce) { .tour-swap { animation: none; } }
      `}</style>
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <ol className="flex flex-col gap-3 list-none p-0 m-0 order-2 lg:order-1">
          {TOUR.map((s, i) => {
            const active = i === activeIdx
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-pressed={active}
                  aria-label={`Show ${s.title}`}
                  className={`w-full text-left rounded-2xl border-2 p-4 sm:p-5 transition-all duration-150 cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-[#0E202D] border-[#071E2D] dark:border-[#00C4B3] border-l-8 shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000]'
                      : 'bg-white/60 dark:bg-white/5 border-[#071E2D]/20 dark:border-white/10 hover:border-[#071E2D] dark:hover:border-white/30 active:scale-[0.99]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`font-sans font-bold text-xs w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        active
                          ? 'bg-[#00C4B3] text-[#071E2D] border-[#071E2D]'
                          : 'text-[#006D6A] dark:text-[#00C4B3] border-[#00C4B3]/40'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-sans font-bold text-[11px] uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">
                        {s.kicker}
                      </span>
                      <span
                        className="block tracking-tight"
                        style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: '1.2rem' }}
                      >
                        {s.title}
                      </span>
                      <span className="block font-sans text-sm leading-relaxed opacity-75 mt-1">{s.body}</span>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <div className="order-1 lg:order-2 lg:sticky lg:top-24 flex flex-col items-center gap-4">
          <div key={stop.id} className="tour-swap">
            <Phone label={`${stop.title} preview`}>{stop.phone}</Phone>
          </div>
          <p aria-live="polite" className="font-sans text-xs opacity-60 text-center">
            {stop.kicker} — {stop.title}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous screen"
              className="btn-pill btn-pill-white !py-2 !px-4 text-sm cursor-pointer"
            >
              <span aria-hidden="true">←</span>
            </button>
            <span className="font-sans text-sm font-bold tabular-nums" aria-label={`Screen ${activeIdx + 1} of ${TOUR.length}`}>
              {activeIdx + 1} / {TOUR.length}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next screen"
              className="btn-pill btn-pill-primary !py-2 !px-4 text-sm cursor-pointer"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export const MobileApp: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-[#F8FAFB] dark:bg-[#07141E] text-[#071E2D] dark:text-slate-100 transition-colors">
    <Navbar />
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-dot-grid border-b-2 border-[#071E2D]/10 dark:border-white/10 pt-10 pb-10 sm:pt-14 sm:pb-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 font-sans text-[11px] font-bold tracking-wide uppercase bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C4B3]" />
            OnTrack for Android · Preview build
          </span>
          <h1
            className="text-[#071E2D] dark:text-white tracking-tight leading-[1.05] mt-4 mb-3"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Your goals, <span className="text-[#00C4B3]">in your pocket.</span>
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#071E2D]/70 dark:text-slate-300 leading-relaxed max-w-2xl mb-6">
            The full OnTrack experience as a native-feel Android app: chat-first goal creation,
            live trackers, GitHub proof, and settings that obey chat. Free preview, straight from Expo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
            <a
              href={EXPO_BUILD_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-pill btn-pill-primary text-sm sm:text-base py-3 px-6 pl-7"
            >
              <span>Download the app</span>
              <span className="btn-bubble bg-white text-[#006D6A]" aria-hidden="true">↓</span>
            </a>
            <a href="#tour" className="btn-pill btn-pill-white text-sm sm:text-base py-3 px-6 pl-7">
              <span>See what's inside</span>
            </a>
          </div>
          <p className="font-sans text-xs text-[#071E2D]/55 dark:text-slate-400">
            Free preview build · Android APK · Scan-to-install on the Expo page
          </p>
        </div>
      </section>

      {/* Tour — interactive stage: one big phone, steps drive it */}
      <section id="tour" className="px-4 sm:px-6 py-10 sm:py-14 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <p className="font-sans font-bold text-xs uppercase tracking-wider opacity-70 text-center">Sneak peek</p>
          <h2
            className="text-center tracking-tight mt-2 mb-3"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)' }}
          >
            Seven screens, zero forms
          </h2>
          <p className="font-sans text-sm sm:text-base opacity-70 text-center max-w-xl mx-auto mb-8">
            Take the tour — every screen mirrors the shipped app: same tokens, same tactile shapes, same flows.
          </p>
          <TourStage />
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-4 sm:px-6 py-10 sm:py-14 bg-white dark:bg-[#06121B] border-y-2 border-[#071E2D]/10 dark:border-white/10">
        <div className="max-w-6xl mx-auto">
          <p className="font-sans font-bold text-xs uppercase tracking-wider opacity-70 text-center">On the roadmap</p>
          <h2
            className="text-center tracking-tight mt-2 mb-3"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)' }}
          >
            Coming to your pocket next
          </h2>
          <p className="font-sans text-sm sm:text-base opacity-70 text-center max-w-xl mx-auto mb-8">
            Planned, not shipped — the direction the app is heading.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROADMAP.map((r) => (
              <div key={r.title} className="card-tactile p-5">
                <span className="inline-block font-sans text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#00C4B3]/15 border border-[#00C4B3]/40 text-[#006D6A] dark:text-[#00C4B3] mb-2">
                  Soon
                </span>
                <h3 className="font-sans font-bold text-base mb-1">{r.title}</h3>
                <p className="font-sans text-sm leading-relaxed opacity-75">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto bg-[#071E2D] dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl shadow-[6px_6px_0px_#071E2D] dark:shadow-[6px_6px_0px_#000000] p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h3 className="text-white tracking-tight" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
              Take the tour with you
            </h3>
            <p className="font-sans text-sm text-white/70 mt-1">One download. Your first tracker in under a minute.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a href={EXPO_BUILD_URL} target="_blank" rel="noreferrer" className="btn-pill btn-pill-white text-sm py-3 px-6 pl-7">
              <span>Download the app</span>
              <span className="btn-bubble bg-[#00C4B3] text-white" aria-hidden="true">↓</span>
            </a>
            <Link to="/" className="btn-pill text-sm font-bold px-6 py-3 rounded-full border-2 border-[#00C4B3] text-white hover:bg-[#00C4B3] hover:text-[#071E2D] transition-colors">
              Back home
            </Link>
          </div>
        </div>
      </section>
    </main>
    <footer className="bg-white dark:bg-[#06121B] border-t-2 border-[#071E2D]/10 dark:border-white/10 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo />
        <nav aria-label="App page footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-sans text-sm opacity-70">
          <Link to="/" className="hover:opacity-100">Home</Link>
          <Link to="/docs" className="hover:opacity-100">Docs</Link>
          <a href={EXPO_BUILD_URL} target="_blank" rel="noreferrer" className="hover:opacity-100">Download app</a>
        </nav>
        <p className="font-sans text-xs opacity-50">© 2026 OnTrack</p>
      </div>
    </footer>
  </div>
)
