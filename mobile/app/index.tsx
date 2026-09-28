/** M1 Splash: brand logo + tagline + looping progress bar, then route by session. */
import { useEffect, useRef } from 'react';
import { Image, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Brand } from '../constants/colors';
import { Radii, Spacing } from '../constants/spacing';
import { FontFamily, Typography } from '../constants/typography';
import { getToken } from '../lib/auth';
import { useReduceMotion } from '../lib/useReduceMotion';

export default function Splash() {
  const reduce = useReduceMotion();
  const bar = useSharedValue(0.1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!reduce) {
      bar.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      bar.value = 1;
    }
    (async () => {
      try {
        const token = await getToken();
        timer.current = setTimeout(() => {
          router.replace(token ? '/(tabs)' : '/onboarding');
        }, 1400);
      } catch {
        timer.current = setTimeout(() => router.replace('/onboarding'), 1400);
      }
    })();
    return () => {
      cancelAnimation(bar);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [reduce, bar]);

  const barStyle = useAnimatedStyle(() => ({ width: `${Math.round(bar.value * 100)}%` }));

  return (
    <View style={{ flex: 1, backgroundColor: Brand.navy, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: Spacing.huge }}>
      <Image
        source={require('../assets/icon.png')}
        style={{ width: 120, height: 120, borderRadius: Radii.squircle }}
        resizeMode="contain"
        accessible
        accessibilityRole="image"
        accessibilityLabel="OnTrack logo"
      />
      <Text style={{ fontFamily: FontFamily.expressive, fontSize: 38, color: Brand.white }}>OnTrack</Text>
      <Text style={{ fontSize: Typography.body.fontSize, color: Brand.turquoise, fontWeight: '600' }}>
        Say your goal. Get your tracker.
      </Text>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Loading OnTrack"
        style={{ marginTop: Spacing.md, width: '100%', height: 8, borderRadius: Radii.pill, backgroundColor: Brand.trackOnNavy, overflow: 'hidden' }}
      >
        <Animated.View style={[{ height: '100%', backgroundColor: Brand.turquoise, borderRadius: Radii.pill }, barStyle]} />
      </View>
    </View>
  );
}
