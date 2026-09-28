import React, { useState } from 'react'
import type { Goal, GoalItem } from '../../types'
import { Button } from '../Button'

interface ChecklistTrackerProps {
  goal: Goal
  onUpdateItems: (items: GoalItem[]) => Promise<void>
}

export const ChecklistTracker: React.FC<ChecklistTrackerProps> = ({ goal, onUpdateItems }) => {
  const [items, setItems] = useState<GoalItem[]>(goal.items || [])
  const [newItemText, setNewItemText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const completedCount = items.filter((i) => i.completed).length
  const totalCount = items.length || 1
  const percent = Math.round((completedCount / totalCount) * 100)

  const toggleItem = async (itemId: string) => {
    if (submitting) return
    const previous = items
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    setItems(updated)
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onUpdateItems(updated)
    } catch {
      setItems(previous)
      setSubmitError('Could not save. Change reverted.')
    } finally {
      setSubmitting(false)
    }
  }

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemText.trim() || submitting) return
    const newItem: GoalItem = {
      id: `item-${Date.now()}`,
      title: newItemText.trim(),
      completed: false,
      order: items.length + 1,
    }
    const updated = [...items, newItem]
    setItems(updated)
    setNewItemText('')
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onUpdateItems(updated)
    } catch {
      setItems(items)
      setNewItemText(newItem.title)
      setSubmitError('Could not add item. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">AI-Determined Format</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Milestone Checklist
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#ECFEFF] dark:bg-[#00C4B3]/15 border-2 border-[#071E2D] dark:border-[#00C4B3]/60 text-xs font-bold text-[#006D6A] dark:text-[#00C4B3]">
            {completedCount} of {items.length} Completed ({percent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3.5 rounded-full bg-[#F3F6F8] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] overflow-hidden p-0.5 shadow-inner">
        <div
          className="h-full rounded-full bg-[#00C4B3] transition-all duration-300"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${percent} percent complete`}
        />
      </div>

      {/* Checklist Items */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            role="checkbox"
            aria-checked={item.completed}
            tabIndex={0}
            onClick={() => toggleItem(item.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleItem(item.id)
              }
            }}
            className={`
              flex items-center gap-3 p-4 rounded-xl border-2 border-[#071E2D] dark:border-[#1E3A52]
              cursor-pointer select-none transition-all duration-150
              ${item.completed
                ? 'bg-[#ECFEFF]/70 dark:bg-[#091824] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]'
                : 'bg-white dark:bg-[#0E202D] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#071E2D] dark:hover:shadow-[5px_5px_0px_#000000]'
              }
            `.trim()}
          >
            <div
              className={`
                w-6 h-6 rounded-lg border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center
                flex-shrink-0 transition-colors
                ${item.completed ? 'bg-[#00C4B3] text-[#071E2D]' : 'bg-white dark:bg-[#091824]'}
              `.trim()}
            >
              {item.completed && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span
              className={`text-sm font-semibold flex-1 ${
                item.completed ? 'line-through text-[#071E2D]/50 dark:text-slate-500' : 'text-[#071E2D] dark:text-white'
              }`}
            >
              {item.title}
            </span>
          </div>
        ))}
      </div>

      {/* Add New Milestone */}
      <form onSubmit={addItem} className="flex flex-col sm:flex-row gap-3 pt-3 border-t-2 border-[#071E2D]/10 dark:border-white/10">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add sub-task or milestone item..."
          aria-label="New checklist item"
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#091824] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] focus-visible:ring-2 focus-visible:ring-[#00C4B3] text-sm text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 outline-none transition-colors"
        />
        <Button type="submit" variant="secondary" noBubble disabled={!newItemText.trim() || submitting} className="text-xs py-2 px-5">
          {submitting ? 'Saving…' : '+ Add Milestone'}
        </Button>
      </form>
      {submitError && (
        <p role="alert" className="text-xs font-semibold text-red-700 dark:text-red-400">{submitError}</p>
      )}
    </div>
  )
}
