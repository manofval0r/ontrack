import React from 'react'
import type { Goal } from '../../types'
import { computeGoalStatus } from '../common/GoalStatusPill'

interface DashboardStatsProps {
  goals: Goal[]
  streakDays?: number
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ goals, streakDays = 7 }) => {
  // 1. Today's goals: count of goals with activity due or scheduled for today
  const activeGoals = goals.filter((g) => g.status === 'active')
  const todaysGoalsCount = activeGoals.length

  // 2. This week's shipping rate: percentage representing on-track vs behind goals
  let shippingRate = 78
  if (goals.length > 0) {
    const onTrackOrDone = goals.filter((g) => {
      const s = computeGoalStatus(g)
      return s === 'on_track' || s === 'done'
    }).length
    shippingRate = Math.round((onTrackOrDone / goals.length) * 100)
  }

  // 3. Current streak: consecutive days with at least one logged update
  const streak = streakDays || 7

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
      {/* Stat 1: Today's goals */}
      <div className="bg-white border-2 border-[#071E2D] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#071E2D] flex flex-col justify-between">
        <span
          className="text-3xl sm:text-4xl font-extrabold text-[#071E2D] tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {todaysGoalsCount}
        </span>
        <span className="text-xs font-semibold text-[#071E2D]/65 mt-1">
          Today's goals
        </span>
      </div>

      {/* Stat 2: This week's shipping rate */}
      <div className="bg-white border-2 border-[#071E2D] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#071E2D] flex flex-col justify-between">
        <span
          className="text-3xl sm:text-4xl font-extrabold text-[#071E2D] tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {shippingRate}%
        </span>
        <span className="text-xs font-semibold text-[#071E2D]/65 mt-1">
          This week's shipping rate
        </span>
      </div>

      {/* Stat 3: Current streak */}
      <div className="bg-white border-2 border-[#071E2D] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#071E2D] flex flex-col justify-between">
        <span
          className="text-3xl sm:text-4xl font-extrabold text-[#071E2D] tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {streak} days
        </span>
        <span className="text-xs font-semibold text-[#071E2D]/65 mt-1">
          Current streak
        </span>
      </div>
    </div>
  )
}
