/** Django API client — same contracts + {error, code} envelope as web services/api.ts. */
import { getToken } from './auth';
import { API_URL } from './config';

export interface StandardError {
  error: string;
  code: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string> | undefined) ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: StandardError = {
      error: (body as any)?.error ?? `HTTP ${res.status}`,
      code: (body as any)?.code ?? 'API_ERROR',
    };
    throw err;
  }
  return body as T;
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
  logProgress: (goal_id: string, value: number, note?: string) =>
    request('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ goal_id, value, note: note ?? '' }),
    }),
  getDashboard: () => request<any>('/api/dashboard'),
  parseGoal: (prompt: string) =>
    request<{ ai_response_text: string; goal_proposal: any }>('/api/chat/parse-goal', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
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
  /** ASR: base64 audio → { transcript }. Backend decodes at the boundary. */
  asr: (audioBase64: string) =>
    request<{ transcript: string }>('/api/asr', {
      method: 'POST',
      body: JSON.stringify({ audio: audioBase64 }),
    }),
  getSettings: () => request<any>('/api/settings'),
  updateSettings: (data: Record<string, unknown>) =>
    request<any>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
