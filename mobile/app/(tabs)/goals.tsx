/** M7 Goals — active + completed sections with error and empty states. */
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../../constants/colors';
import { Spacing, Touch } from '../../constants/spacing';
import { FontFamily } from '../../constants/typography';
import { GoalCard } from '../../components/GoalCard';
import { BackdropArt } from '../../components/BackdropArt';
import { RefreshArc, RefreshState } from '../../components/RefreshArc';
import { Card } from '../../components/ui';
import { api } from '../../lib/api';
import { useGoals } from '../../lib/store';
import { useToast } from '../../lib/toast';

export default function Goals() {
  const { goals, loading, error, refresh, clearError } = useGoals();
  const toast = useToast();
  const active = goals.filter((g) => g.status === 'active');
  const done = goals.filter((g) => g.status !== 'active');
  const [syncState, setSyncState] = useState<RefreshState>('idle');
  const wasLoading = useRef(false);

  useEffect(() => {
    if (loading) {
      wasLoading.current = true;
      setSyncState('loading');
      return;
    }
    if (!wasLoading.current) return;
    wasLoading.current = false;
    if (error) {
      setSyncState('idle');
      return;
    }
    setSyncState('done');
    const t = setTimeout(() => setSyncState('idle'), 1500);
    return () => clearTimeout(t);
  }, [loading, error]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const confirmDelete = (goal: any) => {
    Alert.alert('Delete goal?', `"${goal.title}" and its logs go away for good.`, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteGoal(String(goal.id));
            await refresh();
            toast.show({ type: 'success', title: 'Goal deleted', message: String(goal.title) });
          } catch (e: any) {
            toast.show({ type: 'error', title: 'Could not delete', message: e?.error ?? e?.message ?? 'Try again.' });
          }
        },
      },
    ]);
  };

  const renderRightActions = (goal: any) => (
    <Pressable
      onPress={() => confirmDelete(goal)}
      accessibilityLabel={`Delete ${goal.title}`}
      accessibilityRole="button"
      style={{
        width: 88,
        marginLeft: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: Brand.navy,
        backgroundColor: '#DC2626',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas }} edges={['top']}>
      <BackdropArt variant="dots" />
      <FlatList
        data={[...active, ...done]}
        keyExtractor={(g) => String(g.id)}
        accessibilityLabel="Goals list"
        contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { clearError(); refresh(); }} />}
        ListHeaderComponent={
          <View style={{ gap: 8, marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text accessibilityRole="header" style={{ fontFamily: FontFamily.expressive, fontSize: 36, color: Brand.navy }}>
                Goals
              </Text>
              <RefreshArc state={syncState} />
            </View>
            <Text style={{ fontSize: 13, color: Brand.navy, opacity: 0.65 }}>
              {active.length} active · {done.length} completed
            </Text>
            {error && (
              <Card>
                <Text accessibilityLiveRegion="polite" style={{ color: Brand.error, fontSize: 13 }}>{error}</Text>
                <Pressable onPress={() => { clearError(); refresh(); }} style={{ marginTop: 8, minHeight: Touch.min, justifyContent: 'center' }} accessibilityRole="button" accessibilityLabel="Retry loading goals">
                  <Text style={{ color: Brand.teal, fontWeight: '700' }}>Retry</Text>
                </Pressable>
              </Card>
            )}
            {active.length > 0 && done.length > 0 && (
              <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.teal, marginTop: 4 }}>ACTIVE</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Card>
              <Text style={{ fontFamily: FontFamily.expressive, fontSize: 24, color: Brand.navy }}>Start with one goal.</Text>
              <Text style={{ marginTop: 4, fontSize: 14, color: Brand.navy, opacity: 0.7 }}>
                Tell the coach what you want to achieve in the Chat tab.
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/chat')}
                accessibilityLabel="Open coach chat"
                accessibilityRole="button"
                style={{ marginTop: 12, backgroundColor: Brand.navy, borderRadius: 999, paddingVertical: 12, alignItems: 'center', minHeight: Touch.min, justifyContent: 'center' }}
              >
                <Text style={{ color: Brand.white, fontWeight: '700' }}>Open coach chat</Text>
              </Pressable>
            </Card>
          ) : null
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.duration(300).delay(Math.min(index, 5) * 70)}>
          <View>
            {index === active.length && done.length > 0 && (
              <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.teal, marginBottom: 8 }}>COMPLETED</Text>
            )}
            <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
              <GoalCard goal={item} onOpen={() => router.push(`/goal/${item.id}`)} />
            </Swipeable>
          </View>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}
