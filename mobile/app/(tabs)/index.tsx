/** M5 Home — greeting + streak, Today's Focus, Daily Fuel, all-goals shortcut.
 * One goal in the spotlight (the most recent active one); the full roster
 * lives on the Goals tab. Pull-to-refresh is fully custom: drag down anywhere
 * at the top and the RefreshArc header stretches open (arc fills with pull),
 * past the threshold it spins while syncing, then draws the tick. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '../../constants/colors';
import { useTheme } from '../../lib/theme';
import { Radii, Spacing, Touch } from '../../constants/spacing';
import { FontFamily, Typography } from '../../constants/typography';
import { SkeletonCard } from '../../components/Skeleton';
import { RefreshArc, RefreshState } from '../../components/RefreshArc';
import { Card } from '../../components/ui';
import { useGoals } from '../../lib/store';
import { useToast } from '../../lib/toast';
import { displayProgress, templateMeta } from '../../lib/templates';
import { useReduceMotion } from '../../lib/useReduceMotion';

const PULL_THRESHOLD = 84;
const HEADER_MAX = 72;

/** Domain fuel — honest, local, rotating daily. Real stats (streak, counts)
 * come from the dashboard; these lines are coaching, not fabricated data.
 * Structured for the roadmap: quizzes plug into this same slot later.
 * Each entry pairs a short expressive headline with one actionable line. */
interface FuelEntry {
  head: string;
  body: string;
}
const FUEL: Record<string, FuelEntry[]> = {
  sales: [
    { head: 'Speed beats polish', body: 'Follow up within a day and close rates climb. Send the one message you are avoiding.' },
    { head: 'Log it while true', body: 'Log every outreach the hour it happens; memory lies, trackers don’t.' },
    { head: 'One more call', body: 'One more call at day’s end compounds more than a perfect morning.' },
  ],
  fitness: [
    { head: 'Short still counts', body: 'Consistency beats intensity — a ten-minute session keeps the streak honest.' },
    { head: 'Log it sweaty', body: 'Log right after the set, while the number is honest.' },
    { head: 'Easy protects hard', body: 'Soreness is data, not failure. Easy days protect hard days.' },
  ],
  study: [
    { head: 'Twenty sharp pages', body: 'Twenty focused pages beat two distracted hours. Phone in another room.' },
    { head: 'One sentence', body: 'Write one sentence about what you read — it doubles retention.' },
    { head: 'Streaks cover Mondays', body: 'Streaks protect the habit on days motivation skips.' },
  ],
  general: [
    { head: 'Momentum is built', body: 'Small steps, logged daily — momentum is built, not found.' },
    { head: 'Two-minute rule', body: 'If it takes under two minutes, do it now and log it.' },
    { head: 'Nights review, mornings run', body: 'Review the board nightly; mornings are for executing.' },
  ],
};

function fuelPool(goal: any): FuelEntry[] {
  const hay = `${goal?.goal_template ?? ''} ${goal?.goal_type ?? ''} ${goal?.title ?? ''}`.toLowerCase();
  if (/sales|deal|pipeline|client/.test(hay)) return FUEL.sales;
  if (/fit|pushup|run|gym|workout|rep/.test(hay)) return FUEL.fitness;
  if (/book|read|study|ship|commit/.test(hay)) return FUEL.study;
  return FUEL.general;
}

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
  const done = goals.filter((g) => g.status !== 'active').length;
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

  // Daily Fuel rotates with the calendar — same tip all day, fresh tomorrow.
  // The shuffle nudge is a local offset so users can peek at siblings.
  const [fuelNudge, setFuelNudge] = useState(0);
  const fuelPoolMemo = useMemo(() => (focus ? fuelPool(focus) : []), [focus]);
  const fuel = useMemo(() => {
    if (!focus || fuelPoolMemo.length === 0) return null;
    const day = Math.floor(Date.now() / 86400000);
    return fuelPoolMemo[(day + fuelNudge) % fuelPoolMemo.length];
  }, [focus, fuelPoolMemo, fuelNudge]);
  const fuelDomain = useMemo(() => {
    if (!focus) return 'general';
    const hay = `${focus?.goal_template ?? ''} ${focus?.goal_type ?? ''} ${focus?.title ?? ''}`.toLowerCase();
    if (/sales|deal|pipeline|client/.test(hay)) return 'sales';
    if (/fit|pushup|run|gym|workout|rep/.test(hay)) return 'fitness';
    if (/book|read|study|ship|commit/.test(hay)) return 'study';
    return 'general';
  }, [focus]);

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
        .activeOffsetY([22, 1000])
        .failOffsetX([-12, 12])
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
          <GHScrollView
            contentContainerStyle={{ padding: Spacing.lg, gap: 12, paddingBottom: 170 }}
            scrollEventThrottle={16}
            onScroll={(e) => {
              atTop.value = e.nativeEvent.contentOffset.y <= 4;
            }}
          >
            <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(300)}>
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
            </Animated.View>

            {loading && active.length === 0 && (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {focus ? (
              <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(300).delay(80)}>
                <Pressable
                  onPress={() => router.push(`/goal/${focus.id}`)}
                  accessibilityLabel={`Today's focus: ${focus.title}. Open goal detail.`}
                  accessibilityRole="button"
                >
                  <Card>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal }}>Today's focus</Text>
                    <Text style={{ fontFamily: FontFamily.expressive, fontSize: 26, color: t.ink, marginTop: 4 }}>
                      {focus.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
                      {focusProg!.current} of {focusProg!.target ?? 'unknown'} {focusMeta!.unit}
                      {active.length > 1 ? ` · +${active.length - 1} more running` : ''}
                      {done > 0 ? ` · ${done} shipped` : ''}
                    </Text>
                  </Card>
                </Pressable>
              </Animated.View>
            ) : (
              !loading && (
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
              )
            )}

            {focus && fuel && (
              <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(300).delay(160)}>
                <View
                  accessibilityLabel={`Daily fuel: ${fuel.head}. ${fuel.body}`}
                  accessibilityRole="text"
                  style={{
                    backgroundColor: Brand.navy,
                    borderWidth: 2,
                    borderColor: Brand.navy,
                    borderRadius: Radii.card,
                    padding: Spacing.lg,
                    shadowColor: Brand.navy,
                    shadowOffset: { width: 4, height: 4 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 4,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View
                      accessibilityElementsHidden
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: Brand.turquoise,
                        borderWidth: 2,
                        borderColor: Brand.white,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="flame" size={18} color={Brand.navy} />
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: Brand.aqua, letterSpacing: 1.2 }}>
                      DAILY FUEL · {fuelDomain.toUpperCase()}
                    </Text>
                    <View style={{ flex: 1 }} />
                    {streak > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Ionicons name="flame" size={13} color={Brand.amberDot} accessibilityElementsHidden />
                        <Text style={{ fontSize: 12, fontWeight: '800', color: Brand.white }}>{streak}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontFamily: FontFamily.expressive, fontSize: 30, lineHeight: 34, color: Brand.white, marginTop: 10 }}>
                    {fuel.head}
                  </Text>
                  <Text style={{ marginTop: 6, fontSize: 15, lineHeight: 22, color: Brand.faintOnNavy }}>
                    {fuel.body}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                    <Pressable
                      onPress={() => router.push(`/goal/${focus.id}`)}
                      accessibilityLabel={`Log progress on ${focus.title}`}
                      accessibilityRole="button"
                      style={({ pressed }) => ({
                        flex: 1,
                        minHeight: Touch.min,
                        borderRadius: Radii.pill,
                        backgroundColor: Brand.turquoise,
                        borderWidth: 2,
                        borderColor: Brand.white,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 6,
                        transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : [],
                      })}
                    >
                      <Ionicons name="add-circle" size={18} color={Brand.navy} />
                      <Text style={{ fontWeight: '800', color: Brand.navy }}>Log a win</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setFuelNudge((n) => n + 1)}
                      accessibilityLabel="Show another fuel tip"
                      accessibilityRole="button"
                      hitSlop={8}
                      style={({ pressed }) => ({
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        borderWidth: 2,
                        borderColor: Brand.hairOnNavy,
                        backgroundColor: Brand.cardOnNavy,
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: pressed ? [{ scale: 0.94 }] : [],
                      })}
                    >
                      <Ionicons name="shuffle" size={20} color={Brand.white} />
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                    {fuelPoolMemo.map((_, i) => {
                      const day = Math.floor(Date.now() / 86400000);
                      const on = i === (day + fuelNudge) % fuelPoolMemo.length;
                      return (
                        <View
                          key={i}
                          accessibilityElementsHidden
                          style={{
                            width: on ? 22 : 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: on ? Brand.turquoise : Brand.trackOnNavy,
                            borderWidth: on ? 1 : 0,
                            borderColor: Brand.white,
                          }}
                        />
                      );
                    })}
                    <View style={{ flex: 1 }} />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: Brand.faintOnNavy }}>
                      Fresh daily · quizzes soon
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}

            <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(300).delay(240)}>
              <Pressable
                onPress={() => router.push('/(tabs)/goals')}
                accessibilityLabel={`View all goals, ${active.length} active`}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  minHeight: Touch.min,
                  borderRadius: Radii.pill,
                  borderWidth: 2,
                  borderColor: t.border,
                  backgroundColor: t.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  shadowColor: t.shadow,
                  shadowOffset: { width: pressed ? 1 : 3, height: pressed ? 1 : 3 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 3,
                  transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : [],
                })}
              >
                <Ionicons name="list" size={18} color={t.teal} />
                <Text style={{ fontWeight: '700', color: t.ink, fontSize: Typography.body.fontSize }}>
                  {active.length > 0 ? `View all ${active.length} goals` : 'View goals'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={t.teal} />
              </Pressable>
            </Animated.View>
          </GHScrollView>
        </Animated.View>
      </GestureDetector>
      {/* Goal creation lives in the dock's center action (joined FAB). */}
      <View accessible={false} style={{ height: Touch.min }} />
    </SafeAreaView>
  );
}
