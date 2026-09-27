import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { FeaturePill } from '../components/FeaturePill'
import { Navbar } from '../components/Navbar'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const ArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M2 6.5l2.8 2.8L10 3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const SparkleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
    <path
      d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.4 1.4M8.1 8.1l1.4 1.4M2.5 9.5l1.4-1.4M8.1 3.9l1.4-1.4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const BoltIcon = () => (
  <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
    <path d="M7 1L2 7h4l-1 4 5-6H6l1-4z" fill="currentColor" />
  </svg>
)

// ─── Hero Section (Hero section excluded from copy changes) ───────────────────

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-dot-grid pt-12 pb-20 md:pt-16 md:pb-28 border-b-2 border-[#071E2D]/8 dark:border-white/10">
      <div className="relative max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Credibility pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2.5px_2.5px_0px_#071E2D] dark:shadow-[2.5px_2.5px_0px_#000000] mb-8 transition-transform hover:-translate-y-0.5 cursor-pointer">
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#006D6A] text-white">
            <CheckIcon />
          </span>
          <span className="font-sans font-semibold text-xs text-[#071E2D] dark:text-white">
            Verified AI Accountability · Designed for Follow-Through
          </span>
          <span className="text-[#071E2D]/60 dark:text-slate-400 text-xs font-bold">›</span>
        </div>

        {/* Display Headline */}
        <h1
          className="text-[#071E2D] dark:text-white leading-[1.08] tracking-tight mb-5"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 700,
            fontSize: 'clamp(2.6rem, 5.5vw, 4.25rem)',
            maxWidth: '860px',
          }}
        >
          Track Your Ambitions With{' '}
          <span className="text-[#00C4B3]">
            Personalized Confidence
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="font-sans text-[#071E2D]/70 dark:text-slate-300 mb-9 leading-relaxed text-base sm:text-lg"
          style={{ maxWidth: '680px' }}
        >
          Eliminate the guesswork from goal achievement with personalized, conversational
          accountability. Ontrack transforms your plain English goals into adaptive trackers,
          keeps you focused on every milestone, and gives you honest verdicts when it counts.
        </p>

        {/* Dual Pill CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
          <Link to="/signup" className="btn-pill btn-pill-primary text-base py-3 px-6 pl-7">
            <span>Start Tracking Free</span>
            <span className="btn-bubble bg-white text-[#006D6A]">
              <ArrowRight />
            </span>
          </Link>
          <a href="#how-it-works" className="btn-pill btn-pill-white text-base py-3 px-6 pl-7">
            <span>Explore Features</span>
            <span className="btn-bubble bg-[#F3F6F8] dark:bg-[#182F43] border border-[#071E2D]/30 dark:border-white/20 text-[#071E2D] dark:text-white">
              <ArrowRight />
            </span>
          </a>
        </div>

        <p className="font-sans text-xs sm:text-sm text-[#071E2D]/55 dark:text-slate-400 mb-12">
          No setup required · Your progress data stays strictly in your browser
        </p>
      </div>

      {/* ── Expanded Mockup Showcase with Non-overlapping Side Cards ─────── */}
      <div className="relative w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex flex-col xl:flex-row items-center justify-center gap-6 xl:gap-8 2xl:gap-12">
          {/* Left Side: Goal Velocity Card */}
          <div className="w-full xl:w-[260px] 2xl:w-[300px] flex-shrink-0 flex flex-col gap-4 order-2 xl:order-1 max-w-xl xl:max-w-none mx-auto">
            <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#071E2D] dark:hover:shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 border-b border-[#071E2D]/10 dark:border-white/10">
                <span className="font-sans font-bold text-sm text-[#071E2D] dark:text-white">Goal Velocity</span>
                <span className="text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] bg-[#00C4B3]/15 px-2.5 py-0.5 rounded-full border border-[#00C4B3]/30">
                  +24% Pace
                </span>
              </div>

              {/* Progress curve */}
              <div className="py-2.5">
                <div className="flex justify-between text-xs text-[#071E2D]/70 dark:text-slate-400 mb-1 font-sans">
                  <span>Milestone 03</span>
                  <span className="font-bold text-[#071E2D] dark:text-white">94% On Target</span>
                </div>
                <svg width="100%" height="48" viewBox="0 0 220 48" fill="none" className="overflow-visible">
                  <path
                    d="M0 42 C45 40, 80 28, 120 20 C160 12, 185 6, 220 4"
                    stroke="#00C4B3"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                  />
                  <circle cx="220" cy="4" r="4.5" fill="#00C4B3" stroke="#071E2D" strokeWidth="2" />
                  <path
                    d="M0 44 L220 44"
                    stroke="currentColor"
                    className="text-[#071E2D] dark:text-white"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.2"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#071E2D]/10 dark:border-white/10 text-xs text-[#071E2D]/60 dark:text-slate-400 font-sans">
                <span>Sprint Target: Friday</span>
                <span className="font-bold text-[#006D6A] dark:text-[#00C4B3]">Ahead of Pace</span>
              </div>
            </div>

            {/* Active Sprint Context Card */}
            <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-4 text-left transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#071E2D]/10 dark:border-white/10">
                <span className="font-bold text-[#071E2D] dark:text-white">Active Target</span>
                <span className="text-[11px] font-semibold text-[#006D6A] dark:text-[#00C4B3]">Israel • 3 Days Left</span>
              </div>
              <p className="font-bold text-xs text-[#071E2D] dark:text-white mt-2 mb-1">Close 5 Enterprise Deals</p>
              <div className="flex justify-between text-[11px] text-[#071E2D]/60 dark:text-slate-400 mb-1">
                <span>Metric Progress</span>
                <span className="font-bold text-[#00C4B3]">3 / 5 Shipped (60%)</span>
              </div>
              <div className="h-2 rounded-full bg-[#F3F6F8] dark:bg-[#081723] overflow-hidden border border-[#071E2D]/15 dark:border-white/10">
                <div className="h-full bg-[#00C4B3] rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>

          {/* Center: The Expanded Phone Mockup */}
          <div className="w-full flex-1 max-w-[1240px] flex justify-center items-center order-1 xl:order-2 px-1">
            <img
              src="/mockup.png"
              alt="Ontrack phone app preview — goal entered, tracker built automatically"
              className="w-full h-auto object-contain block mx-auto drop-shadow-[0_28px_70px_rgba(7,30,45,0.22)]"
              style={{
                maxHeight: '760px',
              }}
            />
          </div>

          {/* Right Side: Tips For Success Card */}
          <div className="w-full xl:w-[260px] 2xl:w-[300px] flex-shrink-0 flex flex-col gap-4 order-3 max-w-xl xl:max-w-none mx-auto">
            <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#071E2D] dark:hover:shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 border-b border-[#071E2D]/10 dark:border-white/10">
                <span className="font-sans font-bold text-sm text-[#071E2D] dark:text-white">Tips For Success</span>
                <span className="w-6 h-6 rounded-full bg-[#00C4B3] text-[#071E2D] flex items-center justify-center font-bold text-xs shadow-sm">
                  ★
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs font-sans mt-3">
                <div className="flex items-start gap-2.5 bg-[#F8FAFB] dark:bg-[#081723] p-2.5 rounded-xl border border-[#071E2D]/15 dark:border-white/10">
                  <span className="text-[#006D6A] dark:text-[#00C4B3] font-bold text-sm mt-0.5">✓</span>
                  <div>
                    <p className="font-bold text-[#071E2D] dark:text-white text-xs">Follow your daily streak</p>
                    <p className="text-[11px] text-[#071E2D]/65 dark:text-slate-400 leading-tight mt-0.5">Short, daily logs keep friction at zero.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#F8FAFB] dark:bg-[#081723] p-2.5 rounded-xl border border-[#071E2D]/15 dark:border-white/10">
                  <span className="text-[#006D6A] dark:text-[#00C4B3] font-bold text-sm mt-0.5">✦</span>
                  <div>
                    <p className="font-bold text-[#071E2D] dark:text-white text-xs">Midpoint Check-In</p>
                    <p className="text-[11px] text-[#071E2D]/65 dark:text-slate-400 leading-tight mt-0.5">Nemotron verifies milestone 2 on Wednesday.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Partner Prompt Card */}
            <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-4 text-left transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#071E2D]/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00C4B3] animate-pulse" />
                  <span className="font-bold text-[#071E2D] dark:text-white">OnTrack AI Partner</span>
                </div>
                <span className="text-[10px] text-[#006D6A] dark:text-[#00C4B3] font-bold">Active</span>
              </div>
              <p className="font-sans text-xs text-[#071E2D]/75 dark:text-slate-300 mt-2 leading-relaxed">
                "You're at 3 out of 5 deals with 3 days left. Want to start a 45-min Work-Block session?"
              </p>
            </div>
          </div>
        </div>

        {/* Feature guarantee pills row */}
        <div className="flex flex-wrap justify-center gap-3 mt-14">
          <FeaturePill icon={<BoltIcon />} label="Ready in seconds" />
          <FeaturePill icon={<SparkleIcon />} label="Any goal type" />
          <FeaturePill icon={<CheckIcon />} label="Zero configuration" />
        </div>
      </div>
    </section>
  )
}

// ─── Section C — How it works ─────────────────────────────────────────────────

const steps = [
  {
    n: '01',
    title: 'Say your goal',
    body: 'Type or speak it in plain language. "Sell 5 cars this week." "Read 2 books by Friday." "50 pushups a day." No categories to pick, no forms to fill.',
    illustration: '/illustrations/step-1.svg',
  },
  {
    n: '02',
    title: 'Your tracker builds itself',
    body: 'The AI reads your goal and decides what kind of tracker fits — a counter, a checklist, or a log — and builds it on the spot.',
    illustration: '/illustrations/step-2.svg',
  },
  {
    n: '03',
    title: 'Log progress as you go',
    body: 'Update your tracker by talking to it, same as you started. "Did 20 pushups." "Sold car number 2." It keeps count so you don\'t have to.',
    illustration: '/illustrations/step-3.svg',
  },
  {
    n: '04',
    title: 'Get checked on',
    body: 'Ontrack checks in before your deadline and gives you a straight verdict when it arrives — on track, behind, or done.',
    illustration: '/illustrations/step-4.svg',
  },
]

const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="bg-[#F8FAFB] dark:bg-[#07141E] py-24 px-6 border-b-2 border-[#071E2D]/8 dark:border-white/10">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
          className="text-[#071E2D] dark:text-white tracking-tight leading-tight mb-3"
        >
          How it works
        </h2>
        <p className="font-sans text-[#071E2D]/60 dark:text-slate-400 text-base max-w-md mx-auto">
          Four steps. No setup screens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => (
          <div
            key={s.n}
            className="group bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-6 flex flex-col justify-between transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#071E2D] dark:hover:shadow-[6px_6px_0px_#000000]"
          >
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#071E2D]/10 dark:border-white/10">
                <span
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    lineHeight: 1,
                  }}
                  className="text-[#071E2D] dark:text-white"
                >
                  {s.n}
                </span>
                <span className="w-8 h-8 rounded-full border border-[#071E2D] dark:border-[#1E3A52] bg-[#F8FAFB] dark:bg-[#142B3C] flex items-center justify-center font-bold text-xs text-[#071E2D] dark:text-white">
                  ✓
                </span>
              </div>

              {/* Step Illustration Container */}
              <div className="w-full h-36 bg-[#F2FAF9] dark:bg-[#081723] border-2 border-[#071E2D]/10 dark:border-white/10 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform">
                <img
                  src={s.illustration}
                  alt={`${s.title} illustration`}
                  className="w-full h-full object-contain select-none"
                  loading="lazy"
                />
              </div>

              <h3 className="font-sans font-bold text-[#071E2D] dark:text-white text-base leading-snug mb-2.5">
                {s.title}
              </h3>
              <p className="font-sans text-sm text-[#071E2D]/65 dark:text-slate-300 leading-relaxed">
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

// ─── Section D — Tracker types ────────────────────────────────────────────────

const TrackerTypes: React.FC = () => {
  // Live interactive state for the Counter widget
  const [count, setCount] = useState(32)
  const target = 50
  const percentage = Math.min(100, Math.round((count / target) * 100))

  // Live interactive state for the Checklist widget
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Finish reading assignment', done: true },
    { id: 2, text: 'Review lecture slides', done: true },
    { id: 3, text: 'Submit draft proposal', done: false },
    { id: 4, text: 'Send recap notes to group', done: false },
  ])

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    )
  }

  return (
    <section id="tracker-types" className="bg-white dark:bg-[#07141E] py-24 px-6 border-b-2 border-[#071E2D]/8 dark:border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
            className="text-[#071E2D] dark:text-white tracking-tight mb-3"
          >
            One tracker, built for your goal
          </h2>
          <p className="font-sans text-[#071E2D]/60 dark:text-slate-400 text-base max-w-md mx-auto">
            You don't choose the format. It's decided by what you said.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1 — Counter */}
          <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-7 flex flex-col justify-between transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#071E2D] dark:hover:shadow-[6px_6px_0px_#000000]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#1E293B] dark:bg-[#152B3C] text-white flex items-center justify-center font-bold text-lg mb-5 shadow-sm border border-white/10">
                #
              </div>
              <h3 className="font-sans font-bold text-[#071E2D] dark:text-white text-xl mb-3">Counter</h3>
              <p className="font-sans text-sm text-[#071E2D]/70 dark:text-slate-300 leading-relaxed mb-6">
                For goals with a number attached. Pushups, sales calls, cups of water, pages read. Every update moves you closer to the target.
              </p>
            </div>

            {/* UI example to render: small live counter widget showing "32 / 50" with progress bar at 64% and "+1" button */}
            <div className="bg-[#F8FAFB] dark:bg-[#081723] border-2 border-[#071E2D]/15 dark:border-white/10 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span
                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: '2rem', lineHeight: 1 }}
                    className="text-[#071E2D] dark:text-white"
                  >
                    {count} / {target}
                  </span>
                  <p className="font-sans text-xs text-[#071E2D]/55 dark:text-slate-400 mt-1">target completion</p>
                </div>
                {/* Sieve pill/icon-bubble style +1 button */}
                <button
                  type="button"
                  onClick={() => setCount((prev) => prev + 1)}
                  className="btn-pill btn-pill-secondary !py-1.5 !px-3 !pl-4 text-xs cursor-pointer shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]"
                  aria-label="Increment counter by 1"
                >
                  <span>+1</span>
                  <span className="btn-bubble !w-6 !h-6 bg-white dark:bg-[#182F43] text-[#006D6A] dark:text-[#00C4B3] border border-[#006D6A]/30 dark:border-white/20 font-bold">
                    +
                  </span>
                </button>
              </div>

              {/* Progress bar filled to 64% */}
              <div className="w-full">
                <div className="flex justify-between text-xs text-[#071E2D]/60 dark:text-slate-400 mb-1 font-semibold">
                  <span>Progress</span>
                  <span className="text-[#006D6A] dark:text-[#00C4B3]">{percentage}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#071E2D]/10 dark:bg-white/10 overflow-hidden border border-[#071E2D]/15 dark:border-white/10">
                  <div
                    className="h-full rounded-full bg-[#00C4B3] transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 — Checklist */}
          <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-7 flex flex-col justify-between transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#071E2D] dark:hover:shadow-[6px_6px_0px_#000000]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#1E293B] dark:bg-[#152B3C] text-white flex items-center justify-center font-bold text-lg mb-5 shadow-sm border border-white/10">
                ✓
              </div>
              <h3 className="font-sans font-bold text-[#071E2D] dark:text-white text-xl mb-3">Checklist</h3>
              <p className="font-sans text-sm text-[#071E2D]/70 dark:text-slate-300 leading-relaxed mb-6">
                For goals made of separate tasks. A reading list, a project's to-dos, a week's workouts. Check things off as they're done.
              </p>
            </div>

            {/* UI example to render: small checklist widget with 4 rows, 2 checked and 2 unchecked */}
            <div className="bg-[#F8FAFB] dark:bg-[#081723] border-2 border-[#071E2D]/15 dark:border-white/10 rounded-xl p-4 flex flex-col gap-2.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="flex items-center gap-3 cursor-pointer py-1 select-none"
                >
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-md border-2 flex-shrink-0 transition-colors ${
                      item.done
                        ? 'bg-[#00C4B3] border-[#071E2D] dark:border-[#1E3A52] text-[#071E2D]'
                        : 'border-[#071E2D]/35 dark:border-white/30 bg-white dark:bg-[#0E202D]'
                    }`}
                  >
                    {item.done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5.5l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`font-sans text-xs ${
                      item.done ? 'line-through text-[#071E2D]/40 dark:text-slate-500' : 'text-[#071E2D] dark:text-slate-100 font-medium'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3 — Log */}
          <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-7 flex flex-col justify-between transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#071E2D] dark:hover:shadow-[6px_6px_0px_#000000]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#1E293B] dark:bg-[#152B3C] text-white flex items-center justify-center font-bold text-lg mb-5 shadow-sm border border-white/10">
                ✎
              </div>
              <h3 className="font-sans font-bold text-[#071E2D] dark:text-white text-xl mb-3">Log</h3>
              <p className="font-sans text-sm text-[#071E2D]/70 dark:text-slate-300 leading-relaxed mb-6">
                For anything that doesn't fit a number or a list. Habits, notes, freeform progress. Just say what happened, and it's recorded with a timestamp.
              </p>
            </div>

            {/* UI example to render: 3 stacked entries, each with a short text line and a light-gray timestamp beneath it */}
            <div className="flex flex-col gap-2.5">
              {[
                { text: 'Finished chapter 4', time: 'Tue, 9:40pm' },
                { text: '50 pushups done', time: 'Mon, 8:15am' },
                { text: 'Sold car number 2', time: 'Sun, 3:30pm' },
              ].map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-[#F8FAFB] dark:bg-[#081723] border border-[#071E2D]/15 dark:border-white/10 rounded-xl px-3.5 py-2.5 flex flex-col gap-0.5"
                >
                  <p className="font-sans text-xs font-semibold text-[#071E2D] dark:text-white">{entry.text}</p>
                  <p className="font-sans text-[11px] text-[#071E2D]/45 dark:text-slate-400">{entry.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Section E — Who it's for ─────────────────────────────────────────────────

const audience = [
  {
    title: 'Students',
    body: 'Track reading goals, assignment deadlines, and study targets without another app to configure.',
    illustration: '/illustrations/student.svg',
  },
  {
    title: 'Salespeople',
    body: 'Keep a live count of calls, demos, or closed deals for the week, updated as fast as you can type.',
    illustration: '/illustrations/sales.svg',
  },
  {
    title: 'Fitness-focused people',
    body: 'Log workouts, reps, or daily habits by just saying what you did.',
    illustration: '/illustrations/fitness.svg',
  },
  {
    title: 'Developers',
    badge: 'GitHub integration',
    body: 'Connect GitHub and track commits, PRs, or shipping streaks alongside everything else.',
    illustration: '/illustrations/developer.svg',
  },
]

const WhoItsFor: React.FC = () => {
  return (
    <section id="who-its-for" className="bg-[#F8FAFB] dark:bg-[#07141E] py-24 px-6 border-b-2 border-[#071E2D]/8 dark:border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
            className="text-[#071E2D] dark:text-white tracking-tight leading-tight max-w-2xl mx-auto"
          >
            Built for anyone with a goal and no time to set one up
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audience.map((item) => (
            <div
              key={item.title}
              className="group bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-6 flex flex-col justify-between transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#071E2D] dark:hover:shadow-[6px_6px_0px_#000000]"
            >
              <div>
                {/* Audience Illustration Container */}
                <div className="w-full h-36 bg-[#F2FAF9] dark:bg-[#081723] border-2 border-[#071E2D]/10 dark:border-white/10 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform">
                  <img
                    src={item.illustration}
                    alt={`${item.title} goal tracking illustration`}
                    className="w-full h-full object-contain select-none"
                    loading="lazy"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-sans font-bold text-lg text-[#071E2D] dark:text-white">{item.title}</h3>
                  {item.badge && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] bg-[#F8FAFB] dark:bg-[#142B3C] font-sans text-[11px] font-semibold text-[#071E2D] dark:text-white shadow-[1.5px_1.5px_0px_#071E2D] dark:shadow-[1.5px_1.5px_0px_#000000]">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="font-sans text-sm text-[#071E2D]/65 dark:text-slate-300 leading-relaxed">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section F — Final CTA (Clean Tactile Dark Card — No Blur Glow) ─────────────

const FinalCTA: React.FC = () => (
  <section className="py-24 px-6 bg-white dark:bg-[#07141E]">
    <div className="max-w-5xl mx-auto bg-[#071E2D] dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl shadow-[6px_6px_0px_#071E2D] dark:shadow-[6px_6px_0px_#000000] p-8 sm:p-12 lg:p-14 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Headline, subheadline, and pill CTA */}
        <div className="lg:col-span-7 flex flex-col items-start gap-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#00C4B3] font-sans font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00C4B3] animate-pulse" />
            Zero Setup Required
          </div>

          <h2
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(2.2rem, 4.5vw, 3.25rem)' }}
            className="text-white tracking-tight leading-tight"
          >
            Say your first goal
          </h2>
          <p className="font-sans text-white/70 text-base leading-relaxed max-w-lg">
            Takes less time to start than it took to read this page.
          </p>

          <div className="pt-2">
            <Link to="/signup" className="btn-pill btn-pill-white text-base py-3 px-6 pl-8">
              <span>Start tracking</span>
              <span className="btn-bubble bg-[#00C4B3] text-white">
                <ArrowRight />
              </span>
            </Link>
          </div>

          <p className="font-sans text-xs text-white/50 pt-2">
            Free forever tier · No credit card required · Data saved in browser
          </p>
        </div>

        {/* Right Column: Featured unDraw Organizing Work Illustration Showcase */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <div className="w-full max-w-[380px] bg-[#0E2C3D] dark:bg-[#081723] border-2 border-white/15 rounded-2xl p-5 shadow-[4px_4px_0px_#000000] flex flex-col items-center">
            {/* unDraw Organizing Work Illustration */}
            <div className="w-full h-48 sm:h-52 flex items-center justify-center overflow-hidden">
              <img
                src="/undraw_organizing-work_gmo9.svg"
                alt="Ontrack goal organizing illustration"
                className="w-full h-full object-contain select-none"
                loading="lazy"
              />
            </div>

            {/* Active Milestone Status Chip */}
            <div className="mt-3 w-full bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-white">
              <span className="font-sans font-semibold">Goal: Launch Follow-Through</span>
              <span className="font-sans font-bold text-[#00C4B3] bg-[#00C4B3]/15 px-2.5 py-0.5 rounded-full border border-[#00C4B3]/30">
                On track ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer: React.FC = () => (
  <footer className="bg-white dark:bg-[#06121B] border-t-2 border-[#071E2D]/10 dark:border-white/10 py-14 px-6 transition-colors">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      <div className="md:col-span-6 flex flex-col gap-2">
        <Logo />
        <p className="font-sans text-sm text-[#071E2D]/60 dark:text-slate-300 max-w-sm mt-1">
          Talk to your goal. Watch the tracker build itself.
        </p>
      </div>

      <div className="md:col-span-3 flex flex-col gap-2.5">
        <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#071E2D] dark:text-white">
          Product
        </span>
        <ul className="flex flex-col gap-2 list-none p-0 m-0 font-sans text-sm text-[#071E2D]/65 dark:text-slate-300">
          <li>
            <a href="#how-it-works" className="hover:text-[#071E2D] dark:hover:text-white transition-colors">
              How it works
            </a>
          </li>
          <li>
            <a href="#tracker-types" className="hover:text-[#071E2D] dark:hover:text-white transition-colors">
              Tracker types
            </a>
          </li>
          <li>
            <Link to="/login" className="hover:text-[#071E2D] dark:hover:text-white transition-colors">
              Log in
            </Link>
          </li>
          <li>
            <Link to="/signup" className="hover:text-[#071E2D] dark:hover:text-white transition-colors">
              Sign up
            </Link>
          </li>
        </ul>
      </div>

      <div className="md:col-span-3 flex flex-col gap-2.5">
        <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#071E2D] dark:text-white">
          Company
        </span>
        <ul className="flex flex-col gap-2 list-none p-0 m-0 font-sans text-sm text-[#071E2D]/65 dark:text-slate-300">
          <li>
            <a href="#" className="hover:text-[#071E2D] dark:hover:text-white transition-colors">
              About
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-[#071E2D] dark:hover:text-white transition-colors">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-[#071E2D]/10 dark:border-white/10 text-center">
      <p className="font-sans text-xs text-[#071E2D]/40 dark:text-slate-400">
        © 2026 Ontrack. All rights reserved.
      </p>
    </div>
  </footer>
)

// ─── Main Landing Page ────────────────────────────────────────────────────────

export const Landing: React.FC = () => (
  <div className="flex flex-col min-h-screen bg-[#F8FAFB] dark:bg-[#07141E] text-[#071E2D] dark:text-slate-100 transition-colors">
    <Navbar />
    <main>
      <Hero />
      <HowItWorks />
      <TrackerTypes />
      <WhoItsFor />
      <FinalCTA />
    </main>
    <Footer />
  </div>
)
