/**
 * OnTrack API service
 * ------------------------------------------------------------------
 * All calls go to VITE_API_URL (https://ontrack-api-web.onrender.com).
 * The Supabase JWT is read from localStorage key `ontrack_token` and
 * sent as `Authorization: Bearer <token>` on every authenticated call.
 *
 * When the backend is unreachable (network error / 5xx) the functions
 * throw a StandardError so GoalContext can surface a clean error state.
 */

import type {
  Goal,
  GoalItem,
  DashboardData,
  StandardError,
  AudioSettings,
  NotificationSettings,
  IntegrationItem,
  UserProfile,
} from '../types'

// ─── Base URL ────────────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://ontrack-api-web.onrender.com'
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') || 'https://destcakvqdzhkzemdugo.supabase.co'
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'sb_publishable_kT5JCbb2BFocdW23HIJYfw_jk879gsk'

// ─── Auth helpers ────────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem('ontrack_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

let refreshPromise: Promise<string | null> | null = null

async function refreshSession(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('ontrack_refresh_token')
    if (!refreshToken) return null

    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!res.ok) {
        return null
      }

      const data = await res.json()
      if (data.access_token) {
        localStorage.setItem('ontrack_token', data.access_token)
        if (data.refresh_token) {
          localStorage.setItem('ontrack_refresh_token', data.refresh_token)
        }
        return data.access_token as string
      }
    } catch (err) {
      console.warn('[API] Token refresh attempt failed:', err)
    }
    return null
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface ExtendedRequestInit extends RequestInit {
  _retry?: boolean
}

async function request<T>(
  path: string,
  options: ExtendedRequestInit = {},
  authenticated = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(authenticated ? authHeaders() : {}),
    ...(options.headers as Record<string, string> | undefined ?? {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // Parse body (always JSON from this backend)
  let body: any
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    body = await res.json()
  } else {
    body = await res.text()
  }

  // Handle 401 with automatic token refresh + transparent retry
  if (res.status === 401 && authenticated && !options._retry) {
    const newToken = await refreshSession()
    if (newToken) {
      return request<T>(
        path,
        {
          ...options,
          _retry: true,
          headers: {
            ...((options.headers as Record<string, string>) || {}),
            Authorization: `Bearer ${newToken}`,
          },
        },
        authenticated
      )
    }
  }

  if (!res.ok) {
    // Backend error shape: { error: string, code: string }
    const err: StandardError = {
      error: body?.error ?? `HTTP ${res.status}`,
      code: body?.code ?? (res.status === 401 ? 'AUTH_INVALID' : 'API_ERROR'),
    }
    throw err
  }

  return body as T
}

// ─── UI fallback constants (used by GoalContext initial state) ────────────────

export const INITIAL_USER_PROFILE: UserProfile = {
  name: '',
  email: '',
  accountability_persona: 'Nemotron High-Accountability Coach',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
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
    connected: false,
    status_label: 'Not connected',
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
    connected: false,
    status_label: 'Not connected',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Auto-log commits, PR merges, and issue closures to your engineering tracker.',
    icon: 'github',
    connected: false,
    status_label: 'Not connected',
  },
]

// ─── Response shape helpers ───────────────────────────────────────────────────

/**
 * The backend returns goal objects with snake_case fields and UUIDs.
 * Map them to the frontend Goal type so the rest of the app is unchanged.
 */
function mapGoal(raw: any): Goal {
  // items come as {id, title, completed, order} — compatible with GoalItem
  const items: GoalItem[] = (raw.items ?? []).map((item: any) => ({
    id: String(item.id),
    title: item.title ?? '',
    completed: item.completed ?? false,
    order: item.order ?? 0,
  }))

  // progress_logs come as {id, goal_id, value, note, logged_at}
  const progress_logs = (raw.progress_logs ?? []).map((log: any) => ({
    id: String(log.id),
    goal_id: String(log.goal_id ?? raw.id),
    value: log.value,
    note: log.note ?? '',
    timestamp: log.logged_at ?? log.timestamp ?? '',
  }))

  const rawCurrentValue = raw.current_value != null ? Number(raw.current_value) : null
  const computedCurrentValue =
    rawCurrentValue !== null
      ? rawCurrentValue
      : raw.goal_type === 'checklist'
      ? items.filter((i) => i.completed).length
      : raw.goal_type === 'counter'
      ? progress_logs.reduce((acc: number, l: any) => acc + (typeof l.value === 'number' ? l.value : Number(l.value) || 0), 0)
      : progress_logs.length

  return {
    id: String(raw.id),
    user_id: String(raw.user_id ?? ''),
    title: raw.title ?? '',
    description: raw.description ?? raw.parse_result?.summary ?? '',
    goal_type: raw.goal_type ?? 'manual',
    target: raw.target ?? 0,
    current_value: computedCurrentValue,
    unit: raw.unit ?? '',
    domain: raw.domain ?? 'general',
    deadline: raw.deadline
      ? (typeof raw.deadline === 'string' ? raw.deadline.split('T')[0] : String(raw.deadline))
      : '',
    status: raw.status ?? 'active',
    result_value: raw.result_value != null ? String(raw.result_value) : undefined,
    items,
    progress_logs,
    check_ins: (raw.check_ins ?? []).map((ci: any) => ({
      id: String(ci.id),
      goal_id: String(ci.goal_id ?? raw.id),
      ai_message: ci.ai_message ?? ci.check_in_message ?? '',
      user_response: ci.user_response,
      timestamp: ci.checked_in_at ?? ci.timestamp ?? '',
      status: ci.user_response ? 'responded' : 'pending',
      verdict_preview: ci.verdict_preview,
    })),
    verdict: raw.verdict
      ? typeof raw.verdict === 'string'
        ? { score: 100, summary: raw.verdict, recommendation: '', passed: true, date: '' }
        : raw.verdict
      : undefined,
    created_at: raw.start_at ?? raw.created_at ?? '',
    finished_at: raw.finished_at ? String(raw.finished_at) : undefined,
  }
}

/**
 * Map backend dashboard response to the frontend DashboardData type.
 */
function mapDashboard(raw: any): DashboardData {
  return {
    stats: {
      active_goals_count: (raw.active_goals ?? []).length,
      completed_goals_count: raw.week_completed_count ?? 0,
      streak_days: raw.streak_days ?? 0,
      accountability_score: raw.profile?.accountability_score ?? 0,
      velocity_pace: raw.profile?.velocity_pace ?? '',
    },
    active_goals: (raw.active_goals ?? []).map(mapGoal),
    recent_activity: (raw.history ?? []).map((h: any) => ({
      id: String(h.id),
      goal_id: String(h.goal_id),
      value: h.value,
      note: h.note ?? '',
      timestamp: h.logged_at ?? '',
    })),
    weekly_chart: [],
  }
}

// ─── Public API object ────────────────────────────────────────────────────────

export const api = {

  // ── Health ──────────────────────────────────────────────────────────────────

  /** GET /api/health (public) */
  async health(): Promise<{ status: string }> {
    return request('/api/health', { method: 'GET' }, false)
  },

  // ── Auth ────────────────────────────────────────────────────────────────────

  /** GET /api/auth/me — returns the authenticated user's profile */
  async getMe(): Promise<UserProfile> {
    const raw = await request<any>('/api/auth/me')
    return {
      name: raw.name ?? '',
      email: raw.email ?? '',
      accountability_persona: raw.accountability_persona ?? 'Nemotron High-Accountability Coach',
      timezone: raw.timezone ?? 'UTC',
    }
  },

  // ── Goals ───────────────────────────────────────────────────────────────────

  /** GET /api/goals[?status=active|completed|missed] */
  async getGoals(status?: 'active' | 'completed' | 'missed'): Promise<Goal[]> {
    const qs = status ? `?status=${status}` : ''
    const raw = await request<any[]>(`/api/goals${qs}`)
    return raw.map(mapGoal)
  },

  /** GET /api/goals/:id */
  async getGoal(id: string): Promise<Goal> {
    const raw = await request<any>(`/api/goals/${id}`)
    return mapGoal(raw)
  },

  /**
   * POST /api/goals  { text }
   * The backend parses the text with AI and returns a fully-formed Goal.
   * `payload` can be a Partial<Goal> (from onboarding) — we extract `.title`
   * as the text, or fall back to a `.text` field if present.
   */
  async createGoal(payload: Partial<Goal> & { text?: string }): Promise<Goal> {
    const text = payload.text ?? payload.title ?? 'Untitled goal'
    const body: Record<string, any> = { text }
    if (payload.title) body.title = payload.title
    if (payload.target !== undefined) body.target = payload.target
    if (payload.deadline) body.deadline = payload.deadline
    if (payload.goal_type) body.goal_type = payload.goal_type
    if (payload.domain) body.domain = payload.domain
    if (payload.unit) body.unit = payload.unit

    const raw = await request<any>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return mapGoal(raw)
  },

  /** PUT /api/goals/:id  { title?, target?, domain?, deadline?, status?, items?, current_value? } */
  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const allowed: Record<string, unknown> = {}
    if (updates.title !== undefined) allowed.title = updates.title
    if (updates.target !== undefined) allowed.target = updates.target
    if (updates.domain !== undefined) allowed.domain = updates.domain
    if (updates.deadline !== undefined) allowed.deadline = updates.deadline
    if (updates.status !== undefined) allowed.status = updates.status
    if (updates.items !== undefined) allowed.items = updates.items

    try {
      const raw = await request<any>(`/api/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(allowed),
      })
      const mapped = mapGoal(raw)
      // Ensure optimistic items and current_value are preserved if backend returned partial
      if (updates.items && (!mapped.items || mapped.items.length === 0)) {
        mapped.items = updates.items
      }
      if (updates.current_value !== undefined) {
        mapped.current_value = updates.current_value
      } else if (mapped.items && mapped.items.length > 0) {
        mapped.current_value = mapped.items.filter((i) => i.completed).length
      }
      return mapped
    } catch (err) {
      // Local fallback in case of network or auth failure
      const local = localStorage.getItem('ontrack_local_goals')
      let localGoals: Goal[] = []
      if (local) {
        try { localGoals = JSON.parse(local) } catch {}
      }
      const existing = localGoals.find((g) => g.id === id)
      const merged: Goal = {
        ...(existing || {
          id,
          user_id: '',
          title: updates.title || 'Goal',
          goal_type: updates.goal_type || 'counter',
          target: updates.target ?? 10,
          current_value: 0,
          domain: updates.domain || 'general',
          deadline: updates.deadline || '',
          status: updates.status || 'active',
          created_at: new Date().toISOString(),
        }),
        ...updates,
      }
      if (updates.items) {
        merged.items = updates.items
        merged.current_value = updates.items.filter((i) => i.completed).length
      }
      return merged
    }
  },

  /** DELETE /api/goals/:id */
  async deleteGoal(id: string): Promise<{ message: string; id: string }> {
    return request(`/api/goals/${id}`, { method: 'DELETE' })
  },

  // ── Check-ins ───────────────────────────────────────────────────────────────

  /**
   * POST /api/goals/:id/checkin  (also aliased as /checkins/generate)
   * Returns { check_in_message, check_in_id, created_at }
   */
  async generateCheckIn(goalId: string): Promise<{ check_in_message: string; check_in_id: string; created_at: string }> {
    return request(`/api/goals/${goalId}/checkin`, { method: 'POST' })
  },

  /**
   * POST /api/goals/:id/checkins/:checkin_id/respond  { user_response }
   */
  async respondToCheckIn(goalId: string, checkInId: string, user_response: string): Promise<Goal> {
    await request(`/api/goals/${goalId}/checkins/${checkInId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ user_response }),
    })
    // Fetch the updated goal and return it so callers get the full state
    return api.getGoal(goalId)
  },

  // ── Finalize ────────────────────────────────────────────────────────────────

  /** POST /api/goals/:id/finalize */
  async finalizeGoal(id: string): Promise<Goal> {
    const raw = await request<any>(`/api/goals/${id}/finalize`, { method: 'POST' })
    return mapGoal(raw)
  },

  // ── Progress ────────────────────────────────────────────────────────────────

  /**
   * POST /api/progress  { goal_id, value (integer), note? }
   * Backend returns the new ProgressLog, not the goal — so we re-fetch the goal.
   */
  async logProgress(payload: { goal_id: string; value: number | string; note?: string }): Promise<Goal> {
    let intValue: number
    let finalNote = payload.note ?? ''

    if (typeof payload.value === 'string') {
      const parsed = parseInt(payload.value, 10)
      if (isNaN(parsed)) {
        intValue = 1
        if (!finalNote) finalNote = payload.value
      } else {
        intValue = parsed
      }
    } else {
      intValue = Math.round(payload.value)
    }

    intValue = Math.max(0, intValue)

    // For locally created goals, throw directly to trigger client-side ledger persistence
    if (typeof payload.goal_id === 'string' && (payload.goal_id.startsWith('goal-') || payload.goal_id.startsWith('local-'))) {
      throw { error: 'Offline / local goal logged to client ledger', code: 'LOCAL_ONLY' }
    }

    await request('/api/progress', {
      method: 'POST',
      body: JSON.stringify({
        goal_id: payload.goal_id,
        value: intValue,
        note: finalNote,
      }),
    })
    // Return the refreshed goal
    return api.getGoal(payload.goal_id)
  },

  // ── Dashboard ───────────────────────────────────────────────────────────────

  /** GET /api/dashboard */
  async getDashboard(): Promise<DashboardData> {
    const raw = await request<any>('/api/dashboard')
    return mapDashboard(raw)
  },

  // ── Chat / AI ───────────────────────────────────────────────────────────────

  /**
   * POST /api/chat/parse-goal  { prompt }
   * Returns { ai_response_text, goal_proposal } — no DB write.
   * Caller should then POST /api/goals { text: prompt } to actually create it.
   */
  async parseGoal(prompt: string): Promise<{
    ai_response_text: string
    goal_proposal: {
      title: string
      goal_type: string
      target: number | null
      items: string[]
      domain: string
      deadline: string | null
      summary: string
    }
  }> {
    return request('/api/chat/parse-goal', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })
  },

  // ── TTS / ASR ───────────────────────────────────────────────────────────────

  /** POST /api/tts  { text } → { audio_url, cached } */
  async synthesizeSpeech(text: string): Promise<{ audioUrl: string; duration: number; cached?: boolean }> {
    const raw = await request<any>('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
    return {
      audioUrl: raw.audio_url ?? '',
      duration: Math.max(2, Math.round(text.length / 15)),
      cached: raw.cached ?? false,
    }
  },

  /** POST /api/asr  { audio: base64 } → { transcript } */
  async transcribeSpeech(audioData?: Blob | string): Promise<{ text: string; confidence: number }> {
    let base64 = ''
    if (audioData instanceof Blob) {
      const buffer = await audioData.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      bytes.forEach((b) => { binary += String.fromCharCode(b) })
      base64 = btoa(binary)
    } else if (typeof audioData === 'string') {
      base64 = audioData
    }
    const raw = await request<any>('/api/asr', {
      method: 'POST',
      body: JSON.stringify({ audio: base64 }),
    })
    return { text: raw.transcript ?? '', confidence: 1.0 }
  },

  // ── Settings ─────────────────────────────────────────────────────────────────

  /** GET /api/settings */
  async getSettings(): Promise<{
    profile: UserProfile & { user_id: string }
    audio: AudioSettings
    notifications: NotificationSettings
    integrations: IntegrationItem[]
  }> {
    return request('/api/settings')
  },

  /**
   * PUT /api/settings  { profile?, audio?, notifications?, integrations? }
   */
  async updateSettings(data: {
    profile?: Partial<UserProfile>
    audio?: Partial<AudioSettings>
    notifications?: Partial<NotificationSettings>
    integrations?: IntegrationItem[]
  }): Promise<{
    profile: UserProfile & { user_id: string }
    audio: AudioSettings
    notifications: NotificationSettings
    integrations: IntegrationItem[]
  }> {
    return request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // ── Integrations (server-backed credential vault) ───────────────────────

  /** GET /api/integrations — never includes tokens */
  async getIntegrations(): Promise<ProviderIntegration[]> {
    return request('/api/integrations')
  },

  /** POST /api/integrations — upsert { provider, access_token?, meta? } */
  async saveIntegration(input: {
    provider: string
    access_token?: string
    meta?: Record<string, unknown>
  }): Promise<ProviderIntegration> {
    return request('/api/integrations', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  /** DELETE /api/integrations/:id */
  async deleteIntegration(id: string): Promise<{ message: string; id: string }> {
    return request(`/api/integrations/${id}`, { method: 'DELETE' })
  },

  /** POST /api/integrations/slack/notify — via stored webhook (no CORS) */
  async slackNotify(text?: string): Promise<{ ok: boolean }> {
    return request('/api/integrations/slack/notify', {
      method: 'POST',
      body: JSON.stringify(text ? { text } : {}),
    })
  },

  /** POST /api/integrations/notion/export — verdict page (no CORS) */
  async notionExport(goalId: string): Promise<{ ok: boolean; page_id: string }> {
    return request('/api/integrations/notion/export', {
      method: 'POST',
      body: JSON.stringify({ goal_id: goalId }),
    })
  },
}

export interface ProviderIntegration {
  id: string
  provider: string
  connected: boolean
  status_label: string
  updated_at?: string
}
