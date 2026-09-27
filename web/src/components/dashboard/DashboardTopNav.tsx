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

  const navPills = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'manage', label: 'Manage' },
    { id: 'program', label: 'Program' },
    { id: 'account', label: 'Account' },
    { id: 'reports', label: 'Reports' },
  ]

  return (
    <header className="flex items-center justify-between w-full py-1">
      {/* Left: Authentic OnTrack Logo */}
      <div className="flex items-center gap-3">
        <Logo linkTo="/dashboard" />
      </div>

      {/* Center: Tactile Pill Navigation matching OnTrack design system */}
      <nav className="hidden md:flex items-center bg-white dark:bg-[#0B2536] p-1 rounded-full border-2 border-[#071E2D] dark:border-[#00C4B3] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#00C4B3] transition-colors">
        {navPills.map((pill) => {
          const isActive = activePill === pill.id
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onSelectPill(pill.id)}
              className={`
                px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer
                ${
                  isActive
                    ? 'bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] shadow-sm'
                    : 'text-[#071E2D]/70 dark:text-slate-300 hover:text-[#071E2D] dark:hover:text-white hover:bg-[#E6F7F5] dark:hover:bg-[#00C4B3]/15'
                }
              `}
            >
              {pill.label}
            </button>
          )
        })}
      </nav>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search tactile circle button */}
        <button
          type="button"
          onClick={onToggleSearch}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#0B2536] border-2 border-[#071E2D] dark:border-[#00C4B3] flex items-center justify-center text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#00C4B3] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          title="Search"
          aria-label="Search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Notification bell tactile button */}
        <button
          type="button"
          onClick={onToggleChat}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#0B2536] border-2 border-[#071E2D] dark:border-[#00C4B3] flex items-center justify-center text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#00C4B3] relative hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          title="Notifications & AI Coach"
          aria-label="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {hasNotifications && (
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#00C4B3] border border-[#071E2D]" />
          )}
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-white dark:bg-[#0B2536] border-2 border-[#071E2D] dark:border-[#00C4B3] rounded-full shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#00C4B3]">
          <div className="w-7 h-7 rounded-full bg-[#00C4B3] border-2 border-[#071E2D] flex items-center justify-center text-[#071E2D] font-extrabold text-xs">
            {user.name ? user.name[0].toUpperCase() : 'I'}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-[#071E2D] dark:text-white leading-tight">
              {user.name || 'Israel'}
            </span>
            <span className="text-[10px] text-[#006D6A] dark:text-[#00C4B3] font-semibold leading-none">
              On Track
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
