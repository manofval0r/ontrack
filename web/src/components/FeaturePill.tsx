import React from 'react'

interface FeaturePillProps {
  icon: React.ReactNode
  label: string
  className?: string
}

/**
 * Small secondary pill: icon + label, bordered, rounded-full, white background,
 * with tactile offset shadow matching the design language.
 */
export const FeaturePill: React.FC<FeaturePillProps> = ({
  icon,
  label,
  className = '',
}) => {
  return (
    <div
      className={`
        inline-flex items-center gap-2.5
        px-4 py-2
        rounded-full
        border-2 border-[#071E2D] dark:border-[#1E3A52]
        bg-white dark:bg-[#0E202D]
        shadow-[2.5px_2.5px_0px_#071E2D] dark:shadow-[2.5px_2.5px_0px_#000000]
        font-sans font-medium text-sm text-[#071E2D] dark:text-white
        transition-all duration-150
        hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#071E2D] dark:hover:shadow-[4px_4px_0px_#000000]
        ${className}
      `.trim()}
    >
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00C4B3] text-[#071E2D] flex-shrink-0"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span>{label}</span>
    </div>
  )
}
