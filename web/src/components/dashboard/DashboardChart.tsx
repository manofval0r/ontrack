import React from 'react'

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
  const maxTotal = 50

  return (
    <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      {/* Header and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight font-sans">
            Total Velocity
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            View your execution in a certain period of time
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="text-gray-500 font-semibold text-[11px]">Velocity & Pace</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#1C1E21]" />
            <span className="text-gray-600 text-[11px]">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FF5C35]" />
            <span className="text-gray-600 text-[11px]">In Progress</span>
          </div>
        </div>
      </div>

      {/* Stacked Chart Canvas */}
      <div className="flex items-end gap-3 sm:gap-4 pt-4 h-48 sm:h-52 w-full">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between h-full text-[10px] text-gray-400 font-mono pb-6 pr-1 select-none">
          <span>50k</span>
          <span>40k</span>
          <span>30k</span>
          <span>20k</span>
          <span>10k</span>
          <span>00</span>
        </div>

        {/* Bars Container */}
        <div className="flex-1 flex items-end justify-between h-full border-b border-gray-100 pb-2 px-1 gap-2">
          {MONTH_METRICS.map((item) => {
            const completedHeight = Math.round((item.completed / maxTotal) * 100)
            const inProgressHeight = Math.round((item.inProgress / maxTotal) * 100)

            return (
              <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full max-w-[28px] flex flex-col items-center justify-end rounded-t-xl overflow-hidden transition-all duration-300 group-hover:scale-y-105">
                  {/* Top Bar: Vibrant Orange Striped Pattern matching screenshot */}
                  <div
                    className="w-full bg-[#FF5C35] rounded-t-md relative overflow-hidden"
                    style={{
                      height: `${inProgressHeight}%`,
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255, 255, 255, 0.3) 3px, rgba(255, 255, 255, 0.3) 6px)`,
                    }}
                    title={`${item.month} In Progress: ${item.inProgress}k`}
                  />

                  {/* Bottom Bar: Solid Dark Navy / Black matching screenshot */}
                  <div
                    className="w-full bg-[#1C1E21]"
                    style={{ height: `${completedHeight}%` }}
                    title={`${item.month} Completed: ${item.completed}k`}
                  />
                </div>

                {/* X-Axis Month Label */}
                <span className="text-[11px] text-gray-400 font-medium mt-2 group-hover:text-gray-900 transition-colors">
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
