/** Integration detail — what we access, per-capability toggles, live data,
 * and sync actions. GitHub: repos, commits, PRs/issues, log-to-goal.
 * Calendar: deadline sync. Tokens stay in SecureStore; vault holds a copy. */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Brand } from '../../constants/colors';
import { useTheme } from '../../lib/theme';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Card, PillButton } from '../../components/ui';
import { api } from '../../lib/api';
import { getProviderToken } from '../../lib/auth';
import { listRepos, openCounts, recentCommits, type GhCommit, type GhRepo } from '../../lib/github';
import { createDeadlineEvent } from '../../lib/calendar';
import { displayProgress } from '../../lib/templates';
import { useGoals } from '../../lib/store';

const CAPS_KEY = (p: string) => `ontrack_caps_${p}`;

const CAP_DEFS: Record<string, Array<{ id: string; label: string; hint: string }>> = {
  github: [
    { id: 'showRepos', label: 'Show my repositories', hint: 'List repos updated recently' },
    { id: 'showCommits', label: 'Show recent commits', hint: 'Last 7 days per selected repo' },
    { id: 'autoLog', label: 'One-tap commit logging', hint: 'Enable the sync-to-goal action below' },
  ],
  'google-cal': [
    { id: 'syncDeadlines', label: 'Sync goal deadlines', hint: 'Create calendar events with 24h reminders' },
    { id: 'checkinNudges', label: 'Check-in nudges', hint: 'Reserved for scheduled reminders' },
  ],
};

export default function IntegrationDetail() {
  const t = useTheme();
  const { provider } = useLocalSearchParams<{ provider: string }>();
  const key = provider === 'google-cal' ? 'google-cal' : 'github';
  const { goals, logProgress } = useGoals();
  const [row, setRow] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [caps, setCaps] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<GhRepo[]>([]);
  const [repo, setRepo] = useState<string | null>(null);
  const [commits, setCommits] = useState<GhCommit[]>([]);
  const [counts, setCounts] = useState<{ prs: number; issues: number } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [calResults, setCalResults] = useState<string | null>(null);
  const [syncGoalId, setSyncGoalId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, t, c] = await Promise.all([
          api.getSettings().catch(() => null),
          getProviderToken(key),
          SecureStore.getItemAsync(CAPS_KEY(key)).catch(() => null),
        ]);
        const found = (s?.integrations ?? []).find((i: any) => i.id === key || i.provider === key) ?? null;
        setRow(found);
        setToken(t);
        const defs = CAP_DEFS[key] ?? [];
        const saved = c ? JSON.parse(c) : {};
        const initial: Record<string, boolean> = {};
        defs.forEach((d, i) => {
          initial[d.id] = typeof saved[d.id] === 'boolean' ? saved[d.id] : i < 2;
        });
        setCaps(initial);
        if (key === 'github' && found?.connected && t) {
          const r = found.repo && typeof found.repo === 'string' && found.repo.includes('/')
            ? found.repo
            : null;
          const list = await listRepos(t).catch(() => [] as GhRepo[]);
          setRepos(list);
          const pick = r ?? list[0]?.full_name ?? null;
          setRepo(pick);
          if (pick) {
            const [cm, oc] = await Promise.all([
              recentCommits(t, pick).catch(() => [] as GhCommit[]),
              openCounts(t, pick).catch(() => null),
            ]);
            setCommits(cm);
            setCounts(oc);
          }
        }
      } catch (e: any) {
        setError(e?.error ?? 'Could not load integration.');
      } finally {
        setLoading(false);
      }
    })();
  }, [key]);

  const loadRepoData = async (fullName: string, tk: string) => {
    setRepo(fullName);
    setCommits([]);
    setCounts(null);
    const [cm, oc] = await Promise.all([
      recentCommits(tk, fullName).catch(() => [] as GhCommit[]),
      openCounts(tk, fullName).catch(() => null),
    ]);
    setCommits(cm);
    setCounts(oc);
  };

  const toggleCap = async (id: string, v: boolean) => {
    const next = { ...caps, [id]: v };
    setCaps(next);
    try {
      await SecureStore.setItemAsync(CAPS_KEY(key), JSON.stringify(next));
    } catch {}
  };

  const syncCommitsToGoal = async () => {
    const g = goals.find((x) => String(x.id) === syncGoalId);
    if (!g || commits.length === 0 || !token) return;
    try {
      setSyncing(true);
      setSyncMsg(null);
      const prog = displayProgress(g);
      const note = `Synced ${commits.length} commits from ${repo}: ${commits.slice(0, 3).map((c) => c.sha.slice(0, 7)).join(', ')}`;
      await logProgress(String(g.id), prog.current + commits.length, note);
      setSyncMsg(`Logged +${commits.length} to "${g.title}".`);
    } catch (e: any) {
      setSyncMsg(e?.error ?? 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const syncDeadlines = async () => {
    if (!token) return;
    try {
      setSyncing(true);
      setCalResults(null);
      const withDeadlines = goals.filter((g) => g.status === 'active' && g.deadline);
      let made = 0;
      for (const g of withDeadlines) {
        const id = await createDeadlineEvent(token, { title: g.title, deadline: g.deadline, target: g.target }).catch(() => null);
        if (id) made += 1;
      }
      setCalResults(`Created ${made} of ${withDeadlines.length} deadline events.`);
    } catch (e: any) {
      setCalResults(e?.error ?? 'Calendar sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const isGithub = key === 'github';
  const ghGoals = goals.filter((g) => g.status === 'active' && (g.goal_template === 'github_checklist' || g.goal_type === 'counter'));

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.canvas }}>
        <ActivityIndicator color={Brand.turquoise} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: 12, paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Go back" accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44 }}>
          <Ionicons name="chevron-back" size={20} color={t.ink} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: t.ink }}>Back</Text>
        </Pressable>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name={isGithub ? 'logo-github' : 'calendar'} size={28} color={t.ink} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: Typography.title.fontFamily, fontSize: 20, color: t.ink }}>
                {isGithub ? 'GitHub' : 'Google Calendar'}
              </Text>
              <Text style={{ fontSize: 12, color: row?.connected ? t.teal : t.inkSoft, fontWeight: '600' }}>
                {row?.connected ? row.status_label ?? 'Connected' : 'Not connected'}
              </Text>
            </View>
          </View>
          <Text style={{ marginTop: 8, fontSize: 13, color: t.inkSoft }}>
            {isGithub
              ? 'OnTrack reads your repos, commits, PRs and issues to verify shipping — and can log commits as goal progress. Tokens stay on your device and in the server vault; never anywhere else.'
              : 'OnTrack creates deadline events with 24-hour reminders, and can post check-in nudges inside your quiet hours. Only the access you granted is used.'}
          </Text>
        </Card>

        {error && (
          <Card>
            <Text accessibilityLiveRegion="polite" style={{ color: Brand.error, fontSize: 13 }}>{error}</Text>
          </Card>
        )}

        <Card>
          <Text style={{ fontWeight: '700', color: t.ink }}>What OnTrack may use</Text>
          {(CAP_DEFS[key] ?? []).map((c) => (
            <View key={c.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, minHeight: Touch.min }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.ink, fontWeight: '600' }}>{c.label}</Text>
                <Text style={{ color: t.inkSoft, fontSize: 12 }}>{c.hint}</Text>
              </View>
              <Switch
                value={!!caps[c.id]}
                onValueChange={(v) => toggleCap(c.id, v)}
                trackColor={{ true: Brand.turquoise }}
                accessibilityLabel={c.label}
                accessibilityRole="switch"
                accessibilityState={{ checked: !!caps[c.id] }}
              />
            </View>
          ))}
        </Card>

        {isGithub && row?.connected && (
          <Card>
            <Text style={{ fontWeight: '700', color: t.ink }}>Repositories</Text>
            {caps.showRepos !== false && repos.length === 0 && (
              <Text style={{ marginTop: 6, fontSize: 13, color: t.inkSoft }}>No repos found on this account.</Text>
            )}
            {caps.showRepos !== false && repos.slice(0, 5).map((r) => (
              <Pressable
                key={r.id}
                onPress={() => token && loadRepoData(r.full_name, token)}
                accessibilityLabel={`Select repo ${r.full_name}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: repo === r.full_name }}
                style={{ marginTop: 8, borderWidth: 2, borderColor: repo === r.full_name ? Brand.turquoise : t.border, borderRadius: Radii.input, padding: 10 }}
              >
                <Text style={{ fontWeight: '700', color: t.ink, fontSize: 13 }}>{r.full_name}</Text>
                <Text style={{ fontSize: 11, color: t.inkSoft }}>updated {String(r.updated_at).slice(0, 10)}</Text>
              </Pressable>
            ))}
            {caps.showCommits !== false && (
              <>
                <Text style={{ fontWeight: '700', color: t.ink, marginTop: 12 }}>
                  Recent commits{repo ? ` · ${repo}` : ''} {counts ? `· ${counts.prs} open PRs · ${counts.issues} open issues` : ''}
                </Text>
                {commits.length === 0 && (
                  <Text style={{ marginTop: 6, fontSize: 13, color: t.inkSoft }}>No commits in the last 7 days.</Text>
                )}
                {commits.slice(0, 8).map((c) => (
                  <View key={c.sha} style={{ marginTop: 6, borderTopWidth: 1, borderTopColor: Brand.hairline, paddingTop: 6 }}>
                    <Text style={{ fontSize: 13, color: t.ink, fontWeight: '600' }} numberOfLines={1}>
                      {c.commit.message.split('\n')[0]}
                    </Text>
                    <Text style={{ fontSize: 11, color: t.inkSoft }}>
                      {c.sha.slice(0, 7)} · {String(c.commit.author?.date ?? '').slice(0, 10)}
                    </Text>
                  </View>
                ))}
              </>
            )}
            {caps.autoLog !== false && commits.length > 0 && (
              <>
                <Text style={{ fontWeight: '700', color: t.ink, marginTop: 12 }}>Log commits to a goal</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
                  {ghGoals.slice(0, 5).map((g) => (
                    <Pressable
                      key={String(g.id)}
                      onPress={() => setSyncGoalId(String(g.id))}
                      accessibilityLabel={`Sync to ${g.title}`}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: syncGoalId === String(g.id) }}
                      style={{ borderWidth: 2, borderColor: syncGoalId === String(g.id) ? Brand.turquoise : t.border, borderRadius: Radii.pill, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: t.surface }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: t.ink }} numberOfLines={1}>{g.title}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <PillButton
                  title={syncing ? 'Syncing…' : `Log ${commits.length} commits`}
                  primary
                  onPress={syncCommitsToGoal}
                  disabled={syncing || !syncGoalId}
                />
                {!!syncMsg && <Text style={{ marginTop: 6, fontSize: 13, color: t.teal, fontWeight: '600' }}>{syncMsg}</Text>}
              </>
            )}
          </Card>
        )}

        {!isGithub && row?.connected && (
          <Card>
            <Text style={{ fontWeight: '700', color: t.ink }}>Deadline sync</Text>
            <Text style={{ fontSize: 13, color: t.inkSoft, marginTop: 4 }}>
              Creates one event per active goal with a deadline, with a 24-hour reminder.
            </Text>
            <View style={{ marginTop: 10 }}>
              <PillButton
                title={syncing ? 'Syncing…' : 'Sync all deadlines now'}
                primary
                onPress={syncDeadlines}
                disabled={syncing || !token || caps.syncDeadlines === false}
                accessibilityHint={caps.syncDeadlines === false ? 'Enable sync-deadlines above first' : 'Creates calendar events for every active dated goal'}
              />
            </View>
            {!!calResults && <Text style={{ marginTop: 6, fontSize: 13, color: t.teal, fontWeight: '600' }}>{calResults}</Text>}
          </Card>
        )}

        {!row?.connected && (
          <Card>
            <Text style={{ fontSize: 13, color: t.inkSoft }}>
              Connect from Settings to unlock live data and sync actions here.
            </Text>
            <View style={{ marginTop: 10 }}>
              <PillButton title="Back to Settings" onPress={() => router.replace('/(tabs)/settings')} />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
