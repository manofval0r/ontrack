/** Shimmer skeleton — tactile placeholder while dashboard loads. */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Brand } from '../constants/colors';
import { Radii, Spacing } from '../constants/spacing';
import { useReduceMotion } from '../lib/useReduceMotion';

export function SkeletonCard() {
  const reduce = useReduceMotion();
  const glow = useSharedValue(0.5);

  useEffect(() => {
    if (!reduce) glow.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    return () => cancelAnimation(glow);
  }, [reduce, glow]);

  const style = useAnimatedStyle(() => ({ opacity: 0.45 + glow.value * 0.4 }));

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading goals"
      accessibilityState={{ busy: true }}
      style={[
        {
          backgroundColor: Brand.white,
          borderWidth: 2,
          borderColor: Brand.navy,
          borderRadius: Radii.card,
          padding: Spacing.lg,
          gap: 10,
        },
        style,
      ]}
    >
      <View style={{ width: '70%', height: 18, borderRadius: 6, backgroundColor: Brand.gray }} />
      <View style={{ height: 10, borderRadius: 999, backgroundColor: Brand.gray }} />
      <View style={{ width: '40%', height: 12, borderRadius: 6, backgroundColor: Brand.gray }} />
    </Animated.View>
  );
}
