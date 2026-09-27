import React from 'react'
import { Integrations } from '../../settings/Integrations'

export const IntegrationsPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Workspace Integrations
        </h2>
        <p className="text-xs sm:text-sm text-[#071E2D]/70 dark:text-slate-400 mt-1 font-medium">
          Connect your daily productivity stack to stream real commits, calendar milestones, and task completions into OnTrack.
        </p>
      </div>

      <Integrations />
    </div>
  )
}
