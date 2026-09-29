import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, Plus, Calendar, AlertCircle, RefreshCw } from 'lucide-react'
import { useGoals } from '../../../context/GoalContext'
import { Loader } from '../../common/Loader'
import type { Goal } from '../../../types'

interface DayCell {
  date: number
  dateStr: string
  isCurrentMonth: boolean
  isToday: boolean
  hasActivity: boolean
  completedCount: number
  activeCount: number
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const CalendarPanel: React.FC = () => {
  const navigate = useNavigate()
  const { goals, loading, error, fetchGoals } = useGoals()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })

  if (loading && !goals.length) {
    return (
      <div className="py-20 flex justify-center">
        <Loader label="Synchronizing calendar schedule & milestones..." />
      </div>
    )
  }

  if (error && !goals.length) {
    return (
      <div className="p-8 rounded-3xl border-2 border-[#071E2D] dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-center flex flex-col items-center gap-3 shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000]">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 border-2 border-[#071E2D] dark:border-rose-700 flex items-center justify-center text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h3
          className="text-lg sm:text-xl font-extrabold text-[#071E2D] dark:text-white"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Could not sync schedule
        </h3>
        <p className="text-xs text-[#071E2D]/70 dark:text-slate-300 max-w-sm leading-relaxed">
          We had trouble retrieving your calendar milestones. Please check your connection and retry.
        </p>
        <button
          type="button"
          onClick={() => fetchGoals()}
          className="btn-pill btn-pill-primary text-xs !py-2 !px-5 inline-flex items-center gap-2 cursor-pointer mt-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Schedule Sync</span>
        </button>
      </div>
    )
  }

  // Map real activities and deadlines by 'YYYY-MM-DD'
  const activityMap = useMemo(() => {
    const map: Record<string, { completed: number; active: number; goals: Goal[]; logs: { goalTitle: string; note: string; value: any }[] }> = {}

    goals.forEach((g) => {
      // Check deadline
      if (g.deadline) {
        const dStr = g.deadline.split('T')[0]
        if (!map[dStr]) map[dStr] = { completed: 0, active: 0, goals: [], logs: [] }
        map[dStr].goals.push(g)
        if (g.status === 'completed') {
          map[dStr].completed += 1
        } else {
          map[dStr].active += 1
        }
      }

      // Check progress logs
      ;(g.progress_logs || []).forEach((log) => {
        if (log.timestamp) {
          const lStr = log.timestamp.split('T')[0]
          if (!map[lStr]) map[lStr] = { completed: 0, active: 0, goals: [], logs: [] }
          map[lStr].logs.push({
            goalTitle: g.title,
            note: log.note || 'Logged progress',
            value: log.value,
          })
        }
      })
    })

    return map
  }, [goals])

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const calendarDays = useMemo((): DayCell[] => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear)

    const days: DayCell[] = []

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const pMonth = currentMonth === 0 ? 12 : currentMonth
      const pYear = currentMonth === 0 ? currentYear - 1 : currentYear
      const dateNum = prevMonthDays - i
      const dateStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`
      const entry = activityMap[dateStr]
      days.push({
        date: dateNum,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        hasActivity: !!entry && (entry.completed > 0 || entry.active > 0 || entry.logs.length > 0),
        completedCount: entry?.completed || 0,
        activeCount: entry?.active || 0,
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear()
      const entry = activityMap[dateStr]
      days.push({
        date: day,
        dateStr,
        isCurrentMonth: true,
        isToday,
        hasActivity: !!entry && (entry.completed > 0 || entry.active > 0 || entry.logs.length > 0),
        completedCount: entry?.completed || 0,
        activeCount: entry?.active || 0,
      })
    }

    // Next month leading days
    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      const nMonth = currentMonth === 11 ? 1 : currentMonth + 2
      const nYear = currentMonth === 11 ? currentYear + 1 : currentYear
      const dateStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const entry = activityMap[dateStr]
      days.push({
        date: day,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        hasActivity: !!entry && (entry.completed > 0 || entry.active > 0 || entry.logs.length > 0),
        completedCount: entry?.completed || 0,
        activeCount: entry?.active || 0,
      })
    }

    return days
  }, [currentMonth, currentYear, activityMap, today])

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

  const selectedEntry = activityMap[selectedDateStr]

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
            Schedule deadlines, track progress logs, and view milestone consistency across all goals.
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
      <div className="flex items-center gap-4 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-[#00C4B3] border border-[#071E2D]" />
          <span className="text-[#071E2D]/70 dark:text-slate-300 font-semibold">Active Tracker / Log</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-[#071E2D] dark:bg-white border border-[#071E2D]" />
          <span className="text-[#071E2D]/70 dark:text-slate-300 font-semibold">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-[#006D6A] dark:text-[#00C4B3]" />
          <span className="text-[#071E2D]/70 dark:text-slate-300 font-semibold">Goal Completed</span>
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
          {calendarDays.map((cell, idx) => {
            const isSelected = selectedDateStr === cell.dateStr
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`
                  aspect-square rounded-xl border-2 p-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative
                  ${cell.isCurrentMonth ? 'text-[#071E2D] dark:text-white' : 'text-[#071E2D]/30 dark:text-slate-500'}
                  ${cell.isToday ? 'border-[#00C4B3] font-extrabold' : ''}
                  ${isSelected ? 'bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] border-[#071E2D] dark:border-[#00C4B3] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] scale-105 z-10' : 'bg-[#F8FAFB] dark:bg-[#091824] border-[#071E2D]/20 dark:border-[#1E3A52]'}
                  ${cell.hasActivity && !isSelected ? 'bg-[#E6F7F5] dark:bg-[#00C4B3]/10 border-[#00C4B3]/50' : ''}
                  hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none
                `}
              >
                <span className={`text-xs ${cell.isToday ? 'font-black underline decoration-[#00C4B3] underline-offset-2' : 'font-semibold'}`}>
                  {cell.date}
                </span>
                {cell.hasActivity && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C4B3]" />
                    {cell.completedCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Date Real Summary */}
      <div className="bg-[#F8FAFB] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-[#071E2D]/10 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#00C4B3] border-2 border-[#071E2D] flex items-center justify-center text-[#071E2D] text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-sm text-[#071E2D] dark:text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Agenda for {selectedDateStr}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/chat')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00C4B3] text-[#071E2D] text-xs font-bold border-2 border-[#071E2D] shadow-[2px_2px_0px_#071E2D] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>

        {selectedEntry && (selectedEntry.goals.length > 0 || selectedEntry.logs.length > 0) ? (
          <div className="flex flex-col gap-3">
            {selectedEntry.goals.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">
                  Trackers Due / Scheduled ({selectedEntry.goals.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedEntry.goals.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => navigate(`/dashboard/goal/${g.id}`)}
                      className="p-3 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#00C4B3] shadow-sm transition-all"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#071E2D] dark:text-white truncate">{g.title}</p>
                        <p className="text-[10px] text-[#071E2D]/60 dark:text-slate-400 mt-0.5">
                          Status: {g.status} · Progress: {g.current_value}/{g.target} {g.unit || ''}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#006D6A] dark:text-[#00C4B3]">Open →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedEntry.logs.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">
                  Logs Recorded ({selectedEntry.logs.length})
                </span>
                <div className="flex flex-col gap-1.5">
                  {selectedEntry.logs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white dark:bg-[#0E202D] border border-[#071E2D]/20 dark:border-[#1E3A52] rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-[#071E2D] dark:text-white">{log.goalTitle}</span>
                        <span className="text-[#071E2D]/60 dark:text-slate-400 ml-2">{log.note}</span>
                      </div>
                      <span className="font-mono font-bold text-[#006D6A] dark:text-[#00C4B3] shrink-0">
                        +{log.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#071E2D]/60 dark:text-slate-400">
            No goals due or progress logged on this date. Use the AI Chat or Quick Log to add an entry!
          </div>
        )}
      </div>
    </div>
  )
}
