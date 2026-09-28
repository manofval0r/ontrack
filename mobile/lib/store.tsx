/** Goals store — mirrors web GoalContext (goals, dashboard, CRUD, progress). */
import React, { createContext, useCallback, useContext, useState } from 'react';
import { api } from './api';

interface Store {
  goals: any[];
  dashboard: any | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createGoal: (text: string) => Promise<any>;
  logProgress: (goalId: string, value: number, note?: string) => Promise<any>;
  finalizeGoal: (id: string) => Promise<any>;
  clearError: () => void;
}

const Ctx = createContext<Store | null>(null);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [g, d] = await Promise.all([
        api.getGoals().catch(() => []),
        api.getDashboard().catch(() => null),
      ]);
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
        (g as any[]).map((goal) => ({
          ...goal,
          progress_pct: pctById.get(String(goal.id)) ?? goal.progress_pct,
          goal_template: goal.goal_template ?? tplById.get(String(goal.id)) ?? 'generic',
        }))
      );
      setDashboard(d);
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
      await api.logProgress(goalId, value, note);
      // Re-read the goal, then re-merge dashboard progress (detail payload
      // carries no progress value on its own).
      const updated = await api.getGoal(goalId);
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
      value={{ goals, dashboard, loading, error, refresh, createGoal, logProgress, finalizeGoal, clearError: () => setError(null) }}
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
