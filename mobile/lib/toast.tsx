/** In-app toasts — top-anchored, tactile, queued, auto-dismissing.
 * goey-toast-inspired API (show/success/error/info, actions, maxQueue
 * drop-oldest) rebuilt with Reanimated for native. X button top-right plus
 * tap-to-dismiss plus timer. No DOM-isms, fixed Brand palette. */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
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

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const show = useCallback(
    (opts: ToastOptions) => {
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
      setItems((prev) => [...prev.slice(-(MAX_QUEUE - 1)), item]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), item.duration)
      );
      return id;
    },
    [dismiss]
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
          <Animated.View
            key={item.id}
            entering={reduce ? FadeInDown.duration(80) : FadeInDown.duration(280).springify().damping(18)}
            exiting={FadeOutUp.duration(180)}
            layout={LinearTransition.duration(200)}
          >
            <Pressable
              onPress={() => dismiss(item.id)}
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
                    onPress={() => {
                      item.action!.onPress();
                      dismiss(item.id);
                    }}
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
                  onPress={() => dismiss(item.id)}
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
        ))}
      </View>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  return useContext(Ctx);
}
