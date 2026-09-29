/** Goal card — one design per goal family (never one-size-fits-all).
 * Counter → Concept C week-strip + inline stepper. Checklist → tick rows.
 * Manual → entries + log CTA. All carry time-remaining + TTS replay. */
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Brand } from '../constants/colors';
import { Radii, Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { speakText, stopSpeaking } from '../lib/speech';
import { displayProgress, templateMeta } from '../lib/templates';
import { daysLeft, stripColor, weekStrip } from '../lib/goalStats';
import { useGoals } from '../lib/store';
import { useToast } from '../lib/toast';
import { StatusPill } from './ui';

const card = {
  backgroundColor: Brand.white,
  borderWidth: 2,
  borderColor: Brand.navy,
  borderRadius: Radii.card,
  padding: Spacing.lg,
} as const;

const shadow = {
  shadowColor: Brand.navy,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
} as const;

function DayDots({ dots }: { dots: number[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 5, marginTop: 8 }} accessibilityLabel="This week's proof">
      {dots.map((n, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 30,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: Brand.navy,
            backgroundColor: n > 0 ? stripColor(n) : Brand.white,
          }}
        />
      ))}
    </View>
  );
}

function Stepper({ value, unit, busy, onStep }: { value: string; unit: string; busy: boolean; onStep: (delta: 1 | -1) => void }) {
  const btn = (pressed: boolean) => ({
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Brand.navy,
    backgroundColor: Brand.turquoise,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : [],
    shadowColor: Brand.navy,
    shadowOffset: { width: pressed ? 0 : 2, height: pressed ? 0 : 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: pressed ? 0 : 2,
    opacity: busy ? 0.5 : 1,
  });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
      <Pressable
        onPress={(e) => { e.stopPropagation(); onStep(-1); }}
        disabled={busy}
        accessibilityLabel={`Log one less ${unit}`}
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed }) => btn(pressed)}
      >
        <Ionicons name="remove" size={22} color={Brand.navy} />
      </Pressable>
      <Text style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: Brand.navy }}>{value}</Text>
      <Pressable
        onPress={(e) => { e.stopPropagation(); onStep(1); }}
        disabled={busy}
        accessibilityLabel={`Log one more ${unit}`}
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed }) => btn(pressed)}
      >
        <Ionicons name="add" size={22} color={Brand.navy} />
      </Pressable>
    </View>
  );
}

export function GoalCard({ goal, onOpen }: { goal: any; onOpen: () => void }) {
  const { dashboard, logProgress } = useGoals();
  const toast = useToast();
  const [speaking, setSpeaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const prog = displayProgress(goal);
  const meta = templateMeta(goal);
  const history: any[] = Array.isArray(dashboard?.history) ? dashboard.history : [];
  const dots = weekStrip(history, String(goal.id));
  const remaining = daysLeft(goal.deadline);
  const fill = useSharedValue(prog.pct);

  useEffect(() => {
    fill.value = withTiming(prog.pct, { duration: 600 });
  }, [prog.pct, fill]);

  const barStyle = useAnimatedStyle(() => ({ width: `${Math.round(fill.value)}%` }));

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const playSummary = async () => {
    Haptics.selectionAsync().catch(() => {});
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    try {
      await speakText(`${goal.title}. Progress ${prog.current} of ${prog.target ?? 'unknown'} ${meta.unit}.`, () => setSpeaking(false));
    } catch {
      setSpeaking(false);
    }
  };

  const step = async (delta: 1 | -1) => {
    if (busy) return;
    const next = prog.current + delta;
    if (next < 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setBusy(true);
    try {
      await logProgress(String(goal.id), next);
      toast.show({ type: 'success', title: delta > 0 ? `+1 ${meta.unit} logged` : 'Entry corrected', message: `${goal.title} — now ${next}${prog.target ? ` of ${prog.target}` : ''}.` });
    } catch (e: any) {
      toast.show({ type: 'error', title: 'Could not log', message: e?.error ?? e?.message ?? 'Try again in a moment.' });
    } finally {
      setBusy(false);
    }
  };

  const logItem = async (title: string) => {
    if (busy) return;
    Haptics.selectionAsync().catch(() => {});
    setBusy(true);
    try {
      await logProgress(String(goal.id), prog.current + 1, title);
      toast.show({ type: 'success', title: 'Checked off', message: title });
    } catch (e: any) {
      toast.show({ type: 'error', title: 'Could not log', message: e?.error ?? e?.message ?? 'Try again in a moment.' });
    } finally {
      setBusy(false);
    }
  };

  const isChecklist = goal.goal_type === 'checklist';
  const isManual = goal.goal_type === 'manual';
  const items: any[] = Array.isArray(goal.items) ? goal.items : [];

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onOpen();
      }}
      accessibilityLabel={`Open goal ${goal.title}, ${prog.pct} percent complete, ${goal.status ?? 'active'}`}
      accessibilityRole="button"
      accessibilityHint="Opens the goal detail screen"
      style={({ pressed }) => [card, shadow, { transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : [] }]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Ionicons name={meta.icon} size={20} color={Brand.teal} style={{ marginTop: 2 }} accessibilityElementsHidden />
        <Text style={{ fontSize: Typography.cardHeading.fontSize, fontWeight: '700', color: Brand.navy, flex: 1 }} numberOfLines={2}>
          {goal.title}
        </Text>
        <StatusPill status={goal.status ?? 'active'} />
      </View>
      <Text style={{ marginTop: 6, fontSize: 11, fontWeight: '700', color: Brand.teal }}>
        {isChecklist ? `${meta.label} · tap to check off`.toUpperCase() : isManual ? `${meta.label} · daily entries`.toUpperCase() : `${meta.label} · this week's proof`.toUpperCase()}
      </Text>

      {!isChecklist && !isManual && (
        <>
          <DayDots dots={dots} />
          <Stepper value={`${prog.current} of ${prog.target ?? '—'} ${meta.unit}`} unit={meta.unit} busy={busy} onStep={step} />
        </>
      )}

      {isChecklist && (
        <View style={{ gap: 8, marginTop: 10 }}>
          {items.slice(0, 3).map((item: any, i: number) => (
            <Pressable
              key={String(item.id ?? i)}
              onPress={(e) => { e.stopPropagation(); logItem(String(item.title)); }}
              disabled={busy}
              accessibilityLabel={`Check off ${item.title}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: !!item.completed }}
              style={{
                minHeight: 48,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: 2,
                borderColor: Brand.navy,
                borderRadius: 12,
                backgroundColor: item.completed ? Brand.cyanBg : Brand.white,
                opacity: busy ? 0.6 : 1,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: Brand.navy,
                  backgroundColor: item.completed ? Brand.turquoise : Brand.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.completed && <Ionicons name="checkmark" size={15} color={Brand.navy} />}
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: Brand.navy }} numberOfLines={1}>{item.title}</Text>
            </Pressable>
          ))}
          {items.length === 0 && (
            <Text style={{ color: Brand.navy, opacity: 0.6, fontSize: 13 }}>No checklist items yet — open to add some.</Text>
          )}
          {items.length > 3 && (
            <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.teal }}>+{items.length - 3} more inside</Text>
          )}
        </View>
      )}

      {isManual && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <Text style={{ fontFamily: 'OriginalSurfer_400Regular', fontSize: 40, color: Brand.navy }}>
            {prog.current}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Brand.navy }}>{meta.unit} so far</Text>
            {!!remaining && <Text style={{ fontSize: 12, color: Brand.navy, opacity: 0.6 }}>{remaining}</Text>}
          </View>
          <Pressable
            onPress={(e) => { e.stopPropagation(); onOpen(); }}
            accessibilityLabel={`Log an entry on ${goal.title}`}
            accessibilityRole="button"
            style={({ pressed }) => ({
              minHeight: 48,
              paddingHorizontal: 18,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: Brand.navy,
              borderRadius: Radii.pill,
              backgroundColor: Brand.navy,
              transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : [],
              shadowColor: Brand.navy,
              shadowOffset: { width: pressed ? 1 : 3, height: pressed ? 1 : 3 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 3,
            })}
          >
            <Text style={{ color: Brand.white, fontWeight: '700' }}>Log entry</Text>
          </Pressable>
        </View>
      )}

      {!isChecklist && !isManual && (
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ now: prog.pct, min: 0, max: 100 }}
          style={{
            marginTop: 12,
            height: 10,
            borderRadius: Radii.pill,
            backgroundColor: Brand.gray,
            borderWidth: 2,
            borderColor: Brand.navy,
            overflow: 'hidden',
          }}
        >
          <Animated.View style={[{ height: '100%', backgroundColor: Brand.turquoise }, barStyle]} />
        </View>
      )}

      <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: Brand.teal }}>
          {isChecklist
            ? `${prog.current} of ${prog.target ?? '—'} ${meta.unit} · ${prog.pct} pct`
            : isManual
              ? `${prog.pct} pct of target`
              : `${prog.pct} pct shipped`}
          {!!remaining && !isManual ? ` · ${remaining}` : ''}
        </Text>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            playSummary();
          }}
          hitSlop={12}
          accessibilityLabel={speaking ? 'Stop summary' : 'Hear goal summary'}
          accessibilityRole="button"
          accessibilityState={{ busy: speaking }}
          style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 }}
        >
          {!!remaining && isChecklist && (
            <Text style={{ fontSize: 11, fontWeight: '700', color: Brand.navy, opacity: 0.6 }}>{remaining}</Text>
          )}
          <Ionicons name={speaking ? 'pause' : 'volume-high'} size={22} color={Brand.navy} />
        </Pressable>
      </View>
    </Pressable>
  );
}
