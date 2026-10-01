import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: React.ReactNode
}

/**
 * Wraps page-level content and triggers a smooth fade+lift-in animation
 * whenever the route changes. Keeps it subtle and professional.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation()
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    // Reset then replay animation on route change
    node.classList.remove('page-enter-active')
    // Force reflow so the browser registers the removal
    void node.offsetHeight
    node.classList.add('page-enter-active')
  }, [location.key])

  return (
    <div ref={nodeRef} className="page-enter-active" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  )
}
