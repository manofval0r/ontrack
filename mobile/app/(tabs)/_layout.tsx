/** Floating dock tab bar — draggable fluid pill + joined center action.
 * One shared Underpass Pill slides between the 4 tab stops: grab anywhere on
 * the bar and drag to scrub screens live (12px hysteresis, haptic per stop),
 * release to spring to the nearest stop. The pill ducks UNDER the raised
 * center Chat island (scaled down, lower z-order) — Chat is tap-only, never
 * committed by drag. Taps work exactly as before; drag is additive.
 * Chat focused → pill parks under + as a glow ring (its home base). */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
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
const PILL = 56;
const CENTER_W = 72;
const BAR_PAD = 6;
const HYSTERESIS = 12;

function DockTab({
  route,
  focused,
  onPress,
}: {
  route: string;
  focused: boolean;
  onPress: () => void;
}) {
  const tab = TABS[route] ?? TABS.index;
  const scale = useSharedValue(1);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.15, { damping: 9 }, () => {
        scale.value = withSpring(1, { damping: 12 });
      });
    }
  }, [focused, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
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
      <Animated.View style={style}>
        <Ionicons
          name={focused ? tab.icon : tab.outline}
          size={27}
          color={focused ? Brand.teal : Brand.navy}
        />
      </Animated.View>
      <Text style={{ fontSize: 11, fontWeight: '700', color: focused ? Brand.teal : Brand.navy }}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

function CenterAction({ focused, onPress }: { focused: boolean; onPress: () => void }) {
  const press = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  return (
    <View style={{ width: CENTER_W, alignItems: 'center', justifyContent: 'flex-start', zIndex: 2 }}>
      <Animated.View style={[{ marginTop: -26 }, style]}>
        <Pressable
          onPress={() => {
            press.value = withSpring(0.9, { damping: 8 }, () => {
              press.value = withSpring(1, { damping: 10 });
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            onPress();
          }}
          accessibilityLabel="Open coach chat"
          accessibilityRole="button"
          accessibilityHint="The main screen: talk to the coach, create goals, log progress"
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: Brand.turquoise,
            borderWidth: 3,
            borderColor: Brand.navy,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: Brand.navy,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 6,
          }}
        >
          <Ionicons name="add" size={30} color={Brand.navy} />
        </Pressable>
      </Animated.View>
      {focused && (
        <View
          accessibilityElementsHidden
          style={{
            position: 'absolute',
            top: -32,
            width: 68,
            height: 68,
            borderRadius: 34,
            borderWidth: 3,
            borderColor: Brand.turquoise,
            opacity: 0.9,
          }}
        />
      )}
      <Text style={{ fontSize: 11, fontWeight: '700', color: Brand.navy, marginTop: 4 }}>Chat</Text>
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
  const dragX = useSharedValue(0);
  const dragging = useSharedValue(false);
  const startX = useSharedValue(0);
  const isChatSV = useSharedValue(false);
  const ready = useRef(false);

  const activeName = state.routes[state.index]?.name ?? 'index';
  const byName = useMemo(
    () => Object.fromEntries(state.routes.map((r, i) => [r.name, i])),
    [state.routes]
  );

  // Deterministic stops: two flex:1 sides around the 72px center island.
  const stops = useMemo(() => {
    const inner = barWidth - BAR_PAD * 2;
    if (inner <= 0) return null;
    const side = (inner - CENTER_W) / 2;
    const base = BAR_PAD;
    return {
      index: base + side * 0.25,
      goals: base + side * 0.75,
      settings: base + side + CENTER_W + side * 0.25,
      you: base + side + CENTER_W + side * 0.75,
      center: base + side + CENTER_W / 2,
    };
  }, [barWidth]);

  const stopX = useCallback(
    (name: string): number => {
      if (!stops) return 0;
      if (name === 'chat') return stops.center - PILL / 2;
      const s = stops as Record<string, number>;
      return (s[name] ?? stops.index) - PILL / 2;
    },
    [stops]
  );

  const committed = useRef(activeName);
  committed.current = activeName;

  const commitRef = useRef((name: string) => {});
  commitRef.current = (name: string) => {
    if (name === committed.current) return;
    const idx = byName[name];
    if (idx === undefined) return;
    const route = state.routes[idx];
    Haptics.selectionAsync().catch(() => {});
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(route.name);
  };

  // Spring the pill to the active stop whenever navigation lands (tap or scrub).
  useEffect(() => {
    isChatSV.value = activeName === 'chat';
    if (!stops || dragging.value) return;
    const target = stopX(activeName);
    if (!ready.current) {
      dragX.value = target;
      ready.current = true;
      return;
    }
    dragX.value = reduce ? withTiming(target, { duration: 0 }) : withSpring(target, { stiffness: 300, damping: 24 });
  }, [activeName, stops, stopX, dragX, dragging, reduce, isChatSV]);

  const nearestStop = (centerX: number): (typeof STOP_ORDER)[number] => {
    if (!stops) return 'index';
    let best: (typeof STOP_ORDER)[number] = STOP_ORDER[0];
    let bestD = Infinity;
    for (const n of STOP_ORDER) {
      const d = Math.abs((stops as Record<string, number>)[n] - centerX);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    }
    return best;
  };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onBegin(() => {
          dragging.value = true;
          startX.value = dragX.value;
        })
        .onUpdate((e) => {
          if (!stops) return;
          const min = 0;
          const max = barWidth - BAR_PAD * 2 - PILL;
          const x = Math.min(max, Math.max(min, startX.value + e.translationX));
          dragX.value = x;
          if (reduce) return; // commit on release only
          const centerX = x + PILL / 2;
          const current = (stops as Record<string, number>)[committed.current] ?? stops.index;
          if (Math.abs(centerX - current) < HYSTERESIS) return;
          const next = nearestStop(centerX);
          if (next !== committed.current) runOnJS((n: string) => commitRef.current(n))(next);
        })
        .onEnd((e) => {
          dragging.value = false;
          if (!stops) return;
          let idx = STOP_ORDER.indexOf(nearestStop(dragX.value + PILL / 2));
          if (Math.abs(e.velocityX) > 800) {
            idx = Math.min(STOP_ORDER.length - 1, Math.max(0, idx + (e.velocityX > 0 ? 1 : -1)));
          }
          const name = STOP_ORDER[idx];
          runOnJS((n: string) => commitRef.current(n))(name);
          const target = (stops as Record<string, number>)[name] - PILL / 2;
          dragX.value = reduce ? withTiming(target, { duration: 0 }) : withSpring(target, { stiffness: 300, damping: 24 });
        }),
    [stops, barWidth, dragX, dragging, startX, reduce]
  );

  const pillStyle = useAnimatedStyle(() => {
    const c = dragX.value + PILL / 2;
    const gapC = barWidth / 2;
    const proximity = barWidth > 0 ? Math.max(0, 1 - Math.abs(c - gapC) / 48) : 0;
    const scale = 1 - 0.15 * proximity;
    const chat = isChatSV.value;
    return {
      transform: [{ translateX: dragX.value }, { scale }],
      opacity: barWidth > 0 ? 1 : 0,
      backgroundColor: chat ? 'transparent' : Brand.turquoise,
      borderColor: chat ? Brand.turquoise : Brand.navy,
      borderWidth: chat ? 3 : 2,
    };
  });

  const renderTab = (route: DockRoute, index: number) => {
    const focused = state.index === index;
    return (
      <DockTab
        key={route.key}
        route={route.name}
        focused={focused}
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
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: '50%',
                marginTop: -PILL / 2,
                left: BAR_PAD,
                width: PILL,
                height: PILL,
                borderRadius: 16,
                borderWidth: 2,
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
          <View style={{ flex: 1, flexDirection: 'row', zIndex: 2 }}>
            {left.map((i) => renderTab(state.routes[i], i))}
          </View>
          <CenterAction focused={activeName === 'chat'} onPress={openChat} />
          <View style={{ flex: 1, flexDirection: 'row', zIndex: 2 }}>
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
