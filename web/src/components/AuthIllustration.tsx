import React from 'react'

interface AuthIllustrationProps {
  headline?: string
  taskTitle?: string
  taskSubtitle?: string
  progressPercent?: number
  badgeLabel?: string
}

export const AuthIllustration: React.FC<AuthIllustrationProps> = ({
  headline = 'Talk to your goal. Watch the tracker build itself.',
  taskTitle = 'Close 5 Deals',
  taskSubtitle = '3 of 5 Shipped',
  progressPercent = 64,
  badgeLabel = 'On track',
}) => {
  // SVG progress ring calculation
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className="w-full h-full min-h-[580px] lg:min-h-[640px] max-w-[600px] bg-[#F8FAFB] dark:bg-[#0E202D] border-2 border-[#071E2D]/10 dark:border-[#1E3A52] rounded-3xl p-8 lg:p-10 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] transition-colors">
      {/* ── Top Floating Avatar 1 (Top Left) ─────────────────────────────── */}
      <div
        className="absolute top-10 left-8 sm:left-12 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-[#ECFEFF] dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]"
        aria-hidden="true"
      >
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="16" fill="#ECFEFF" />
          {/* Hair */}
          <path d="M12 14c0-4 3-7 7-7s7 3 7 7v2H12v-2z" fill="#071E2D" />
          {/* Face */}
          <ellipse cx="18" cy="19" rx="6" ry="7" fill="#FFDFC4" />
          {/* Eyes */}
          <circle cx="15.5" cy="18" r="1" fill="#071E2D" />
          <circle cx="20.5" cy="18" r="1" fill="#071E2D" />
          {/* Smile */}
          <path d="M16 21.5c.8.8 2.2.8 3 0" stroke="#071E2D" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Top Floating Avatar 2 (Right) ─────────────────────────────────── */}
      <div
        className="absolute top-36 right-6 sm:right-10 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-[#F3F6F8] dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]"
        aria-hidden="true"
      >
        <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="16" fill="#F3F6F8" />
          {/* Bob hair */}
          <path d="M11 15c0-4.5 3.2-8 7-8s7 3.5 7 8v5H11v-5z" fill="#071E2D" />
          {/* Face */}
          <ellipse cx="18" cy="19" rx="5.5" ry="6.5" fill="#F8C7A0" />
          <circle cx="16" cy="18" r="1" fill="#071E2D" />
          <circle cx="20" cy="18" r="1" fill="#071E2D" />
          <path d="M16.5 21c.6.6 1.4.6 2 0" stroke="#071E2D" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Center Graphic: unDraw Organizing Work Illustration ──────────── */}
      <div className="relative w-full flex-1 flex items-center justify-center py-4 my-auto">
        {/* unDraw Organizing Work Illustration */}
        <div className="relative z-10 w-full max-w-[440px] flex items-center justify-center px-2">
          <img
            src="/undraw_organizing-work_gmo9.svg"
            alt="Organizing work and goals illustration"
            className="w-full h-auto max-h-[320px] lg:max-h-[360px] object-contain drop-shadow-sm select-none"
          />
        </div>

        {/* ── Floating Goal Task Card (Bottom Left of character) ───────────── */}
        <div className="absolute -bottom-2 -left-2 sm:left-2 z-30 bg-white dark:bg-[#091824] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] p-3.5 sm:p-4 text-left w-52 sm:w-56 transition-transform hover:-translate-y-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="font-sans font-bold text-xs sm:text-sm text-[#071E2D] dark:text-white leading-tight">
                {taskTitle}
              </p>
              <p className="font-sans text-[11px] text-[#071E2D]/60 dark:text-slate-400 mt-0.5">
                {taskSubtitle}
              </p>
            </div>

            {/* Progress percentage ring */}
            <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  className="stroke-[#071E2D]/10 dark:stroke-white/10"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  className="stroke-[#00C4B3] transition-all duration-500 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute font-sans font-bold text-[9px] text-[#071E2D] dark:text-white">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-block px-2 py-0.5 rounded-full border border-[#071E2D]/30 dark:border-[#00C4B3]/40 bg-[#F3F6F8] dark:bg-[#00C4B3]/15 font-sans text-[10px] font-semibold text-[#006D6A] dark:text-[#00C4B3]">
            {badgeLabel}
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Carousel Dots & Value Proposition ─────────────── */}
      <div className="w-full flex flex-col items-center gap-4 mt-6">
        {/* Pagination Dots (matching reference) */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-6 h-2 rounded-full bg-[#071E2D] dark:bg-[#00C4B3]" />
          <span className="w-2 h-2 rounded-full bg-[#071E2D]/25 dark:bg-white/20" />
          <span className="w-2 h-2 rounded-full bg-[#071E2D]/25 dark:bg-white/20" />
        </div>

        {/* Slogan */}
        <h2
          className="font-sans font-bold text-lg sm:text-xl text-[#071E2D] dark:text-white max-w-sm tracking-tight leading-snug"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {headline}
        </h2>
      </div>
    </div>
  )
}
