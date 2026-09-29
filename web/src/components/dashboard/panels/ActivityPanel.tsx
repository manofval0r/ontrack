import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '../../../context/GoalContext'
import { EmptyState } from '../../common/EmptyState'
import { Loader } from '../../common/Loader'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { allProgressLogs, formatLogTime } from '../../../utils/goalMetrics'

export const ActivityPanel: React.FC = () => {
  const navigate = useNavigate()
  const { goals, loading, error, fetchGoals } = useGoals()
  const logs = allProgressLogs(goals)

  if (loading && !goals.length) {
    return (
      <div className="py-20 flex justify-center">
        <Loader label="Loading recent activity stream..." />
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
          Could not sync activity
        </h3>
        <p className="text-xs text-[#071E2D]/70 dark:text-slate-300 max-w-sm leading-relaxed">
          We encountered a connection issue while fetching your activity history. Please try again.
        </p>
        <button
          type="button"
          onClick={() => fetchGoals()}
          className="btn-pill btn-pill-primary text-xs !py-2 !px-5 inline-flex items-center gap-2 cursor-pointer mt-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Activity Sync</span>
        </button>
      </div>
    )
  }

  if (!logs.length) {
    return (
      <EmptyState
        title="No activity yet"
        description="No activity yet — log your first update in chat"
        actionLabel="Log update in chat"
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
