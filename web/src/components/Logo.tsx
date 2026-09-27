import React from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/ChatGPT Image Sep 27, 2026, 02_35_50 PM.png'

interface LogoProps {
  /** light = white text (for dark backgrounds), dark = navy text (default) */
  theme?: 'light' | 'dark'
  className?: string
  linkTo?: string
  /** Size of the logo image. Defaults to 32px (h-8). */
  size?: number
}

export const Logo: React.FC<LogoProps> = ({
  theme = 'dark',
  className = '',
  linkTo = '/',
  size = 32,
}) => {
  const textColor = theme === 'light' ? 'text-white' : 'text-[#071E2D] dark:text-white'

  const mark = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* Logo image */}
      <img
        src={logoImg}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className="flex-shrink-0 rounded-lg object-contain"
        style={{ width: size, height: size }}
      />
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
