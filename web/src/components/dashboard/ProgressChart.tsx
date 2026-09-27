import React from 'react'
import type { WeeklyActivityDay } from '../../types'

interface ProgressChartProps {
  days: WeeklyActivityDay[]
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ days }) => {
  const maxVal = Math.max(1, ...days.map((d) => Math.max(d.logged_count, d.completed_count)))

  return (
    <div className="bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D] p-6 sm:p-7 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#071E2D]/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A]">Execution Velocity</span>
          <h3
            className="text-lg sm:text-xl font-bold text-[#071E2D]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Weekly Goal Activity & Habit Momentum
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#00C4B3] border border-[#071E2D]" />
            <span>Progress Updates</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#071E2D]" />
            <span>Targets Completed</span>
          </div>
        </div>
      </div>

      {/* SVG / Bar Chart Representation */}
      <div className="h-44 w-full flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
        {days.map((d, idx) => {
          const loggedHeight = Math.round((d.logged_count / maxVal) * 100)
          const completedHeight = Math.round((d.completed_count / maxVal) * 100)

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="relative w-full flex items-end justify-center gap-1 h-32">
                {/* Logged Bar */}
                <div
                  style={{ height: `${loggedHeight}%` }}
                  className="w-1/2 max-w-[18px] bg-[#00C4B3] border-2 border-[#071E2D] rounded-t-lg transition-all duration-300 group-hover:bg-[#33D6C5] shadow-[1px_1px_0px_#071E2D]"
                  title={`${d.logged_count} progress updates`}
                />
                {/* Completed Bar */}
                <div
                  style={{ height: `${completedHeight}%` }}
                  className="w-1/2 max-w-[18px] bg-[#071E2D] border-2 border-[#071E2D] rounded-t-lg transition-all duration-300 shadow-[1px_1px_0px_#071E2D]"
                  title={`${d.completed_count} targets hit`}
                />
              </div>

              <div className="flex flex-col items-center">
                <span className={`text-xs font-bold ${d.isToday ? 'text-[#006D6A] font-extrabold underline' : 'text-[#071E2D]/70'}`}>
                  {d.day}
                </span>
                <span className="text-[10px] text-[#071E2D]/40">{d.date.split(' ')[1]}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
