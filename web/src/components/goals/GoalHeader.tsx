import React from 'react'
import type { Goal } from '../../types'
import { StatusBadge } from '../common/StatusBadge'

interface GoalHeaderProps {
  goal: Goal
  onFinalize?: () => void
}

export const GoalHeader: React.FC<GoalHeaderProps> = ({ goal, onFinalize }) => {
  // Calculate days remaining
  const calculateDaysLeft = (deadline: string) => {
    const end = new Date(deadline).getTime()
    const now = new Date().getTime()
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { text: 'Deadline Passed', isLate: true }
    if (diff === 0) return { text: 'Due Today', isLate: false }
    return { text: `${diff} Days Left`, isLate: false }
  }

  const daysInfo = calculateDaysLeft(goal.deadline)

  return (
    <div className="flex flex-col gap-4 p-6 sm:p-8 bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusBadge trackerType={goal.goal_type} />
          <StatusBadge domain={goal.domain} />
          <StatusBadge status={goal.status} />
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 border-[#071E2D]
              ${daysInfo.isLate ? 'bg-red-50 text-red-700 shadow-[2px_2px_0px_#dc2626]' : 'bg-[#ECFEFF] text-[#006D6A] shadow-[2px_2px_0px_#071E2D]'}
            `.trim()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{daysInfo.text}</span>
          </div>

          {goal.status === 'active' && onFinalize && (
            <button
              onClick={onFinalize}
              className="btn-pill btn-pill-secondary text-xs !py-1 !px-3"
            >
              <span>Finalize & Score</span>
              <span className="btn-bubble !w-5 !h-5">✓</span>
            </button>
          )}
        </div>
      </div>

      <div>
        <h1
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071E2D] tracking-tight mb-2"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {goal.title}
        </h1>
        {goal.description && (
          <p className="text-sm sm:text-base text-[#071E2D]/75 leading-relaxed max-w-3xl">
            {goal.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 border-t-2 border-[#071E2D]/10 text-xs font-semibold text-[#071E2D]/70">
        <div>
          <span className="text-[#071E2D]/40 uppercase tracking-wider block text-[10px]">Created Date</span>
          <span className="text-[#071E2D] font-bold">{goal.created_at}</span>
        </div>
        <div>
          <span className="text-[#071E2D]/40 uppercase tracking-wider block text-[10px]">Target Date</span>
          <span className="text-[#071E2D] font-bold">{goal.deadline}</span>
        </div>
        <div>
          <span className="text-[#071E2D]/40 uppercase tracking-wider block text-[10px]">Target Metric</span>
          <span className="text-[#006D6A] font-bold">
            {goal.target} {goal.unit || 'units'}
          </span>
        </div>
        <div>
          <span className="text-[#071E2D]/40 uppercase tracking-wider block text-[10px]">Accountability Model</span>
          <span className="text-[#071E2D] font-bold">NVIDIA Nemotron 70B</span>
        </div>
      </div>
    </div>
  )
}
