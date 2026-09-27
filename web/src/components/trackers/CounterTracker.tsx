import React, { useState } from 'react'
import { Trophy, Check } from 'lucide-react'
import type { Goal } from '../../types'
import { Button } from '../Button'

interface CounterTrackerProps {
  goal: Goal
  onUpdate: (newValue: number, note?: string) => Promise<void>
}

export const CounterTracker: React.FC<CounterTrackerProps> = ({ goal, onUpdate }) => {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const percent = Math.min(100, Math.round((goal.current_value / goal.target) * 100))

  const handleIncrement = async (delta: number) => {
    const nextVal = Math.max(0, goal.current_value + delta)
    setSubmitting(true)
    try {
      await onUpdate(nextVal, delta > 0 ? `Incremented target count by +${delta}` : `Decremented target count by ${delta}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCustomLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    setSubmitting(true)
    try {
      await onUpdate(goal.current_value, note)
      setNote('')
    } finally {
      setSubmitting(false)
    }
  }

  const isCompleted = goal.current_value >= goal.target

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] transition-colors">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">AI-Determined Format</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Counter Tracker
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#071E2D]/60 dark:text-slate-400">Target:</span>
          <span className="px-3 py-1 rounded-full bg-[#ECFEFF] dark:bg-[#00C4B3]/15 border-2 border-[#071E2D] dark:border-[#1E3A52] text-xs font-bold text-[#006D6A] dark:text-[#00C4B3]">
            {goal.target} {goal.unit || 'units'}
          </span>
        </div>
      </div>

      {/* Main Counter Display */}
      <div className="flex flex-col items-center justify-center py-6 px-4 bg-[#F8FAFB] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] text-center transition-colors">
        <span className="text-xs font-bold uppercase tracking-widest text-[#071E2D]/50 dark:text-slate-400 mb-1">Current Progress</span>
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className="text-6xl sm:text-7xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {goal.current_value}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#071E2D]/40 dark:text-slate-500">
            / {goal.target}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006D6A] dark:text-[#00C4B3] mb-6">
          <span>{percent}% of target accomplished</span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold ml-1">
              <Trophy className="w-4 h-4" />
              <span>Goal Reached!</span>
            </span>
          )}
        </span>

        {/* Tactile Increment Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={submitting || goal.current_value <= 0}
            onClick={() => handleIncrement(-1)}
            aria-label="Decrement counter by 1"
            className="w-12 h-12 rounded-2xl border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] font-bold text-xl text-[#071E2D] dark:text-white shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#F3F6F8] dark:hover:bg-[#152E42] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#071E2D] dark:active:shadow-[1px_1px_0px_#000000] disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
          >
            -1
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleIncrement(1)}
            aria-label="Increment counter by 1"
            className="px-6 h-12 rounded-2xl border-2 border-[#071E2D] dark:border-[#00C4B3] bg-[#00C4B3] font-bold text-lg text-[#071E2D] shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] hover:bg-[#33D6C5] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#071E2D] dark:active:shadow-[1px_1px_0px_#000000] disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>+1 Log Completion</span>
            <span className="w-6 h-6 rounded-full bg-white dark:bg-[#071E2D] text-[#071E2D] dark:text-[#00C4B3] flex items-center justify-center text-xs">
              <Check className="w-3.5 h-3.5" />
            </span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleIncrement(5)}
            aria-label="Increment counter by 5"
            className="hidden sm:flex px-4 h-12 rounded-2xl border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] font-bold text-sm text-[#071E2D] dark:text-white shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#F3F6F8] dark:hover:bg-[#152E42] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#071E2D] dark:active:shadow-[1px_1px_0px_#000000] disabled:opacity-40 transition-all items-center justify-center cursor-pointer"
          >
            +5
          </button>
        </div>
      </div>

      {/* Progress Bar with tactile border */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-bold text-[#071E2D] dark:text-white">
          <span>Velocity Meter</span>
          <span>{percent}% Completed</span>
        </div>
        <div className="w-full h-4 rounded-full bg-[#E5E7EB] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00C4B3] to-[#006D6A] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Optional Note Logging */}
      <form onSubmit={handleCustomLog} className="flex flex-col sm:flex-row gap-3 pt-3 border-t-2 border-[#071E2D]/10 dark:border-white/10">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Attach a context note (e.g. 'Signed Apex agreement, $18k ARR')..."
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#091824] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 outline-none transition-colors"
        />
        <Button type="submit" variant="secondary" noBubble disabled={!note.trim() || submitting} className="text-xs py-2 px-5">
          Record Note
        </Button>
      </form>
    </div>
  )
}
