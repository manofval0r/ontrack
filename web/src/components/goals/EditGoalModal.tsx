import React, { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../Button'
import { Trash2, AlertTriangle, Calendar, Target, Check } from 'lucide-react'
import type { Goal, GoalDomain, GoalStatus } from '../../types'

interface EditGoalModalProps {
  goal: Goal | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, updates: Partial<Goal>) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const DOMAINS: { id: GoalDomain; label: string }[] = [
  { id: 'sales', label: 'Sales & Revenue' },
  { id: 'engineering', label: 'Engineering & Code' },
  { id: 'fitness', label: 'Fitness & Health' },
  { id: 'learning', label: 'Learning & Study' },
  { id: 'mindset', label: 'Mindset & Habits' },
  { id: 'general', label: 'General Goal' },
]

const STATUSES: { id: GoalStatus; label: string }[] = [
  { id: 'active', label: 'Active (In Progress)' },
  { id: 'completed', label: 'Completed (Shipped)' },
  { id: 'paused', label: 'Paused' },
  { id: 'failed', label: 'Missed / Failed' },
]

export const EditGoalModal: React.FC<EditGoalModalProps> = ({
  goal,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState<number>(0)
  const [unit, setUnit] = useState('')
  const [domain, setDomain] = useState<GoalDomain>('general')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState<GoalStatus>('active')
  const [saving, setSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '')
      setTarget(goal.target || 0)
      setUnit(goal.unit || '')
      setDomain((goal.domain as GoalDomain) || 'general')
      setDeadline(
        goal.deadline ? (goal.deadline.includes('T') ? goal.deadline.split('T')[0] : goal.deadline) : ''
      )
      setStatus(goal.status || 'active')
      setShowConfirmDelete(false)
    }
  }, [goal, isOpen])

  if (!goal) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || saving) return

    setSaving(true)
    try {
      await onSave(goal.id, {
        title: title.trim(),
        target: Number(target) || 0,
        unit: unit.trim(),
        domain,
        deadline,
        status,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return
    setIsDeleting(true)
    try {
      await onDelete(goal.id)
      onClose()
    } finally {
      setIsDeleting(false)
      setShowConfirmDelete(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Goal Tracker" maxWidth="max-w-xl">
      <div className="flex flex-col gap-6">
        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300">
              Goal Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sell 5 enterprise software subscriptions"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors"
            />
          </div>

          {/* Target & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#006D6A] dark:text-[#00C4B3]" />
                <span>Target Value</span>
              </label>
              <input
                type="number"
                min="0"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                placeholder="e.g. 5 or 10"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300">
                Unit / Label
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. leads, workouts, commits"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Domain & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300">
                Category Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as GoalDomain)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors cursor-pointer"
              >
                {DOMAINS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#006D6A] dark:text-[#00C4B3]" />
              <span>Target Deadline</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors font-mono cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10">
            {onDelete ? (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Goal</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button type="button" variant="secondary" onClick={onClose} disabled={saving || isDeleting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving || isDeleting || !title.trim()}>
                <Check className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Warning Sub-Panel */}
        {showConfirmDelete && (
          <div className="p-4 rounded-xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 flex flex-col gap-3 animate-fadeIn">
            <div className="flex items-start gap-2.5 text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-sm">Delete "{goal.title}"?</span>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                  This action will permanently delete this goal tracker, including its logged activity, checklist items, and history. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200 dark:border-rose-900/50">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-bold text-[#071E2D] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                Keep Goal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 border border-rose-700 rounded-lg shadow-[2px_2px_0px_#991b1b] cursor-pointer transition-all active:translate-y-0.5"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Permanently Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
