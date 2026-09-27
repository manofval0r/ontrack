import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Logo'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const ArrowRight = () => (
  <svg
    width="14"
    height="14"
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

const MenuIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M4 6h16M4 12h16M4 18h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const CloseIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

// ─── Navbar Component ─────────────────────────────────────────────────────────

export const Navbar: React.FC = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')

  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const isLanding = location.pathname === '/'
  const isLogin = location.pathname === '/login'
  const isSignup = location.pathname === '/signup'

  // Scroll detection & active section spy on landing page
  useEffect(() => {
    if (!isLanding) {
      setIsScrolled(true)
      return
    }

    const sectionIds = ['how-it-works', 'tracker-types', 'who-its-for']

    const handleScroll = () => {
      // Transition background once user scrolls past hero threshold (~60px)
      setIsScrolled(window.scrollY > 60)

      // Active section spy
      const scrollPosition = window.scrollY + 180
      let current = ''
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = id
            break
          }
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isLanding])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Close mobile menu on click outside or Escape key
  useEffect(() => {
    if (!isMobileMenuOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen])

  // Navigation anchor link handler for smooth scrolling
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    setIsMobileMenuOpen(false)
    if (isLanding) {
      e.preventDefault()
      const target = document.getElementById(sectionId)
      if (target) {
        const offset = 80 // Navbar height offset
        const top = target.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
        window.history.pushState(null, '', `#${sectionId}`)
      }
    }
  }

  const navLinks = [
    { id: 'how-it-works', label: 'How it works', href: '/#how-it-works' },
    { id: 'tracker-types', label: 'Tracker types', href: '/#tracker-types' },
    { id: 'who-its-for', label: "Who it's for", href: '/#who-its-for' },
  ]

  // Header dynamic classes:
  // On landing page: transparent at top, solid with subtle border on scroll
  // On auth pages: solid light background with subtle bottom border
  const headerBackgroundClass = isLanding
    ? isScrolled
      ? 'bg-white/95 backdrop-blur-md border-b border-[#071E2D]/10'
      : 'bg-transparent border-b border-transparent'
    : 'bg-white/95 backdrop-blur-md border-b border-[#071E2D]/10'

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ease-in-out ${headerBackgroundClass}`}
    >
      <nav
        aria-label="Main navigation"
        className="max-w-6xl mx-auto px-6 flex items-center justify-between h-20"
      >
        {/* ── Left Zone: Logo / Wordmark ───────────────────────────────────── */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* ── Center Zone: Navigation Links (Landing page only) ───────────── */}
        {isLanding ? (
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id
              return (
                <li key={link.id}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.id)}
                    className={`font-sans text-sm transition-colors duration-150 rounded px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] focus-visible:ring-offset-2 ${
                      isActive
                        ? 'text-[#00C4B3] font-semibold'
                        : 'text-[#071E2D]/75 hover:text-[#00C4B3] font-medium'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : (
          /* Empty center spacer on /login and /signup */
          <div className="hidden md:block flex-1" />
        )}

        {/* ── Right Zone: Desktop Actions ─────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-4">
          {isLanding && (
            <>
              <Link
                to="/login"
                className="font-sans font-semibold text-sm text-[#071E2D]/75 hover:text-[#00C4B3] transition-colors px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] focus-visible:ring-offset-2"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="btn-pill btn-pill-primary text-[0.875rem] py-2 px-3.5 pl-5"
              >
                <span>Sign up</span>
                <span
                  className="btn-bubble !w-6 !h-6 bg-white text-[#006D6A]"
                  style={{ width: '1.5rem', height: '1.5rem' }}
                  aria-hidden="true"
                >
                  <ArrowRight />
                </span>
              </Link>
            </>
          )}

          {isLogin && (
            <Link
              to="/signup"
              className="btn-pill btn-pill-primary text-[0.875rem] py-2 px-3.5 pl-5"
            >
              <span>Sign up</span>
              <span
                className="btn-bubble !w-6 !h-6 bg-white text-[#006D6A]"
                style={{ width: '1.5rem', height: '1.5rem' }}
                aria-hidden="true"
              >
                <ArrowRight />
              </span>
            </Link>
          )}

          {isSignup && (
            <Link
              to="/login"
              className="btn-pill btn-pill-secondary text-[0.875rem] py-2 px-4"
            >
              <span>Log in</span>
            </Link>
          )}
        </div>

        {/* ── Mobile Trigger (Landing only has center links + auth to collapse) ─ */}
        {isLanding ? (
          <button
            ref={buttonRef}
            type="button"
            className="md:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl border-2 border-[#071E2D] bg-white shadow-[2px_2px_0px_#071E2D] text-[#071E2D] flex items-center justify-center transition-all hover:bg-[#F8FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] focus-visible:ring-offset-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        ) : (
          /* Mobile action button for /login and /signup */
          <div className="md:hidden">
            {isLogin && (
              <Link
                to="/signup"
                className="btn-pill btn-pill-primary text-xs py-1.5 px-3 pl-3.5"
              >
                <span>Sign up</span>
              </Link>
            )}
            {isSignup && (
              <Link
                to="/login"
                className="btn-pill btn-pill-secondary text-xs py-1.5 px-3"
              >
                <span>Log in</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* ── Mobile Slide-down Menu (Landing page) ─────────────────────────── */}
      {isLanding && isMobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          ref={menuRef}
          className="md:hidden absolute top-20 left-0 right-0 bg-white border-b-2 border-[#071E2D] px-6 py-6 flex flex-col gap-3 shadow-[0_8px_0px_#071E2D] animate-in slide-in-from-top-2 duration-200"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.id
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.id)}
                className={`font-sans text-base py-2 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] ${
                  isActive
                    ? 'text-[#00C4B3] font-bold'
                    : 'text-[#071E2D] font-semibold hover:text-[#00C4B3]'
                }`}
              >
                {link.label}
              </a>
            )
          })}

          <hr className="border-[#071E2D]/12 my-2" />

          <Link
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-sans font-semibold text-sm text-center text-[#071E2D] hover:text-[#00C4B3] py-2 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3]"
          >
            Log in
          </Link>

          <Link
            to="/signup"
            onClick={() => setIsMobileMenuOpen(false)}
            className="btn-pill btn-pill-primary w-full justify-between mt-1"
          >
            <span>Sign up</span>
            <span
              className="btn-bubble bg-white text-[#006D6A]"
              aria-hidden="true"
            >
              <ArrowRight />
            </span>
          </Link>
        </div>
      )}
    </header>
  )
}
