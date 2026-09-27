import React from 'react'

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {/* ── Tile 1 (Top Left): Vibrant Orange Gradient Card matching screenshot ── */}
      <div className="bg-gradient-to-br from-[#FF5C35] to-[#F04B23] text-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(255,92,53,0.15)] flex flex-col justify-between relative overflow-hidden group">
        {/* Subtle background glow circle */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/90">Total Targets</span>
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans block">
            {completedCount}
          </span>
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 mt-1 bg-black/15 px-2 py-0.5 rounded-full">
            <span>↑ 7%</span>
            <span className="text-white/70 font-normal">this month</span>
          </div>
        </div>
      </div>

      {/* ── Tile 2 (Top Right): Clean White Card (Pending Tasks) ── */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Pending Tasks</span>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 font-sans block">
            {pendingCount}
          </span>
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF5C35] mt-1">
            <span>↓ 5%</span>
            <span className="text-gray-400 font-normal">this month</span>
          </div>
        </div>
      </div>

      {/* ── Tile 3 (Bottom Left): Clean White Card (Completed Milestones) ── */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Completed Goals</span>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 font-sans block">
            1,050
          </span>
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <span>↑ 8%</span>
            <span className="text-gray-400 font-normal">this month</span>
          </div>
        </div>
      </div>

      {/* ── Tile 4 (Bottom Right): Clean White Card (Momentum Streak) ── */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Streak Momentum</span>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 font-sans block">
            {streakDays || totalScore}
          </span>
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
            <span>↑ 4%</span>
            <span className="text-gray-400 font-normal">this month</span>
          </div>
        </div>
      </div>
    </div>
  )
}
