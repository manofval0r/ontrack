import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useGoals } from '../context/GoalContext'
import { Loader } from '../components/common/Loader'
import type { Goal } from '../types'
import { executionPercent } from '../utils/goalMetrics'
import { DashboardCards } from '../components/dashboard/DashboardCards'
import { DashboardStatGrid } from '../components/dashboard/DashboardStatGrid'
import { DashboardChart } from '../components/dashboard/DashboardChart'
import { DashboardRecentActivity } from '../components/dashboard/DashboardRecentActivity'
import { GoalDetailSlideOver } from '../components/dashboard/GoalDetailSlideOver'

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate()
  const {
    goals,
    dashboardData,
    loading,
    error,
    fetchDashboard,
    updateGoal,
    deleteGoal,
    logProgress,
    finalizeGoal,
  } = useGoals()
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  if (loading && !goals.length) {
    return (
      <div className="py-24 flex justify-center">
        <Loader label="Warming up dashboard & velocity metrics..." />
      </div>
    )
  }

  if (error && !goals.length) {
    return (
      <div className="p-8 rounded-3xl border-2 border-[#071E2D] dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-center flex flex-col items-center gap-3 shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000]">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 border-2 border-[#071E2D] dark:border-rose-700 flex items-center justify-center text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h3
          className="text-lg sm:text-xl font-extrabold text-[#071E2D] dark:text-white"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Could not load dashboard data
        </h3>
        <p className="text-xs text-[#071E2D]/70 dark:text-slate-300 max-w-sm leading-relaxed">
          We encountered an issue syncing your dashboard metrics. Please check your connection and retry.
        </p>
        <button
          type="button"
          onClick={() => fetchDashboard()}
          className="btn-pill btn-pill-primary text-xs !py-2 !px-5 inline-flex items-center gap-2 cursor-pointer mt-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading Dashboard</span>
        </button>
      </div>
    )
  }

  const streakDays = dashboardData?.stats.streak_days ?? 0
  const completedGoalsCount = goals.filter((g) => g.status === 'completed').length
  const pendingGoalsCount = goals.filter((g) => g.status === 'active').length
  const score = dashboardData?.stats.accountability_score ?? 0

  const handleOpenDetail = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsDetailOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch">
        <div className="md:col-span-1 lg:col-span-4 flex flex-col">
          <DashboardCards
            goals={goals}
            onOpenQuickLog={() => navigate('/dashboard/chat')}
            onOpenNewGoal={() => navigate('/dashboard/chat')}
            onSelectGoal={handleOpenDetail}
          />
        </div>
        <div className="md:col-span-1 lg:col-span-4 flex flex-col">
          <DashboardStatGrid
            completedCount={completedGoalsCount}
            pendingCount={pendingGoalsCount}
            streakDays={streakDays}
            totalScore={score || Math.round(executionPercent(goals))}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-4 flex flex-col">
          <DashboardChart goals={goals} />
        </div>
      </div>

      <div className="w-full min-w-0">
        <DashboardRecentActivity
          goals={goals}
          onDeleteGoal={deleteGoal}
          onSelectGoal={(id) => {
            const g = goals.find((item) => item.id === id)
            if (g) handleOpenDetail(g)
          }}
        />
      </div>

      <GoalDetailSlideOver
        goal={selectedGoal}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedGoal(null)
        }}
        onUpdateGoal={async (id, updates) => {
          const updated = await updateGoal(id, updates)
          if (selectedGoal?.id === id) setSelectedGoal(updated)
        }}
        onDeleteGoal={async (id) => {
          await deleteGoal(id)
          setIsDetailOpen(false)
          setSelectedGoal(null)
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
    </>
  )
}
