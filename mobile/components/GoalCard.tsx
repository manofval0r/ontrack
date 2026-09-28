/** Goal card — tactile card + progress bar + status + TTS replay. */
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Brand } from '../constants/colors';
import { Radii, Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { speakText, stopSpeaking } from '../lib/speech';
import { displayProgress, templateMeta } from '../lib/templates';
import { StatusPill } from './ui';

export function GoalCard({ goal, onOpen }: { goal: any; onOpen: () => void }) {
  const [speaking, setSpeaking] = useState(false);
  const prog = displayProgress(goal);
  const meta = templateMeta(goal);
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
    const text = `${goal.title}. Progress ${prog.current} of ${prog.target ?? '—'} ${meta.unit}.`;
    try {
      await speakText(text, () => setSpeaking(false));
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
        <Ionicons name={meta.icon} size={20} color={Brand.teal} style={{ marginTop: 2 }} />
        <Text style={{ fontSize: Typography.cardHeading.fontSize, fontWeight: '700', color: Brand.navy, flex: 1 }} numberOfLines={2}>
          {goal.title}
        </Text>
        <StatusPill status={goal.status ?? 'active'} />
      </View>
      <Text style={{ marginTop: 6, fontSize: 11, fontWeight: '600', color: Brand.teal }}>
        {meta.label}
      </Text>
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
        <Animated.View style={[{ height: '100%', backgroundColor: Brand.turquoise }, barStyle]} />
      </View>
      <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: Brand.teal }}>
          {prog.current}/{prog.target ?? '—'} {meta.unit} · {prog.pct}%
        </Text>
        <Pressable
          onPress={playSummary}
          hitSlop={12}
          accessibilityLabel={speaking ? 'Stop summary' : 'Hear goal summary'}
          style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={speaking ? 'pause' : 'volume-high'} size={22} color={Brand.navy} />
        </Pressable>
      </View>
    </Pressable>
  );
}
