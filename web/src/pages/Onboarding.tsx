import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { CounterTracker } from '../components/trackers/CounterTracker'
import { ChecklistTracker } from '../components/trackers/ChecklistTracker'
import { ManualTracker } from '../components/trackers/ManualTracker'
import type { Goal, GoalItem } from '../types'
import { useGoals } from '../context/GoalContext'

const EXAMPLE_CHIPS = [
  { label: 'Sell 5 cars this week', category: 'Sales', icon: '🚗' },
  { label: 'Read 2 books by Friday', category: 'Learning', icon: '📚' },
  { label: 'Do 50 pushups daily', category: 'Fitness', icon: '💪' },
  { label: 'Ship MVP by Friday', category: 'Dev', icon: '🚀' },
]

const LOADING_STATUS_MESSAGES = [
  'Reading your goal…',
  'Figuring out the best way to track it…',
  'Building your tracker…',
]

export const Onboarding: React.FC = () => {
  const navigate = useNavigate()
  const { createGoal } = useGoals()

  // Steps: 1 (Welcome) | 2 (State Goal) | 3 (Building transition) | 4 (Your tracker is ready)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [goalText, setGoalText] = useState('')
  const [loadingPhase, setLoadingPhase] = useState<number>(0)
  const [isFinishing, setIsFinishing] = useState(false)

  // Compiled goal state for Step 4 payoff
  const [createdGoal, setCreatedGoal] = useState<Goal>({
    id: 'onboarding-initial',
    user_id: 'user-israel',
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
        { id: `${id}-1`, title: 'Define scope and gather resources', completed: false, order: 1 },
        { id: `${id}-2`, title: 'Complete first phase milestones', completed: false, order: 2 },
        { id: `${id}-3`, title: 'Hit the midpoint benchmark', completed: false, order: 3 },
        { id: `${id}-4`, title: 'Review and wrap up final deliverables', completed: false, order: 4 },
      ]

      if (lower.includes('read') && lower.includes('book')) {
        checklistItems = [
          { id: `${id}-1`, title: 'Pick first book and read chapters 1–5', completed: false, order: 1 },
          { id: `${id}-2`, title: 'Finish first book and capture core notes', completed: false, order: 2 },
          { id: `${id}-3`, title: 'Start second book and reach halfway point', completed: false, order: 3 },
          { id: `${id}-4`, title: 'Finish second book before Friday cutoff', completed: false, order: 4 },
        ]
      }

      return {
        id,
        user_id: 'user-israel',
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
        user_id: 'user-israel',
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
      user_id: 'user-israel',
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
    try {
      await createGoal(createdGoal)
    } catch (e) {
      console.error('Error creating onboarding goal in context:', e)
    } finally {
      localStorage.setItem('ontrack_onboarded', 'true')
      setIsFinishing(false)
      navigate('/dashboard')
    }
  }

  const canGoBack = currentStep === 2 || currentStep === 4

  return (
    <div className="min-h-screen bg-[#F8FAFB] bg-dot-grid flex flex-col justify-between font-sans text-[#071E2D] selection:bg-[#00C4B3] selection:text-[#071E2D]">
      {/* ── Minimal Top Bar ────────────────────────────────────────── */}
      {/* Rule: NO main site navigation bar, NO logo linking home, NO marketing links, NO login/signup */}
      {/* Contains ONLY: small back arrow (if step allows) and slim progress indicator */}
      <header className="w-full max-w-4xl mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-between">
        {/* Left: small back arrow (Step 2 and Step 4 only) */}
        {canGoBack ? (
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-full border-2 border-[#071E2D] bg-white flex items-center justify-center text-[#071E2D] shadow-[2px_2px_0px_#071E2D] hover:bg-[#F3F6F8] hover:-translate-x-0.5 active:translate-x-0.5 active:shadow-none transition-all cursor-pointer"
            aria-label="Go back to previous step"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        ) : (
          <div className="w-10 h-10" aria-hidden="true" />
        )}

        {/* Right: slim visual progress indicator (dots / line segments — NO numbered text) */}
        <div
          className="flex items-center gap-2"
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
                  ? 'w-9 bg-[#00C4B3] border border-[#071E2D]'
                  : currentStep > step
                  ? 'w-4 bg-[#071E2D]'
                  : 'w-4 bg-[#071E2D]/15'
              }`}
            />
          ))}
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10 w-full max-w-4xl mx-auto">
        {/* ======================================================== */}
        {/* STEP 1 — Welcome                                        */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="w-full flex flex-col items-center text-center max-w-xl mx-auto animate-fadeIn">
            {/* Illustration Hero Card */}
            <div className="relative mb-8 group">
              <div className="absolute -inset-3 bg-[#00C4B3]/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 sm:p-6 bg-white border-2 border-[#071E2D] rounded-3xl shadow-[6px_6px_0px_#071E2D] hover:-translate-y-1 transition-all">
                <img
                  src="/illustrations/step-1.svg"
                  alt="Say your goal illustration"
                  className="w-72 sm:w-88 max-w-full h-auto mx-auto object-contain"
                />
              </div>
            </div>

            {/* Heading */}
            <h1
              className="text-3xl sm:text-5xl font-extrabold text-[#071E2D] tracking-tight leading-tight"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              You're in. Let's set your first goal.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[#071E2D]/75 mt-3 sm:mt-4 leading-relaxed font-sans max-w-md">
              Say it however you'd say it out loud. We'll figure out the rest.
            </p>

            {/* Single button: Let's go */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                variant="primary"
                onClick={() => setCurrentStep(2)}
                className="text-base sm:text-lg px-9 py-3.5"
              >
                Let's go
              </Button>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#006D6A] bg-[#E6F7F5] px-3.5 py-1.5 rounded-full border border-[#00C4B3]/40">
                <span className="w-2 h-2 rounded-full bg-[#00C4B3] animate-pulse" />
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
            <div className="text-center mb-6 sm:mb-8">
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#071E2D] tracking-tight"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                What's your goal?
              </h2>
              <p className="text-sm sm:text-base text-[#071E2D]/70 mt-2 font-medium">
                Type your goal in plain English — our AI compiles it into an adaptive tracker.
              </p>
            </div>

            {/* Split layout: Input Column + AI Auto-Builder Illustration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Input Form (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  {/* Large Chat-style text input container */}
                  <div className="w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border-2 border-[#071E2D] shadow-[5px_5px_0px_#071E2D] focus-within:shadow-[6px_6px_0px_#00C4B3] transition-all">
                    <label htmlFor="goal-input" className="block text-xs font-bold uppercase tracking-wider text-[#006D6A] mb-2">
                      Target or Objective
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
                      placeholder='Try "read 2 books by Friday" or "50 pushups a day"'
                      className="w-full bg-transparent font-sans text-base sm:text-lg text-[#071E2D] placeholder:text-[#071E2D]/40 outline-none resize-none leading-relaxed"
                      autoFocus
                    />
                  </div>

                  {/* Example chips */}
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#071E2D]/60 mb-2">
                      Or select a starter prompt:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {EXAMPLE_CHIPS.map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => setGoalText(chip.label)}
                          className="text-xs font-semibold px-3 py-2 rounded-xl border-2 border-[#071E2D] bg-white text-[#071E2D] shadow-[2px_2px_0px_#071E2D] hover:bg-[#E6F7F5] hover:border-[#006D6A] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-2 text-left"
                        >
                          <span className="text-base">{chip.icon}</span>
                          <div className="truncate">
                            <span className="block font-bold text-[#071E2D] truncate">{chip.label}</span>
                            <span className="text-[10px] text-[#006D6A] font-semibold">{chip.category}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary button: Build my tracker */}
                <div className="mt-6">
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

              {/* Right Column: AI Auto-Builder Blueprint Illustration (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="h-full bg-white border-2 border-[#071E2D] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[5px_5px_0px_#071E2D] flex flex-col items-center justify-between">
                  <div className="w-full flex items-center justify-between border-b border-[#071E2D]/10 pb-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#006D6A] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00C4B3]" />
                      Auto-Builder Blueprint
                    </span>
                    <span className="text-[10px] font-semibold text-[#071E2D]/50 bg-[#F3F6F8] px-2 py-0.5 rounded">
                      Step 2 of 4
                    </span>
                  </div>

                  <img
                    src="/illustrations/step-2.svg"
                    alt="Auto-Builder AI Blueprint"
                    className="w-full h-auto object-contain max-w-[260px] my-auto"
                  />

                  <div className="w-full text-center bg-[#F8FAFB] border border-[#071E2D]/15 rounded-xl p-2.5 mt-3">
                    <span className="text-xs font-bold text-[#071E2D] block">
                      Autonomous Logic Compiler
                    </span>
                    <p className="text-[11px] text-[#071E2D]/65 mt-0.5 leading-snug">
                      Extracts deadlines, quotas, and milestone checklists straight from your words.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3 — Building (transitional/loading state)           */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="w-full flex flex-col items-center justify-center text-center max-w-lg mx-auto animate-fadeIn py-4">
            {/* Visual Progress Card with step-3.svg */}
            <div className="relative mb-6 w-full">
              <div className="p-5 sm:p-6 bg-white border-2 border-[#071E2D] rounded-3xl shadow-[6px_6px_0px_#071E2D] flex flex-col items-center">
                <img
                  src="/illustrations/step-3.svg"
                  alt="Building Tracker Progress"
                  className="w-72 sm:w-84 max-w-full h-auto object-contain"
                />

                {/* Animated Progress Bar */}
                <div className="w-full max-w-xs bg-[#E2E8F0] h-3.5 rounded-full mt-5 border-2 border-[#071E2D] overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#00C4B3] rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: loadingPhase === 0 ? '35%' : loadingPhase === 1 ? '70%' : '98%',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Rotating status text changing every ~800ms–1s */}
            <div className="h-10 flex items-center justify-center">
              <p
                key={loadingPhase}
                className="text-xl sm:text-2xl font-extrabold text-[#071E2D] tracking-tight animate-fadeIn"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {LOADING_STATUS_MESSAGES[loadingPhase]}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-[#006D6A] font-bold mt-1">
              Analyzing "{createdGoal.title || goalText}"
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4 — Your tracker is ready (the payoff)             */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-fadeIn">
            {/* Celebratory Payoff Header Card with step-4.svg */}
            <div className="bg-white border-2 border-[#071E2D] rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_#071E2D] flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              <img
                src="/illustrations/step-4.svg"
                alt="Tracker Ready Payoff"
                className="w-36 sm:w-44 h-auto object-contain shrink-0"
              />
              <div className="text-center sm:text-left flex-1">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#006D6A] bg-[#E6F7F5] px-2.5 py-1 rounded-full border border-[#00C4B3]/40 mb-1.5">
                  ★ Tracker Configured
                </span>
                <h2
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071E2D] tracking-tight"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  Your tracker is ready!
                </h2>
                <p className="text-xs sm:text-sm text-[#071E2D]/75 mt-1.5 font-medium leading-relaxed">
                  We built a customized <span className="font-bold text-[#006D6A]">{trackerLabel}</span> tracker for:{' '}
                  <span className="font-bold text-[#071E2D]">"{createdGoal.title}"</span>. Give it a test click below!
                </p>
              </div>
            </div>

            {/* Live Interactive Generated Tracker pre-filled at zero progress */}
            <div className="w-full">
              {createdGoal.goal_type === 'counter' && (
                <CounterTracker
                  goal={createdGoal}
                  onUpdate={async (val) => {
                    setCreatedGoal((prev) => ({ ...prev, current_value: val }))
                  }}
                />
              )}
              {createdGoal.goal_type === 'checklist' && (
                <ChecklistTracker
                  goal={createdGoal}
                  onUpdateItems={async (items) => {
                    setCreatedGoal((prev) => ({ ...prev, items }))
                  }}
                />
              )}
              {createdGoal.goal_type === 'manual' && (
                <ManualTracker
                  goal={createdGoal}
                  onLogReflection={async (ref, sent) => {
                    setCreatedGoal((prev) => ({
                      ...prev,
                      progress_logs: [
                        {
                          id: `log-${Date.now()}`,
                          goal_id: prev.id,
                          value: sent,
                          note: ref,
                          timestamp: 'Just now',
                        },
                      ],
                    }))
                  }}
                />
              )}
            </div>

            {/* Primary Action & Secondary Redo Link */}
            <div className="flex flex-col items-center gap-3.5 mt-1">
              <Button
                variant="primary"
                onClick={handleFinishOnboarding}
                disabled={isFinishing}
                className="text-base sm:text-lg px-9 py-3.5"
              >
                {isFinishing ? 'Entering Dashboard…' : 'Start tracking'}
              </Button>

              {/* Secondary text link returning to Step 2 */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs sm:text-sm font-semibold text-[#071E2D]/60 hover:text-[#071E2D] underline underline-offset-4 decoration-[#071E2D]/30 hover:decoration-[#071E2D] transition-colors cursor-pointer"
              >
                Not quite right? Try a different goal
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Spacer to keep full-screen centering balanced */}
      <div className="w-full pb-4 sm:pb-6" aria-hidden="true" />
    </div>
  )
}
