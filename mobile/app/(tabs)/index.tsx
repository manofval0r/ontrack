/** M5 Home — greeting + streak, Today's Focus, due-soon, goal list.
 * Pull-to-refresh is fully custom: drag down anywhere at the top and the
 * RefreshArc header stretches open (arc fills with pull), past the threshold
 * it spins while syncing, then draws the tick. No native spinner anywhere. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { FlatList as GHFlatList } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '../../constants/colors';
import { useTheme } from '../../lib/theme';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { FontFamily, Typography } from '../../constants/typography';
import { GoalCard } from '../../components/GoalCard';
import { SkeletonCard } from '../../components/Skeleton';
import { RefreshArc, RefreshState } from '../../components/RefreshArc';
import { Card } from '../../components/ui';
import { useGoals } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { displayProgress, templateMeta } from '../../lib/templates';
import { useReduceMotion } from '../../lib/useReduceMotion';

const PULL_THRESHOLD = 84;
const HEADER_MAX = 72;

function greeting(name?: string) {
  const h = new Date().getHours();
  const day = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${day}${name ? `, ${name}` : ''}`;
}

export default function Home() {
  const t = useTheme();
  const { goals, dashboard, loading, error, refresh, clearError } = useGoals();
  const active = goals.filter((g) => g.status === 'active');
  const streak = dashboard?.streak_days ?? 0;
  const focus = active[0];
  const focusProg = focus ? displayProgress(focus) : null;
  const focusMeta = focus ? templateMeta(focus) : null;
  const reduceMotion = useReduceMotion();
  const flicker = useSharedValue(1);

  const [syncState, setSyncState] = useState<RefreshState>('idle');
  const wasLoading = useRef(false);

  // Pull gesture state (all shared — zero React re-renders while dragging).
  const pullY = useSharedValue(0);
  const pullProg = useSharedValue(0);
  const atTop = useSharedValue(true);

  useEffect(() => {
    if (streak > 0 && !reduceMotion) {
      flicker.value = withRepeat(withSequence(withTiming(0.55, { duration: 900 }), withTiming(1, { duration: 900 })), -1, true);
    } else {
      cancelAnimation(flicker);
      flicker.value = 1;
    }
  }, [streak, reduceMotion, flicker]);

  const flickerStyle = useAnimatedStyle(() => ({ opacity: flicker.value }));

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Arc status machine: spin while syncing, tick on success, rest idle.
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
    }, 1300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error]);

  const doRefresh = useCallback(() => {
    clearError();
    refresh();
  }, [clearError, refresh]);

  const doRefreshRef = useRef(doRefresh);
  doRefreshRef.current = doRefresh;

  // Errors surface as dismissible top toasts (with Retry) — never as
  // dead-end cards pinned into the feed.
  const toast = useToast();
  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      toast.show({
        type: 'error',
        title: 'Could not sync',
        message: error,
        duration: 5000,
        action: { label: 'Retry', onPress: () => doRefreshRef.current() },
      });
    }
    if (!error) lastErrorRef.current = null;
  }, [error, toast]);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8, overflow: 'hidden' }, headerStyle]}>
        <RefreshArc state={arcState} arcProgress={pullProg} label="Pull to refresh" />
      </Animated.View>
      <GestureDetector gesture={Gesture.Simultaneous(native, pan)}>
        <Animated.View style={[{ flex: 1 }, listStyle]}>
          <GHFlatList
            data={active}
            keyExtractor={(g) => String(g.id)}
            contentContainerStyle={{ padding: Spacing.lg, gap: 12, paddingBottom: 170 }}
            scrollEventThrottle={16}
            onScroll={(e) => {
              atTop.value = e.nativeEvent.contentOffset.y <= 4;
            }}
            ListHeaderComponent={
              <View style={{ gap: 12, marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text accessibilityRole="header" style={{ fontFamily: FontFamily.expressive, fontSize: 40, color: t.ink }}>
                    {greeting()}
                  </Text>
                  <View
                    accessibilityLabel={`${streak} day streak`}
                    accessibilityRole="text"
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  >
                    <Animated.View style={[{ flexDirection: 'row', alignItems: 'center' }, flickerStyle]}>
                      <Ionicons name="flame" size={16} color={Brand.amberDot} />
                    </Animated.View>
                    <Text style={{ fontWeight: '700', color: t.ink }}>{streak}</Text>
                  </View>
                </View>
                {focus && (
                  <Pressable
                    onPress={() => router.push(`/goal/${focus.id}`)}
                    accessibilityLabel={`Today's focus: ${focus.title}. Open goal detail.`}
                    accessibilityRole="button"
                  >
                    <Card>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal }}>Today's focus</Text>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: t.ink, marginTop: 4 }}>
                        {focus.title}
                      </Text>
                      <Text style={{ fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
                        {focusProg!.current} of {focusProg!.target ?? 'unknown'} {focusMeta!.unit}
                      </Text>
                    </Card>
                  </Pressable>
                )}
                {loading && active.length === 0 && (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                )}
                {active.length === 0 && !loading && (
                  <Card>
                    <Text style={{ fontFamily: FontFamily.expressive, fontSize: 24, color: t.ink }}>Start with one goal.</Text>
                    <Text style={{ marginTop: 4, fontSize: 14, color: t.inkSoft }}>
                      Tell OnTrack what you want to achieve and your tracker appears here.
                    </Text>
                    <Pressable
                      onPress={() => router.push('/(tabs)/chat')}
                      accessibilityLabel="Open chat to create your first goal"
                      accessibilityRole="button"
                      style={{ marginTop: 12, backgroundColor: t.primary, borderRadius: Radii.pill, paddingVertical: 12, alignItems: 'center', minHeight: Touch.min, justifyContent: 'center' }}
                    >
                      <Text style={{ color: t.primaryInk, fontWeight: '700' }}>Open chat</Text>
                    </Pressable>
                  </Card>
                )}
                <Text accessibilityRole="header" style={{ fontSize: 14, fontWeight: '700', color: t.ink }}>
                  Active goals ({active.length})
                </Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInUp.duration(300).delay(Math.min(index, 5) * 70)}>
                <GoalCard goal={item} onOpen={() => router.push(`/goal/${item.id}`)} />
              </Animated.View>
            )}
          />
        </Animated.View>
      </GestureDetector>
      {/* Goal creation lives in the dock's center action (joined FAB). */}
      <View accessible={false} style={{ height: Touch.min }} />
    </SafeAreaView>
  );
}
