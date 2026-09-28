import React from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import type { Goal } from '../../types'
import { StatusBadge } from '../common/StatusBadge'

interface GoalCardProps {
  goal: Goal
  onEdit?: (goal: Goal) => void
  onDelete?: (goal: Goal) => void
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => {
  const percent = goal.target > 0 ? Math.min(100, Math.round((goal.current_value / goal.target) * 100)) : 100

  // Calculate days remaining
  const calculateDaysLeft = (deadline?: string) => {
    if (!deadline || !deadline.trim()) return { text: 'Ongoing', isLate: false }
    const end = new Date(deadline).getTime()
    if (Number.isNaN(end)) return { text: 'Ongoing', isLate: false }
    const now = new Date().getTime()
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    if (Number.isNaN(diff)) return { text: 'Ongoing', isLate: false }
    if (diff < 0) return { text: 'Past due', isLate: true }
    if (diff === 0) return { text: 'Due today', isLate: false }
    return { text: `${diff}d left`, isLate: false }
  }

  const daysInfo = calculateDaysLeft(goal.deadline)

  return (
    <Link
      to={`/dashboard/goal/${goal.id}`}
      className="group bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-6 flex flex-col justify-between gap-5 transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#071E2D] dark:hover:shadow-[6px_6px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#071E2D] dark:active:shadow-[2px_2px_0px_#000000]"
    >
      {/* Top badges & Quick Actions */}
      <div className="flex items-center justify-between gap-2">
        <StatusBadge trackerType={goal.goal_type} />
        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit(goal)
              }}
              className="p-1 rounded-md text-[#071E2D]/60 dark:text-slate-400 hover:text-[#006D6A] dark:hover:text-[#00C4B3] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Edit Goal"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(goal)
              }}
              className="p-1 rounded-md text-rose-500/70 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Delete Goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span
            className={`
              text-[11px] font-bold px-2.5 py-0.5 rounded-full border
              ${daysInfo.isLate
                ? 'bg-red-50 dark:bg-rose-950/40 text-red-700 dark:text-rose-400 border-red-700 dark:border-rose-700'
                : 'bg-[#F3F6F8] dark:bg-[#091824] text-[#071E2D] dark:text-slate-200 border-[#071E2D] dark:border-[#1E3A52]'
              }
            `.trim()}
          >
            {daysInfo.text}
          </span>
        </div>
      </div>

      {/* Title & Domain */}
      <div className="flex flex-col gap-1.5">
        <h3
          className="text-lg font-bold text-[#071E2D] dark:text-white group-hover:text-[#006D6A] dark:group-hover:text-[#00C4B3] transition-colors line-clamp-2"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-xs text-[#071E2D]/70 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {goal.description}
          </p>
        )}
      </div>

      {/* Progress Metric & Bar */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#071E2D]/10 dark:border-white/10">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-extrabold text-[#071E2D] dark:text-white">
            {goal.goal_type === 'manual'
              ? `${(goal.progress_logs || []).length} reflections logged`
              : `${goal.current_value} / ${goal.target} ${goal.unit || ''}`}
          </span>
          <span className="font-bold text-[#006D6A] dark:text-[#00C4B3]">{percent}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#E5E7EB] dark:bg-[#091824] border border-[#071E2D] dark:border-[#1E3A52] overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-[#00C4B3] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between text-xs text-[#071E2D]/60 dark:text-slate-400 pt-1">
        <span className="capitalize text-[11px] font-semibold">{goal.domain}</span>
        <span className="font-bold text-[#071E2D] dark:text-white group-hover:text-[#006D6A] dark:group-hover:text-[#00C4B3] group-hover:translate-x-1 transition-all flex items-center gap-1">
          Open Workspace →
        </span>
      </div>
    </Link>
  )
}
