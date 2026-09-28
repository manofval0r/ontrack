import React, { useState, useEffect, useRef } from 'react'
import { Zap, Sparkles, Target, ArrowRight } from 'lucide-react'
import type { Goal } from '../../types'
import { GoalStatusPill, computeGoalStatus } from '../common/GoalStatusPill'
import { classifyUserMessage } from '../../utils/aiIntent'

interface ActionSnapshot {
  type: 'goal_created' | 'progress_logged' | 'verdict'
  goal: Goal
  note?: string
  delta?: number | string
}

interface ChatMessageItem {
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: string
  actionSnapshot?: ActionSnapshot
  ambiguousGoals?: Goal[]
}

interface DashboardChatPanelProps {
  goals: Goal[]
  onCreateGoal: (goal: Partial<Goal>) => Promise<Goal>
  onLogProgress: (goalId: string, val: number | string, note?: string) => Promise<Goal>
  onUpdateGoal: (id: string, updates: Partial<Goal>) => Promise<Goal>
  shippingRate: number
  streakDays: number
}

const THINKING_PHRASES = [
  'Reading your update…',
  'Figuring out the best way to track it…',
  'Updating your tracker…',
]

export const DashboardChatPanel: React.FC<DashboardChatPanelProps> = ({
  goals,
  onCreateGoal,
  onLogProgress,
  onUpdateGoal,
  shippingRate,
  streakDays,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [inputText, setInputText] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingIndex, setThinkingIndex] = useState(0)
  const [pendingGoalAction, setPendingGoalAction] = useState<{ delta: number; text: string } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  // Rotating thinking text indicator
  useEffect(() => {
    if (!isThinking) return
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % THINKING_PHRASES.length)
    }, 850)
    return () => clearInterval(interval)
  }, [isThinking])

  // Proactive AI check-in on initial load
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const activeGoals = goals.filter((g) => g.status === 'active')
    let proactiveMessage = "I'm your active accountability coach. Tell me your progress, add a goal, or ask how you're tracking this week."

    if (activeGoals.length > 0) {
      const pushupGoal = activeGoals.find((g) => g.title.toLowerCase().includes('pushup'))
      if (pushupGoal) {
        proactiveMessage = "You haven't logged pushups since yesterday — still on for 50 today?"
      } else {
        const firstGoal = activeGoals[0]
        proactiveMessage = `You haven't logged updates for "${firstGoal.title}" since yesterday — still on track for your target?`
      }
    }

    setMessages([
      {
        id: `proactive-${Date.now()}`,
        sender: 'ai',
        content: proactiveMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }, [goals])

  // Handle user sending message
  const handleSend = async (textToSend?: string) => {
    const rawText = (textToSend !== undefined ? textToSend : inputText).trim()
    if (!rawText || isThinking) return

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: rawText,
      timestamp: nowTime,
    }

    setMessages((prev) => [...prev, userMsg])
    if (textToSend === undefined) setInputText('')
    setIsThinking(true)
    setThinkingIndex(0)

    // Process intent
    setTimeout(async () => {
      await processUserIntent(rawText, nowTime)
      setIsThinking(false)
    }, 1200)
  }

  // Ambiguity resolution callback
  const handleSelectAmbiguousGoal = async (goal: Goal) => {
    if (!pendingGoalAction) return
    const { delta, text } = pendingGoalAction
    setPendingGoalAction(null)
    setIsThinking(true)

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const nextVal = (goal.current_value || 0) + delta
    const isNowDone = nextVal >= goal.target

    try {
      const updated = await onLogProgress(goal.id, nextVal, text)
      if (isNowDone) {
        await onUpdateGoal(goal.id, { status: 'completed' })
      }

      const aiMsg: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: `Got it! Logged +${delta} to "${goal.title}". ${
          isNowDone ? 'Target reached — tracker marked as done!' : `Current total: ${nextVal} / ${goal.target}.`
        }`,
        timestamp: nowTime,
        actionSnapshot: {
          type: isNowDone ? 'verdict' : 'progress_logged',
          goal: { ...updated, current_value: nextVal, status: isNowDone ? 'completed' : updated.status },
          delta: `+${delta}`,
        },
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error(err)
    } finally {
      setIsThinking(false)
    }
  }

  // Core NLP intent router
  const processUserIntent = async (text: string, timeStr: string) => {
    const activeGoals = goals.filter((g) => g.status === 'active')
    const intent = classifyUserMessage(text, activeGoals)

    // 1. Status / Summary Query
    if (intent.type === 'status_query') {
      const completedCount = goals.filter((g) => g.status === 'completed').length
      const activeCount = activeGoals.length
      const summaryContent = `Here is your execution breakdown:\n\n• **${activeCount} Active Goals** currently in motion\n• **${completedCount} Completed Goals** shipped\n• **${shippingRate}% Weekly Shipping Rate**\n• **${streakDays}-Day Momentum Streak**\n\nYou're maintaining solid consistency. Keep your daily logs updated to maintain high velocity.`

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          content: summaryContent,
          timestamp: timeStr,
        },
      ])
      return
    }

    // 2. Greetings, Acknowledgments, Help, Coaching Advice, or General Chat
    if (
      intent.type === 'greeting' ||
      intent.type === 'acknowledgment' ||
      intent.type === 'help_query' ||
      intent.type === 'coaching_advice' ||
      intent.type === 'general_chat'
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          content: intent.responseText,
          timestamp: timeStr,
        },
      ])
      return
    }

    // 3. Progress Logging on existing goal
    if (intent.type === 'progress_log') {
      const { delta } = intent
      let targetGoal = intent.matchedGoal

      // Ambiguity check: if no single matched goal, check all active counter goals
      if (!targetGoal) {
        const candidateGoals = activeGoals.filter((g) => g.goal_type === 'counter')
        if (candidateGoals.length > 1) {
          setPendingGoalAction({ delta, text })
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              content: `You logged ${delta}, but you have multiple active goals. Which one would you like to update?`,
              timestamp: timeStr,
              ambiguousGoals: candidateGoals,
            },
          ])
          return
        }
        if (candidateGoals.length === 1) {
          targetGoal = candidateGoals[0]
        }
      }

      if (targetGoal) {
        const nextVal = (targetGoal.current_value || 0) + delta
        const isNowDone = targetGoal.target > 0 && nextVal >= targetGoal.target

        try {
          const updated = await onLogProgress(targetGoal.id, nextVal, text)
          if (isNowDone) {
            await onUpdateGoal(targetGoal.id, { status: 'completed' })
          }

          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              content: `Logged +${delta} to "${targetGoal.title}". ${
                isNowDone
                  ? 'Target reached! Marked tracker as completed.'
                  : `Current total: ${nextVal} / ${targetGoal.target} ${targetGoal.unit || ''}.`
              }`,
              timestamp: timeStr,
              actionSnapshot: {
                type: isNowDone ? 'verdict' : 'progress_logged',
                goal: { ...updated, current_value: nextVal, status: isNowDone ? 'completed' : updated.status },
                delta: `+${delta}`,
              },
            },
          ])
          return
        } catch (e) {
          console.error(e)
        }
      }
    }

    // 4. Goal Creation (Only when explicitly identified as a goal creation prompt!)
    if (intent.type === 'goal_creation') {
      const { cleanTitle, suggestedType } = intent

      try {
        // POST /api/goals { text: cleanTitle } — backend AI parses and returns the goal
        const created = await onCreateGoal({ text: cleanTitle } as any)
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            content: `I built a **${suggestedType === 'counter' ? 'Counter' : suggestedType === 'checklist' ? 'Checklist' : 'Daily Log'}** tracker for "${created.title}". It's now active on your dashboard.`,
            timestamp: timeStr,
            actionSnapshot: {
              type: 'goal_created',
              goal: created,
            },
          },
        ])
        return
      } catch (err) {
        console.error(err)
      }
    }

    // 5. Default Fallback Response
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: `I hear you. To log progress on an existing goal, say something like "did 15 pushups" or "completed phase 1". To set a new target, just say what you want to achieve!`,
        timestamp: timeStr,
      },
    ])
  }

  return (
    <div className="flex flex-col h-full bg-white border-2 border-[#071E2D] rounded-2xl sm:rounded-3xl shadow-[4px_4px_0px_#071E2D] overflow-hidden">
      {/* Header: Ontrack small label / icon, no unnecessary chrome */}
      <div className="px-5 py-4 border-b-2 border-[#071E2D] bg-[#F8FAFB] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#00C4B3] border-2 border-[#071E2D] flex items-center justify-center font-bold text-xs text-[#071E2D]">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span
            className="font-bold text-base text-[#071E2D] tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Ontrack AI
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#006D6A] bg-[#ECFEFF] border border-[#00C4B3] px-2.5 py-0.5 rounded-full">
          Active Partner
        </span>
      </div>

      {/* Screen Reader Live Announcement */}
      <div aria-live="polite" className="sr-only">
        {messages.length > 0 && messages[messages.length - 1].sender === 'ai'
          ? messages[messages.length - 1].content
          : ''}
      </div>

      {/* Scrollable Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user'
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[88%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              {/* Message Bubble */}
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#00C4B3] text-[#071E2D] font-semibold border-2 border-[#071E2D] rounded-tr-sm shadow-[2px_2px_0px_#071E2D]'
                    : 'bg-[#F8FAFB] text-[#071E2D] border-2 border-[#071E2D] rounded-tl-sm shadow-[2px_2px_0px_#071E2D]'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>

                {/* Ambiguity Resolution Chips */}
                {msg.ambiguousGoals && msg.ambiguousGoals.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#071E2D]/10 flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#071E2D]/60">
                      Select Goal:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {msg.ambiguousGoals.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => handleSelectAmbiguousGoal(g)}
                          className="px-3 py-1.5 rounded-xl border-2 border-[#071E2D] bg-white text-xs font-bold text-[#071E2D] shadow-[2px_2px_0px_#071E2D] hover:bg-[#ECFEFF] hover:border-[#006D6A] text-left transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <ArrowRight className="w-3 h-3 text-[#006D6A] shrink-0" />
                          <span>{g.title} ({g.current_value} / {g.target} {g.unit || ''})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline Confirmation Card for created goal or logged progress */}
                {msg.actionSnapshot && (
                  <div className="mt-3 p-3.5 bg-white border-2 border-[#071E2D] rounded-xl shadow-[2px_2px_0px_#071E2D] flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#006D6A]">
                        {msg.actionSnapshot.type === 'goal_created' ? (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>New Tracker Live</span>
                          </>
                        ) : msg.actionSnapshot.type === 'verdict' ? (
                          <>
                            <Target className="w-3 h-3" />
                            <span>Goal Completed</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3" />
                            <span>Progress Logged</span>
                          </>
                        )}
                      </span>
                      <GoalStatusPill status={computeGoalStatus(msg.actionSnapshot.goal)} />
                    </div>

                    <h4
                      className="text-xs font-bold text-[#071E2D] line-clamp-1"
                      style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                    >
                      {msg.actionSnapshot.goal.title}
                    </h4>

                    {/* Compact progress metric */}
                    {msg.actionSnapshot.goal.target > 0 && (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px] font-bold text-[#071E2D]">
                          <span>
                            {msg.actionSnapshot.goal.current_value} / {msg.actionSnapshot.goal.target}{' '}
                            {msg.actionSnapshot.goal.unit || ''}
                          </span>
                          <span className="text-[#006D6A]">
                            {Math.min(
                              100,
                              Math.round(
                                (msg.actionSnapshot.goal.current_value / msg.actionSnapshot.goal.target) * 100
                              )
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#E5E7EB] border border-[#071E2D] overflow-hidden p-0.5">
                          <div
                            className="h-full rounded-full bg-[#00C4B3]"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  (msg.actionSnapshot.goal.current_value / msg.actionSnapshot.goal.target) * 100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-[#071E2D]/40 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          )
        })}

        {/* Typing / Thinking Indicator: Step 3 rotating status text */}
        {isThinking && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border-2 border-[#071E2D] shadow-[2px_2px_0px_#071E2D] mr-auto max-w-[85%] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#00C4B3] animate-ping" />
            <span className="text-xs font-bold text-[#071E2D]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {THINKING_PHRASES[thinkingIndex]}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area fixed at bottom of panel */}
      <div className="p-3 sm:p-4 bg-[#F8FAFB] border-t-2 border-[#071E2D]">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isThinking}
            placeholder="Log progress, add a goal, or ask something"
            className="flex-1 px-4 py-2.5 bg-white border-2 border-[#071E2D] rounded-full text-xs sm:text-sm text-[#071E2D] placeholder:text-[#071E2D]/45 outline-none shadow-[2px_2px_0px_#071E2D] focus:shadow-[3px_3px_0px_#00C4B3] transition-all"
          />

          {/* Send Button: Sieve circular icon-bubble style */}
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            aria-label="Send message to AI"
            className="w-10 h-10 rounded-full border-2 border-[#071E2D] bg-[#00C4B3] flex items-center justify-center text-[#071E2D] shadow-[2px_2px_0px_#071E2D] hover:bg-[#33D6C5] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40 transition-all flex-shrink-0 cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
