/** Bottom tabs: Home · Chat · Goals · Settings with vector icons + active rail. */
import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Brand } from '../../constants/colors';

const TABS: Record<string, { icon: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap; label: string }> = {
  index: { icon: 'home', outline: 'home-outline', label: 'Home' },
  chat: { icon: 'chatbubble', outline: 'chatbubble-outline', label: 'Chat' },
  goals: { icon: 'checkmark-circle', outline: 'checkmark-circle-outline', label: 'Goals' },
  settings: { icon: 'settings', outline: 'settings-outline', label: 'Settings' },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const tab = TABS[name] ?? TABS.index;
  const scale = useSharedValue(1);

  // Pop on focus
  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.15, { damping: 9 }, () => {
        scale.value = withSpring(1, { damping: 12 });
      });
    }
  }, [focused, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ alignItems: 'center', marginTop: 8, gap: 2 }}>
      <Animated.View style={style}>
        <Ionicons
          name={focused ? tab.icon : tab.outline}
          size={24}
          color={focused ? Brand.teal : Brand.navy}
        />
      </Animated.View>
      {focused && (
        <View style={{ width: 20, height: 4, borderRadius: 2, backgroundColor: Brand.turquoise }} />
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Brand.teal,
        tabBarInactiveTintColor: Brand.navy,
        tabBarStyle: { borderTopWidth: 2, borderTopColor: Brand.navy, minHeight: 68 },
        tabBarLabel: ({ focused }) => (
          <Text style={{ fontSize: 11, fontWeight: '600', marginBottom: 10, color: focused ? Brand.teal : Brand.navy }}>
            {TABS[route.name]?.label ?? route.name}
          </Text>
        ),
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
