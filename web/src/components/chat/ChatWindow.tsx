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

interface ChatWindowProps {
  initialPrompt?: string
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ initialPrompt }) => {
  const { user, createGoal, goals } = useGoals()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      content: `Hi ${user.name || 'there'}! I'm your Nemotron AI Accountability Partner. Speak or type your goal and I'll parse your target, assign the optimal tracker format (Counter, Checklist, or Reflection), and set up your execution workspace.`,
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

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt)
    }
  }, [initialPrompt])

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

    // If it's NOT an explicit goal creation request, respond conversationally without proposing a bogus goal!
    if (intent.type !== 'goal_creation') {
      setTimeout(() => {
        let reply = ''
        if (intent.type === 'status_query') {
          reply = `You currently have ${activeGoals.length} active tracker(s) in motion.${
            activeGoals.length > 0 ? ` Your lead target is "${activeGoals[0].title}".` : ' Ready to set a new goal?'
          }`
        } else if ('responseText' in intent && intent.responseText) {
          reply = intent.responseText
        } else {
          reply = `I hear you. Tell me what target you'd like to achieve (e.g., "Sell 4 books today" or "Run 5km weekly"), or let me know what progress you've made!`
        }

        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, aiMsg])
        setIsThinking(false)
      }, 400)
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
          <MessageBubble key={msg.id} message={msg} onActivateGoal={handleActivateGoal} />
        ))}

        {isThinking && (
          <div className="max-w-md">
            <Loader aiThinking label="Nemotron is analyzing target, timeline, and tracker architecture..." />
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
