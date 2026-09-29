import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '../../../context/GoalContext'
import { ActiveGoals } from '../ActiveGoals'
import { Loader } from '../../common/Loader'
import { AlertCircle, RefreshCw } from 'lucide-react'

export const ManagePanel: React.FC = () => {
  const navigate = useNavigate()
  const { goals, loading, error, fetchGoals } = useGoals()

  if (loading && !goals.length) {
    return (
      <div className="py-20 flex justify-center">
        <Loader label="Loading your trackers..." />
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
          Could not load trackers
        </h3>
        <p className="text-xs text-[#071E2D]/70 dark:text-slate-300 max-w-sm leading-relaxed">
          We had trouble retrieving your active tracker records. Please check your connection and retry.
        </p>
        <button
          type="button"
          onClick={() => fetchGoals()}
          className="btn-pill btn-pill-primary text-xs !py-2 !px-5 inline-flex items-center gap-2 cursor-pointer mt-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading Trackers</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Trackers
        </h2>
        <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-0.5 font-medium">
          Search and open any goal in this workspace.
        </p>
      </div>
      <ActiveGoals
        goals={goals}
        onCreateGoal={() => navigate('/dashboard/chat')}
        onSelectGoal={(g) => navigate(`/dashboard/goal/${g.id}`)}
      />
    </div>
  )
}
