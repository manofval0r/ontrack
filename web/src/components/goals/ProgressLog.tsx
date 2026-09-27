import React from 'react'
import type { ProgressLog as ProgressLogType } from '../../types'

interface ProgressLogProps {
  logs: ProgressLogType[]
}

export const ProgressLog: React.FC<ProgressLogProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D] text-center text-sm text-[#071E2D]/60">
        No progress logged yet. Use the tracker above to log your first milestone.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-6 sm:p-8 bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D]">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#071E2D]/10">
        <h3
          className="text-lg sm:text-xl font-bold text-[#071E2D]"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Progress Log & Audit Trail
        </h3>
        <span className="text-xs font-bold text-[#006D6A] bg-[#ECFEFF] px-2.5 py-0.5 rounded-full border border-[#006D6A]">
          {logs.length} Updates
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#071E2D]/20">
        {logs.map((log) => (
          <div key={log.id} className="relative flex flex-col gap-1">
            {/* Timeline node */}
            <span className="absolute -left-[1.8rem] top-1 w-3.5 h-3.5 rounded-full bg-[#00C4B3] border-2 border-[#071E2D] shadow-[1px_1px_0px_#071E2D]" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]">
                Value: <span className="text-[#006D6A]">{log.value}</span>
              </span>
              <span className="text-xs font-mono text-[#071E2D]/50">{log.timestamp}</span>
            </div>

            <p className="text-sm font-medium text-[#071E2D]/85 leading-relaxed bg-[#F8FAFB] p-3 rounded-xl border border-[#071E2D]/10">
              {log.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
