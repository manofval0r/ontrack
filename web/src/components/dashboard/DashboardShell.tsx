import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useGoals } from '../../context/GoalContext'
import { firstName } from '../../utils/auth'
import { DashboardRail } from './DashboardRail'
import { DashboardTopNav } from './DashboardTopNav'
import { DashboardChatPanel } from './DashboardChatPanel'

const RAIL_PATH: Record<string, string> = {
  overview: '/dashboard',
  calendar: '/dashboard/calendar',
  goals: '/dashboard/goals',
  team: '/dashboard/community',
  integrations: '/dashboard/integrations',
  settings: '/dashboard/account',
}

const PILL_PATH: Record<string, string> = {
  overview: '/dashboard',
  activity: '/dashboard/activity',
  manage: '/dashboard/goals',
  program: '/dashboard/program',
  reports: '/dashboard/reports',
  account: '/dashboard/account',
  calendar: '/dashboard/calendar',
  community: '/dashboard/community',
  integrations: '/dashboard/integrations',
}

function viewFromPath(pathname: string): { rail: string; pill: string } {
  if (pathname.startsWith('/dashboard/calendar')) return { rail: 'calendar', pill: 'calendar' }
  if (pathname.startsWith('/dashboard/activity')) return { rail: 'overview', pill: 'activity' }
  if (pathname.startsWith('/dashboard/goals')) return { rail: 'goals', pill: 'manage' }
  if (pathname.startsWith('/dashboard/program')) return { rail: 'overview', pill: 'program' }
  if (pathname.startsWith('/dashboard/reports')) return { rail: 'overview', pill: 'reports' }
  if (pathname.startsWith('/dashboard/community')) return { rail: 'team', pill: 'community' }
  if (pathname.startsWith('/dashboard/integrations')) return { rail: 'integrations', pill: 'integrations' }
  if (pathname.startsWith('/dashboard/account')) return { rail: 'settings', pill: 'account' }
  if (pathname.startsWith('/dashboard/chat')) return { rail: 'messages', pill: 'overview' }
  if (pathname.startsWith('/dashboard/goal')) return { rail: 'goals', pill: 'manage' }
  return { rail: 'overview', pill: 'overview' }
}

export const DashboardShell: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    goals,
    user,
    dashboardData,
    createGoal,
    updateGoal,
    logProgress,
  } = useGoals()

  const { rail, pill } = viewFromPath(location.pathname)
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(location.pathname.startsWith('/dashboard/chat'))

  const streakDays = dashboardData?.stats.streak_days ?? 0
  const greetingName = firstName(user)

  const getGreeting = () => {
    const hour = new Date().getHours()
    const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    return greetingName ? `${hello}, ${greetingName}` : hello
  }

  const handleLogout = () => {
    localStorage.removeItem('ontrack_token')
    localStorage.removeItem('ontrack_refresh_token')
    localStorage.removeItem('ontrack_user_profile')
    navigate('/login')
  }

  const showGreeting = location.pathname === '/dashboard' || location.pathname === '/dashboard/'

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFB] dark:bg-[#07141E] bg-dot-grid font-sans text-[#071E2D] dark:text-slate-100 flex p-2 sm:p-4 lg:p-6 gap-3 sm:gap-5 lg:gap-6 selection:bg-[#00C4B3] selection:text-[#071E2D] transition-colors">
      <aside className="hidden lg:flex flex-col h-full shrink-0 z-30">
        <DashboardRail
          activeTab={rail}
          onSelectTab={(tab) => {
            const path = RAIL_PATH[tab]
            if (path) navigate(path)
          }}
          onToggleChat={() => {
            setIsChatDrawerOpen(true)
            if (!location.pathname.startsWith('/dashboard/chat')) {
              /* keep current page; drawer overlays */
            }
          }}
          onLogout={handleLogout}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Fixed Top Navigation - does NOT move when content is scrolled */}
        <header className="shrink-0 z-20 pb-2 sm:pb-3">
          <DashboardTopNav
            activePill={pill}
            onSelectPill={(id) => {
              const path = PILL_PATH[id]
              if (path) navigate(path)
            }}
            user={user}
            goals={goals}
            streakDays={streakDays}
            onToggleChat={() => setIsChatDrawerOpen(true)}
          />
        </header>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-0.5 sm:pr-1 pb-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {showGreeting && (
            <section className="flex flex-col gap-1 mb-4 sm:mb-5">
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {getGreeting()}
              </h1>
              <p className="text-xs sm:text-sm text-[#071E2D]/70 dark:text-slate-400 font-medium">
                Stay on top of your objectives, monitor velocity, and log progress effortlessly.
              </p>
            </section>
          )}

          <main className="flex flex-col gap-4 sm:gap-6">
            <Outlet />
          </main>
        </div>
      </div>

      {isChatDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-[#071E2D]/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsChatDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full sm:max-w-md bg-white dark:bg-[#0E202D] border-l-2 border-[#071E2D] dark:border-[#1E3A52] h-full shadow-2xl z-10 flex flex-col">
            <div className="p-4 border-b-2 border-[#071E2D] dark:border-white/10 flex items-center justify-between bg-[#F8FAFB] dark:bg-[#091824]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00C4B3] border-2 border-[#071E2D] flex items-center justify-center text-[#071E2D] text-xs font-black shadow-[1px_1px_0px_#071E2D]">
                  ⚡
                </div>
                <h3
                  className="font-bold text-sm text-[#071E2D] dark:text-white"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  OnTrack AI Accountability Coach
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChatDrawerOpen(false)}
                className="w-8 h-8 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center text-[#071E2D] dark:text-white hover:bg-[#E6F7F5] dark:hover:bg-white/5 shadow-[1px_1px_0px_#071E2D] dark:shadow-[1px_1px_0px_#000000] transition-colors cursor-pointer"
                aria-label="Close assistant"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-2 overflow-hidden">
              <DashboardChatPanel
                goals={goals}
                onCreateGoal={createGoal}
                onLogProgress={logProgress}
                onUpdateGoal={updateGoal}
                shippingRate={executionPercentSafe(goals)}
                streakDays={streakDays}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function executionPercentSafe(goals: { status: string; target: number; current_value: number }[]): number {
  const active = goals.filter((g) => g.status === 'active')
  const pool = active.length ? active : goals
  if (!pool.length) return 0
  const rates = pool.map((g) => (g.target > 0 ? Math.min(1, g.current_value / g.target) : 0))
  return Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100)
}
