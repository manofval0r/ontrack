import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  onClick?: () => void
}

/**
 * Base tactile card with solid dark border and crisp offset shadow.
 * Follows the design specification: 2px solid #071E2D border, 4px solid offset shadow.
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white
        border-2 border-[#071E2D]
        rounded-2xl
        shadow-[4px_4px_0px_#071E2D]
        p-7
        transition-all duration-150 ease-out
        ${interactive ? 'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#071E2D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#071E2D] cursor-pointer' : ''}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  )
}

export interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

/**
 * Feature card directly matching Image 1:
 * - Rounded corners (rounded-2xl)
 * - 2px solid dark border (#071E2D)
 * - 4px offset shadow (shadow-[4px_4px_0px_#071E2D])
 * - Dark squircle icon container with crisp white icon
 * - Bold DM Sans title
 * - High-legibility slate description
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className = '',
}) => {
  return (
    <div
      className={`
        bg-white
        border-2 border-[#071E2D]
        rounded-2xl
        shadow-[4px_4px_0px_#071E2D]
        p-7 sm:p-8
        flex flex-col gap-4
        transition-all duration-200 ease-out
        hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#071E2D]
        ${className}
      `.trim()}
    >
      {/* Icon squircle */}
      <div
        className="w-12 h-12 rounded-xl bg-[#071E2D] text-white flex items-center justify-center flex-shrink-0 shadow-sm"
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <h3 className="font-sans font-bold text-lg sm:text-xl text-[#071E2D] leading-snug tracking-tight">
          {title}
        </h3>
        <p className="font-sans text-sm text-[#071E2D]/70 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}
