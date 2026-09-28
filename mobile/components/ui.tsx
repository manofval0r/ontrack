/** Tactile primitives — 2px navy borders + solid offset shadows (no gradients). */
import React from 'react';
import {
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Brand, Colors } from '../constants/colors';
import { Radii, Spacing, Touch } from '../constants/spacing';
import { Typography } from '../constants/typography';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      accessible
      style={[
        {
          backgroundColor: Colors.light.surface,
          borderWidth: 2,
          borderColor: Brand.navy,
          borderRadius: Radii.card,
          padding: Spacing.lg,
          shadowColor: Brand.navy,
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
  accessibilityLabel,
  accessibilityHint,
}: {
  title: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
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
          borderColor: Brand.navy,
          backgroundColor: primary ? Brand.navy : Brand.white,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          shadowColor: Brand.navy,
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
          color: primary ? Brand.white : Brand.navy,
        }}
      >
        {title}
      </Text>
    </Pressable>
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
