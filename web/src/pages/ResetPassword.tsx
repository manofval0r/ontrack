import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { AuthIllustration } from '../components/AuthIllustration'

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00C4B3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const AlertCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') || 'https://destcakvqdzhkzemdugo.supabase.co'
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'sb_publishable_kT5JCbb2BFocdW23HIJYfw_jk879gsk'

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [tokenChecked, setTokenChecked] = useState(false)

  useEffect(() => {
    // Look for token in hash or search params or localStorage
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
    const search = window.location.search.startsWith('?') ? window.location.search.slice(1) : ''
    const hashParams = new URLSearchParams(hash)
    const searchParams = new URLSearchParams(search)

    const access =
      hashParams.get('access_token') ||
      searchParams.get('access_token') ||
      localStorage.getItem('ontrack_recovery_token') ||
      localStorage.getItem('ontrack_token')

    if (access && !access.startsWith('mock_')) {
      setToken(access)
    }
    setTokenChecked(true)
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.')
      return
    }

    if (!token) {
      setAuthError('Reset token missing or expired. Please request a new password reset link.')
      return
    }

    setSubmitting(true)

    try {
      if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-project')) {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        })

        const data = await res.json()

        if (!res.ok) {
          setAuthError(data.error_description ?? data.msg ?? data.message ?? 'Failed to update password. Link may have expired.')
          return
        }

        // Clean up recovery token
        localStorage.removeItem('ontrack_recovery_token')
        setSuccess(true)
      } else {
        // Dev fallback
        setSuccess(true)
      }
    } catch {
      setAuthError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] dark:bg-[#07141E] bg-dot-grid flex flex-col font-sans text-[#071E2D] dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 lg:py-12 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-16">
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-[420px] flex flex-col">
            {/* Success state */}
            {success ? (
              <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D]/20 dark:border-[#1E3A52] rounded-[28px] p-8 shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#00C4B3]/15 flex items-center justify-center mb-4">
                  <CheckCircleIcon />
                </div>
                <h1
                  className="text-2xl font-bold text-[#071E2D] dark:text-white mb-2"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  Password updated!
                </h1>
                <p className="text-sm text-[#071E2D]/70 dark:text-slate-300 mb-6 leading-relaxed">
                  Your password has been changed successfully. You can now log in to your account with your new credentials.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 px-6 rounded-full bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] font-sans font-semibold text-base transition-all duration-150 hover:-translate-y-0.5 shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] cursor-pointer"
                >
                  Proceed to log in
                </button>
              </div>
            ) : tokenChecked && !token ? (
              /* Missing or invalid token state */
              <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D]/20 dark:border-[#1E3A52] rounded-[28px] p-8 shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-4">
                  <AlertCircleIcon />
                </div>
                <h1
                  className="text-2xl font-bold text-[#071E2D] dark:text-white mb-2"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  Invalid or expired link
                </h1>
                <p className="text-sm text-[#071E2D]/70 dark:text-slate-300 mb-6 leading-relaxed">
                  This password reset link is invalid or has expired. Please request a fresh reset link from the log in page.
                </p>
                <Link
                  to="/login?forgot=true"
                  className="w-full py-3.5 px-6 rounded-full bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] font-sans font-semibold text-base text-center transition-all duration-150 hover:-translate-y-0.5 shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000]"
                >
                  Request new reset link
                </Link>
              </div>
            ) : (
              /* Password reset form */
              <>
                <div className="mb-8">
                  <h1
                    className="text-[#071E2D] dark:text-white tracking-tight leading-tight"
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontWeight: 700,
                      fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
                    }}
                  >
                    Reset your password
                  </h1>
                  <p className="text-sm text-[#071E2D]/60 dark:text-slate-400 mt-2">
                    Enter and confirm your new password below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="password"
                      className="text-xs font-bold text-[#071E2D] dark:text-slate-200 uppercase tracking-wider pl-1"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="At least 8 characters"
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
                  </div>

                  {/* Confirm New Password */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <label
                      htmlFor="confirm-password"
                      className="text-xs font-bold text-[#071E2D] dark:text-slate-200 uppercase tracking-wider pl-1"
                    >
                      Confirm new password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Re-enter your new password"
                        className="w-full px-5 py-3.5 pr-12 rounded-full border-2 border-[#071E2D]/20 dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] focus:border-[#00C4B3] dark:focus:border-[#00C4B3] font-sans text-sm text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 outline-none transition-colors shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#071E2D]/40 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white p-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {/* Error display */}
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

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-3 py-3.5 px-6 rounded-full bg-[#071E2D] dark:bg-[#00C4B3] text-white dark:text-[#071E2D] font-sans font-semibold text-base transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0.5 shadow-[3px_3px_0px_#071E2D] dark:shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#071E2D] dark:hover:shadow-[5px_5px_0px_#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B3] focus-visible:ring-offset-2 flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Updating password…' : 'Update password'}
                  </button>

                  <div className="text-center mt-4">
                    <Link
                      to="/login"
                      className="text-xs font-semibold text-[#006D6A] dark:text-[#00C4B3] hover:underline"
                    >
                      Back to log in
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Illustration */}
        <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center">
          <AuthIllustration
            headline="Secure your account. Keep crushing your goals."
            taskTitle="Account Security"
            taskSubtitle="Password Protected"
            progressPercent={100}
            badgeLabel="Secure"
          />
        </div>
      </main>
    </div>
  )
}
