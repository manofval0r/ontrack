/** Google Calendar helpers — called with the user's OAuth token (calendar.events
 * scope, granted at connect). Creates deadline events client-side; no backend
 * proxy needed. */
const CAL = 'https://www.googleapis.com/calendar/v3';

async function cal(method: string, path: string, token: string, body?: unknown): Promise<any> {
  const res = await fetch(`${CAL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw { error: `Calendar rejected the request (HTTP ${res.status}). Reconnect.`, code: 'CALENDAR_ERROR' };
  }
  return res.json().catch(() => ({}));
}

export async function createDeadlineEvent(
  token: string,
  goal: { title: string; deadline?: string | null; target?: number | null }
): Promise<string | null> {
  if (!goal.deadline) return null;
  const body = await cal('POST', '/calendars/primary/events', token, {
    summary: `OnTrack: ${goal.title}`,
    description: `Goal deadline${goal.target ? ` — target ${goal.target}` : ''}. Logged in OnTrack.`,
    start: { dateTime: new Date(goal.deadline).toISOString() },
    end: { dateTime: new Date(new Date(goal.deadline).getTime() + 3600000).toISOString() },
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 * 24 }] },
  });
  return typeof body?.id === 'string' ? body.id : null;
}
