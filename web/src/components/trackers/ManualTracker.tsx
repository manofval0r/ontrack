import React, { useState } from 'react'
import { Target, Zap, Flame, AlertTriangle } from 'lucide-react'
import type { Goal } from '../../types'
import { Button } from '../Button'

interface ManualTrackerProps {
  goal: Goal
  onLogReflection: (reflection: string, sentiment: string) => Promise<void>
}

const SENTIMENTS = [
  { id: 'focused', label: 'Laser Focused', icon: Target, color: 'bg-[#ECFEFF] text-[#006D6A] border-[#006D6A]' },
  { id: 'on-track', label: 'On Track', icon: Zap, color: 'bg-[#ECFEFF] text-[#006D6A] border-[#00C4B3]' },
  { id: 'pushed', label: 'Pushed Hard', icon: Flame, color: 'bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]' },
  { id: 'obstacle', label: 'Encountered Blocker', icon: AlertTriangle, color: 'bg-white text-[#dc2626] border-[#071E2D]' },
]

export const ManualTracker: React.FC<ManualTrackerProps> = ({ goal, onLogReflection }) => {
  const [reflection, setReflection] = useState('')
  const [selectedSentiment, setSelectedSentiment] = useState('focused')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reflection.trim() || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onLogReflection(reflection, selectedSentiment)
      setReflection('')
    } catch {
      setSubmitError('Could not save this entry. Try again.')
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
          <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">AI-Determined Format</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Daily Reflection & Manual Log
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#ECFEFF] dark:bg-[#00C4B3]/15 border-2 border-[#071E2D] dark:border-[#00C4B3]/60 text-xs font-bold text-[#006D6A] dark:text-[#00C4B3]">
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
                aria-pressed={selectedSentiment === s.id}
                aria-label={`Mood: ${s.label}`}
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
          aria-label="Reflection entry"
          className="w-full p-3 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] focus-visible:ring-2 focus-visible:ring-[#00C4B3] text-sm text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 outline-none transition-colors bg-white dark:bg-[#0E202D] resize-none"
        />
        {submitError && (
          <p role="alert" className="text-xs font-semibold text-red-700 dark:text-red-400">{submitError}</p>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={!reflection.trim() || submitting}>
            {submitting ? 'Logging…' : 'Log Reflection Entry'}
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
