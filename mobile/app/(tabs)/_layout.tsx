/** Floating dock — one shared pill glides between measured tab stops.
 * Drag the pill anywhere on the bar: it follows the finger, ducks under the
 * center Chat island, and on release settles on the nearest stop and goes
 * there. Taps work as before. No haptics, no bounce — motion is a smooth
 * glide (withTiming). Stops are MEASURED via onLayout (never computed), so
 * the pill always lands centered on the active icon. When chat is focused
 * the pill fades out and the center island's own ring takes over.
 * Crash-proofing: the gesture NEVER navigates directly. onEnd only schedules
 * a state update (scheduleOnRN + stable setState — no stale closures); a
 * React effect performs navigation with fresh closures inside try/catch. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand } from '../../constants/colors';
import { Radii } from '../../constants/spacing';
import { useReduceMotion } from '../../lib/useReduceMotion';

const TABS: Record<string, { icon: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap; label: string }> = {
  index: { icon: 'home', outline: 'home-outline', label: 'Home' },
  goals: { icon: 'checkmark-circle', outline: 'checkmark-circle-outline', label: 'Goals' },
  settings: { icon: 'settings', outline: 'settings-outline', label: 'Settings' },
  you: { icon: 'person', outline: 'person-outline', label: 'You' },
};

const STOP_ORDER = ['index', 'goals', 'settings', 'you'] as const;
type StopName = (typeof STOP_ORDER)[number];
// Pill hugs the icon row only (60x40 at top:12): labels sit below it and
// stay fully visible. Icon center ≈ y32 — pill center ≈ y32.
const PILL_W = 60;
const PILL_H = 40;
const PILL_TOP = 12;
const CENTER_W = 72;
const BAR_PAD = 6;
const GLIDE_MS = 260;

function DockTab({
  route,
  focused,
  onPress,
  onMeasure,
}: {
  route: string;
  focused: boolean;
  onPress: () => void;
  onMeasure: (name: string, x: number, width: number) => void;
}) {
  const tab = TABS[route] ?? TABS.index;
  return (
    <Pressable
      onPress={onPress}
      onLayout={(e) => {
        const { x, width } = e.nativeEvent.layout;
        onMeasure(route, x, width);
      }}
      accessibilityLabel={tab.label}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityHint={`Go to ${tab.label}`}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        minHeight: 70,
        borderRadius: 16,
      }}
    >
      <Ionicons name={focused ? tab.icon : tab.outline} size={27} color={focused ? Brand.teal : Brand.navy} />
      <Text style={{ fontSize: 11, fontWeight: '700', color: focused ? Brand.teal : Brand.navy }}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

/** The conversation button: twin-bubble glyph on a lifted island.
 * The ring shows ONLY when chat is active; idle state lifts via a deeper
 * shadow + elevation instead of decoration. */
function CenterAction({ focused, onPress }: { focused: boolean; onPress: () => void }) {
  return (
    <View style={{ width: CENTER_W, alignItems: 'center', justifyContent: 'flex-start', zIndex: 2 }}>
      <View style={{ marginTop: -26, alignItems: 'center', justifyContent: 'center' }}>
        {focused && (
          <View
            accessibilityElementsHidden
            style={{
              position: 'absolute',
              width: 70,
              height: 70,
              borderRadius: 35,
              borderWidth: 2,
              borderColor: Brand.navy,
              opacity: 1,
            }}
          />
        )}
        <Pressable
          onPress={onPress}
          accessibilityLabel="Open chat"
          accessibilityRole="button"
          accessibilityHint="Talk to OnTrack: create goals, log progress, ask questions"
          accessibilityState={{ selected: focused }}
          style={({ pressed }) => ({
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: Brand.turquoise,
            borderWidth: 3,
            borderColor: Brand.navy,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: Brand.navy,
            shadowOffset: { width: 0, height: focused ? 4 : 7 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: focused ? 6 : 9,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Ionicons name="chatbubbles" size={28} color={Brand.navy} />
        </Pressable>
      </View>
      <Text style={{ fontSize: 11, fontWeight: '700', color: focused ? Brand.teal : Brand.navy, marginTop: 4 }}>
        Chat
      </Text>
    </View>
  );
}

interface DockRoute {
  key: string;
  name: string;
}

interface DockProps {
  state: { index: number; routes: DockRoute[] };
  navigation: {
    emit: (event: any) => any;
    navigate: (name: string) => void;
  };
}

function FloatingDock({ state, navigation }: DockProps) {
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const [barWidth, setBarWidth] = useState(0);
  // Slot centers measured relative to their side row; side rows measured
  // relative to the bar. Sum = bar-relative stop. Never computed from math.
  const [slots, setSlots] = useState<Record<string, number>>({});
  const [sideX, setSideX] = useState<{ left: number; right: number }>({ left: 0, right: 0 });

  const dragX = useSharedValue(0);
  const dragging = useSharedValue(false);
  const startX = useSharedValue(0);
  const ringMix = useSharedValue(0); // 0 = pill visible, 1 = chat (pill fades, island ring shows)
  const ready = useRef(false);

  const activeName = state.routes[state.index]?.name ?? 'index';
  const byName = useMemo(
    () => Object.fromEntries(state.routes.map((r, i) => [r.name, i])),
    [state.routes]
  );

  const stops = useMemo(() => {
    const out: Partial<Record<StopName | 'center', number>> = {};
    const at = (n: string, base: number) => (slots[n] != null ? base + slots[n] : null);
    const l0 = at('index', sideX.left);
    const l1 = at('goals', sideX.left);
    const r0 = at('settings', sideX.right);
    const r1 = at('you', sideX.right);
    if (l0 != null) out.index = l0;
    if (l1 != null) out.goals = l1;
    if (r0 != null) out.settings = r0;
    if (r1 != null) out.you = r1;
    if (barWidth > 0) out.center = barWidth / 2;
    return out;
  }, [slots, sideX, barWidth]);

  const stopLeft = useCallback(
    (name: string): number | null => {
      const c = name === 'chat' ? stops.center : (stops as Record<string, number | undefined>)[name];
      return c == null ? null : c - PILL_W / 2 - 2;
    },
    [stops]
  );

  const hasStop = stopLeft(activeName) != null;

  const nearestStop = useCallback(
    (centerX: number): StopName => {
      let best: StopName = STOP_ORDER[0];
      let bestD = Infinity;
      for (const n of STOP_ORDER) {
        const c = stops[n];
        if (c == null) continue;
        const d = Math.abs(c - centerX);
        if (d < bestD) {
          bestD = d;
          best = n;
        }
      }
      return best;
    },
    [stops]
  );

  // Drop commit — runs in React land with fresh closures, never in a worklet.
  // (Worklets may only touch shared values + scheduleOnRN: calling the plain
  // JS helpers nearestStop/stopLeft from onEnd crashed release builds.)
  const [drop, setDrop] = useState<{ x: number; vx: number } | null>(null);
  useEffect(() => {
    if (!drop) return;
    let name = nearestStop(drop.x);
    if (Math.abs(drop.vx) > 700) {
      const i = STOP_ORDER.indexOf(name);
      name = STOP_ORDER[Math.min(STOP_ORDER.length - 1, Math.max(0, i + (drop.vx > 0 ? 1 : -1)))];
    }
    const dropTarget = name;
    const target = stopLeft(dropTarget);
    if (target != null && !reduce) {
      dragX.value = withTiming(target, { duration: GLIDE_MS });
    } else if (target != null) {
      dragX.value = target;
    }
    try {
      if (dropTarget !== state.routes[state.index]?.name) {
        const idx = byName[dropTarget];
        if (idx !== undefined) {
          const route = state.routes[idx];
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!event.defaultPrevented) navigation.navigate(route.name);
        }
      }
    } catch {
      // A failed drop navigation must never strand the pill: snap it back
      // to the actually-active tab.
      const fallback = stopLeft(state.routes[state.index]?.name ?? 'index');
      if (fallback != null) dragX.value = fallback;
    } finally {
      setDrop(null);
    }
  }, [drop, nearestStop, stopLeft, byName, navigation, state.routes, state.index, dragX, reduce]);

  // Glide the pill to the active stop on every navigation (tap or drop).
  // Ring fade follows chat focus. Instant when reduced motion is on.
  useEffect(() => {
    const target = stopLeft(activeName);
    if (target == null) return;
    const chat = activeName === 'chat';
    if (!ready.current) {
      dragX.value = target;
      ringMix.value = chat ? 1 : 0;
      ready.current = true;
      return;
    }
    if (dragging.value) return;
    if (reduce) {
      dragX.value = target;
      ringMix.value = chat ? 1 : 0;
    } else {
      dragX.value = withTiming(target, { duration: GLIDE_MS });
      ringMix.value = withTiming(chat ? 1 : 0, { duration: GLIDE_MS });
    }
  }, [activeName, stopLeft, dragX, dragging, ringMix, reduce]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .onBegin(() => {
          dragging.value = true;
          startX.value = dragX.value;
        })
        .onUpdate((e) => {
          const max = Math.max(0, barWidth - BAR_PAD * 2 - PILL_W);
          dragX.value = Math.min(max, Math.max(0, startX.value + e.translationX));
        })
        .onEnd((e) => {
          dragging.value = false;
          // UI thread may only touch shared values + scheduleOnRN — the
          // nearest-stop math runs in the effect below with fresh closures.
          scheduleOnRN(setDrop, { x: dragX.value + PILL_W / 2, vx: e.velocityX });
        })
        // Cancelled gestures (tap, interruption) skip onEnd — without this
        // `dragging` sticks true forever and the pill stops following taps.
        .onFinalize(() => {
          dragging.value = false;
        }),
    [barWidth, dragX, dragging, startX, reduce]
  );

  const pillStyle = useAnimatedStyle(() => {
    const c = dragX.value + PILL_W / 2;
    const gapC = barWidth / 2;
    const proximity = barWidth > 0 ? Math.max(0, 1 - Math.abs(c - gapC) / 52) : 0;
    return {
      transform: [{ translateX: dragX.value }, { scale: 1 - 0.14 * proximity }],
      opacity: 1 - ringMix.value,
    };
  });

  const onMeasure = useCallback((name: string, x: number, width: number) => {
    const center = x + width / 2;
    setSlots((prev) => (Math.abs((prev[name] ?? -1) - center) < 0.5 ? prev : { ...prev, [name]: center }));
  }, []);

  const renderTab = (route: DockRoute, index: number) => {
    const focused = state.index === index;
    return (
      <DockTab
        key={route.key}
        route={route.name}
        focused={focused}
        onMeasure={onMeasure}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        }}
      />
    );
  };

  const left = ['index', 'goals'].map((n) => byName[n]).filter((i) => i !== undefined);
  const right = ['settings', 'you'].map((n) => byName[n]).filter((i) => i !== undefined);
  const chatIdx = byName.chat;

  const openChat = () => {
    if (chatIdx === undefined || state.index === chatIdx) return;
    const route = state.routes[chatIdx];
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(route.name);
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: Math.max(insets.bottom, 12),
      }}
    >
      <GestureDetector gesture={pan}>
        <View
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          style={{
            flexDirection: 'row',
            alignItems: 'stretch',
            backgroundColor: Brand.white,
            borderWidth: 2,
            borderColor: Brand.navy,
            borderRadius: Radii.card,
            paddingVertical: 6,
            paddingHorizontal: BAR_PAD,
            shadowColor: Brand.navy,
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 6,
          }}
        >
          {hasStop && (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: PILL_TOP,
                  left: 0,
                  width: PILL_W,
                  height: PILL_H,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: Brand.navy,
                  backgroundColor: Brand.turquoise,
                  shadowColor: Brand.navy,
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                  zIndex: 1,
                },
                pillStyle,
              ]}
            />
          )}
          <View
            style={{ flex: 1, flexDirection: 'row', zIndex: 2 }}
            onLayout={(e) => {
              const x = e.nativeEvent.layout.x;
              setSideX((p) => (p.left === x ? p : { ...p, left: x }));
            }}
          >
            {left.map((i) => renderTab(state.routes[i], i))}
          </View>
          <CenterAction focused={activeName === 'chat'} onPress={openChat} />
          <View
            style={{ flex: 1, flexDirection: 'row', zIndex: 2 }}
            onLayout={(e) => {
              const x = e.nativeEvent.layout.x;
              setSideX((p) => (p.right === x ? p : { ...p, right: x }));
            }}
          >
            {right.map((i) => renderTab(state.routes[i], i))}
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingDock {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="you" options={{ title: 'You' }} />
    </Tabs>
  );
}
