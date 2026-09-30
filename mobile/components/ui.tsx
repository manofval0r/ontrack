/** Tactile primitives — 2px navy borders + solid offset shadows (no gradients).
 * Mirrors the web pill system: 3px resting shadow, press sinks 2px to a 1px
 * shadow, cards carry 4px. */
import React, { useEffect } from 'react';
import {
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  createAnimatedComponent,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Brand, Colors } from '../constants/colors';
import { useTheme } from '../lib/theme';
import { Radii, Spacing, Touch } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { useReduceMotion } from '../lib/useReduceMotion';
import { GitHubMark, GoogleG } from './ProviderIcons';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View
      accessible
      style={[
        {
          backgroundColor: t.surface,
          borderWidth: 2,
          borderColor: t.border,
          borderRadius: Radii.card,
          padding: Spacing.lg,
          shadowColor: t.shadow,
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function PillButton({
  title,
  onPress,
  primary,
  disabled,
  icon,
  accessibilityLabel,
  accessibilityHint,
}: {
  title: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  /** Optional glyph rendered inside the web-style bubble. */
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        {
          minHeight: Touch.min,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: Radii.pill,
          borderWidth: 2,
          borderColor: t.border,
          backgroundColor: primary ? t.primary : t.surface,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 10,
          opacity: disabled ? 0.4 : 1,
          // Web press physics: sink 2px into a 1px shadow.
          transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : [],
          shadowColor: t.shadow,
          shadowOffset: { width: pressed ? 1 : 3, height: pressed ? 1 : 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: pressed ? 1 : 3,
        },
      ]}
    >
      <Text
        style={{
          fontSize: Typography.button.fontSize,
          fontWeight: '600',
          color: primary ? t.primaryInk : t.ink,
        }}
      >
        {title}
      </Text>
      {icon && (
        <View
          accessibilityElementsHidden
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: primary ? Brand.white : Brand.navy,
            backgroundColor: primary ? Brand.white : Brand.turquoise,
          }}
        >
          {icon}
        </View>
      )}
    </Pressable>
  );
}

/** Social sign-in button — true brand mark + label + tactile press physics. */
export function SocialButton({
  provider,
  label,
  onPress,
  dark,
  disabled,
}: {
  provider: 'google' | 'github';
  label: string;
  onPress: () => void;
  dark?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          minHeight: Touch.min,
          paddingVertical: 12,
          backgroundColor: dark ? Brand.navy : Brand.white,
          borderWidth: 2,
          borderColor: Brand.navy,
          borderRadius: Radii.pill,
          opacity: disabled ? 0.5 : 1,
          transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : [],
          shadowColor: Brand.navy,
          shadowOffset: { width: pressed ? 1 : 3, height: pressed ? 1 : 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: pressed ? 1 : 3,
        },
      ]}
    >
      {provider === 'google' ? (
        <GoogleG size={20} />
      ) : (
        <GitHubMark size={20} color={dark ? Brand.white : Brand.navy} />
      )}
      <Text style={{ fontWeight: '700', fontSize: 15, color: dark ? Brand.white : Brand.navy }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** The OnTrack arrow mark, drawing itself in a tactile tile. Shared by signup,
 * login, and anywhere the brand signs its work. */
export function BrandMark({ size = 72 }: { size?: number }) {
  const reduce = useReduceMotion();
  const draw = useSharedValue(0);
  useEffect(() => {
    if (reduce) {
      draw.value = 1;
      return;
    }
    draw.value = withRepeat(withSequence(withTiming(1, { duration: 1400 }), withTiming(1, { duration: 1800 }), withTiming(0, { duration: 1 })), -1, false);
    return () => cancelAnimation(draw);
  }, [reduce, draw]);
  const props = useAnimatedProps(() => ({
    strokeDashoffset: 220 * (1 - draw.value),
  }));
  const AnimatedPath = createAnimatedComponent(Path);
  const tile = size;
  const glyph = Math.round(size * 0.64);
  return (
    <View
      accessibilityElementsHidden
      style={{
        width: tile,
        height: tile,
        borderRadius: Math.round(tile * 0.28),
        backgroundColor: Brand.turquoise,
        borderWidth: 2,
        borderColor: Brand.navy,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Brand.navy,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
      }}
    >
      <Svg width={glyph} height={glyph} viewBox="0 0 100 100">
        <AnimatedPath
          d="M22 62 C 40 62, 55 52, 78 32 M78 32 l-11 3 M78 32 l-1 11"
          fill="none"
          stroke={Brand.navy}
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={220}
          animatedProps={props}
        />
      </Svg>
    </View>
  );
}

const STATUS_LABEL: Record<string, string> = {
  active: 'On track',
  completed: 'Done',
  missed: 'Behind',
  behind: 'Behind',
};

export function StatusPill({ status }: { status: string }) {
  const behind = status === 'missed' || status === 'behind';
  const label = STATUS_LABEL[status] ?? status;
  return (
    <View
      accessibilityLabel={`Status: ${label}`}
      accessibilityRole="text"
      style={{
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: Radii.pill,
        borderWidth: 2,
        borderColor: behind ? Brand.amberBorder : Brand.turquoise,
        backgroundColor: behind ? Brand.amberBg : Brand.cyanBg,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: behind ? Brand.amberText : Brand.teal,
          textTransform: 'capitalize',
        } as TextStyle}
      >
        {label}
      </Text>
    </View>
  );
}
