import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import logoImg from '../../assets/ChatGPT Image Sep 27, 2026, 02_35_50 PM.png'

interface DashboardRailProps {
  activeTab: string
  onSelectTab: (tab: string) => void
  onToggleChat: () => void
  onLogout: () => void
}

export const DashboardRail: React.FC<DashboardRailProps> = ({
  activeTab,
  onSelectTab,
  onToggleChat,
  onLogout,
}) => {
  const { theme, setTheme } = useTheme()

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: 'messages',
      label: 'AI Coach',
      isChatTrigger: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'goals',
      label: 'Trackers',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: 'team',
      label: 'Community',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ]

  return (
    <div className="w-16 h-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl py-4 px-2 shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] flex flex-col justify-between items-center select-none transition-colors">
      {/* Top: Mini Brand Mark & Theme Mode Toggle */}
      <div className="flex flex-col items-center gap-3">
        {/* OnTrack Mini Logo Icon */}
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          width={40}
          height={40}
          className="rounded-2xl object-contain"
          title="OnTrack"
        />

        {/* Theme Mode Toggle Pill */}
        <div className="flex flex-col items-center bg-[#F3F6F8] dark:bg-[#091824] p-1 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-[#071E2D] text-[#00C4B3] shadow-sm font-bold'
                : 'text-[#071E2D]/50 dark:text-slate-400 hover:text-[#071E2D]'
            }`}
            title="Light Mode"
            aria-label="Light mode"
            aria-pressed={theme === 'light'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#00C4B3] text-[#071E2D] shadow-sm font-bold'
                : 'text-[#071E2D]/50 dark:text-slate-400 hover:text-[#00C4B3]'
            }`}
            title="Dark Mode"
            aria-label="Dark mode"
            aria-pressed={theme === 'dark'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Center: Main Nav Icons with OnTrack Tactile Design */}
      <div className="flex flex-col items-center gap-2.5 my-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={() => {
                  if (item.isChatTrigger) {
                    onToggleChat()
                  } else {
                    onSelectTab(item.id)
                  }
                }}
                aria-label={item.label}
                className={`
                  w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-150 cursor-pointer
                  ${
                    isActive
                      ? 'bg-[#00C4B3] text-[#071E2D] border-2 border-[#071E2D] dark:border-[#00C4B3] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] scale-105 font-bold'
                      : 'text-[#071E2D]/70 dark:text-slate-300 hover:text-[#071E2D] dark:hover:text-[#00C4B3] hover:bg-[#E6F7F5] dark:hover:bg-white/5'
                  }
                `}
              >
                {item.icon}
              </button>
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#071E2D] dark:bg-[#0E202D] text-white text-[11px] font-bold rounded-lg whitespace-nowrap border border-white/10 shadow-[2px_2px_0px_#000000] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {item.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom: Help & Logout */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t-2 border-[#071E2D]/10 dark:border-white/10 w-full">
        <button
          type="button"
          onClick={onToggleChat}
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-[#071E2D]/70 dark:text-slate-300 hover:text-[#071E2D] dark:hover:text-white hover:bg-[#E6F7F5] dark:hover:bg-[#00C4B3]/15 transition-all cursor-pointer"
          title="Help & Coach"
          aria-label="Help"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-[#071E2D]/70 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
          title="Log out"
          aria-label="Log out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
