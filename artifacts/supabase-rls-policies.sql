-- OnTrack RLS defense-in-depth (Supabase SQL editor, ~1 min, re-runnable).
--
-- Context: Django connects with the service_role key (bypasses RLS) and
-- enforces ownership itself (every query scoped to request.user_id, verified
-- in apps/goals/views.py + apps/accounts/integrations.py). These policies add
-- a second perimeter for the anon/authenticated Data API path, which is
-- currently RLS-on-with-zero-policies (default-deny: safe, but accidental —
-- one permissive policy later could silently open a table).
--
-- Design: authenticated users touch ONLY their own rows (auth.uid() = the
-- Supabase user UUID Django stores as user_id). anon gets nothing (no
-- policies = deny). service_role bypasses RLS as before, so Django is
-- unaffected. goals_audiocache is DELIBERATELY left without policies
-- (global, unowned cache that can hold user reflections — service_role only).
-- NOTE: some databases have no public.profiles table (Supabase-owned,
-- env-dependent) — its block is gated on existence, safe to run anywhere.
--
-- Safe to re-run: every policy is dropped first. Run as the postgres /
-- dashboard SQL editor role, then re-check the security advisor.

-- ── 1. Belt-and-braces: RLS on (no-op if already enabled) ────────────────
ALTER TABLE public.goals_goal         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals_goalitem     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals_progresslog  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals_checkin      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals_audiocache   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_integration ENABLE ROW LEVEL SECURITY;
-- profiles is Supabase-owned and absent in some environments: gate it.
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- ── 2. Owner-scoped policies (authenticated role only) ────────────────────
DROP POLICY IF EXISTS owner_all ON public.goals_goal;
CREATE POLICY owner_all ON public.goals_goal
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS owner_all ON public.accounts_integration;
CREATE POLICY owner_all ON public.accounts_integration
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS owner_all ON public.goals_progresslog;
CREATE POLICY owner_all ON public.goals_progresslog
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- profiles: gated — absent in some environments (Supabase-owned table).
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS owner_all ON public.profiles';
    EXECUTE $pol$
      CREATE POLICY owner_all ON public.profiles
        FOR ALL TO authenticated
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid())
    $pol$;
  END IF;
END $$;

-- Child rows inherit ownership through the parent goal (no user_id column).
DROP POLICY IF EXISTS owner_via_goal ON public.goals_goalitem;
CREATE POLICY owner_via_goal ON public.goals_goalitem
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.goals_goal g
    WHERE g.id = goals_goalitem.goal_id AND g.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.goals_goal g
    WHERE g.id = goals_goalitem.goal_id AND g.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS owner_via_goal ON public.goals_checkin;
CREATE POLICY owner_via_goal ON public.goals_checkin
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.goals_goal g
    WHERE g.id = goals_checkin.goal_id AND g.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.goals_goal g
    WHERE g.id = goals_checkin.goal_id AND g.user_id = auth.uid()
  ));

-- goals_audiocache: intentionally NO policy (service_role/Django only).

-- ── 3. Close the RLS bypass: TRUNCATE ignores policies ───────────────────
-- anon/authenticated still hold broad table grants (needed so the policies
-- above are usable), but TRUNCATE is never needed through PostgREST and it
-- bypasses RLS entirely. Revoke it; everything else stays so Django,
-- dashboard, and the owner policies keep working unchanged.
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- ── 4. Verify (run these, expect the noted results) ───────────────────────
-- Coverage: every public table RLS-on with >=1 policy, except the
-- deliberately locked goals_audiocache (and Django-internal tables):
--   SELECT tablename, rowsecurity FROM pg_tables
--     WHERE schemaname = 'public' ORDER BY tablename;
--   SELECT tablename, COUNT(*) FROM pg_policies
--     WHERE schemaname = 'public' GROUP BY tablename ORDER BY tablename;
-- Grants: no TRUNCATE left for anon/authenticated on any public table:
--   SELECT table_name, grantee, privilege_type FROM information_schema.role_table_grants
--     WHERE grantee IN ('anon', 'authenticated') AND privilege_type = 'TRUNCATE';
--   -- expect 0 rows.
-- Negative test with the ANON key (REST): SELECT from any table must
-- return 0 rows. Positive test with a user JWT: only own rows visible.
-- Then re-run the security advisor: rls_enabled_no_policy INFO rows for
-- these tables should clear; goals_audiocache keeps its INFO (by design).
