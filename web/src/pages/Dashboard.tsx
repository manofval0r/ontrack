import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '../context/GoalContext'
import type { Goal } from '../types'
import { DashboardSidebar, type DashboardNavView } from '../components/dashboard/DashboardSidebar'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { DashboardTrackerCard } from '../components/dashboard/DashboardTrackerCard'
import { DashboardChatPanel } from '../components/dashboard/DashboardChatPanel'
import { GoalDetailSlideOver } from '../components/dashboard/GoalDetailSlideOver'
import { computeGoalStatus } from '../components/common/GoalStatusPill'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const {
    goals,
    user,
    dashboardData,
    createGoal,
    updateGoal,
    logProgress,
    finalizeGoal,
  } = useGoals()

  const [activeNavView, setActiveNavView] = useState<DashboardNavView>('dashboard')
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'goals' | 'chat'>('goals')

  // Calculate dynamic greeting based on time of day
  const getGreeting = (name: string) => {
    const hour = new Date().getHours()
    const cleanName = name || 'Israel'
    if (hour < 12) return `Good morning, ${cleanName}`
    if (hour < 17) return `Good afternoon, ${cleanName}`
    return `Good evening, ${cleanName}`
  }

  // Format today's date (e.g. "Sunday, Sep 27, 2026")
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // Handle sidebar navigation
  const handleSelectNavView = (view: DashboardNavView) => {
    if (view === 'settings') {
      navigate('/settings')
      return
    }
    setActiveNavView(view)
  }

  // Filter goals based on active nav view
  const displayedGoals = goals.filter((g) => {
    if (activeNavView === 'completed') return g.status === 'completed'
    if (activeNavView === 'dashboard') return g.status === 'active'
    return true // 'all' view
  })

  // Stats calculation
  const streakDays = dashboardData?.stats.streak_days || 7
  let shippingRate = 78
  if (goals.length > 0) {
    const onTrackOrDone = goals.filter((g) => {
      const s = computeGoalStatus(g)
      return s === 'on_track' || s === 'done'
    }).length
    shippingRate = Math.round((onTrackOrDone / goals.length) * 100)
  }

  // Handlers for Goal Card and Detail Slide-Over
  const handleOpenDetail = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedGoal(null)
  }

  const handleUpdateGoal = async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    const updated = await updateGoal(id, updates)
    if (selectedGoal?.id === id) {
      setSelectedGoal(updated)
    }
    return updated
  }

  const handleLogProgress = async (goalId: string, value: number | string, note?: string): Promise<Goal> => {
    const updated = await logProgress(goalId, value, note)
    if (selectedGoal?.id === goalId) {
      setSelectedGoal(updated)
    }
    return updated
  }

  const handleMarkDoneEarly = async (goalId: string) => {
    const finalized = await finalizeGoal(goalId)
    if (selectedGoal?.id === goalId) {
      setSelectedGoal(finalized)
    }
  }

  return (
    <div className="h-screen bg-[#F8FAFB] bg-dot-grid flex flex-col font-sans text-[#071E2D] overflow-hidden selection:bg-[#00C4B3] selection:text-[#071E2D]">
      {/* ── Outer Shell: Left Sidebar + Main 2-Column Content ─────── */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto p-3 sm:p-5 lg:p-6 gap-5 lg:gap-6 overflow-hidden">
        {/* Left Sidebar (Desktop only) */}
        <DashboardSidebar
          activeView={activeNavView}
          onSelectView={handleSelectNavView}
          user={user}
        />

        {/* Main Content Workspace (Split Columns on Desktop) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Bar (Within main content area, NOT in sidebar) */}
          <header className="flex-shrink-0 flex items-center justify-between pb-4 sm:pb-5 px-1 border-b-2 border-[#071E2D]/10">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] tracking-tight leading-none"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {getGreeting(user.name)}
              </h1>
              <span className="text-xs text-[#071E2D]/60 font-medium block mt-1">
                {activeNavView === 'completed'
                  ? 'Reviewing your completed goals & milestones'
                  : activeNavView === 'all'
                  ? 'Viewing all active and archived goals'
                  : 'Your active execution radar'}
              </span>
            </div>

            {/* Right: Today's date, small and muted */}
            <div className="text-right">
              <span className="text-xs sm:text-sm font-semibold text-[#071E2D]/55 font-mono">
                {formattedDate}
              </span>
            </div>
          </header>

          {/* ── Two-Column Layout on Desktop (≥1024px) / Tab View on Mobile ── */}
          <div className="flex-1 flex gap-5 lg:gap-6 pt-4 sm:pt-5 min-h-0 overflow-hidden">
            {/* ==================================================== */}
            {/* LEFT COLUMN: Goals Overview Area (60–65% width)      */}
            {/* ==================================================== */}
            <div
              className={`
                flex-1 lg:flex-[1.6] flex-col gap-6 overflow-y-auto pr-1 sm:pr-2
                ${mobileTab === 'goals' ? 'flex' : 'hidden lg:flex'}
              `}
            >
              {/* Section A — Quick stats row */}
              <DashboardStats goals={goals} streakDays={streakDays} />

              {/* Section B — Active goals grid */}
              <div className="flex flex-col gap-4 pb-12">
                <div className="flex items-center justify-between">
                  <h2
                    className="text-lg sm:text-xl font-bold text-[#071E2D] tracking-tight"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    {activeNavView === 'completed'
                      ? 'Completed Goals'
                      : activeNavView === 'all'
                      ? 'All Goals'
                      : 'Active Goals'}
                  </h2>
                  <span className="text-xs font-bold text-[#006D6A] bg-[#ECFEFF] border border-[#00C4B3] px-2.5 py-0.5 rounded-full">
                    {displayedGoals.length} {displayedGoals.length === 1 ? 'tracker' : 'trackers'}
                  </span>
                </div>

                {/* Section C — Empty state (no separate create goal button) */}
                {displayedGoals.length === 0 ? (
                  <div className="py-16 px-6 bg-white border-2 border-[#071E2D] rounded-3xl shadow-[4px_4px_0px_#071E2D] flex flex-col items-center justify-center text-center max-w-md mx-auto my-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#ECFEFF] border-2 border-[#071E2D] flex items-center justify-center text-xl text-[#006D6A] mb-4">
                      🎯
                    </div>
                    <h3
                      className="text-lg font-bold text-[#071E2D]"
                      style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                    >
                      No goals yet.
                    </h3>
                    <p className="text-xs sm:text-sm text-[#071E2D]/70 mt-1 max-w-xs leading-relaxed">
                      Tell the chat what you're working on.
                    </p>
                  </div>
                ) : (
                  /* Live Interactive Trackers Grid: 2 columns on desktop, 1 on mobile */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {displayedGoals.map((goal) => (
                      <DashboardTrackerCard
                        key={goal.id}
                        goal={goal}
                        onOpenDetail={handleOpenDetail}
                        onUpdateGoal={handleUpdateGoal}
                        onLogProgress={handleLogProgress}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ==================================================== */}
            {/* RIGHT COLUMN: Persistent AI Chat Panel (35–40% width) */}
            {/* ==================================================== */}
            <div
              className={`
                w-full lg:w-[380px] xl:w-[440px] flex-shrink-0 h-full pb-2
                ${mobileTab === 'chat' ? 'flex flex-col' : 'hidden lg:flex flex-col'}
              `}
            >
              <DashboardChatPanel
                goals={goals}
                onCreateGoal={createGoal}
                onLogProgress={handleLogProgress}
                onUpdateGoal={handleUpdateGoal}
                shippingRate={shippingRate}
                streakDays={streakDays}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile / Tablet Bottom Tab Bar (<1024px) ────────────────── */}
      <nav
        className="lg:hidden flex-shrink-0 bg-white border-t-2 border-[#071E2D] px-6 py-2.5 flex items-center justify-around shadow-[0_-2px_0px_#071E2D] z-30"
        aria-label="Mobile navigation view toggle"
      >
        <button
          type="button"
          onClick={() => setMobileTab('goals')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            mobileTab === 'goals'
              ? 'text-[#006D6A] bg-[#ECFEFF] border border-[#00C4B3]'
              : 'text-[#071E2D]/60 hover:text-[#071E2D]'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>Goals</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('chat')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            mobileTab === 'chat'
              ? 'text-[#006D6A] bg-[#ECFEFF] border border-[#00C4B3]'
              : 'text-[#071E2D]/60 hover:text-[#071E2D]'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>AI Coach</span>
        </button>
      </nav>

      {/* ── Focused Goal Detail Slide-Over Panel ─────────────────────── */}
      <GoalDetailSlideOver
        goal={selectedGoal}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onUpdateGoal={handleUpdateGoal}
        onLogProgress={handleLogProgress}
        onMarkDoneEarly={handleMarkDoneEarly}
      />
    </div>
  )
}
