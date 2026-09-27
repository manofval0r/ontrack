import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { AuthIllustration } from '../components/AuthIllustration'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
)

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.35-.57.66-1.06 1.73-.93 2.76 1 .08 2.02-.51 2.63-1.26z" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

// ─── Login Page ───────────────────────────────────────────────────────────────

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    // ── If Supabase is configured, use real auth ───────────────────────
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      setSubmitting(true)
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok || !data.access_token) {
          setAuthError(data.error_description ?? data.msg ?? 'Invalid email or password.')
          return
        }
        localStorage.setItem('ontrack_token', data.access_token)
        // Also store refresh token if present
        if (data.refresh_token) {
          localStorage.setItem('ontrack_refresh_token', data.refresh_token)
        }
        const alreadyOnboarded = localStorage.getItem('ontrack_onboarded')
        navigate(alreadyOnboarded ? '/dashboard' : '/onboarding')
      } catch {
        setAuthError('Network error. Please try again.')
      } finally {
        setSubmitting(false)
      }
      return
    }

    // ── Dev fallback: skip real auth, go straight to dashboard ────────
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] dark:bg-[#07141E] bg-dot-grid flex flex-col font-sans text-[#071E2D] dark:text-slate-100 transition-colors">
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Main Full-Screen Split Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* ── Left Column: Auth Form ──────────────────────────────────────── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-[420px] flex flex-col">
            {/* Heading */}
            <div className="mb-8">
              <h1
                className="text-[#071E2D] dark:text-white tracking-tight leading-tight"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontWeight: 700,
                  fontSize: 'clamp(2.25rem, 4vw, 2.75rem)',
                }}
              >
                Log in
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Field 1: Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-bold text-[#071E2D] dark:text-slate-200 uppercase tracking-wider pl-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-5 py-3.5 rounded-full border-2 border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] font-sans text-sm text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 outline-none transition-colors shadow-sm"
                />
              </div>

              {/* Field 2: Password with Eye toggle */}
              <div className="flex flex-col gap-1.5 mt-1">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-[#071E2D] dark:text-slate-200 uppercase tracking-wider pl-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-5 py-3.5 pr-12 rounded-full border-2 border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] font-sans text-sm text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 outline-none transition-colors shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#071E2D]/40 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white p-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] transition-colors"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* Right-aligned Forgot Password link */}
                <div className="flex justify-end mt-1 pr-1">
                  <a
                    href="#"
                    className="font-sans font-medium text-xs text-[#006D6A] dark:text-[#00C4B3] hover:text-[#00C4B3] transition-colors focus-visible:outline-none focus-visible:underline decoration-[#00C4B3]"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Live auth error */}
                {authError && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 text-xs text-red-600 bg-red-50/80 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/50 rounded-xl px-3.5 py-2 mt-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.75" />
                      <path d="M8 4.5v4M8 11v.5" stroke="#dc2626" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              {/* Primary button: Log in */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-3.5 px-6 rounded-full bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] font-sans font-semibold text-base transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0.5 shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#071E2D] dark:hover:shadow-[5px_5px_0px_#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] focus-visible:ring-offset-2 flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Logging in…' : 'Log in'}
              </button>
            </form>

            {/* Divider: or continue with */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#071E2D]/12 dark:bg-white/10" />
              <span className="font-sans text-xs text-[#071E2D]/45 dark:text-slate-400 font-medium whitespace-nowrap">
                or continue with
              </span>
              <div className="flex-1 h-px bg-[#071E2D]/12 dark:bg-white/10" />
            </div>

            {/* Social Login Buttons (matching reference circular style) */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                type="button"
                aria-label="Continue with Google"
                className="w-12 h-12 rounded-full bg-[#071E2D] dark:bg-[#0E202D] text-white border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center transition-all duration-150 hover:bg-[#00C4B3] hover:text-[#071E2D] hover:-translate-y-0.5 shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] cursor-pointer"
              >
                <GoogleIcon />
              </button>
              <button
                type="button"
                aria-label="Continue with Apple"
                className="w-12 h-12 rounded-full bg-[#071E2D] dark:bg-[#0E202D] text-white border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center transition-all duration-150 hover:bg-[#00C4B3] hover:text-[#071E2D] hover:-translate-y-0.5 shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] cursor-pointer"
              >
                <AppleIcon />
              </button>
              <button
                type="button"
                aria-label="Continue with Facebook"
                className="w-12 h-12 rounded-full bg-[#071E2D] dark:bg-[#0E202D] text-white border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center transition-all duration-150 hover:bg-[#00C4B3] hover:text-[#071E2D] hover:-translate-y-0.5 shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] cursor-pointer"
              >
                <FacebookIcon />
              </button>
            </div>

            {/* Secondary line below button: Don't have an account? Sign up */}
            <p className="font-sans text-sm text-center text-[#071E2D]/60 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-[#071E2D] dark:text-white hover:text-[#006D6A] dark:hover:text-[#00C4B3] transition-colors underline decoration-[#00C4B3] underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] rounded"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* ── Right Column: Full-Screen Illustration Showcase ─────────────── */}
        <div className="hidden lg:flex w-full lg:w-1/2 justify-center items-center">
          <AuthIllustration
            headline="Talk to your goal. Watch the tracker build itself."
            taskTitle="Close 5 Deals"
            taskSubtitle="3 of 5 Shipped"
            progressPercent={64}
            badgeLabel="On track"
          />
        </div>
      </main>
    </div>
  )
}
