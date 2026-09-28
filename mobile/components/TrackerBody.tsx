/** Tracker body by goal_type — Counter / Checklist / Manual (web parity). */
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Brand, Colors } from '../constants/colors';
import { Radii, Spacing, Touch } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { displayProgress, templateMeta } from '../lib/templates';
import { useGoals } from '../lib/store';
import { PillButton } from './ui';

export function TrackerBody({ goal, onChanged }: { goal: any; onChanged: (g: any) => void }) {
  const { logProgress } = useGoals();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const log = async (delta: number, text?: string) => {
    if (busy) return;
    setError(null);
    try {
      setBusy(true);
      const next = displayProgress(goal).current + delta;
      const updated = await logProgress(String(goal.id), next, text ?? note);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      // Detail payload carries no progress value — keep the merged fields.
      onChanged({ ...goal, ...updated, progress_pct: goal.progress_pct, goal_template: goal.goal_template });
      setNote('');
    } catch (e: any) {
      setError(e?.error ?? 'Could not log progress. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (goal.goal_type === 'checklist') {
    const items: any[] = goal.items ?? [];
    return (
      <View style={{ gap: 8 }}>
        {items.length === 0 && (
          <Text style={{ color: Brand.navy, opacity: 0.6 }}>No checklist items yet.</Text>
        )}
        {items.map((item: any, i: number) => (
          <Pressable
            key={String(item.id ?? i)}
            onPress={() => log(1, item.title)}
            disabled={busy}
            accessibilityLabel={`Log progress on ${item.title}`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!item.completed, disabled: busy }}
            style={{
              minHeight: Touch.min,
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.md,
              padding: Spacing.md,
              borderWidth: 2,
              borderColor: Brand.navy,
              borderRadius: Radii.input,
              backgroundColor: item.completed ? Brand.cyanBg : Brand.white,
              opacity: busy ? 0.6 : 1,
            }}
          >
            <View
              style={{
                width: Touch.checkbox,
                height: Touch.checkbox,
                borderRadius: Radii.checkbox,
                borderWidth: 2,
                borderColor: Brand.navy,
                backgroundColor: item.completed ? Brand.turquoise : Brand.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.completed && <Ionicons name="checkmark" size={16} color={Brand.navy} />}
            </View>
            <Text style={{ flex: 1, fontSize: Typography.body.fontSize, color: Brand.navy }}>{item.title}</Text>
          </Pressable>
        ))}
        {error && <Text style={{ color: Brand.error, fontSize: 12 }}>{error}</Text>}
      </View>
    );
  }

  if (goal.goal_type === 'manual') {
    return (
      <View style={{ gap: Spacing.md }}>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Log a reflection or update…"
          accessibilityLabel="Progress note"
          multiline
          maxLength={500}
          style={{
            minHeight: 88,
            borderWidth: 2,
            borderColor: Brand.navy,
            borderRadius: Radii.input,
            padding: Spacing.md,
            fontSize: Typography.body.fontSize,
            color: Brand.navy,
            backgroundColor: Brand.white,
            textAlignVertical: 'top',
          }}
        />
        <PillButton title={busy ? 'Logging…' : 'Log update'} primary onPress={() => log(1)} disabled={busy || !note.trim()} />
        {error && <Text style={{ color: Brand.error, fontSize: 12 }}>{error}</Text>}
      </View>
    );
  }

  // counter (default)
  const prog = displayProgress(goal);
  const meta = templateMeta(goal);
  return (
    <View style={{ alignItems: 'center', gap: Spacing.md }}>
      <Text style={{ fontFamily: Typography.display.fontFamily, fontSize: Typography.display.fontSize, fontWeight: '700', color: Brand.navy }}>
        {prog.current} / {prog.target ?? '—'}
      </Text>
      <Text style={{ fontSize: Typography.caption.fontSize, fontWeight: '600', color: Brand.teal }}>
        {prog.pct}% · {meta.unit} · {meta.label}
      </Text>
      <Pressable
        onPress={() => log(1)}
        disabled={busy}
        accessibilityLabel="Increment progress by one"
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
        style={({ pressed }) => ({
          width: Touch.plusButton,
          height: Touch.plusButton,
          borderRadius: Radii.pill,
          backgroundColor: Brand.navy,
          borderWidth: 2,
          borderColor: Brand.navy,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed ? 0.95 : 1 }],
          shadowColor: Brand.navy,
          shadowOffset: { width: pressed ? 1 : 3, height: pressed ? 1 : 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3,
          opacity: busy ? 0.5 : 1,
        })}
      >
        <Ionicons name="add" size={32} color={Brand.white} />
      </Pressable>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Progress note (optional)"
        accessibilityLabel="Progress note"
        maxLength={500}
        style={{
          alignSelf: 'stretch',
          borderWidth: 2,
          borderColor: Colors.light.inputBorder,
          borderRadius: Radii.input,
          padding: Spacing.md,
          fontSize: Typography.body.fontSize,
          color: Brand.navy,
          backgroundColor: Brand.white,
        }}
      />
      {error && <Text style={{ color: Brand.error, fontSize: 12 }}>{error}</Text>}
    </View>
  );
}
