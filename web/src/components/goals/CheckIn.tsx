import React, { useState } from 'react'
import type { CheckIn as CheckInType } from '../../types'
import { Button } from '../Button'
import { useGoals } from '../../context/GoalContext'

interface CheckInProps {
  checkIns: CheckInType[]
  goalId?: string
  onRespond: (checkInId: string, response: string) => Promise<void>
}

export const CheckIn: React.FC<CheckInProps> = ({ checkIns, onRespond }) => {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { playTTS } = useGoals()

  const handleSendResponse = async (checkInId: string) => {
    if (!responseText.trim()) return
    setSubmitting(true)
    try {
      await onRespond(checkInId, responseText)
      setResponseText('')
      setActiveReplyId(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6 sm:p-8 bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D]">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#071E2D]/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00C4B3] border border-[#071E2D] flex items-center justify-center text-xs font-bold text-[#071E2D]">
            AI
          </div>
          <h3
            className="text-lg sm:text-xl font-bold text-[#071E2D]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Nemotron AI Accountability Check-Ins
          </h3>
        </div>
        <span className="text-xs font-bold text-[#006D6A] bg-[#ECFEFF] px-2.5 py-0.5 rounded-full border border-[#006D6A]">
          Active Surveillance
        </span>
      </div>

      {checkIns.length === 0 ? (
        <div className="p-5 rounded-xl bg-[#F8FAFB] border border-[#071E2D]/20 text-center text-sm text-[#071E2D]/70">
          Nemotron is monitoring your pace. The next automated accountability prompt will appear here as your deadline approaches.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {checkIns.map((ci) => (
            <div
              key={ci.id}
              className="p-5 rounded-2xl bg-[#F8FAFB] border-2 border-[#071E2D] shadow-[2px_2px_0px_#071E2D] flex flex-col gap-3"
            >
              {/* AI prompt header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00C4B3] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A]">
                    Proactive Accountability Check
                  </span>
                  <span className="text-xs font-mono text-[#071E2D]/40">· {ci.timestamp}</span>
                </div>

                <button
                  type="button"
                  onClick={() => playTTS(ci.ai_message)}
                  className="p-1.5 rounded-lg border border-[#071E2D]/20 hover:border-[#071E2D] bg-white text-[#071E2D] text-xs flex items-center gap-1 shadow-sm transition-colors"
                  title="Listen with voice TTS"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  <span className="hidden sm:inline font-semibold">Speak</span>
                </button>
              </div>

              {/* AI message */}
              <p className="text-sm font-semibold text-[#071E2D] leading-relaxed">
                "{ci.ai_message}"
              </p>

              {/* User response section */}
              {ci.user_response ? (
                <div className="pl-4 py-2 border-l-2 border-[#00C4B3] flex flex-col gap-1 bg-white/70 rounded-r-xl p-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#071E2D]/60">Your Response:</span>
                  <p className="text-xs sm:text-sm text-[#071E2D] font-medium">{ci.user_response}</p>
                  {ci.verdict_preview && (
                    <span className="text-xs text-[#006D6A] font-semibold mt-1">
                      Nemotron verdict: {ci.verdict_preview}
                    </span>
                  )}
                </div>
              ) : activeReplyId === ci.id ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-[#071E2D]/10">
                  <textarea
                    rows={2}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Describe your progress or current blocker to Nemotron..."
                    className="w-full p-2.5 rounded-xl border-2 border-[#071E2D]/30 focus:border-[#00C4B3] text-xs sm:text-sm text-[#071E2D] outline-none bg-white resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#071E2D]/70 hover:text-[#071E2D]"
                    >
                      Cancel
                    </button>
                    <Button
                      variant="primary"
                      noBubble
                      disabled={!responseText.trim() || submitting}
                      onClick={() => handleSendResponse(ci.id)}
                      className="text-xs !py-1.5 !px-4"
                    >
                      Submit Check-in
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReplyId(ci.id)
                      setResponseText('')
                    }}
                    className="btn-pill btn-pill-secondary text-xs !py-1 !px-3"
                  >
                    <span>Respond to Check-in</span>
                    <span className="btn-bubble !w-5 !h-5">💬</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
