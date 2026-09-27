import React from 'react'
import { Check, AlertTriangle } from 'lucide-react'
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
        p-6 sm:p-8 rounded-2xl border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000]
        flex flex-col gap-4 transition-colors
        ${passed ? 'bg-gradient-to-br from-[#ECFEFF] to-white dark:from-[#0E202D] dark:to-[#091824]' : 'bg-gradient-to-br from-[#FFF1F2] to-white dark:from-[#200E13] dark:to-[#0E202D]'}
      `.trim()}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className={`
              w-10 h-10 rounded-xl border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]
              ${passed ? 'bg-[#00C4B3] text-[#071E2D]' : 'bg-[#F43F5E] text-white'}
            `.trim()}
          >
            {passed ? <Check className="w-5 h-5 text-[#071E2D]" /> : <AlertTriangle className="w-5 h-5 text-white" />}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60 dark:text-slate-400">
              Final AI Verdict
            </span>
            <h3
              className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {passed ? 'Target Accomplished' : 'Goal Concluded Below Target'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-[#071E2D]/50 dark:text-slate-400">Score</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] dark:text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {score}%
            </span>
          </div>
          <span
            className={`
              px-3.5 py-1 rounded-full text-xs font-extrabold border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]
              ${passed ? 'bg-[#00C4B3] text-[#071E2D]' : 'bg-red-200 dark:bg-rose-950/50 text-red-900 dark:text-rose-300'}
            `.trim()}
          >
            {passed ? (
              <span className="inline-flex items-center gap-1">
                <span>PASSED</span>
                <Check className="w-3.5 h-3.5" />
              </span>
            ) : (
              'INCOMPLETE'
            )}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60 dark:text-slate-400">Summary</span>
        <p className="text-sm font-semibold text-[#071E2D] dark:text-slate-100 leading-relaxed">
          {summary}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-[#091824] border-2 border-[#071E2D]/20 dark:border-[#1E3A52] shadow-sm flex flex-col gap-1">
        <span className="text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] uppercase tracking-wider">
          Nemotron Recommendation
        </span>
        <p className="text-xs sm:text-sm text-[#071E2D]/80 dark:text-slate-300 leading-relaxed font-medium">
          {recommendation}
        </p>
      </div>

      <div className="flex justify-between items-center text-[11px] text-[#071E2D]/50 dark:text-slate-400 pt-2 border-t border-[#071E2D]/10 dark:border-white/10">
        <span>Evaluated by NVIDIA Nemotron 70B</span>
        <span className="font-mono">Verdict finalized on {date}</span>
      </div>
    </div>
  )
}
