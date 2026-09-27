import React, { useState } from 'react'

interface MonthlyData {
  month: string
  completed: number
  inProgress: number
}

const MONTH_METRICS: MonthlyData[] = [
  { month: 'Jan', completed: 18, inProgress: 14 },
  { month: 'Feb', completed: 24, inProgress: 16 },
  { month: 'Mar', completed: 14, inProgress: 20 },
  { month: 'Apr', completed: 28, inProgress: 12 },
  { month: 'May', completed: 22, inProgress: 18 },
  { month: 'Jun', completed: 32, inProgress: 15 },
  { month: 'Jul', completed: 20, inProgress: 24 },
  { month: 'Aug', completed: 26, inProgress: 14 },
]

export const DashboardChart: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<'1W' | '1M' | '1Y'>('1M')
  const maxTotal = 50

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
            Weekly & monthly goal completion throughput
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
              <span className="text-[#071E2D]/80 dark:text-slate-300 text-[11px]">Done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#00C4B3] border border-[#071E2D]" />
              <span className="text-[#071E2D]/80 dark:text-slate-300 text-[11px]">In Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stacked Chart Canvas */}
      <div className="flex items-end gap-3 sm:gap-4 pt-4 h-48 sm:h-52 w-full">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between h-full text-[10px] text-[#071E2D]/50 dark:text-slate-400 font-mono pb-6 pr-1 select-none font-bold">
          <span>50k</span>
          <span>40k</span>
          <span>30k</span>
          <span>20k</span>
          <span>10k</span>
          <span>00</span>
        </div>

        {/* Bars Container */}
        <div className="flex-1 flex items-end justify-between h-full border-b-2 border-[#071E2D]/15 dark:border-white/10 pb-2 px-1 gap-2">
          {MONTH_METRICS.map((item) => {
            const completedHeight = Math.round((item.completed / maxTotal) * 100)
            const inProgressHeight = Math.round((item.inProgress / maxTotal) * 100)

            return (
              <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full max-w-[28px] flex flex-col items-center justify-end rounded-t-xl overflow-hidden border-2 border-b-0 border-[#071E2D] dark:border-[#1E3A52] transition-all duration-300 group-hover:scale-y-105 group-hover:shadow-[2px_0px_0px_#071E2D] dark:group-hover:shadow-[2px_0px_0px_#000000]">
                  {/* Top Bar: Turquoise Accent */}
                  <div
                    className="w-full bg-[#00C4B3] rounded-t-md relative overflow-hidden"
                    style={{ height: `${inProgressHeight}%` }}
                    title={`${item.month} In Progress: ${item.inProgress}k`}
                  />

                  {/* Bottom Bar: Deep Navy Solid */}
                  <div
                    className="w-full bg-[#071E2D] dark:bg-white"
                    style={{ height: `${completedHeight}%` }}
                    title={`${item.month} Completed: ${item.completed}k`}
                  />
                </div>

                {/* X-Axis Month Label */}
                <span className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 font-bold mt-2 group-hover:text-[#071E2D] dark:group-hover:text-[#00C4B3] transition-colors">
                  {item.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
