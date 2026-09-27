import React from 'react'
import type { StandardError } from '../../types'
import { Button } from '../Button'

interface ErrorStateProps {
  error: StandardError | string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, className = '' }) => {
  const errorMessage = typeof error === 'string' ? error : error.error
  const errorCode = typeof error === 'string' ? undefined : error.code

  return (
    <div
      role="alert"
      className={`
        p-5 rounded-2xl bg-red-50 dark:bg-rose-950/40 border-2 border-red-500 dark:border-rose-600
        shadow-[3px_3px_0px_#EF4444] dark:shadow-[3px_3px_0px_#000000]
        flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors
        ${className}
      `.trim()}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-rose-900/60 border border-red-400 dark:border-rose-500 flex items-center justify-center flex-shrink-0 text-red-700 dark:text-rose-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-red-900 dark:text-rose-200">Application Notice</span>
            {errorCode && (
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-red-200/80 dark:bg-rose-900/80 text-red-900 dark:text-rose-200 border border-red-300 dark:border-rose-700">
                {errorCode}
              </span>
            )}
          </div>
          <p className="text-sm text-red-800 dark:text-rose-300 mt-0.5">{errorMessage}</p>
        </div>
      </div>

      {onRetry && (
        <Button variant="secondary" onClick={onRetry} noBubble className="self-end sm:self-auto text-xs py-2 px-4">
          Try Again
        </Button>
      )}
    </div>
  )
}
