import React from 'react'
import type { Goal } from '../../types'
import { GoalStatusPill, computeGoalStatus } from '../common/GoalStatusPill'
import { CounterTracker } from '../trackers/CounterTracker'
import { ChecklistTracker } from '../trackers/ChecklistTracker'
import { ManualTracker } from '../trackers/ManualTracker'

interface DashboardTrackerCardProps {
  goal: Goal
  onOpenDetail: (goal: Goal) => void
  onUpdateGoal: (id: string, updates: Partial<Goal>) => Promise<any>
  onLogProgress: (goalId: string, value: number | string, note?: string) => Promise<any>
}

export const DashboardTrackerCard: React.FC<DashboardTrackerCardProps> = ({
  goal,
  onOpenDetail,
  onUpdateGoal,
  onLogProgress,
}) => {
  const status = computeGoalStatus(goal)

  return (
    <div className="bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D] flex flex-col justify-between overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#071E2D]">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b-2 border-[#071E2D]/10 bg-[#F8FAFB] flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onOpenDetail(goal)}
          className="text-left group flex-1"
          aria-label={`Open details for ${goal.title}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#006D6A] block mb-0.5">
            {goal.goal_type === 'counter' ? 'Counter' : goal.goal_type === 'checklist' ? 'Checklist' : 'Daily Log'}
          </span>
          <h3
            className="text-base sm:text-lg font-bold text-[#071E2D] group-hover:text-[#006D6A] transition-colors line-clamp-2 leading-snug cursor-pointer"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {goal.title}
          </h3>
        </button>

        {/* Small status pill in corner: On track / Behind / Done */}
        <div className="flex-shrink-0 pt-0.5">
          <GoalStatusPill status={status} />
        </div>
      </div>

      {/* Card Body: ACTUAL Live Interactive Tracker Component */}
      <div className="p-4 sm:p-5 flex-1">
        {goal.goal_type === 'counter' && (
          <CounterTracker
            goal={goal}
            onUpdate={async (val, note) => {
              await onLogProgress(goal.id, val, note)
            }}
          />
        )}

        {goal.goal_type === 'checklist' && (
          <ChecklistTracker
            goal={goal}
            onUpdateItems={async (items) => {
              const completedCount = items.filter((i) => i.completed).length
              await onUpdateGoal(goal.id, {
                items,
                current_value: completedCount,
                status: completedCount >= items.length ? 'completed' : 'active',
              })
            }}
          />
        )}

        {goal.goal_type === 'manual' && (
          <ManualTracker
            goal={goal}
            onLogReflection={async (ref, sentiment) => {
              await onLogProgress(goal.id, sentiment, ref)
            }}
          />
        )}
      </div>

      {/* Card Footer: Detail Link */}
      <div className="px-4 py-2.5 bg-[#F8FAFB] border-t-2 border-[#071E2D]/10 flex items-center justify-between text-xs text-[#071E2D]/70">
        <span className="font-mono text-[11px]">Due {goal.deadline}</span>
        <button
          type="button"
          onClick={() => onOpenDetail(goal)}
          className="font-bold text-[#071E2D] hover:text-[#006D6A] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View details & history</span>
          <span>→</span>
        </button>
      </div>
    </div>
  )
}
