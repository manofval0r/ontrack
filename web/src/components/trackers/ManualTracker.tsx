import React, { useState } from 'react'
import { Target, Zap, Flame, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { Goal, ProgressLog } from '../../types'
import { Button } from '../Button'

interface ManualTrackerProps {
  goal: Goal
  onLogReflection: (reflection: string, sentiment: string) => Promise<void>
}

const SENTIMENTS = [
  { id: 'focused', label: 'Laser Focused', icon: Target, activeClass: 'bg-[#006D6A] text-white border-[#071E2D] dark:bg-[#00C4B3] dark:text-[#071E2D]' },
  { id: 'on-track', label: 'On Track', icon: Zap, activeClass: 'bg-[#00C4B3] text-[#071E2D] border-[#071E2D]' },
  { id: 'pushed', label: 'Pushed Hard', icon: Flame, activeClass: 'bg-[#F59E0B] text-[#071E2D] border-[#071E2D]' },
  { id: 'obstacle', label: 'Encountered Blocker', icon: AlertTriangle, activeClass: 'bg-red-700 text-white border-[#071E2D]' },
]

export const ManualTracker: React.FC<ManualTrackerProps> = ({ goal, onLogReflection }) => {
  const [reflection, setReflection] = useState('')
  const [selectedSentiment, setSelectedSentiment] = useState('focused')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)
  const [localLogs, setLocalLogs] = useState<ProgressLog[]>([])

  const activeSentimentObj = SENTIMENTS.find((s) => s.id === selectedSentiment) || SENTIMENTS[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setSubmitError(null)
    setSuccessNotice(null)
    const label = activeSentimentObj.label
    const trimmedRef = reflection.trim()
    const finalNote = trimmedRef ? `[${label}] ${trimmedRef}` : `Checked in: ${label}`

    const optimisticEntry: ProgressLog = {
      id: `local-ref-${Date.now()}`,
      goal_id: goal.id,
      value: 1,
      note: finalNote,
      timestamp: new Date().toISOString(),
    }
    setLocalLogs((prev) => [optimisticEntry, ...prev])

    try {
      await onLogReflection(finalNote, selectedSentiment)
      setLocalLogs((prev) => prev.filter((log) => log.id !== optimisticEntry.id))
      setReflection('')
      setSuccessNotice('Reflection logged successfully!')
      setTimeout(() => setSuccessNotice(null), 3500)
    } catch {
      setLocalLogs((prev) => prev.filter((log) => log.id !== optimisticEntry.id))
      setSubmitError('Could not save this entry. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const logs = [...localLogs, ...(goal.progress_logs ?? [])]

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
            {logs.length} {logs.length === 1 ? 'Entry Logged' : 'Entries Logged'}
          </span>
        </div>
      </div>

      {/* New Reflection Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 rounded-2xl bg-[#F8FAFB] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60 dark:text-slate-400">
            How did today's session go?
          </span>
          <span className="text-[11px] font-semibold text-[#006D6A] dark:text-[#00C4B3]">
            Selected: {activeSentimentObj.label}
          </span>
        </div>

        {/* Sentiment Picker */}
        <div className="flex flex-wrap gap-2">
          {SENTIMENTS.map((s) => {
            const Icon = s.icon
            const isSelected = selectedSentiment === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSentiment(s.id)}
                aria-pressed={selectedSentiment === s.id}
                aria-label={`Mood: ${s.label}`}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                  border-2 transition-all cursor-pointer select-none
                  ${isSelected
                    ? `${s.activeClass} shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]`
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
            placeholder="Record key breakthroughs, insights, completed items, or friction encountered (optional)..."
          aria-label="Reflection entry"
          className="w-full p-3 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] focus-visible:ring-2 focus-visible:ring-[#00C4B3] text-sm text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 outline-none transition-colors bg-white dark:bg-[#0E202D] resize-none"
        />
        {submitError && (
          <p role="alert" className="text-xs font-semibold text-red-700 dark:text-red-400">{submitError}</p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs text-[#071E2D]/60 dark:text-slate-400 flex items-center gap-1.5">
            {successNotice ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> {successNotice}
              </span>
            ) : (
              <span>Ready to log today's check-in with or without extra notes.</span>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            noBubble
            className="flex items-center justify-center gap-2 font-bold px-6 py-2.5 self-stretch sm:self-auto cursor-pointer text-xs"
          >
            <span>{submitting ? 'Logging Entry...' : 'Log Reflection Entry'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Recent Reflection Feed */}
      {logs.length > 0 ? (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60 dark:text-slate-400">
            Past Reflection History
          </span>
          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
            {logs.map((log, idx) => {
              // Extract sentiment tag if note starts with [Tag]
              const match = typeof log.note === 'string' ? log.note.match(/^\[(.*?)\]\s*(.*)$/) : null
              const badge = match ? match[1] : (typeof log.value === 'string' && isNaN(Number(log.value)) ? log.value : `Entry #${logs.length - idx}`)
              const text = match ? match[2] : (log.note || 'Session completed')

              return (
                <div
                  key={log.id || idx}
                  className="p-3.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#091824] flex flex-col gap-1 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs text-[#071E2D]/60 dark:text-slate-400">
                    <span className="font-semibold px-2 py-0.5 rounded-md bg-[#E6F7F5] dark:bg-[#00C4B3]/20 text-[#006D6A] dark:text-[#00C4B3] border border-[#00C4B3]/40">
                      {badge}
                    </span>
                    <span className="font-mono text-[11px]">
                      {log.timestamp ? (log.timestamp.includes('T') ? log.timestamp.split('T')[0] : log.timestamp) : 'Today'}
                    </span>
                  </div>
                  {text && (
                    <p className="text-xs sm:text-sm text-[#071E2D] dark:text-white font-medium leading-relaxed mt-1">
                      {text}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-[#071E2D]/20 dark:border-[#1E3A52] text-center text-xs text-[#071E2D]/50 dark:text-slate-400">
          No reflections recorded yet. Select how today went and click <strong>Log Reflection Entry</strong> to record your session.
        </div>
      )}
    </div>
  )
}

