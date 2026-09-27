import React, { useEffect } from 'react'
import type { Goal } from '../../types'
import { GoalStatusPill, computeGoalStatus } from '../common/GoalStatusPill'
import { CounterTracker } from '../trackers/CounterTracker'
import { ChecklistTracker } from '../trackers/ChecklistTracker'
import { ManualTracker } from '../trackers/ManualTracker'
import { Button } from '../Button'

interface GoalDetailSlideOverProps {
  goal: Goal | null
  isOpen: boolean
  onClose: () => void
  onUpdateGoal: (id: string, updates: Partial<Goal>) => Promise<any>
  onLogProgress: (goalId: string, value: number | string, note?: string) => Promise<any>
  onMarkDoneEarly: (goalId: string) => Promise<any>
}

export const GoalDetailSlideOver: React.FC<GoalDetailSlideOverProps> = ({
  goal,
  isOpen,
  onClose,
  onUpdateGoal,
  onLogProgress,
  onMarkDoneEarly,
}) => {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !goal) return null

  const status = computeGoalStatus(goal)
  const logs = goal.progress_logs || []

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#071E2D]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-[#F8FAFB] border-l-2 border-[#071E2D] shadow-[-6px_0px_0px_#071E2D] flex flex-col justify-between overflow-y-auto animate-slideInRight">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-5 border-b-2 border-[#071E2D] flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5 pr-2">
              <div className="flex items-center gap-2">
                <GoalStatusPill status={status} />
                <span className="text-[11px] font-semibold text-[#071E2D]/60 uppercase tracking-wider">
                  Target deadline: {goal.deadline}
                </span>
              </div>
              <h2
                className="text-xl sm:text-2xl font-extrabold text-[#071E2D] tracking-tight leading-snug"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {goal.title}
              </h2>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full border-2 border-[#071E2D] bg-white flex items-center justify-center text-[#071E2D] shadow-[2px_2px_0px_#071E2D] hover:bg-[#F3F6F8] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all flex-shrink-0 cursor-pointer"
              aria-label="Close goal detail panel"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 p-6 flex flex-col gap-6">
            {/* Live Interactive Tracker Component */}
            <div className="w-full">
              {goal.goal_type === 'counter' && (
                <CounterTracker
                  goal={goal}
                  onUpdate={async (newVal, note) => {
                    await onLogProgress(goal.id, newVal, note)
                  }}
                />
              )}

              {goal.goal_type === 'checklist' && (
                <ChecklistTracker
                  goal={goal}
                  onUpdateItems={async (newItems) => {
                    const completedCount = newItems.filter((i) => i.completed).length
                    await onUpdateGoal(goal.id, {
                      items: newItems,
                      current_value: completedCount,
                      status: completedCount >= newItems.length ? 'completed' : 'active',
                    })
                  }}
                />
              )}

              {goal.goal_type === 'manual' && (
                <ManualTracker
                  goal={goal}
                  onLogReflection={async (ref, sentiment) => {
                    await onLogProgress(goal.id, sentiment, ref)
                  }}
                />
              )}
            </div>

            {/* Activity Log Section */}
            <div className="flex flex-col gap-3 p-5 bg-white border-2 border-[#071E2D] rounded-2xl shadow-[3px_3px_0px_#071E2D]">
              <div className="flex items-center justify-between pb-2 border-b border-[#071E2D]/10">
                <h3 className="text-sm font-bold text-[#071E2D] uppercase tracking-wider">
                  Activity History
                </h3>
                <span className="text-xs font-semibold text-[#071E2D]/60">
                  {logs.length} logged {logs.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {logs.length === 0 ? (
                <p className="text-xs sm:text-sm text-[#071E2D]/60 py-2">
                  No activity updates recorded yet. Log progress above or tell the AI in the chat panel.
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-[#071E2D]/20 bg-[#F8FAFB] flex flex-col gap-0.5 text-xs"
                    >
                      <div className="flex items-center justify-between text-[#071E2D]/60">
                        <span className="font-semibold text-[#006D6A]">
                          {typeof log.value === 'number' ? `Progress: ${log.value}` : log.value}
                        </span>
                        <span className="font-mono text-[11px]">{log.timestamp}</span>
                      </div>
                      {log.note && (
                        <p className="text-[#071E2D] font-medium mt-0.5 leading-relaxed">
                          {log.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mark as done early button (if still active) */}
            {status !== 'done' && (
              <div className="pt-2 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await onMarkDoneEarly(goal.id)
                    onClose()
                  }}
                  className="text-xs py-2 px-4"
                >
                  Mark as done early
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
