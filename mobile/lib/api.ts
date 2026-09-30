/** Django API client — same contracts + {error, code} envelope as web services/api.ts. */
import { clearSession, getToken, refreshSession } from './auth';
import { API_URL } from './config';

export interface StandardError {
  error: string;
  code: string;
}

const REQUEST_TIMEOUT_MS = 20000;
const AI_TIMEOUT_MS = 90000;

export interface RequestOptions extends RequestInit {
  /** Override the 20s default (AI calls need longer — cold models are slow). */
  timeoutMs?: number;
  /** Retry once after a short pause on network timeouts/aborts. Only set on
   * idempotent or side-effect-free calls: first attempt often just wakes a
   * sleeping Render instance, second one lands. */
  retryOnTimeout?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs, retryOnTimeout, ...fetchOptions } = options;
  const doFetch = async (tokenOverride?: string): Promise<T> => {
    const token = tokenOverride ?? (await getToken());
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs ?? REQUEST_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(`${API_URL}${path}`, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...((fetchOptions.headers as Record<string, string> | undefined) ?? {}),
        },
      });
    } catch (e: any) {
      throw {
        error: e?.name === 'AbortError' ? 'Request timed out. Check your connection.' : 'Network error. Check your connection.',
        code: 'NETWORK_ERROR',
      } as StandardError;
    } finally {
      clearTimeout(timer);
    }
    // Expired access token (Supabase JWTs live ~1h; web auto-refreshes, we
    // must rotate manually): refresh once and retry with the fresh token.
    // Unrecoverable rotation clears the session so callers route to login.
    if (res.status === 401 && tokenOverride === undefined) {
      const fresh = await refreshSession().catch(() => null);
      if (fresh) return doFetch(fresh);
      await clearSession().catch(() => {});
      throw { error: 'Session expired. Log in again.', code: 'AUTH_EXPIRED' } as StandardError;
    }
    const body: Partial<StandardError> & Record<string, unknown> = await res
      .json()
      .catch(() => ({}));
    if (!res.ok) {
      const err: StandardError = {
        error: typeof body.error === 'string' ? body.error : `HTTP ${res.status}`,
        code: typeof body.code === 'string' ? body.code : 'API_ERROR',
      };
      throw err;
    }
    return body as T;
  };
  try {
    return await doFetch();
  } catch (e: any) {
    if (retryOnTimeout && e?.code === 'NETWORK_ERROR') {
      await new Promise((r) => setTimeout(r, 1500));
      return doFetch();
    }
    throw e;
  }
}

export const api = {
  health: () => request<{ status: string }>('/api/health', { method: 'GET' }),
  getGoals: (status?: string) =>
    request<any[]>(`/api/goals${status ? `?status=${status}` : ''}`),
  getGoal: (id: string) => request<any>(`/api/goals/${id}`),
  createGoal: (text: string) =>
    request<any>('/api/goals', { method: 'POST', body: JSON.stringify({ text }) }),
  updateGoal: (id: string, updates: Record<string, unknown>) =>
    request<any>(`/api/goals/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteGoal: (id: string) => request(`/api/goals/${id}`, { method: 'DELETE' }),
  deleteIntegration: (id: string) =>
    request(`/api/integrations/${id}`, { method: 'DELETE' }),
  logProgress: (goal_id: string, value: number, note?: string) =>
    request('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ goal_id, value, note: note ?? '' }),
    }),
  getDashboard: () => request<any>('/api/dashboard'),
  parseGoal: (prompt: string) =>
    request<{ ai_response_text: string; goal_proposal: any | null; is_goal?: boolean }>('/api/chat/parse-goal', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
      timeoutMs: AI_TIMEOUT_MS,
      retryOnTimeout: true,
    }),
  /** Conversational chat with history + plan drafting (Evans' /api/chat contract).
   * Returns { reply, goal_proposal?, is_goal?, suggested_goal_prompt?, suggested_topic?, references? }.
   * Falls back to parse-goal when the backend predates /api/chat (404). */
  chat: (
    message: string,
    opts?: { goalId?: string; history?: Array<{ role: string; content: string }>; draftGoal?: boolean }
  ) =>
    request<{
      reply?: string;
      message?: string;
      ai_response_text?: string;
      goal_proposal?: any | null;
      is_goal?: boolean;
      references?: string[];
      retrieved_context?: string[];
      rag_active?: boolean;
      ai_fallback_used?: boolean;
      suggested_goal_prompt?: string;
      suggested_topic?: string;
    }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        goal_id: opts?.goalId ?? undefined,
        history: opts?.history ?? undefined,
        draft_goal: opts?.draftGoal ?? undefined,
      }),
      timeoutMs: AI_TIMEOUT_MS,
      retryOnTimeout: true,
    }),
  checkin: (goalId: string) =>
    request<{ check_in_message: string; check_in_id: string; created_at: string }>(
      `/api/goals/${goalId}/checkin`,
      { method: 'POST' }
    ),
  finalizeGoal: (id: string) =>
    request<any>(`/api/goals/${id}/finalize`, { method: 'POST' }),
  tts: (text: string) =>
    request<{ audio_url: string; cached: boolean }>('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  /** ASR: base64 audio → { transcript }. Backend decodes at the boundary.
   * Audio uploads are slow on bad networks and Render sleeps: generous
   * timeout plus one wake-retry (transcription is side-effect-free). */
  asr: (audioBase64: string) =>
    request<{ transcript: string }>('/api/asr', {
      method: 'POST',
      body: JSON.stringify({ audio: audioBase64 }),
      timeoutMs: 60000,
      retryOnTimeout: true,
    }),
  getSettings: () => request<any>('/api/settings'),
  updateSettings: (data: Record<string, unknown>) =>
    request<any>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
