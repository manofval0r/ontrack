import React from 'react'
import type { ChatMessage, Goal } from '../../types'
import { TTSPlayer } from './TTSPlayer'
import { StatusBadge } from '../common/StatusBadge'
import { useGoals } from '../../context/GoalContext'

interface MessageBubbleProps {
  message: ChatMessage
  onActivateGoal?: (proposedGoal: Partial<Goal>) => void
  onSelectAction?: (goalId: string, delta: number) => void
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onActivateGoal, onSelectAction }) => {
  const isUser = message.sender === 'user'
  const { playTTS, stopTTS, isAudioPlaying, currentSpeakingText } = useGoals()
  const isSpeakingThis = isAudioPlaying && currentSpeakingText === message.content
  const [showHistoryDetails, setShowHistoryDetails] = React.useState(false)

  return (
    <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'} max-w-2xl w-full`}>
      {/* Sender Header */}
      <div className="flex items-center gap-2 px-1">
        {!isUser && (
          <div className="w-5 h-5 rounded-md bg-[#00C4B3] border border-[#071E2D] flex items-center justify-center text-[10px] font-bold text-[#071E2D]">
            AI
          </div>
        )}
        <span className="text-[11px] font-bold text-[#071E2D]/60 dark:text-slate-400 uppercase tracking-wider">
          {isUser ? 'You' : 'Nemotron Accountability Partner'}
        </span>
        <span className="text-[10px] font-mono text-[#071E2D]/40 dark:text-slate-500">· {message.timestamp}</span>
      </div>

      {/* Main Bubble Content */}
      <div
        className={`
          p-4 sm:p-5 rounded-2xl border-2
          ${isUser
            ? 'bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] border-[#071E2D] dark:border-[#00C4B3] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]'
            : 'bg-white dark:bg-[#091824] text-[#071E2D] dark:text-white border-[#071E2D] dark:border-[#1E3A52] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]'
          }
        `.trim()}
      >
        <p className="text-sm sm:text-[0.9375rem] font-medium leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Historical Context Grounding Indicator */}
        {!isUser && message.retrieved_context && message.retrieved_context.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[#006D6A] dark:text-[#00C4B3] font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#00C4B3] animate-pulse" />
                <span>Grounded with {message.retrieved_context.length} relevant past log{message.retrieved_context.length === 1 ? '' : 's'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryDetails((prev) => !prev)}
                className="text-[11px] font-bold text-[#006D6A] dark:text-[#00C4B3] hover:underline cursor-pointer"
              >
                {showHistoryDetails ? 'Hide history ▲' : 'View history used ▼'}
              </button>
            </div>
            {showHistoryDetails && (
              <div className="p-2.5 bg-[#F0FDFA] dark:bg-[#07242C] border border-[#00C4B3]/30 rounded-xl text-[11px] text-[#071E2D]/80 dark:text-slate-300 space-y-1">
                {message.retrieved_context.map((ctx, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[#00C4B3] font-bold">•</span>
                    <span>{ctx}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ambiguity choice buttons if user logged ambiguously */}
        {!isUser && message.actionButtons && message.actionButtons.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10 flex flex-wrap gap-2">
            {message.actionButtons.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectAction?.(btn.goalId, btn.delta)}
                className="btn-pill btn-pill-primary text-xs !py-1.5 !px-3 cursor-pointer"
              >
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* TTS Voice Player for AI responses */}
        {!isUser && (
          <div className="mt-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10 flex items-center justify-between gap-3">
            <span className="text-[11px] text-[#071E2D]/50 dark:text-slate-400 font-semibold">Voice Response:</span>
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
        <div className="w-full mt-2 p-5 bg-[#ECFEFF] dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] flex flex-col gap-3.5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C4B3] animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">
                AI Goal Confirmation
              </span>
            </div>
            {message.goal_proposal.goal_type && (
              <StatusBadge trackerType={message.goal_proposal.goal_type} />
            )}
          </div>

          <div>
            <h4
              className="text-lg font-bold text-[#071E2D] dark:text-white"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {message.goal_proposal.title}
            </h4>
            {message.goal_proposal.description && (
              <p className="text-xs text-[#071E2D]/75 dark:text-slate-300 mt-1 leading-relaxed">
                {message.goal_proposal.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-white dark:bg-[#091824] p-3 rounded-xl border border-[#071E2D]/20 dark:border-[#1E3A52]">
            <div>
              <span className="text-[10px] uppercase text-[#071E2D]/50 dark:text-slate-400 font-bold block">Target</span>
              <span className="font-bold text-[#006D6A] dark:text-[#00C4B3]">
                {message.goal_proposal.target} {message.goal_proposal.unit || 'units'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#071E2D]/50 dark:text-slate-400 font-bold block">Deadline</span>
              <span className="font-bold text-[#071E2D] dark:text-white">{message.goal_proposal.deadline}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#071E2D]/50 dark:text-slate-400 font-bold block">Format</span>
              <span className="font-bold text-[#071E2D] dark:text-white capitalize">
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
