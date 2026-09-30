/** Catch-all for unmatched routes — never expo-router's default again.
 * "You are off track." with wayfinding: back, tabs, sitemap, support. */
import { Pressable, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { Brand } from '../constants/colors';
import { Radii, Spacing, Touch } from '../constants/spacing';
import { PillButton } from '../components/ui';
import { useReduceMotion } from '../lib/useReduceMotion';

const SITEMAP = [
  { label: 'Home', route: '/(tabs)', icon: 'home' },
  { label: 'Chat', route: '/(tabs)/chat', icon: 'chatbubble' },
  { label: 'Goals', route: '/(tabs)/goals', icon: 'checkmark-circle' },
  { label: 'Settings', route: '/(tabs)/settings', icon: 'settings' },
  { label: 'Onboarding', route: '/onboarding', icon: 'compass' },
  { label: 'Log in', route: '/(auth)/login', icon: 'log-in' },
] as const;

function LostMark() {
  const reduce = useReduceMotion();
  return (
    <Svg width={180} height={130} viewBox="0 0 200 150">
      <Path
        d="M40 110 C 70 110, 95 95, 130 70 M130 70 l-13 3 M130 70 l-2 13"
        fill="none"
        stroke={Brand.turquoise}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={260}
        strokeDashoffset={reduce ? 0 : undefined}
      />
      <Circle cx={150} cy={45} r={10} fill="none" stroke={Brand.turquoise} strokeWidth={4} strokeDasharray="6 8" />
      <Circle cx={45} cy={35} r={4} fill={Brand.aqua} />
      <Circle cx={170} cy={115} r={5} fill={Brand.aqua} />
    </Svg>
  );
}

export default function NotFound() {
  const pathname = usePathname();
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.navy, padding: Spacing.xl }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <LostMark />
        <Animated.View entering={FadeInDown.duration(350)}>
          <Text style={{ fontFamily: 'Original_Surfer_400Regular', fontSize: 40, color: Brand.white, textAlign: 'center' }}>
            You are off track.
          </Text>
        </Animated.View>
        <Text style={{ color: Brand.turquoise, textAlign: 'center', fontSize: 14 }}>
          This page wandered off the plan — let's get you back.
        </Text>
        {!!pathname && (
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} numberOfLines={1}>
            {pathname}
          </Text>
        )}
        <View style={{ width: '100%', gap: 10, marginTop: 8 }}>
          <PillButton title="Back on track" primary onPress={goBack} />
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', marginTop: 8 }}>
          SITEMAP
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {SITEMAP.map((s) => (
            <Pressable
              key={s.route}
              onPress={() => router.replace(s.route as any)}
              accessibilityLabel={`Go to ${s.label}`}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 2,
                borderColor: Brand.turquoise,
                borderRadius: Radii.pill,
                paddingVertical: 8,
                paddingHorizontal: 14,
                minHeight: Touch.min,
              }}
            >
              <Ionicons name={s.icon as any} size={16} color={Brand.turquoise} />
              <Text style={{ color: Brand.white, fontWeight: '600', fontSize: 13 }}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
