/** You tab — profile header, stats, quick links, sign out. */
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '../../constants/colors';
import { useTheme } from '../../lib/theme';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { FontFamily, Typography } from '../../constants/typography';
import { Card, PillButton } from '../../components/ui';
import { clearSession } from '../../lib/auth';
import { useGoals } from '../../lib/store';

export default function You() {
  const t = useTheme();
  const { goals, dashboard, loading, refresh } = useGoals();
  const active = goals.filter((g) => g.status === 'active').length;
  const done = goals.filter((g) => g.status !== 'active').length;
  const streak = dashboard?.streak_days ?? 0;

  const signOut = async () => {
    Alert.alert('Sign out?', 'Your goals stay synced to your account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => { await clearSession(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: 12, paddingBottom: 130 }}>
        <View style={{ alignItems: 'center', gap: 8, marginTop: 8 }}>
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: Brand.turquoise, borderWidth: 3, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="person" size={40} color={Brand.navy} />
          </View>
          <Text style={{ fontFamily: FontFamily.expressive, fontSize: 30, color: t.ink }}>
            Your progress
          </Text>
          <Text style={{ fontSize: 13, color: t.inkSoft }}>
            {streak > 0 ? `${streak}-day streak alive. Keep it burning.` : 'Finish a goal to light your streak.'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { v: String(active), l: 'active' },
            { v: String(done), l: 'shipped' },
            { v: String(streak), l: 'streak' },
          ].map((s) => (
            <View key={s.l} style={{ flex: 1, backgroundColor: t.surface, borderWidth: 2, borderColor: t.border, borderRadius: Radii.input, paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ fontFamily: Typography.display.fontFamily, fontSize: 24, color: t.ink }}>{s.v}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: t.teal }}>{s.l}</Text>
            </View>
          ))}
        </View>

        <Card>
          {[
            { label: 'Chat', hint: 'Create goals and log progress', route: '/(tabs)/chat', icon: 'chatbubble' },
            { label: 'Focus timer', hint: 'Start a 25-minute work-block', route: '/work-block', icon: 'timer' },
            { label: 'Settings', hint: 'Audio, notifications, integrations', route: '/(tabs)/settings', icon: 'settings' },
          ].map((l) => (
            <Pressable
              key={l.label}
              onPress={() => router.push(l.route as any)}
              accessibilityLabel={l.label}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, borderTopWidth: 1, borderTopColor: Brand.hairline, paddingVertical: 6 }}
            >
              <Ionicons name={l.icon as any} size={22} color={Brand.teal} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: t.ink }}>{l.label}</Text>
                <Text style={{ fontSize: 12, color: t.inkSoft }}>{l.hint}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Brand.navy} />
            </Pressable>
          ))}
        </Card>

        <PillButton title={loading ? 'Refreshing…' : 'Refresh my data'} onPress={() => refresh()} disabled={loading} />
        <Pressable
          onPress={signOut}
          accessibilityLabel="Sign out"
          accessibilityRole="button"
          style={{ alignItems: 'center', paddingVertical: 12, minHeight: Touch.min, justifyContent: 'center' }}
        >
          <Text style={{ color: Brand.amberText, fontWeight: '700' }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
