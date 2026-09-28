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
  const [activateError, setActivateError] = useState<string | null>(null)
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
        const computedDeadline = goal_proposal?.deadline || parseRelativeDeadline(content) || undefined
        const goalProposal: Partial<Goal> = {
          title: goal_proposal?.title || intent.cleanTitle || content,
          description: goal_proposal?.summary || '',
          goal_type: (goal_proposal?.goal_type as Goal['goal_type']) || intent.suggestedType || 'manual',
          target: goal_proposal?.target ?? (intent.suggestedType === 'counter' ? 10 : 1),
          unit: goal_proposal?.goal_type === 'counter' ? 'units' : '',
          domain: (goal_proposal?.domain as Goal['domain']) || 'general',
          deadline: computedDeadline,
          items: goal_proposal?.items?.map((title, idx) => ({
            id: `item-${idx}`,
            title,
            completed: false,
            order: idx + 1,
          })),
        }

        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          content: ai_response_text || `I've prepared your tracker for "${goalProposal.title}". Click "Activate Tracker" below to start.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          goal_proposal: goalProposal,
        }
        setMessages((prev) => [...prev, aiMsg])
      })
      .catch(() => {
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
      setActivateError(null)
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
    } catch (e: any) {
      setActivateError(e?.error ?? 'Could not create this tracker. Try again.')
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

        {activateError && (
          <p role="alert" className="text-xs font-semibold text-red-700 dark:text-red-400 px-1">
            {activateError}
          </p>
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
