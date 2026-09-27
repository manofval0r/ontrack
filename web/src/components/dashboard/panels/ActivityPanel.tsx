import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '../../../context/GoalContext'
import { EmptyState } from '../../common/EmptyState'
import { allProgressLogs, formatLogTime } from '../../../utils/goalMetrics'

export const ActivityPanel: React.FC = () => {
  const navigate = useNavigate()
  const { goals } = useGoals()
  const logs = allProgressLogs(goals)

  if (!logs.length) {
    return (
      <EmptyState
        title="No activity yet"
        description="Logs appear here when you check in, log progress, or complete a tracker."
        actionLabel="Open AI Chat"
        onAction={() => navigate('/dashboard/chat')}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Activity
        </h2>
        <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-0.5 font-medium">
          Every progress log from your trackers, newest first.
        </p>
      </div>
      <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl divide-y divide-[#071E2D]/10 dark:divide-white/10 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000]">
        {logs.map((log) => (
          <button
            key={log.id}
            type="button"
            onClick={() => navigate(`/dashboard/goal/${log.goal_id}`)}
            className="w-full text-left px-5 py-4 hover:bg-[#E6F7F5]/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#071E2D] dark:text-white truncate">{log.goalTitle}</p>
                <p className="text-xs text-[#071E2D]/70 dark:text-slate-300 mt-1">
                  {log.note || `Logged ${log.value}`}
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#071E2D]/50 dark:text-slate-400 shrink-0">
                {formatLogTime(log.timestamp)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
