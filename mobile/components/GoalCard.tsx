/** Goal card — tactile card + progress bar + status + TTS replay. */
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Brand } from '../constants/colors';
import { Radii, Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { api } from '../lib/api';
import { StatusPill } from './ui';

function pct(goal: any): number {
  if (!goal.target) return 0;
  const cur = goal.current_value ?? 0;
  return Math.min(100, Math.round((cur / goal.target) * 100));
}

export function GoalCard({ goal, onOpen }: { goal: any; onOpen: () => void }) {
  const [speaking, setSpeaking] = useState(false);

  const playSummary = async () => {
    try {
      Haptics.selectionAsync().catch(() => {});
      setSpeaking(true);
      const text = `${goal.title}. Progress ${goal.current_value ?? 0} of ${goal.target ?? '—'}.`;
      try {
        const { audio_url } = await api.tts(text);
        if (audio_url && !audio_url.includes('stub')) {
          const { sound } = await Audio.Sound.createAsync({ uri: audio_url });
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((s) => {
            if (s.isLoaded && s.didJustFinish) setSpeaking(false);
          });
          return;
        }
      } catch {
        // fall through to device speech
      }
      Speech.speak(text, { onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false) });
    } catch {
      setSpeaking(false);
    }
  };

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onOpen();
      }}
      style={({ pressed }) => ({
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: Brand.navy,
        borderRadius: Radii.card,
        padding: Spacing.lg,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        shadowColor: Brand.navy,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: Typography.cardHeading.fontSize, fontWeight: '700', color: Brand.navy, flex: 1 }} numberOfLines={2}>
          {goal.title}
        </Text>
        <StatusPill status={goal.status ?? 'active'} />
      </View>
      <View
        style={{
          marginTop: 12,
          height: 10,
          borderRadius: 999,
          backgroundColor: Brand.gray,
          borderWidth: 2,
          borderColor: Brand.navy,
          overflow: 'hidden',
        }}
      >
        <View style={{ width: `${pct(goal)}%`, height: '100%', backgroundColor: Brand.turquoise }} />
      </View>
      <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: Brand.teal }}>
          {goal.current_value ?? 0}/{goal.target ?? '—'} {goal.unit ?? ''} · {pct(goal)}%
        </Text>
        <Pressable
          onPress={playSummary}
          hitSlop={12}
          accessibilityLabel="Hear goal summary"
          style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 18 }}>{speaking ? '⏸' : '🔊'}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
