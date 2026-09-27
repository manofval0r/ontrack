import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '../../../context/GoalContext'
import { ActiveGoals } from '../ActiveGoals'

export const ManagePanel: React.FC = () => {
  const navigate = useNavigate()
  const { goals } = useGoals()

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
