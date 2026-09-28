import React, { useState, useMemo } from 'react'
import { Zap, Rocket, Target, BookOpen, HeartPulse, Filter, Search, Clock, X, Trash2 } from 'lucide-react'
import type { Goal } from '../../types'
import { formatLogTime } from '../../utils/goalMetrics'

export interface ActivityLogItem {
  id: string
  goalId: string
  trackerId: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  value: string
  status: 'Completed' | 'Pending' | 'In Progress'
  date: string
  rawDate: number
  note?: string
}

interface DashboardRecentActivityProps {
  goals?: Goal[]
  onSelectGoal?: (goalId: string) => void
  onDeleteGoal?: (goalId: string) => Promise<void>
}

export const DashboardRecentActivity: React.FC<DashboardRecentActivityProps> = ({
  goals = [],
  onSelectGoal,
  onDeleteGoal,
}) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Pending' | 'In Progress'>('All')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [isDeleting, setIsDeleting] = useState(false)

  // Compile real activity stream from goals
  const realActivities: ActivityLogItem[] = useMemo(() => {
    const list: ActivityLogItem[] = []

    goals.forEach((g) => {
      const getIcon = () => {
        const domain = (g.domain || '').toLowerCase()
        if (domain === 'sales') return { icon: Zap, iconBg: 'bg-[#E6F7F5] dark:bg-[#00C4B3]/20 text-[#006D6A] dark:text-[#00C4B3]' }
        if (domain === 'engineering') return { icon: Rocket, iconBg: 'bg-[#ECFEFF] dark:bg-[#00C4B3]/15 text-[#006D6A] dark:text-[#00C4B3]' }
        if (domain === 'fitness') return { icon: HeartPulse, iconBg: 'bg-[#ECFEFF] dark:bg-[#00C4B3]/15 text-[#006D6A] dark:text-[#00C4B3]' }
        if (domain === 'learning') return { icon: BookOpen, iconBg: 'bg-[#FFFBEB] dark:bg-[#FFFBEB] text-[#B45309] dark:text-[#B45309]' }
        return { icon: Target, iconBg: 'bg-[#F8FAFB] dark:bg-[#091824] text-[#006D6A] dark:text-[#00C4B3]' }
      }

      const { icon, iconBg } = getIcon()
      const trackerCode = `TRK_${g.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || '000001'}`

      // Include all progress logs
      ;(g.progress_logs || []).forEach((log) => {
        const ts = log.timestamp ? new Date(log.timestamp).getTime() : Date.now()
        list.push({
          id: `log-${log.id}`,
          goalId: g.id,
          trackerId: trackerCode,
          title: g.title,
          icon,
          iconBg,
          value: typeof log.value === 'number' ? `+${log.value} ${g.unit || 'units'}` : String(log.value),
          status: g.status === 'completed' ? 'Completed' : 'In Progress',
          date: formatLogTime(log.timestamp),
          rawDate: ts,
          note: log.note,
        })
      })

      // Include check-in interactions
      ;(g.check_ins || []).forEach((ci) => {
        const ts = ci.timestamp ? new Date(ci.timestamp).getTime() : Date.now()
        list.push({
          id: `ci-${ci.id}`,
          goalId: g.id,
          trackerId: trackerCode,
          title: `${g.title} (Check-in)`,
          icon,
          iconBg,
          value: ci.user_response ? 'Responded' : 'Check-in',
          status: ci.user_response ? 'Completed' : 'Pending',
          date: formatLogTime(ci.timestamp),
          rawDate: ts,
          note: ci.user_response || ci.ai_message,
        })
      })

      // If goal has no logs yet, show goal creation entry
      if ((!g.progress_logs || g.progress_logs.length === 0) && (!g.check_ins || g.check_ins.length === 0)) {
        const ts = g.created_at ? new Date(g.created_at).getTime() : Date.now()
        list.push({
          id: `goal-init-${g.id}`,
          goalId: g.id,
          trackerId: trackerCode,
          title: g.title,
          icon,
          iconBg,
          value: `${g.current_value}/${g.target} ${g.unit || ''}`.trim(),
          status: g.status === 'completed' ? 'Completed' : 'In Progress',
          date: formatLogTime(g.created_at || ''),
          rawDate: ts,
          note: g.description,
        })
      }
    })

    // Sort newest first
    return list.sort((a, b) => b.rawDate - a.rawDate)
  }, [goals])

  const filteredActivities = useMemo(() => {
    return realActivities.filter((act) => {
      const matchesSearch =
        search.trim() === '' ||
        act.title.toLowerCase().includes(search.toLowerCase()) ||
        act.trackerId.toLowerCase().includes(search.toLowerCase()) ||
        (act.note && act.note.toLowerCase().includes(search.toLowerCase())) ||
        act.value.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'All' || act.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [realActivities, search, statusFilter])

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSelectAll = () => {
    const allSelected = filteredActivities.every((a) => selectedRows[a.id])
    if (allSelected) {
      setSelectedRows({})
    } else {
      const next: Record<string, boolean> = {}
      filteredActivities.forEach((a) => {
        next[a.id] = true
      })
      setSelectedRows(next)
    }
  }

  const selectedCount = Object.values(selectedRows).filter(Boolean).length

  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(selectedRows).filter((id) => selectedRows[id])
    if (selectedIds.length === 0) return
    const goalIdsToDelete = Array.from(
      new Set(
        filteredActivities
          .filter((a) => selectedRows[a.id])
          .map((a) => a.goalId)
      )
    )
    if (
      window.confirm(
        `Are you sure you want to delete ${goalIdsToDelete.length} tracker(s) (${selectedIds.length} activity entries)?`
      )
    ) {
      setIsDeleting(true)
      try {
        for (const gid of goalIdsToDelete) {
          await onDeleteGoal?.(gid)
        }
        setSelectedRows({})
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000] flex flex-col justify-between transition-colors relative">
      {/* Table Header with Search, Filter and Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h3
              className="text-base sm:text-lg font-bold text-[#071E2D] dark:text-white tracking-tight"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Recent Tracking Logs
            </h3>
            {selectedCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#00C4B3] text-[#071E2D]">
                {selectedCount} selected
              </span>
            )}
          </div>
          <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-0.5 font-medium">
            Live stream of updates captured from your goals, check-ins, and activity logs
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap relative">
          {/* Bulk Delete Button when items selected */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold border-2 border-[#071E2D] shadow-[2px_2px_0px_#071E2D] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : `Delete Selected (${selectedCount})`}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRows({})}
                className="px-2.5 py-1.5 rounded-full bg-white dark:bg-[#091824] hover:bg-slate-100 text-[#071E2D] dark:text-white text-xs font-semibold border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[1px_1px_0px_#071E2D] transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* Search Input Box */}
          <div className="flex items-center gap-2 bg-[#F8FAFB] dark:bg-[#091824] px-3.5 py-1.5 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] text-xs w-full sm:w-48 md:w-56 focus-within:dark:border-[#00C4B3] transition-all">
            <Search className="w-3.5 h-3.5 text-[#071E2D] dark:text-white shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs & goals..."
              aria-label="Search activity logs and goals"
              className="bg-transparent outline-none text-[#071E2D] dark:text-white w-full placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 text-xs font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="text-xs text-[#071E2D]/50 hover:text-[#071E2D] dark:text-white/50 dark:hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter button & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              aria-expanded={isFilterMenuOpen}
              aria-controls="activity-filter-menu"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] text-xs font-bold shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
                statusFilter !== 'All'
                  ? 'bg-[#00C4B3] text-[#071E2D]'
                  : 'bg-white dark:bg-[#091824] text-[#071E2D] dark:text-white'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>{statusFilter === 'All' ? 'Filter' : statusFilter}</span>
            </button>

            {isFilterMenuOpen && (
              <div id="activity-filter-menu" className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-1.5 z-30 flex flex-col gap-1">
                {(['All', 'Completed', 'In Progress', 'Pending'] as const).map((filterOpt) => (
                  <button
                    key={filterOpt}
                    type="button"
                    onClick={() => {
                      setStatusFilter(filterOpt)
                      setIsFilterMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      statusFilter === filterOpt
                        ? 'bg-[#00C4B3] text-[#071E2D]'
                        : 'text-[#071E2D] dark:text-white hover:bg-[#E6F7F5] dark:hover:bg-white/5'
                    }`}
                  >
                    {filterOpt} {filterOpt === 'All' ? 'Logs' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto w-full pt-2 -mx-1 px-1">
        {filteredActivities.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#E6F7F5] dark:bg-[#00C4B3]/20 flex items-center justify-center text-[#006D6A] dark:text-[#00C4B3]">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#071E2D] dark:text-white">No tracking activity found</h4>
            <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 max-w-sm">
              {search || statusFilter !== 'All'
                ? 'No activity matches your search or filter. Try clearing filters.'
                : 'Activity logs will appear here when you create trackers, check in, or log progress.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="text-[11px] font-bold text-[#071E2D]/60 dark:text-slate-400 uppercase tracking-wider border-b-2 border-[#071E2D]/10 dark:border-white/10">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={filteredActivities.length > 0 && filteredActivities.every((a) => selectedRows[a.id])}
                    onChange={toggleSelectAll}
                    aria-label="Select all activity rows"
                    className="rounded accent-[#00C4B3] cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="py-3 px-3 hidden sm:table-cell">Tracker ID</th>
                <th className="py-3 px-3">Goal Objective</th>
                <th className="py-3 px-3 hidden md:table-cell">Logged Delta</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 hidden lg:table-cell">Timestamp</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071E2D]/5 dark:divide-white/5 text-xs">
              {filteredActivities.map((act) => {
                const isSelected = !!selectedRows[act.id]
                return (
                  <tr
                    key={act.id}
                    className={`hover:bg-[#E6F7F5]/60 dark:hover:bg-white/5 transition-colors ${
                      isSelected ? 'bg-[#E6F7F5]/40 dark:bg-white/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(act.id)}
                        aria-label={`Select activity: ${act.title}`}
                        className="rounded accent-[#00C4B3] cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#071E2D]/60 dark:text-slate-400 font-semibold hidden sm:table-cell">
                      {act.trackerId}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg ${act.iconBg} border border-[#071E2D]/20 flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0`}>
                          <act.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-[#071E2D] dark:text-white line-clamp-1">
                            {act.title}
                          </span>
                          {act.note && (
                            <span className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 line-clamp-1 block">
                              {act.note}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-[#071E2D] dark:text-white hidden md:table-cell">
                      {act.value}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold text-[11px] px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                          act.status === 'Completed'
                            ? 'bg-[#E6F7F5] dark:bg-[#00C4B3]/15 text-[#006D6A] dark:text-[#00C4B3] border-[#00C4B3]/50'
                            : act.status === 'Pending'
                            ? 'bg-white dark:bg-[#0E202D] text-red-700 dark:text-red-400 border-[#071E2D] dark:border-[#1E3A52]'
                            : 'bg-[#FFFBEB] dark:bg-[#FFFBEB] text-[#B45309] dark:text-[#B45309] border-[#F59E0B]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            act.status === 'Completed'
                              ? 'bg-[#00C4B3]'
                              : act.status === 'Pending'
                              ? 'bg-red-700'
                              : 'bg-[#F59E0B]'
                          }`}
                        />
                        <span className="hidden sm:inline">{act.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#071E2D]/50 dark:text-slate-400 font-mono text-[11px] hidden lg:table-cell">
                      {act.date}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectGoal?.(act.goalId)
                          }}
                          aria-label={`Inspect goal ${act.title}`}
                          className="px-3 min-h-[44px] inline-flex items-center bg-white dark:bg-[#091824] hover:bg-[#00C4B3] hover:text-[#071E2D] text-[#071E2D] dark:text-white border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-full text-xs font-bold shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer whitespace-nowrap"
                          title={`Inspect ${act.title}`}
                        >
                          Inspect
                        </button>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (window.confirm(`Delete tracker "${act.title}"?`)) {
                              await onDeleteGoal?.(act.goalId)
                            }
                          }}
                          className="p-1.5 bg-white dark:bg-[#091824] hover:bg-rose-500 hover:text-white text-rose-500 dark:text-rose-400 border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-full shadow-[1px_1px_0px_#071E2D] dark:shadow-[1px_1px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                          title={`Delete ${act.title}`}
                          aria-label={`Delete ${act.title}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
