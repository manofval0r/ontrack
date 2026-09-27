import React, { useState } from 'react'
import type { UserProfile } from '../../types'
import { Logo } from '../Logo'

interface DashboardTopNavProps {
  activePill: string
  onSelectPill: (pill: string) => void
  user: UserProfile
  onToggleSearch?: () => void
  onToggleChat?: () => void
}

export const DashboardTopNav: React.FC<DashboardTopNavProps> = ({
  activePill,
  onSelectPill,
  user,
  onToggleSearch,
  onToggleChat,
}) => {
  const [hasNotifications] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navPills = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'manage', label: 'Manage' },
    { id: 'program', label: 'Program' },
    { id: 'account', label: 'Account' },
    { id: 'reports', label: 'Reports' },
  ]

  const handlePillSelect = (id: string) => {
    onSelectPill(id)
    setMobileNavOpen(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <header className="flex items-center justify-between w-full py-1 gap-2">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Logo linkTo="/dashboard" />
        </div>

        {/* Center: Pill nav — desktop only */}
        <nav className="hidden md:flex items-center bg-white dark:bg-[#0E202D] p-1 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] transition-colors overflow-x-auto scrollbar-none">
          {navPills.map((pill) => {
            const isActive = activePill === pill.id
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handlePillSelect(pill.id)}
                className={`
                  px-3 lg:px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] shadow-sm'
                      : 'text-[#071E2D]/70 dark:text-slate-300 hover:text-[#071E2D] dark:hover:text-white hover:bg-[#E6F7F5] dark:hover:bg-white/5'
                  }
                `}
              >
                {pill.label}
              </button>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Mobile nav toggle */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden w-9 h-9 rounded-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] transition-all cursor-pointer"
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          {/* Search */}
          <button
            type="button"
            onClick={onToggleSearch}
            className="hidden sm:flex w-9 h-9 rounded-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] items-center justify-center text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Search"
            aria-label="Search"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={onToggleChat}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] relative hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Notifications & AI Coach"
            aria-label="Notifications"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {hasNotifications && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#00C4B3] border border-[#071E2D]" />
            )}
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2 sm:pr-3 py-1 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-full shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#00C4B3] border-2 border-[#071E2D] flex items-center justify-center text-[#071E2D] font-extrabold text-xs flex-shrink-0">
              {user.name ? user.name[0].toUpperCase() : 'I'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#071E2D] dark:text-white leading-tight truncate max-w-[80px]">
                {user.name || 'Israel'}
              </span>
              <span className="text-[10px] text-[#006D6A] dark:text-[#00C4B3] font-semibold leading-none">
                On Track
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile pill nav — dropdown */}
      {mobileNavOpen && (
        <nav className="md:hidden flex flex-wrap gap-2 p-3 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] animate-in slide-in-from-top-2 duration-150">
          {navPills.map((pill) => {
            const isActive = activePill === pill.id
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handlePillSelect(pill.id)}
                className={`
                  px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-2
                  ${
                    isActive
                      ? 'bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] border-[#071E2D] dark:border-[#00C4B3] shadow-[2px_2px_0px_#071E2D]'
                      : 'bg-[#F8FAFB] dark:bg-[#091824] text-[#071E2D] dark:text-slate-200 border-[#071E2D]/20 dark:border-[#1E3A52]'
                  }
                `}
              >
                {pill.label}
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
