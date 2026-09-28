/** M9 Work-Block — full-screen overlay, escapable, local countdown timer. */
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Brand } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card, PillButton } from '../components/ui';

const FOCUS_SECONDS = 25 * 60;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

function spoken(s: number) {
  const m = Math.floor(s / 60);
  if (m >= 1) return `${m} minute${m === 1 ? '' : 's'} remaining`;
  return `${s} seconds remaining`;
}

export default function WorkBlock() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  const [left, setLeft] = useState(FOCUS_SECONDS);
  const done = left <= 0;
  const goalTitle = typeof title === 'string' && title ? title : 'your goal';

  useEffect(() => {
    if (done) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return;
    }
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [done]);

  const confirmExit = () =>
    Alert.alert('End this session?', 'Your timer stops here, but logged progress is kept.', [
      { text: 'Keep working', style: 'cancel' },
      { text: 'End session', style: 'destructive', onPress: () => router.back() },
    ]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Brand.scrim, padding: Spacing.xl, justifyContent: 'center' }}
    >
      <Card>
        <Text accessibilityRole="header" style={{ textAlign: 'center', fontWeight: '700', color: Brand.teal }}>FOCUS SESSION</Text>
        <Text
          accessibilityLabel={done ? 'Focus session complete' : spoken(left)}
          style={{ fontFamily: Typography.display.fontFamily, fontSize: 56, textAlign: 'center', color: Brand.navy, marginTop: 8 }}
        >
          {done ? 'Done' : fmt(left)}
        </Text>
        <Text style={{ textAlign: 'center', marginTop: 8, fontSize: 15, color: Brand.navy }}>
          Focusing on {goalTitle}
        </Text>
        <View style={{ marginTop: 16, gap: 10 }}>
          {done ? (
            <PillButton title="Log progress" primary onPress={() => router.back()} accessibilityHint="Returns to the goal to log what you finished" />
          ) : (
            <PillButton title="Keep working" primary onPress={() => router.back()} />
          )}
          {!done && <PillButton title="End session" onPress={confirmExit} />}
        </View>
      </Card>
    </SafeAreaView>
  );
}
