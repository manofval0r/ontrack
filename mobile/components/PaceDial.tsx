/** PaceDial — one honest dial for every goal family.
 * The ring is what you've shipped (animated fill); the needle dot is where
 * you *should* be given elapsed time vs deadline. Gap between them is the
 * whole story: ahead, on pace, or behind. No fabricated streaks, no noise.
 * Center content composes via children (count, icon, verdict). */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  createAnimatedComponent,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Brand } from '../constants/colors';
import { useTheme } from '../lib/theme';
import { useReduceMotion } from '../lib/useReduceMotion';

const AnimatedRing = createAnimatedComponent(Circle);

export function PaceDial({
  pct,
  expected,
  size = 96,
  children,
  label,
}: {
  /** 0..100 shipped. */
  pct: number;
  /** 0..1 expected by now, or null when no deadline. */
  expected: number | null;
  size?: number;
  children?: React.ReactNode;
  label?: string;
}) {
  const t = useTheme();
  const reduce = useReduceMotion();
  const r = (size - 16) / 2;
  const c = size / 2;
  const C = 2 * Math.PI * r;
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = reduce ? pct : withTiming(pct, { duration: 700 });
    return () => cancelAnimation(fill);
  }, [pct, reduce, fill]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: C * (1 - Math.min(100, Math.max(0, fill.value)) / 100),
  }));

  // Needle angle: -90° (top) + expected fraction of the full circle.
  const needleAngle = expected == null ? null : (-90 + Math.min(1, Math.max(0, expected)) * 360) * (Math.PI / 180);
  const nx = needleAngle == null ? 0 : c + (r - 1) * Math.cos(needleAngle);
  const ny = needleAngle == null ? 0 : c + (r - 1) * Math.sin(needleAngle);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? `Progress ${Math.round(pct)} percent`}
      accessibilityValue={{ now: Math.round(pct), min: 0, max: 100 }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={c} cy={c} r={r} fill="none" stroke={t.inputTrack} strokeWidth={9} />
        <AnimatedRing
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={Brand.turquoise}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={`${C} ${C}`}
          animatedProps={arcProps}
          transform={`rotate(-90 ${c} ${c})`}
        />
        {needleAngle != null && (
          <>
            <Circle cx={nx} cy={ny} r={7} fill={Brand.navy} />
            <Circle cx={nx} cy={ny} r={3.5} fill={Brand.white} />
          </>
        )}
      </Svg>
      <View
        accessibilityElementsHidden
        style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}
      >
        {children}
      </View>
    </View>
  );
}
