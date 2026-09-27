/** M9 Work-Block — full-screen overlay, escapable, local countdown timer. */
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Card, PillButton } from '../components/ui';

const FOCUS_SECONDS = 25 * 60;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

export default function WorkBlock() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  const [left, setLeft] = useState(FOCUS_SECONDS);

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const confirmExit = () =>
    Alert.alert('Close this session?', 'Your timer will stop, but progress is kept.', [
      { text: 'Keep working', style: 'cancel' },
      { text: 'Close', style: 'destructive', onPress: () => router.back() },
    ]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: 'rgba(7,30,45,0.92)', padding: Spacing.xl, justifyContent: 'center' }}
    >
      <Card>
        <Text style={{ textAlign: 'center', fontWeight: '700', color: Brand.teal }}>WORK-BLOCK</Text>
        <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 56, textAlign: 'center', color: Brand.navy, marginTop: 8 }}>
          {fmt(left)}
        </Text>
        <Text style={{ textAlign: 'center', marginTop: 8, fontSize: 15, color: Brand.navy }}>
          You are working on: {typeof title === 'string' && title ? title : 'your goal'}
        </Text>
        <View style={{ marginTop: 16, gap: 10 }}>
          <PillButton title="Keep working" primary onPress={() => router.back()} />
          <PillButton title="Close this app?" onPress={confirmExit} />
        </View>
      </Card>
    </SafeAreaView>
  );
}
