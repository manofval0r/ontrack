import React from 'react'
import type { ChatMessage, Goal } from '../../types'
import { TTSPlayer } from './TTSPlayer'
import { StatusBadge } from '../common/StatusBadge'
import { useGoals } from '../../context/GoalContext'

interface MessageBubbleProps {
  message: ChatMessage
  onActivateGoal?: (proposedGoal: Partial<Goal>) => void
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onActivateGoal }) => {
  const isUser = message.sender === 'user'
  const { playTTS, stopTTS, isAudioPlaying, currentSpeakingText } = useGoals()
  const isSpeakingThis = isAudioPlaying && currentSpeakingText === message.content

  return (
    <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'} max-w-2xl w-full`}>
      {/* Sender Header */}
      <div className="flex items-center gap-2 px-1">
        {!isUser && (
          <div className="w-5 h-5 rounded-md bg-[#00C4B3] border border-[#071E2D] flex items-center justify-center text-[10px] font-bold text-[#071E2D]">
            AI
          </div>
        )}
        <span className="text-[11px] font-bold text-[#071E2D]/60 uppercase tracking-wider">
          {isUser ? 'You' : 'Nemotron Accountability Partner'}
        </span>
        <span className="text-[10px] font-mono text-[#071E2D]/40">· {message.timestamp}</span>
      </div>

      {/* Main Bubble Content */}
      <div
        className={`
          p-4 sm:p-5 rounded-2xl border-2 border-[#071E2D]
          ${isUser
            ? 'bg-[#071E2D] text-white shadow-[3px_3px_0px_#00C4B3]'
            : 'bg-white text-[#071E2D] shadow-[3px_3px_0px_#071E2D]'
          }
        `.trim()}
      >
        <p className="text-sm sm:text-[0.9375rem] font-medium leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* TTS Voice Player for AI responses */}
        {!isUser && (
          <div className="mt-3 pt-3 border-t border-[#071E2D]/10 flex items-center justify-between gap-3">
            <span className="text-[11px] text-[#071E2D]/50 font-semibold">Voice Response:</span>
            <TTSPlayer
              isPlaying={isSpeakingThis}
              onToggle={() => {
                if (isSpeakingThis) {
                  stopTTS()
                } else {
                  playTTS(message.content)
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Embedded Goal Proposal Card if AI parsed a goal */}
      {message.goal_proposal && (
        <div className="w-full mt-2 p-5 bg-[#ECFEFF] border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D] flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C4B3] animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A]">
                AI Goal Confirmation
              </span>
            </div>
            {message.goal_proposal.goal_type && (
              <StatusBadge trackerType={message.goal_proposal.goal_type} />
            )}
          </div>

          <div>
            <h4
              className="text-lg font-bold text-[#071E2D]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {message.goal_proposal.title}
            </h4>
            {message.goal_proposal.description && (
              <p className="text-xs text-[#071E2D]/75 mt-1 leading-relaxed">
                {message.goal_proposal.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-white p-3 rounded-xl border border-[#071E2D]/20">
            <div>
              <span className="text-[10px] uppercase text-[#071E2D]/50 font-bold block">Target</span>
              <span className="font-bold text-[#006D6A]">
                {message.goal_proposal.target} {message.goal_proposal.unit || 'units'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#071E2D]/50 font-bold block">Deadline</span>
              <span className="font-bold text-[#071E2D]">{message.goal_proposal.deadline}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#071E2D]/50 font-bold block">Format</span>
              <span className="font-bold text-[#071E2D] capitalize">
                {message.goal_proposal.goal_type}
              </span>
            </div>
          </div>

          {onActivateGoal && (
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => onActivateGoal(message.goal_proposal!)}
                className="btn-pill btn-pill-primary text-xs !py-1.5 !px-4"
              >
                <span>Activate Tracker & Launch Workspace</span>
                <span className="btn-bubble !w-5 !h-5">→</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
