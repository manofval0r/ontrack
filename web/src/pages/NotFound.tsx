import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFB] bg-dot-grid flex flex-col font-sans text-[#071E2D]">
      <header className="p-6">
        <Logo linkTo="/dashboard" />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border-2 border-[#071E2D] rounded-3xl p-8 sm:p-12 shadow-[6px_6px_0px_#071E2D] text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#ECFEFF] border-2 border-[#071E2D] shadow-[3px_3px_0px_#071E2D] flex items-center justify-center text-3xl">
            🧭
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006D6A] block mb-1">
              Error 404
            </span>
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-[#071E2D] tracking-tight"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Looks like you're Off Track!
            </h1>
            <p className="text-sm text-[#071E2D]/70 mt-3 leading-relaxed">
              The screen you are looking for doesn't exist or has moved. Let's get you back to your active goals and trackers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link to="/dashboard" className="btn-pill btn-pill-primary">
              <span>Return to Dashboard</span>
              <span className="btn-bubble">→</span>
            </Link>
            <Link to="/" className="btn-pill btn-pill-secondary">
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
