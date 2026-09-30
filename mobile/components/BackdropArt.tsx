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
import { useTheme } from '../lib/theme';
import { useReduceMotion } from '../lib/useReduceMotion';

function Blobs({ reduce }: { reduce: boolean }) {
  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const c = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    a.value = withRepeat(withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.ease) }), -1, true);
    b.value = withRepeat(withTiming(1, { duration: 6400, easing: Easing.inOut(Easing.ease) }), -1, true);
    c.value = withRepeat(withTiming(1, { duration: 4600, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => {
      cancelAnimation(a);
      cancelAnimation(b);
      cancelAnimation(c);
    };
  }, [a, b, c, reduce]);
  const sa = useAnimatedStyle(() => ({ transform: [{ translateX: a.value * 30 }, { translateY: a.value * 22 }, { scale: 1 + a.value * 0.08 }] }));
  const sb = useAnimatedStyle(() => ({ transform: [{ translateX: b.value * -26 }, { translateY: b.value * -18 }, { scale: 1 + b.value * 0.06 }] }));
  const sc = useAnimatedStyle(() => ({ transform: [{ translateX: c.value * 20 }, { scale: 1 + c.value * 0.12 }] }));
  return (
    <>
      <Animated.View style={[{ position: 'absolute', top: -80, right: -70, width: 250, height: 250, borderRadius: 125, backgroundColor: Brand.turquoise, opacity: 0.28 }, sa]} />
      <Animated.View style={[{ position: 'absolute', bottom: -60, left: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: Brand.aqua, opacity: 0.3 }, sb]} />
      <Animated.View style={[{ position: 'absolute', top: '40%', left: -100, width: 170, height: 170, borderRadius: 85, backgroundColor: Brand.turquoise, opacity: 0.22 }, sc]} />
      <Animated.View style={[{ position: 'absolute', top: '62%', right: -60, width: 130, height: 130, borderRadius: 65, backgroundColor: Brand.mint, opacity: 0.8 }, sc]} />
    </>
  );
}

/** Web dot-grid canvas parity: 24px grid, 1.25-unit navy dots at 0.14 alpha
 * on the app canvas. Always on — blobs/rings are the accent on top. */
function DotField() {
  const t = useTheme();
  const step = 24;
  const cols = 6;
  const rows = 10;
  const dots: Array<{ x: number; y: number; accent: boolean }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({ x: c, y: r, accent: (r * 7 + c * 3) % 9 === 0 });
    }
  }
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${cols * step} ${rows * step}`} preserveAspectRatio="xMidYMid slice">
      {dots.map((d, i) => (
        <Circle
          key={i}
          cx={step / 2 + d.x * step}
          cy={step / 2 + d.y * step}
          r={d.accent ? 2.4 : 1.25}
          fill={d.accent ? Brand.turquoise : t.ink}
          opacity={d.accent ? 0.5 : 0.14}
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
      {/* Base canvas always on: the web dot-grid. Accents layer above it. */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <DotField />
      </View>
      {(variant === 'blobs' || variant === 'full') && <Blobs reduce={reduce} />}
      {(variant === 'rings' || variant === 'full') && <Rings reduce={reduce} />}
    </View>
  );
}
