import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, Scale, Cpu, KeyRound, UserCheck, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Logo } from '../components/Logo'

export const TermsOfService: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const lastUpdated = 'September 28, 2026'

  const sections = [
    {
      id: 'acceptance',
      icon: Scale,
      title: '1. Acceptance of Terms',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            Welcome to <strong>OnTrack</strong> (&ldquo;Ontrack&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By creating an account, browsing our website, connecting integrations, or using any of our goal tracking and AI accountability services, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;).
          </p>
          <p className="leading-relaxed">
            If you do not agree to these Terms, you must not access or use OnTrack. If you are using OnTrack on behalf of an organization, team, or company, you represent that you have authority to bind that entity to these Terms.
          </p>
        </>
      ),
    },
    {
      id: 'services',
      icon: Cpu,
      title: '2. The OnTrack Services & Personas',
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">
            OnTrack provides an intelligent, adaptive goal-tracking workspace designed to transform high-level intentions into measurable daily execution. Features include:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm text-[#071E2D]/80 dark:text-slate-300">
            <li><strong>AI Goal Breakdown:</strong> Natural language parsing to convert user prompts into milestone checklists, counter increments, or reflection trackers.</li>
            <li><strong>Accountability Personas:</strong> Configurable coaching feedback tones (e.g. Supportive Mentor, No-Excuses Drill Sergeant, Analytical Strategist) tailored to your preferred motivation style.</li>
            <li><strong>Voice Dictation:</strong> Client-side speech-to-text input to log notes, check-ins, and goals seamlessly without manual typing.</li>
            <li><strong>Integrations:</strong> Connectors (such as GitHub and Google Calendar) to sync real-world progress with your trackers.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'accounts',
      icon: UserCheck,
      title: '3. User Accounts & Security',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            To use the full capabilities of OnTrack, you must register for an account. When creating an account, you agree to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm text-[#071E2D]/80 dark:text-slate-300">
            <li>Provide accurate, current, and complete registration information.</li>
            <li>Maintain the confidentiality of your credentials and restrict unauthorized access to your account.</li>
            <li>Promptly notify us at <a href="mailto:support@ontrack.app" className="text-[#006D6A] dark:text-[#00C4B3] font-bold hover:underline">support@ontrack.app</a> if you discover or suspect any security breach or unauthorized use of your account.</li>
            <li>Accept responsibility for all activities that occur under your account credentials.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'conduct',
      icon: ShieldCheck,
      title: '4. Acceptable Use & Conduct',
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">
            We are dedicated to maintaining a focused, productive, and safe platform for all goal-achievers. You agree NOT to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm text-[#071E2D]/80 dark:text-slate-300">
            <li>Use OnTrack for any unlawful, fraudulent, or harmful purposes, or to promote illegal activities.</li>
            <li>Attempt to probe, scan, or compromise our infrastructure, bypass authentication, or reverse-engineer the platform.</li>
            <li>Scrape, spider, crawl, or harvest data or service endpoints without our express written permission.</li>
            <li>Submit malicious software, viruses, or automated scripts designed to overload or disrupt our APIs.</li>
            <li>Harass, abuse, or impersonate other users, or submit abusive prompts intended to circumvent safety guardrails.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'ai-disclaimer',
      icon: AlertTriangle,
      title: '5. AI Coach Guidance & Advice Disclaimer',
      content: (
        <>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 mb-3 text-amber-900 dark:text-amber-200">
            <p className="font-semibold text-xs uppercase tracking-wider mb-1">Important Notice</p>
            <p className="text-xs leading-relaxed">
              OnTrack&rsquo;s AI Coach and automated milestone assessments are provided solely for personal productivity, time management, and habit-tracking guidance. They do not constitute certified medical, psychiatric, financial, or legal advice.
            </p>
          </div>
          <p className="leading-relaxed">
            You maintain sole responsibility for evaluating and verifying any advice, workout regimens, business plans, or schedules suggested by the AI coach. Never disregard professional advice or delay seeking medical or legal assistance because of information generated by OnTrack.
          </p>
        </>
      ),
    },
    {
      id: 'voice-usage',
      icon: CheckCircle2,
      title: '6. Voice Dictation & Audio Usage',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            OnTrack provides voice dictation for convenience. You agree and understand that:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm text-[#071E2D]/80 dark:text-slate-300">
            <li>Microphone access is explicitly activated only when you choose to click the microphone icon.</li>
            <li>Speech transcription runs through standard browser and operating system speech recognition APIs.</li>
            <li>You must not record third parties without their knowledge and consent where required by applicable wiretapping or privacy laws.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'integrations',
      icon: KeyRound,
      title: '7. Third-Party Integrations',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            When you connect external accounts (such as GitHub or Google Calendar):
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm text-[#071E2D]/80 dark:text-slate-300">
            <li>You authorize OnTrack to interact with those services under the specific permissions requested during OAuth authorization.</li>
            <li>Your use of those external platforms remains governed by their respective terms of service and privacy policies.</li>
            <li>OnTrack is not responsible for outages, API deprecations, rate limits, or account suspensions initiated by external platform providers.</li>
            <li>You may revoke integration tokens at any time through your OnTrack Integrations settings.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'ip-ownership',
      icon: FileText,
      title: '8. Intellectual Property & Your Content',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            <strong>Your Data is Yours:</strong> You retain complete ownership of all goals, notes, reflections, checklist tasks, and media you submit to OnTrack (&ldquo;User Content&rdquo;). We do not claim ownership of your personal aspirations or habit logs.
          </p>
          <p className="leading-relaxed mb-3">
            <strong>License to Operate:</strong> You grant OnTrack a limited, worldwide, non-exclusive license to host, display, and process your User Content solely to the extent necessary to provide and operate the service for you.
          </p>
          <p className="leading-relaxed">
            <strong>OnTrack Property:</strong> The OnTrack brand, logos, software, website design, UI components, code, and documentation are the exclusive intellectual property of OnTrack and protected by copyright, trademark, and other applicable laws.
          </p>
        </>
      ),
    },
    {
      id: 'termination',
      icon: ShieldCheck,
      title: '9. Cancellation & Account Termination',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            You may stop using OnTrack and request complete deletion of your account and personal data at any time from your account settings or by contacting <a href="mailto:support@ontrack.app" className="text-[#006D6A] dark:text-[#00C4B3] font-bold hover:underline">support@ontrack.app</a>.
          </p>
          <p className="leading-relaxed">
            We reserve the right to suspend or terminate your access to OnTrack if we reasonably determine you have violated these Terms, engaged in fraudulent or abusive behavior, or created security risks for other users or our infrastructure.
          </p>
        </>
      ),
    },
    {
      id: 'liability',
      icon: Scale,
      title: '10. Limitation of Liability & "As Is" Warranty',
      content: (
        <>
          <p className="leading-relaxed mb-3 uppercase text-xs font-bold text-[#071E2D]/70 dark:text-slate-300 tracking-wider">
            Disclaimer of Warranties
          </p>
          <p className="leading-relaxed mb-3">
            OnTrack is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express, implied, statutory, or otherwise. We do not guarantee uninterrupted, bug-free, or error-free operation.
          </p>
          <p className="leading-relaxed">
            To the maximum extent permitted by law, OnTrack and its creators, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or missed deadlines resulting from your use of or inability to use the service.
          </p>
        </>
      ),
    },
    {
      id: 'changes',
      icon: HelpCircle,
      title: '11. Changes to Terms',
      content: (
        <>
          <p className="leading-relaxed mb-3">
            We may update these Terms periodically to reflect product evolutions, legal requirements, or new features. When changes are made, we will update the &ldquo;Last updated&rdquo; date at the top of this document.
          </p>
          <p className="leading-relaxed">
            For material changes, we may notify you via email or an announcement banner within your dashboard. Continued use of OnTrack following any revisions signifies your acceptance of the updated Terms.
          </p>
        </>
      ),
    },
    {
      id: 'contact',
      icon: HelpCircle,
      title: '12. Governing Law & Contact Information',
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">
            These Terms are governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to conflict of law principles.
          </p>
          <div className="p-4 rounded-xl bg-[#F8FAFB] dark:bg-[#07141E] border border-[#071E2D]/10 dark:border-white/10 text-xs sm:text-sm">
            <p className="font-bold text-[#071E2D] dark:text-white mb-1">OnTrack Legal & Compliance Team</p>
            <p className="text-[#071E2D]/70 dark:text-slate-300">
              General Inquiries:{' '}
              <a href="mailto:support@ontrack.app" className="text-[#006D6A] dark:text-[#00C4B3] font-bold hover:underline">
                support@ontrack.app
              </a>
            </p>
            <p className="text-[#071E2D]/70 dark:text-slate-300">
              Legal & Terms:{' '}
              <a href="mailto:legal@ontrack.app" className="text-[#006D6A] dark:text-[#00C4B3] font-bold hover:underline">
                legal@ontrack.app
              </a>
            </p>
          </div>
        </div>
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
            <Scale className="w-3.5 h-3.5" />
            <span>Terms &amp; User Agreement</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight text-[#071E2D] dark:text-white mb-3"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Terms of Service
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#071E2D]/70 dark:text-slate-300 leading-relaxed max-w-2xl">
            Please read these terms carefully before using OnTrack. They define our mutual commitments, rights, and responsible usage guidelines.
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
              Clear rules, private data, real accountability.
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
            <Link to="/terms-of-service" className="font-bold text-[#071E2D] dark:text-white hover:underline">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="hover:text-[#071E2D] dark:hover:text-white transition-colors">
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
