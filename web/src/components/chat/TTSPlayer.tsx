import React from 'react'

interface TTSPlayerProps {
  isPlaying: boolean
  onToggle: () => void
  label?: string
}

export const TTSPlayer: React.FC<TTSPlayerProps> = ({ isPlaying, onToggle, label = 'Nemotron Voice' }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isPlaying ? 'Stop voice playback' : 'Play voice message'}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-[#071E2D]
        text-xs font-bold transition-all shadow-[2px_2px_0px_#071E2D]
        ${isPlaying
          ? 'bg-[#00C4B3] text-[#071E2D] animate-pulse'
          : 'bg-white text-[#071E2D] hover:bg-[#F3F6F8]'
        }
      `.trim()}
    >
      {isPlaying ? (
        <span className="flex items-center gap-0.5 h-3">
          <span className="w-1 bg-[#071E2D] animate-[bounce_0.5s_infinite_100ms] h-full" />
          <span className="w-1 bg-[#071E2D] animate-[bounce_0.5s_infinite_200ms] h-2/3" />
          <span className="w-1 bg-[#071E2D] animate-[bounce_0.5s_infinite_300ms] h-full" />
          <span className="w-1 bg-[#071E2D] animate-[bounce_0.5s_infinite_150ms] h-1/2" />
        </span>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
      <span>{isPlaying ? 'Pause' : label}</span>
    </button>
  )
}
