import React, { useState } from 'react'
import { Target, Zap, Flame, AlertTriangle } from 'lucide-react'
import type { Goal } from '../../types'
import { Button } from '../Button'

interface ManualTrackerProps {
  goal: Goal
  onLogReflection: (reflection: string, sentiment: string) => Promise<void>
}

const SENTIMENTS = [
  { id: 'focused', label: 'Laser Focused', icon: Target, color: 'bg-emerald-50 text-emerald-800 border-emerald-500' },
  { id: 'on-track', label: 'On Track', icon: Zap, color: 'bg-cyan-50 text-cyan-800 border-cyan-500' },
  { id: 'pushed', label: 'Pushed Hard', icon: Flame, color: 'bg-amber-50 text-amber-800 border-amber-500' },
  { id: 'obstacle', label: 'Encountered Blocker', icon: AlertTriangle, color: 'bg-rose-50 text-rose-800 border-rose-500' },
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
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B21A8] dark:text-purple-400">AI-Determined Format</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Daily Reflection & Manual Log
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#FAF5FF] dark:bg-purple-950/40 border-2 border-[#071E2D] dark:border-purple-800 text-xs font-bold text-[#6B21A8] dark:text-purple-300">
            {logs.length} Entries Logged
          </span>
        </div>
      </div>

      {/* New Reflection Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 rounded-2xl bg-[#F8FAFB] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] transition-colors">
        <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60 dark:text-slate-400">
          How did today's session go?
        </span>

        {/* Sentiment Picker */}
        <div className="flex flex-wrap gap-2">
          {SENTIMENTS.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSentiment(s.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                  border-2 transition-all cursor-pointer
                  ${selectedSentiment === s.id
                    ? 'bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] border-[#071E2D] dark:border-[#00C4B3] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]'
                    : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-slate-200 border-[#071E2D]/30 dark:border-[#1E3A52] hover:border-[#071E2D] dark:hover:border-slate-400'
                  }
                `.trim()}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            )
          })}
        </div>

        <textarea
          rows={3}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Record key breakthroughs, insights, completed items, or friction encountered..."
          className="w-full p-3.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 outline-none transition-colors bg-white dark:bg-[#0E202D] resize-none"
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
          <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60 dark:text-slate-400">
            Past Reflection History
          </span>
          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#091824] flex flex-col gap-1 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-[#071E2D]/60 dark:text-slate-400">
                  <span className="font-semibold text-[#006D6A] dark:text-[#00C4B3]">{log.value}</span>
                  <span className="font-mono">{log.timestamp}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#071E2D] dark:text-white font-medium leading-relaxed">
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
