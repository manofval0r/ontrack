import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChatMessage, Goal } from '../../types'
import { MessageBubble } from './MessageBubble'
import { SuggestedAction } from './SuggestedAction'
import { ChatInput } from './ChatInput'
import { Loader } from '../common/Loader'
import { useGoals } from '../../context/GoalContext'
import { api } from '../../services/api'

interface ChatWindowProps {
  initialPrompt?: string
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ initialPrompt }) => {
  const { user, createGoal } = useGoals()
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

    // Call POST /api/chat/parse-goal — backend AI returns proposal + response text
    api.parseGoal(content)
      .then(({ ai_response_text, goal_proposal }) => {
        const goalProposal: Partial<Goal> = {
          title: goal_proposal.title || content,
          description: goal_proposal.summary || '',
          goal_type: (goal_proposal.goal_type as Goal['goal_type']) || 'manual',
          target: goal_proposal.target ?? 1,
          unit: '',
          domain: (goal_proposal.domain as Goal['domain']) || 'general',
          deadline: goal_proposal.deadline ?? undefined,
          items: goal_proposal.items?.map((title, idx) => ({
            id: `item-${idx}`,
            title,
            completed: false,
            order: idx + 1,
          })),
        }

        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          content: ai_response_text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          goal_proposal: goalProposal,
        }
        setMessages((prev) => [...prev, aiMsg])
      })
      .catch(() => {
        // Offline fallback: keyword-inferred tracker (same rules as onboarding
        // compiler) so the proposal still matches the goal shape.
        const lower = content.toLowerCase()
        const numMatch = content.match(/\b(\d+)\b/)
        const isChecklist =
          lower.includes('book') || lower.includes('ship') || lower.includes('task') ||
          lower.includes('checklist') || lower.includes('read') || lower.includes('steps')
        const isManual =
          lower.includes('reflect') || lower.includes('journal') ||
          lower.includes('meditat') || lower.includes('habit') || lower.includes('mood')
        const goalType: Goal['goal_type'] = isChecklist ? 'checklist' : isManual ? 'manual' : 'counter'
        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          content: `You're offline, so I built a ${goalType} tracker locally from "${content}". It will sync when you reconnect — tap below to start.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          goal_proposal: {
            title: content,
            goal_type: goalType,
            target: numMatch ? parseInt(numMatch[1], 10) : goalType === 'counter' ? 7 : 1,
            unit: goalType === 'counter' ? 'units' : '',
            domain: 'general',
            deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          },
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
      // POST /api/goals { text } — send the goal title as the text
      const created = await createGoal({ text: proposed.title ?? '' } as any)
      navigate(`/goal/${created.id}`)
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
