import React, { useMemo, useState } from 'react'
import type { Goal, ProgressLog } from '../../types'

interface DashboardChartProps {
  goals?: Goal[]
  logs?: ProgressLog[]
}

interface MetricPoint {
  label: string
  detail: string
  completed: number
  inProgress: number
}

function parseStamp(raw: unknown): Date | null {
  if (typeof raw !== 'string' || !raw) return null
  const value = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00` : raw.replace(' ', 'T')
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getCompletionDate(goal: Goal): Date | null {
  if (goal.status !== 'completed') return null
  return parseStamp(goal.finished_at || goal.deadline)
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ goals = [], logs = [] }) => {
  const [selectedRange, setSelectedRange] = useState<'1W' | '1M' | '1Y'>('1M')

  const allLogs = useMemo(
    () => (logs.length > 0 ? logs : goals.flatMap((goal) => goal.progress_logs ?? [])),
    [goals, logs]
  )

  const chartData = useMemo<MetricPoint[]>(() => {
    const now = new Date()
    let ranges: Array<{ label: string; start: Date; end: Date; detail: string }>

    if (selectedRange === '1W') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      ranges = Array.from({ length: 7 }, (_, index) => {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index))
        const end = new Date(start)
        end.setHours(23, 59, 59, 999)
        return {
          label: index === 6 ? 'Today' : days[start.getDay()],
          detail: start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
          start,
          end,
        }
      })
    } else if (selectedRange === '1M') {
      ranges = Array.from({ length: 4 }, (_, index) => {
        const end = new Date(now)
        end.setDate(now.getDate() - 7 * (3 - index))
        end.setHours(23, 59, 59, 999)
        const start = new Date(end)
        start.setDate(end.getDate() - 6)
        start.setHours(0, 0, 0, 0)
        const format = (date: Date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        return { label: `W${index + 1}`, detail: `${format(start)} - ${format(end)}`, start, end }
      })
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      ranges = Array.from({ length: 6 }, (_, index) => {
        const start = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999)
        const label = months[start.getMonth()]
        return { label, detail: `${label} ${start.getFullYear()}`, start, end }
      })
    }

    return ranges.map(({ label, detail, start, end }) => {
      const completed = goals.filter((goal) => {
        const date = getCompletionDate(goal)
        return date !== null && date >= start && date <= end
      }).length
      const inProgress = allLogs.filter((log) => {
        const date = parseStamp(log.timestamp)
        return date !== null && date >= start && date <= end
      }).length
      return { label, detail, completed, inProgress }
    })
  }, [allLogs, goals, selectedRange])

  const maxVal = useMemo(() => {
    const highest = Math.max(...chartData.map((point) => point.completed + point.inProgress), 1)
    if (highest <= 4) return 4
    if (highest <= 8) return 8
    if (highest <= 12) return 12
    return Math.ceil(highest / 5) * 5
  }, [chartData])

  const totalCompleted = goals.filter((goal) => goal.status === 'completed').length
  const totalActive = goals.filter((goal) => goal.status === 'active').length

  return (
    <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000] flex flex-col justify-between h-full transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#071E2D] dark:text-white tracking-tight" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Total Velocity
          </h3>
          <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-0.5 font-medium">
            Goal completion & activity throughput
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-[#F8FAFB] dark:bg-[#091824] p-1 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]">
            {(['1W', '1M', '1Y'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSelectedRange(range)}
                aria-pressed={selectedRange === range}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${selectedRange === range ? 'bg-[#00C4B3] text-[#071E2D] shadow-sm' : 'text-[#071E2D]/60 dark:text-slate-400 hover:text-[#071E2D]'}`}
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

      <div className="flex items-end gap-3 sm:gap-4 pt-4 h-48 sm:h-52 w-full">
        <div className="flex flex-col justify-between h-full text-[10px] text-[#071E2D]/50 dark:text-slate-400 font-mono pb-6 pr-1 select-none font-bold">
          <span>{maxVal}</span>
          <span>{Math.round(maxVal * 0.75)}</span>
          <span>{Math.round(maxVal * 0.5)}</span>
          <span>{Math.round(maxVal * 0.25)}</span>
          <span>0</span>
        </div>

        <div className="flex-1 flex items-end justify-between h-full border-b-2 border-[#071E2D]/15 dark:border-white/10 pb-2 px-1 gap-2">
          {chartData.map((point) => {
            const completedHeight = Math.min(100, Math.round((point.completed / maxVal) * 100))
            const inProgressHeight = Math.min(100 - completedHeight, Math.round((point.inProgress / maxVal) * 100))
            return (
              <div key={point.label} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#071E2D] dark:bg-white text-white dark:text-[#071E2D] text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-md">
                  {point.detail}: {point.completed} Done, {point.inProgress} Active
                </div>
                <div className="w-full max-w-[28px] h-full flex flex-col items-center justify-end rounded-t-xl overflow-hidden transition-all duration-300 group-hover:scale-y-105">
                  {inProgressHeight > 0 && <div className="w-full bg-[#00C4B3] rounded-t-md transition-all" style={{ height: `${inProgressHeight}%` }} />}
                  {completedHeight > 0 ? (
                    <div className="w-full bg-[#071E2D] dark:bg-white transition-all" style={{ height: `${completedHeight}%` }} />
                  ) : inProgressHeight === 0 ? (
                    <div className="w-full h-1 bg-[#071E2D]/10 dark:bg-white/10 rounded-full" />
                  ) : null}
                </div>
                <span className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 font-bold mt-2 group-hover:text-[#071E2D] dark:group-hover:text-[#00C4B3] transition-colors">
                  {point.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}