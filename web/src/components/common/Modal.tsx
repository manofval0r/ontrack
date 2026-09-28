import React, { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#071E2D]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`
          relative w-full ${maxWidth} bg-white dark:bg-[#0E202D]
          border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl
          shadow-[6px_6px_0px_#071E2D] dark:shadow-[6px_6px_0px_#000000]
          p-6 sm:p-8 z-10 overflow-hidden
          transition-all duration-200 transform scale-100
        `.trim()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-[#071E2D]/10 dark:border-white/10">
          <h2
            id="modal-title"
            className="text-xl sm:text-2xl font-bold text-[#071E2D] dark:text-white"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#071E2D]/30 dark:border-white/20 flex items-center justify-center text-[#071E2D] dark:text-white hover:bg-[#F3F6F8] dark:hover:bg-[#152E42] hover:border-[#071E2D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] cursor-pointer"
            aria-label="Close dialog"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="text-sm font-sans text-[#071E2D] dark:text-slate-100">{children}</div>
      </div>
    </div>
  )
}
