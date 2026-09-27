import React from 'react'

interface LoaderProps {
  label?: string
  aiThinking?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Loader: React.FC<LoaderProps> = ({
  label = 'Loading OnTrack...',
  aiThinking = false,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  }

  if (aiThinking) {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-[#071E2D] shadow-[3px_3px_0px_#071E2D] ${className}`}>
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#00C4B3] border border-[#071E2D]">
          <span className="absolute w-full h-full rounded-full bg-[#00C4B3] animate-ping opacity-30" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#071E2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A]">Nemotron AI Thinking</span>
          <span className="text-sm font-medium text-[#071E2D]">{label || 'Analyzing goal parameters & structuring tracker...'}</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span className="w-2 h-2 rounded-full bg-[#00C4B3] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-[#00C4B3] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-[#00C4B3] animate-bounce" />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 text-center ${className}`}>
      <div
        className={`rounded-full border-solid border-[#071E2D]/20 border-t-[#00C4B3] animate-spin ${sizeClasses[size]}`}
        role="status"
        aria-label="loading"
      />
      {label && <p className="text-sm font-semibold text-[#071E2D]/80">{label}</p>}
    </div>
  )
}
