import React from 'react'
import { Check } from 'lucide-react'
import type { ProgressLog } from '../../types'

interface HistoryProps {
  activity: ProgressLog[]
}

export const History: React.FC<HistoryProps> = ({ activity }) => {
  return (
    <div className="bg-white border-2 border-[#071E2D] rounded-2xl shadow-[4px_4px_0px_#071E2D] p-6 sm:p-7 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#071E2D]/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A]">Audit Trail</span>
          <h3
            className="text-lg sm:text-xl font-bold text-[#071E2D]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Recent Activity Stream
          </h3>
        </div>
        <span className="text-xs font-bold text-[#071E2D]/60 bg-[#F3F6F8] px-2.5 py-1 rounded-full border border-[#071E2D]/20">
          Live Sync
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {activity.length === 0 ? (
          <p className="text-sm text-[#071E2D]/60 py-4 text-center">No recent activity logged yet.</p>
        ) : (
          activity.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-[#071E2D]/15 bg-[#F8FAFB] hover:border-[#071E2D] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ECFEFF] border border-[#006D6A] flex items-center justify-center text-[#006D6A] text-xs font-bold flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[#006D6A]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#071E2D]">{item.note}</span>
                  <span className="text-[11px] text-[#006D6A] font-semibold mt-0.5">
                    Metric: {item.value}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#071E2D]/50 flex-shrink-0">
                {item.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
