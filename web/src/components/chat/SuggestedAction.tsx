import React from 'react'

interface SuggestedActionProps {
  onSelect: (prompt: string) => void
}

export const SUGGESTED_PROMPTS = [
  {
    title: 'Track 50 Pushups Daily',
    description: 'Launch a daily counter tracker',
    type: 'Set Tracker',
    prompt: 'Track 50 pushups daily',
  },
  {
    title: 'Check GitHub Activity',
    description: 'Query repos & recent commits',
    type: 'Integration',
    prompt: 'What are my recent GitHub repos and commits?',
  },
  {
    title: 'Deep Work Strategy',
    description: 'Ask questions conversationally',
    type: 'Chat Question',
    prompt: 'How can I maintain deep focus during 90-minute work blocks?',
  },
]

export const SuggestedAction: React.FC<SuggestedActionProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      <span className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60 dark:text-slate-400 pl-1">
        Try asking or setting a tracker:
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SUGGESTED_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className="flex flex-col items-start p-3.5 rounded-xl border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] text-left shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#071E2D] dark:hover:shadow-[5px_5px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#071E2D] dark:active:shadow-[1px_1px_0px_#000000] transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFEFF] dark:bg-[#00C4B3]/15 text-[#006D6A] dark:text-[#00C4B3] border border-[#006D6A] dark:border-[#00C4B3]">
                {item.type}
              </span>
              <span className="text-xs text-[#071E2D]/40 dark:text-slate-400 group-hover:text-[#00C4B3] transition-colors">
                ↗
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#071E2D] dark:text-white group-hover:text-[#006D6A] dark:group-hover:text-[#00C4B3] transition-colors">
              {item.title}
            </span>
            <span className="text-[11px] text-[#071E2D]/65 dark:text-slate-300 mt-0.5 line-clamp-1">
              {item.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
