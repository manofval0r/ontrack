import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChatMessage, Goal } from '../../types'
import { MessageBubble } from './MessageBubble'
import { SuggestedAction } from './SuggestedAction'
import { ChatInput } from './ChatInput'
import { Loader } from '../common/Loader'
import { useGoals } from '../../context/GoalContext'

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
      content: `Hi ${user.name}! I am your Nemotron AI Accountability Partner. Speak or type your ambitious goal, and I will parse your target, assign the optimal tracker format (Counter, Checklist, or Reflection), and set up your execution workspace.`,
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

  // Handle incoming user message
  const handleSendMessage = (content: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsThinking(true)

    // Simulate Nemotron AI Goal Parsing response
    setTimeout(() => {
      setIsThinking(false)
      const lower = content.toLowerCase()

      let goalProposal: Partial<Goal>
      let aiText = ''

      if (lower.includes('close') || lower.includes('deal') || lower.includes('car') || lower.includes('sell') || lower.includes('number') || lower.includes('count') || lower.includes('run') || lower.includes('km')) {
        // Counter Goal
        const numbers = content.match(/\d+/)
        const targetNum = numbers ? parseInt(numbers[0]) : 5
        goalProposal = {
          title: content.length > 50 ? `${content.slice(0, 48)}...` : content,
          description: `Conversational goal created via Nemotron AI: ${content}`,
          goal_type: 'counter',
          target: targetNum,
          unit: lower.includes('deal') ? 'deals' : lower.includes('km') ? 'km' : 'units',
          domain: lower.includes('deal') || lower.includes('sell') ? 'sales' : lower.includes('run') || lower.includes('km') ? 'fitness' : 'general',
          deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        }
        aiText = `Understood! I've structured this as a **Counter Tracker** with a target of ${targetNum} ${goalProposal.unit}. I've set a recommended 14-day execution horizon with proactive daily accountability check-ins.`
      } else if (lower.includes('ship') || lower.includes('complete') || lower.includes('steps') || lower.includes('task') || lower.includes('milestone') || lower.includes('build')) {
        // Checklist Goal
        goalProposal = {
          title: content.length > 50 ? `${content.slice(0, 48)}...` : content,
          description: `Structured milestone checklist for: ${content}`,
          goal_type: 'checklist',
          target: 4,
          unit: 'milestones',
          domain: 'engineering',
          deadline: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          items: [
            { id: 'it-1', title: 'Phase 1: Architecture, tokens & setup', completed: true, order: 1 },
            { id: 'it-2', title: 'Phase 2: Core functional components', completed: false, order: 2 },
            { id: 'it-3', title: 'Phase 3: Integration & validation testing', completed: false, order: 3 },
            { id: 'it-4', title: 'Phase 4: Final release & demo review', completed: false, order: 4 },
          ],
        }
        aiText = `Got it! A complex execution goal like this works best as a **Milestone Checklist**. I broke this down into 4 clear phases so you can check off items and track completion velocity.`
      } else {
        // Manual Reflection Goal
        goalProposal = {
          title: content.length > 50 ? `${content.slice(0, 48)}...` : content,
          description: `Daily qualitative reflection habit: ${content}`,
          goal_type: 'manual',
          target: 7,
          unit: 'days',
          domain: 'mindset',
          deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        }
        aiText = `Excellent habit focus! For qualitative growth and consistency, I've created a **Daily Reflection Tracker**. You can log qualitative wins, blockers, and focus levels each day.`
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        content: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        goal_proposal: goalProposal,
      }

      setMessages((prev) => [...prev, aiMsg])
    }, 1200)
  }

  const handleActivateGoal = async (proposed: Partial<Goal>) => {
    try {
      const created = await createGoal(proposed)
      navigate(`/goal/${created.id}`)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[560px] max-w-4xl mx-auto w-full gap-4">
      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D] flex flex-col gap-6">
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
