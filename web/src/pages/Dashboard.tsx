import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '../context/GoalContext'
import type { Goal } from '../types'
import { DashboardRail } from '../components/dashboard/DashboardRail'
import { DashboardTopNav } from '../components/dashboard/DashboardTopNav'
import { DashboardCards } from '../components/dashboard/DashboardCards'
import { DashboardStatGrid } from '../components/dashboard/DashboardStatGrid'
import { DashboardChart } from '../components/dashboard/DashboardChart'
import { DashboardRecentActivity } from '../components/dashboard/DashboardRecentActivity'
import { DashboardChatPanel } from '../components/dashboard/DashboardChatPanel'
import { GoalDetailSlideOver } from '../components/dashboard/GoalDetailSlideOver'
import { ActivityPanel } from '../components/dashboard/panels/ActivityPanel'
import { ManagePanel } from '../components/dashboard/panels/ManagePanel'
import { ProgramPanel } from '../components/dashboard/panels/ProgramPanel'
import { ReportsPanel } from '../components/dashboard/panels/ReportsPanel'
import { CommunityPanel } from '../components/dashboard/panels/CommunityPanel'
import { IntegrationsPanel } from '../components/dashboard/panels/IntegrationsPanel'

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

  const [activeTab, setActiveTab] = useState('overview')
  const [activePill, setActivePill] = useState('overview')
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false)

  // Derive the active view from both rail tab and top pill
  // Top pill takes precedence; rail tab maps to equivalent views
  const activeView = activePill !== 'overview' ? activePill : activeTab

  // Dynamic greeting based on time of day
  const getGreeting = (name: string) => {
    const hour = new Date().getHours()
    const cleanName = name ? name.split(' ')[0] : 'Israel'
    if (hour < 12) return `Good morning, ${cleanName}`
    if (hour < 17) return `Good afternoon, ${cleanName}`
    return `Good evening, ${cleanName}`
  }

  const streakDays = dashboardData?.stats.streak_days || 14
  const completedGoalsCount = goals.filter((g) => g.status === 'completed').length
  const pendingGoalsCount = goals.filter((g) => g.status === 'active').length

  const handleOpenDetail = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedGoal(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('ontrack_token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] dark:bg-[#07141E] bg-dot-grid font-sans text-[#071E2D] dark:text-slate-100 flex p-3 sm:p-5 lg:p-6 gap-4 sm:gap-6 selection:bg-[#00C4B3] selection:text-[#071E2D] overflow-x-hidden transition-colors">
      {/* ── Left Rail Dock (Sticky & Fixed height on desktop — NEVER scrolls with the page) ── */}
      <aside className="hidden lg:flex flex-col sticky top-4 sm:top-5 lg:top-6 h-[calc(100vh-2rem)] sm:h-[calc(100vh-2.5rem)] lg:h-[calc(100vh-3rem)] shrink-0 z-30 self-start">
        <DashboardRail
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'settings') {
              navigate('/settings')
              return
            }
            setActiveTab(tab)
            // Map rail tabs to top-nav pill equivalents
            const railToPill: Record<string, string> = {
              overview: 'overview',
              calendar: 'activity',
              goals: 'manage',
              team: 'program',
              integrations: 'reports',
            }
            const mappedPill = railToPill[tab]
            if (mappedPill) setActivePill(mappedPill)
          }}
          onToggleChat={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Main Dashboard Workspace ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 gap-5 sm:gap-6">
        {/* Top Header Bar: Logo, Pill Nav, Actions, User Profile */}
        <DashboardTopNav
          activePill={activePill}
          onSelectPill={(pill) => {
            setActivePill(pill)
            if (pill === 'account') {
              navigate('/settings')
              return
            }
            // Keep rail tab in sync
            const pillToRail: Record<string, string> = {
              overview: 'overview',
              activity: 'calendar',
              manage: 'goals',
              program: 'team',
              reports: 'integrations',
            }
            const mapped = pillToRail[pill]
            if (mapped) setActiveTab(mapped)
          }}
          user={user}
          onToggleChat={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
        />

        {/* Dynamic Welcome Greeting Section */}
        <section className="flex flex-col gap-1">
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {getGreeting(user.name)}
          </h1>
          <p className="text-xs sm:text-sm text-[#071E2D]/70 dark:text-slate-400 font-medium">
            Stay on top of your objectives, monitor velocity, and log progress effortlessly.
          </p>
        </section>

        {/* ── Main Content Grid with OnTrack Tactile Design ───────────── */}
        <main className="flex flex-col gap-6">
          {/* ── OVERVIEW (default) ──────────────────────────── */}
          {activeView === 'overview' && (
            <>
              {/* Row 1: 3 Main Cards / Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                {/* Left Column (Total Execution Hero Card): spans 4 columns on desktop */}
                <div className="lg:col-span-4 flex flex-col">
                  <DashboardCards
                    goals={goals}
                    onOpenQuickLog={() => setIsChatDrawerOpen(true)}
                    onOpenNewGoal={() => setIsChatDrawerOpen(true)}
                    onSelectGoal={handleOpenDetail}
                  />
                </div>

                {/* Middle Column (2x2 Stat Matrix): spans 4 columns on desktop */}
                <div className="lg:col-span-4 flex flex-col">
                  <DashboardStatGrid
                    completedCount={completedGoalsCount ? completedGoalsCount * 150 : 950}
                    pendingCount={pendingGoalsCount ? pendingGoalsCount * 120 : 700}
                    streakDays={streakDays}
                    totalScore={850}
                  />
                </div>

                {/* Right Column (Total Velocity Stacked Bar Chart): spans 4 columns on desktop */}
                <div className="lg:col-span-4 flex flex-col">
                  <DashboardChart />
                </div>
              </div>

              {/* Row 2: Recent Activities Table */}
              <div className="w-full">
                <DashboardRecentActivity
                  onSelectGoal={(id) => {
                    const g = goals.find((item) => item.id === id)
                    if (g) handleOpenDetail(g)
                  }}
                />
              </div>
            </>
          )}

          {/* ── ACTIVITY ──────────────────────────────────── */}
          {activeView === 'activity' && <ActivityPanel />}

          {/* ── MANAGE ────────────────────────────────────── */}
          {activeView === 'manage' && (
            <ManagePanel
              onSelectGoal={handleOpenDetail}
              onOpenChat={() => setIsChatDrawerOpen(true)}
            />
          )}

          {/* ── PROGRAM ───────────────────────────────────── */}
          {activeView === 'program' && <ProgramPanel />}

          {/* ── REPORTS ───────────────────────────────────── */}
          {activeView === 'reports' && <ReportsPanel />}

          {/* ── COMMUNITY (rail: team) ────────────────────── */}
          {activeView === 'team' && <CommunityPanel />}

          {/* ── INTEGRATIONS (rail only) ──────────────────── */}
          {activeView === 'integrations' && <IntegrationsPanel />}
        </main>
      </div>

      {/* ── AI Coach Chat Drawer (Accessible anytime via messages icon or Quick Log) ── */}
      {isChatDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#071E2D]/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsChatDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container with OnTrack styling */}
          <div className="relative w-full max-w-md bg-white dark:bg-[#0E202D] border-l-2 border-[#071E2D] dark:border-[#1E3A52] h-full shadow-2xl z-10 flex flex-col">
            <div className="p-4 border-b-2 border-[#071E2D] dark:border-white/10 flex items-center justify-between bg-[#F8FAFB] dark:bg-[#091824]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00C4B3] border-2 border-[#071E2D] flex items-center justify-center text-[#071E2D] text-xs font-black shadow-[1px_1px_0px_#071E2D]">
                  ⚡
                </div>
                <h3
                  className="font-bold text-sm text-[#071E2D] dark:text-white"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  Ontrack AI Accountability Coach
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
                shippingRate={84}
                streakDays={streakDays}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Focused Goal Detail Slide-Over ──────────────────────────── */}
      <GoalDetailSlideOver
        goal={selectedGoal}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onUpdateGoal={async (id, updates) => {
          const updated = await updateGoal(id, updates)
          if (selectedGoal?.id === id) setSelectedGoal(updated)
        }}
        onLogProgress={async (goalId, value, note) => {
          const updated = await logProgress(goalId, value, note)
          if (selectedGoal?.id === goalId) setSelectedGoal(updated)
        }}
        onMarkDoneEarly={async (goalId) => {
          const finalized = await finalizeGoal(goalId)
          if (selectedGoal?.id === goalId) setSelectedGoal(finalized)
        }}
      />
    </div>
  )
}
