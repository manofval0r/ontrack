import type { Goal, ProgressLog, WeeklyActivityDay } from '../types'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function executionPercent(goals: Goal[]): number {
  const active = goals.filter((g) => g.status === 'active')
  const pool = active.length ? active : goals
  if (!pool.length) return 0
  const rates = pool.map((g) => (g.target > 0 ? Math.min(1, g.current_value / g.target) : g.status === 'completed' ? 1 : 0))
  return Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 1000) / 10
}

export function allProgressLogs(goals: Goal[]): Array<ProgressLog & { goalTitle: string; goalStatus: Goal['status'] }> {
  return goals
    .flatMap((g) =>
      (g.progress_logs ?? []).map((log) => ({
        ...log,
        goalTitle: g.title,
        goalStatus: g.status,
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function logsByDate(goals: Goal[]): Record<string, { completed: number; pending: number; titles: string[] }> {
  const map: Record<string, { completed: number; pending: number; titles: string[] }> = {}
  const bump = (iso: string, completed: boolean, title: string) => {
    const key = iso.slice(0, 10)
    if (!key) return
    if (!map[key]) map[key] = { completed: 0, pending: 0, titles: [] }
    if (completed) map[key].completed += 1
    else map[key].pending += 1
    if (!map[key].titles.includes(title)) map[key].titles.push(title)
  }
  for (const g of goals) {
    for (const log of g.progress_logs ?? []) {
      bump(log.timestamp, g.status === 'completed', g.title)
    }
    if (g.deadline) bump(g.deadline, g.status === 'completed', g.title)
    if (g.created_at) bump(g.created_at, false, g.title)
  }
  return map
}

export function monthlyVelocity(goals: Goal[]): { month: string; completed: number; inProgress: number }[] {
  const now = new Date()
  const buckets: { month: string; key: string; completed: number; inProgress: number }[] = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      month: MONTH_SHORT[d.getMonth()],
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      completed: 0,
      inProgress: 0,
    })
  }
  const index = Object.fromEntries(buckets.map((b, i) => [b.key, i]))
  for (const g of goals) {
    const created = (g.created_at || '').slice(0, 7)
    const i = index[created]
    if (i !== undefined) {
      if (g.status === 'completed') buckets[i].completed += 1
      else if (g.status === 'active') buckets[i].inProgress += 1
    }
    for (const log of g.progress_logs ?? []) {
      const key = (log.timestamp || '').slice(0, 7)
      const li = index[key]
      if (li === undefined) continue
      if (g.status === 'completed') buckets[li].completed += 1
      else buckets[li].inProgress += 1
    }
  }
  return buckets.map(({ month, completed, inProgress }) => ({ month, completed, inProgress }))
}

export function weeklyFromGoals(goals: Goal[]): WeeklyActivityDay[] {
  const days: WeeklyActivityDay[] = []
  const today = new Date()
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    const logs = allProgressLogs(goals).filter((l) => (l.timestamp || '').slice(0, 10) === date)
    days.push({
      day: names[d.getDay()],
      date,
      completed_count: logs.filter((l) => l.goalStatus === 'completed').length,
      logged_count: logs.length,
      isToday: i === 0,
    })
  }
  return days
}

export function formatLogTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
