import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Target, Sparkles, Settings } from 'lucide-react'
import { Logo } from '../components/Logo'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFB] dark:bg-[#07141E] bg-dot-grid flex flex-col justify-between font-sans text-[#071E2D] dark:text-slate-100 selection:bg-[#00C4B3] selection:text-[#071E2D] transition-colors">
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 sm:py-8 flex items-center justify-between">
        <Logo linkTo="/dashboard" />
        <Link
          to="/dashboard"
          className="text-xs sm:text-sm font-bold text-[#006D6A] dark:text-[#00C4B3] bg-[#E6F7F5] dark:bg-[#0E202D] hover:bg-[#d0f3ee] dark:hover:bg-[#152E42] border-2 border-[#071E2D] dark:border-[#1E3A52] px-3.5 py-1.5 rounded-full shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </header>

      {/* ── Main Error Showcase ─────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="max-w-2xl w-full flex flex-col items-center">
          {/* Main Card */}
          <div className="w-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_#071E2D] dark:shadow-[8px_8px_0px_#000000] text-center flex flex-col items-center gap-6 relative overflow-hidden transition-colors">
            {/* Ambient decorative badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6F7F5] dark:bg-[#091824] border border-[#00C4B3] dark:border-[#1E3A52] text-[#006D6A] dark:text-[#00C4B3] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#00C4B3] animate-pulse" />
              <span>Route Desynchronized · Error 404</span>
            </div>

            {/* Branded 404 Illustration */}
            <div className="w-full max-w-md py-2">
              <img
                src="/illustrations/undraw_page-not-found_6wni.svg"
                alt="404 Page Not Found Illustration"
                className="w-full h-auto max-h-[260px] object-contain mx-auto hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            {/* Typography */}
            <div className="max-w-lg">
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#071E2D] dark:text-white tracking-tight leading-tight"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Whoops! You're Off Track.
              </h1>
              <p className="text-sm sm:text-base text-[#071E2D]/75 dark:text-slate-300 mt-3 leading-relaxed font-sans">
                The screen or tracker you're searching for took an unexpected detour or doesn't exist. Don't worry — your active streaks, voice logs, and goals are completely safe.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link to="/dashboard" className="btn-pill btn-pill-primary text-base">
                <span>Return to Dashboard</span>
                <span className="btn-bubble">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              <Link to="/" className="btn-pill btn-pill-secondary text-base">
                <span>Go to Home Page</span>
              </Link>
            </div>

            {/* Quick Links Footer within Card */}
            <div className="w-full pt-6 mt-2 border-t border-[#071E2D]/10 dark:border-white/10 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#071E2D]/60 dark:text-slate-400">
              <span className="font-bold text-[#071E2D]/80 dark:text-slate-200">Popular Trails:</span>
              <Link to="/dashboard" className="hover:text-[#006D6A] dark:hover:text-[#00C4B3] underline underline-offset-2 inline-flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#006D6A] dark:text-[#00C4B3]" />
                <span>Trackers Overview</span>
              </Link>
              <span className="text-[#071E2D]/20 dark:text-white/20">•</span>
              <Link to="/onboarding" className="hover:text-[#006D6A] dark:hover:text-[#00C4B3] underline underline-offset-2 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
                <span>New Goal Flow</span>
              </Link>
              <span className="text-[#071E2D]/20 dark:text-white/20">•</span>
              <Link to="/settings" className="hover:text-[#006D6A] dark:hover:text-[#00C4B3] underline underline-offset-2 inline-flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-[#071E2D] dark:text-slate-200" />
                <span>Account Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ── Subtitle Footer ──────────────────────────────────────── */}
      <footer className="w-full text-center py-6 text-xs font-semibold text-[#071E2D]/40 dark:text-slate-500">
        OnTrack · Intelligent Autonomous Goal Tracking
      </footer>
    </div>
  )
}
