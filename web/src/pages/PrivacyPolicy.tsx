import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Lock, EyeOff, Mic, Database, KeyRound, UserCheck, ArrowLeft, ArrowRight } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Logo } from '../components/Logo'

export const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const lastUpdated = 'September 28, 2026'

  const sections = [
    {
      id: 'commitment',
      icon: ShieldCheck,
      title: '1. Our Privacy Commitment',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            At <strong>OnTrack</strong>, we believe radical personal accountability requires uncompromising personal privacy.
            When you trust us with your ambitious goals, honest check-ins, habit reflections, and progress struggles, that data belongs exclusively to you.
          </p>
          <p className="leading-relaxed">
            We do not sell, rent, monetize, or broker your personal information or goal logs. Our business model is centered on providing a world-class productivity and accountability workspace—not selling user telemetry or training third-party advertisement networks.
          </p>
        </>
      ),
    },
    {
      id: 'collection',
      icon: Database,
      title: '2. Information We Collect',
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">
            We collect only the essential information necessary to build your adaptive trackers and deliver personalized coaching:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm text-[#071E2D]/80 dark:text-slate-300">
            <li><strong>Account Data:</strong> Your name, email address, password hash, and chosen accountability persona (stored securely via Supabase Authentication).</li>
            <li><strong>Goal & Progress Logs:</strong> The goal descriptions you submit, target deadlines, milestones, counter increments, checklist items, and reflection notes.</li>
            <li><strong>Integration Tokens:</strong> Scoped OAuth tokens when you choose to connect third-party platforms such as GitHub or Google Calendar.</li>
            <li><strong>Session & Device Context:</strong> Your local timezone (to deliver check-ins and deadline countdowns accurately) and interface preferences (such as Dark/Light mode).</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'voice-speech',
      icon: Mic,
      title: '3. Voice Dictation & Audio Processing',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            OnTrack provides voice dictation to let you speak your goals and notes naturally. Here is how your audio is handled:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm text-[#071E2D]/80 dark:text-slate-300">
            <li><strong>Browser-Level Speech Recognition:</strong> We utilize modern browser Speech APIs (e.g. Web Speech Recognition). Dictation is transcribed in real-time on your client device or through your operating system's standard speech recognition pipeline.</li>
            <li><strong>No Voiceprint Retention:</strong> We never record, harvest, or store biometric voiceprints. Once speech is transcribed to text in your input bar, the microphone stream is immediately terminated.</li>
            <li><strong>Explicit Permission:</strong> Your microphone is accessed only when you deliberately click the record button. You may revoke microphone access at any time through your browser's site settings.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'ai-models',
      icon: Lock,
      title: '4. AI Coach & Language Model Processing',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            When you describe a goal or interact with the coach chat, your prompt is analyzed to structure milestones and choose an adaptive tracker format (Counter, Checklist, or Manual Reflection).
          </p>
          <p className="leading-relaxed">
            Your conversational goal descriptions and reflection entries are processed solely to generate your dynamic trackers, feedback, and verdicts. <strong>We do not use your private goals or journal reflections to train public or foundational AI models.</strong>
          </p>
        </>
      ),
    },
    {
      id: 'integrations',
      icon: KeyRound,
      title: '5. Third-Party Integrations & OAuth',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            If you connect external services to automate accountability:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm text-[#071E2D]/80 dark:text-slate-300">
            <li><strong>GitHub:</strong> We request read-only permissions to identify commits, pull requests, and closed issues associated with your engineering goals. We never modify code repositories or write to your repositories.</li>
            <li><strong>Google Calendar:</strong> We request calendar event access strictly to schedule milestone reminders and deadline check-ins that you approve.</li>
            <li><strong>Token Security:</strong> Third-party tokens are scoped to the minimum required privileges and can be disconnected with a single click from the Integrations panel.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'retention-rights',
      icon: UserCheck,
      title: '6. Your Rights & Data Deletion',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            You retain absolute ownership of your accountability history:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm text-[#071E2D]/80 dark:text-slate-300">
            <li><strong>Export:</strong> You can view and copy your goals, milestone progress, and reflection history at any time.</li>
            <li><strong>Permanent Deletion:</strong> You can delete individual goals, trackers, or your entire account directly from your dashboard settings. Upon deletion, all associated progress logs and credentials are purged from our database.</li>
            <li><strong>Zero Tracking Cookies:</strong> We do not deploy cross-site tracking pixels or commercial ad retargeting cookies.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'contact',
      icon: EyeOff,
      title: '7. Contacting Us',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            If you have questions, feedback, or concerns regarding your privacy or data handling on OnTrack, please contact our team:
          </p>
          <div className="p-4 rounded-xl bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-sm text-sm">
            <p className="font-bold text-[#071E2D] dark:text-white">OnTrack Privacy Team</p>
            <p className="text-[#071E2D]/70 dark:text-slate-300">Email: <a href="mailto:privacy@ontrack.app" className="text-[#006D6A] dark:text-[#00C4B3] font-bold hover:underline">privacy@ontrack.app</a></p>
            <p className="text-xs text-[#071E2D]/50 dark:text-slate-400 mt-1">Response time: within 48 business hours.</p>
          </div>
        </>
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFB] dark:bg-[#07141E] text-[#071E2D] dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Ontrack Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-10 sm:mb-12 pb-6 border-b-2 border-[#071E2D]/10 dark:border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFEFF] dark:bg-[#00C4B3]/15 border-2 border-[#00C4B3] text-[#006D6A] dark:text-[#00C4B3] font-sans font-bold text-xs mb-3 shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy & Data Sovereignty</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight text-[#071E2D] dark:text-white mb-3"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Privacy Policy
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#071E2D]/70 dark:text-slate-300 leading-relaxed max-w-2xl">
            We built OnTrack to be your honest accountability partner. That starts with complete transparency about how your data is protected and kept private.
          </p>

          <p className="text-xs font-mono text-[#071E2D]/50 dark:text-slate-400 mt-3">
            Last updated: {lastUpdated} · Effective immediately
          </p>
        </div>

        {/* Policy Section Cards */}
        <div className="flex flex-col gap-6">
          {sections.map((sec) => {
            const Icon = sec.icon
            return (
              <section
                key={sec.id}
                id={sec.id}
                className="p-6 sm:p-8 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl shadow-[4px_4px_0px_#071E2D] dark:shadow-[4px_4px_0px_#000000] transition-colors"
              >
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#071E2D]/10 dark:border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-[#ECFEFF] dark:bg-[#00C4B3]/15 border-2 border-[#071E2D] dark:border-[#1E3A52] flex items-center justify-center text-[#006D6A] dark:text-[#00C4B3] shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2
                    className="text-lg sm:text-xl font-bold text-[#071E2D] dark:text-white"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    {sec.title}
                  </h2>
                </div>

                <div className="font-sans text-sm text-[#071E2D]/85 dark:text-slate-200">
                  {sec.content}
                </div>
              </section>
            )
          })}
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-12 p-6 sm:p-8 bg-[#071E2D] dark:bg-[#0A1A27] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl text-white shadow-[6px_6px_0px_#00C4B3] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Ready to focus on follow-through?
            </h3>
            <p className="text-xs sm:text-sm text-white/70">
              Your goals stay private. Your progress stays on track.
            </p>
          </div>
          <Link
            to="/signup"
            className="btn-pill btn-pill-primary text-xs sm:text-sm py-2.5 px-6 whitespace-nowrap"
          >
            <span>Start Tracking Free</span>
            <span className="btn-bubble bg-white text-[#006D6A]">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#06121B] border-t-2 border-[#071E2D]/10 dark:border-white/10 py-10 px-4 sm:px-6 transition-colors mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#071E2D]/60 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <Logo />
            <span>© 2026 Ontrack. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms-of-service" className="hover:text-[#071E2D] dark:hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="font-bold text-[#071E2D] dark:text-white hover:underline">
              Privacy Policy
            </Link>
            <Link to="/login" className="hover:text-[#071E2D] dark:hover:text-white transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="hover:text-[#071E2D] dark:hover:text-white transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
