import React from 'react'
import { Check, Pencil, Trash2 } from 'lucide-react'
import type { Goal } from '../../types'
import { StatusBadge } from '../common/StatusBadge'

interface GoalHeaderProps {
  goal: Goal
  onFinalize?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export const GoalHeader: React.FC<GoalHeaderProps> = ({ goal, onFinalize, onEdit, onDelete }) => {
  // Calculate days remaining
  const calculateDaysLeft = (deadline?: string) => {
    if (!deadline || !deadline.trim()) return { text: 'Ongoing Target', isLate: false }
    const end = new Date(deadline).getTime()
    if (Number.isNaN(end)) return { text: 'Ongoing Target', isLate: false }
    const now = new Date().getTime()
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    if (Number.isNaN(diff)) return { text: 'Ongoing Target', isLate: false }
    if (diff < 0) return { text: 'Deadline Passed', isLate: true }
    if (diff === 0) return { text: 'Due Today', isLate: false }
    return { text: `${diff} Days Left`, isLate: false }
  }

  const daysInfo = calculateDaysLeft(goal.deadline)

  return (
    <div className="flex flex-col gap-4 p-6 sm:p-8 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusBadge trackerType={goal.goal_type} />
          <StatusBadge domain={goal.domain} />
          <StatusBadge status={goal.status} />
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2
              ${daysInfo.isLate
                ? 'bg-red-50 dark:bg-rose-950/40 text-red-700 dark:text-rose-400 border-red-700 dark:border-rose-700 shadow-[2px_2px_0px_#dc2626] dark:shadow-[2px_2px_0px_#000000]'
                : 'bg-[#ECFEFF] dark:bg-[#00C4B3]/15 text-[#006D6A] dark:text-[#00C4B3] border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]'
              }
            `.trim()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{daysInfo.text}</span>
          </div>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white hover:bg-[#F8FAFB] dark:hover:bg-white/5 shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] cursor-pointer transition-all active:translate-y-0.5"
            >
              <Pencil className="w-3.5 h-3.5 text-[#006D6A] dark:text-[#00C4B3]" />
              <span>Edit</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 shadow-[2px_2px_0px_#f43f5e] dark:shadow-[2px_2px_0px_#000000] cursor-pointer transition-all active:translate-y-0.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          {goal.status === 'active' && onFinalize && (
            <button
              type="button"
              onClick={onFinalize}
              className="btn-pill btn-pill-secondary text-xs !py-1 !px-3"
            >
              <span>Finalize & Score</span>
              <span className="btn-bubble !w-5 !h-5">
                <Check className="w-3 h-3" />
              </span>
            </button>
          )}
        </div>
      </div>

      <div>
        <h1
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071E2D] dark:text-white tracking-tight mb-2"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {goal.title}
        </h1>
        {goal.description && (
          <p className="text-sm sm:text-base text-[#071E2D]/75 dark:text-slate-300 leading-relaxed max-w-3xl">
            {goal.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 border-t-2 border-[#071E2D]/10 dark:border-white/10 text-xs font-semibold text-[#071E2D]/70 dark:text-slate-300">
        <div>
          <span className="text-[#071E2D]/40 dark:text-slate-400 uppercase tracking-wider block text-[10px]">Created Date</span>
          <span className="text-[#071E2D] dark:text-white font-bold">{goal.created_at}</span>
        </div>
        <div>
          <span className="text-[#071E2D]/40 dark:text-slate-400 uppercase tracking-wider block text-[10px]">Target Date</span>
          <span className="text-[#071E2D] dark:text-white font-bold">{goal.deadline}</span>
        </div>
        <div>
          <span className="text-[#071E2D]/40 dark:text-slate-400 uppercase tracking-wider block text-[10px]">Target Metric</span>
          <span className="text-[#006D6A] dark:text-[#00C4B3] font-bold">
            {goal.target} {goal.unit || 'units'}
          </span>
        </div>
        <div>
          <span className="text-[#071E2D]/40 dark:text-slate-400 uppercase tracking-wider block text-[10px]">Accountability Model</span>
          <span className="text-[#071E2D] dark:text-white font-bold">NVIDIA Nemotron 70B</span>
        </div>
      </div>
    </div>
  )
}
