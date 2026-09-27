import React, { useState } from 'react'
import { Zap, Rocket, Target, BookOpen, HeartPulse } from 'lucide-react'

interface ActivityItem {
  id: string
  trackerId: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  value: string
  status: 'Completed' | 'Pending' | 'In Progress'
  date: string
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    trackerId: 'TRK_000076',
    title: 'Enterprise Deals Closed',
    icon: Zap,
    iconBg: 'bg-[#E6F7F5] dark:bg-[#00C4B3]/20 text-[#006D6A] dark:text-[#00C4B3]',
    value: '+5 Deals',
    status: 'Completed',
    date: '17 Apr, 2026 03:45 PM',
  },
  {
    id: 'act-2',
    trackerId: 'TRK_000075',
    title: 'Sprint Frontend Release',
    icon: Rocket,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    value: '4 Tasks',
    status: 'Pending',
    date: '15 Apr, 2026 11:30 AM',
  },
  {
    id: 'act-3',
    trackerId: 'TRK_000074',
    title: 'Daily Pushup Challenge',
    icon: Target,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    value: '50 Reps',
    status: 'Completed',
    date: '15 Apr, 2026 12:00 PM',
  },
  {
    id: 'act-4',
    trackerId: 'TRK_000073',
    title: 'Deep Work Reading Habit',
    icon: BookOpen,
    iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    value: '2 Chapters',
    status: 'In Progress',
    date: '14 Apr, 2026 09:15 PM',
  },
  {
    id: 'act-5',
    trackerId: 'TRK_000072',
    title: 'Founder Evening Reflection',
    icon: HeartPulse,
    iconBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
    value: '7 Days Streak',
    status: 'Completed',
    date: '10 Apr, 2026 08:00 AM',
  },
]

interface DashboardRecentActivityProps {
  onSelectGoal?: (trackerId: string) => void
}

export const DashboardRecentActivity: React.FC<DashboardRecentActivityProps> = ({
  onSelectGoal,
}) => {
  const [search, setSearch] = useState('')
  const [selectedRow, setSelectedRow] = useState<string>('act-4')

  const filteredActivities = DEFAULT_ACTIVITIES.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.trackerId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000] flex flex-col justify-between transition-colors">
      {/* Table Header with Search and Filter buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <div>
          <h3
            className="text-base sm:text-lg font-bold text-[#071E2D] dark:text-white tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Recent Tracking Logs
          </h3>
          <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-0.5 font-medium">
            Live stream of updates captured via voice, text, or manual check-ins
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input Box */}
          <div className="flex items-center gap-2 bg-[#F8FAFB] dark:bg-[#091824] px-3.5 py-1.5 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] text-xs w-48 sm:w-56 focus-within:dark:border-[#00C4B3] transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#071E2D] dark:text-white">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="bg-transparent outline-none text-[#071E2D] dark:text-white w-full placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 text-xs font-medium"
            />
          </div>

          {/* Filter button */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#091824] text-xs font-bold text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <span>Filter</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto w-full pt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-bold text-[#071E2D]/60 dark:text-slate-400 uppercase tracking-wider border-b-2 border-[#071E2D]/10 dark:border-white/10">
              <th className="py-3 px-3 w-8">
                <input type="checkbox" className="rounded accent-[#00C4B3] cursor-pointer" />
              </th>
              <th className="py-3 px-3">Tracker ID</th>
              <th className="py-3 px-3">Goal Objective</th>
              <th className="py-3 px-3">Logged Delta</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#071E2D]/5 dark:divide-white/5 text-xs">
            {filteredActivities.map((act) => {
              const isSelected = selectedRow === act.id
              return (
                <tr
                  key={act.id}
                  onClick={() => {
                    setSelectedRow(act.id)
                    onSelectGoal?.(act.trackerId)
                  }}
                  className={`hover:bg-[#E6F7F5]/60 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#E6F7F5]/40 dark:bg-white/5' : ''
                  }`}
                >
                  <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => setSelectedRow(act.id)}
                      className="rounded accent-[#00C4B3] cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#071E2D]/60 dark:text-slate-400 font-semibold">
                    {act.trackerId}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${act.iconBg} border border-[#071E2D]/20 flex items-center justify-center text-xs font-bold shadow-sm`}>
                        <act.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-[#071E2D] dark:text-white line-clamp-1">
                        {act.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-extrabold text-[#071E2D] dark:text-white">
                    {act.value}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 font-bold text-[11px] px-2.5 py-0.5 rounded-full border ${
                        act.status === 'Completed'
                          ? 'bg-[#E6F7F5] dark:bg-[#00C4B3]/15 text-[#006D6A] dark:text-[#00C4B3] border-[#00C4B3]/50'
                          : act.status === 'Pending'
                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-300'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          act.status === 'Completed'
                            ? 'bg-[#00C4B3]'
                            : act.status === 'Pending'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span>{act.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#071E2D]/50 dark:text-slate-400 font-mono text-[11px]">
                    {act.date}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 bg-white dark:bg-[#091824] hover:bg-[#00C4B3] hover:text-[#071E2D] text-[#071E2D] dark:text-white border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-full text-[10px] font-bold shadow-[1px_1px_0px_#071E2D] dark:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
