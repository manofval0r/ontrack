import React, { useState, useMemo } from 'react'
import type { Goal, ProgressLog } from '../../types'

interface DashboardChartProps {
  goals?: Goal[]
  /** Dashboard history (backend `history`, newest first). When present it is
   * the source for activity bars; otherwise embedded goal logs are used. */
  logs?: ProgressLog[]
}

interface MetricPoint {
  label: string
  completed: number
  inProgress: number
}

/** Parse both timestamp shapes in the app: ISO ("...T...") from the API
 * and "YYYY-MM-DD HH:MM" written by local log entries. Null when unusable. */
function parseStamp(raw: unknown): Date | null {
  if (typeof raw !== 'string' || !raw) return null
  const t = new Date(raw.includes('T') ? raw : raw.replace(' ', 'T'))
  return isNaN(+t) ? null : t
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ goals = [], logs = [] }) => {
  const [selectedRange, setSelectedRange] = useState<'1W' | '1M' | '1Y'>('1M')

  // Activity source: explicit history prop wins (it covers all goals even
  // though /api/goals list items carry no logs); else embedded goal logs.
  const allLogs: ProgressLog[] = useMemo(() => {
    if (logs.length > 0) return logs
    return goals.flatMap((g) => g.progress_logs ?? [])
  }, [goals, logs])

  /** Completion date: finished_at when known, else deadline. Null = unknown. */
  const completionDate = (g: Goal): Date | null => {
    const raw = g.finished_at || g.deadline
    if (!raw) return null
    const d = new Date(raw)
    return isNaN(+d) ? null : d
  }

  const chartData: MetricPoint[] = useMemo(() => {
    const now = new Date()

    if (selectedRange === '1W') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(now.getDate() - (6 - i))
        const dayLabel = days[d.getDay()]
        const dateStr = d.toISOString().split('T')[0]

        let completed = 0
        let inProgress = 0

        allLogs.forEach((l) => {
          if (l.timestamp && l.timestamp.startsWith(dateStr)) {
            inProgress += 1
          }
        })
        goals.forEach((g) => {
          if (g.status === 'completed') {
            const done = completionDate(g)
            if (done && done.toISOString().split('T')[0] === dateStr) {
              completed += 1
            }
          }
        })

        return { label: dayLabel, completed, inProgress }
      })
    }

    if (selectedRange === '1M') {
      // Four real 7-day buckets ending today (W4 = current week).
      // inProgress = progress logs stamped inside the bucket;
      // completed = goals completed with a deadline inside the bucket
      // (same attribution rule as the 1W view — stable, no invented splits).
      return Array.from({ length: 4 }, (_, i) => {
        const end = new Date(now)
        end.setDate(now.getDate() - 7 * (3 - i))
        end.setHours(23, 59, 59, 999)
        const start = new Date(end)
        start.setDate(end.getDate() - 6)
        start.setHours(0, 0, 0, 0)

        let completed = 0
        let inProgress = 0

        allLogs.forEach((l) => {
          const t = parseStamp(l.timestamp)
          if (t && t >= start && t <= end) inProgress += 1
        })
        goals.forEach((g) => {
          if (g.status === 'completed') {
            const done = completionDate(g)
            if (done && done >= start && done <= end) completed += 1
          }
        })

        return { label: `W${i + 1}`, completed, inProgress }
      })
    }

    // 1Y (Months) — same real bucketing per calendar month.
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const curMonth = now.getMonth()
    const sliceStart = Math.max(0, curMonth - 5)
    const relevantMonths = months.slice(sliceStart, curMonth + 1)

    return relevantMonths.map((m, idx) => {
      const monthIdx = sliceStart + idx
      const mStart = new Date(now.getFullYear(), monthIdx, 1)
      const mEnd = new Date(now.getFullYear(), monthIdx + 1, 0, 23, 59, 59, 999)

      let completed = 0
      let inProgress = 0

      allLogs.forEach((l) => {
        const t = parseStamp(l.timestamp)
        if (t && t >= mStart && t <= mEnd) inProgress += 1
      })
      goals.forEach((g) => {
        if (g.status === 'completed') {
          const done = completionDate(g)
          if (done && done >= mStart && done <= mEnd) completed += 1
        }
      })

      return { label: m, completed, inProgress }
    })
  }, [goals, allLogs, selectedRange])

  const maxVal = useMemo(() => {
    const highest = Math.max(
      ...chartData.map((d) => d.completed + d.inProgress),
      1
    )
    return Math.max(highest, 5)
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
        <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-3 text-xs font-bold pl-2 border-l border-[#071E2D]/20 dark:border-white/15">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#071E2D] dark:bg-white border border-[#071E2D] dark:border-white" />
              <span className="text-[#071E2D]/80 dark:text-slate-300 text-[11px]">Done ({totalCompleted})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#00C4B3] border border-[#071E2D]" />
              <span className="text-[#071E2D]/80 dark:text-slate-300 text-[11px]">Active ({totalActive})</span>
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
              <div key={item.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full max-w-[28px] h-full flex flex-col items-center justify-end rounded-t-xl overflow-hidden transition-all duration-300 group-hover:scale-y-105">
                  {/* Top Bar: Turquoise Accent */}
                  {inProgressHeight > 0 && (
                    <div
                      className="w-full bg-[#00C4B3] rounded-t-md relative transition-all"
                      style={{ height: `${inProgressHeight}%` }}
                      title={`${item.label} Active: ${item.inProgress}`}
                    />
                  )}

                  {/* Bottom Bar: Deep Navy Solid */}
                  {completedHeight > 0 ? (
                    <div
                      className="w-full bg-[#071E2D] dark:bg-white transition-all"
                      style={{ height: `${completedHeight}%` }}
                      title={`${item.label} Completed: ${item.completed}`}
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
