import React, { useState } from 'react'
import type { UserProfile } from '../../types'

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
    <header className="flex items-center justify-between w-full py-2">
      {/* Left: Brand Logo Mark matching screenshot */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5C35] to-[#FF845E] flex items-center justify-center text-white shadow-sm font-extrabold text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <span className="font-extrabold text-lg tracking-tight text-gray-900 font-sans">
          Ontrack
        </span>
      </div>

      {/* Center: Floating Pill Navigation matching screenshot */}
      <nav className="hidden md:flex items-center bg-[#F3F4F6] p-1 rounded-full border border-gray-200/80 shadow-inner">
        {navPills.map((pill) => {
          const isActive = activePill === pill.id
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onSelectPill(pill.id)}
              className={`
                px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'bg-[#1C1E21] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
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
        {/* Search circle button */}
        <button
          type="button"
          onClick={onToggleSearch}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer"
          title="Search"
          aria-label="Search"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Notification bell circle button */}
        <button
          type="button"
          onClick={onToggleChat}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm relative transition-colors cursor-pointer"
          title="Notifications & AI Coach"
          aria-label="Notifications"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {hasNotifications && (
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-[#FF5C35]" />
          )}
        </button>

        {/* Info circle button */}
        <button
          type="button"
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer"
          title="Information"
          aria-label="Information"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>

        {/* User Profile Pill matching screenshot */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 overflow-hidden flex items-center justify-center text-amber-900 font-bold text-xs shadow-sm">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              (user.name || 'Israel').charAt(0).toUpperCase()
            )}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-gray-900 truncate">
              {user.name || 'Sajibur Rahman'}
            </span>
            <span className="text-[10px] text-gray-400 font-normal truncate max-w-[120px]">
              {user.email || 'israel@ontrack.app'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
