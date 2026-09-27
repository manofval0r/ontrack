import type {
  Goal,
  DashboardData,
  ProgressLog,
  StandardError,
  AudioSettings,
  NotificationSettings,
  IntegrationItem,
  UserProfile,
} from '../types'
import {
  NETWORK_MISS,
  liveCreateGoal,
  liveFinalizeGoal,
  liveGetDashboard,
  liveGetGoal,
  liveGetGoals,
  liveLogProgress,
  liveRespondToCheckIn,
  liveSynthesizeSpeech,
  liveTranscribeSpeech,
  liveUpdateGoal,
  tryLive,
} from './live'

// Token + additive live helpers share one import surface for the UI.
export {
  clearToken,
  deleteGoal,
  generateCheckin,
  getMe,
  getSettings,
  getToken,
  isLive,
  parseGoalText,
  setToken,
  updateSettings,
} from './live'

const LOCAL_STORAGE_KEY_GOALS = 'ontrack_goals_v1'

const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    user_id: 'user-israel',
    title: 'Close 5 Enterprise Deals',
    description: 'Outreach to top 20 SaaS prospects, conduct technical demos, and close 5 quarterly annual contracts.',
    goal_type: 'counter',
    target: 5,
    current_value: 3,
    unit: 'deals',
    domain: 'sales',
    deadline: '2026-10-05',
    status: 'active',
    created_at: '2026-09-20',
    progress_logs: [
      { id: 'log-1', goal_id: 'goal-1', value: 1, note: 'Signed contract with Apex Systems ($18k ARR)', timestamp: '2026-09-21 14:30' },
      { id: 'log-2', goal_id: 'goal-1', value: 2, note: 'Secured pilot conversion for NovaTech', timestamp: '2026-09-23 11:15' },
      { id: 'log-3', goal_id: 'goal-1', value: 3, note: 'Finalized enterprise agreement with HyperScale Labs', timestamp: '2026-09-26 16:45' },
    ],
    check_ins: [
      {
        id: 'ci-1',
        goal_id: 'goal-1',
        ai_message: 'Israel, you are at 3 out of 5 deals with 8 days remaining. Have you sent the revised pricing proposal to CloudCore?',
        user_response: 'Yes, sent earlier today. Following up with procurement tomorrow morning.',
        timestamp: '2026-09-26 09:00',
        status: 'responded',
        verdict_preview: 'Pacing strong. If CloudCore converts, you only need 1 more pipeline opportunity.',
      },
    ],
  },
  {
    id: 'goal-2',
    user_id: 'user-israel',
    title: 'Ship OnTrack Web Frontend MVP',
    description: 'Complete onboarding, chat, dynamic trackers, goal workspace, and dashboard in React.',
    goal_type: 'checklist',
    target: 5,
    current_value: 4,
    unit: 'milestones',
    domain: 'engineering',
    deadline: '2026-10-02',
    status: 'active',
    created_at: '2026-09-22',
    items: [
      { id: 'item-1', title: 'Tactile Neo-brutalist Design System & Tokens', completed: true, order: 1 },
      { id: 'item-2', title: 'Desktop-first 5-Step Onboarding Flow', completed: true, order: 2 },
      { id: 'item-3', title: 'Conversational Chat & Voice Mic Architecture', completed: true, order: 3 },
      { id: 'item-4', title: 'Interactive Goal Workspace (Counter, Checklist, Manual)', completed: true, order: 4 },
      { id: 'item-5', title: 'Settings, Audio Preferences & Evans Dummy API Integration', completed: false, order: 5 },
    ],
    progress_logs: [
      { id: 'log-4', goal_id: 'goal-2', value: 'Milestones 1 & 2', note: 'Created design tokens and Onboarding steps', timestamp: '2026-09-24 18:20' },
      { id: 'log-5', goal_id: 'goal-2', value: 'Milestones 3 & 4', note: 'Integrated Chat Window and Dynamic Trackers', timestamp: '2026-09-26 21:00' },
    ],
    check_ins: [
      {
        id: 'ci-2',
        goal_id: 'goal-2',
        ai_message: 'Solid momentum! 4 out of 5 core milestones completed. How are the settings and voice UI shaping up?',
        timestamp: '2026-09-27 10:15',
        status: 'pending',
      },
    ],
  },
  {
    id: 'goal-3',
    user_id: 'user-israel',
    title: 'Daily Founder Focus & Reflection',
    description: 'End-of-day mindfulness reflection: 3 wins, 1 major bottleneck, and tomorrow\'s priority.',
    goal_type: 'manual',
    target: 7,
    current_value: 5,
    unit: 'days',
    domain: 'mindset',
    deadline: '2026-10-04',
    status: 'active',
    created_at: '2026-09-21',
    progress_logs: [
      { id: 'log-6', goal_id: 'goal-3', value: 'Reflection logged', note: 'Sprint velocity high. Avoided context switching after lunch.', timestamp: '2026-09-25 21:45' },
      { id: 'log-7', goal_id: 'goal-3', value: 'Reflection logged', note: 'Great alignment call with design team. Protected 4 hours of deep coding.', timestamp: '2026-09-26 22:10' },
    ],
    check_ins: [],
  },
  {
    id: 'goal-4',
    user_id: 'user-israel',
    title: 'Weekly 20km Running Mileage',
    description: 'Maintain cardio endurance with 4 weekly sessions targeting 20km total.',
    goal_type: 'counter',
    target: 20,
    current_value: 20,
    unit: 'km',
    domain: 'fitness',
    deadline: '2026-09-27',
    status: 'completed',
    created_at: '2026-09-20',
    progress_logs: [
      { id: 'log-8', goal_id: 'goal-4', value: 6, note: 'Morning interval run in the park', timestamp: '2026-09-21 07:15' },
      { id: 'log-9', goal_id: 'goal-4', value: 8, note: 'Mid-week tempo run', timestamp: '2026-09-24 07:00' },
      { id: 'log-10', goal_id: 'goal-4', value: 6, note: 'Weekend long run to hit 20km target!', timestamp: '2026-09-27 08:30' },
    ],
    verdict: {
      score: 100,
      summary: 'Goal successfully accomplished on time with excellent pacing across the 7-day period.',
      recommendation: 'Target achieved! Consider progressive overload of +10% (22km) next sprint.',
      passed: true,
      date: '2026-09-27',
    },
  },
]

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Israel',
  email: 'israel@ontrack.app',
  accountability_persona: 'Nemotron High-Accountability Coach',
  timezone: 'GMT+1 (West Africa Standard Time)',
}

export const INITIAL_AUDIO_SETTINGS: AudioSettings = {
  voice_type: 'nemotron-direct',
  voice_speed: 1.0,
  tts_enabled: true,
  asr_enabled: true,
}

export const INITIAL_NOTIFICATIONS: NotificationSettings = {
  master_enabled: true,
  goal_reminders: true,
  check_ins: true,
  goal_updates: true,
  streak_alerts: true,
  sound_enabled: true,
}

export const INITIAL_INTEGRATIONS: IntegrationItem[] = [
  {
    id: 'google-cal',
    name: 'Google Calendar',
    description: 'Schedule daily check-ins and deadline milestones directly to your calendar.',
    icon: 'calendar',
    connected: true,
    status_label: 'Syncing every morning at 08:00 AM',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receive Nemotron accountability nudges and progress updates in a private channel.',
    icon: 'slack',
    connected: false,
    status_label: 'Not connected',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Export finalized goal verdicts and daily reflections to your Notion workspace.',
    icon: 'notion',
    connected: true,
    status_label: 'Connected to "Israel Personal Workspace"',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Automatically log coding progress and streak activity based on commits and merged PRs.',
    icon: 'github',
    connected: false,
    status_label: 'Not connected',
  },
]

function getStoredGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_GOALS)
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_GOALS, JSON.stringify(INITIAL_GOALS))
      return INITIAL_GOALS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_GOALS
  }
}

function saveStoredGoals(goals: Goal[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_GOALS, JSON.stringify(goals))
  } catch (err) {
    console.warn('Failed saving goals to localStorage', err)
  }
}

export const api = {
  /**
   * GET /api/goals
   */
  async getGoals(): Promise<Goal[]> {
    const live = await tryLive(() => liveGetGoals())
    if (live !== NETWORK_MISS) return live
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getStoredGoals())
      }, 100)
    })
  },

  /**
   * GET /api/goals/:id
   */
  async getGoal(id: string): Promise<Goal> {
    const live = await tryLive(() => liveGetGoal(id))
    if (live !== NETWORK_MISS) return live
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const goals = getStoredGoals()
        const found = goals.find((g) => g.id === id)
        if (found) {
          resolve(found)
        } else {
          const err: StandardError = { error: `Goal with id "${id}" not found`, code: 'GOAL_NOT_FOUND' }
          reject(err)
        }
      }, 80)
    })
  },

  /**
   * POST /api/goals
   */
  async createGoal(payload: Partial<Goal>): Promise<Goal> {
    const live = await tryLive(() => liveCreateGoal(payload))
    if (live !== NETWORK_MISS) return live
    return new Promise((resolve) => {
      setTimeout(() => {
        const goals = getStoredGoals()
        const newGoal: Goal = {
          id: `goal-${Date.now()}`,
          user_id: 'user-israel',
          title: payload.title || 'Untitled Goal',
          description: payload.description || '',
          goal_type: payload.goal_type || 'counter',
          target: payload.target || 1,
          current_value: 0,
          unit: payload.unit || 'units',
          domain: payload.domain || 'general',
          deadline: payload.deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'active',
          items: payload.items || [],
          progress_logs: [],
          check_ins: [],
          created_at: new Date().toISOString().split('T')[0],
        }
        const updated = [newGoal, ...goals]
        saveStoredGoals(updated)
        resolve(newGoal)
      }, 150)
    })
  },

  /**
   * PUT /api/goals/:id
   */
  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const live = await tryLive(() => liveUpdateGoal(id, updates))
    if (live !== NETWORK_MISS) return live
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const goals = getStoredGoals()
        const idx = goals.findIndex((g) => g.id === id)
        if (idx === -1) {
          const err: StandardError = { error: `Goal not found`, code: 'NOT_FOUND' }
          reject(err)
          return
        }
        const updatedGoal = { ...goals[idx], ...updates }
        goals[idx] = updatedGoal
        saveStoredGoals(goals)
        resolve(updatedGoal)
      }, 100)
    })
  },

  /**
   * POST /api/goals/:id/finalize
   */
  async finalizeGoal(id: string): Promise<Goal> {
    const live = await tryLive(() => liveFinalizeGoal(id))
    if (live !== NETWORK_MISS) return live
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const goals = getStoredGoals()
        const idx = goals.findIndex((g) => g.id === id)
        if (idx === -1) {
          const err: StandardError = { error: `Goal not found`, code: 'NOT_FOUND' }
          reject(err)
          return
        }
        const goal = goals[idx]
        const percent = goal.target > 0 ? Math.min(100, Math.round((goal.current_value / goal.target) * 100)) : 100
        const passed = percent >= 80

        const finalizedGoal: Goal = {
          ...goal,
          status: passed ? 'completed' : 'failed',
          result_value: `${goal.current_value}/${goal.target} ${goal.unit || ''}`.trim(),
          verdict: {
            score: percent,
            passed,
            summary: passed
              ? `Outstanding follow-through! Completed with an accountability performance score of ${percent}%.`
              : `Goal finalized below target at ${percent}%. Target was ${goal.target}, closed at ${goal.current_value}.`,
            recommendation: passed
              ? 'Great discipline shown. Ready to set an elevated target for the next cycle.'
              : 'Review daily blockers and consider breaking down milestones into smaller daily bites.',
            date: new Date().toISOString().split('T')[0],
          },
        }
        goals[idx] = finalizedGoal
        saveStoredGoals(goals)
        resolve(finalizedGoal)
      }, 200)
    })
  },

  /**
   * POST /api/progress
   */
  async logProgress(payload: { goal_id: string; value: number | string; note?: string }): Promise<Goal> {
    const live = await tryLive(() => liveLogProgress(payload))
    if (live !== NETWORK_MISS) return live
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const goals = getStoredGoals()
        const idx = goals.findIndex((g) => g.id === payload.goal_id)
        if (idx === -1) {
          const err: StandardError = { error: 'Goal not found', code: 'NOT_FOUND' }
          reject(err)
        } else {
          const goal = goals[idx]
          const now = new Date()
          const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`

          const newLog: ProgressLog = {
            id: `log-${Date.now()}`,
            goal_id: goal.id,
            value: payload.value,
            note: payload.note || 'Logged progress update',
            timestamp: timeStr,
          }

          let newCurrentValue = goal.current_value
          if (typeof payload.value === 'number') {
            newCurrentValue = payload.value
          } else if (goal.goal_type === 'counter') {
            const parsed = parseFloat(payload.value)
            if (!isNaN(parsed)) newCurrentValue = parsed
          } else if (goal.goal_type === 'manual') {
            newCurrentValue = (goal.current_value || 0) + 1
          }

          const isCompleted = newCurrentValue >= goal.target
          const updatedGoal: Goal = {
            ...goal,
            current_value: newCurrentValue,
            status: isCompleted ? 'completed' : goal.status,
            progress_logs: [newLog, ...(goal.progress_logs || [])],
          }

          goals[idx] = updatedGoal
          saveStoredGoals(goals)
          resolve(updatedGoal)
        }
      }, 120)
    })
  },

  /**
   * POST /api/checkins/respond
   */
  async respondToCheckIn(goal_id: string, check_in_id: string, user_response: string): Promise<Goal> {
    const live = await tryLive(() => liveRespondToCheckIn(goal_id, check_in_id, user_response))
    if (live !== NETWORK_MISS) return live
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const goals = getStoredGoals()
        const idx = goals.findIndex((g) => g.id === goal_id)
        if (idx === -1) {
          reject({ error: 'Goal not found', code: 'NOT_FOUND' })
          return
        }
        const goal = goals[idx]
        const updatedCheckIns = (goal.check_ins || []).map((ci) => {
          if (ci.id === check_in_id) {
            return {
              ...ci,
              user_response,
              status: 'responded' as const,
              verdict_preview: 'Nemotron noted your update. Pace adjusted in execution velocity.',
            }
          }
          return ci
        })
        const updatedGoal = { ...goal, check_ins: updatedCheckIns }
        goals[idx] = updatedGoal
        saveStoredGoals(goals)
        resolve(updatedGoal)
      }, 150)
    })
  },

  /**
   * GET /api/dashboard
   */
  async getDashboard(): Promise<DashboardData> {
    const live = await tryLive(() => liveGetDashboard())
    if (live !== NETWORK_MISS) return live
    return new Promise((resolve) => {
      setTimeout(() => {
        const goals = getStoredGoals()
        const activeGoals = goals.filter((g) => g.status === 'active')
        const completedGoals = goals.filter((g) => g.status === 'completed')

        const allLogs = goals.flatMap((g) => g.progress_logs || [])
        allLogs.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
        const recentActivity = allLogs.slice(0, 6)

        const weeklyChart = [
          { day: 'Mon', date: 'Sep 22', completed_count: 2, logged_count: 4 },
          { day: 'Tue', date: 'Sep 23', completed_count: 1, logged_count: 3 },
          { day: 'Wed', date: 'Sep 24', completed_count: 3, logged_count: 5 },
          { day: 'Thu', date: 'Sep 25', completed_count: 2, logged_count: 4 },
          { day: 'Fri', date: 'Sep 26', completed_count: 4, logged_count: 6 },
          { day: 'Sat', date: 'Sep 27', completed_count: 3, logged_count: 5, isToday: true },
          { day: 'Sun', date: 'Sep 28', completed_count: 1, logged_count: 2 },
        ]

        resolve({
          stats: {
            active_goals_count: activeGoals.length,
            completed_goals_count: completedGoals.length,
            streak_days: 7,
            accountability_score: 94,
            velocity_pace: '+24% Pace',
          },
          active_goals: activeGoals,
          recent_activity: recentActivity,
          weekly_chart: weeklyChart,
        })
      }, 150)
    })
  },

  /**
   * POST /api/tts
   */
  async synthesizeSpeech(text: string): Promise<{ audioUrl: string; duration: number }> {
    const live = await tryLive(() => liveSynthesizeSpeech(text))
    if (live !== NETWORK_MISS) return live
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          audioUrl: 'mock_tts_stream',
          duration: Math.max(2, Math.round(text.length / 15)),
        })
      }, 200)
    })
  },

  /**
   * POST /api/asr
   */
  async transcribeSpeech(_audioData?: Blob | string): Promise<{ text: string; confidence: number }> {
    const live = await tryLive(() => liveTranscribeSpeech(_audioData))
    if (live !== NETWORK_MISS) return live
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: 'I want to close 5 enterprise software deals before the end of next week',
          confidence: 0.98,
        })
      }, 600)
    })
  },
}
