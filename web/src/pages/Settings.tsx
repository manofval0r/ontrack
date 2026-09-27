import React, { useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { Profile } from '../components/settings/Profile'
import { AudioPreferences } from '../components/settings/AudioPreferences'
import { Notifications } from '../components/settings/Notifications'
import { Integrations } from '../components/settings/Integrations'

type SettingsTab = 'profile' | 'audio' | 'notifications' | 'integrations'

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('audio')

  const tabs = [
    { id: 'audio' as const, label: 'Audio & Voice (TTS/ASR)', icon: '🔊' },
    { id: 'notifications' as const, label: 'Notifications & Alerts', icon: '🔔' },
    { id: 'integrations' as const, label: 'Connected Workspaces', icon: '🔗' },
    { id: 'profile' as const, label: 'Account & Persona', icon: '👤' },
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
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all border-2
                  ${isActive
                    ? 'bg-[#071E2D] text-white border-[#071E2D] shadow-[3px_3px_0px_#00C4B3]'
                    : 'bg-white text-[#071E2D] border-[#071E2D]/20 hover:border-[#071E2D]'
                  }
                `}
              >
                <span>{tab.icon}</span>
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
