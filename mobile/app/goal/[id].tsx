/** M8 Goal Detail — personalized per goal_template (never a per-goal redesign).
 * github_checklist renders GitHub-profile-style (repo, streak, commits, week
 * strip); other templates get their own header voice + units. Progress is
 * derived (backend stores no current_value): checklist counts items,
 * counters use dashboard progress_pct, manual uses activity. */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '../../constants/colors';
import { Radii, Spacing } from '../../constants/spacing';
import { Card, PillButton, StatusPill } from '../../components/ui';
import { TrackerBody } from '../../components/TrackerBody';
import { api } from '../../lib/api';
import { useGoals } from '../../lib/store';
import { displayProgress, templateMeta } from '../../lib/templates';

function daysLeft(deadline: any): string | null {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  if (ms < 0) return 'past due';
  const d = Math.floor(ms / 86400000);
  if (d > 1) return `${d} days left`;
  const h = Math.floor(ms / 3600000);
  if (h > 1) return `${h}h left`;
  return 'due soon';
}

/** Honest 7-day strip from dashboard history (no fabricated per-day data). */
function weekStrip(history: any[], goalId: string): number[] {
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

function stripColor(n: number): string {
  if (n <= 0) return Brand.gray;
  if (n === 1) return '#99F6E4';
  if (n <= 3) return Brand.turquoise;
  return Brand.teal;
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: Brand.grayCanvas, borderWidth: 2, borderColor: Brand.navy, borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}>
      <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 20, color: Brand.navy }}>{value}</Text>
      <Text style={{ fontSize: 11, fontWeight: '600', color: Brand.teal, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export default function GoalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { finalizeGoal, dashboard } = useGoals();
  const [goal, setGoal] = useState<any | null>(null);
  const [github, setGithub] = useState<any | null>(null);
  const [checkin, setCheckin] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getGoal(String(id)).then(setGoal).catch(() => {});
    api
      .getSettings()
      .then((s) => {
        const gh = (s?.integrations ?? []).find((i: any) => i?.id === 'github');
        if (gh) setGithub(gh);
      })
      .catch(() => {});
  }, [id]);

  const onCheckin = async () => {
    if (!id) return;
    try {
      setBusy(true);
      const res = await api.checkin(String(id));
      setCheckin(res.check_in_message);
    } catch {
      setCheckin('Checked in. Log your latest progress — consistency beats intensity.');
    } finally {
      setBusy(false);
    }
  };

  const onFinalize = async () => {
    if (!id) return;
    try {
      setBusy(true);
      const done = await finalizeGoal(String(id));
      setGoal((prev: any) => ({ ...prev, ...done }));
    } finally {
      setBusy(false);
    }
  };

  if (!goal) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.grayCanvas }}>
        <ActivityIndicator color={Brand.turquoise} />
      </SafeAreaView>
    );
  }

  const meta = templateMeta(goal);
  const prog = displayProgress(goal);
  const ctx = goal.template_context ?? {};
  const left = daysLeft(goal.deadline);
  const history: any[] = dashboard?.history ?? [];
  const strip = weekStrip(history, goal.id);
  const goalLogs = history.filter((h) => String(h.goal_id) === String(goal.id)).slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Ionicons name="chevron-back" size={20} color={Brand.navy} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: Brand.navy }}>Back</Text>
        </Pressable>

        {/* ── Template-personalized header ─────────────────────────── */}
        {meta.github ? (
          <View style={{ backgroundColor: Brand.navy, borderWidth: 2, borderColor: Brand.navy, borderRadius: 20, padding: Spacing.lg, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Brand.turquoise, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="logo-github" size={26} color={Brand.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }} numberOfLines={2}>
                  {goal.title}
                </Text>
                <Text style={{ fontSize: 12, color: Brand.turquoise, fontWeight: '600', marginTop: 2 }}>
                  {github?.connected ? `${github.repo ?? 'ontrack'} · ${github.branch ?? 'main'}` : 'GitHub not connected'}
                  {left ? ` · ${left}` : ''}
                </Text>
              </View>
              <StatusPill status={goal.status} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 20, color: '#fff' }}>{ctx.streak_days ?? 0}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: Brand.turquoise }}>day streak</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 20, color: '#fff' }}>{ctx.commits_this_week ?? 0}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: Brand.turquoise }}>logs this week</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 20, color: '#fff' }}>{prog.pct}%</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: Brand.turquoise }}>shipped</Text>
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
                ACTIVITY · LAST 7 DAYS
              </Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {strip.map((n, i) => (
                  <View key={i} style={{ flex: 1, height: 26, borderRadius: 6, backgroundColor: stripColor(n), borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }} />
                ))}
              </View>
            </View>
          </View>
        ) : (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Ionicons name={meta.icon} size={24} color={Brand.teal} />
              <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 20, color: Brand.navy, flex: 1 }} numberOfLines={2}>
                {goal.title}
              </Text>
              <StatusPill status={goal.status} />
            </View>
            <Text style={{ marginTop: 6, fontSize: 13, fontWeight: '600', color: Brand.teal }}>
              {meta.label} · {meta.tagline}
            </Text>
            <Text style={{ marginTop: 4, color: Brand.navy, opacity: 0.7, fontSize: 13 }}>
              {prog.current}/{prog.target ?? '—'} {meta.unit}
              {left ? ` · ${left}` : ''}
            </Text>
            <View style={{ marginTop: 10, flexDirection: 'row', gap: 8 }}>
              <StatTile value={String(ctx.streak_days ?? 0)} label="day streak" />
              <StatTile value={String(ctx.commits_this_week ?? 0)} label="logs this week" />
              <StatTile value={`${prog.pct}%`} label="shipped" />
            </View>
          </Card>
        )}

        <Card>
          <TrackerBody goal={goal} onChanged={setGoal} />
        </Card>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PillButton title={busy ? '…' : 'Check in'} onPress={onCheckin} disabled={busy} />
          </View>
          <View style={{ flex: 1 }}>
            <PillButton title="Work-block" primary onPress={() => router.push({ pathname: '/work-block', params: { id: String(goal.id), title: goal.title } })} />
          </View>
        </View>

        {checkin && (
          <Card>
            <Text style={{ fontWeight: '700', color: Brand.teal }}>Coach check-in</Text>
            <Text style={{ marginTop: 4, color: Brand.navy }}>{checkin}</Text>
          </Card>
        )}

        {goalLogs.length > 0 && (
          <Card>
            <Text style={{ fontWeight: '700', color: Brand.navy, marginBottom: 8 }}>Recent activity</Text>
            {goalLogs.map((log: any) => (
              <View key={String(log.id)} style={{ flexDirection: 'row', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: 'rgba(7,30,45,0.08)' }}>
                <Ionicons name="ellipse" size={10} color={Brand.turquoise} style={{ marginTop: 5 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: Brand.navy, fontWeight: '600' }}>
                    +{log.value} {meta.unit}
                  </Text>
                  {!!log.note && (
                    <Text style={{ fontSize: 12, color: Brand.navy, opacity: 0.65 }} numberOfLines={2}>
                      {log.note}
                    </Text>
                  )}
                  <Text style={{ fontSize: 11, color: Brand.navy, opacity: 0.45 }}>
                    {String(log.logged_at).slice(0, 16).replace('T', ' ')}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {goal.verdict ? (
          <Card>
            <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 18, color: Brand.navy }}>Verdict</Text>
            <Text style={{ marginTop: 4, color: Brand.navy }}>{String(goal.verdict)}</Text>
          </Card>
        ) : (
          <PillButton title="Finalize & get verdict" onPress={onFinalize} disabled={busy} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
