import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '../../../context/GoalContext'
import { EmptyState } from '../../common/EmptyState'
import { GoalCard } from '../../goals/GoalCard'

const DOMAIN_LABEL: Record<string, string> = {
  sales: 'Sales',
  engineering: 'Engineering',
  fitness: 'Fitness',
  learning: 'Learning',
  mindset: 'Mindset',
  general: 'General',
}

export const ProgramPanel: React.FC = () => {
  const navigate = useNavigate()
  const { goals } = useGoals()

  if (!goals.length) {
    return (
      <EmptyState
        title="No program yet"
        description="Programs are grouped from your real goals by domain. Create a tracker to start a lane."
        actionLabel="Create a goal"
        onAction={() => navigate('/dashboard/chat')}
      />
    )
  }

  const domains = Array.from(new Set(goals.map((g) => g.domain || 'general')))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Program
        </h2>
        <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-0.5 font-medium">
          Your goals, grouped by domain.
        </p>
      </div>
      {domains.map((domain) => {
        const items = goals.filter((g) => (g.domain || 'general') === domain)
        return (
          <section key={domain} className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">
              {DOMAIN_LABEL[domain] || domain} · {items.length}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((g) => (
                <GoalCard key={g.id} goal={g} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
