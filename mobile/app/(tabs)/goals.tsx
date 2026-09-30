/** M7 Goals — active + completed sections with error and empty states.
 * Pull-to-refresh is the same custom arc header as Home: drag down at the
 * top, arc fills with pull, spins while syncing, draws the tick. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, FlatList as GHFlatList, Swipeable } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme';
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
  const t = useTheme();
  const { goals, loading, error, refresh, clearError } = useGoals();
  const toast = useToast();
  const active = goals.filter((g) => g.status === 'active');
  const done = goals.filter((g) => g.status !== 'active');
  const [syncState, setSyncState] = useState<RefreshState>('idle');
  const wasLoading = useRef(false);

  const PULL_THRESHOLD = 84;
  const HEADER_MAX = 72;
  const pullY = useSharedValue(0);
  const pullProg = useSharedValue(0);
  const atTop = useSharedValue(true);

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
      pullY.value = withTiming(0, { duration: 200 });
      return;
    }
    setSyncState('done');
    const t = setTimeout(() => {
      setSyncState('idle');
      pullY.value = withTiming(0, { duration: 220 });
    }, 1500);
    return () => clearTimeout(t);
  }, [loading, error]);

  const doRefresh = useCallback(() => {
    clearError();
    refresh();
  }, [clearError, refresh]);
  const doRefreshRef = useRef(doRefresh);
  doRefreshRef.current = doRefresh;

  const native = useMemo(() => Gesture.Native(), []);
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .simultaneousWithExternalGesture(native)
        .activeOffsetY([14, 1000])
        .onUpdate((e) => {
          if (!atTop.value) {
            pullY.value = 0;
            pullProg.value = 0;
            return;
          }
          const y = Math.min(120, Math.max(0, e.translationY * 0.55));
          pullY.value = y;
          pullProg.value = Math.min(1, y / PULL_THRESHOLD);
        })
        .onEnd(() => {
          if (!atTop.value) {
            pullY.value = 0;
            pullProg.value = 0;
            return;
          }
          if (pullY.value >= PULL_THRESHOLD) {
            pullY.value = withTiming(HEADER_MAX, { duration: 200 });
            pullProg.value = 1;
            try {
              doRefreshRef.current();
            } catch {
              pullY.value = withTiming(0, { duration: 200 });
            }
          } else {
            pullY.value = withTiming(0, { duration: 220 });
            pullProg.value = 0;
          }
        }),
    [native, atTop, pullY, pullProg]
  );

  const headerStyle = useAnimatedStyle(() => ({
    height: Math.min(pullY.value, HEADER_MAX),
    opacity: pullY.value > 4 ? 1 : 0,
  }));
  const listStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.min(pullY.value, HEADER_MAX) }],
  }));

  const arcState: RefreshState = syncState === 'idle' ? 'pull' : syncState;

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Errors surface as dismissible top toasts (with Retry) — never as
  // dead-end cards pinned into the feed.
  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      toast.show({
        type: 'error',
        title: 'Could not sync',
        message: error,
        duration: 5000,
        action: { label: 'Retry', onPress: () => { clearError(); refresh(); } },
      });
    }
    if (!error) lastErrorRef.current = null;
  }, [error, toast, clearError, refresh]);

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
        borderColor: t.border,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8, overflow: 'hidden' }, headerStyle]}>
        <RefreshArc state={arcState} arcProgress={pullProg} label="Pull to refresh" />
      </Animated.View>
      <GestureDetector gesture={Gesture.Simultaneous(native, pan)}>
        <Animated.View style={[{ flex: 1 }, listStyle]}>
      <GHFlatList
        data={[...active, ...done]}
        keyExtractor={(g) => String(g.id)}
        accessibilityLabel="Goals list"
        contentContainerStyle={{ padding: Spacing.lg, gap: 12, paddingBottom: 170 }}
        scrollEventThrottle={16}
        onScroll={(e) => {
          atTop.value = e.nativeEvent.contentOffset.y <= 4;
        }}
        ListHeaderComponent={
          <View style={{ gap: 8, marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text accessibilityRole="header" style={{ fontFamily: FontFamily.expressive, fontSize: 36, color: t.ink }}>
                Goals
              </Text>
              <RefreshArc state={syncState} />
            </View>
            <Text style={{ fontSize: 13, color: t.inkSoft }}>
              {active.length} active · {done.length} completed
            </Text>
            {active.length > 0 && done.length > 0 && (
              <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal, marginTop: 4 }}>ACTIVE</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Card>
              <Text style={{ fontFamily: FontFamily.expressive, fontSize: 24, color: t.ink }}>Start with one goal.</Text>
              <Text style={{ marginTop: 4, fontSize: 14, color: t.inkSoft }}>
                Tell OnTrack what you want to achieve in the Chat tab.
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/chat')}
                accessibilityLabel="Open chat"
                accessibilityRole="button"
                style={{ marginTop: 12, backgroundColor: t.primary, borderRadius: 999, paddingVertical: 12, alignItems: 'center', minHeight: Touch.min, justifyContent: 'center' }}
              >
                <Text style={{ color: t.primaryInk, fontWeight: '700' }}>Open chat</Text>
              </Pressable>
            </Card>
          ) : null
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.duration(300).delay(Math.min(index, 5) * 70)}>
          <View>
            {index === active.length && done.length > 0 && (
              <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal, marginBottom: 8 }}>COMPLETED</Text>
            )}
            <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
              <GoalCard goal={item} onOpen={() => router.push(`/goal/${item.id}`)} />
            </Swipeable>
          </View>
          </Animated.View>
        )}
          />
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}
