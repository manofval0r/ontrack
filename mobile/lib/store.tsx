/** Goals store — mirrors web GoalContext (goals, dashboard, CRUD, progress).
 * Stale-while-revalidate: last good snapshot paints instantly from SecureStore,
 * network refreshes behind it. Cold starts never stare at skeletons. */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from './api';

export interface Goal {
  id: string;
  title: string;
  goal_type?: string;
  goal_template?: string;
  target?: number | null;
  status?: string;
  deadline?: string | null;
  items?: Array<{ id: string; title: string; completed: boolean }>;
  progress_pct?: number;
  template_context?: { streak_days?: number; commits_this_week?: number; last_activity?: string | null };
  verdict?: string;
  [key: string]: unknown;
}

interface Store {
  goals: Goal[];
  dashboard: any | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createGoal: (text: string) => Promise<any>;
  logProgress: (goalId: string, value: number, note?: string) => Promise<any>;
  updateGoal: (id: string, updates: Record<string, unknown>) => Promise<any>;
  finalizeGoal: (id: string) => Promise<any>;
  clearError: () => void;
}

const Ctx = createContext<Store | null>(null);
const CACHE_KEY = 'ontrack_cache_v1';

async function readCache(): Promise<{ goals: Goal[]; dashboard: any } | null> {
  try {
    const raw = await SecureStore.getItemAsync(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.goals)) return null;
    return { goals: parsed.goals, dashboard: parsed.dashboard ?? null };
  } catch {
    return null;
  }
}

async function writeCache(goals: Goal[], dashboard: any) {
  try {
    await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify({ goals, dashboard, saved_at: Date.now() }));
  } catch {}
}

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instant paint: hydrate from cache, then revalidate behind it.
  useEffect(() => {
    let alive = true;
    readCache().then((cached) => {
      if (alive && cached && goals.length === 0) {
        setGoals(cached.goals);
        setDashboard(cached.dashboard);
      }
    }).catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [goalsResult, dashResult] = await Promise.allSettled([
        api.getGoals(),
        api.getDashboard(),
      ]);
      const g: Goal[] = goalsResult.status === 'fulfilled' ? goalsResult.value : [];
      const d = dashResult.status === 'fulfilled' ? dashResult.value : null;
      if (goalsResult.status === 'rejected' && dashResult.status === 'rejected') {
        throw goalsResult.reason;
      }
      if (goalsResult.status === 'rejected' || dashResult.status === 'rejected') {
        setError('Some data did not sync. Pull to retry.');
      }
      // Enrich bare goal rows with dashboard progress (backend stores no
      // current_value — progress_pct per goal is the source of truth).
      const pctById = new Map<string, number>();
      const tplById = new Map<string, string>();
      for (const a of d?.active_goals ?? []) {
        if (a?.id != null) {
          if (typeof a.progress_pct === 'number') pctById.set(String(a.id), a.progress_pct);
          if (typeof a.goal_template === 'string') tplById.set(String(a.id), a.goal_template);
        }
      }
      setGoals(
        g.map((goal) => ({
          ...goal,
          progress_pct: pctById.get(String(goal.id)) ?? goal.progress_pct,
          goal_template: goal.goal_template ?? tplById.get(String(goal.id)) ?? 'generic',
        }))
      );
      setDashboard(d);
      writeCache(g, d);
    } catch (e: any) {
      setError(e?.error ?? 'Failed to load goals.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(
    async (text: string) => {
      const created = await api.createGoal(text);
      await refresh();
      return created;
    },
    [refresh]
  );

  const logProgress = useCallback(
    async (goalId: string, value: number, note?: string) => {
      // Optimistic: paint immediately, reconcile with the server after.
      let previous: Goal[] = [];
      setGoals((prev) => {
        previous = prev;
        return prev.map((g) =>
          String(g.id) === String(goalId)
            ? { ...g, current_value: value, progress_pct: g.target ? Math.min(100, Math.round((value / g.target) * 100)) : g.progress_pct }
            : g
        );
      });
      try {
        await api.logProgress(goalId, value, note);
        const updated = await api.getGoal(goalId);
        await refresh();
        return updated;
      } catch (e) {
        setGoals(previous);
        throw e;
      }
    },
    [refresh]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Record<string, unknown>) => {
      const updated = await api.updateGoal(id, updates);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const finalizeGoal = useCallback(
    async (id: string) => {
      const done = await api.finalizeGoal(id);
      await refresh();
      return done;
    },
    [refresh]
  );

  return (
    <Ctx.Provider
      value={{ goals, dashboard, loading, error, refresh, createGoal, logProgress, updateGoal, finalizeGoal, clearError: () => setError(null) }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useGoals() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGoals must be used within GoalsProvider');
  return ctx;
}
