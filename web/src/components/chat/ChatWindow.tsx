import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChatMessage, Goal } from '../../types'
import { MessageBubble } from './MessageBubble'
import { SuggestedAction } from './SuggestedAction'
import { ChatInput } from './ChatInput'
import { Loader } from '../common/Loader'
import { useGoals } from '../../context/GoalContext'
import { api } from '../../services/api'
import { classifyUserMessage, parseRelativeDeadline, extractGoalProposal } from '../../utils/aiIntent'
import { answerIntegrationQuery } from '../../services/integrationsAssistant'

interface ChatWindowProps {
  initialPrompt?: string
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ initialPrompt }) => {
  const { user, createGoal, goals, logProgress } = useGoals()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      content: `Hi ${user.name || 'there'}! I'm your OnTrack AI Assistant. You can ask me questions, inquire about your integrations (GitHub, Calendar), or tell me a goal to create a tracker (Counter, Checklist, or Reflection).`,
      timestamp: 'Just now',
    },
  ])
  const [isThinking, setIsThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  const handleSelectAction = async (goalId: string, delta: number) => {
    const targetGoal = goals.find((g) => g.id === goalId)
    if (!targetGoal) return

    try {
      setIsThinking(true)
      const updated = await logProgress(goalId, delta, 'Logged via AI Chat selection')
      const confirmMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        content: `Logged +${delta} ${targetGoal.unit || ''} for "${targetGoal.title}". Current progress: ${updated.current_value}/${updated.target}. Outstanding work!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, confirmMsg])
    } catch (err) {
      console.warn('[ChatWindow] Error logging selected progress:', err)
      const errorMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        content: `Could not update progress for "${targetGoal.title}". Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsThinking(false)
    }
  }

  const handleSendMessage = (content: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsThinking(true)

    const activeGoals = goals.filter((g) => g.status === 'active')
    const intent = classifyUserMessage(content, activeGoals)

    // Handle progress logging on existing goals
    if (intent.type === 'progress_log') {
      const candidateCounters = activeGoals.filter((g) => g.goal_type === 'counter')

      // Case 1: Specific goal uniquely matched by title/keyword
      if (intent.matchedGoal) {
        const target = intent.matchedGoal
        logProgress(target.id, intent.delta, content)
          .then((updated) => {
            const aiMsg: ChatMessage = {
              id: `msg-ai-${Date.now()}`,
              sender: 'ai',
              content: `Great job! Logged +${intent.delta} ${target.unit || ''} for "${target.title}". Current progress: ${updated.current_value}/${target.target}. Keep this streak going!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
            setMessages((prev) => [...prev, aiMsg])
            // Also notify coach backend with personalized context
            api.sendChatMessage(content, target.id).catch(() => {})
          })
          .catch(() => {
            const aiMsg: ChatMessage = {
              id: `msg-ai-${Date.now()}`,
              sender: 'ai',
              content: `Recorded +${intent.delta} for "${target.title}" locally. Keep pushing!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
            setMessages((prev) => [...prev, aiMsg])
          })
          .finally(() => {
            setIsThinking(false)
          })
        return
      }

      // Case 2: Ambiguous logging with 2+ active counter goals — prompt user with buttons, NEVER guess silently!
      if (candidateCounters.length > 1) {
        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          content: `You have ${candidateCounters.length} active counters. Which goal did you complete ${intent.delta} for?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButtons: candidateCounters.map((cg) => ({
            label: `+${intent.delta} to ${cg.title}`,
            goalId: cg.id,
            delta: intent.delta,
          })),
        }
        setMessages((prev) => [...prev, aiMsg])
        setIsThinking(false)
        return
      }

      // Case 3: Only 1 active counter goal exists — safely attribute to it
      if (candidateCounters.length === 1) {
        const target = candidateCounters[0]
        logProgress(target.id, intent.delta, content)
          .then((updated) => {
            const aiMsg: ChatMessage = {
              id: `msg-ai-${Date.now()}`,
              sender: 'ai',
              content: `Logged +${intent.delta} ${target.unit || ''} for "${target.title}". Progress: ${updated.current_value}/${target.target}. Awesome effort!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
            setMessages((prev) => [...prev, aiMsg])
          })
          .catch(() => {
            const aiMsg: ChatMessage = {
              id: `msg-ai-${Date.now()}`,
              sender: 'ai',
              content: `Recorded +${intent.delta} for "${target.title}".`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
            setMessages((prev) => [...prev, aiMsg])
          })
          .finally(() => {
            setIsThinking(false)
          })
        return
      }

      // Case 4: No active counter goals
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        content: `I heard you completed ${intent.delta}, but you don't have an active counter tracker set up. Would you like to create one (e.g. "Do 50 pushups daily")?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsThinking(false)
      return
    }

    // Handle integration queries directly using live integration data (GitHub, Calendar)
    if (intent.type === 'integration_query') {
      answerIntegrationQuery(content)
        .then((reply) => {
          const aiMsg: ChatMessage = {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            content: reply || "I'm checking your connected integrations. You can connect and configure them under Settings → Integrations.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
          setMessages((prev) => [...prev, aiMsg])
        })
        .catch((err) => {
          console.warn('[ChatWindow] Integration query failed:', err)
          const aiMsg: ChatMessage = {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            content: "I couldn't retrieve your integration details right now. You can check your connected tools in Settings → Integrations.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
          setMessages((prev) => [...prev, aiMsg])
        })
        .finally(() => {
          setIsThinking(false)
        })
      return
    }

    // If it's NOT an explicit goal creation request, engage the AI Assistant for chat/questions!
    if (intent.type !== 'goal_creation') {
      const targetGoal = 'matchedGoal' in intent && (intent as any).matchedGoal ? (intent as any).matchedGoal : activeGoals[0]
      const goalId = targetGoal?.id

      api.sendChatMessage(content, goalId)
        .then((res) => {
          const reply = res.reply || res.message || res.ai_response_text || 'I am tracking your progress.'
          const aiMsg: ChatMessage = {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            retrieved_context: res.retrieved_context || [],
            rag_active: Boolean(res.rag_active || (res.retrieved_context && res.retrieved_context.length > 0)),
          }
          setMessages((prev) => [...prev, aiMsg])
        })
        .catch((err) => {
          console.warn('[ChatWindow] Chat endpoint fallback:', err)
          let reply: string
          if (intent.type === 'status_query') {
            reply = `You currently have ${activeGoals.length} active tracker(s) in motion.${
              activeGoals.length > 0 ? ` Your lead target is "${activeGoals[0].title}".` : ' Ready to set a new tracker?'
            }`
          } else if ('responseText' in intent && intent.responseText) {
            reply = intent.responseText
          } else {
            reply = `I'm here to help. You can ask me questions, check your integrations, or say what you'd like to achieve (e.g. "Sell 4 books today" or "Run 5km weekly") to launch a tracker!`
          }

          const aiMsg: ChatMessage = {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
          setMessages((prev) => [...prev, aiMsg])
        })
        .finally(() => {
          setIsThinking(false)
        })
      return
    }

    // Call POST /api/chat/parse-goal — backend AI returns proposal + response text
    api.parseGoal(content)
      .then(({ ai_response_text, goal_proposal }) => {
        const localProposal = extractGoalProposal(content)
        const computedDeadline = goal_proposal?.deadline || parseRelativeDeadline(content) || localProposal.deadline || undefined

        // Determine goal type: prefer local detection if backend fell back to manual on a clear counter/checklist prompt
        let resolvedGoalType: Goal['goal_type'] = (goal_proposal?.goal_type as Goal['goal_type']) || localProposal.goal_type || 'counter'
        if (goal_proposal?.goal_type === 'manual' && localProposal.goal_type && localProposal.goal_type !== 'manual') {
          resolvedGoalType = localProposal.goal_type
        }

        // Determine target and unit
        const resolvedTarget = (goal_proposal?.target !== null && goal_proposal?.target !== undefined)
          ? goal_proposal.target
          : (localProposal.target ?? 10)
        const resolvedUnit = (goal_proposal as unknown as { unit?: string })?.unit || localProposal.unit || (resolvedGoalType === 'counter' ? 'units' : '')

        const goalProposal: Partial<Goal> = {
          title: goal_proposal?.title || intent.cleanTitle || localProposal.title || content,
          description: goal_proposal?.summary || '',
          goal_type: resolvedGoalType,
          target: resolvedTarget,
          unit: resolvedUnit,
          domain: (goal_proposal?.domain as Goal['domain']) || localProposal.domain || 'general',
          deadline: computedDeadline,
          items: goal_proposal?.items?.map((title, idx) => ({
            id: `item-${idx}`,
            title,
            completed: false,
            order: idx + 1,
          })) || (resolvedGoalType === 'checklist' ? localProposal.items : undefined),
        }

        // Clean up response text if backend used a fallback message that misstated the format
        let responseContent = ai_response_text
        if (!responseContent || responseContent.includes('manual goal') && resolvedGoalType !== 'manual') {
          responseContent = `I've prepared your tracker for "${goalProposal.title}". Click "Activate Tracker" below to start.`
        }

        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          content: responseContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          goal_proposal: goalProposal,
        }
        setMessages((prev) => [...prev, aiMsg])
      })
      .catch(() => {
        // Resilient fallback when backend is unreachable or session expired
        const localProposal = extractGoalProposal(content)
        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          content: `I've analyzed your goal and configured your tracker for "${localProposal.title}". Click "Activate Tracker" below to launch your workspace.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          goal_proposal: localProposal,
        }
        setMessages((prev) => [...prev, aiMsg])
      })
      .finally(() => {
        setIsThinking(false)
      })
  }

  // Fires when an initial prompt arrives (e.g. deep-linked from onboarding).
  // Declared after handleSendMessage on purpose: effects run post-render,
  // so the handler is always assigned before this can fire.
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt])

  const handleActivateGoal = async (proposed: Partial<Goal>) => {
    try {
      // Pass full proposed goal configuration to ensure target, deadline, and unit are preserved
      const created = await createGoal({
        title: proposed.title,
        text: proposed.title ?? 'Untitled Goal',
        target: proposed.target,
        unit: proposed.unit,
        goal_type: proposed.goal_type,
        domain: proposed.domain,
        deadline: proposed.deadline,
        items: proposed.items,
        description: proposed.description,
      })
      navigate(`/dashboard/goal/${created.id}`)
    } catch (e) {
      console.error('[ChatWindow] Activation error:', e)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[560px] max-w-4xl mx-auto w-full gap-4">
      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] flex flex-col gap-6 transition-colors">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onActivateGoal={handleActivateGoal}
            onSelectAction={handleSelectAction}
          />
        ))}

        {isThinking && (
          <div className="max-w-md">
            <Loader aiThinking label="AI Assistant is thinking & retrieving context..." />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts if only 1 or 2 messages */}
      {messages.length <= 2 && (
        <div className="px-1">
          <SuggestedAction onSelect={handleSendMessage} />
        </div>
      )}

      {/* Input row */}
      <div className="flex-shrink-0">
        <ChatInput onSendMessage={handleSendMessage} disabled={isThinking} />
      </div>
    </div>
  )
}
