import React from 'react'
import { useGoals } from '../../context/GoalContext'

export const Notifications: React.FC = () => {
  const { notificationSettings, updateNotificationSettings } = useGoals()

  const toggleItems = [
    {
      key: 'master_enabled' as const,
      label: 'Master Notification Switch',
      description: 'Global master toggle for all OnTrack web notifications and reminders',
      isMaster: true,
    },
    {
      key: 'goal_reminders' as const,
      label: 'Daily Goal Reminders',
      description: 'Morning prompt outlining your daily target goals and priority tasks',
    },
    {
      key: 'check_ins' as const,
      label: 'Nemotron AI Check-ins',
      description: 'Proactive accountability inquiries when execution pace slows down',
    },
    {
      key: 'goal_updates' as const,
      label: 'Milestone Progress Alerts',
      description: 'Confirmations and notifications when team or integrations log progress',
    },
    {
      key: 'streak_alerts' as const,
      label: 'Streak Loss Protection Warnings',
      description: 'Urgent reminder at 8:00 PM if no progress was logged for an active streak',
    },
    {
      key: 'sound_enabled' as const,
      label: 'Audio Feedback & Chimes',
      description: 'Play tactile confirmation sounds when completing milestones',
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] transition-colors">
      <div className="pb-4 border-b-2 border-[#071E2D]/10 dark:border-white/10">
        <h3
          className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Notification & Alert Center
        </h3>
        <p className="text-xs sm:text-sm text-[#071E2D]/70 dark:text-slate-300 mt-1">
          Customize when and how OnTrack holds you accountable across your active goals.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {toggleItems.map((item) => {
          const isChecked = notificationSettings[item.key]
          const isDisabled = !notificationSettings.master_enabled && !item.isMaster

          return (
            <div
              key={item.key}
              className={`
                p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4
                ${item.isMaster
                  ? 'bg-[#ECFEFF] dark:bg-[#00C4B3]/15 border-[#071E2D] dark:border-[#00C4B3] shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]'
                  : isDisabled
                  ? 'bg-gray-50 dark:bg-slate-900/40 border-gray-200 dark:border-slate-800 opacity-50'
                  : 'bg-[#F8FAFB] dark:bg-[#091824] border-[#071E2D]/20 dark:border-[#1E3A52] hover:border-[#071E2D] dark:hover:border-slate-400'
                }
              `}
            >
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${item.isMaster ? 'text-[#006D6A] dark:text-[#00C4B3]' : 'text-[#071E2D] dark:text-white'}`}>
                  {item.label}
                </span>
                <span className="text-xs text-[#071E2D]/65 dark:text-slate-400 mt-0.5">{item.description}</span>
              </div>

              <button
                type="button"
                disabled={isDisabled}
                onClick={() => updateNotificationSettings({ [item.key]: !isChecked })}
                className={`
                  w-12 h-6 flex items-center rounded-full p-1 border-2 border-[#071E2D] dark:border-[#1E3A52] transition-colors flex-shrink-0
                  ${isChecked ? 'bg-[#00C4B3] justify-end' : 'bg-gray-200 dark:bg-slate-700 justify-start'}
                `}
              >
                <span className="bg-[#071E2D] dark:bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
