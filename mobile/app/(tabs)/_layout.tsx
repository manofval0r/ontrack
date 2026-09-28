/** Floating dock tab bar — 4 tabs + a joined center action (not a nav link).
 * The + button overlaps the dock and routes to the coach chat where goals
 * are created. Taller, springy, safe-area aware. */
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Brand } from '../../constants/colors';
import { Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

const TABS: Record<string, { icon: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap; label: string }> = {
  index: { icon: 'home', outline: 'home-outline', label: 'Home' },
  goals: { icon: 'checkmark-circle', outline: 'checkmark-circle-outline', label: 'Goals' },
  settings: { icon: 'settings', outline: 'settings-outline', label: 'Settings' },
  you: { icon: 'person', outline: 'person-outline', label: 'You' },
};

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
        backgroundColor: focused ? Brand.cyanBg : 'transparent',
      }}
    >
      <Animated.View style={style}>
        {focused ? (
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: Brand.turquoise,
              borderWidth: 2,
              borderColor: Brand.navy,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: Brand.navy,
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 3,
            }}
          >
            <Ionicons name={tab.icon} size={25} color={Brand.navy} />
          </View>
        ) : (
          <Ionicons name={tab.outline} size={26} color={Brand.navy} />
        )}
      </Animated.View>
      <Text style={{ fontSize: 11, fontWeight: '700', color: focused ? Brand.teal : Brand.navy }}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

function CenterAction() {
  const press = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  return (
    <View style={{ width: 72, alignItems: 'center', justifyContent: 'flex-start' }}>
      <Animated.View style={[{ marginTop: -26 }, style]}>
        <Pressable
          onPress={() => {
            press.value = withSpring(0.9, { damping: 8 }, () => {
              press.value = withSpring(1, { damping: 10 });
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            router.push('/(tabs)/chat');
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
  const byName = Object.fromEntries(state.routes.map((r, i) => [r.name, i]));
  const left = ['index', 'goals'].map((n) => byName[n]).filter((i) => i !== undefined);
  const right = ['settings', 'you'].map((n) => byName[n]).filter((i) => i !== undefined);

  const renderTab = (route: (typeof state.routes)[number], index: number) => {
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

  return (
    <View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: Math.max(insets.bottom, 12),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          backgroundColor: Brand.white,
          borderWidth: 2,
          borderColor: Brand.navy,
          borderRadius: Radii.card,
          paddingVertical: 6,
          paddingHorizontal: 6,
          shadowColor: Brand.navy,
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 6,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>{left.map((i) => renderTab(state.routes[i], i))}</View>
        <CenterAction />
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {right.map((i) => renderTab(state.routes[i], i))}
        </View>
      </View>
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
