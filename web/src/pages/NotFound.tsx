import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFB] bg-dot-grid flex flex-col justify-between font-sans text-[#071E2D] selection:bg-[#00C4B3] selection:text-[#071E2D]">
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 sm:py-8 flex items-center justify-between">
        <Logo linkTo="/dashboard" />
        <Link
          to="/dashboard"
          className="text-xs sm:text-sm font-bold text-[#006D6A] bg-[#E6F7F5] hover:bg-[#d0f3ee] border border-[#00C4B3] px-3.5 py-1.5 rounded-full shadow-[2px_2px_0px_#071E2D] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
      </header>

      {/* ── Main Error Showcase ─────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="max-w-2xl w-full flex flex-col items-center">
          {/* Main Card */}
          <div className="w-full bg-white border-2 border-[#071E2D] rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_#071E2D] text-center flex flex-col items-center gap-6 relative overflow-hidden">
            {/* Ambient decorative badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6F7F5] border border-[#00C4B3] text-[#006D6A] text-xs font-bold uppercase tracking-wider">
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
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#071E2D] tracking-tight leading-tight"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Whoops! You're Off Track.
              </h1>
              <p className="text-sm sm:text-base text-[#071E2D]/75 mt-3 leading-relaxed font-sans">
                The screen or tracker you're searching for took an unexpected detour or doesn't exist. Don't worry — your active streaks, voice logs, and goals are completely safe.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link to="/dashboard" className="btn-pill btn-pill-primary text-base">
                <span>Return to Dashboard</span>
                <span className="btn-bubble">→</span>
              </Link>
              <Link to="/" className="btn-pill btn-pill-secondary text-base">
                <span>Go to Home Page</span>
              </Link>
            </div>

            {/* Quick Links Footer within Card */}
            <div className="w-full pt-6 mt-2 border-t border-[#071E2D]/10 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#071E2D]/60">
              <span className="font-bold text-[#071E2D]/80">Popular Trails:</span>
              <Link to="/dashboard" className="hover:text-[#006D6A] underline underline-offset-2">
                🎯 Trackers Overview
              </Link>
              <span className="text-[#071E2D]/20">•</span>
              <Link to="/onboarding" className="hover:text-[#006D6A] underline underline-offset-2">
                ✨ New Goal Flow
              </Link>
              <span className="text-[#071E2D]/20">•</span>
              <Link to="/settings" className="hover:text-[#006D6A] underline underline-offset-2">
                ⚙️ Account Settings
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ── Subtitle Footer ──────────────────────────────────────── */}
      <footer className="w-full text-center py-6 text-xs font-semibold text-[#071E2D]/40">
        OnTrack · Intelligent Autonomous Goal Tracking
      </footer>
    </div>
  )
}
