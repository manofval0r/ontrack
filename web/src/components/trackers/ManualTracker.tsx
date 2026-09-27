import React, { useState } from 'react'
import type { Goal } from '../../types'
import { Button } from '../Button'

interface ManualTrackerProps {
  goal: Goal
  onLogReflection: (reflection: string, sentiment: string) => Promise<void>
}

const SENTIMENTS = [
  { id: 'focused', label: 'Laser Focused', icon: '🎯', color: 'bg-emerald-50 text-emerald-800 border-emerald-500' },
  { id: 'on-track', label: 'On Track', icon: '⚡', color: 'bg-cyan-50 text-cyan-800 border-cyan-500' },
  { id: 'pushed', label: 'Pushed Hard', icon: '💪', color: 'bg-amber-50 text-amber-800 border-amber-500' },
  { id: 'obstacle', label: 'Encountered Blocker', icon: '🚧', color: 'bg-rose-50 text-rose-800 border-rose-500' },
]

export const ManualTracker: React.FC<ManualTrackerProps> = ({ goal, onLogReflection }) => {
  const [reflection, setReflection] = useState('')
  const [selectedSentiment, setSelectedSentiment] = useState('focused')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reflection.trim()) return
    setSubmitting(true)
    try {
      await onLogReflection(reflection, selectedSentiment)
      setReflection('')
    } finally {
      setSubmitting(false)
    }
  }

  const logs = goal.progress_logs || []

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#071E2D]/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B21A8]">AI-Determined Format</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#071E2D]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Daily Reflection & Manual Log
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#FAF5FF] border-2 border-[#071E2D] text-xs font-bold text-[#6B21A8]">
            {logs.length} Entries Logged
          </span>
        </div>
      </div>

      {/* New Reflection Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 rounded-2xl bg-[#F8FAFB] border-2 border-[#071E2D] shadow-[2px_2px_0px_#071E2D]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60">
          How did today\'s session go?
        </span>

        {/* Sentiment Picker */}
        <div className="flex flex-wrap gap-2">
          {SENTIMENTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSentiment(s.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                border-2 transition-all
                ${selectedSentiment === s.id
                  ? 'bg-[#071E2D] text-white border-[#071E2D] shadow-[2px_2px_0px_#00C4B3]'
                  : 'bg-white text-[#071E2D] border-[#071E2D]/30 hover:border-[#071E2D]'
                }
              `.trim()}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Record key breakthroughs, insights, completed items, or friction encountered..."
          className="w-full p-3.5 rounded-xl border-2 border-[#071E2D]/20 focus:border-[#00C4B3] text-sm text-[#071E2D] placeholder:text-[#071E2D]/40 outline-none transition-colors bg-white resize-none"
        />

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={!reflection.trim() || submitting}>
            Log Reflection Entry
          </Button>
        </div>
      </form>

      {/* Recent Reflection Feed */}
      {logs.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60">
            Past Reflection History
          </span>
          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border-2 border-[#071E2D]/20 bg-white flex flex-col gap-1 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-[#071E2D]/60">
                  <span className="font-semibold text-[#006D6A]">{log.value}</span>
                  <span className="font-mono">{log.timestamp}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#071E2D] font-medium leading-relaxed">
                  {log.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
