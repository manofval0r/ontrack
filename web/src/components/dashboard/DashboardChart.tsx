import React, { useState, useMemo } from 'react'
import type { Goal } from '../../types'
import { useGoals } from '../../context/GoalContext'

interface DashboardChartProps {
  goals?: Goal[]
}

interface MetricPoint {
  label: string
  detail?: string
  completed: number
  inProgress: number
}

// Safely parse date strings into epoch milliseconds
function parseTime(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const time = d.getTime()
  return isNaN(time) ? null : time
}

// Extract the completion timestamp for a completed goal
function getGoalCompletionTime(g: Goal): number | null {
  if (g.status !== 'completed') return null
  if (g.finished_at) {
    const t = parseTime(g.finished_at)
    if (t) return t
  }
  // Check latest progress log
  const logs = g.progress_logs || []
  if (logs.length > 0) {
    for (let i = logs.length - 1; i >= 0; i--) {
      const t = parseTime(logs[i].timestamp)
      if (t) return t
    }
  }
  // Fall back to deadline
  if (g.deadline) {
    const t = parseTime(g.deadline)
    if (t) return t
  }
  // Fall back to created_at
  if (g.created_at) {
    const t = parseTime(g.created_at)
    if (t) return t
  }
  return null
}

// Extract created timestamp for a goal
function getGoalCreatedTime(g: Goal): number {
  const t = parseTime(g.created_at)
  return t ?? 0
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ goals: propGoals }) => {
  const { goals: contextGoals } = useGoals()
  const goals = propGoals ?? contextGoals ?? []
  const [selectedRange, setSelectedRange] = useState<'1W' | '1M' | '1Y'>('1M')

  const chartData: MetricPoint[] = useMemo(() => {
    const now = new Date()

    // ── 1W: Last 7 Days (day-by-day throughput) ──────────────────────────
    if (selectedRange === '1W') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i))
        const dayLabel = i === 6 ? 'Today' : days[d.getDay()]
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime()
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime()

        let completed = 0
        let inProgress = 0

        goals.forEach((g) => {
          // Check if goal was completed on this day
          const compTime = getGoalCompletionTime(g)
          if (compTime && compTime >= dayStart && compTime <= dayEnd) {
            completed += 1
          }

          // Check if goal was active and logged progress or in motion on this day
          const createdTime = getGoalCreatedTime(g)
          const wasActiveOnDay =
            createdTime <= dayEnd && (!compTime || compTime >= dayStart)

          if (wasActiveOnDay) {
            // Count activity logs on this day
            const logsToday = (g.progress_logs || []).filter((l) => {
              const lt = parseTime(l.timestamp)
              return lt && lt >= dayStart && lt <= dayEnd
            })

            if (logsToday.length > 0) {
              inProgress += logsToday.length
            } else if (g.status === 'active') {
              inProgress += 1
            }
          }
        })

        return {
          label: dayLabel,
          detail: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
          completed,
          inProgress,
        }
      })
    }

    // ── 1M: Last 4 Weeks (W1: -28d to -21d, W2: -21d to -14d, W3: -14d to -7d, W4: Last 7d) ─
    if (selectedRange === '1M') {
      return [
        { label: 'W1', weekOffset: 3 },
        { label: 'W2', weekOffset: 2 },
        { label: 'W3', weekOffset: 1 },
        { label: 'W4', weekOffset: 0 },
      ].map(({ label, weekOffset }) => {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (weekOffset * 7 + 6), 0, 0, 0, 0).getTime()
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (weekOffset * 7), 23, 59, 59, 999).getTime()

        let completed = 0
        let inProgress = 0

        goals.forEach((g) => {
          // Real completed goals in this 7-day week
          const compTime = getGoalCompletionTime(g)
          if (compTime && compTime >= weekStart && compTime <= weekEnd) {
            completed += 1
          }

          // Real active throughput in this week
          const createdTime = getGoalCreatedTime(g)
          const wasActiveInWeek =
            createdTime <= weekEnd && (!compTime || compTime >= weekStart)

          if (wasActiveInWeek) {
            const logsInWeek = (g.progress_logs || []).filter((l) => {
              const lt = parseTime(l.timestamp)
              return lt && lt >= weekStart && lt <= weekEnd
            })

            if (logsInWeek.length > 0) {
              inProgress += logsInWeek.length
            } else if (g.status === 'active') {
              inProgress += 1
            }
          }
        })

        const startDateStr = new Date(weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        const endDateStr = new Date(weekEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

        return {
          label,
          detail: `${label} (${startDateStr} - ${endDateStr})`,
          completed,
          inProgress,
        }
      })
    }

    // ── 1Y: Past 6 Months (Month-by-Month Velocity) ───────────────────────
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const curYear = now.getFullYear()
    const curMonth = now.getMonth()

    return Array.from({ length: 6 }, (_, i) => {
      const mIdx = curMonth - (5 - i)
      const dateForMonth = new Date(curYear, mIdx, 1)
      const monthLabel = months[dateForMonth.getMonth()]
      const startOfMonth = new Date(dateForMonth.getFullYear(), dateForMonth.getMonth(), 1, 0, 0, 0, 0).getTime()
      const endOfMonth = new Date(dateForMonth.getFullYear(), dateForMonth.getMonth() + 1, 0, 23, 59, 59, 999).getTime()

      let completed = 0
      let inProgress = 0

      goals.forEach((g) => {
        const compTime = getGoalCompletionTime(g)
        if (compTime && compTime >= startOfMonth && compTime <= endOfMonth) {
          completed += 1
        }

        const createdTime = getGoalCreatedTime(g)
        const wasActiveInMonth =
          createdTime <= endOfMonth && (!compTime || compTime >= startOfMonth)

        if (wasActiveInMonth) {
          const logsInMonth = (g.progress_logs || []).filter((l) => {
            const lt = parseTime(l.timestamp)
            return lt && lt >= startOfMonth && lt <= endOfMonth
          })

          if (logsInMonth.length > 0) {
            inProgress += logsInMonth.length
          } else if (g.status === 'active') {
            inProgress += 1
          }
        }
      })

      return {
        label: monthLabel,
        detail: `${monthLabel} ${dateForMonth.getFullYear()}`,
        completed,
        inProgress,
      }
    })
  }, [goals, selectedRange])

  // Scale Y-Axis nicely to clean intervals (4, 8, 12, etc.)
  const maxVal = useMemo(() => {
    const highest = Math.max(
      ...chartData.map((d) => d.completed + d.inProgress),
      1
    )
    if (highest <= 4) return 4
    if (highest <= 8) return 8
    if (highest <= 12) return 12
    return Math.ceil(highest / 5) * 5
  }, [chartData])

  const totalCompleted = goals.filter((g) => g.status === 'completed').length
  const totalActive = goals.filter((g) => g.status === 'active').length

  return (
    <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000] flex flex-col justify-between h-full transition-colors">
      {/* Header and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <div>
          <h3
            className="text-base sm:text-lg font-bold text-[#071E2D] dark:text-white tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Total Velocity
          </h3>
          <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-0.5 font-medium">
            Goal completion & activity throughput
          </p>
        </div>

        {/* Legend & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-[#F8FAFB] dark:bg-[#091824] p-1 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]">
            {(['1W', '1M', '1Y'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSelectedRange(range)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  selectedRange === range
                    ? 'bg-[#00C4B3] text-[#071E2D] shadow-sm'
                    : 'text-[#071E2D]/60 dark:text-slate-400 hover:text-[#071E2D]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 text-xs font-bold pl-2 border-l border-[#071E2D]/20 dark:border-white/15">
            <div className="flex items-center gap-1.5" title="Completed goals">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#071E2D] dark:bg-white border border-[#071E2D] dark:border-white" />
              <span className="text-[#071E2D]/80 dark:text-slate-300 text-[11px] whitespace-nowrap">Done ({totalCompleted})</span>
            </div>
            <div className="flex items-center gap-1.5" title="Active goals & activity">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#00C4B3] border border-[#071E2D]" />
              <span className="text-[#071E2D]/80 dark:text-slate-300 text-[11px] whitespace-nowrap">Active ({totalActive})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stacked Chart Canvas */}
      <div className="flex items-end gap-3 sm:gap-4 pt-4 h-48 sm:h-52 w-full">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between h-full text-[10px] text-[#071E2D]/50 dark:text-slate-400 font-mono pb-6 pr-1 select-none font-bold">
          <span>{maxVal}</span>
          <span>{Math.round(maxVal * 0.75)}</span>
          <span>{Math.round(maxVal * 0.5)}</span>
          <span>{Math.round(maxVal * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Bars Container */}
        <div className="flex-1 flex items-end justify-between h-full border-b-2 border-[#071E2D]/15 dark:border-white/10 pb-2 px-1 gap-2">
          {chartData.map((item) => {
            const completedHeight = Math.min(100, Math.round((item.completed / maxVal) * 100))
            const inProgressHeight = Math.min(100 - completedHeight, Math.round((item.inProgress / maxVal) * 100))

            return (
              <div key={item.label} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#071E2D] dark:bg-white text-white dark:text-[#071E2D] text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-md">
                  {item.detail || item.label}: {item.completed} Done, {item.inProgress} Active
                </div>

                <div className="w-full max-w-[28px] h-full flex flex-col items-center justify-end rounded-t-xl overflow-hidden transition-all duration-300 group-hover:scale-y-105">
                  {/* Top Bar: Turquoise Accent (Active) */}
                  {inProgressHeight > 0 && (
                    <div
                      className="w-full bg-[#00C4B3] rounded-t-md relative transition-all"
                      style={{ height: `${inProgressHeight}%` }}
                    />
                  )}

                  {/* Bottom Bar: Deep Navy Solid in light / White in dark (Done) */}
                  {completedHeight > 0 ? (
                    <div
                      className="w-full bg-[#071E2D] dark:bg-white transition-all"
                      style={{ height: `${completedHeight}%` }}
                    />
                  ) : inProgressHeight === 0 ? (
                    <div className="w-full h-1 bg-[#071E2D]/10 dark:bg-white/10 rounded-full" />
                  ) : null}
                </div>

                {/* X-Axis Label */}
                <span className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 font-bold mt-2 group-hover:text-[#071E2D] dark:group-hover:text-[#00C4B3] transition-colors">
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
