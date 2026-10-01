/** In-app toasts — top-anchored, tactile, queued, auto-dismissing.
 * goey-toast-inspired API (show/success/error/info, actions, maxQueue
 * drop-oldest) rebuilt with Reanimated for native. X button top-right plus
 * tap-to-dismiss plus timer. No DOM-isms, fixed Brand palette.
 * Dedupe: repeating the same event while its toast is visible shakes the
 * visible one (and restarts its timer) instead of stacking a twin. Distinct
 * events stack up to MAX_QUEUE. */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Brand } from '../constants/colors';
import { useTheme } from './theme';
import { Radii } from '../constants/spacing';
import { useReduceMotion } from './useReduceMotion';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastOptions {
  type?: ToastType;
  title: string;
  message?: string;
  /** Auto-dismiss ms. Default 3500. */
  duration?: number;
  action?: ToastAction;
}

interface ToastItem extends Required<Pick<ToastOptions, 'type' | 'title'>> {
  id: number;
  message: string;
  duration: number;
  action?: ToastAction;
}

interface ToastCtx {
  show: (opts: ToastOptions) => number;
}

const Ctx = createContext<ToastCtx>({ show: () => 0 });
const MAX_QUEUE = 3;

const ACCENT: Record<ToastType, string> = {
  success: Brand.turquoise,
  error: '#DC2626',
  info: Brand.navy,
};

function sameEvent(a: ToastItem, b: ToastOptions): boolean {
  return (
    a.type === (b.type ?? 'info') &&
    a.title === b.title &&
    a.message === (b.message ?? '') &&
    (a.action?.label ?? '') === (b.action?.label ?? '')
  );
}

function ToastCard({
  item,
  shakeTick,
  onAction,
  onDismiss,
}: {
  item: ToastItem;
  shakeTick: number;
  onAction: () => void;
  onDismiss: () => void;
}) {
  const t = useTheme();
  const reduce = useReduceMotion();
  const shake = useSharedValue(0);

  useEffect(() => {
    if (shakeTick > 0 && !reduce) {
      shake.value = withSequence(
        withTiming(-7, { duration: 55 }),
        withTiming(6, { duration: 55 }),
        withTiming(-4, { duration: 55 }),
        withTiming(0, { duration: 55 })
      );
    }
  }, [shakeTick, reduce, shake]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <Animated.View
      entering={reduce ? FadeInDown.duration(80) : FadeInDown.duration(280).springify().damping(18)}
      exiting={FadeOutUp.duration(180)}
      layout={LinearTransition.duration(200)}
      style={shakeStyle}
    >
      <Pressable
        onPress={onDismiss}
        accessibilityLabel={`${item.type}: ${item.title}${item.message ? `. ${item.message}` : ''}. Tap to dismiss.`}
        accessibilityRole="alert"
        style={{
          backgroundColor: t.surface,
          borderWidth: 2,
          borderColor: t.border,
          borderLeftWidth: 8,
          borderLeftColor: ACCENT[item.type],
          borderRadius: Radii.input,
          paddingVertical: 10,
          paddingHorizontal: 12,
          shadowColor: t.shadow,
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: t.ink, fontSize: 14 }}>{item.title}</Text>
            {!!item.message && (
              <Text style={{ color: t.inkSoft, fontSize: 12, marginTop: 2 }} numberOfLines={2}>
                {item.message}
              </Text>
            )}
          </View>
          {item.action && (
            <Pressable
              onPress={onAction}
              accessibilityLabel={item.action.label}
              accessibilityRole="button"
              hitSlop={8}
              style={{
                paddingHorizontal: 12,
                minHeight: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: Brand.navy,
                borderRadius: Radii.pill,
                backgroundColor: Brand.turquoise,
              }}
            >
              <Text style={{ fontWeight: '700', color: Brand.navy, fontSize: 13 }}>{item.action.label}</Text>
            </Pressable>
          )}
          <Pressable
            onPress={onDismiss}
            accessibilityLabel={`Dismiss: ${item.title}`}
            accessibilityRole="button"
            hitSlop={10}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: t.border,
              backgroundColor: t.surface2,
            }}
          >
            <Ionicons name="close" size={16} color={t.ink} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [shakes, setShakes] = useState<Record<number, number>>({});
  const idRef = useRef(1);
  const itemsRef = useRef<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const insets = useSafeAreaInsets();

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
    itemsRef.current = itemsRef.current.filter((i) => i.id !== id);
    setItems(itemsRef.current);
    setShakes((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const restartTimer = useCallback(
    (id: number, duration: number) => {
      const old = timers.current.get(id);
      if (old) clearTimeout(old);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration)
      );
    },
    [dismiss]
  );

  const show = useCallback(
    (opts: ToastOptions) => {
      const dup = itemsRef.current.find((i) => sameEvent(i, opts));
      if (dup) {
        restartTimer(dup.id, opts.duration ?? 3500);
        setShakes((prev) => ({ ...prev, [dup.id]: (prev[dup.id] ?? 0) + 1 }));
        Haptics.selectionAsync().catch(() => {});
        return dup.id;
      }
      const id = idRef.current++;
      const item: ToastItem = {
        id,
        type: opts.type ?? 'info',
        title: opts.title,
        message: opts.message ?? '',
        duration: opts.duration ?? 3500,
        action: opts.action,
      };
      Haptics.selectionAsync().catch(() => {});
      itemsRef.current = [...itemsRef.current.slice(-(MAX_QUEUE - 1)), item];
      setItems(itemsRef.current);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), item.duration)
      );
      return id;
    },
    [dismiss, restartTimer]
  );

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          top: Math.max(insets.top, 12),
          gap: 8,
        }}
      >
        {items.map((item) => (
          <ToastCard
            key={item.id}
            item={item}
            shakeTick={shakes[item.id] ?? 0}
            onDismiss={() => dismiss(item.id)}
            onAction={() => {
              item.action!.onPress();
              dismiss(item.id);
            }}
          />
        ))}
      </View>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  return useContext(Ctx);
}
