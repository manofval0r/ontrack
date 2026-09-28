import React, { useMemo, useState } from 'react'
import {
  Download,
  Printer,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  PieChart,
  BarChart3,
  Flame,
  FileSpreadsheet,
} from 'lucide-react'
import { useGoals } from '../../../context/GoalContext'
import type { GoalDomain } from '../../../types'

export const ReportsPanel: React.FC = () => {
  const { goals } = useGoals()
  const [selectedDomain, setSelectedDomain] = useState<string>('all')

  const totalGoals = goals.length
  const completedGoals = goals.filter((g) => g.status === 'completed').length
  const activeGoals = goals.filter((g) => g.status === 'active').length

  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  const averageProgress = useMemo(() => {
    if (totalGoals === 0) return 0
    const sum = goals.reduce((acc, g) => {
      if (g.goal_type === 'checklist') {
        const total = g.items?.length || 0
        const done = g.items?.filter((i) => i.completed).length || 0
        return acc + (total > 0 ? (done / total) * 100 : 0)
      }
      const pct = g.target > 0 ? Math.min(100, Math.round((g.current_value / g.target) * 100)) : 0
      return acc + pct
    }, 0)
    return Math.round(sum / totalGoals)
  }, [goals, totalGoals])

  const totalLogsLogged = useMemo(() => {
    return goals.reduce((acc, g) => acc + (g.progress_logs?.length || 0), 0)
  }, [goals])

  const domainStats = useMemo(() => {
    const map: Record<GoalDomain, { count: number; completed: number }> = {
      sales: { count: 0, completed: 0 },
      engineering: { count: 0, completed: 0 },
      fitness: { count: 0, completed: 0 },
      learning: { count: 0, completed: 0 },
      mindset: { count: 0, completed: 0 },
      general: { count: 0, completed: 0 },
    }
    goals.forEach((g) => {
      const d = g.domain || 'general'
      if (map[d]) {
        map[d].count += 1
        if (g.status === 'completed') map[d].completed += 1
      }
    })
    return Object.entries(map).filter((entry) => entry[1].count > 0)
  }, [goals])

  const filteredGoals = useMemo(() => {
    if (selectedDomain === 'all') return goals
    return goals.filter((g) => g.domain === selectedDomain)
  }, [goals, selectedDomain])

  const handleExportCSV = () => {
    if (goals.length === 0) return
    const headers = ['Title', 'Domain', 'Type', 'Target', 'Current Value', 'Unit', 'Status', 'Deadline', 'Created At']
    const rows = goals.map((g) => [
      `"${g.title.replace(/"/g, '""')}"`,
      g.domain || 'general',
      g.goal_type,
      g.target,
      g.current_value,
      g.unit || '',
      g.status,
      g.deadline || '',
      g.created_at || '',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `ontrack-report-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header & Export controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Velocity & Accountability Reports
          </h2>
          <p className="text-xs sm:text-sm text-[#071E2D]/70 dark:text-slate-400 mt-1 font-medium">
            Verified execution metrics and audit trails generated from your live trackers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={goals.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:bg-slate-50 dark:hover:bg-[#162C3D] disabled:opacity-50 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#00C4B3]" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] border-2 border-[#071E2D] dark:border-[#00C4B3] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:opacity-90 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]">
          <div className="flex items-center justify-between text-xs font-bold text-[#071E2D]/60 dark:text-slate-400">
            <span>COMPLETION RATE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-[#071E2D] dark:text-white mt-2"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {completionRate}%
          </div>
          <div className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 mt-1 font-medium">
            {completedGoals} of {totalGoals} targets finalized
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]">
          <div className="flex items-center justify-between text-xs font-bold text-[#071E2D]/60 dark:text-slate-400">
            <span>AVG VELOCITY</span>
            <TrendingUp className="w-4 h-4 text-[#00C4B3]" />
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-[#071E2D] dark:text-white mt-2"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {averageProgress}%
          </div>
          <div className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 mt-1 font-medium">
            Across active target quotas
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]">
          <div className="flex items-center justify-between text-xs font-bold text-[#071E2D]/60 dark:text-slate-400">
            <span>ACTIVE TRACKERS</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-[#071E2D] dark:text-white mt-2"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {activeGoals}
          </div>
          <div className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 mt-1 font-medium">
            Currently running
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]">
          <div className="flex items-center justify-between text-xs font-bold text-[#071E2D]/60 dark:text-slate-400">
            <span>AUDIT LOGS</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-[#071E2D] dark:text-white mt-2"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {totalLogsLogged}
          </div>
          <div className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 mt-1 font-medium">
            Verified check-in updates
          </div>
        </div>
      </div>

      {/* Domain Breakdown Section */}
      {domainStats.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#071E2D]/10 dark:border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#00C4B3]" />
              <h3 className="font-extrabold text-[#071E2D] dark:text-white text-base sm:text-lg">
                Category Execution Breakdown
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#071E2D]/60 dark:text-slate-400">
              {domainStats.length} Domains Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {domainStats.map(([domain, data]) => {
              const pct = data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0
              return (
                <div
                  key={domain}
                  className="p-3.5 rounded-xl border border-[#071E2D]/20 dark:border-[#1E3A52] bg-[#F8FAFB] dark:bg-[#091824]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold capitalize text-[#071E2D] dark:text-white tracking-wide">
                      {domain}
                    </span>
                    <span className="text-[11px] font-bold text-[#00C4B3]">{pct}% Done</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-2">
                    <div
                      className="h-full bg-[#00C4B3] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#071E2D]/60 dark:text-slate-400 mt-2 font-medium">
                    <span>{data.count} Total Goals</span>
                    <span>{data.completed} Completed</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Goal Performance Audit Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#071E2D]/10 dark:border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00C4B3]" />
            <h3 className="font-extrabold text-[#071E2D] dark:text-white text-base sm:text-lg">
              Goal Performance Audit Table
            </h3>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'sales', 'engineering', 'fitness', 'learning', 'mindset', 'general'].map((dom) => (
              <button
                key={dom}
                type="button"
                onClick={() => setSelectedDomain(dom)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer capitalize transition-all ${
                  selectedDomain === dom
                    ? 'bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] border-[#071E2D] dark:border-[#00C4B3]'
                    : 'bg-white dark:bg-[#091824] text-[#071E2D]/70 dark:text-slate-300 border-[#071E2D]/20 dark:border-slate-700 hover:border-[#071E2D]'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>

        {filteredGoals.length === 0 ? (
          <div className="text-center py-10">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#071E2D] dark:text-white">No trackers in this category</p>
            <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-0.5">
              Add goals to view live audit and velocity telemetry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#071E2D]/10 dark:border-white/10 text-[11px] font-black text-[#071E2D]/60 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5">Goal / Target</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Current vs Target</th>
                  <th className="pb-2.5">Progress</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#071E2D]/5 dark:divide-white/5 text-xs">
                {filteredGoals.map((g) => {
                  let pct: number
                  if (g.goal_type === 'checklist') {
                    const total = g.items?.length || 0
                    const done = g.items?.filter((i) => i.completed).length || 0
                    pct = total > 0 ? Math.round((done / total) * 100) : 0
                  } else {
                    pct = g.target > 0 ? Math.min(100, Math.round((g.current_value / g.target) * 100)) : 0
                  }

                  return (
                    <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-[#162C3D]/40 transition-colors">
                      <td className="py-3 pr-3">
                        <div className="font-extrabold text-[#071E2D] dark:text-white line-clamp-1">{g.title}</div>
                        <div className="text-[10px] text-[#071E2D]/50 dark:text-slate-400 font-mono mt-0.5">
                          ID: {g.id.slice(0, 12)}
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-slate-100 dark:bg-slate-800 text-[#071E2D] dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          {g.domain || 'general'}
                        </span>
                      </td>
                      <td className="py-3 pr-3 font-mono font-bold text-[#071E2D] dark:text-slate-200">
                        {g.current_value} / {g.target} {g.unit || ''}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-[#00C4B3] rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[11px] text-[#071E2D] dark:text-slate-200">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            g.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : g.status === 'active'
                              ? 'bg-[#00C4B3]/15 text-[#008A7E] dark:bg-[#00C4B3]/20 dark:text-[#00C4B3]'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}
                        >
                          {g.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {g.verdict ? (
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                              g.verdict.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                            }`}
                          >
                            {g.verdict.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            <span>{g.verdict.score}/100</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Pending</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
