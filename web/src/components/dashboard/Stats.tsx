import React from 'react'
import { Flame } from 'lucide-react'
import type { DashboardStats } from '../../types'

interface StatsProps {
  stats: DashboardStats
}

export const Stats: React.FC<StatsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Active Goals',
      value: stats.active_goals_count,
      subtext: 'In active sprint',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      color: 'bg-[#ECFEFF] text-[#006D6A]',
    },
    {
      label: 'Daily Streak',
      value: `${stats.streak_days} Days`,
      subtext: 'Consistency record',
      icon: <Flame className="w-5 h-5 text-[#B45309]" />,
      color: 'bg-[#FFFBEB] text-[#B45309]',
    },
    {
      label: 'Completed Goals',
      value: stats.completed_goals_count,
      subtext: 'Full targets hit',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: 'bg-[#ECFEFF] text-[#006D6A]',
    },
    {
      label: 'Accountability Score',
      value: `${stats.accountability_score}%`,
      subtext: stats.velocity_pace,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      color: 'bg-teal-50 text-[#006D6A]',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((item, idx) => (
        <div
          key={idx}
          className="bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D] p-5 flex flex-col justify-between gap-3 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#071E2D] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60">
              {item.label}
            </span>
            <div className={`w-8 h-8 rounded-lg border border-[#071E2D] flex items-center justify-center text-sm font-bold shadow-sm ${item.color}`}>
              {item.icon}
            </div>
          </div>

          <div>
            <span
              className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] tracking-tight block"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {item.value}
            </span>
            <span className="text-xs font-semibold text-[#006D6A]">
              {item.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
