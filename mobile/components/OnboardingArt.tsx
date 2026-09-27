/**
 * Onboarding art — three looping SVG scenes in brand tokens, favicon-inspired.
 * Built on react-native-svg + Reanimated (Expo Go safe; no Skia dev-build needed).
 * Loops are disabled when the OS requests reduced motion.
 */
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import { Brand } from '../constants/colors';
import { Radii } from '../constants/spacing';
import { useReduceMotion } from '../lib/useReduceMotion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const LOOP = { duration: 1600, easing: Easing.inOut(Easing.ease) };

/** Scene 1 — brand mark draws itself, then breathes. */
function MarkScene({ reduce }: { reduce: boolean }) {
  const draw = useSharedValue(0);
  const breathe = useSharedValue(1);

  useEffect(() => {
    if (reduce) {
      draw.value = 1;
      return;
    }
    draw.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) });
    breathe.value = withDelay(
      1200,
      withRepeat(withSequence(withTiming(1.04, LOOP), withTiming(1, LOOP)), -1, true)
    );
    return () => {
      cancelAnimation(draw);
      cancelAnimation(breathe);
    };
  }, [reduce, draw, breathe]);

  const topProps = useAnimatedProps(() => ({ strokeDashoffset: 300 * (1 - draw.value) }));
  const botProps = useAnimatedProps(() => ({ strokeDashoffset: 300 * (1 - draw.value) }));
  const wrapStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));

  return (
    <Animated.View style={wrapStyle}>
      <Svg width={200} height={160} viewBox="0 0 200 160">
        <Rect x={8} y={8} width={184} height={144} rx={28} fill={Brand.turquoise} stroke={Brand.navy} strokeWidth={4} />
        <AnimatedPath
          d="M45 62 C 80 62, 105 50, 140 30 M140 30 l-14 4 M140 30 l-2 14"
          fill="none"
          stroke={Brand.navy}
          strokeWidth={13}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={300}
          animatedProps={topProps}
        />
        <AnimatedPath
          d="M60 130 C 95 130, 120 118, 155 98 M155 98 l-14 4 M155 98 l-2 14"
          fill="none"
          stroke={Brand.navy}
          strokeWidth={13}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={300}
          animatedProps={botProps}
        />
      </Svg>
    </Animated.View>
  );
}

/** Scene 2 — tracker card fills + checklist ticks in sequence. */
function TrackerScene({ reduce }: { reduce: boolean }) {
  const fill = useSharedValue(0.2);
  const tick1 = useSharedValue(0);
  const tick2 = useSharedValue(0);
  const tick3 = useSharedValue(0);

  useEffect(() => {
    if (reduce) {
      fill.value = 0.85;
      tick1.value = 1;
      tick2.value = 1;
      return;
    }
    fill.value = withRepeat(withSequence(withTiming(0.85, { duration: 2200 }), withTiming(0.2, { duration: 900 })), -1, false);
    const seq = (sv: typeof tick1, at: number) => {
      sv.value = withRepeat(
        withSequence(withTiming(0, { duration: at }), withTiming(1, { duration: 250 }), withTiming(1, { duration: 2600 }), withTiming(0, { duration: 200 })),
        -1,
        false
      );
    };
    seq(tick1, 400);
    seq(tick2, 900);
    seq(tick3, 1400);
    return () => {
      cancelAnimation(fill);
      cancelAnimation(tick1);
      cancelAnimation(tick2);
      cancelAnimation(tick3);
    };
  }, [reduce, fill, tick1, tick2, tick3]);

  const barStyle = useAnimatedStyle(() => ({ width: `${Math.round(fill.value * 100)}%` }));
  const o1 = useAnimatedStyle(() => ({ opacity: tick1.value }));
  const o2 = useAnimatedStyle(() => ({ opacity: tick2.value }));
  const o3 = useAnimatedStyle(() => ({ opacity: tick3.value }));

  const Row = ({ label, style }: { label: string; style: any }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
      <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: Brand.navy, backgroundColor: Brand.turquoise, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.Text style={[{ color: Brand.navy, fontWeight: '700', fontSize: 13 }, style]}>✓</Animated.Text>
      </View>
      <Animated.Text style={[{ fontSize: 13, color: Brand.navy, fontWeight: '600' }, style]}>{label}</Animated.Text>
    </View>
  );

  return (
    <View style={{ width: 220, backgroundColor: '#fff', borderWidth: 2, borderColor: Brand.navy, borderRadius: Radii.card, padding: 16 }}>
      <View style={{ height: 12, borderRadius: 999, borderWidth: 2, borderColor: Brand.navy, backgroundColor: Brand.gray, overflow: 'hidden' }}>
        <Animated.View style={[{ height: '100%', backgroundColor: Brand.turquoise }, barStyle]} />
      </View>
      <Row label="Morning run" style={o1} />
      <Row label="Read 20 pages" style={o2} />
      <Row label="Ship the demo" style={o3} />
    </View>
  );
}

/** Scene 3 — coach + user bubbles trade messages. */
function ChatScene({ reduce }: { reduce: boolean }) {
  const ai = useSharedValue(0);
  const user = useSharedValue(0);

  useEffect(() => {
    if (reduce) {
      ai.value = 1;
      user.value = 1;
      return;
    }
    const cycle = (sv: typeof ai, at: number) => {
      sv.value = withRepeat(
        withSequence(withTiming(0, { duration: at }), withTiming(1, { duration: 400 }), withTiming(1, { duration: 2000 }), withTiming(0, { duration: 300 })),
        -1,
        false
      );
    };
    cycle(ai, 300);
    cycle(user, 1400);
    return () => {
      cancelAnimation(ai);
      cancelAnimation(user);
    };
  }, [reduce, ai, user]);

  const aiStyle = useAnimatedStyle(() => ({ opacity: ai.value, transform: [{ translateY: (1 - ai.value) * 10 }] }));
  const userStyle = useAnimatedStyle(() => ({ opacity: user.value, transform: [{ translateY: (1 - user.value) * 10 }] }));

  return (
    <View style={{ width: 240, gap: 10 }}>
      <Animated.View style={[{ alignSelf: 'flex-start', maxWidth: '90%', backgroundColor: '#fff', borderWidth: 2, borderColor: Brand.navy, borderRadius: 16, padding: 12 }, aiStyle]}>
        <Animated.Text style={{ fontSize: 13, color: Brand.navy }}>You're at 3 of 5. On pace for Friday?</Animated.Text>
      </Animated.View>
      <Animated.View style={[{ alignSelf: 'flex-end', maxWidth: '90%', backgroundColor: Brand.navy, borderWidth: 2, borderColor: Brand.navy, borderRadius: 16, padding: 12 }, userStyle]}>
        <Animated.Text style={{ fontSize: 13, color: '#fff', fontWeight: '600' }}>Closed one more — 4 of 5!</Animated.Text>
      </Animated.View>
      <View style={{ alignSelf: 'center', flexDirection: 'row', gap: 5 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Brand.teal, opacity: 0.6 }} />
        ))}
      </View>
    </View>
  );
}

export function OnboardingArt({ step }: { step: number }) {
  const reduce = useReduceMotion();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
      {step === 0 && <MarkScene reduce={reduce} />}
      {step === 1 && <TrackerScene reduce={reduce} />}
      {step === 2 && <ChatScene reduce={reduce} />}
    </View>
  );
}
