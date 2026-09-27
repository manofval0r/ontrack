import React from 'react'
import type { Goal } from '../../types'

interface DashboardCardsProps {
  goals: Goal[]
  onOpenQuickLog: () => void
  onOpenNewGoal: () => void
  onSelectGoal: (goal: Goal) => void
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  goals,
  onOpenQuickLog,
  onOpenNewGoal,
  onSelectGoal,
}) => {
  const activeGoals = goals.filter((g) => g.status === 'active')

  return (
    <div className="flex flex-col gap-4">
      {/* ── 1. Total Balance / Execution Hero Card ────────────────────────── */}
      <div className="bg-white dark:bg-[#0B2536] border-2 border-[#071E2D] dark:border-[#00C4B3] rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#00C4B3] flex flex-col justify-between transition-colors">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3]">
            Total Execution
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E6F7F5] dark:bg-[#071E2D] border-2 border-[#071E2D] dark:border-[#00C4B3]/40 rounded-full text-xs font-bold text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#00C4B3] cursor-pointer hover:-translate-y-0.5 transition-all">
            <span>🎯 Active</span>
            <span className="text-[10px] text-[#00C4B3]">▾</span>
          </div>
        </div>

        {/* Big Balance Number & Delta */}
        <div className="mt-4">
          <span
            className="text-4xl sm:text-5xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            84.5%
          </span>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] mt-2 ml-3 bg-[#E6F7F5] dark:bg-[#00C4B3]/15 border border-[#00C4B3]/40 px-2.5 py-0.5 rounded-full">
            <span>↑ 5%</span>
            <span className="opacity-70 font-normal">than last month</span>
          </div>
        </div>

        {/* Action Buttons: Tactile Pill Buttons in OnTrack Design */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <button
            type="button"
            onClick={onOpenQuickLog}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#071E2D] dark:bg-[#00C4B3] hover:bg-[#0c2738] dark:hover:bg-[#33D6C5] text-white dark:text-[#071E2D] border-2 border-[#071E2D] dark:border-[#00C4B3] rounded-full text-xs font-bold shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#006D6A] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-white/20 dark:bg-[#071E2D]/20 flex items-center justify-center text-xs">⚡</span>
            <span>Quick Log</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewGoal}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-[#071E2D] hover:bg-[#E6F7F5] dark:hover:bg-[#0B2536] text-[#071E2D] dark:text-white border-2 border-[#071E2D] dark:border-[#00C4B3] rounded-full text-xs font-bold shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#00C4B3] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-[#00C4B3] text-[#071E2D] flex items-center justify-center text-xs font-black">+</span>
            <span>New Goal</span>
          </button>
        </div>

        {/* Active Trackers mini cards section */}
        <div className="pt-3 border-t-2 border-[#071E2D]/10 dark:border-[#00C4B3]/20">
          <div className="flex items-center justify-between text-xs text-[#071E2D]/70 dark:text-slate-300 mb-3">
            <span className="font-bold uppercase tracking-wider text-[#071E2D] dark:text-white">Active Trackers</span>
            <span className="font-semibold text-[#006D6A] dark:text-[#00C4B3]">Total {goals.length || 6} trackers</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Mini Card 1 */}
            <div
              onClick={() => activeGoals[0] && onSelectGoal(activeGoals[0])}
              className="bg-[#F8FAFB] dark:bg-[#071E2D] border-2 border-[#071E2D] dark:border-[#00C4B3]/40 rounded-2xl p-2.5 flex flex-col justify-between shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#00C4B3] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">🎯</span>
                <span className="text-[10px] text-[#071E2D]/40 dark:text-slate-400">⋮</span>
              </div>
              <span className="text-[11px] font-bold text-[#071E2D] dark:text-white mt-2 truncate">
                {activeGoals[0]?.title || 'Deals Target'}
              </span>
              <span className="text-[9px] text-[#071E2D]/60 dark:text-slate-400">
                {activeGoals[0]?.target || 5} {activeGoals[0]?.unit || 'deals'}
              </span>
              <span className="text-[9px] font-bold text-[#006D6A] dark:text-[#00C4B3] mt-1">Active</span>
            </div>

            {/* Mini Card 2 */}
            <div
              onClick={() => activeGoals[1] && onSelectGoal(activeGoals[1])}
              className="bg-[#F8FAFB] dark:bg-[#071E2D] border-2 border-[#071E2D] dark:border-[#00C4B3]/40 rounded-2xl p-2.5 flex flex-col justify-between shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#00C4B3] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">📚</span>
                <span className="text-[10px] text-[#071E2D]/40 dark:text-slate-400">⋮</span>
              </div>
              <span className="text-[11px] font-bold text-[#071E2D] dark:text-white mt-2 truncate">
                {activeGoals[1]?.title || 'Book Reading'}
              </span>
              <span className="text-[9px] text-[#071E2D]/60 dark:text-slate-400">
                {activeGoals[1]?.target || 2} {activeGoals[1]?.unit || 'milestones'}
              </span>
              <span className="text-[9px] font-bold text-[#006D6A] dark:text-[#00C4B3] mt-1">Active</span>
            </div>

            {/* Mini Card 3 */}
            <div
              onClick={() => activeGoals[2] && onSelectGoal(activeGoals[2])}
              className="bg-[#F8FAFB] dark:bg-[#071E2D] border-2 border-[#071E2D] dark:border-[#00C4B3]/40 rounded-2xl p-2.5 flex flex-col justify-between shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#00C4B3] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">💪</span>
                <span className="text-[10px] text-[#071E2D]/40 dark:text-slate-400">⋮</span>
              </div>
              <span className="text-[11px] font-bold text-[#071E2D] dark:text-white mt-2 truncate">
                {activeGoals[2]?.title || 'Pushup Streak'}
              </span>
              <span className="text-[9px] text-[#071E2D]/60 dark:text-slate-400">
                {activeGoals[2]?.target || 50} {activeGoals[2]?.unit || 'reps'}
              </span>
              <span className="text-[9px] font-bold text-[#006D6A] dark:text-[#00C4B3] mt-1">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Quick Setup Banner ────────────────────────────────────────── */}
      <div className="bg-[#071E2D] text-white border-2 border-[#071E2D] dark:border-[#00C4B3] rounded-3xl p-5 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#00C4B3] flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#00C4B3] block">
            Autonomous Tracking
          </span>
          <h4
            className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Voice & Chat Logging
          </h4>
          <p className="text-xs text-white/70 mt-1 max-w-xs">
            Say what you did — our assistant updates your metrics immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenQuickLog}
          className="px-4 py-2 bg-[#00C4B3] hover:bg-[#33D6C5] text-[#071E2D] font-bold text-xs rounded-full border-2 border-[#071E2D] shadow-[2px_2px_0px_#071E2D] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all shrink-0 cursor-pointer"
        >
          Open Chat →
        </button>
      </div>
    </div>
  )
}
