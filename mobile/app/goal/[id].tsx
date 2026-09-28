/** M8 Goal Detail — personalized per goal_template (never a per-goal redesign).
 * github_checklist renders GitHub-profile-style (repo, streak, commits, week
 * strip); other templates get their own header voice + units. Progress is
 * derived (backend stores no current_value): checklist counts items,
 * counters use dashboard progress_pct, manual uses activity. */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Brand } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Card, PillButton } from '../../components/ui';
import { ConfettiBurst } from '../../components/Confetti';
import { TrackerBody } from '../../components/TrackerBody';
import { ActivitySection, GoalHeaderCard, GithubHeader } from '../../components/GoalDetailSections';
import { api } from '../../lib/api';
import { useGoals } from '../../lib/store';
import { displayProgress, templateMeta } from '../../lib/templates';
import { daysLeft, stripColor, weekStrip } from '../../lib/goalStats';

export default function GoalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { finalizeGoal, dashboard } = useGoals();
  const [goal, setGoal] = useState<any | null>(null);
  const [github, setGithub] = useState<any | null>(null);
  const [checkin, setCheckin] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const load = async () => {
    if (!id) return;
    setError(null);
    try {
      const g = await api.getGoal(String(id));
      setGoal(g);
    } catch (e: any) {
      setError(e?.error ?? 'Could not load this goal.');
    }
  };

  useEffect(() => {
    load().catch(() => {});
    api
      .getSettings()
      .then((s) => {
        const gh = (s?.integrations ?? []).find((i: any) => i?.id === 'github');
        if (gh) setGithub(gh);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onCheckin = async () => {
    if (!id || busy) return;
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
    if (!id || busy) return;
    try {
      setBusy(true);
      setError(null);
      const done = await finalizeGoal(String(id));
      setGoal((prev: any) => ({ ...prev, ...done }));
      setCelebrating(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e: any) {
      setError(e?.error ?? 'Could not finalize. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!goal) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.grayCanvas, gap: 12 }}>
        {error ? (
          <>
            <Text style={{ color: Brand.error, textAlign: 'center', paddingHorizontal: 32 }}>{error}</Text>
            <PillButton title="Retry" onPress={load} />
            <PillButton title="Back" onPress={() => router.back()} />
          </>
        ) : (
          <View accessibilityRole="progressbar" accessibilityLabel="Loading goal">
            <ActivityIndicator color={Brand.turquoise} />
          </View>
        )}
      </SafeAreaView>
    );
  }

  const meta = templateMeta(goal);
  const prog = displayProgress(goal);
  const ctx = goal.template_context ?? {};
  const left = daysLeft(goal.deadline);
  const history: any[] = dashboard?.history ?? [];
  const ownLogs: any[] = Array.isArray(goal.progress_logs) && goal.progress_logs.length > 0
    ? goal.progress_logs
    : history.filter((h) => String(h.goal_id) === String(goal.id));
  const strip = weekStrip(ownLogs.map((l) => ({ ...l, goal_id: l.goal_id ?? goal.id })), goal.id);
  const goalLogs = ownLogs.slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44 }}
        >
          <Ionicons name="chevron-back" size={20} color={Brand.navy} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: Brand.navy }}>Back</Text>
        </Pressable>

        {meta.github ? (
          <GithubHeader goal={goal} prog={prog} ctx={ctx} left={left} strip={strip} stripColor={stripColor} github={github} />
        ) : (
          <GoalHeaderCard goal={goal} prog={prog} meta={meta} ctx={ctx} left={left} />
        )}

        <Card>
          <TrackerBody goal={goal} onChanged={setGoal} />
        </Card>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PillButton title={busy ? '…' : 'Check in'} onPress={onCheckin} disabled={busy} accessibilityHint="Asks the coach for a status check-in" />
          </View>
          <View style={{ flex: 1 }}>
            <PillButton title="Work-block" primary onPress={() => router.push({ pathname: '/work-block', params: { id: String(goal.id), title: goal.title } })} disabled={busy} accessibilityHint="Opens a focused 25-minute work timer" />
          </View>
        </View>

        {error && (
          <Text accessibilityLiveRegion="polite" style={{ color: Brand.error, fontSize: 13 }}>{error}</Text>
        )}

        {checkin && (
          <Card>
            <Text style={{ fontWeight: '700', color: Brand.teal }}>Coach check-in</Text>
            <Text style={{ marginTop: 4, color: Brand.navy }}>{checkin}</Text>
          </Card>
        )}

        <ActivitySection logs={goalLogs} unit={meta.unit} />

        {goal.verdict ? (
          <View>
            {celebrating && <ConfettiBurst onDone={() => setCelebrating(false)} />}
            <Card>
              <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 18, color: Brand.navy }}>Verdict</Text>
              <Text style={{ marginTop: 4, color: Brand.navy }}>{String(goal.verdict)}</Text>
              <Pressable
                onPress={() => Share.share({ message: `OnTrack verdict — ${goal.title}: ${String(goal.verdict)}` })}
                accessibilityLabel="Share verdict"
                accessibilityRole="button"
                style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}
              >
                <Ionicons name="share-outline" size={18} color={Brand.teal} />
                <Text style={{ color: Brand.teal, fontWeight: '700' }}>Share</Text>
              </Pressable>
            </Card>
          </View>
        ) : (
          <PillButton title="Finalize & get verdict" onPress={onFinalize} disabled={busy} accessibilityHint="Marks the goal complete and asks the coach for a final verdict" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
