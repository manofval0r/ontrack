import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Logo } from '../components/Logo'
import { DriveVideo } from '../components/DriveVideo'

export const EXPO_BUILD_URL =
  'https://expo.dev/accounts/manofval0r/projects/onTrack/builds/ccaa1b65-05a8-4947-85a1-e502b44282c5'

export const APP_DEMO_FILE_ID = '1UJjMlb0KQyIQy1t0F9ZI7b4e1gB_Y8m7'
export const APP_DEMO_SHARE_URL =
  'https://drive.google.com/file/d/1UJjMlb0KQyIQy1t0F9ZI7b4e1gB_Y8m7/view?usp=drive_open&t=27.179'

// ─── Live phone frame + tactile bits (mirrors mobile/app-mockup.html) ────────
// Original Surfer is the in-phone display voice; page headlines stay Fraunces.

const SURFER = "'Original Surfer', Georgia, serif"

const Phone: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <div className="flex flex-col items-center gap-3">
    <div
      className="w-[280px] rounded-[2.75rem] border-[3px] border-[#071E2D] dark:border-white/20 bg-[#F8FAFB] dark:bg-[#0E202D] overflow-hidden shadow-[8px_8px_0px_#071E2D] dark:shadow-[8px_8px_0px_#000000]"
      aria-label={label}
      role="group"
    >
      <div className="flex justify-center pt-2.5 pb-1">
        <div className="w-24 h-5 rounded-full bg-[#071E2D] dark:bg-white/20" />
      </div>
      <div className="px-3.5 pb-4 flex flex-col gap-2.5 min-h-[430px]">{children}</div>
    </div>
  </div>
)

const ScreenTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="font-sans font-bold text-xs text-[#071E2D] dark:text-white">{children}</div>
)

const ProgressBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div
    role="progressbar"
    aria-valuenow={Math.round(pct)}
    aria-valuemin={0}
    aria-valuemax={100}
    className="h-2.5 rounded-full bg-[#F3F6F8] dark:bg-[#081723] overflow-hidden border border-[#071E2D]/15 dark:border-white/10"
  >
    <div
      className="h-full bg-[#00C4B3] rounded-full transition-all duration-500"
      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
    />
  </div>
)

const PhoneBtn: React.FC<{
  children: React.ReactNode
  primary?: boolean
  onTap?: () => void
  label: string
}> = ({ children, primary, onTap, label }) => (
  <button
    type="button"
    onClick={onTap}
    aria-label={label}
    className={`rounded-full border-2 border-[#071E2D] dark:border-white/20 text-center text-[11px] font-bold font-sans py-2 px-3 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
      primary ? 'bg-[#071E2D] text-white' : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white'
    }`}
  >
    {children}
  </button>
)

const ChatBubble: React.FC<{ children: React.ReactNode; me?: boolean; delay?: number }> = ({
  children,
  me,
  delay = 0,
}) => (
  <div
    className={`phone-rise max-w-[90%] px-3 py-2 rounded-2xl border-2 text-[11px] font-sans leading-snug ${
      me
        ? 'self-end bg-[#071E2D] text-white border-[#071E2D]'
        : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]'
    }`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
)

const Stepper: React.FC<{ value: number; target: number; unit: string; onStep: (d: 1 | -1) => void }> = ({
  value,
  target,
  unit,
  onStep,
}) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => onStep(-1)}
      aria-label="Log one less"
      className="w-9 h-9 rounded-full border-2 border-[#071E2D] bg-[#00C4B3] text-[#071E2D] font-bold text-base leading-none cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
    >
      −
    </button>
    <span className="flex-1 text-center font-sans text-xs font-bold text-[#071E2D] dark:text-white">
      {value} of {target} {unit}
    </span>
    <button
      type="button"
      onClick={() => onStep(1)}
      aria-label="Log one more"
      className="w-9 h-9 rounded-full border-2 border-[#071E2D] bg-[#00C4B3] text-[#071E2D] font-bold text-base leading-none cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
    >
      +
    </button>
  </div>
)

const CheckRow: React.FC<{ text: string; done: boolean; onToggle: () => void }> = ({
  text,
  done,
  onToggle,
}) => (
  <button
    type="button"
    onClick={onToggle}
    role="checkbox"
    aria-checked={done}
    aria-label={text}
    className="w-full flex items-center gap-2 cursor-pointer py-0.5"
  >
    <span
      className={`flex items-center justify-center w-5 h-5 rounded-md border-2 flex-shrink-0 transition-colors ${
        done ? 'bg-[#00C4B3] border-[#071E2D] text-[#071E2D]' : 'border-[#071E2D]/35 bg-white'
      }`}
    >
      {done && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5.5l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
    <span className={`font-sans text-[11px] ${done ? 'line-through opacity-40' : 'font-medium'}`}>{text}</span>
  </button>
)

// ─── Live phone screens (each tour stop is tappable — state resets on switch) ─

const ChatScreen: React.FC = () => {
  const [sent, setSent] = useState<string[]>([])
  const starters = ['Close deals', 'Get fit', 'Read more']
  const replies: Record<string, string> = {
    'Close deals': 'Counter · target 5 — this is what your words become.',
    'Get fit': 'Counter · target 50 pushups — say “did 20” to log.',
    'Read more': 'Checklist · 3 books — check them off as you finish.',
  }
  return (
    <>
      <ChatBubble>Welcome to OnTrack</ChatBubble>
      <ChatBubble me>I want to run 3 mornings a week</ChatBubble>
      <ChatBubble delay={120}>
        <strong>Counter · target 3.</strong> Preview it, then it goes live.
      </ChatBubble>
      {sent.map((s) => (
        <ChatBubble key={s} me>
          {s}
        </ChatBubble>
      ))}
      {sent.length > 0 && (
        <ChatBubble delay={100}>{replies[sent[sent.length - 1]] ?? 'Tracker drafted — keep talking.'}</ChatBubble>
      )}
      <div className="flex gap-1.5 flex-wrap mt-auto">
        {starters
          .filter((s) => !sent.includes(s))
          .map((s) => (
            <PhoneBtn key={s} label={`Send ${s}`} onTap={() => setSent((p) => [...p, s])}>
              {s}
            </PhoneBtn>
          ))}
        {sent.length >= 3 && <span className="font-sans text-[10px] opacity-60 self-center">Tap a tour step to replay ↺</span>}
      </div>
    </>
  )
}

const TrackerScreen: React.FC = () => {
  const [deals, setDeals] = useState(3)
  const [checks, setChecks] = useState([true, true, false])
  const step = (d: 1 | -1) => setDeals((v) => Math.min(5, Math.max(0, v + d)))
  return (
    <>
      <ScreenTitle>Close 5 Enterprise Deals</ScreenTitle>
      <ProgressBar pct={(deals / 5) * 100} />
      <div className="font-sans text-[11px] text-[#006D6A] dark:text-[#00C4B3] font-bold">
        {deals} of 5 deals · {Math.round((deals / 5) * 100)}% shipped
      </div>
      <Stepper value={deals} target={5} unit="deals" onStep={step} />
      <ScreenTitle>Morning checklist</ScreenTitle>
      <div className="rounded-xl border-2 border-[#071E2D]/15 dark:border-white/10 bg-white dark:bg-[#0E202D] p-2 flex flex-col gap-1">
        {['Run 20 minutes', 'Read 20 pages', 'Ship the demo'].map((t, i) => (
          <CheckRow
            key={t}
            text={t}
            done={checks[i]}
            onToggle={() => setChecks((p) => p.map((c, j) => (j === i ? !c : c)))}
          />
        ))}
      </div>
    </>
  )
}

const DetailsScreen: React.FC = () => {
  const [logs, setLogs] = useState(9)
  const [items, setItems] = useState([true, true, false])
  return (
    <>
      <div className="rounded-2xl border-2 border-[#071E2D] bg-[#071E2D] text-white p-3 flex flex-col gap-2">
        <div className="font-sans font-bold text-xs">Ship OnTrack mobile MVP</div>
        <div className="font-sans text-[10px] text-[#00C4B3] font-semibold">manofval0r/ontrack · main</div>
        <div className="flex gap-1.5">
          {[
            { v: '14', l: 'day streak' },
            { v: String(logs), l: 'logs' },
            { v: '67%', l: 'shipped' },
          ].map((s) => (
            <div key={s.l} className="flex-1 text-center rounded-xl bg-white/10 py-1.5">
              <div className="font-bold text-sm" style={{ fontFamily: SURFER }}>
                {s.v}
              </div>
              <div className="text-[9px] text-[#00C4B3] font-semibold">{s.l}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="font-sans text-[9px] font-bold text-white/60 mb-1">ACTIVITY · LAST 7 DAYS</div>
          <div className="flex gap-1">
            {['#F3F6F8', '#99F6E4', '#00C4B3', '#00C4B3', '#F3F6F8', '#006D6A', '#00C4B3'].map((c, i) => (
              <div
                key={i}
                className="flex-1 h-6 rounded border border-white/25 phone-pop"
                style={{ backgroundColor: c, animationDelay: `${i * 90}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border-2 border-[#071E2D]/15 dark:border-white/10 bg-white dark:bg-[#0E202D] p-2 flex flex-col gap-1">
        {['Auth + SecureStore session', 'Expo-audio voice pipeline', 'EAS preview APK'].map((t, i) => (
          <CheckRow
            key={t}
            text={t}
            done={items[i]}
            onToggle={() => setItems((p) => p.map((c, j) => (j === i ? !c : c)))}
          />
        ))}
      </div>
      <div className="flex gap-1.5 mt-auto">
        <div className="flex-1">
          <PhoneBtn label="Check in" onTap={() => setLogs((l) => l + 1)}>
            Check in
          </PhoneBtn>
        </div>
        <div className="flex-1">
          <PhoneBtn primary label="Work-block (preview only)">
            Work-block
          </PhoneBtn>
        </div>
      </div>
    </>
  )
}

const COMMANDS: Record<string, string> = {
  'Turn off reminders': 'Reminders are off. No nudges, no alarms. Say “turn on reminders” any time.',
  'Teal theme': 'Teal harmony on — dipped head to toe.',
  'Quiet hours': 'Quiet hours 10pm–7am. Sleep untouched, streak intact.',
}

const CommandScreen: React.FC = () => {
  const [log, setLog] = useState<string[]>(['Turn off reminders'])
  return (
    <>
      {log.map((c) => (
        <React.Fragment key={c + log.indexOf(c)}>
          <ChatBubble me>{c}</ChatBubble>
          <ChatBubble delay={120}>{COMMANDS[c]}</ChatBubble>
        </React.Fragment>
      ))}
      <div className="flex gap-1.5 flex-wrap mt-auto">
        {Object.keys(COMMANDS)
          .filter((c) => !log.includes(c))
          .map((c) => (
            <PhoneBtn key={c} label={`Say ${c}`} onTap={() => setLog((p) => [...p, c])}>
              {c}
            </PhoneBtn>
          ))}
      </div>
    </>
  )
}

const SigninScreen: React.FC = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <>
      <div className="font-sans text-center font-bold text-sm text-[#071E2D] dark:text-white">Welcome back</div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email"
        className="rounded-xl border-2 border-[#071E2D]/30 dark:border-white/20 px-3 py-2 font-sans text-[11px] bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white placeholder:opacity-50 focus:outline-none focus:border-[#00C4B3]"
      />
      <div className="rounded-xl border-2 border-[#071E2D]/30 dark:border-white/20 px-3 py-2 font-sans text-[11px] opacity-60">
        Password
      </div>
      <PhoneBtn primary label="Log in (preview)" onTap={() => setSent(true)}>
        {sent ? '✓ Check your inbox' : 'Log in'}
      </PhoneBtn>
      {sent && (
        <p className="font-sans text-[10px] opacity-60 text-center">
          {email ? `Magic link on its way to ${email}.` : 'Magic link on its way — no password needed.'}
        </p>
      )}
      <div className="flex gap-1.5 mt-auto">
        <div className="flex-1">
          <PhoneBtn label="Continue with Google (preview)">Google</PhoneBtn>
        </div>
        <div className="flex-1">
          <PhoneBtn primary label="Continue with GitHub (preview)">
            GitHub
          </PhoneBtn>
        </div>
      </div>
    </>
  )
}

const GithubScreen: React.FC = () => {
  const [commits, setCommits] = useState(9)
  return (
    <>
      <ScreenTitle>Ship OnTrack mobile MVP</ScreenTitle>
      <div className="font-sans text-[11px] text-[#006D6A] dark:text-[#00C4B3] font-semibold">
        manofval0r/ontrack · main
      </div>
      <div className="flex gap-1">
        {['#F3F6F8', '#99F6E4', '#00C4B3', '#00C4B3', '#F3F6F8', '#006D6A', '#00C4B3'].map((c, i) => (
          <div
            key={i}
            className="flex-1 h-8 rounded border border-[#071E2D]/20 phone-pop"
            style={{ backgroundColor: c, animationDelay: `${i * 90}ms` }}
          />
        ))}
      </div>
      <ChatBubble>
        <span style={{ fontFamily: SURFER, fontSize: '1.1rem' }}>{commits}</span> commits this week — streak alive.
      </ChatBubble>
      <div className="mt-auto flex flex-col gap-1.5">
        <PhoneBtn primary label="Simulate a push (preview)" onTap={() => setCommits((c) => c + 1)}>
          Simulate a push
        </PhoneBtn>
        <p className="font-sans text-[10px] opacity-60 text-center">Each push verifies a checklist item in the real app.</p>
      </div>
    </>
  )
}

const UpdatesScreen: React.FC = () => {
  const [phase, setPhase] = useState<'idle' | 'busy' | 'done'>('idle')
  const check = () => {
    if (phase === 'busy') return
    setPhase('busy')
    setTimeout(() => setPhase('done'), 1400)
  }
  return (
    <>
      <ScreenTitle>App updates</ScreenTitle>
      <div className="font-sans text-[11px] opacity-60">Channel preview · Runtime 1.0.0</div>
      <PhoneBtn primary label="Check for app updates" onTap={check}>
        {phase === 'busy' ? 'Downloading…' : phase === 'done' ? 'Restart to apply' : 'Check for app updates'}
      </PhoneBtn>
      <ProgressBar pct={phase === 'idle' ? 0 : phase === 'busy' ? 64 : 100} />
      <div className="font-sans text-[11px] font-bold text-center text-[#006D6A] dark:text-[#00C4B3]">
        {phase === 'done' ? '✓ Up to date' : phase === 'busy' ? 'Over the air — no store trip' : 'Tap to check'}
      </div>
    </>
  )
}

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
    body: 'The whole app starts as a conversation. Tap a starter below — the tracker drafts itself while you watch.',
    phone: <ChatScreen />,
  },
  {
    id: 'trackers',
    kicker: '02 · Three formats',
    title: 'Goal trackers',
    body: 'Counters for numbers, checklists for steps. Try the stepper and checkboxes — they all work right here.',
    phone: <TrackerScreen />,
  },
  {
    id: 'details',
    kicker: '03 · Proof inside',
    title: 'Goal details screen',
    body: 'Streaks, weekly activity and checklists per goal. Hit Check in and watch the log count move.',
    phone: <DetailsScreen />,
  },
  {
    id: 'command',
    kicker: '04 · No menus needed',
    title: 'Chat controls settings',
    body: '“Turn off reminders.” “Teal theme.” Tap a command and the app obeys without leaving the conversation.',
    phone: <CommandScreen />,
  },
  {
    id: 'signin',
    kicker: '05 · One tap in',
    title: 'Sign-in flow',
    body: 'Email magic link plus one-tap Google and GitHub. Type an address and hit Log in to see the reply.',
    phone: <SigninScreen />,
  },
  {
    id: 'github',
    kicker: '06 · Proof, verified',
    title: 'GitHub integration',
    body: 'Commits verify themselves against checklist goals. Simulate a push and watch the count climb.',
    phone: <GithubScreen />,
  },
  {
    id: 'updates',
    kicker: '07 · Always fresh',
    title: 'Check for updates',
    body: 'New builds land over the air from Settings. Tap check and watch it download — no store round-trip.',
    phone: <UpdatesScreen />,
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
        @keyframes phone-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .phone-rise { animation: phone-rise 0.35s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
        @keyframes phone-pop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: none; } }
        .phone-pop { animation: phone-pop 0.3s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
        @media (prefers-reduced-motion: reduce) { .tour-swap, .phone-rise, .phone-pop { animation: none; } }
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
            Free preview build · Android only for now · iOS is on the roadmap
          </p>
          <div className="flex flex-col items-center gap-3 mt-6 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-4 sm:p-5 w-full sm:w-auto">
            <img
              src="/expo-qr.png"
              alt="QR code — scan with your Android phone to open this preview build"
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-lg"
              loading="lazy"
            />
            <p className="font-sans text-xs font-semibold text-[#071E2D] dark:text-white">
              Scan with your Android camera to download
            </p>
            <p className="font-sans text-[11px] text-[#071E2D]/55 dark:text-slate-400 -mt-2">
              Same link as the button above — no typing needed
            </p>
          </div>
        </div>
      </section>

      {/* App demo video */}
      <section className="px-4 sm:px-6 py-10 sm:py-14 bg-white dark:bg-[#06121B] border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <p className="font-sans font-bold text-xs uppercase tracking-wider opacity-70">Watch it move</p>
          <h2
            className="tracking-tight mt-2 mb-3"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)' }}
          >
            The app, on video
          </h2>
          <p className="font-sans text-sm sm:text-base opacity-70 max-w-xl mb-8">
            Real build, real thumbs: chat creates the goal, the stepper logs
            the win, the streak catches fire. Streamed from Drive — no
            megabytes added to this page.
          </p>
          <DriveVideo
            fileId={APP_DEMO_FILE_ID}
            title="OnTrack Android app demo"
            frame="portrait"
            shareUrl={APP_DEMO_SHARE_URL}
          />
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
            Take the tour — the phones are live demos, not pictures. Tap the
            steppers, checkboxes, chips, and buttons inside each screen.
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
