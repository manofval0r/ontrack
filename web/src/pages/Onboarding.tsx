import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Code2, Activity, Briefcase, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '../components/Button'
import { CounterTracker } from '../components/trackers/CounterTracker'
import { ChecklistTracker } from '../components/trackers/ChecklistTracker'
import { ManualTracker } from '../components/trackers/ManualTracker'
import type { Goal, GoalItem } from '../types'
import { useGoals } from '../context/GoalContext'

type PersonaKey = 'developer' | 'fitness' | 'sales' | 'student'

interface PersonaInfo {
  id: PersonaKey
  label: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  exampleGoal: string
  illustration: string
  description: string
  tagline: string
}

const PERSONAS: Record<PersonaKey, PersonaInfo> = {
  developer: {
    id: 'developer',
    label: 'Developer',
    category: 'Engineering',
    icon: Code2,
    exampleGoal: 'Ship MVP by Friday & merge 4 PRs',
    illustration: '/illustrations/undraw_deploy-globally_2k9s.svg',
    description: 'Autonomous Git commit logging, PR merge verification, and shipping velocity streaks.',
    tagline: 'Streak: 12 days shipped · PR #42 Merged',
  },
  fitness: {
    id: 'fitness',
    label: 'Fitness',
    category: 'Health',
    icon: Activity,
    exampleGoal: 'Do 50 pushups daily',
    illustration: '/illustrations/undraw_done_erdp.svg',
    description: 'Rep counters, daily exercise streaks, kettlebell weight logs, and rest day pacing.',
    tagline: '14 Days Streak · 50 Pushups Logged',
  },
  sales: {
    id: 'sales',
    label: 'Sales',
    category: 'Business',
    icon: Briefcase,
    exampleGoal: 'Sell 5 enterprise deals this week',
    illustration: '/illustrations/undraw_work-emails_3qkc.svg',
    description: 'Weekly pipeline growth curves, deal closed counters, and quota progression.',
    tagline: '+24% Weekly Pipeline · 4/5 Deals Closed',
  },
  student: {
    id: 'student',
    label: 'Student',
    category: 'Education',
    icon: BookOpen,
    exampleGoal: 'Read 2 books by Friday',
    illustration: '/illustrations/undraw_casual-browsing_c09r.svg',
    description: 'Chapter milestones, book reading targets, study habits, and midterm countdowns.',
    tagline: '2 of 4 Books · Ahead of Midterm Schedule',
  },
}

const LOADING_STATUS_MESSAGES = [
  'Reading your goal…',
  'Figuring out the best way to track it…',
  'Building your tracker…',
]

// Automatic persona detector from natural language
const detectPersonaFromText = (text: string): PersonaKey => {
  const lower = text.toLowerCase()
  if (
    lower.includes('code') ||
    lower.includes('dev') ||
    lower.includes('ship') ||
    lower.includes('git') ||
    lower.includes('pr') ||
    lower.includes('mvp') ||
    lower.includes('bug') ||
    lower.includes('commit') ||
    lower.includes('build')
  ) {
    return 'developer'
  }
  if (
    lower.includes('pushup') ||
    lower.includes('workout') ||
    lower.includes('run') ||
    lower.includes('gym') ||
    lower.includes('fitness') ||
    lower.includes('kg') ||
    lower.includes('mile') ||
    lower.includes('reps')
  ) {
    return 'fitness'
  }
  if (
    lower.includes('car') ||
    lower.includes('deal') ||
    lower.includes('sale') ||
    lower.includes('sell') ||
    lower.includes('revenue') ||
    lower.includes('pipeline') ||
    lower.includes('client')
  ) {
    return 'sales'
  }
  if (
    lower.includes('book') ||
    lower.includes('read') ||
    lower.includes('study') ||
    lower.includes('exam') ||
    lower.includes('chapter') ||
    lower.includes('learn')
  ) {
    return 'student'
  }
  return 'developer'
}

export const Onboarding: React.FC = () => {
  const navigate = useNavigate()
  const { createGoal } = useGoals()

  // Steps: 1 (Welcome) | 2 (State Goal) | 3 (Building transition) | 4 (Your tracker is ready)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedPersona, setSelectedPersona] = useState<PersonaKey>('developer')
  const [goalText, setGoalText] = useState(PERSONAS.developer.exampleGoal)
  const [loadingPhase, setLoadingPhase] = useState<number>(0)
  const [isFinishing, setIsFinishing] = useState(false)

  // Auto-detect persona when user types
  useEffect(() => {
    if (goalText.trim()) {
      const detected = detectPersonaFromText(goalText)
      setSelectedPersona(detected)
    }
  }, [goalText])

  // Compiled goal state for Step 4 payoff
  const [createdGoal, setCreatedGoal] = useState<Goal>({
    id: 'onboarding-initial',
    user_id: 'demo-local',
    title: '',
    description: '',
    goal_type: 'counter',
    target: 5,
    current_value: 0,
    unit: 'units',
    domain: 'general',
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'active',
    created_at: new Date().toISOString().split('T')[0],
    progress_logs: [],
  })

  // Determine tracker label for subheading
  const trackerLabel =
    createdGoal.goal_type === 'counter'
      ? 'counter'
      : createdGoal.goal_type === 'checklist'
      ? 'checklist'
      : 'log'

  // Analyze text and compile the tracker goal
  const compileTrackerFromInput = (rawText: string): Goal => {
    const text = rawText.trim()
    const lower = text.toLowerCase()
    const id = `goal-${Date.now()}`
    const today = new Date().toISOString().split('T')[0]
    const deadline = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]

    // 1. Checklist detection
    if (
      lower.includes('read 2 books') ||
      lower.includes('book') ||
      lower.includes('ship') ||
      lower.includes('task') ||
      lower.includes('steps') ||
      lower.includes('launch') ||
      lower.includes('checklist') ||
      lower.includes('mvp')
    ) {
      let checklistItems: GoalItem[] = [
        { id: `${id}-1`, title: 'Define scope and architecture', completed: false, order: 1 },
        { id: `${id}-2`, title: 'Build core interactive components', completed: false, order: 2 },
        { id: `${id}-3`, title: 'Run static validation and lint suite', completed: false, order: 3 },
        { id: `${id}-4`, title: 'Merge PR and deploy to production', completed: false, order: 4 },
      ]

      if (lower.includes('read') && lower.includes('book')) {
        checklistItems = [
          { id: `${id}-1`, title: 'Pick first book and read chapters 1–5', completed: false, order: 1 },
          { id: `${id}-2`, title: 'Finish first book and summarize key insights', completed: false, order: 2 },
          { id: `${id}-3`, title: 'Start second book and reach halfway point', completed: false, order: 3 },
          { id: `${id}-4`, title: 'Finish second book before Friday cutoff', completed: false, order: 4 },
        ]
      }

      return {
        id,
        user_id: 'demo-local',
        title: text,
        description: `Custom AI checklist tracker built for "${text}".`,
        goal_type: 'checklist',
        target: checklistItems.length,
        current_value: 0,
        unit: 'milestones',
        domain: lower.includes('read') ? 'learning' : 'engineering',
        deadline,
        status: 'active',
        created_at: today,
        items: checklistItems,
        progress_logs: [],
      }
    }

    // 2. Reflection / Manual log detection
    if (
      lower.includes('reflect') ||
      lower.includes('journal') ||
      lower.includes('meditat') ||
      lower.includes('mindset') ||
      lower.includes('log') ||
      lower.includes('habit')
    ) {
      return {
        id,
        user_id: 'demo-local',
        title: text,
        description: `Daily reflection and insight log tracking "${text}".`,
        goal_type: 'manual',
        target: 7,
        current_value: 0,
        unit: 'days',
        domain: 'mindset',
        deadline,
        status: 'active',
        created_at: today,
        progress_logs: [],
      }
    }

    // 3. Counter tracker (numeric / reps / deals / pushups / default)
    let target = 5
    let unit = 'reps'
    let domain: Goal['domain'] = 'general'

    // Extract numbers if present
    const numberMatch = text.match(/\b(\d+)\b/)
    if (numberMatch) {
      target = parseInt(numberMatch[1], 10)
    }

    if (lower.includes('pushup') || lower.includes('run') || lower.includes('workout') || lower.includes('fitness')) {
      unit = 'pushups'
      domain = 'fitness'
      if (!numberMatch) target = 50
    } else if (lower.includes('car') || lower.includes('deal') || lower.includes('sell') || lower.includes('sale') || lower.includes('revenue')) {
      unit = lower.includes('car') ? 'cars' : 'deals'
      domain = 'sales'
      if (!numberMatch) target = 5
    } else if (lower.includes('km') || lower.includes('mile') || lower.includes('step')) {
      unit = lower.includes('km') ? 'km' : lower.includes('mile') ? 'miles' : 'steps'
      domain = 'fitness'
      if (!numberMatch) target = 10
    } else {
      unit = 'units'
    }

    return {
      id,
      user_id: 'demo-local',
      title: text,
      description: `Target counter tracker built for "${text}".`,
      goal_type: 'counter',
      target,
      current_value: 0,
      unit,
      domain,
      deadline,
      status: 'active',
      created_at: today,
      progress_logs: [],
    }
  }

  // Handle submit from Step 2 -> Step 3
  const handleStartBuilding = () => {
    if (!goalText.trim()) return
    const compiled = compileTrackerFromInput(goalText)
    setCreatedGoal(compiled)
    setLoadingPhase(0)
    setCurrentStep(3)
  }

  // Step 3 time-boxed sequential status rotation:
  // "Reading your goal…" (~850ms) -> "Figuring out the best way to track it…" (~900ms) -> "Building your tracker…" (~900ms) -> Step 4
  useEffect(() => {
    if (currentStep !== 3) return

    const timer1 = setTimeout(() => {
      setLoadingPhase(1)
    }, 850)

    const timer2 = setTimeout(() => {
      setLoadingPhase(2)
    }, 1750)

    const timer3 = setTimeout(() => {
      setCurrentStep(4)
    }, 2650)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [currentStep])

  // Handle navigation backwards
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else if (currentStep === 4) {
      setCurrentStep(2)
    }
  }

  // Handle transition out of onboarding (Step 4 -> Dashboard)
  const handleFinishOnboarding = async () => {
    setIsFinishing(true)
    const hasToken = !!localStorage.getItem('ontrack_token')
    if (hasToken) {
      try {
        // POST /api/goals { text: goalText } — backend AI parses the rest
        await createGoal({ text: goalText.trim() || createdGoal.title })
      } catch (e) {
        // Non-fatal: goal creation failure should not block the user from
        // continuing. The goal can be created later from the dashboard.
        console.warn('[Onboarding] Could not persist goal to API:', e)
      }
    }
    localStorage.setItem('ontrack_onboarded', 'true')
    setIsFinishing(false)
    navigate('/dashboard')
  }

  const canGoBack = currentStep === 2 || currentStep === 4
  const activePersonaObj = PERSONAS[selectedPersona]

  return (
    <div className="min-h-screen bg-[#F8FAFB] dark:bg-[#07141E] bg-dot-grid flex flex-col justify-between font-sans text-[#071E2D] dark:text-slate-100 selection:bg-[#00C4B3] selection:text-[#071E2D] transition-colors">
      {/* ── Minimal Top Bar ────────────────────────────────────────── */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 flex items-center justify-between">
        {/* Left: small back arrow (Step 2 and Step 4 only) */}
        {canGoBack ? (
          <button
            type="button"
            onClick={handleBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#071E2D] dark:border-[#1E3A52] bg-white dark:bg-[#0E202D] flex items-center justify-center text-[#071E2D] dark:text-white shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#F3F6F8] dark:hover:bg-[#132B3E] hover:-translate-x-0.5 active:translate-x-0.5 active:shadow-none transition-all cursor-pointer"
            aria-label="Go back to previous step"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        ) : (
          <div className="w-9 h-9 sm:w-10 sm:h-10" aria-hidden="true" />
        )}

        {/* Right: slim progress indicator */}
        <div
          className="flex items-center gap-1.5 sm:gap-2"
          role="progressbar"
          aria-label="Onboarding Progress"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={4}
        >
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep === step
                  ? 'w-7 sm:w-9 bg-[#00C4B3] border border-[#071E2D]'
                  : currentStep > step
                  ? 'w-3 sm:w-4 bg-[#071E2D] dark:bg-[#00C4B3]'
                  : 'w-3 sm:w-4 bg-[#071E2D]/20 dark:bg-white/20'
              }`}
            />
          ))}
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-5 sm:py-10 w-full max-w-4xl mx-auto">
        {/* ======================================================== */}
        {/* STEP 1 — Welcome & Persona Showcase                     */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="w-full flex flex-col items-center text-center max-w-2xl mx-auto animate-fadeIn">
            {/* Dynamic Hero Illustration Card */}
            <div className="relative mb-5 sm:mb-6 w-full max-w-sm sm:max-w-lg">
              <div className="relative p-4 sm:p-6 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl shadow-[6px_6px_0px_#071E2D] dark:shadow-[6px_6px_0px_#000000] hover:-translate-y-1 transition-all flex flex-col items-center">
                <img
                  src={activePersonaObj.illustration}
                  alt={`${activePersonaObj.label} illustration`}
                  className="w-56 sm:w-80 md:w-96 max-w-full h-auto mx-auto object-contain transition-all duration-300"
                />
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#E6F7F5] dark:bg-[#00C4B3]/15 border border-[#00C4B3]/40 rounded-full text-xs font-bold text-[#006D6A] dark:text-[#00C4B3]">
                  <activePersonaObj.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{activePersonaObj.tagline}</span>
                </div>
              </div>
            </div>

            {/* Persona Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-5 sm:mb-6">
              {(Object.keys(PERSONAS) as PersonaKey[]).map((key) => {
                const p = PERSONAS[key]
                const Icon = p.icon
                const isSelected = selectedPersona === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedPersona(key)
                      setGoalText(p.exampleGoal)
                    }}
                    className={`px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#00C4B3] text-[#071E2D] border-[#071E2D] shadow-[2px_2px_0px_#071E2D] scale-105'
                        : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-slate-200 border-[#071E2D]/40 dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#E6F7F5] dark:hover:bg-[#132B3E]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{p.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Heading */}
            <h1
              className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#071E2D] dark:text-white tracking-tight leading-tight px-2"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              You're in. Let's set your first goal.
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base lg:text-lg text-[#071E2D]/75 dark:text-slate-300 mt-3 sm:mt-4 leading-relaxed font-sans max-w-lg px-2">
              Whether you're shipping code, hitting reps, closing deals, or studying — OnTrack builds your tracker instantly from your words.
            </p>

            {/* CTA */}
            <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 w-full px-4 sm:px-0">
              <Button
                variant="primary"
                onClick={() => setCurrentStep(2)}
                className="text-base sm:text-lg px-9 py-3.5 w-full sm:w-auto"
              >
                Let's go
              </Button>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#006D6A] dark:text-[#00C4B3] bg-[#E6F7F5] dark:bg-[#00C4B3]/15 px-3.5 py-1.5 rounded-full border border-[#00C4B3]/40">
                <span className="w-2 h-2 rounded-full bg-[#00C4B3] animate-pulse flex-shrink-0" />
                <span>Zero setup required · Voice or text input</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2 — State your goal                                */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="w-full max-w-3xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-5 sm:mb-8">
              <h2
                className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                What's your goal?
              </h2>
              <p className="text-sm sm:text-base text-[#071E2D]/70 dark:text-slate-300 mt-2 font-medium">
                Type your goal or select a category below.
              </p>
            </div>

            {/* Split layout: stacks on mobile, 2-col on lg */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
              {/* Left Column: Input Form */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                <div>
                  {/* Goal text input */}
                  <div className="w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000] focus-within:dark:border-[#00C4B3] transition-all">
                    <label htmlFor="goal-input" className="block text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3] mb-2">
                      Target or Objective ({activePersonaObj.category})
                    </label>
                    <textarea
                      id="goal-input"
                      rows={3}
                      value={goalText}
                      onChange={(e) => setGoalText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (goalText.trim()) handleStartBuilding()
                        }
                      }}
                      placeholder='Try "Ship MVP by Friday" or "50 pushups a day"'
                      className="w-full bg-transparent font-sans text-base sm:text-lg text-[#071E2D] dark:text-white placeholder:text-[#071E2D]/40 dark:placeholder:text-slate-500 outline-none resize-none leading-relaxed"
                      autoFocus
                    />
                  </div>

                  {/* Preset template chips */}
                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60 dark:text-slate-400 mb-2">
                      Preset templates:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(Object.keys(PERSONAS) as PersonaKey[]).map((key) => {
                        const p = PERSONAS[key]
                        const Icon = p.icon
                        const isCurrent = selectedPersona === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setSelectedPersona(key)
                              setGoalText(p.exampleGoal)
                            }}
                            className={`text-xs font-semibold px-3 py-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-2.5 text-left ${
                              isCurrent
                                ? 'bg-[#00C4B3] text-[#071E2D] border-[#071E2D] shadow-[3px_3px_0px_#071E2D] font-bold'
                                : 'bg-white dark:bg-[#0E202D] text-[#071E2D] dark:text-slate-200 border-[#071E2D]/30 dark:border-[#1E3A52] shadow-[2px_2px_0px_#071E2D] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#E6F7F5] dark:hover:bg-[#152E42]'
                            }`}
                          >
                            <span className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 flex-shrink-0">
                              <Icon className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <span className="block font-bold truncate">{p.exampleGoal}</span>
                              <span className={`text-[10px] ${isCurrent ? 'text-[#071E2D]/80' : 'text-[#006D6A] dark:text-[#00C4B3]'}`}>
                                {p.label}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Build button */}
                <div className="mt-4">
                  <Button
                    variant="primary"
                    disabled={!goalText.trim()}
                    onClick={handleStartBuilding}
                    className="text-base sm:text-lg px-8 py-3.5 w-full sm:w-auto"
                  >
                    Build my tracker
                  </Button>
                </div>
              </div>

              {/* Right Column: Persona Illustration — hidden on mobile, shown on lg */}
              <div className="hidden lg:flex lg:col-span-5 flex-col">
                <div className="h-full bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[5px_5px_0px_#071E2D] dark:shadow-[5px_5px_0px_#000000] flex flex-col items-center justify-between transition-colors">
                  <div className="w-full flex items-center justify-between border-b-2 border-[#071E2D]/10 dark:border-white/10 pb-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3] flex items-center gap-1.5">
                      <activePersonaObj.icon className="w-3.5 h-3.5" />
                      <span>{activePersonaObj.label} Tracker Engine</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#071E2D]/60 dark:text-slate-400 bg-[#F3F6F8] dark:bg-[#07141E] px-2 py-0.5 rounded border border-[#071E2D]/20 dark:border-white/10">
                      Step 2 of 4
                    </span>
                  </div>
                  <img
                    src={activePersonaObj.illustration}
                    alt={`${activePersonaObj.label} Tracker Preview`}
                    className="w-full h-auto object-contain max-w-[270px] my-auto transition-all duration-300"
                  />
                  <div className="w-full text-center bg-[#F8FAFB] dark:bg-[#07141E] border-2 border-[#071E2D]/20 dark:border-[#1E3A52] rounded-xl p-3 mt-3">
                    <span className="text-xs font-bold text-[#071E2D] dark:text-white block">
                      {activePersonaObj.tagline}
                    </span>
                    <p className="text-[11px] text-[#071E2D]/70 dark:text-slate-300 mt-1 leading-snug">
                      {activePersonaObj.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3 — Building (Loading)                             */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="w-full flex flex-col items-center justify-center text-center max-w-lg mx-auto animate-fadeIn py-4 px-2">
            <div className="relative mb-5 sm:mb-6 w-full">
              <div className="p-4 sm:p-6 bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl shadow-[6px_6px_0px_#071E2D] dark:shadow-[6px_6px_0px_#000000] flex flex-col items-center">
                <img
                  src={activePersonaObj.illustration}
                  alt="Building Tracker Progress"
                  className="w-56 sm:w-72 max-w-full h-auto object-contain transition-all duration-300"
                />
                <div className="w-full max-w-xs bg-[#E2E8F0] dark:bg-[#07141E] h-3 sm:h-3.5 rounded-full mt-4 sm:mt-5 border-2 border-[#071E2D] dark:border-[#1E3A52] overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#00C4B3] rounded-full transition-all duration-700 ease-out"
                    style={{ width: loadingPhase === 0 ? '35%' : loadingPhase === 1 ? '70%' : '98%' }}
                  />
                </div>
              </div>
            </div>
            <div className="h-9 sm:h-10 flex items-center justify-center px-4">
              <p
                key={loadingPhase}
                className="text-lg sm:text-2xl font-extrabold text-[#071E2D] dark:text-white tracking-tight animate-fadeIn"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {LOADING_STATUS_MESSAGES[loadingPhase]}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-[#006D6A] dark:text-[#00C4B3] font-bold mt-1 px-4">
              Configuring {activePersonaObj.label} Tracker for "{createdGoal.title || goalText}"
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4 — Your tracker is ready                         */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 sm:gap-6 animate-fadeIn">
            {/* Payoff Header Card */}
            <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl p-4 sm:p-6 shadow-[6px_6px_0px_#071E2D] dark:shadow-[6px_6px_0px_#000000] flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <img
                src={activePersonaObj.illustration}
                alt="Tracker Ready Payoff"
                className="w-28 sm:w-40 h-auto object-contain shrink-0"
              />
              <div className="text-center sm:text-left flex-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#006D6A] dark:text-[#00C4B3] bg-[#E6F7F5] dark:bg-[#00C4B3]/15 px-2.5 py-1 rounded-full border border-[#00C4B3]/40 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{activePersonaObj.label} Tracker Configured</span>
                </span>
                <h2
                  className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#071E2D] dark:text-white tracking-tight"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  Your tracker is ready!
                </h2>
                <p className="text-xs sm:text-sm text-[#071E2D]/75 dark:text-slate-300 mt-1.5 font-medium leading-relaxed">
                  We built a <span className="font-bold text-[#006D6A] dark:text-[#00C4B3]">{trackerLabel}</span> tracker for:{' '}
                  <span className="font-bold text-[#071E2D] dark:text-white">"{createdGoal.title}"</span>
                </p>
              </div>
            </div>

            {/* Live Interactive Tracker */}
            <div className="w-full">
              {createdGoal.goal_type === 'counter' && (
                <CounterTracker goal={createdGoal} onUpdate={async (val) => setCreatedGoal((prev) => ({ ...prev, current_value: val }))} />
              )}
              {createdGoal.goal_type === 'checklist' && (
                <ChecklistTracker goal={createdGoal} onUpdateItems={async (items) => setCreatedGoal((prev) => ({ ...prev, items }))} />
              )}
              {createdGoal.goal_type === 'manual' && (
                <ManualTracker
                  goal={createdGoal}
                  onLogReflection={async (ref, sent) => {
                    setCreatedGoal((prev) => ({
                      ...prev,
                      progress_logs: [{ id: `log-${Date.now()}`, goal_id: prev.id, value: sent, note: ref, timestamp: 'Just now' }],
                    }))
                  }}
                />
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-3 mt-1 px-4 sm:px-0">
              <Button
                variant="primary"
                onClick={handleFinishOnboarding}
                disabled={isFinishing}
                className="text-base sm:text-lg px-9 py-3.5 w-full sm:w-auto"
              >
                {isFinishing ? 'Entering Dashboard…' : 'Start tracking'}
              </Button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs sm:text-sm font-semibold text-[#071E2D]/60 dark:text-slate-400 hover:text-[#071E2D] dark:hover:text-white underline underline-offset-4 decoration-[#071E2D]/30 hover:decoration-[#071E2D] transition-colors cursor-pointer"
              >
                Not quite right? Try a different goal
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom spacer */}
      <div className="w-full pb-4 sm:pb-6" aria-hidden="true" />
    </div>
  )
}

