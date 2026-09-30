import React, { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../Button'
import {
  Trash2,
  AlertTriangle,
  Calendar,
  Target,
  Check,
  Hash,
  CheckSquare,
  BookOpen,
  Plus,
  X,
  FileText,
} from 'lucide-react'
import type { Goal, GoalDomain, GoalStatus, TrackerType, GoalItem } from '../../types'

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

const TRACKER_TYPES: {
  id: TrackerType
  label: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    id: 'counter',
    label: 'Counter Tracker',
    desc: 'Target number with increment buttons (+1, +5, -1)',
    icon: Hash,
  },
  {
    id: 'checklist',
    label: 'Milestone Checklist',
    desc: 'Sequential task checklist with checkboxes',
    icon: CheckSquare,
  },
  {
    id: 'manual',
    label: 'Daily Reflection',
    desc: 'Daily check-in journal with sentiment tags',
    icon: BookOpen,
  },
]

export const EditGoalModal: React.FC<EditGoalModalProps> = ({
  goal,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalType, setGoalType] = useState<TrackerType>('counter')
  const [target, setTarget] = useState<number>(10)
  const [unit, setUnit] = useState('')
  const [domain, setDomain] = useState<GoalDomain>('general')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState<GoalStatus>('active')
  const [items, setItems] = useState<GoalItem[]>([])
  const [newMilestoneText, setNewMilestoneText] = useState('')

  const [saving, setSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '')
      setDescription(goal.description || '')
      setGoalType(goal.goal_type || 'counter')
      // If target was 0 or unset, default to sensible 10
      setTarget(goal.target && goal.target > 0 ? goal.target : 10)
      setUnit(goal.unit || '')
      setDomain((goal.domain as GoalDomain) || 'general')
      setDeadline(
        goal.deadline ? (goal.deadline.includes('T') ? goal.deadline.split('T')[0] : goal.deadline) : ''
      )
      setStatus(goal.status || 'active')
      setItems(
        goal.items && goal.items.length > 0
          ? goal.items.map((it, idx) => ({
              id: it.id || `item-${Date.now()}-${idx}`,
              title: it.title,
              completed: !!it.completed,
              order: it.order ?? idx + 1,
            }))
          : [
              { id: `item-1`, title: 'Define actionable milestone plan', completed: false, order: 1 },
              { id: `item-2`, title: 'Execute initial test or workout', completed: false, order: 2 },
            ]
      )
      setShowConfirmDelete(false)
      setNewMilestoneText('')
    }
  }, [goal, isOpen])

  if (!goal) return null

  // Checklist handlers
  const handleItemTitleChange = (id: string, newTitle: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item)))
  }

  const handleToggleItemComplete = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    )
  }

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMilestoneText.trim()) return
    const newItem: GoalItem = {
      id: `item-${Date.now()}`,
      title: newMilestoneText.trim(),
      completed: false,
      order: items.length + 1,
    }
    setItems((prev) => [...prev, newItem])
    setNewMilestoneText('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || saving) return

    setSaving(true)
    try {
      const finalTarget =
        goalType === 'counter'
          ? Math.max(1, Number(target) || 1)
          : goalType === 'checklist'
          ? Math.max(1, items.length)
          : 1

      const updates: Partial<Goal> = {
        title: title.trim(),
        description: description.trim(),
        goal_type: goalType,
        target: finalTarget,
        unit: unit.trim() || (goalType === 'counter' ? 'units' : goalType === 'checklist' ? 'milestones' : 'days'),
        domain,
        deadline,
        status,
      }

      if (goalType === 'checklist') {
        updates.items = items
        updates.current_value = items.filter((i) => i.completed).length
      }

      await onSave(goal.id, updates)
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Goal & Tracker Plan" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300">
              Goal Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Run 100km this month or Close 5 B2B software deals"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm font-semibold text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors"
            />
          </div>

          {/* Tracker Format / Plan Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300">
              Tracker Format & Plan Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TRACKER_TYPES.map((t) => {
                const Icon = t.icon
                const isSelected = goalType === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setGoalType(t.id)}
                    className={`p-3 rounded-xl border-2 text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00C4B3] bg-[#ECFEFF]/60 dark:bg-[#00C4B3]/15 shadow-[2px_2px_0px_#00C4B3]'
                        : 'border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] hover:border-[#071E2D] dark:hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                          isSelected
                            ? 'bg-[#00C4B3] text-[#071E2D] border-[#071E2D]'
                            : 'bg-[#F8FAFB] dark:bg-[#091824] text-[#071E2D]/70 dark:text-slate-300 border-[#071E2D]/20'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#071E2D] dark:text-white">
                        {t.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 leading-snug line-clamp-2">
                      {t.desc}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dynamic Configuration based on Tracker Type */}
          {goalType === 'counter' && (
            <div className="p-4 rounded-xl border-2 border-[#00C4B3]/40 bg-[#ECFEFF]/30 dark:bg-[#00C4B3]/5 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Counter Target Settings</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#071E2D] dark:text-slate-300">
                    Target Goal Value <span className="text-rose-500">* (min: 1)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={target}
                    onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))}
                    required
                    placeholder="e.g. 10 or 100"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors font-mono font-bold"
                  />
                  <span className="text-[11px] text-[#071E2D]/60 dark:text-slate-400">
                    Will prevent 0/0 and calculate completion accurately.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#071E2D] dark:text-slate-300">
                    Measurement Unit / Label
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. workouts, sales, km, chapters, commits"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-sm text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors"
                  />
                  <span className="text-[11px] text-[#071E2D]/60 dark:text-slate-400">
                    Shown as: "{target} {unit || 'units'}"
                  </span>
                </div>
              </div>
            </div>
          )}

          {goalType === 'checklist' && (
            <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Checklist Milestones ({items.filter((i) => i.completed).length} / {items.length} done)</span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  Target: {items.length} milestones
                </span>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 py-2">
                    No milestone tasks defined yet. Add steps below to build your checklist plan.
                  </p>
                ) : (
                  items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#0E202D] border border-[#071E2D]/20 dark:border-[#1E3A52]"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleItemComplete(item.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                          item.completed
                            ? 'bg-[#00C4B3] border-[#071E2D] text-[#071E2D]'
                            : 'bg-white dark:bg-[#091824] border-[#071E2D]/30'
                        }`}
                        title={item.completed ? 'Mark pending' : 'Mark completed'}
                      >
                        {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleItemTitleChange(item.id, e.target.value)}
                        placeholder={`Milestone #${idx + 1}`}
                        className={`flex-1 text-xs bg-transparent outline-none font-medium ${
                          item.completed
                            ? 'line-through text-[#071E2D]/40 dark:text-slate-500'
                            : 'text-[#071E2D] dark:text-white'
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                        title="Delete milestone"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Milestone Row */}
              <div className="flex items-center gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/40">
                <input
                  type="text"
                  value={newMilestoneText}
                  onChange={(e) => setNewMilestoneText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddMilestone(e)
                    }
                  }}
                  placeholder="New milestone step or deliverable..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-[#071E2D]/20 dark:border-[#1E3A52] text-xs bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white outline-none focus:border-[#00C4B3]"
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  disabled={!newMilestoneText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Step</span>
                </button>
              </div>
            </div>
          )}

          {goalType === 'manual' && (
            <div className="p-4 rounded-xl border-2 border-purple-500/40 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col gap-2 text-xs text-[#071E2D]/80 dark:text-slate-300">
              <span className="font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Daily Reflection Plan</span>
              </span>
              <p className="leading-relaxed">
                Tracks daily qualitative reflections and sentiment check-ins (e.g. Laser Focused, On Track, Pushed Hard, Encountered Blocker). Suitable for habits, mindset, reading, and continuous routines.
              </p>
            </div>
          )}

          {/* Strategy / Plan Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#006D6A] dark:text-[#00C4B3]" />
              <span>Strategy & Execution Plan (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline your milestones, cadence, habits, or specific rules for achieving this goal..."
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-xs text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors resize-none leading-relaxed"
            />
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
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-xs font-semibold text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors cursor-pointer"
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
                Tracking Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-xs font-semibold text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors cursor-pointer"
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
            <label className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#006D6A] dark:text-[#00C4B3]" />
              <span>Target Deadline</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] text-xs text-[#071E2D] dark:text-white bg-white dark:bg-[#0E202D] outline-none transition-colors font-mono cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-[#071E2D]/10 dark:border-white/10">
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
              <Button type="button" variant="secondary" onClick={onClose} disabled={saving || isDeleting} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving || isDeleting || !title.trim()} className="text-xs flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Tracker Plan'}</span>
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
