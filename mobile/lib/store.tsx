/** Goals store — mirrors web GoalContext (goals, dashboard, CRUD, progress).
 * Stale-while-revalidate: last good snapshot paints instantly from SecureStore,
 * network refreshes behind it. Cold starts never stare at skeletons. */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
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
  /** Verdict engine v1: derived score + pass flag, null on pre-engine goals. */
  verdict_score?: number | null;
  verdict_passed?: boolean | null;
  /** Board position (M2): lower = higher priority. */
  board_rank?: number;
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
  deleteGoal: (id: string) => Promise<void>;
  clearError: () => void;
}

const Ctx = createContext<Store | null>(null);
const CACHE_KEY = 'ontrack_cache_v1';
const OFFLINE_QUEUE_KEY = 'ontrack_offline_queue_v1';

interface QueuedMutation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'log' | 'settings' | 'profile' | 'integration';
  payload: any;
  timestamp: number;
  retries: number;
}

// Bulk snapshots (goals cache, offline queue) live in AsyncStorage:
// SecureStore is for small secrets and silently drops large values on some
// Android builds. Session tokens stay in SecureStore (OS keychain). On first
// run after this change, any legacy SecureStore snapshot is migrated over.
async function readQueue(): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch { /* storage full — queue dropped */ }
}

async function enqueue(mutation: Omit<any, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const queue = await readQueue();
  queue.push({ ...mutation, id: `${Date.now()}-${Math.random()}`, timestamp: Date.now(), retries: 0 });
  await writeQueue(queue);
}

async function flushQueue(): Promise<void> {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;
  const queue = await readQueue();
  if (!queue.length) return;
  const next: any[] = [];
  for (const m of queue) {
    try {
      switch (m.type) {
        case 'create': await api.createGoal(m.payload); break;
        case 'update': await api.updateGoal(m.payload.id, m.payload.updates); break;
        case 'delete': await api.deleteGoal(m.payload.id); break;
        case 'log': await api.logProgress(m.payload.goal_id, m.payload.value, m.payload.note); break;
        case 'settings': await api.updateSettings(m.payload); break;
      }
    } catch (e: any) {
      if (m.retries < 3) next.push({ ...m, retries: m.retries + 1 });
      else console.error('[GoalsProvider] Mutation failed permanently:', m, e);
    }
  }
  await writeQueue(next);
}

if (typeof globalThis !== 'undefined') {
  NetInfo.addEventListener((state) => { if (state.isConnected) flushQueue(); });
}

// navigator.onLine does not exist in React Native (undefined = falsy, so a
// naive !navigator.onLine check treats EVERY error as offline). Always ask
// NetInfo instead.
async function isOffline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return !state.isConnected;
  } catch {
    return false;
  }
}

async function readCache(): Promise<{ goals: Goal[]; dashboard: any } | null> {
  try {
    let raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) {
      // One-time migration from the SecureStore era.
      try {
        raw = await SecureStore.getItemAsync(CACHE_KEY);
        if (raw) {
          await AsyncStorage.setItem(CACHE_KEY, raw);
          await SecureStore.deleteItemAsync(CACHE_KEY).catch(() => {});
        }
      } catch { /* no legacy snapshot — cold start */ }
    }
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
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ goals, dashboard, saved_at: Date.now() }));
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
      try {
        const created = await api.createGoal(text);
        await refresh();
        return created;
      } catch (e) {
        if (await isOffline()) {
          const fallbackGoal: any = {
            id: `goal-${Date.now()}`,
            user_id: 'local-user',
            title: text,
            goal_type: 'manual',
            target: 1,
            current_value: 0,
            unit: 'units',
            domain: 'general',
            status: 'active',
            deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            items: [],
            progress_logs: [],
            check_ins: [],
            created_at: new Date().toISOString(),
          };
          setGoals((prev) => [fallbackGoal, ...prev]);
          await enqueue({ type: 'create', payload: text });
          return fallbackGoal;
        }
        throw e;
      }
    },
    [refresh]
  );

  const logProgress = useCallback(
    async (goalId: string, value: number, note?: string) => {
      // Optimistic: paint immediately, reconcile with the server after.
      // Single roundtrip: the follow-up refresh() already refetches state,
      // so no extra getGoal — and callers toast instantly, never on resolve.
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
        await refresh();
        return { current_value: value };
      } catch (e) {
        if (await isOffline()) {
          await enqueue({ type: 'log', payload: { goal_id: goalId, value, note } });
          return { current_value: value };
        }
        setGoals(previous);
        throw e;
      }
    },
    [refresh]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Record<string, unknown>) => {
      try {
        const updated = await api.updateGoal(id, updates);
        await refresh();
        return updated;
      } catch (e) {
        if (await isOffline()) {
          await enqueue({ type: 'update', payload: { id, updates } });
          // Optimistic update already applied in UI via caller
          return { ...updates, id };
        }
        throw e;
      }
    },
    [refresh]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      try {
        await api.deleteGoal(id);
        await refresh();
      } catch (e) {
        if (await isOffline()) {
          await enqueue({ type: 'delete', payload: { id } });
          setGoals((prev) => prev.filter((g) => g.id !== id));
          return;
        }
        throw e;
      }
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
      value={{ goals, dashboard, loading, error, refresh, createGoal, logProgress, updateGoal, finalizeGoal, deleteGoal, clearError: () => setError(null) }}
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