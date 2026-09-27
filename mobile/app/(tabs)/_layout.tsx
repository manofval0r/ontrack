/** Bottom tabs: Home · Chat · Goals · Settings (M5–M7, M10). */
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Brand } from '../../constants/colors';

const icons: Record<string, string> = { index: '🏠', chat: '💬', goals: '✓', settings: '⚙' };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Brand.turquoise,
        tabBarInactiveTintColor: Brand.navy,
        tabBarStyle: { borderTopWidth: 2, borderTopColor: Brand.navy, minHeight: 64 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, marginTop: 8, opacity: focused ? 1 : 0.6 }}>
            {icons[route.name] ?? '•'}
          </Text>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
