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
    <div className="min-h-screen bg-[#F5F6F8] font-sans text-gray-900 flex p-3 sm:p-5 lg:p-6 gap-4 sm:gap-6 selection:bg-[#FF5C35] selection:text-white overflow-x-hidden">
      {/* ── Left Rail Dock (Mini vertical floating icon bar matching screenshot) ── */}
      <DashboardRail
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab)
          if (tab === 'settings') navigate('/settings')
        }}
        onToggleChat={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
        onLogout={handleLogout}
      />

      {/* ── Main Dashboard Workspace ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 gap-5 sm:gap-6">
        {/* Top Header Bar: Logo, Pill Nav, Actions, User Profile */}
        <DashboardTopNav
          activePill={activePill}
          onSelectPill={(pill) => {
            setActivePill(pill)
            if (pill === 'account') navigate('/settings')
          }}
          user={user}
          onToggleChat={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
        />

        {/* Dynamic Welcome Greeting Section */}
        <section className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
            {getGreeting(user.name)}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            Stay on top of your tasks, monitor progress, and track status.
          </p>
        </section>

        {/* ── Main Content Grid matching screenshot layout ───────────── */}
        <main className="flex flex-col gap-6">
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
        </main>
      </div>

      {/* ── AI Coach Chat Drawer (Accessible anytime via messages icon or Quick Log) ── */}
      {isChatDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsChatDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col animate-slideInRight">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF5C35] to-[#FF845E] flex items-center justify-center text-white text-xs font-bold">
                  ⚡
                </div>
                <h3 className="font-bold text-sm text-gray-900">Ontrack AI Assistant</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChatDrawerOpen(false)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white transition-colors"
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
