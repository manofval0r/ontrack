import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Goal, TrackerType } from '../../types'
import { GoalCard } from '../goals/GoalCard'
import { EditGoalModal } from '../goals/EditGoalModal'
import { EmptyState } from '../common/EmptyState'
import { useGoals } from '../../context/GoalContext'

/** WIP limit: at most this many goals in the Active lane. Overflow queues in Up Next. */
const WIP_LIMIT = 3

interface ActiveGoalsProps {
  goals: Goal[]
  onCreateGoal?: () => void
  onSelectGoal?: (goal: Goal) => void
}

export const ActiveGoals: React.FC<ActiveGoalsProps> = ({ goals, onCreateGoal, onSelectGoal }) => {
  const { updateGoal, deleteGoal } = useGoals()
  const [filter, setFilter] = useState<'all' | TrackerType>('all')
  const [search, setSearch] = useState('')
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [reordering, setReordering] = useState<string | null>(null)

  const filteredGoals = goals.filter((g) => {
    const matchesFilter = filter === 'all' || g.goal_type === filter
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  // Board lanes (M2): active goals ordered by board_rank, top WIP_LIMIT form
  // the Active lane, overflow queues in Up Next. Rank ties keep fetch order.
  const rankOf = (g: Goal) => (typeof g.board_rank === 'number' ? g.board_rank : 0)
  const orderedActive = filteredGoals
    .filter((g) => g.status === 'active')
    .map((g, i) => ({ g, i }))
    .sort((a, b) => rankOf(a.g) - rankOf(b.g) || a.i - b.i)
    .map(({ g }) => g)
  const activeLane = orderedActive.slice(0, WIP_LIMIT)
  const queued = orderedActive.slice(WIP_LIMIT)
  const doneList = filteredGoals.filter((g) => g.status !== 'active')

  const promoteQueued = async (id: string) => {
    const qi = orderedActive.findIndex((g) => g.id === id)
    if (qi < WIP_LIMIT) return
    const swapWith = orderedActive[Math.min(WIP_LIMIT - 1, orderedActive.length - 1)]
    if (!swapWith || swapWith.id === id) return
    setReordering(id)
    try {
      const qRank = rankOf(orderedActive[qi])
      const sRank = rankOf(swapWith)
      await updateGoal(id, { board_rank: sRank } as Partial<Goal>)
      await updateGoal(swapWith.id, { board_rank: qRank } as Partial<Goal>)
    } finally {
      setReordering(null)
    }
  }

  const renderGoalCard = (g: Goal, queuedItem: boolean) => (
    <div key={g.id} className="flex flex-col gap-2">
      <div onClick={() => onSelectGoal?.(g)} className="cursor-pointer">
        <GoalCard
          goal={g}
          onEdit={(goalToEdit) => {
            setEditingGoal(goalToEdit)
            setIsEditModalOpen(true)
          }}
          onDelete={(goalToDelete) => {
            setEditingGoal(goalToDelete)
            setIsEditModalOpen(true)
          }}
        />
      </div>
      {queuedItem && (
        <button
          type="button"
          disabled={reordering === g.id}
          onClick={() => promoteQueued(g.id)}
          className="self-start px-3.5 py-1.5 rounded-full text-xs font-bold border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] text-[#006D6A] dark:text-[#00C4B3] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
          aria-label={`Bring ${g.title} into the active lane`}
        >
          {reordering === g.id ? 'Moving…' : 'Bring to active ↑'}
        </button>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Header with Filter Pills and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">Workspace Radar</span>
          <h2
            className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white"
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
            className="px-3.5 py-1 text-xs rounded-full border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] outline-none bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 shadow-[1px_1px_0px_#071E2D] dark:shadow-[1px_1px_0px_#000000]"
          />

          {/* Tracker Type Filters */}
          {(['all', 'counter', 'checklist', 'manual'] as const).map((t) => {
            const label = t === 'all' ? 'All Trackers' : t === 'counter' ? 'Counter' : t === 'checklist' ? 'Checklist' : 'Daily Reflection'
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`
                  px-3 py-1 rounded-full text-xs font-bold transition-all border-2
                  ${filter === t
                    ? 'bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] border-[#071E2D] dark:border-[#00C4B3] shadow-[2px_2px_0px_#00C4B3] dark:shadow-[2px_2px_0px_#000000]'
                    : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-slate-200 border-[#071E2D]/20 dark:border-[#1E3A52] hover:border-[#071E2D] dark:hover:border-slate-400'
                  }
                `.trim()}
              >
                {label}
              </button>
            )
          })}
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
        <div className="flex flex-col gap-8">
          {([
            {
              key: 'active',
              title: `Active · ${activeLane.length}/${WIP_LIMIT}`,
              note: 'Your only commitments. Finish or demote before adding more.',
              items: activeLane,
              queued: false,
            },
            {
              key: 'up-next',
              title: `Up Next · ${queued.length} waiting`,
              note: `Queued, not active. Only ${WIP_LIMIT} goals stay active at a time.`,
              items: queued,
              queued: true,
            },
            {
              key: 'done',
              title: `Done · ${doneList.length}`,
              note: 'Completed and missed goals, with their verdicts.',
              items: doneList,
              queued: false,
            },
          ] as const)
            .filter((lane) => lane.items.length > 0)
            .map((lane) => (
              <section key={lane.key} className="flex flex-col gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">
                    {lane.title}
                  </h3>
                  <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-0.5">{lane.note}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lane.items.map((g) => renderGoalCard(g as Goal, lane.queued))}
                </div>
              </section>
            ))}

          {/* Quick Add Goal Card */}
          <Link
            to="/dashboard/chat"
            className="border-2 border-dashed border-[#071E2D]/40 dark:border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 bg-white/50 dark:bg-[#0E202D]/50 hover:bg-white dark:hover:bg-[#0E202D] hover:border-[#00C4B3] dark:hover:border-[#00C4B3] hover:shadow-[4px_4px_0px_#071E2D] dark:hover:shadow-[4px_4px_0px_#000000] transition-all min-h-[200px] group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] bg-[#ECFEFF] dark:bg-[#07141E] flex items-center justify-center text-[#006D6A] dark:text-[#00C4B3] group-hover:bg-[#00C4B3] group-hover:text-[#071E2D] transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-[#071E2D] dark:text-white text-base block group-hover:text-[#006D6A] dark:group-hover:text-[#00C4B3]">
                + Speak or Type a New Goal
              </span>
              <span className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-0.5 block">
                Nemotron parses and generates your tracker instantly
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Edit & Delete Goal Modal */}
      <EditGoalModal
        goal={editingGoal}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingGoal(null)
        }}
        onSave={async (id, updates) => {
          await updateGoal(id, updates)
        }}
        onDelete={async (id) => {
          await deleteGoal(id)
        }}
      />
    </div>
  )
}
