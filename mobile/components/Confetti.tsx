/** Confetti burst — lightweight celebration (transform/opacity only). */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Brand } from '../constants/colors';
import { useReduceMotion } from '../lib/useReduceMotion';

const PIECES = 18;
const COLORS = [Brand.turquoise, Brand.teal, Brand.aqua, Brand.amberDot, Brand.navy];

export function ConfettiBurst({ onDone }: { onDone?: () => void }) {
  const reduce = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduce) {
      onDone?.();
      return;
    }
    progress.value = withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) });
    const t = setTimeout(() => onDone?.(), 1500);
    return () => {
      cancelAnimation(progress);
      clearTimeout(t);
    };
  }, [reduce, progress, onDone]);

  if (reduce) return null;

  return (
    <View pointerEvents="none" accessibilityElementsHidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220, alignItems: 'center', overflow: 'hidden' }}>
      {Array.from({ length: PIECES }).map((_, i) => (
        <Piece key={i} index={i} progress={progress} />
      ))}
    </View>
  );
}

function Piece({ index, progress }: { index: number; progress: any }) {
  const angle = (index / PIECES) * Math.PI * 2;
  const dist = 60 + ((index * 37) % 60);
  const dx = Math.cos(angle) * dist;
  const dy = Math.sin(angle) * dist * 0.7 + 40;
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: progress.value * dx },
      { translateY: progress.value * dy },
      { rotate: `${progress.value * (index % 2 ? 180 : -180)}deg` },
      { scale: 1 - progress.value * 0.5 },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 40,
          width: 8,
          height: index % 3 === 0 ? 12 : 8,
          borderRadius: 2,
          backgroundColor: COLORS[index % COLORS.length],
        },
        style,
      ]}
    />
  );
}
