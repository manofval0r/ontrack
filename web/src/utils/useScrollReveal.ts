import { useEffect } from 'react'

/**
 * Lightweight intersection observer hook that adds `.revealed` to any element
 * with a `[data-reveal]` attribute when it enters the viewport.
 * Runs once per component mount. Re-triggers on re-mount (e.g. route re-entry).
 */
export function useScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll('[data-reveal]')

    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}
