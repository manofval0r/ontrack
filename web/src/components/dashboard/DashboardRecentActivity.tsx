import React, { useState } from 'react'

interface ActivityItem {
  id: string
  trackerId: string
  title: string
  icon: string
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
    icon: '⚡',
    iconBg: 'bg-blue-50 text-blue-600',
    value: '+5 Deals',
    status: 'Completed',
    date: '17 Apr, 2026 03:45 PM',
  },
  {
    id: 'act-2',
    trackerId: 'TRK_000075',
    title: 'Sprint Frontend Release',
    icon: '🚀',
    iconBg: 'bg-indigo-50 text-indigo-600',
    value: '4 Tasks',
    status: 'Pending',
    date: '15 Apr, 2026 11:30 AM',
  },
  {
    id: 'act-3',
    trackerId: 'TRK_000074',
    title: 'Daily Pushup Challenge',
    icon: '🎯',
    iconBg: 'bg-cyan-50 text-cyan-600',
    value: '50 Reps',
    status: 'Completed',
    date: '15 Apr, 2026 12:00 PM',
  },
  {
    id: 'act-4',
    trackerId: 'TRK_000073',
    title: 'Deep Work Reading Habit',
    icon: '📚',
    iconBg: 'bg-amber-50 text-amber-600',
    value: '2 Chapters',
    status: 'In Progress',
    date: '14 Apr, 2026 09:15 PM',
  },
  {
    id: 'act-5',
    trackerId: 'TRK_000072',
    title: 'Founder Evening Reflection',
    icon: '🧘',
    iconBg: 'bg-rose-50 text-rose-600',
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
    <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      {/* Table Header with Search and Filter buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight font-sans">
          Recent Activities
        </h3>

        <div className="flex items-center gap-2">
          {/* Search Input Box */}
          <div className="flex items-center gap-2 bg-[#F8FAFB] px-3 py-1.5 rounded-full border border-gray-200 text-xs w-48 sm:w-56 focus-within:border-gray-400 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity..."
              className="bg-transparent outline-none text-gray-700 w-full placeholder:text-gray-400 text-xs"
            />
          </div>

          {/* Filter button */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <span>Filter</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto w-full pt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="py-3 px-3 w-8">
                <input type="checkbox" className="rounded text-gray-900 focus:ring-0" />
              </th>
              <th className="py-3 px-3">Tracker ID</th>
              <th className="py-3 px-3">Activity</th>
              <th className="py-3 px-3">Velocity</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3 text-right">•••</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {filteredActivities.map((act) => {
              const isSelected = selectedRow === act.id
              return (
                <tr
                  key={act.id}
                  onClick={() => {
                    setSelectedRow(act.id)
                    onSelectGoal?.(act.trackerId)
                  }}
                  className={`hover:bg-gray-50/70 transition-colors cursor-pointer ${
                    isSelected ? 'bg-gray-50/50' : ''
                  }`}
                >
                  <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => setSelectedRow(act.id)}
                      className="rounded text-gray-900 focus:ring-0 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-3 font-mono text-gray-500 font-medium">
                    {act.trackerId}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${act.iconBg} flex items-center justify-center text-xs font-bold shadow-sm`}>
                        {act.icon}
                      </div>
                      <span className="font-semibold text-gray-900 line-clamp-1">
                        {act.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-gray-900">
                    {act.value}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 font-semibold text-[11px] ${
                        act.status === 'Completed'
                          ? 'text-emerald-600'
                          : act.status === 'Pending'
                          ? 'text-rose-500'
                          : 'text-amber-500'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          act.status === 'Completed'
                            ? 'bg-emerald-500'
                            : act.status === 'Pending'
                            ? 'bg-rose-500'
                            : 'bg-amber-400'
                        }`}
                      />
                      <span>{act.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-gray-400 font-mono text-[11px]">
                    {act.date}
                  </td>
                  <td className="py-3.5 px-3 text-right text-gray-400 hover:text-gray-700">
                    •••
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
