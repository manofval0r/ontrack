/** Tracker body by goal_type — Counter / Checklist / Manual (web parity). */
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Brand } from '../constants/colors';
import { Radii, Spacing, Touch } from '../constants/spacing';
import { useGoals } from '../lib/store';
import { PillButton } from './ui';

export function TrackerBody({ goal, onChanged }: { goal: any; onChanged: (g: any) => void }) {
  const { logProgress } = useGoals();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const log = async (delta: number, text?: string) => {
    try {
      setBusy(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const next = (goal.current_value ?? 0) + delta;
      const updated = await logProgress(String(goal.id), next, text ?? note);
      onChanged(updated);
      setNote('');
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
            onPress={() => log(1, `Toggled: ${item.title}`)}
            style={{
              minHeight: Touch.min,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: Spacing.md,
              borderWidth: 2,
              borderColor: Brand.navy,
              borderRadius: Radii.input,
              backgroundColor: item.completed ? Brand.cyanBg : '#fff',
            }}
          >
            <View
              style={{
                width: Touch.checkbox,
                height: Touch.checkbox,
                borderRadius: Radii.checkbox,
                borderWidth: 2,
                borderColor: Brand.navy,
                backgroundColor: item.completed ? Brand.turquoise : '#fff',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.completed && <Text style={{ color: Brand.navy, fontWeight: '700' }}>✓</Text>}
            </View>
            <Text style={{ flex: 1, fontSize: 15, color: Brand.navy }}>{item.title}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  if (goal.goal_type === 'manual') {
    return (
      <View style={{ gap: 12 }}>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Log a reflection or update…"
          multiline
          style={{
            minHeight: 88,
            borderWidth: 2,
            borderColor: Brand.navy,
            borderRadius: Radii.input,
            padding: Spacing.md,
            fontSize: 15,
            color: Brand.navy,
            backgroundColor: '#fff',
            textAlignVertical: 'top',
          }}
        />
        <PillButton title={busy ? 'Logging…' : 'Log update'} primary onPress={() => log(1)} disabled={busy || !note.trim()} />
      </View>
    );
  }

  // counter (default)
  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 34, fontWeight: '700', color: Brand.navy }}>
        {goal.current_value ?? 0} / {goal.target ?? '—'}
      </Text>
      <Pressable
        onPress={() => log(1)}
        disabled={busy}
        accessibilityLabel="Increment progress by one"
        style={({ pressed }) => ({
          width: Touch.plusButton,
          height: Touch.plusButton,
          borderRadius: 999,
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
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: '700' }}>+</Text>
      </Pressable>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Note (optional)"
        style={{
          alignSelf: 'stretch',
          borderWidth: 2,
          borderColor: 'rgba(7,30,45,0.2)',
          borderRadius: Radii.input,
          padding: Spacing.md,
          fontSize: 15,
          color: Brand.navy,
          backgroundColor: '#fff',
        }}
      />
    </View>
  );
}
