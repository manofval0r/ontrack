/**
 * Live Django backend client (Eniola layer).
 *
 * - Base URL comes from `VITE_API_URL` (e.g. https://ontrack-api-web.onrender.com/api).
 * - Auth is a Supabase JWT stored via setToken() (filled at login; supabase-js
 *   wiring in Login.tsx is the remaining step — until then the app runs mock).
 * - Every method here mirrors one `api` method in ./api.ts; backend errors
 *   ({error, code}) are rethrown, network failures return NETWORK_MISS so the
 *   caller can fall back to offline demo data instead of breaking the UI.
 */
import type {
  DashboardData,
  Goal,
  GoalDomain,
  ProgressLog,
  StandardError,
  TrackerType,
} from '../types'

export const API_BASE = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? ''
).replace(/\/+$/, '')

const TOKEN_KEY = 'ontrack_token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable — live mode simply stays off */
  }
}

export function clearToken(): void {
  setToken(null)
}

/** Live only when we know WHERE (URL) and WHO (token). */
export function isLive(): boolean {
  return API_BASE.length > 0 && !!getToken()
}

export const NETWORK_MISS = Symbol('live-network-miss')

/** Run a live call; NETWORK_MISS when live is off or backend unreachable. */
export async function tryLive<T>(
  fn: () => Promise<T>,
): Promise<T | typeof NETWORK_MISS> {
  if (!isLive()) return NETWORK_MISS
  try {
    return await fn()
  } catch (err) {
    if (err instanceof TypeError) {
      console.warn('[api] backend unreachable, using offline demo data')
      return NETWORK_MISS
    }
    throw err
  }
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    })
  } catch (err) {
    throw err instanceof TypeError ? err : new TypeError('network error')
  }
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    const err: StandardError = {
      error: typeof body.error === 'string' ? body.error : `Request failed (${res.status})`,
      code: typeof body.code === 'string' ? body.code : 'REQUEST_ERROR',
    }
    throw err
  }
  return body as T
}

/* ── backend → frontend shape mappers ─────────────────────────── */

function toDatePart(iso: unknown): string {
  if (typeof iso === 'string' && iso.length >= 10) return iso.slice(0, 10)
  return new Date().toISOString().split('T')[0]
}

/** Backend statuses: active|completed|missed. UI-only paused stays local. */
function mapStatus(s: unknown): Goal['status'] {
  if (s === 'completed') return 'completed'
  if (s === 'missed') return 'failed'
  return 'active'
}

function mapGoalType(t: unknown): TrackerType {
  return t === 'counter' || t === 'checklist' || t === 'manual' ? t : 'manual'
}

export function mapGoal(g: Record<string, unknown>): Goal {
  const target = typeof g.target === 'number' ? g.target : 0
  const result = typeof g.result_value === 'number' ? g.result_value : 0
  const parse = (g.parse_result ?? {}) as Record<string, unknown>
  const items = Array.isArray(g.items) ? g.items : []
  const verdictRaw = typeof g.verdict === 'string' && g.verdict ? g.verdict : ''
  return {
    id: String(g.id ?? ''),
    user_id: String(g.user_id ?? ''),
    title: typeof g.title === 'string' && g.title ? g.title : 'Untitled Goal',
    description: typeof parse.summary === 'string' ? parse.summary : '',
    goal_type: mapGoalType(g.goal_type),
    target,
    current_value: result,
    unit: '',
    domain: (typeof g.domain === 'string' && g.domain ? g.domain : 'general') as GoalDomain,
    deadline: toDatePart(g.deadline),
    status: mapStatus(g.status),
    result_value: typeof g.result_value === 'number' ? String(g.result_value) : undefined,
    items: items.map((it: unknown, i: number) => {
      const o = (it ?? {}) as Record<string, unknown>
      return {
        id: String(o.id ?? `${i}`),
        title: typeof o.title === 'string' ? o.title : '',
        completed: !!o.completed,
        order: i + 1,
      }
    }),
    // Backend detail nests no logs/check-ins yet — UI renders empty lists.
    progress_logs: [],
    check_ins: [],
    verdict: verdictRaw
      ? {
          score: 0,
          summary: verdictRaw,
          recommendation: '',
          passed: g.status === 'completed',
          date: toDatePart(g.finished_at),
        }
      : undefined,
    created_at: toDatePart(g.start_at),
  }
}

/* ── live implementations (same order as ./api.ts) ────────────── */

export const liveGetGoals = async (): Promise<Goal[]> =>
  (await req<Record<string, unknown>[]>('/api/goals')).map(mapGoal)

export const liveGetGoal = async (id: string): Promise<Goal> =>
  mapGoal(await req<Record<string, unknown>>(`/api/goals/${id}`))

export const liveCreateGoal = async (payload: Partial<Goal>): Promise<Goal> => {
  // Backend parses natural language via AI: fold title+description into text.
  const text = [payload.title, payload.description].filter(Boolean).join(' — ') || 'Untitled Goal'
  return mapGoal(
    await req<Record<string, unknown>>('/api/goals', {
      method: 'POST',
      body: JSON.stringify({ text: text.slice(0, 500) }),
    }),
  )
}

export const liveUpdateGoal = async (id: string, updates: Partial<Goal>): Promise<Goal> => {
  const allowed: Record<string, unknown> = {}
  if (updates.title !== undefined) allowed.title = updates.title
  if (updates.target !== undefined) allowed.target = updates.target
  if (updates.domain !== undefined) allowed.domain = updates.domain
  if (updates.deadline !== undefined) allowed.deadline = updates.deadline
  if (updates.status !== undefined)
    allowed.status = updates.status === 'failed' ? 'missed' : updates.status
  return mapGoal(
    await req<Record<string, unknown>>(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(allowed),
    }),
  )
}

export const liveFinalizeGoal = async (id: string): Promise<Goal> => {
  const goal = mapGoal(
    await req<Record<string, unknown>>(`/api/goals/${id}/finalize`, {
      method: 'POST',
      body: '{}',
    }),
  )
  // Enrich the verdict score from real numbers when available.
  if (goal.verdict && goal.target > 0 && goal.result_value !== undefined) {
    const n = parseInt(goal.result_value, 10)
    if (!Number.isNaN(n)) {
      const score = Math.min(100, Math.round((n / goal.target) * 100))
      goal.current_value = n
      goal.verdict = { ...goal.verdict, score, passed: goal.status === 'completed' }
    }
  }
  return goal
}

export const liveLogProgress = async (payload: {
  goal_id: string
  value: number | string
  note?: string
}): Promise<Goal> => {
  // Backend value is an integer; fold free text into the note.
  let value: number
  let note = payload.note ?? ''
  if (typeof payload.value === 'number') {
    value = Math.trunc(payload.value)
  } else {
    const parsed = parseInt(payload.value, 10)
    if (!Number.isNaN(parsed)) {
      value = parsed
    } else {
      value = 1
      note = `${payload.value}${note ? ` — ${note}` : ''}`.slice(0, 500)
    }
  }
  await req('/api/progress', {
    method: 'POST',
    body: JSON.stringify({ goal_id: payload.goal_id, value, note }),
  })
  return liveGetGoal(payload.goal_id)
}

export const liveRespondToCheckIn = async (
  goal_id: string,
  check_in_id: string,
  user_response: string,
): Promise<Goal> => {
  await req(`/api/goals/${goal_id}/checkins/${check_in_id}/respond`, {
    method: 'POST',
    body: JSON.stringify({ user_response }),
  })
  return liveGetGoal(goal_id)
}

export const liveGetDashboard = async (): Promise<DashboardData> => {
  const d = (await req('/api/dashboard')) as unknown as Record<string, unknown>
  const slim = Array.isArray(d.active_goals) ? d.active_goals : []
  const active_goals: Goal[] = (slim as Record<string, unknown>[]).map((a) => {
    const target = typeof a.target === 'number' ? a.target : 0
    const pct = typeof a.progress_pct === 'number' ? a.progress_pct : 0
    const current = target > 0 ? Math.round((pct / 100) * target) : 0
    return {
      id: String(a.id ?? ''),
      user_id: '',
      title: typeof a.title === 'string' ? a.title : '',
      goal_type: mapGoalType(a.goal_type),
      target,
      current_value: current,
      domain: 'general' as GoalDomain,
      deadline: '',
      status: 'active' as const,
      items: [],
      progress_logs: [],
      check_ins: [],
      created_at: '',
    }
  })
  const history = Array.isArray(d.history) ? d.history : []
  const recent_activity: ProgressLog[] = (history as Record<string, unknown>[])
    .slice(0, 6)
    .map((h) => ({
      id: String(h.id ?? ''),
      goal_id: String(h.goal_id ?? ''),
      value: typeof h.value === 'number' ? h.value : 0,
      note: typeof h.note === 'string' ? h.note : '',
      timestamp: String(h.logged_at ?? '').replace('T', ' ').slice(0, 16),
    }))
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const weekly_chart = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(today)
    dt.setDate(today.getDate() - (6 - i))
    return {
      day: dayNames[dt.getDay()],
      date: dt.toISOString().split('T')[0],
      completed_count: 0,
      logged_count: 0,
      ...(i === 6 ? { isToday: true } : {}),
    }
  })
  return {
    stats: {
      active_goals_count: active_goals.length,
      completed_goals_count: typeof d.week_completed_count === 'number' ? d.week_completed_count : 0,
      streak_days: typeof d.streak_days === 'number' ? d.streak_days : 0,
      accountability_score: 0,
      velocity_pace: '',
    },
    active_goals,
    recent_activity,
    weekly_chart,
  }
}

export const liveSynthesizeSpeech = async (
  text: string,
): Promise<{ audioUrl: string; duration: number }> => {
  const r = (await req('/api/tts', {
    method: 'POST',
    body: JSON.stringify({ text: text.slice(0, 2000) }),
  })) as unknown as Record<string, unknown>
  if (typeof r.audio_url !== 'string' || !r.audio_url) {
    throw { error: 'TTS returned no audio', code: 'AI_SERVICE_ERROR' } as StandardError
  }
  return { audioUrl: r.audio_url, duration: Math.max(2, Math.round(text.length / 15)) }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const s = String(reader.result ?? '')
      resolve(s.includes(',') ? s.split(',')[1] : s)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export const liveTranscribeSpeech = async (
  audioData?: Blob | string,
): Promise<{ text: string; confidence: number }> => {
  let audio = ''
  if (typeof audioData === 'string') audio = audioData
  else if (audioData instanceof Blob) audio = await blobToBase64(audioData)
  else throw { error: 'No audio provided', code: 'VALIDATION_ERROR' } as StandardError
  const r = (await req('/api/asr', {
    method: 'POST',
    body: JSON.stringify({ audio }),
  })) as unknown as Record<string, unknown>
  return { text: typeof r.transcript === 'string' ? r.transcript : '', confidence: 1 }
}

/* ── additive (new UI affordances, no mock counterpart) ───────── */

export const parseGoalText = async (
  prompt: string,
): Promise<{ ai_response_text: string; goal_proposal: Partial<Goal> }> => {
  const r = (await req('/api/chat/parse-goal', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  })) as unknown as Record<string, unknown>
  return {
    ai_response_text: typeof r.ai_response_text === 'string' ? r.ai_response_text : '',
    goal_proposal: (r.goal_proposal ?? {}) as Partial<Goal>,
  }
}

export const generateCheckin = async (
  goalId: string,
): Promise<{ check_in_message: string; check_in_id: string; created_at: string }> =>
  req(`/api/goals/${goalId}/checkins/generate`, { method: 'POST', body: '{}' })

export const deleteGoal = async (goalId: string): Promise<{ message: string; id: string }> =>
  req(`/api/goals/${goalId}`, { method: 'DELETE' })

export const getMe = async (): Promise<Record<string, unknown>> => req('/api/auth/me')

export const getSettings = async (): Promise<Record<string, unknown>> => req('/api/settings')

export const updateSettings = async (patch: unknown): Promise<Record<string, unknown>> =>
  req('/api/settings', { method: 'PUT', body: JSON.stringify(patch ?? {}) })
