import React, { useState } from 'react'
import { Flame, Heart, Award, Trophy } from 'lucide-react'
import { useGoals } from '../../../context/GoalContext'

interface CommunityMember {
  id: string
  name: string
  initial: string
  streak: number
  completionRate: number
  domain: string
  lastActivity: string
  squad: string
  cheers: number
}

const COMMUNITY_SQUADS = [
  { id: 'founders', name: 'Founders & Scale', members: 128, pace: '+34% Velocity', icon: '🚀' },
  { id: 'builders', name: 'Software Engineers', members: 214, pace: '+28% Velocity', icon: '💻' },
  { id: 'fitness', name: 'Daily Habits & Health', members: 176, pace: '+42% Velocity', icon: '⚡' },
  { id: 'creators', name: 'Product & Design', members: 92, pace: '+19% Velocity', icon: '🎨' },
]

export const CommunityPanel: React.FC = () => {
  const { user, goals, dashboardData } = useGoals()
  const [selectedSquad, setSelectedSquad] = useState('founders')
  const [cheeredMembers, setCheeredMembers] = useState<Record<string, boolean>>({})

  const userStreak = dashboardData?.stats.streak_days || 0
  const userCompleted = goals.filter((g) => g.status === 'completed').length
  const userRate = goals.length > 0 ? Math.round((userCompleted / goals.length) * 100) : 0

  const [members, setMembers] = useState<CommunityMember[]>([
    {
      id: 'usr-1',
      name: 'Chioma N.',
      initial: 'C',
      streak: 21,
      completionRate: 94,
      domain: 'Engineering',
      lastActivity: 'Shipped v1.2 API integration',
      squad: 'builders',
      cheers: 14,
    },
    {
      id: 'usr-2',
      name: 'Eniola B.',
      initial: 'E',
      streak: 18,
      completionRate: 88,
      domain: 'Growth',
      lastActivity: 'Closed 3 enterprise trials',
      squad: 'founders',
      cheers: 9,
    },
    {
      id: 'usr-3',
      name: 'David O.',
      initial: 'D',
      streak: 14,
      completionRate: 85,
      domain: 'AI / Prompting',
      lastActivity: 'Trained Nemotron check-in pipeline',
      squad: 'builders',
      cheers: 22,
    },
    {
      id: 'usr-4',
      name: 'Sarah K.',
      initial: 'S',
      streak: 12,
      completionRate: 80,
      domain: 'Fitness',
      lastActivity: 'Completed 5km morning run',
      squad: 'fitness',
      cheers: 7,
    },
  ])

  const handleCheer = (id: string) => {
    if (cheeredMembers[id]) return
    setCheeredMembers((prev) => ({ ...prev, [id]: true }))
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, cheers: m.cheers + 1 } : m))
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Accountability Community & Squads
          </h2>
          <p className="text-xs sm:text-sm text-[#071E2D]/60 dark:text-slate-400 mt-0.5 font-medium">
            Join squads, view live momentum on the peer leaderboard, and cheer your accountability partners.
          </p>
        </div>

        {/* User rank badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#E6F7F5] dark:bg-[#00C4B3]/15 border-2 border-[#071E2D] dark:border-[#00C4B3] rounded-full shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]">
          <Trophy className="w-4 h-4 text-[#006D6A] dark:text-[#00C4B3]" />
          <span className="text-xs font-bold text-[#071E2D] dark:text-white">
            Your Rank: Top 10% ({userStreak}d Streak · {userRate}% Done)
          </span>
        </div>
      </div>

      {/* Squad Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COMMUNITY_SQUADS.map((squad) => {
          const isSelected = selectedSquad === squad.id
          return (
            <div
              key={squad.id}
              onClick={() => setSelectedSquad(squad.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#00C4B3] text-[#071E2D] border-[#071E2D] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]'
                  : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white border-[#071E2D]/20 dark:border-[#1E3A52] hover:border-[#071E2D] shadow-[2px_2px_0px_#071E2D]/20 dark:shadow-[2px_2px_0px_#000000]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{squad.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/40 dark:bg-white/10 border border-[#071E2D]/20">
                  {squad.members} Peers
                </span>
              </div>
              <div className="mt-3">
                <h4 className="font-bold text-sm leading-tight">{squad.name}</h4>
                <span className="text-[11px] font-semibold opacity-80 mt-1 block">
                  {squad.pace}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Community Body: Leaderboard + Real-time Peer Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peer Leaderboard (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#071E2D]/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#006D6A] dark:text-[#00C4B3]" />
              <h3 className="font-bold text-base text-[#071E2D] dark:text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                Velocity Leaderboard
              </h3>
            </div>
            <span className="text-xs text-[#071E2D]/60 dark:text-slate-400 font-semibold">
              Live updates
            </span>
          </div>

          <div className="flex flex-col divide-y divide-[#071E2D]/10 dark:divide-white/10">
            {/* User Row Highlight */}
            <div className="py-3 flex items-center justify-between gap-3 bg-[#E6F7F5]/50 dark:bg-[#00C4B3]/10 px-3 rounded-2xl border border-[#00C4B3]/40">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#00C4B3] border border-[#071E2D] flex items-center justify-center font-extrabold text-xs text-[#071E2D]">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#071E2D] dark:text-white">
                      {user.name || 'You'} (Current Workspace)
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-[#071E2D] text-white text-[9px] font-bold">
                      You
                    </span>
                  </div>
                  <span className="text-[11px] text-[#071E2D]/70 dark:text-slate-300">
                    {goals.length} Trackers · {userCompleted} Completed
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] block">
                    {userRate}% Completion
                  </span>
                  <span className="text-[10px] text-[#071E2D]/60 dark:text-slate-400 font-mono">
                    {userStreak} Day Streak
                  </span>
                </div>
              </div>
            </div>

            {/* Peer Rows */}
            {members.map((m, idx) => (
              <div key={m.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFB] dark:hover:bg-white/5 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#071E2D]/40 dark:text-slate-500 w-4">
                    #{idx + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#071E2D] dark:bg-[#00C4B3] border border-[#071E2D] dark:border-[#00C4B3] flex items-center justify-center font-bold text-xs text-white dark:text-[#071E2D]">
                    {m.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#071E2D] dark:text-white truncate">{m.name}</p>
                    <p className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 truncate mt-0.5">
                      {m.lastActivity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-[#071E2D] dark:text-white block">
                      {m.completionRate}%
                    </span>
                    <span className="text-[10px] text-[#006D6A] dark:text-[#00C4B3] font-bold">
                      {m.streak}d streak
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCheer(m.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border-2 text-[11px] font-bold transition-all cursor-pointer min-h-[44px] ${
                      cheeredMembers[m.id]
                        ? 'bg-[#00C4B3] text-[#071E2D] border-[#071E2D]'
                        : 'bg-white dark:bg-[#091824] text-[#071E2D] dark:text-white border-[#071E2D] dark:border-[#1E3A52] hover:bg-[#E6F7F5]'
                    }`}
                    aria-pressed={!!cheeredMembers[m.id]}
                    aria-label={`Cheer for ${m.name}`}
                  >
                    <Heart className="w-3 h-3 fill-current" />
                    <span>{m.cheers}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Squad Goals & Rules Sidebar */}
        <div className="flex flex-col gap-5">
          <div className="bg-[#071E2D] dark:bg-[#091824] text-white border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000] flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#00C4B3]" />
              <h4 className="font-bold text-base" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                Active Squad Challenge
              </h4>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Every member in the squad commits to 1 check-in per day for 14 straight days. Nemotron tracks group momentum and announces daily milestones.
            </p>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between text-xs font-bold">
              <span>Challenge Progress:</span>
              <span className="text-[#00C4B3]">84% Completed</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] flex flex-col gap-3">
            <h4 className="font-bold text-sm text-[#071E2D] dark:text-white">Community Principles</h4>
            <ul className="text-xs text-[#071E2D]/70 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#00C4B3] font-bold">✓</span>
                <span>Honest, unvarnished progress logging.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00C4B3] font-bold">✓</span>
                <span>Proactive support and peer cheers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00C4B3] font-bold">✓</span>
                <span>Consistent check-ins beat occasional heroics.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
