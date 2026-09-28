import React, { useState } from 'react'
import { Flame, Heart, Award, Trophy, Rocket, Code2, Zap, Palette, Check, UserPlus, Users, Share2 } from 'lucide-react'
import { useGoals } from '../../../context/GoalContext'
import { Modal } from '../../common/Modal'
import { Button } from '../../Button'

interface Partner {
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
  { id: 'founders', name: 'Founders & Scale', focus: 'Enterprise growth & fundraising', icon: Rocket },
  { id: 'builders', name: 'Software Engineers', focus: 'Shipping code & architecture', icon: Code2 },
  { id: 'fitness', name: 'Daily Habits & Health', focus: 'Physical fitness & routines', icon: Zap },
  { id: 'creators', name: 'Product & Design', focus: 'User research & interface polish', icon: Palette },
]

export const CommunityPanel: React.FC = () => {
  const { user, goals, dashboardData } = useGoals()
  const [selectedSquad, setSelectedSquad] = useState(() => localStorage.getItem('ontrack_user_squad') || 'founders')
  const [cheeredMembers, setCheeredMembers] = useState<Record<string, boolean>>({})
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [partnerName, setPartnerName] = useState('')
  const [partnerDomain, setPartnerDomain] = useState('')
  const [copiedInvite, setCopiedInvite] = useState(false)

  // Real user data
  const userStreak = dashboardData?.stats.streak_days || 0
  const userCompleted = goals.filter((g) => g.status === 'completed').length
  const userRate = goals.length > 0 ? Math.round((userCompleted / goals.length) * 100) : 0

  // Real user-added accountability partners (no mock people)
  const [partners, setPartners] = useState<Partner[]>(() => {
    try {
      const stored = localStorage.getItem('ontrack_partners')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const handleSelectSquad = (id: string) => {
    setSelectedSquad(id)
    localStorage.setItem('ontrack_user_squad', id)
  }

  const handleCheer = (id: string) => {
    if (cheeredMembers[id]) return
    setCheeredMembers((prev) => ({ ...prev, [id]: true }))
    setPartners((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, cheers: m.cheers + 1 } : m))
      localStorage.setItem('ontrack_partners', JSON.stringify(updated))
      return updated
    })
  }

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerName.trim()) return
    const newPartner: Partner = {
      id: `partner-${Date.now()}`,
      name: partnerName.trim(),
      initial: partnerName.trim()[0].toUpperCase(),
      streak: 1,
      completionRate: 100,
      domain: partnerDomain.trim() || 'General',
      lastActivity: 'Joined accountability circle',
      squad: selectedSquad,
      cheers: 0,
    }
    const updated = [...partners, newPartner]
    setPartners(updated)
    localStorage.setItem('ontrack_partners', JSON.stringify(updated))
    setPartnerName('')
    setPartnerDomain('')
    setShowAddPartner(false)
  }

  const handleCopyInvite = () => {
    const inviteLink = `${window.location.origin}/signup?ref=squad-${selectedSquad}`
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopiedInvite(true)
      setTimeout(() => setCopiedInvite(false), 2500)
    })
  }

  const challengeProgress = Math.min(100, Math.round((userStreak / 14) * 100))

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
            Select your focus squad, track personal velocity against daily milestones, and partner up for accountability.
          </p>
        </div>

        {/* User rank badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#E6F7F5] dark:bg-[#00C4B3]/15 border-2 border-[#071E2D] dark:border-[#00C4B3] rounded-full shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]">
          <Trophy className="w-4 h-4 text-[#006D6A] dark:text-[#00C4B3]" />
          <span className="text-xs font-bold text-[#071E2D] dark:text-white">
            Active Streak: {userStreak}d · {userRate}% Goals Completed
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
              onClick={() => handleSelectSquad(squad.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#00C4B3] text-[#071E2D] border-[#071E2D] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]'
                  : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-white border-[#071E2D]/20 dark:border-[#1E3A52] hover:border-[#071E2D] shadow-[2px_2px_0px_#071E2D]/20 dark:shadow-[2px_2px_0px_#000000]'
              }`}
            >
              <div className="flex items-center justify-between">
                <squad.icon className="w-5 h-5 text-current" />
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/40 dark:bg-white/10 border border-[#071E2D]/20">
                  {isSelected ? 'Active Squad' : 'Select Track'}
                </span>
              </div>
              <div className="mt-3">
                <h4 className="font-bold text-sm leading-tight">{squad.name}</h4>
                <span className="text-[11px] font-semibold opacity-80 mt-1 block">
                  {squad.focus}
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
                Squad Momentum Board
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddPartner(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#071E2D] dark:border-[#00C4B3] text-xs font-bold bg-[#E6F7F5] dark:bg-[#00C4B3]/20 text-[#071E2D] dark:text-white hover:bg-[#00C4B3] transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Partner</span>
              </button>
              <button
                type="button"
                onClick={handleCopyInvite}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-white/20 text-xs font-bold bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-slate-200 hover:border-[#071E2D] transition-colors"
                title="Copy squad invite link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedInvite ? 'Copied Link!' : 'Invite'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-[#071E2D]/10 dark:divide-white/10">
            {/* User Row Highlight */}
            <div className="py-3.5 flex items-center justify-between gap-3 bg-[#E6F7F5]/50 dark:bg-[#00C4B3]/10 px-3.5 rounded-2xl border border-[#00C4B3]/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00C4B3] border border-[#071E2D] flex items-center justify-center font-extrabold text-xs text-[#071E2D]">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[#071E2D] dark:text-white">
                      {user.name || 'You'} (Current Workspace)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#071E2D] text-white text-[9px] font-bold">
                      You
                    </span>
                  </div>
                  <span className="text-[11px] text-[#071E2D]/70 dark:text-slate-300">
                    {goals.length} Active {goals.length === 1 ? 'Goal' : 'Goals'} · {userCompleted} Completed
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] block">
                    {userRate}% Completed
                  </span>
                  <span className="text-[10px] text-[#071E2D]/60 dark:text-slate-400 font-mono">
                    {userStreak} Day Streak
                  </span>
                </div>
              </div>
            </div>

            {/* Real Partners Rows */}
            {partners.length > 0 ? (
              partners.map((m, idx) => (
                <div key={m.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFB] dark:hover:bg-white/5 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#071E2D]/40 dark:text-slate-500 w-4">
                      #{idx + 2}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border border-[#071E2D]/30 flex items-center justify-center font-bold text-xs text-[#071E2D] dark:text-white">
                      {m.initial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-[#071E2D] dark:text-white truncate">{m.name}</p>
                      <p className="text-[11px] text-[#071E2D]/60 dark:text-slate-400 truncate mt-0.5">
                        {m.domain} · {m.lastActivity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-[#071E2D] dark:text-white block">
                        {m.completionRate}%
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#006D6A] dark:text-[#00C4B3] font-bold">
                        <Flame className="w-3 h-3 text-[#006D6A] dark:text-[#00C4B3]" />
                        <span>{m.streak}d streak</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCheer(m.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full border-2 text-[11px] font-bold transition-all cursor-pointer ${
                        cheeredMembers[m.id]
                          ? 'bg-rose-500 text-white border-rose-600'
                          : 'bg-white dark:bg-[#091824] text-[#071E2D] dark:text-white border-[#071E2D] dark:border-[#1E3A52] hover:bg-rose-50'
                      }`}
                    >
                      <Heart className="w-3 h-3 fill-current" />
                      <span>{m.cheers}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E6F7F5] dark:bg-[#00C4B3]/10 border-2 border-[#071E2D]/20 dark:border-[#00C4B3]/40 flex items-center justify-center text-[#006D6A] dark:text-[#00C4B3]">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#071E2D] dark:text-white">
                    No Accountability Partners Added Yet
                  </h4>
                  <p className="text-xs text-[#071E2D]/60 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Pair up with a colleague, friend, or accountability partner to share daily check-in momentum and celebrate wins.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setShowAddPartner(true)}
                  className="text-xs !py-2 !px-4 mt-1"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  <span>Add Accountability Partner</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Squad Goals & Rules Sidebar */}
        <div className="flex flex-col gap-5">
          <div className="bg-[#071E2D] dark:bg-[#091824] text-white border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000] flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#00C4B3]" />
              <h4 className="font-bold text-base" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                14-Day Consistency Challenge
              </h4>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Build unshakeable daily momentum. Log at least one truthful check-in every day for 14 straight days to unlock your coach verdict.
            </p>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between text-xs font-bold">
              <span>Challenge Progress:</span>
              <span className="text-[#00C4B3]">
                {userStreak} / 14 Days ({challengeProgress}%)
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className="bg-[#00C4B3] h-full transition-all duration-500 rounded-full"
                style={{ width: `${challengeProgress}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-5 shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] flex flex-col gap-3">
            <h4 className="font-bold text-sm text-[#071E2D] dark:text-white">Community Principles</h4>
            <ul className="text-xs text-[#071E2D]/70 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#00C4B3] mt-0.5 shrink-0 stroke-[3]" />
                <span>Honest, unvarnished progress logging.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#00C4B3] mt-0.5 shrink-0 stroke-[3]" />
                <span>Proactive support and peer cheers.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#00C4B3] mt-0.5 shrink-0 stroke-[3]" />
                <span>Consistent check-ins beat occasional heroics.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Partner Modal */}
      <Modal isOpen={showAddPartner} onClose={() => setShowAddPartner(false)} title="Add Accountability Partner">
        <form onSubmit={handleAddPartner} className="flex flex-col gap-4 text-[#071E2D] dark:text-white">
          <p className="text-sm text-[#071E2D]/80 dark:text-slate-300 leading-relaxed">
            Add a partner or teammate to your squad to keep each other on track and celebrate wins.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#071E2D] dark:text-slate-200">
              Partner Name or Handle
            </label>
            <input
              type="text"
              required
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="e.g. Alex M."
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-[#0E202D] font-sans text-sm border-[#071E2D]/20 focus:border-[#00C4B3] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#071E2D] dark:text-slate-200">
              Focus Domain / Shared Goal
            </label>
            <input
              type="text"
              value={partnerDomain}
              onChange={(e) => setPartnerDomain(e.target.value)}
              placeholder="e.g. Daily workout, Q3 Product Launch"
              className="w-full px-4 py-2.5 rounded-xl border-2 bg-white dark:bg-[#0E202D] font-sans text-sm border-[#071E2D]/20 focus:border-[#00C4B3] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#071E2D]/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setShowAddPartner(false)}
              className="px-4 py-2 text-xs font-semibold text-[#071E2D]/70 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white"
            >
              Cancel
            </button>
            <Button variant="primary" type="submit" noBubble className="text-xs !py-2 !px-4">
              <span>Save Partner</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
