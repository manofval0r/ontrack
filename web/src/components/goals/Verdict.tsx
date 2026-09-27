import React from 'react'
import type { Goal } from '../../types'

interface VerdictProps {
  goal: Goal
}

export const Verdict: React.FC<VerdictProps> = ({ goal }) => {
  if (!goal.verdict) return null

  const { score, summary, recommendation, passed, date } = goal.verdict

  return (
    <div
      className={`
        p-6 sm:p-8 rounded-2xl border-2 border-[#071E2D] shadow-[4px_4px_0px_#071E2D]
        flex flex-col gap-4
        ${passed ? 'bg-gradient-to-br from-[#ECFEFF] to-white' : 'bg-gradient-to-br from-[#FFF1F2] to-white'}
      `.trim()}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#071E2D]/10">
        <div className="flex items-center gap-2.5">
          <div
            className={`
              w-10 h-10 rounded-xl border-2 border-[#071E2D] flex items-center justify-center font-bold text-lg
              ${passed ? 'bg-[#00C4B3] text-[#071E2D]' : 'bg-[#F43F5E] text-white'}
            `.trim()}
          >
            {passed ? '✓' : '!'}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60">
              Final AI Verdict
            </span>
            <h3
              className="text-xl sm:text-2xl font-bold text-[#071E2D]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {passed ? 'Target Accomplished' : 'Goal Concluded Below Target'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-[#071E2D]/50">Score</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#071E2D]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {score}%
            </span>
          </div>
          <span
            className={`
              px-3.5 py-1 rounded-full text-xs font-extrabold border-2 border-[#071E2D] shadow-[2px_2px_0px_#071E2D]
              ${passed ? 'bg-[#00C4B3] text-[#071E2D]' : 'bg-red-200 text-red-900'}
            `.trim()}
          >
            {passed ? 'PASSED ✓' : 'INCOMPLETE'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60">Summary</span>
        <p className="text-sm font-semibold text-[#071E2D] leading-relaxed">
          {summary}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-white border-2 border-[#071E2D]/20 shadow-sm flex flex-col gap-1">
        <span className="text-xs font-bold text-[#006D6A] uppercase tracking-wider">
          Nemotron Recommendation
        </span>
        <p className="text-xs sm:text-sm text-[#071E2D]/80 leading-relaxed font-medium">
          {recommendation}
        </p>
      </div>

      <div className="flex justify-between items-center text-[11px] text-[#071E2D]/50 pt-2 border-t border-[#071E2D]/10">
        <span>Evaluated by NVIDIA Nemotron 70B</span>
        <span className="font-mono">Verdict finalized on {date}</span>
      </div>
    </div>
  )
}
