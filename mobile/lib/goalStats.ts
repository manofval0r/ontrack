/** Goal-detail math: deadline countdown + honest 7-day activity strip. */
import { Brand } from '../constants/colors';

export function daysLeft(deadline: any): string | null {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  if (ms < 0) return 'Past due';
  const d = Math.floor(ms / 86400000);
  if (d > 1) return `${d} days left`;
  const h = Math.floor(ms / 3600000);
  if (h > 1) return `${h} hours left`;
  return 'Due soon';
}

/** Per-day counts from dashboard history — no fabricated data. */
export function weekStrip(history: any[], goalId: string): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  for (const h of history ?? []) {
    if (String(h.goal_id) !== String(goalId)) continue;
    const t = new Date(h.logged_at).getTime();
    if (Number.isNaN(t)) continue;
    const dayDiff = Math.floor((now.getTime() - t) / 86400000);
    if (dayDiff >= 0 && dayDiff < 7) counts[6 - dayDiff] += 1;
  }
  return counts;
}

export function stripColor(n: number): string {
  if (n <= 0) return Brand.gray;
  if (n === 1) return Brand.mint;
  if (n <= 3) return Brand.turquoise;
  return Brand.teal;
}

/** Pace vs deadline: where you should be (0..1 elapsed) vs where you are.
 * Returns nulls when no usable deadline — the dial then shows progress only. */
export function paceInfo(
  goal: any,
  pct: number
): { expected: number | null; delta: number | null; label: string } {
  const end = new Date(goal?.deadline).getTime();
  const startSrc = goal?.start_at ?? goal?.created_at;
  const start = startSrc ? new Date(startSrc).getTime() : NaN;
  if (Number.isNaN(end) || Number.isNaN(start) || end <= start) {
    return { expected: null, delta: null, label: 'No deadline' };
  }
  const expected = Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
  const delta = pct / 100 - expected;
  if (end < Date.now()) {
    return { expected, delta, label: pct >= 100 ? 'Shipped' : 'Past due' };
  }
  if (delta >= 0.1) return { expected, delta, label: `Ahead +${Math.round(delta * 100)}` };
  if (delta <= -0.1) return { expected, delta, label: `Behind ${Math.round(delta * 100)}` };
  return { expected, delta, label: 'On pace' };
}
