/** M5 Home — greeting + streak, Today's Focus, due-soon, goal list, FAB. */
import { useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../../constants/colors';
import { Spacing, Touch } from '../../constants/spacing';
import { GoalCard } from '../../components/GoalCard';
import { SkeletonCard } from '../../components/Skeleton';
import { Card } from '../../components/ui';
import { useGoals } from '../../lib/store';

function greeting(name?: string) {
  const h = new Date().getHours();
  const day = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${day}${name ? `, ${name}` : ''}`;
}

export default function Home() {
  const { goals, dashboard, loading, error, refresh } = useGoals();
  const active = goals.filter((g) => g.status === 'active');
  const streak = dashboard?.streak_days ?? 0;
  const focus = active[0];

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
              <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: Brand.navy }}>
                {greeting()}
              </Text>
              <Text style={{ fontWeight: '700', color: Brand.navy }}>🔥 {streak}</Text>
            </View>
            {focus && (
              <Card>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.teal }}>TODAY'S FOCUS</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: Brand.navy, marginTop: 4 }}>
                  {focus.title}
                </Text>
                <Text style={{ fontSize: 13, color: Brand.navy, opacity: 0.65, marginTop: 2 }}>
                  {focus.current_value ?? 0}/{focus.target ?? '—'} {focus.unit ?? ''}
                </Text>
              </Card>
            )}
            {error && (
              <Card>
                <Text style={{ color: '#dc2626' }}>{error}</Text>
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
              </Card>
            )}
            <Text style={{ fontSize: 14, fontWeight: '700', color: Brand.navy }}>
              Active goals ({active.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <GoalCard goal={item} onOpen={() => router.push(`/goal/${item.id}`)} />
        )}
      />
      <Pressable
        onPress={() => router.push('/voice')}
        accessibilityLabel="Create a new goal with voice or text"
        style={{
          position: 'absolute',
          right: 20,
          bottom: 24,
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
        <Text style={{ fontSize: 28, color: Brand.navy, fontWeight: '700' }}>+</Text>
      </Pressable>
      <View style={{ height: Touch.min }} />
    </SafeAreaView>
  );
}
