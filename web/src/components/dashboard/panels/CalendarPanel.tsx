import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Zap } from 'lucide-react'

interface DayCell {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  hasActivity: boolean
  completedCount: number
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Mock activity data
const ACTIVITY_DATA: Record<string, { completed: number; pending: number }> = {
  '2026-04-15': { completed: 3, pending: 2 },
  '2026-04-16': { completed: 5, pending: 1 },
  '2026-04-17': { completed: 2, pending: 3 },
  '2026-04-18': { completed: 4, pending: 2 },
  '2026-04-20': { completed: 1, pending: 4 },
  '2026-04-22': { completed: 6, pending: 0 },
  '2026-04-24': { completed: 3, pending: 2 },
}

export const CalendarPanel: React.FC = () => {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const generateCalendarDays = (): DayCell[] => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear)

    const days: DayCell[] = []

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`
      days.push({
        date: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false,
        hasActivity: !!ACTIVITY_DATA[dateStr],
        completedCount: ACTIVITY_DATA[dateStr]?.completed || 0,
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
      days.push({
        date: day,
        isCurrentMonth: true,
        isToday,
        hasActivity: !!ACTIVITY_DATA[dateStr],
        completedCount: ACTIVITY_DATA[dateStr]?.completed || 0,
      })
    }

    // Next month leading days
    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: false,
        hasActivity: !!ACTIVITY_DATA[dateStr],
        completedCount: ACTIVITY_DATA[dateStr]?.completed || 0,
      })
    }

    return days
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Goal Calendar
          </h2>
          <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-0.5 font-medium">
            Track progress, streaks, and upcoming deadlines across all trackers.
          </p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-bold text-[#071E2D] dark:text-white min-w-[140px] text-center">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-[#00C4B3] border border-[#071E2D]" />
          <span className="text-[#071E2D]/70 dark:text-slate-300 font-semibold">Active Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-[#071E2D] dark:bg-white border border-[#071E2D]" />
          <span className="text-[#071E2D]/70 dark:text-slate-300 font-semibold">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-[#006D6A] dark:text-[#00C4B3]" />
          <span className="text-[#071E2D]/70 dark:text-slate-300 font-semibold">Goals Completed</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000]">
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-2 mb-3 pb-3 border-b-2 border-[#071E2D]/10 dark:border-white/10">
          {DAY_NAMES.map((day) => (
            <div key={day} className="text-center text-xs font-bold uppercase tracking-wider text-[#071E2D]/60 dark:text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((cell, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDate(`${currentYear}-${currentMonth + 1}-${cell.date}`)}
              className={`
                aspect-square rounded-xl border-2 p-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative
                ${cell.isCurrentMonth ? 'text-[#071E2D] dark:text-white' : 'text-[#071E2D]/30 dark:text-slate-500'}
                ${cell.isToday ? 'bg-[#071E2D] dark:bg-white text-white dark:text-[#071E2D] border-[#071E2D] dark:border-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] font-extrabold' : 'bg-[#F8FAFB] dark:bg-[#091824] border-[#071E2D]/20 dark:border-[#1E3A52]'}
                ${cell.hasActivity && !cell.isToday ? 'bg-[#E6F7F5] dark:bg-[#00C4B3]/10 border-[#00C4B3]/50' : ''}
                hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none
              `}
            >
              <span className={`text-xs ${cell.isToday ? 'font-extrabold' : 'font-semibold'}`}>
                {cell.date}
              </span>
              {cell.hasActivity && cell.completedCount > 0 && (
                <div className="absolute bottom-1 flex items-center gap-0.5">
                  {Array.from({ length: Math.min(cell.completedCount, 3) }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${cell.isToday ? 'bg-[#00C4B3]' : 'bg-[#00C4B3]'}`}
                    />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected date summary */}
      {selectedDate && (
        <div className="bg-[#E6F7F5] dark:bg-[#00C4B3]/10 border-2 border-[#00C4B3]/50 rounded-2xl p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-[#006D6A] dark:text-[#00C4B3] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm font-bold text-[#071E2D] dark:text-white block">
              {selectedDate}
            </span>
            <p className="text-xs text-[#071E2D]/70 dark:text-slate-300 mt-1">
              3 goals completed, 2 pending. Logged 5 activities via AI coach.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
