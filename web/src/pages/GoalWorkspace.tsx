import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { GoalHeader } from '../components/goals/GoalHeader'
import { CounterTracker } from '../components/trackers/CounterTracker'
import { ChecklistTracker } from '../components/trackers/ChecklistTracker'
import { ManualTracker } from '../components/trackers/ManualTracker'
import { ProgressLog } from '../components/goals/ProgressLog'
import { CheckIn } from '../components/goals/CheckIn'
import { Verdict } from '../components/goals/Verdict'
import { Loader } from '../components/common/Loader'
import { ErrorState } from '../components/common/ErrorState'
import { Modal } from '../components/common/Modal'
import { Button } from '../components/Button'
import { useGoals } from '../context/GoalContext'

export const GoalWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    goals,
    selectGoal,
    activeGoal,
    loading,
    error,
    clearError,
    logProgress,
    updateGoal,
    finalizeGoal,
    respondToCheckIn,
  } = useGoals()

  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false)

  const goalId = id || (goals.length > 0 ? goals[0].id : '')

  useEffect(() => {
    if (goalId) {
      selectGoal(goalId)
    }
  }, [goalId])

  if (loading && !activeGoal) {
    return (
      <AppLayout title="Goal Workspace" subtitle="Loading tracker details...">
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader label="Retrieving goal state and progress ledger..." />
        </div>
      </AppLayout>
    )
  }

  if (!activeGoal) {
    return (
      <AppLayout title="Goal Workspace" subtitle="Goal not found">
        <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D] text-center gap-4">
          <h2 className="text-xl font-bold text-[#071E2D]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Goal Not Found
          </h2>
          <p className="text-sm text-[#071E2D]/70 max-w-md">
            The requested goal tracker could not be retrieved or has been archived.
          </p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </AppLayout>
    )
  }

  const handleCounterUpdate = async (newVal: number, note?: string) => {
    await logProgress(activeGoal.id, newVal, note)
  }

  const handleChecklistUpdate = async (items: any[]) => {
    const completedCount = items.filter((i) => i.completed).length
    await updateGoal(activeGoal.id, {
      items,
      current_value: completedCount,
      target: items.length,
    })
    await logProgress(activeGoal.id, `${completedCount}/${items.length} milestones complete`, 'Updated milestone task state')
  }

  const handleReflectionLog = async (reflection: string, sentiment: string) => {
    await logProgress(activeGoal.id, sentiment, reflection)
  }

  const handleCheckInResponse = async (checkInId: string, response: string) => {
    await respondToCheckIn(activeGoal.id, checkInId, response)
  }

  const handleConfirmFinalize = async () => {
    await finalizeGoal(activeGoal.id)
    setConfirmFinalizeOpen(false)
  }

  return (
    <AppLayout
      title="Goal Workspace"
      subtitle="Intelligent execution radar, dynamic tracker, and accountability timeline."
      actions={
        <Link to="/chat" className="btn-pill btn-pill-secondary text-xs !py-1.5 !px-3">
          <span>Chat with Nemotron</span>
          <span className="btn-bubble !w-5 !h-5">💬</span>
        </Link>
      }
    >
      <div className="flex flex-col gap-6 pb-12">
        {/* Error notification */}
        {error && <ErrorState error={error} onRetry={clearError} />}

        {/* Goal Quick Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/50 flex-shrink-0">
            Switch Tracker:
          </span>
          {goals.map((g) => (
            <Link
              key={g.id}
              to={`/goal/${g.id}`}
              className={`
                px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border-2 flex-shrink-0
                ${g.id === activeGoal.id
                  ? 'bg-[#071E2D] text-white border-[#071E2D] shadow-[2px_2px_0px_#00C4B3]'
                  : 'bg-white text-[#071E2D] border-[#071E2D]/20 hover:border-[#071E2D]'
                }
              `}
            >
              {g.title}
            </Link>
          ))}
        </div>

        {/* Goal Header */}
        <GoalHeader goal={activeGoal} onFinalize={() => setConfirmFinalizeOpen(true)} />

        {/* Dynamic Tracker based on AI format */}
        {activeGoal.goal_type === 'counter' && (
          <CounterTracker goal={activeGoal} onUpdate={handleCounterUpdate} />
        )}
        {activeGoal.goal_type === 'checklist' && (
          <ChecklistTracker goal={activeGoal} onUpdateItems={handleChecklistUpdate} />
        )}
        {activeGoal.goal_type === 'manual' && (
          <ManualTracker goal={activeGoal} onLogReflection={handleReflectionLog} />
        )}

        {/* Final Verdict Banner (if finalized) */}
        {activeGoal.verdict && <Verdict goal={activeGoal} />}

        {/* Two-Column Bottom Layout: Check-ins + Progress History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CheckIn
            checkIns={activeGoal.check_ins || []}
            goalId={activeGoal.id}
            onRespond={handleCheckInResponse}
          />
          <ProgressLog logs={activeGoal.progress_logs || []} />
        </div>
      </div>

      {/* Finalize Confirmation Modal */}
      <Modal
        isOpen={confirmFinalizeOpen}
        onClose={() => setConfirmFinalizeOpen(false)}
        title="Finalize Goal & Run AI Verdict?"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#071E2D]/80 leading-relaxed">
            Finalizing will close this goal tracking cycle. Nemotron will analyze your current progress ({activeGoal.current_value}/{activeGoal.target} {activeGoal.unit || ''}), calculate your final completion score, and issue an accountability verdict.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#071E2D]/10">
            <button
              type="button"
              onClick={() => setConfirmFinalizeOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#071E2D]/70 hover:text-[#071E2D]"
            >
              Keep Tracking
            </button>
            <Button variant="primary" onClick={handleConfirmFinalize} noBubble className="text-xs !py-2 !px-4">
              Confirm & Score Verdict
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
