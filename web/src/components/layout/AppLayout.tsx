import React, { useState } from 'react'
import { Flame } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '../Logo'
import { useGoals } from '../../context/GoalContext'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  const location = useLocation()
  const { user, dashboardData, activeGoal, audioSettings, updateAudioSettings, isAudioPlaying, stopTTS } = useGoals()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      label: 'Nemotron Chat',
      path: '/chat',
      badge: 'AI',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="3" />
        </svg>
      ),
    },
    {
      label: 'Goal Workspace',
      path: activeGoal ? `/goal/${activeGoal.id}` : '/goal/goal-1',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      label: 'Onboarding Demo',
      path: '/onboarding',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      ),
    },
  ]

  const streak = dashboardData?.stats.streak_days || 7
  const velocity = dashboardData?.stats.velocity_pace || '+24% Pace'

  return (
    <div className="min-h-screen bg-[#F8FAFB] dark:bg-[#07141E] bg-dot-grid flex flex-col font-sans text-[#071E2D] dark:text-slate-100 transition-colors">
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0E202D]/95 backdrop-blur-md border-b-2 border-[#071E2D] dark:border-white/10 px-3 sm:px-5 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between shadow-[0_2px_0px_#071E2D] dark:shadow-[0_2px_0px_#000000]">
        <div className="flex items-center gap-2 sm:gap-5">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl border-2 border-[#071E2D] dark:border-[#1E3A52] bg-[#F3F6F8] dark:bg-[#091824] text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:bg-white"
            aria-label="Toggle navigation menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Logo linkTo="/dashboard" />

          {/* Quick Metrics Badges (md+ only) */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFEFF] dark:bg-[#00C4B3]/15 border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] text-xs font-bold text-[#006D6A] dark:text-[#00C4B3]">
              <Flame className="w-3.5 h-3.5 text-[#006D6A] dark:text-[#00C4B3]" />
              <span className="hidden lg:inline">{streak} Day Streak</span>
              <span className="lg:hidden">{streak}d</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] text-xs font-bold text-[#071E2D] dark:text-white">
              <span className="w-2 h-2 rounded-full bg-[#00C4B3]" />
              <span>{velocity}</span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* TTS Audio Toggle — hidden on small mobile */}
          <button
            onClick={() => {
              if (isAudioPlaying) {
                stopTTS()
              } else {
                updateAudioSettings({ tts_enabled: !audioSettings.tts_enabled })
              }
            }}
            title={audioSettings.tts_enabled ? 'Voice TTS is active' : 'Voice TTS is muted'}
            className={`
              hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
              border-2 border-[#071E2D] text-xs font-bold transition-all
              ${isAudioPlaying
                ? 'bg-[#00C4B3] text-[#071E2D] shadow-[2px_2px_0px_#071E2D] animate-pulse'
                : audioSettings.tts_enabled
                ? 'bg-white text-[#071E2D] shadow-[2px_2px_0px_#071E2D] hover:bg-[#F3F6F8]'
                : 'bg-gray-100 text-gray-500 shadow-[2px_2px_0px_#071E2D]'
              }
            `.trim()}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {audioSettings.tts_enabled ? (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              ) : (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </>
              )}
            </svg>
            <span className="hidden md:inline">{isAudioPlaying ? 'Speaking...' : audioSettings.tts_enabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {/* Quick Create Goal Action */}
          <Link
            to="/chat"
            className="btn-pill btn-pill-primary text-xs py-1.5 px-3 sm:px-3.5"
          >
            <span className="hidden sm:inline">+ New Goal</span>
            <span className="sm:hidden">+</span>
            <span className="btn-bubble !w-5 !h-5 !text-xs">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </Link>

          {/* User Avatar & Name */}
          <Link
            to="/settings"
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#F3F6F8] dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[#00C4B3] border border-[#071E2D] flex items-center justify-center font-bold text-xs text-[#071E2D] flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-[#071E2D] dark:text-white">{user.name}</span>
          </Link>
        </div>
      </header>

      {/* ── Main App Body (Sidebar + Content) ─────────────────────── */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 gap-5 lg:gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 flex-shrink-0 gap-5">
          <nav className="flex flex-col gap-2 p-3 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path.startsWith('/goal') && location.pathname.startsWith('/goal'))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl
                    font-semibold text-sm transition-all duration-150
                    border-2
                    ${isActive
                      ? 'bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] border-[#071E2D] dark:border-[#00C4B3] shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#000000] translate-x-1'
                      : 'bg-transparent text-[#071E2D] dark:text-slate-200 border-transparent hover:bg-[#F3F6F8] dark:hover:bg-white/5 hover:border-[#071E2D]/20'
                    }
                  `.trim()}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#00C4B3] dark:text-[#071E2D]' : 'text-[#071E2D]/70 dark:text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00C4B3] text-[#071E2D] border border-[#071E2D]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* AI Partner status mini-card */}
          <div className="p-4 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C4B3] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">Nemotron AI Online</span>
            </div>
            <p className="text-xs text-[#071E2D]/75 dark:text-slate-300 leading-relaxed">
              Monitoring active goals. Automated check-ins scheduled to maintain velocity.
            </p>
            <Link
              to="/chat"
              className="text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] hover:underline flex items-center gap-1 mt-1 transition-colors"
            >
              Open conversational partner →
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-[#071E2D]/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0E202D] border-r-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[6px_0px_0px_#071E2D] dark:shadow-[6px_0px_0px_#000000] p-6 flex flex-col gap-6 z-10">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#071E2D]/10 dark:border-white/10">
                <Logo linkTo="/dashboard" />
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded-full border border-[#071E2D]/20 text-[#071E2D] dark:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#071E2D] dark:border-[#1E3A52] bg-[#F8FAFB] dark:bg-[#091824] text-[#071E2D] dark:text-white font-bold text-sm shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                {title && (
                  <h1
                    className="text-2xl sm:text-3xl font-bold text-[#071E2D] dark:text-white tracking-tight"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    {title}
                  </h1>
                )}
                {subtitle && <p className="text-sm text-[#071E2D]/70 dark:text-slate-400 mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  )
}
