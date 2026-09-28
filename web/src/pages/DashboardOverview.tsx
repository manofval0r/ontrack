import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '../context/GoalContext'
import type { Goal } from '../types'
import { executionPercent } from '../utils/goalMetrics'
import { DashboardCards } from '../components/dashboard/DashboardCards'
import { DashboardStatGrid } from '../components/dashboard/DashboardStatGrid'
import { DashboardChart } from '../components/dashboard/DashboardChart'
import { DashboardRecentActivity } from '../components/dashboard/DashboardRecentActivity'
import { GoalDetailSlideOver } from '../components/dashboard/GoalDetailSlideOver'

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate()
  const { goals, dashboardData, updateGoal, deleteGoal, logProgress, finalizeGoal } = useGoals()
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

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
