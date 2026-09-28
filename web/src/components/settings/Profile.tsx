import React, { useState } from 'react'
import { useGoals } from '../../context/GoalContext'
import { Button } from '../Button'

export const Profile: React.FC = () => {
  const { user, updateUserProfile } = useGoals()
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [persona, setPersona] = useState(user.accountability_persona)
  const [timezone, setTimezone] = useState(user.timezone)
  const [savedNotice, setSavedNotice] = useState(false)

  React.useEffect(() => {
    setName(user.name || '')
    setEmail(user.email || '')
    if (user.accountability_persona) setPersona(user.accountability_persona)
    if (user.timezone) setTimezone(user.timezone)
  }, [user])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateUserProfile({
      name,
      email,
      accountability_persona: persona,
      timezone,
    })
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 p-6 sm:p-8 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] transition-colors">
      <div className="pb-4 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <h3
          className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Account & Accountability Profile
        </h3>
        <p className="text-xs sm:text-sm text-[#071E2D]/70 dark:text-slate-300 mt-1">
          Manage your personal details and how Nemotron addresses your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#071E2D] dark:text-slate-300 uppercase tracking-wider pl-1">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#091824] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] focus-visible:ring-2 focus-visible:ring-[#00C4B3] text-sm text-[#071E2D] dark:text-white outline-none"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#071E2D] dark:text-slate-300 uppercase tracking-wider pl-1">
            Account Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#091824] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] focus-visible:ring-2 focus-visible:ring-[#00C4B3] text-sm text-[#071E2D] dark:text-white outline-none"
          />
        </div>

        {/* Accountability Persona */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#071E2D] dark:text-slate-300 uppercase tracking-wider pl-1">
            Nemotron AI Partner Persona
          </label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#091824] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] focus-visible:ring-2 focus-visible:ring-[#00C4B3] text-sm text-[#071E2D] dark:text-white outline-none"
          >
            <option value="Nemotron High-Accountability Coach" className="dark:bg-[#091824]">Nemotron High-Accountability Coach (Direct & Urgent)</option>
            <option value="Empathetic Habit Partner" className="dark:bg-[#091824]">Empathetic Habit Partner (Supportive & Encouraging)</option>
            <option value="Sprint Execution Architect" className="dark:bg-[#091824]">Sprint Execution Architect (Analytical & Quantitative)</option>
          </select>
        </div>

        {/* Timezone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#071E2D] dark:text-slate-300 uppercase tracking-wider pl-1">
            Timezone (For Check-ins)
          </label>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#091824] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] focus-visible:ring-2 focus-visible:ring-[#00C4B3] text-sm text-[#071E2D] dark:text-white outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#071E2D]/10 dark:border-white/10">
        {savedNotice ? (
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
            Profile settings updated successfully!
          </span>
        ) : (
          <span className="text-xs text-[#071E2D]/50 dark:text-slate-400 font-semibold">
            All updates sync with your local and cloud session.
          </span>
        )}

        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </div>
    </form>
  )
}
