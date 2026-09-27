import React from 'react'
import type { Goal } from '../../types'

export type GoalTrackStatus = 'on_track' | 'behind' | 'done'

export function computeGoalStatus(goal: Goal): GoalTrackStatus {
  if (goal.status === 'completed') return 'done'
  if (goal.status === 'failed') return 'behind'

  // If counter target reached
  if (goal.target > 0 && goal.current_value >= goal.target) {
    return 'done'
  }

  // If checklist all items completed
  if (goal.items && goal.items.length > 0 && goal.items.every((it) => it.completed)) {
    return 'done'
  }

  // Check if overdue or lagging behind schedule
  const now = Date.now()
  const deadline = new Date(goal.deadline).getTime()
  const created = new Date(goal.created_at).getTime()
  const totalDuration = Math.max(1, deadline - created)
  const elapsed = Math.max(0, now - created)
  const timeProgress = Math.min(1, elapsed / totalDuration)
  const goalProgress = goal.target > 0 ? goal.current_value / goal.target : 0

  if (now > deadline && goalProgress < 1) {
    return 'behind'
  }

  if (timeProgress > 0.5 && goalProgress < 0.25) {
    return 'behind'
  }

  return 'on_track'
}

interface GoalStatusPillProps {
  status: GoalTrackStatus
  className?: string
}

export const GoalStatusPill: React.FC<GoalStatusPillProps> = ({ status, className = '' }) => {
  if (status === 'done') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#006D6A] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[1px_1px_0px_#071E2D] dark:shadow-[1px_1px_0px_#000000] ${className}`.trim()}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#071E2D]" aria-hidden="true" />
        <span>Done</span>
      </span>
    )
  }

  if (status === 'behind') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#FFFBEB] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-400 border-2 border-[#F59E0B] dark:border-amber-700 shadow-[1px_1px_0px_#B45309] dark:shadow-[1px_1px_0px_#000000] ${className}`.trim()}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" aria-hidden="true" />
        <span>Behind</span>
      </span>
    )
  }

  // on_track default
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#ECFEFF] dark:bg-[#00C4B3]/15 text-[#006D6A] dark:text-[#00C4B3] border-2 border-[#00C4B3] dark:border-[#00C4B3]/60 shadow-[1px_1px_0px_#006D6A] dark:shadow-[1px_1px_0px_#000000] ${className}`.trim()}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#00C4B3]" aria-hidden="true" />
      <span>On track</span>
    </span>
  )
}
