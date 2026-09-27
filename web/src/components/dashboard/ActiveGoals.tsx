import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Goal, TrackerType } from '../../types'
import { GoalCard } from '../goals/GoalCard'
import { EmptyState } from '../common/EmptyState'

interface ActiveGoalsProps {
  goals: Goal[]
  onCreateGoal?: () => void
  onSelectGoal?: (goal: Goal) => void
}

export const ActiveGoals: React.FC<ActiveGoalsProps> = ({ goals, onCreateGoal, onSelectGoal }) => {
  const [filter, setFilter] = useState<'all' | TrackerType>('all')
  const [search, setSearch] = useState('')

  const filteredGoals = goals.filter((g) => {
    const matchesFilter = filter === 'all' || g.goal_type === filter
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex flex-col gap-5">
      {/* Header with Filter Pills and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A]">Workspace Radar</span>
          <h2
            className="text-xl sm:text-2xl font-bold text-[#071E2D]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Active Trackers ({filteredGoals.length})
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search goals..."
            className="px-3 py-1 text-xs rounded-full border-2 border-[#071E2D]/20 focus:border-[#00C4B3] outline-none bg-white text-[#071E2D] placeholder:text-[#071E2D]/40"
          />

          {/* Tracker Type Filters */}
          {(['all', 'counter', 'checklist', 'manual'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`
                px-3 py-1 rounded-full text-xs font-bold capitalize transition-all border-2
                ${filter === t
                  ? 'bg-[#071E2D] text-white border-[#071E2D] shadow-[2px_2px_0px_#00C4B3]'
                  : 'bg-white text-[#071E2D] border-[#071E2D]/20 hover:border-[#071E2D]'
                }
              `.trim()}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Goals or Empty State */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          title="No Matching Goals Found"
          description="You don't have any goals matching the selected filter. Create a new goal with Nemotron AI in seconds."
          actionLabel="Create New Goal with AI"
          onAction={onCreateGoal || (() => {})}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((g) => (
            <div key={g.id} onClick={() => onSelectGoal?.(g)} className="cursor-pointer">
              <GoalCard goal={g} />
            </div>
          ))}


          {/* Quick Add Goal Card */}
          <Link
            to="/chat"
            className="border-2 border-dashed border-[#071E2D]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 bg-white/50 hover:bg-white hover:border-[#00C4B3] hover:shadow-[4px_4px_0px_#071E2D] transition-all min-h-[200px] group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-[#071E2D] bg-[#ECFEFF] flex items-center justify-center text-[#006D6A] group-hover:bg-[#00C4B3] group-hover:text-[#071E2D] transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-[#071E2D] text-base block group-hover:text-[#006D6A]">
                + Speak or Type a New Goal
              </span>
              <span className="text-xs text-[#071E2D]/60 mt-0.5 block">
                Nemotron parses and generates your tracker instantly
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
