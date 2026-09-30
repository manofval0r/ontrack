/** Local reminders + alarms (expo-notifications, no backend needed).
 * Reschedules from Settings: check-in cadence → daytime nudges, active goal
 * deadlines → 1-day-before + morning-of alarms, plus a daily streak ping.
 * Quiet hours (22:00–07:00) are honored by only ever scheduling daytime
 * triggers. Foreground deliveries surface as in-app toasts (see root layout).
 * NOTE: needs a fresh preview build (new native module) + user permission. */
import * as Notifications from 'expo-notifications';

const CHANNEL = 'ontrack-reminders';
const SCOPE = 'ontrack-reminder';

export async function remindersEnabled(): Promise<boolean> {
  try {
    const p = await Notifications.getPermissionsAsync();
    return p.granted;
  } catch {
    return false;
  }
}

export async function requestReminderPermission(): Promise<boolean> {
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'OnTrack reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  } catch {}
  try {
    const p = await Notifications.requestPermissionsAsync();
    return p.granted;
  } catch {
    return false;
  }
}

async function clearAll(): Promise<void> {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      all
        .filter((n) => (n.content.data as any)?.scope === SCOPE)
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
    );
  } catch {}
}

function at(hour: number, minute: number, body: string, title: string, key: string) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true, data: { scope: SCOPE, key } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, hour, minute, repeats: true },
  });
}

function onDate(date: Date, body: string, title: string, key: string) {
  if (date.getTime() <= Date.now()) return Promise.resolve('');
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true, data: { scope: SCOPE, key } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

export interface ReminderInput {
  master: boolean;
  cadence: string;
  quiet: boolean;
  goals: Array<{ id: string | number; title: string; deadline?: string | null; status?: string }>;
}

/** Cancel everything and rebuild the schedule from current settings + goals.
 * Returns the number of notifications scheduled. With interactive=false, never
 * prompts for permission (silent no-op when not granted). */
export async function rescheduleReminders(input: ReminderInput, interactive = true): Promise<number> {
  await clearAll();
  if (!input.master) return 0;
  const granted = await remindersEnabled().catch(() => false);
  if (!granted) {
    if (!interactive) return 0;
    const ok = await requestReminderPermission().catch(() => false);
    if (!ok) return 0;
  }
  let count = 0;
  const done: string[] = [];

  // Check-in nudge schedule (daytime only — quiet hours honored by construction).
  const slots =
    input.cadence === '30min'
      ? [[9, 0], [13, 0], [17, 30], [20, 0]]
      : input.cadence === '1hour'
        ? [[9, 30], [18, 0]]
        : [];
  for (const [h, m] of slots) {
    try {
      await at(h, m, 'Quick check-in: where does your focus goal stand?', 'OnTrack nudge', `checkin-${h}${m}`);
      count++;
    } catch {}
  }

  // Streak ping every morning.
  try {
    await at(8, 0, 'Your streak is alive. Log one thing today.', 'Good morning', 'streak-am');
    count++;
  } catch {}

  // Per-goal deadline alarms (active goals only).
  for (const g of input.goals ?? []) {
    if ((g.status ?? 'active') !== 'active' || !g.deadline) continue;
    const end = new Date(g.deadline);
    if (Number.isNaN(end.getTime()) || end.getTime() <= Date.now()) continue;
    const title = String(g.title).slice(0, 60);
    try {
      const dayBefore = new Date(end.getTime() - 86400000);
      dayBefore.setHours(9, 0, 0, 0);
      await onDate(dayBefore, `"${title}" is due tomorrow. Finish strong.`, 'Deadline tomorrow', `dl-1-${g.id}`);
      const morning = new Date(end);
      morning.setHours(9, 0, 0, 0);
      await onDate(morning, `"${title}" is due today. Ship it.`, 'Due today', `dl-0-${g.id}`);
      count += 2;
      done.push(title);
    } catch {}
  }
  return count;
}
