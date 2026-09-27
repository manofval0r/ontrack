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

  const completedCount = items.filter((i) => i.completed).length
  const totalCount = items.length || 1
  const percent = Math.round((completedCount / totalCount) * 100)

  const toggleItem = async (itemId: string) => {
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    setItems(updated)
    setSubmitting(true)
    try {
      await onUpdateItems(updated)
    } finally {
      setSubmitting(false)
    }
  }

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemText.trim()) return
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
    try {
      await onUpdateItems(updated)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#071E2D]/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">AI-Determined Format</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#071E2D]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Milestone Checklist
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#F0FDF4] border-2 border-[#071E2D] text-xs font-bold text-[#166534]">
            {completedCount} of {items.length} Completed ({percent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3.5 rounded-full bg-[#E5E7EB] border-2 border-[#071E2D] overflow-hidden p-0.5 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#006D6A] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => !submitting && toggleItem(item.id)}
            className={`
              flex items-center gap-3.5 p-4 rounded-xl border-2 border-[#071E2D]
              cursor-pointer select-none transition-all duration-150
              ${item.completed
                ? 'bg-[#F0FDF4]/70 shadow-[2px_2px_0px_#071E2D] opacity-90'
                : 'bg-white shadow-[3px_3px_0px_#071E2D] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#071E2D]'
              }
            `.trim()}
          >
            <div
              className={`
                w-6 h-6 rounded-lg border-2 border-[#071E2D] flex items-center justify-center
                flex-shrink-0 transition-colors
                ${item.completed ? 'bg-[#00C4B3] text-[#071E2D]' : 'bg-white'}
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
                item.completed ? 'line-through text-[#071E2D]/50' : 'text-[#071E2D]'
              }`}
            >
              {item.title}
            </span>
          </div>
        ))}
      </div>

      {/* Add New Milestone */}
      <form onSubmit={addItem} className="flex flex-col sm:flex-row gap-3 pt-3 border-t-2 border-[#071E2D]/10">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add sub-task or milestone item..."
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#071E2D]/20 focus:border-[#00C4B3] text-sm text-[#071E2D] placeholder:text-[#071E2D]/40 outline-none transition-colors"
        />
        <Button type="submit" variant="secondary" noBubble disabled={!newItemText.trim() || submitting} className="text-xs py-2 px-5">
          + Add Milestone
        </Button>
      </form>
    </div>
  )
}
