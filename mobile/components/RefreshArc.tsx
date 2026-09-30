/** RefreshArc — the pull-to-refresh status mark. An incomplete chunky ring
 * spins while syncing, then snaps into a drawn tick on success. Tactile tile
 * (2px navy, hard offset shadow) keeps the grotesque-3D brand feel.
 * Parents drive `state`; the gesture itself stays the native RefreshControl.
 * (Deliberately Reanimated + SVG: a three.js GL context for a 44px indicator
 * would cost ~1MB + a native surface for zero visual gain.) */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  createAnimatedComponent,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { Brand } from '../constants/colors';
import { useTheme } from '../lib/theme';
import { useReduceMotion } from '../lib/useReduceMotion';

const AnimatedPath = createAnimatedComponent(Path);
const AnimatedRing = createAnimatedComponent(Circle);
const SIZE = 44;
const R = 15;
const C = 2 * Math.PI * R;

export type RefreshState = 'idle' | 'pull' | 'loading' | 'done';

function PullArc({ progress }: { progress: SharedValue<number> }) {
  const t = useTheme();
  const props = useAnimatedProps(() => ({
    strokeDashoffset: C * (1 - Math.min(1, Math.max(0, progress.value))),
  }));
  // Second visual channel: the ring rotates and grows with the pull, so
  // progress reads even at a glance (and if dash rendering ever stalls).
  const motionStyle = useAnimatedStyle(() => {
    const p = Math.min(1, Math.max(0, progress.value));
    return { transform: [{ rotate: `${p * 180}deg` }, { scale: 0.8 + p * 0.2 }] };
  });
  return (
    <Animated.View style={motionStyle}>
    <Svg width={30} height={30} viewBox="0 0 36 36">
      <Circle cx={18} cy={18} r={R} fill="none" stroke={t.ink} strokeOpacity={0.15} strokeWidth={4.5} />
      <AnimatedRing
        cx={18}
        cy={18}
        r={R}
        fill="none"
        stroke={Brand.turquoise}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeDasharray={`${C} ${C}`}
        animatedProps={props}
        transform="rotate(-90 18 18)"
      />
    </Svg>
    </Animated.View>
  );
}

export function RefreshArc({ state, progress = 0, arcProgress, label }: { state: RefreshState; progress?: number; arcProgress?: SharedValue<number>; label?: string }) {
  const t = useTheme();
  const reduce = useReduceMotion();
  const spin = useSharedValue(0);
  const draw = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    if (state === 'loading' && !reduce) {
      spin.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(spin);
      spin.value = 0;
    }
    if (state === 'done') {
      draw.value = 0;
      draw.value = withTiming(1, { duration: 350 });
      pop.value = withSequence(withSpring(1.25, { damping: 8 }), withSpring(1, { damping: 10 }));
    } else {
      draw.value = 0;
      pop.value = 1;
    }
    return () => {
      cancelAnimation(spin);
    };
  }, [state, reduce, spin, draw, pop]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const tickProps = useAnimatedProps(() => ({ strokeDashoffset: 40 * (1 - draw.value) }));

  return (
    <View
      accessibilityLabel={label ?? `Sync status: ${state}`}
      accessibilityRole="progressbar"
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        backgroundColor: state === 'done' ? Brand.turquoise : t.surface,
        borderWidth: 2,
        borderColor: t.border,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: t.shadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
      }}
    >
      <Animated.View style={popStyle}>
        {state === 'done' ? (
          <Svg width={26} height={26} viewBox="0 0 26 26">
            <AnimatedPath
              d="M6 13.5 L11.5 19 L20 8"
              fill="none"
              stroke={Brand.navy}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={40}
              animatedProps={tickProps}
            />
          </Svg>
        ) : state === 'pull' ? (
          arcProgress ? (
            <PullArc progress={arcProgress} />
          ) : (
          <Svg width={30} height={30} viewBox="0 0 36 36">
            <Circle cx={18} cy={18} r={R} fill="none" stroke={t.ink} strokeOpacity={0.15} strokeWidth={4.5} />
            <Circle
              cx={18}
              cy={18}
              r={R}
              fill="none"
              stroke={Brand.turquoise}
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeDasharray={`${Math.max(0.02, Math.min(1, progress)) * C} ${C}`}
              transform="rotate(-90 18 18)"
            />
          </Svg>
          )
        ) : state === 'loading' ? (
          <Animated.View style={spinStyle}>
            <Svg width={30} height={30} viewBox="0 0 36 36">
              <Circle cx={18} cy={18} r={R} fill="none" stroke={t.ink} strokeOpacity={0.15} strokeWidth={4.5} />
              <Circle
                cx={18}
                cy={18}
                r={R}
                fill="none"
                stroke={Brand.turquoise}
                strokeWidth={4.5}
                strokeLinecap="round"
                strokeDasharray={`${C * 0.72} ${C}`}
                transform="rotate(-90 18 18)"
              />
            </Svg>
          </Animated.View>
        ) : (
          <Svg width={30} height={30} viewBox="0 0 36 36">
            <Circle cx={18} cy={18} r={R} fill="none" stroke={t.ink} strokeOpacity={0.25} strokeWidth={4.5} />
            <Path d="M18 10 v8 l5 3" fill="none" stroke={t.teal} strokeWidth={3} strokeLinecap="round" />
          </Svg>
        )}
      </Animated.View>
    </View>
  );
}
