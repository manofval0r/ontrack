/** GoalCard v2 — one unified design for every goal family.
 * The PaceDial is the whole story: shipped ring vs should-be needle, big
 * count in the middle, pace verdict beside it. Counters get the inline
 * stepper, checklists get tap-to-check rows, manuals get a log button.
 * GitHub goals surface their commit count when the backend provides it. */
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Brand } from '../constants/colors';
import { useTheme } from '../lib/theme';
import { Radii, Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { speakText, stopSpeaking } from '../lib/speech';
import { displayProgress, templateMeta } from '../lib/templates';
import { daysLeft, paceInfo } from '../lib/goalStats';
import { useGoals } from '../lib/store';
import { useToast } from '../lib/toast';
import { StatusPill } from './ui';
import { PaceDial } from './PaceDial';
import { useEffect } from 'react';

function Stepper({ value, unit, busy, onStep }: { value: string; unit: string; busy: boolean; onStep: (delta: 1 | -1) => void }) {
  const t = useTheme();
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
      <Text style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: t.ink }}>{value}</Text>
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
  const t = useTheme();
  const { logProgress } = useGoals();
  const toast = useToast();
  const [speaking, setSpeaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const prog = displayProgress(goal);
  const meta = templateMeta(goal);
  const remaining = daysLeft(goal.deadline);
  const pace = paceInfo(goal, prog.pct);
  const behind = pace.delta != null && pace.delta <= -0.1;
  const commits = goal?.template_context?.commits_this_week;

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
      await speakText(`${goal.title}. Progress ${prog.current} of ${prog.target ?? 'unknown'} ${meta.unit}. ${pace.label}.`, () => setSpeaking(false));
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
      style={({ pressed }) => [{
        backgroundColor: t.surface,
        borderWidth: 2,
        borderColor: t.border,
        borderRadius: Radii.card,
        padding: Spacing.lg,
        shadowColor: t.shadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : [],
      }]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Ionicons name={meta.icon} size={20} color={t.teal} style={{ marginTop: 2 }} accessibilityElementsHidden />
        <Text style={{ fontSize: Typography.cardHeading.fontSize, fontWeight: '700', color: t.ink, flex: 1 }} numberOfLines={2}>
          {goal.title}
        </Text>
        <StatusPill status={goal.status ?? 'active'} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 }}>
        <PaceDial pct={prog.pct} expected={pace.expected} label={`${goal.title}: ${prog.pct} percent, ${pace.label}`}>
          <Text style={{ fontFamily: 'OriginalSurfer_400Regular', fontSize: 26, color: t.ink }}>
            {prog.current}
          </Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: t.inkSoft }} numberOfLines={1}>
            {prog.target != null ? `OF ${prog.target}` : meta.unit.toUpperCase()}
          </Text>
        </PaceDial>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: behind ? Brand.amberText : t.teal }}>
            {pace.label}
          </Text>
          {!!remaining && (
            <Text style={{ fontSize: 12, color: t.inkSoft }}>{remaining}</Text>
          )}
          <Text style={{ fontSize: 12, color: t.inkSoft }}>
            {prog.current} of {prog.target ?? '—'} {meta.unit}
          </Text>
          {meta.github && typeof commits === 'number' && (
            <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal }}>
              {commits} {commits === 1 ? 'commit' : 'commits'} this week
            </Text>
          )}
        </View>
      </View>

      {!isChecklist && !isManual && (
        <Stepper value={`${prog.current} of ${prog.target ?? '—'} ${meta.unit}`} unit={meta.unit} busy={busy} onStep={step} />
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
                borderColor: t.border,
                borderRadius: 12,
                backgroundColor: item.completed ? Brand.cyanBg : t.surface,
                opacity: busy ? 0.6 : 1,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: t.border,
                  backgroundColor: item.completed ? Brand.turquoise : t.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.completed && <Ionicons name="checkmark" size={15} color={Brand.navy} />}
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: t.ink }} numberOfLines={1}>{item.title}</Text>
            </Pressable>
          ))}
          {items.length === 0 && (
            <Text style={{ color: t.inkSoft, fontSize: 13 }}>No checklist items yet — open to add some.</Text>
          )}
          {items.length > 3 && (
            <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal }}>+{items.length - 3} more inside</Text>
          )}
        </View>
      )}

      {isManual && (
        <Pressable
          onPress={(e) => { e.stopPropagation(); onOpen(); }}
          accessibilityLabel={`Log an entry on ${goal.title}`}
          accessibilityRole="button"
          style={({ pressed }) => ({
            marginTop: 10,
            minHeight: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: t.border,
            borderRadius: Radii.pill,
            backgroundColor: t.primary,
            transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : [],
            shadowColor: t.shadow,
            shadowOffset: { width: pressed ? 1 : 3, height: pressed ? 1 : 3 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 3,
          })}
        >
          <Text style={{ color: t.primaryInk, fontWeight: '700' }}>Log entry</Text>
        </Pressable>
      )}

      <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            playSummary();
          }}
          hitSlop={12}
          accessibilityLabel={speaking ? 'Stop summary' : 'Hear goal summary'}
          accessibilityRole="button"
          accessibilityState={{ busy: speaking }}
          style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={speaking ? 'pause' : 'volume-high'} size={22} color={t.ink} />
        </Pressable>
      </View>
    </Pressable>
  );
}
