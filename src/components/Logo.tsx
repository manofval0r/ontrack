import React from 'react'
import { Link } from 'react-router-dom'

interface LogoProps {
  /** light = white text (for dark backgrounds), dark = navy text (default) */
  theme?: 'light' | 'dark'
  className?: string
  linkTo?: string
}

export const Logo: React.FC<LogoProps> = ({
  theme = 'dark',
  className = '',
  linkTo = '/',
}) => {
  const textColor = theme === 'light' ? 'text-white' : 'text-[#071E2D]'

  const mark = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* Icon mark: turquoise rounded square with track/arrow motif */}
      <span
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00C4B3] flex-shrink-0"
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          {/* Target/check circle motif */}
          <circle cx="9" cy="9" r="6" stroke="#071E2D" strokeWidth="1.8" />
          <path
            d="M6 9l2.2 2.2L12 7"
            stroke="#071E2D"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {/* Wordmark */}
      <span
        className={`font-display font-700 text-xl tracking-tight ${textColor}`}
        style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}
      >
        Ontrack
      </span>
    </span>
  )

  return (
    <Link
      to={linkTo}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] focus-visible:ring-offset-2 rounded"
      aria-label="Ontrack — go to homepage"
    >
      {mark}
    </Link>
  )
}
