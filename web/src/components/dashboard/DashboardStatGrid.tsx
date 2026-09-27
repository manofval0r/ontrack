import React from 'react'
import { Target, Clock, Check, Flame, Zap } from 'lucide-react'

interface DashboardStatGridProps {
  completedCount?: number
  pendingCount?: number
  streakDays?: number
  totalScore?: number
}

export const DashboardStatGrid: React.FC<DashboardStatGridProps> = ({
  completedCount = 950,
  pendingCount = 700,
  streakDays = 14,
  totalScore = 850,
}) => {
  return (
    <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000] flex flex-col justify-between h-full transition-colors">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#071E2D]/10 dark:border-white/10 mb-4">
        <h3
          className="text-base sm:text-lg font-bold text-[#071E2D] dark:text-white tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Performance Metrics
        </h3>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3] bg-[#E6F7F5] dark:bg-[#00C4B3]/15 border border-[#00C4B3]/40 px-2.5 py-0.5 rounded-full">
          Live Snapshot
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1 items-stretch">
        {/* ── Tile 1 (Top Left): Vibrant Turquoise Brand Tile ── */}
        <div className="bg-[#00C4B3] text-[#071E2D] border-2 border-[#071E2D] rounded-2xl p-4 shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/80">Total Targets</span>
            <div className="w-8 h-8 rounded-full bg-[#071E2D] text-[#00C4B3] border border-[#071E2D] flex items-center justify-center text-xs font-bold">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span
              className="text-3xl sm:text-4xl font-extrabold tracking-tight block text-[#071E2D]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {completedCount}
            </span>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#071E2D] mt-1 bg-white/50 border border-[#071E2D]/20 px-2 py-0.5 rounded-full">
              <span>↑ 7%</span>
              <span className="opacity-75 font-normal">this month</span>
            </div>
          </div>
        </div>

        {/* ── Tile 2 (Top Right): Clean Light/Dark Tactile Card (Pending Tasks) ── */}
        <div className="bg-[#F8FAFB] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl p-4 shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between group hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300">Pending Tasks</span>
            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center text-[#071E2D] dark:text-[#00C4B3] text-xs font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#071E2D] dark:text-white block"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {pendingCount}
            </span>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006D6A] dark:text-[#00C4B3] mt-1 bg-[#E6F7F5] dark:bg-[#00C4B3]/15 border border-[#00C4B3]/30 px-2 py-0.5 rounded-full">
              <span>↓ 5%</span>
              <span className="opacity-70 font-normal">backlog reduced</span>
            </div>
          </div>
        </div>

        {/* ── Tile 3 (Bottom Left): Clean Light/Dark Tactile Card (Completed Goals) ── */}
        <div className="bg-[#F8FAFB] dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl p-4 shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between group hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/70 dark:text-slate-300">Completed Goals</span>
            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center text-[#071E2D] dark:text-[#00C4B3] text-xs font-bold">
              <Check className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#071E2D] dark:text-white block"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {totalScore}
            </span>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006D6A] dark:text-[#00C4B3] mt-1 bg-[#E6F7F5] dark:bg-[#00C4B3]/15 border border-[#00C4B3]/30 px-2 py-0.5 rounded-full">
              <span>↑ 8%</span>
              <span className="opacity-70 font-normal">vs target</span>
            </div>
          </div>
        </div>

        {/* ── Tile 4 (Bottom Right): Deep Navy Tactile Card (Momentum Streak) ── */}
        <div className="bg-[#071E2D] dark:bg-[#091824] text-white border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl p-4 shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between group hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00C4B3]">Daily Streak</span>
            <div className="w-8 h-8 rounded-full bg-[#00C4B3] border-2 border-[#071E2D] flex items-center justify-center text-[#071E2D] text-xs font-black">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white block"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {streakDays} Days
            </span>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00C4B3] mt-1 bg-white/10 border border-[#00C4B3]/30 px-2 py-0.5 rounded-full">
              <span className="inline-flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Active</span>
              </span>
              <span className="text-white/70 font-normal">top 5% consistency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
