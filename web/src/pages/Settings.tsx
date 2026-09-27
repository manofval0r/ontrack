import React, { useState } from 'react'
import { Volume2, Bell, Link2, User } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { Profile } from '../components/settings/Profile'
import { AudioPreferences } from '../components/settings/AudioPreferences'
import { Notifications } from '../components/settings/Notifications'
import { Integrations } from '../components/settings/Integrations'

type SettingsTab = 'profile' | 'audio' | 'notifications' | 'integrations'

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('audio')

  const tabs = [
    { id: 'audio' as const, label: 'Audio & Voice (TTS/ASR)', icon: Volume2 },
    { id: 'notifications' as const, label: 'Notifications & Alerts', icon: Bell },
    { id: 'integrations' as const, label: 'Connected Workspaces', icon: Link2 },
    { id: 'profile' as const, label: 'Account & Persona', icon: User },
  ]

  return (
    <AppLayout
      title="Settings & Preferences"
      subtitle="Configure voice synthesis, proactive check-ins, notifications, and connected tools."
    >
      <div className="flex flex-col gap-6 pb-12">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b-2 border-[#071E2D]/10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-2
                  ${isActive
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

        {/* Tab Content Panels */}
        <div>
          {activeTab === 'audio' && <AudioPreferences />}
          {activeTab === 'notifications' && <Notifications />}
          {activeTab === 'integrations' && <Integrations />}
          {activeTab === 'profile' && <Profile />}
        </div>
      </div>
    </AppLayout>
  )
}
