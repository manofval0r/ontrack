import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Zap, Flame, Sparkles, X, ChevronRight, LayoutDashboard, Target, Calendar, MessageSquare, Settings } from 'lucide-react'
import type { UserProfile, Goal } from '../../types'
import { Logo } from '../Logo'
import { firstName } from '../../utils/auth'

interface DashboardTopNavProps {
  activePill: string
  onSelectPill: (pill: string) => void
  user: UserProfile
  goals?: Goal[]
  streakDays?: number
  onToggleChat?: () => void
}

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  type: 'goal' | 'streak' | 'system'
  read: boolean
  link?: string
}

export const DashboardTopNav: React.FC<DashboardTopNavProps> = ({
  activePill,
  onSelectPill,
  user,
  goals = [],
  streakDays = 0,
  onToggleChat,
}) => {
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const navPills = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'manage', label: 'Manage' },
    { id: 'program', label: 'Program' },
    { id: 'account', label: 'Account' },
    { id: 'reports', label: 'Reports' },
  ]

  // Dynamic real notifications based on user goals and streaks
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const list: NotificationItem[] = []
    if (streakDays > 0) {
      list.push({
        id: 'notif-streak',
        title: 'Daily Streak Milestone',
        message: `You're on a ${streakDays}-day streak! Keep up the momentum today.`,
        time: 'Today',
        type: 'streak',
        read: false,
      })
    }
    list.push({
      id: 'notif-ai',
      title: 'AI Assistant Online',
      message: 'AI Assistant is ready to answer questions, check integrations, and manage trackers.',
      time: 'Just now',
      type: 'system',
      read: false,
    })
    return list
  })

  // Add goal-specific notifications when goals change
  useEffect(() => {
    const active = goals.filter((g) => g.status === 'active')
    const goalNotifs: NotificationItem[] = []

    if (active.length > 0) {
      const nearest = active[0]
      goalNotifs.push({
        id: `notif-goal-${nearest.id}`,
        title: 'Active Goal Check-in',
        message: `Time to log progress towards "${nearest.title}".`,
        time: 'Today',
        type: 'goal',
        read: false,
        link: `/dashboard/goal/${nearest.id}`,
      })
    }

    if (streakDays > 0) {
      goalNotifs.push({
        id: 'notif-streak',
        title: 'Daily Streak Milestone',
        message: `You are maintaining a ${streakDays}-day streak!`,
        time: 'Active',
        type: 'streak',
        read: false,
      })
    }

    setNotifications(goalNotifs)
  }, [goals, streakDays])

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }
  }, [isSearchOpen])

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNotificationsOpen])

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return goals
      .filter((g) => g.title.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q)) || (g.domain && g.domain.toLowerCase().includes(q)))
      .slice(0, 6)
  }, [goals, searchQuery])

  const quickLinks = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Trackers / Manage', path: '/dashboard/goals', icon: Target },
    { label: 'Activity Logs', path: '/dashboard/activity', icon: Zap },
    { label: 'Calendar Schedule', path: '/dashboard/calendar', icon: Calendar },
    { label: 'AI Partner Chat', path: '/dashboard/chat', icon: MessageSquare },
    { label: 'Account & Settings', path: '/dashboard/account', icon: Settings },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handlePillSelect = (id: string) => {
    onSelectPill(id)
    setMobileNavOpen(false)
  }

  const displayName = firstName(user) || (user.email ? user.email.split('@')[0] : 'Account')
  const initial = (displayName ? displayName[0] : 'U').toUpperCase()

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
              <X className="w-4 h-4" />
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          {/* Search Button (Works on both mobile & desktop) */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex w-9 h-9 rounded-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] items-center justify-center text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Search workspace (Ctrl+K)"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Button & Dropdown (Dedicated panel, NEVER opens chat) */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="w-9 h-9 rounded-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] relative hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00C4B3] border border-[#071E2D] text-[9px] font-extrabold text-[#071E2D] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000] z-50 p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b-2 border-[#071E2D]/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#071E2D] dark:text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#00C4B3] text-[#071E2D] text-[10px] font-extrabold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[11px] font-bold text-[#006D6A] dark:text-[#00C4B3] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#071E2D]/60 dark:text-slate-400">
                      No notifications right now. You're completely up to date!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (n.link) {
                            navigate(n.link)
                            setIsNotificationsOpen(false)
                          }
                        }}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                          n.read
                            ? 'bg-transparent border-[#071E2D]/10 dark:border-white/10 opacity-75'
                            : 'bg-[#F8FAFB] dark:bg-[#091824] border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {n.type === 'streak' && <Flame className="w-4 h-4 text-amber-500 shrink-0" />}
                            {n.type === 'goal' && <Zap className="w-4 h-4 text-[#00C4B3] shrink-0" />}
                            {n.type === 'system' && <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />}
                            <span className="text-xs font-bold text-[#071E2D] dark:text-white">
                              {n.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#071E2D]/50 dark:text-slate-400 font-mono">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-xs text-[#071E2D]/75 dark:text-slate-300 mt-1 pl-6">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 border-t-2 border-[#071E2D]/10 dark:border-white/10 bg-[#F8FAFB] dark:bg-[#07141E] flex items-center justify-between">
                  <span className="text-[10px] text-[#071E2D]/60 dark:text-slate-400 font-mono">
                    AI Assistant Active
                  </span>
                  {onToggleChat && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationsOpen(false)
                        onToggleChat()
                      }}
                      className="text-[11px] font-bold text-[#00C4B3] hover:underline cursor-pointer"
                    >
                      Open Chat &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div
            onClick={() => onSelectPill('account')}
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2 sm:pr-3 py-1 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-full shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] cursor-pointer hover:-translate-y-0.5 transition-all"
            title="Account Settings"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#00C4B3] border-2 border-[#071E2D] flex items-center justify-center text-[#071E2D] font-extrabold text-xs flex-shrink-0">
              {initial}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#071E2D] dark:text-white leading-tight truncate max-w-[90px]">
                {displayName}
              </span>
              <span className="text-[10px] text-[#006D6A] dark:text-[#00C4B3] font-semibold leading-none">
                Workspace
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

      {/* ── Search & Command Palette Modal ─────────────────────────────── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-16 sm:pt-24 px-4" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#071E2D]/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSearchOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl shadow-[6px_6px_0px_#071E2D] dark:shadow-[6px_6px_0px_#000000] p-5 z-10 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 bg-[#F8FAFB] dark:bg-[#091824] px-4 py-3 rounded-2xl border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]">
              <Search className="w-5 h-5 text-[#071E2D] dark:text-white shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search goals, trackers, domains, or quick actions..."
                className="w-full bg-transparent outline-none text-sm text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full text-[#071E2D]/50 hover:text-[#071E2D] dark:text-white/50 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Search Results */}
            {searchQuery.trim() !== '' ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3] px-1">
                  Matching Goals ({searchResults.length})
                </span>
                {searchResults.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#071E2D]/60 dark:text-slate-400">
                    No matching goals found for "{searchQuery}".
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
                    {searchResults.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          navigate(`/dashboard/goal/${g.id}`)
                          setIsSearchOpen(false)
                        }}
                        className="flex items-center justify-between p-3 rounded-2xl border-2 border-[#071E2D]/15 dark:border-[#1E3A52] hover:border-[#00C4B3] hover:bg-[#E6F7F5]/50 dark:hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#071E2D] dark:text-white truncate">{g.title}</p>
                          <p className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 truncate mt-0.5">
                            {g.domain} · {g.current_value}/{g.target} {g.unit || ''}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#071E2D]/40 dark:text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Quick Navigation Links */
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3] px-1">
                  Quick Navigation
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {quickLinks.map((link) => (
                    <button
                      key={link.path}
                      type="button"
                      onClick={() => {
                        navigate(link.path)
                        setIsSearchOpen(false)
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-2xl border-2 border-[#071E2D]/15 dark:border-[#1E3A52] hover:border-[#071E2D] dark:hover:border-[#00C4B3] hover:bg-[#E6F7F5]/40 dark:hover:bg-white/5 text-left text-xs font-bold text-[#071E2D] dark:text-white transition-all cursor-pointer"
                    >
                      <link.icon className="w-4 h-4 text-[#006D6A] dark:text-[#00C4B3] shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
