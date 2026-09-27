import React, { useState } from 'react'
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
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D]">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#071E2D]/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A]">AI-Determined Format</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#071E2D]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Counter Tracker
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#071E2D]/60">Target:</span>
          <span className="px-3 py-1 rounded-full bg-[#ECFEFF] border-2 border-[#071E2D] text-xs font-bold text-[#006D6A]">
            {goal.target} {goal.unit || 'units'}
          </span>
        </div>
      </div>

      {/* Main Counter Display */}
      <div className="flex flex-col items-center justify-center py-6 px-4 bg-[#F8FAFB] border-2 border-[#071E2D] rounded-2xl shadow-[2px_2px_0px_#071E2D] text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#071E2D]/50 mb-1">Current Progress</span>
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className="text-6xl sm:text-7xl font-extrabold text-[#071E2D] tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {goal.current_value}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#071E2D]/40">
            / {goal.target}
          </span>
        </div>
        <span className="text-sm font-semibold text-[#006D6A] mb-6">
          {percent}% of target accomplished {isCompleted && '🎉 Goal Reached!'}
        </span>

        {/* Tactile Increment Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={submitting || goal.current_value <= 0}
            onClick={() => handleIncrement(-1)}
            aria-label="Decrement counter by 1"
            className="w-12 h-12 rounded-2xl border-2 border-[#071E2D] bg-white font-bold text-xl text-[#071E2D] shadow-[3px_3px_0px_#071E2D] hover:bg-[#F3F6F8] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#071E2D] disabled:opacity-40 transition-all flex items-center justify-center"
          >
            -1
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleIncrement(1)}
            aria-label="Increment counter by 1"
            className="px-6 h-12 rounded-2xl border-2 border-[#071E2D] bg-[#00C4B3] font-bold text-lg text-[#071E2D] shadow-[4px_4px_0px_#071E2D] hover:bg-[#33D6C5] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#071E2D] disabled:opacity-40 transition-all flex items-center gap-2"
          >
            <span>+1 Log Completion</span>
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs">✓</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleIncrement(5)}
            aria-label="Increment counter by 5"
            className="hidden sm:flex px-4 h-12 rounded-2xl border-2 border-[#071E2D] bg-white font-bold text-sm text-[#071E2D] shadow-[3px_3px_0px_#071E2D] hover:bg-[#F3F6F8] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#071E2D] disabled:opacity-40 transition-all items-center justify-center"
          >
            +5
          </button>
        </div>
      </div>

      {/* Progress Bar with tactile border */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-bold text-[#071E2D]">
          <span>Velocity Meter</span>
          <span>{percent}% Completed</span>
        </div>
        <div className="w-full h-4 rounded-full bg-[#E5E7EB] border-2 border-[#071E2D] overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00C4B3] to-[#006D6A] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Optional Note Logging */}
      <form onSubmit={handleCustomLog} className="flex flex-col sm:flex-row gap-3 pt-3 border-t-2 border-[#071E2D]/10">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Attach a context note (e.g. 'Signed Apex agreement, $18k ARR')..."
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#071E2D]/20 focus:border-[#00C4B3] text-sm text-[#071E2D] placeholder:text-[#071E2D]/40 outline-none transition-colors"
        />
        <Button type="submit" variant="secondary" noBubble disabled={!note.trim() || submitting} className="text-xs py-2 px-5">
          Record Note
        </Button>
      </form>
    </div>
  )
}
