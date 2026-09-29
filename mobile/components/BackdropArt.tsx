/** BackdropArt — animated brand backgrounds for empty space.
 * Dots drift, blobs breathe, rings rotate. Transform/opacity only,
 * disabled under reduced motion. Variants pick density per screen. */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Brand } from '../constants/colors';
import { useReduceMotion } from '../lib/useReduceMotion';

function useDrift(range: number, duration: number, reduce: boolean) {
  const v = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    v.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(v);
  }, [v, duration, reduce]);
  return useAnimatedStyle(() => ({
    transform: [{ translateX: v.value * range }, { translateY: v.value * (range * 0.6) }],
  }));
}

function Blobs({ reduce }: { reduce: boolean }) {
  const a = useDrift(26, 5200, reduce);
  const b = useDrift(-22, 6400, reduce);
  const c = useDrift(16, 4600, reduce);
  return (
    <>
      <Animated.View style={[{ position: 'absolute', top: -70, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: Brand.cyanBg, opacity: 0.8 }, a]} />
      <Animated.View style={[{ position: 'absolute', bottom: -50, left: -70, width: 260, height: 260, borderRadius: 130, backgroundColor: Brand.cyanBg, opacity: 0.55 }, b]} />
      <Animated.View style={[{ position: 'absolute', top: '42%', left: -90, width: 150, height: 150, borderRadius: 75, backgroundColor: Brand.mint, opacity: 0.5 }, c]} />
    </>
  );
}

function DotField() {
  const rows = 9;
  const cols = 6;
  const dots: Array<{ x: number; y: number; accent: boolean }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({ x: c, y: r, accent: (r * 7 + c * 3) % 11 === 0 });
    }
  }
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 180" preserveAspectRatio="xMidYMid slice">
      {dots.map((d, i) => (
        <Circle
          key={i}
          cx={10 + d.x * 20}
          cy={10 + d.y * 20}
          r={d.accent ? 2.6 : 1.6}
          fill={d.accent ? Brand.turquoise : Brand.navy}
          opacity={d.accent ? 0.8 : 0.12}
        />
      ))}
    </Svg>
  );
}

function Rings({ reduce }: { reduce: boolean }) {
  const spin = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    spin.value = withRepeat(withTiming(360, { duration: 26000, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(spin);
  }, [spin, reduce]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  return (
    <Animated.View style={[{ position: 'absolute', bottom: 60, right: -50, opacity: 0.5 }, style]}>
      <Svg width={170} height={170} viewBox="0 0 170 170">
        <Circle cx={85} cy={85} r={70} fill="none" stroke={Brand.turquoise} strokeWidth={3} strokeDasharray="10 14" />
        <Circle cx={85} cy={85} r={48} fill="none" stroke={Brand.teal} strokeWidth={2} strokeDasharray="4 10" />
      </Svg>
    </Animated.View>
  );
}

export function BackdropArt({ variant = 'blobs' }: { variant?: 'blobs' | 'dots' | 'rings' | 'full' }) {
  const reduce = useReduceMotion();
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
    >
      {(variant === 'blobs' || variant === 'full') && <Blobs reduce={reduce} />}
      {(variant === 'dots' || variant === 'full') && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.7 }}>
          <DotField />
        </View>
      )}
      {(variant === 'rings' || variant === 'full') && <Rings reduce={reduce} />}
    </View>
  );
}
