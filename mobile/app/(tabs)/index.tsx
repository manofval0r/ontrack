/** M5 Home — greeting + streak, Today's Focus, due-soon, goal list, FAB. */
import { useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '../../constants/colors';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { GoalCard } from '../../components/GoalCard';
import { SkeletonCard } from '../../components/Skeleton';
import { Card } from '../../components/ui';
import { useGoals } from '../../lib/store';
import { displayProgress, templateMeta } from '../../lib/templates';

function greeting(name?: string) {
  const h = new Date().getHours();
  const day = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${day}${name ? `, ${name}` : ''}`;
}

export default function Home() {
  const { goals, dashboard, loading, error, refresh, clearError } = useGoals();
  const active = goals.filter((g) => g.status === 'active');
  const streak = dashboard?.streak_days ?? 0;
  const focus = active[0];
  const focusProg = focus ? displayProgress(focus) : null;
  const focusMeta = focus ? templateMeta(focus) : null;

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <FlatList
        data={active}
        keyExtractor={(g) => String(g.id)}
        contentContainerStyle={{ padding: Spacing.lg, gap: 12, paddingBottom: 96 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text accessibilityRole="header" style={{ fontFamily: Typography.title.fontFamily, fontSize: Typography.title.fontSize, color: Brand.navy }}>
                {greeting()}
              </Text>
              <Text accessibilityLabel={`${streak} day streak`} style={{ fontWeight: '700', color: Brand.navy }}>
                <Ionicons name="flame" size={16} color={Brand.amberDot} /> {streak}
              </Text>
            </View>
            {focus && (
              <Pressable
                onPress={() => router.push(`/goal/${focus.id}`)}
                accessibilityLabel={`Today's focus: ${focus.title}. Open goal detail.`}
                accessibilityRole="button"
              >
                <Card>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.teal }}>Today's focus</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: Brand.navy, marginTop: 4 }}>
                    {focus.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: Brand.navy, opacity: 0.65, marginTop: 2 }}>
                    {focusProg!.current} of {focusProg!.target ?? 'unknown'} {focusMeta!.unit}
                  </Text>
                </Card>
              </Pressable>
            )}
            {error && (
              <Card>
                <Text accessibilityLiveRegion="polite" style={{ color: Brand.error }}>{error}</Text>
                <Pressable onPress={() => { clearError(); refresh(); }} style={{ marginTop: 8, minHeight: Touch.min, justifyContent: 'center' }} accessibilityRole="button" accessibilityLabel="Retry loading goals">
                  <Text style={{ color: Brand.teal, fontWeight: '700' }}>Retry</Text>
                </Pressable>
              </Card>
            )}
            {loading && active.length === 0 && (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
            {active.length === 0 && !loading && (
              <Card>
                <Text style={{ fontSize: 18, fontWeight: '700', color: Brand.navy }}>Start with one goal.</Text>
                <Text style={{ marginTop: 4, fontSize: 14, color: Brand.navy, opacity: 0.7 }}>
                  Tell the coach what you want to achieve and your tracker appears here.
                </Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/chat')}
                  accessibilityLabel="Open coach chat to create your first goal"
                  accessibilityRole="button"
                  style={{ marginTop: 12, backgroundColor: Brand.navy, borderRadius: Radii.pill, paddingVertical: 12, alignItems: 'center', minHeight: Touch.min, justifyContent: 'center' }}
                >
                  <Text style={{ color: Brand.white, fontWeight: '700' }}>Open coach chat</Text>
                </Pressable>
              </Card>
            )}
            <Text accessibilityRole="header" style={{ fontSize: 14, fontWeight: '700', color: Brand.navy }}>
              Active goals ({active.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <GoalCard goal={item} onOpen={() => router.push(`/goal/${item.id}`)} />
        )}
      />
      <Pressable
        onPress={() => router.push('/(tabs)/chat')}
        accessibilityLabel="Open coach chat to create a goal"
        accessibilityRole="button"
        accessibilityHint="Opens the coach chat where new goals are created"
        style={{
          position: 'absolute',
          right: 20,
          bottom: 104,
          minWidth: 56,
          minHeight: 56,
          borderRadius: 999,
          backgroundColor: Brand.turquoise,
          borderWidth: 2,
          borderColor: Brand.navy,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 4,
        }}
      >
        <Ionicons name="add" size={30} color={Brand.navy} />
      </Pressable>
      <View accessible={false} style={{ height: Touch.min }} />
    </SafeAreaView>
  );
}
