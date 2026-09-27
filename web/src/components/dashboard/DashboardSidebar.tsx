import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UserProfile } from '../../types'

export type DashboardNavView = 'dashboard' | 'all' | 'completed' | 'settings'

interface DashboardSidebarProps {
  activeView: DashboardNavView
  onSelectView: (view: DashboardNavView) => void
  user: UserProfile
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeView,
  onSelectView,
  user,
}) => {
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close user menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [userMenuOpen])

  const handleLogout = () => {
    localStorage.removeItem('ontrack_token')
    navigate('/login')
  }

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'all' as const,
      label: 'All goals',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
    {
      id: 'completed' as const,
      label: 'Completed',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white border-2 border-[#071E2D] rounded-3xl shadow-[4px_4px_0px_#071E2D] p-5 justify-between">
      {/* Top: Logo & Navigation */}
      <div className="flex flex-col gap-6">
        {/* Ontrack wordmark: links to /dashboard home, NOT marketing site */}
        <button
          type="button"
          onClick={() => onSelectView('dashboard')}
          className="flex items-center gap-2.5 text-left group cursor-pointer px-1"
          aria-label="Ontrack Dashboard Home"
        >
          <div className="w-8 h-8 rounded-xl bg-[#00C4B3] border-2 border-[#071E2D] flex items-center justify-center font-bold text-sm text-[#071E2D] shadow-[2px_2px_0px_#071E2D] group-hover:-translate-y-0.5 transition-transform">
            ⚡
          </div>
          <span
            className="text-xl font-extrabold text-[#071E2D] tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Ontrack
          </span>
        </button>

        {/* Vertical Nav List */}
        <nav className="flex flex-col gap-1.5" aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 text-left cursor-pointer border-2
                  ${isActive
                    ? 'bg-[#071E2D] text-white border-[#071E2D] shadow-[2px_2px_0px_#00C4B3] translate-x-1'
                    : 'bg-transparent text-[#071E2D] border-transparent hover:bg-[#F3F6F8] hover:border-[#071E2D]/20'
                  }
                `.trim()}
              >
                <span className={isActive ? 'text-[#00C4B3]' : 'text-[#071E2D]/70'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom: User avatar/initial circle with popup logout menu */}
      <div className="relative pt-4 border-t-2 border-[#071E2D]/10" ref={menuRef}>
        <button
          type="button"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-[#F3F6F8] transition-colors border border-transparent hover:border-[#071E2D]/20 text-left cursor-pointer"
          aria-expanded={userMenuOpen}
          aria-label="User account menu"
        >
          <div className="w-9 h-9 rounded-full bg-[#00C4B3] border-2 border-[#071E2D] flex items-center justify-center font-bold text-xs text-[#071E2D] shadow-[2px_2px_0px_#071E2D] flex-shrink-0">
            {(user.name || 'Israel').charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-[#071E2D] truncate">
              {user.name || 'Israel'}
            </span>
            <span className="text-[10px] text-[#071E2D]/55 truncate">
              {user.email || 'israel@example.com'}
            </span>
          </div>
          <span className="text-xs text-[#071E2D]/40">⋮</span>
        </button>

        {/* Small Popup Menu */}
        {userMenuOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-full bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D] p-2 flex flex-col gap-1 z-30 animate-fadeIn">
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(false)
                onSelectView('settings')
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-[#071E2D] hover:bg-[#F3F6F8] rounded-xl cursor-pointer"
            >
              Account Settings
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-3 py-2 text-left text-xs font-bold text-[#B45309] hover:bg-[#FFFBEB] rounded-xl cursor-pointer"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
