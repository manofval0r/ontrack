import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Compass, Home, MessagesSquare, Target, Settings, BookOpen, LayoutDashboard } from 'lucide-react'
import { Logo } from '../components/Logo'

const SITEMAP = [
  { label: 'Home', to: '/', icon: Home, blurb: 'Landing and product tour' },
  { label: 'Docs', to: '/docs', icon: BookOpen, blurb: 'Design, API, guides' },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, blurb: 'Goals, stats, activity' },
  { label: 'Coach chat', to: '/chat', icon: MessagesSquare, blurb: 'Create goals by talking' },
  { label: 'Onboarding', to: '/onboarding', icon: Compass, blurb: 'First-goal walkthrough' },
  { label: 'Settings', to: '/settings', icon: Settings, blurb: 'Profile, audio, integrations' },
]

export const NotFound: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const matches = SITEMAP.filter(
    (s) =>
      !q ||
      s.label.toLowerCase().includes(q) ||
      s.blurb.toLowerCase().includes(q) ||
      s.to.includes(q)
  )

  return (
    <div className="min-h-screen bg-[#071E2D] text-white flex flex-col font-sans selection:bg-[#00C4B3] selection:text-[#071E2D]">
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Logo linkTo="/" />
        <span className="text-xs font-bold uppercase tracking-wider text-[#00C4B3]">Off track · 404</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="max-w-2xl w-full flex flex-col items-center text-center gap-5">
          <svg width="200" height="140" viewBox="0 0 200 150" role="img" aria-label="Lost arrow illustration" className="animate-pulse">
            <path d="M40 110 C 70 110, 95 95, 130 70 M130 70 l-13 3 M130 70 l-2 13" fill="none" stroke="#00C4B3" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="150" cy="45" r="10" fill="none" stroke="#00C4B3" strokeWidth="4" strokeDasharray="6 8" />
            <circle cx="45" cy="35" r="4" fill="#33D6C5" />
            <circle cx="170" cy="115" r="5" fill="#33D6C5" />
          </svg>

          <h1 className="tracking-tight leading-tight" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 'clamp(2.2rem, 6vw, 3.5rem)' }}>
            You are off track.
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-md leading-relaxed">
            This page wandered off the plan — <span className="font-mono text-xs text-white/50">{location.pathname}</span>.
            Your goals and streaks are safe. Pick a trail below.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-pill btn-pill-primary text-base">
              <ArrowLeft className="w-4 h-4" />
              <span>Back on track</span>
            </button>
            <Link to="/" className="btn-pill text-base font-bold px-6 py-3 rounded-full border-2 border-[#00C4B3] text-white hover:bg-[#00C4B3] hover:text-[#071E2D] transition-colors">
              <span>Home</span>
            </Link>
          </div>

          <div className="w-full max-w-md">
            <label htmlFor="sitemap-search" className="sr-only">Search the sitemap</label>
            <input
              id="sitemap-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages… (try goal, chat, docs)"
              className="w-full px-5 py-3 rounded-full border-2 border-[#00C4B3]/60 bg-white/5 text-white text-sm outline-none focus:border-[#00C4B3] placeholder:text-white/40"
            />
          </div>

          <nav aria-label="Sitemap" className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-lg">
            {matches.map((s) => {
              const Icon = s.icon
              return (
                <Link
                  key={s.to}
                  to={s.to}
                  className="flex flex-col items-start gap-1 p-3.5 rounded-2xl border-2 border-white/15 bg-white/5 hover:border-[#00C4B3] hover:bg-white/10 transition-colors text-left min-h-[88px]"
                >
                  <Icon className="w-5 h-5 text-[#00C4B3]" />
                  <span className="font-bold text-sm">{s.label}</span>
                  <span className="text-[11px] text-white/55 leading-snug">{s.blurb}</span>
                </Link>
              )
            })}
            {matches.length === 0 && (
              <p className="col-span-full text-sm text-white/60">
                No pages match “{query}”. Try “chat” or “docs”.
              </p>
            )}
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-white/60 pt-2">
            <Link to="/dashboard" className="hover:text-[#00C4B3] inline-flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>Trackers Overview</span>
            </Link>
            <Link to="/onboarding" className="hover:text-[#00C4B3]">
              <span>New Goal Flow</span>
            </Link>
            <Link to="/settings" className="hover:text-[#00C4B3]">
              <span>Account Settings</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-6 text-xs font-semibold text-white/40">
        OnTrack · Intelligent Autonomous Goal Tracking
      </footer>
    </div>
  )
}
