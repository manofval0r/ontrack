import React, { useState } from 'react'
import { User, Volume2, Bell, Link2 } from 'lucide-react'
import { Profile } from '../../settings/Profile'
import { AudioPreferences } from '../../settings/AudioPreferences'
import { Notifications } from '../../settings/Notifications'
import { Integrations } from '../../settings/Integrations'

type AccountTab = 'profile' | 'audio' | 'notifications' | 'integrations'

export const AccountPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AccountTab>('profile')

  const tabs = [
    { id: 'profile' as const, label: 'Profile & Persona', icon: User },
    { id: 'audio' as const, label: 'Voice & Audio (TTS/ASR)', icon: Volume2 },
    { id: 'notifications' as const, label: 'Notifications & Alerts', icon: Bell },
    { id: 'integrations' as const, label: 'Connected Tools', icon: Link2 },
  ]

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Account & Workspace Preferences
        </h2>
        <p className="text-xs sm:text-sm text-[#071E2D]/70 dark:text-slate-400 mt-1 font-medium">
          Manage your personal profile, AI coach persona, voice synthesis, alert triggers, and integrations all in one place.
        </p>
      </div>

      {/* Tab Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b-2 border-[#071E2D]/10 dark:border-white/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-2 cursor-pointer
                ${
                  isActive
                    ? 'bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] border-[#071E2D] dark:border-[#00C4B3] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]'
                    : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-slate-200 border-[#071E2D]/20 dark:border-[#1E3A52] hover:border-[#071E2D] dark:hover:border-slate-500 shadow-[2px_2px_0px_#071E2D]/20 dark:shadow-[2px_2px_0px_#000000]'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active Tab Content */}
      <div className="animate-in fade-in duration-150">
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'audio' && <AudioPreferences />}
        {activeTab === 'notifications' && <Notifications />}
        {activeTab === 'integrations' && <Integrations />}
      </div>
    </div>
  )
}
