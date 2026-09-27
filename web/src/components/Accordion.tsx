import React, { useState } from 'react'

export interface AccordionItemData {
  id: string
  question: string
  answer: string
}

export interface AccordionProps {
  items: AccordionItemData[]
  defaultOpenId?: string
  className?: string
}

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={`text-[#071E2D]/70 transition-transform duration-200 ease-out ${
      isOpen ? 'rotate-180' : ''
    }`}
    aria-hidden="true"
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * Accordion Card directly matching Image 2:
 * - Rounded card (rounded-2xl)
 * - 2px solid dark border (#071E2D)
 * - 4px solid offset shadow (shadow-[4px_4px_0px_#071E2D])
 * - White background (#FFFFFF)
 * - Chevron indicator on the right
 * - Clean typography and smooth expand/collapse transition
 */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenId,
  className = '',
}) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null)

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`.trim()}>
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div
            key={item.id}
            className={`
              bg-white
              border-2 border-[#071E2D]
              rounded-2xl
              shadow-[4px_4px_0px_#071E2D]
              overflow-hidden
              transition-all duration-150 ease-out
              ${isOpen ? 'ring-0' : 'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#071E2D]'}
            `.trim()}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={`accordion-body-${item.id}`}
              id={`accordion-btn-${item.id}`}
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:bg-[#F3F6F8]/60 transition-colors"
            >
              <span className="font-sans font-bold text-base sm:text-lg text-[#071E2D] leading-snug">
                {item.question}
              </span>
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F3F6F8] border border-[#071E2D]/15 flex-shrink-0">
                <ChevronIcon isOpen={isOpen} />
              </span>
            </button>

            {isOpen && (
              <div
                id={`accordion-body-${item.id}`}
                role="region"
                aria-labelledby={`accordion-btn-${item.id}`}
                className="px-6 pb-6 pt-1 text-sm sm:text-base font-sans text-[#071E2D]/70 leading-relaxed border-t border-[#071E2D]/10"
              >
                {item.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
