import React from 'react'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'white' | 'ghost'
  /** Icon rendered inside the right-side bubble. Defaults to an arrow. */
  icon?: React.ReactNode
  /** If true, hides the bubble entirely */
  noBubble?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  as?: 'button' | 'a'
  href?: string
  to?: string
  className?: string
  disabled?: boolean
  'aria-label'?: string
}

const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * Tactile Pill Button directly matching Image 3:
 * - Rounded-full outer pill (border-radius: 9999px)
 * - 2px solid dark border (#071E2D)
 * - 3px-4px solid offset shadow (box-shadow: 3px 3px 0px #071E2D)
 * - Circular inner bubble containing directional arrow
 * - Tactile micro-motion: hover lifts with deeper shadow, active presses in
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  noBubble = false,
  children,
  onClick,
  type = 'button',
  fullWidth = false,
  as: Tag = 'button',
  href,
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const variantClass =
    variant === 'primary'
      ? 'btn-pill-primary'
      : variant === 'secondary'
      ? 'btn-pill-secondary'
      : variant === 'white'
      ? 'btn-pill-white'
      : 'btn-pill-ghost'

  const widthClass = fullWidth ? 'w-full justify-between' : ''

  const sharedProps = {
    className: `btn-pill ${variantClass} ${widthClass} ${className}`.trim(),
    onClick,
    'aria-label': ariaLabel,
  }

  const bubbleContent = icon ?? <ArrowIcon />

  const inner = (
    <>
      <span className="font-semibold">{children}</span>
      {!noBubble && (
        <span className="btn-bubble" aria-hidden="true">
          {bubbleContent}
        </span>
      )}
    </>
  )

  if (Tag === 'a') {
    return (
      <a href={href} {...sharedProps}>
        {inner}
      </a>
    )
  }

  return (
    <button type={type} disabled={disabled} {...sharedProps}>
      {inner}
    </button>
  )
}
