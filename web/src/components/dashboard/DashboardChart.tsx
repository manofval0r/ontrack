import React, { useState, useMemo } from 'react'
import type { Goal } from '../../types'

interface DashboardChartProps {
  goals?: Goal[]
}

interface MetricPoint {
  label: string
  completed: number
  inProgress: number
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ goals = [] }) => {
  const [selectedRange, setSelectedRange] = useState<'1W' | '1M' | '1Y'>('1M')

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

        goals.forEach((g) => {
          const logsToday = (g.progress_logs || []).filter(
            (l) => l.timestamp && l.timestamp.startsWith(dateStr)
          )
          if (logsToday.length > 0) {
            inProgress += logsToday.length
          }
          if (g.status === 'completed' && g.deadline && g.deadline.startsWith(dateStr)) {
            completed += 1
          }
        })

        return { label: dayLabel, completed, inProgress }
      })
    }

    if (selectedRange === '1M') {
      return [
        { label: 'W1', completed: 0, inProgress: 0 },
        { label: 'W2', completed: 0, inProgress: 0 },
        { label: 'W3', completed: 0, inProgress: 0 },
        { label: 'W4', completed: 0, inProgress: 0 },
      ].map((w, idx) => {
        const completed = goals.filter((g) => g.status === 'completed').length
        const inProgress = goals.filter((g) => g.status === 'active').length
        // Distribute proportionally across weeks for visual throughput
        const splitComp = idx === 3 ? completed : Math.min(completed, idx)
        const splitProg = Math.max(0, inProgress - idx)
        return {
          label: w.label,
          completed: splitComp,
          inProgress: splitProg,
        }
      })
    }

    // 1Y (Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const curMonth = now.getMonth()
    const sliceStart = Math.max(0, curMonth - 5)
    const relevantMonths = months.slice(sliceStart, curMonth + 1)

    return relevantMonths.map((m, idx) => {
      const compCount = goals.filter(
        (g) => g.status === 'completed' && (g.deadline ? new Date(g.deadline).getMonth() === sliceStart + idx : true)
      ).length
      const activeCount = goals.filter((g) => g.status === 'active').length
      return {
        label: m,
        completed: compCount,
        inProgress: Math.max(0, activeCount - (idx === relevantMonths.length - 1 ? 0 : 1)),
      }
    })
  }, [goals, selectedRange])

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
