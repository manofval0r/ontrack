/** M8 Goal Detail — full-screen modal: countdown, tracker, check-in, verdict. */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Card, PillButton, StatusPill } from '../../components/ui';
import { TrackerBody } from '../../components/TrackerBody';
import { api } from '../../lib/api';
import { useGoals } from '../../lib/store';

export default function GoalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { finalizeGoal } = useGoals();
  const [goal, setGoal] = useState<any | null>(null);
  const [checkin, setCheckin] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!id) return;
    const g = await api.getGoal(String(id));
    setGoal(g);
  };

  useEffect(() => {
    load().catch(() => {});
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
      setGoal(done);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Brand.navy }}>← Back</Text>
        </Pressable>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22, color: Brand.navy, flex: 1 }}>
              {goal.title}
            </Text>
            <StatusPill status={goal.status} />
          </View>
          <Text style={{ marginTop: 6, color: Brand.navy, opacity: 0.7 }}>
            {goal.current_value ?? 0}/{goal.target ?? '—'} {goal.unit ?? ''} · {goal.goal_type} tracker
            {goal.deadline ? ` · due ${String(goal.deadline).slice(0, 10)}` : ''}
          </Text>
        </Card>
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
