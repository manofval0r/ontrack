/** Template display meta — selects copy/icons/units per goal_template.
 * Templates choose presentation only (never a per-goal LLM redesign). */
import type { Ionicons } from '@expo/vector-icons';

export type TemplateKey =
  | 'sales_counter'
  | 'fitness_counter'
  | 'github_checklist'
  | 'study_checklist'
  | 'reflection_manual'
  | 'generic';

export interface TemplateMeta {
  label: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  tagline: string;
  github: boolean;
}

const META: Record<TemplateKey, TemplateMeta> = {
  sales_counter: {
    label: 'Sales pipeline',
    unit: 'deals',
    icon: 'briefcase',
    tagline: 'Pipeline momentum — every close moves the number.',
    github: false,
  },
  fitness_counter: {
    label: 'Training log',
    unit: 'reps',
    icon: 'barbell',
    tagline: 'Consistency beats intensity. Log every session.',
    github: false,
  },
  github_checklist: {
    label: 'Ship log',
    unit: 'tasks',
    icon: 'logo-github',
    tagline: 'Commits are proof. Ship small, ship often.',
    github: true,
  },
  study_checklist: {
    label: 'Reading list',
    unit: 'books',
    icon: 'book',
    tagline: 'Finish what you start, one chapter at a time.',
    github: false,
  },
  reflection_manual: {
    label: 'Daily log',
    unit: 'entries',
    icon: 'journal',
    tagline: 'Write it down. Awareness compounds.',
    github: false,
  },
  generic: {
    label: 'Tracker',
    unit: 'units',
    icon: 'flag',
    tagline: 'Small steps, logged daily.',
    github: false,
  },
};

export function templateOf(goal: any): TemplateKey {
  const t = goal?.goal_template;
  return (Object.keys(META) as TemplateKey[]).includes(t) ? t : 'generic';
}

export function templateMeta(goal: any): TemplateMeta {
  return META[templateOf(goal)];
}

/** Display progress, preferring the backend-computed current_value.
 * Falls back to dashboard progress_pct, then checklist item counts. */
export function displayProgress(goal: any): { current: number; target: number | null; pct: number } {
  const target = typeof goal?.target === 'number' ? goal.target : null;
  if (typeof goal?.current_value === 'number') {
    const pct = target ? Math.min(100, Math.round((goal.current_value / target) * 100)) : 0;
    return { current: goal.current_value, target, pct };
  }
  const items: any[] = Array.isArray(goal?.items) ? goal.items : [];
  if (goal?.goal_type === 'checklist' && items.length > 0) {
    const done = items.filter((i) => i.completed).length;
    return { current: done, target: items.length, pct: Math.round((done / items.length) * 100) };
  }
  if (typeof goal?.progress_pct === 'number') {
    const pct = Math.max(0, Math.min(100, goal.progress_pct));
    const current = target ? Math.round((pct / 100) * target) : 0;
    return { current, target, pct };
  }
  return { current: 0, target, pct: 0 };
}
