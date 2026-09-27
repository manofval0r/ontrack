/** M7 Goals — full active list (Home shows the same data condensed). */
import { useEffect } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { GoalCard } from '../../components/GoalCard';
import { useGoals } from '../../lib/store';

export default function Goals() {
  const { goals, loading, refresh } = useGoals();
  const active = goals.filter((g) => g.status === 'active');
  const done = goals.filter((g) => g.status !== 'active');

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <FlatList
        data={[...active, ...done]}
        keyExtractor={(g) => String(g.id)}
        contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        ListHeaderComponent={
          <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: Brand.navy, marginBottom: 4 }}>
            Goals
          </Text>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
              <Text style={{ fontWeight: '700', color: Brand.navy }}>Start with one goal.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <GoalCard goal={item} onOpen={() => router.push(`/goal/${item.id}`)} />
        )}
      />
    </SafeAreaView>
  );
}
