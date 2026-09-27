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
  const completedGoals = goals.filter((g) => g.status === 'completed')

  return (
    <div className="flex flex-col gap-4">
      {/* ── 1. Total Balance / Execution Hero Card ────────────────────────── */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Total Execution</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-200/70 transition-colors">
            <span>🎯 Active</span>
            <span className="text-[10px] text-gray-400">▾</span>
          </div>
        </div>

        {/* Big Balance Number & Delta */}
        <div className="mt-3">
          <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
            84.5%
          </span>
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1.5 ml-2 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span>↑ 5%</span>
            <span className="text-gray-400 font-normal">than last month</span>
          </div>
        </div>

        {/* Action Buttons: Transfer / Request matching screenshot */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <button
            type="button"
            onClick={onOpenQuickLog}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1C1E21] hover:bg-black text-white rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
            </svg>
            <span>Quick Log</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewGoal}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Goal</span>
          </button>
        </div>

        {/* Wallets / Active Trackers mini cards section */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="font-semibold text-gray-800">Trackers</span>
            <span className="text-gray-400">Total {goals.length || 6} trackers</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Mini Card 1 */}
            <div
              onClick={() => activeGoals[0] && onSelectGoal(activeGoals[0])}
              className="bg-gray-50/70 border border-gray-100 rounded-2xl p-2.5 flex flex-col justify-between hover:bg-gray-100/80 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">🎯</span>
                <span className="text-[10px] text-gray-400">⋮</span>
              </div>
              <span className="text-[11px] font-bold text-gray-900 mt-2 truncate">
                {activeGoals[0]?.title || 'Deals Target'}
              </span>
              <span className="text-[9px] text-gray-400">
                {activeGoals[0]?.target || 5} {activeGoals[0]?.unit || 'deals'}
              </span>
              <span className="text-[9px] font-semibold text-emerald-600 mt-1">Active</span>
            </div>

            {/* Mini Card 2 */}
            <div
              onClick={() => activeGoals[1] && onSelectGoal(activeGoals[1])}
              className="bg-gray-50/70 border border-gray-100 rounded-2xl p-2.5 flex flex-col justify-between hover:bg-gray-100/80 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">⚡</span>
                <span className="text-[10px] text-gray-400">⋮</span>
              </div>
              <span className="text-[11px] font-bold text-gray-900 mt-2 truncate">
                {activeGoals[1]?.title || 'Sprint MVP'}
              </span>
              <span className="text-[9px] text-gray-400">
                {activeGoals[1]?.target || 4} tasks
              </span>
              <span className="text-[9px] font-semibold text-emerald-600 mt-1">Active</span>
            </div>

            {/* Mini Card 3 */}
            <div
              onClick={() => activeGoals[2] && onSelectGoal(activeGoals[2])}
              className="bg-gray-50/70 border border-gray-100 rounded-2xl p-2.5 flex flex-col justify-between hover:bg-gray-100/80 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs">📚</span>
                <span className="text-[10px] text-gray-400">⋮</span>
              </div>
              <span className="text-[11px] font-bold text-gray-900 mt-2 truncate">
                {activeGoals[2]?.title || 'Daily Habit'}
              </span>
              <span className="text-[9px] text-gray-400">
                {activeGoals[2]?.target || 7} days
              </span>
              <span className="text-[9px] font-semibold text-amber-600 mt-1">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Monthly Spending / Goal Execution Limit Bar ────────────────── */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-3">
        <h4 className="text-xs font-bold text-gray-800 tracking-tight">
          Monthly Execution Target
        </h4>

        {/* Progress Bar with vibrant orange segment + striped pattern track */}
        <div className="w-full h-3 rounded-full bg-gray-100 border border-gray-200/60 overflow-hidden flex items-center p-0.5">
          <div
            className="h-full rounded-full bg-[#FF5C35] transition-all duration-300"
            style={{ width: '42%' }}
          />
          <div
            className="h-full flex-1 opacity-25"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #FF5C35, #FF5C35 2px, transparent 2px, transparent 6px)',
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span className="font-semibold text-gray-900">
            {completedGoals.length || 18} goals completed
          </span>
          <span>out of 24 target</span>
        </div>
      </div>

      {/* ── 3. My Trackers / Physical Cards ───────────────────────────────── */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">💳</span>
            <h4 className="text-xs font-bold text-gray-800 tracking-tight">My Trackers</h4>
          </div>
          <button
            type="button"
            onClick={onOpenNewGoal}
            className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            + Add new
          </button>
        </div>

        {/* 2 Physical Tracker Cards side by side matching screenshot */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Card 1: Sleek Dark Card */}
          <div className="bg-[#1C1E22] text-white rounded-2xl p-3.5 flex flex-col justify-between h-28 relative overflow-hidden shadow-sm group hover:scale-[1.02] transition-transform cursor-pointer">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Active</span>
              </div>

              {/* Master/Tracker Double Circle Motif */}
              <div className="flex items-center -space-x-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FF5C35]" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 opacity-90" />
              </div>
            </div>

            {/* Card Number & Expiry */}
            <div>
              <span className="text-[10px] text-white/50 block font-mono">Tracker ID</span>
              <span className="text-xs font-mono font-bold tracking-wider">•••• 6782</span>
              <div className="flex justify-between items-center text-[9px] text-white/50 mt-1 font-mono">
                <span>EXP 08/29</span>
                <span>GOAL 50</span>
              </div>
            </div>
          </div>

          {/* Card 2: Vibrant Orange Gradient Card */}
          <div className="bg-gradient-to-tr from-[#FF5C35] to-[#FF7B54] text-white rounded-2xl p-3.5 flex flex-col justify-between h-28 relative overflow-hidden shadow-sm group hover:scale-[1.02] transition-transform cursor-pointer">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                </svg>
                <span className="text-[9px] bg-black/20 px-2 py-0.5 rounded-full font-bold">Active</span>
              </div>
              <span className="text-xs">✦</span>
            </div>

            {/* Card Number & Expiry */}
            <div>
              <span className="text-[10px] text-white/70 block font-mono">Tracker ID</span>
              <span className="text-xs font-mono font-bold tracking-wider">•••• 4356</span>
              <div className="flex justify-between items-center text-[9px] text-white/70 mt-1 font-mono">
                <span>EXP 09/28</span>
                <span>GOAL 5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
