/** M1 Splash: brand logo + tagline + looping progress bar, then route by session. */
import { useEffect } from 'react';
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
import { getToken } from '../lib/auth';
import { useReduceMotion } from '../lib/useReduceMotion';

export default function Splash() {
  const reduce = useReduceMotion();
  const bar = useSharedValue(0.1);

  useEffect(() => {
    if (!reduce) {
      bar.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      bar.value = 1;
    }
    (async () => {
      const token = await getToken();
      setTimeout(() => {
        router.replace(token ? '/(tabs)' : '/onboarding');
      }, 1400);
    })();
    return () => cancelAnimation(bar);
  }, [reduce, bar]);

  const barStyle = useAnimatedStyle(() => ({ width: `${Math.round(bar.value * 100)}%` }));

  return (
    <View style={{ flex: 1, backgroundColor: Brand.navy, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 48 }}>
      <Image
        source={require('../assets/icon.png')}
        style={{ width: 120, height: 120, borderRadius: 28 }}
        resizeMode="contain"
        accessibilityLabel="OnTrack logo"
      />
      <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 34, color: '#fff' }}>OnTrack</Text>
      <Text style={{ fontSize: 14, color: Brand.turquoise, fontWeight: '600' }}>
        Say your goal. Get your tracker.
      </Text>
      <View style={{ marginTop: 12, width: '100%', height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
        <Animated.View style={[{ height: '100%', backgroundColor: Brand.turquoise, borderRadius: 999 }, barStyle]} />
      </View>
    </View>
  );
}
