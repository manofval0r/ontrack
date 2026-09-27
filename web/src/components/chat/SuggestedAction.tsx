import React from 'react'

interface SuggestedActionProps {
  onSelect: (prompt: string) => void
}

export const SUGGESTED_PROMPTS = [
  {
    title: 'Sell 5 Enterprise Deals',
    description: 'High-ticket sales pipeline with 14-day cadence',
    type: 'Counter',
    prompt: 'I want to close 5 enterprise software deals within the next 14 days.',
  },
  {
    title: 'Ship Frontend Web MVP',
    description: 'Engineering sprint with milestone checklists',
    type: 'Checklist',
    prompt: 'Complete 5 key frontend web engineering milestones for our OnTrack hackathon release.',
  },
  {
    title: 'Daily Founder Focus',
    description: 'Mindset & daily reflection habit',
    type: 'Reflection',
    prompt: 'Log a daily evening reflection on wins and roadblocks for 7 consecutive days.',
  },
]

export const SuggestedAction: React.FC<SuggestedActionProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60 pl-1">
        Suggested Goals To Jumpstart:
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SUGGESTED_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className="flex flex-col items-start p-3.5 rounded-xl border-2 border-[#071E2D] bg-white text-left shadow-[3px_3px_0px_#071E2D] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#071E2D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#071E2D] transition-all group"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFEFF] text-[#006D6A] border border-[#006D6A]">
                {item.type}
              </span>
              <span className="text-xs text-[#071E2D]/40 group-hover:text-[#00C4B3] transition-colors">
                ↗
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#071E2D] group-hover:text-[#006D6A] transition-colors">
              {item.title}
            </span>
            <span className="text-[11px] text-[#071E2D]/65 mt-0.5 line-clamp-1">
              {item.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
