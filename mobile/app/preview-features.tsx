/** Preview features — a concept reel of where OnTrack is headed.
 * Static mocks, no backend: sharing, GitHub worktree, Notion, fitness,
 * and app blocking. Horizontal snap carousel with dots; each card is one
 * bold hero moment (bolder skill: one memorable thing per card). */
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Brand } from '../constants/colors';
import { useTheme } from '../lib/theme';
import { Radii, Spacing, Touch } from '../constants/spacing';
import { FontFamily } from '../constants/typography';
import { useReduceMotion } from '../lib/useReduceMotion';

interface Concept {
  key: string;
  kicker: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  tile: string;
  points: string[];
  cta: string;
}

const CONCEPTS: Concept[] = [
  {
    key: 'sharing',
    kicker: 'ENCOURAGEMENT LOOP',
    title: 'Share goals, get backup',
    body: 'Send a goal to a friend. They see progress, not your data — and their nudge lands the next morning.',
    icon: 'people',
    tile: Brand.turquoise,
    points: ['Progress-only link', 'Cheer + nudge buttons', 'Revoke anytime'],
    cta: 'Concept — voting opens soon',
  },
  {
    key: 'github',
    kicker: 'PROOF, NOT PROMISES',
    title: 'GitHub at work',
    body: 'Your contribution worktree feeds the tracker: commits verify checklist items instead of you typing them.',
    icon: 'logo-github',
    tile: Brand.navy,
    points: ['Commit → check mapping', 'Week strip from pushes', 'Streak survives honest weeks'],
    cta: 'Live today for checklist goals',
  },
  {
    key: 'notion',
    kicker: 'WHERE PLANS LIVE',
    title: 'Notion integration',
    body: 'Two-way sync with a tasks database: check it in Notion, watch the ring close here.',
    icon: 'document-text',
    tile: '#006D6A',
    points: ['Link a database', 'Status sync both ways', 'Deadline alarms stay here'],
    cta: 'Concept — web connects first',
  },
  {
    key: 'fitness',
    kicker: 'BODY DATA',
    title: 'Fitness apps plug in',
    body: 'Runs, sets, and steps flow in automatically. You keep the streak; the app does the counting.',
    icon: 'fitness',
    tile: '#B45309',
    points: ['Runs + workouts import', 'Auto-log towards target', 'Rest days stay rest days'],
    cta: 'Concept — Health Connect next',
  },
  {
    key: 'blocking',
    kicker: 'FOCUS WITH TEETH',
    title: 'Block favorite apps',
    body: 'Start a work-block and the apps you pick go quiet until the timer ends. Escapable, never punishing.',
    icon: 'shield-checkmark',
    tile: '#7C3AED',
    points: ['Pick apps per block', 'Gentle gate, easy exit', 'Timers work today'],
    cta: 'Android limits next build',
  },
];

export default function PreviewFeatures() {
  const t = useTheme();
  const reduce = useReduceMotion();
  const { width } = useWindowDimensions();
  const CARD_W = width - Spacing.lg * 2;
  const [page, setPage] = useState(0);
  const listRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingTop: 4 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44, paddingHorizontal: 8 }}
        >
          <Ionicons name="chevron-back" size={20} color={t.ink} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: t.ink }}>Back</Text>
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: t.teal, letterSpacing: 1.4 }}>PREVIEW REEL</Text>
        <Text accessibilityRole="header" style={{ fontFamily: FontFamily.expressive, fontSize: 36, color: t.ink, marginTop: 2 }}>
          Coming to OnTrack
        </Text>
        <Text style={{ fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
          Concepts under test — swipe through what is on the bench. {page + 1} of {CONCEPTS.length}
        </Text>
      </View>
      <ScrollView
        ref={listRef}
        horizontal
        pagingEnabled
        snapToInterval={CARD_W + 12}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: 12, paddingBottom: 12 }}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 12));
          setPage(Math.max(0, Math.min(CONCEPTS.length - 1, i)));
        }}
      >
        {CONCEPTS.map((c, i) => (
          <Animated.View
            key={c.key}
            entering={reduce ? undefined : FadeInUp.duration(280).delay(Math.min(i, 4) * 60)}
            style={{ width: CARD_W }}
          >
            <View
              style={{
                backgroundColor: t.surface,
                borderWidth: 2,
                borderColor: t.border,
                borderRadius: Radii.card,
                overflow: 'hidden',
                shadowColor: t.shadow,
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 4,
              }}
            >
              <View style={{ backgroundColor: c.tile, padding: Spacing.lg, minHeight: 190, justifyContent: 'flex-end' }}>
                <View
                  accessibilityElementsHidden
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: Brand.white,
                    borderWidth: 2,
                    borderColor: Brand.navy,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name={c.icon} size={26} color={Brand.navy} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.75)', letterSpacing: 1.4 }}>
                  {c.kicker}
                </Text>
                <Text style={{ fontFamily: FontFamily.expressive, fontSize: 32, lineHeight: 36, color: Brand.white, marginTop: 4 }}>
                  {c.title}
                </Text>
              </View>
              <View style={{ padding: Spacing.lg, gap: 8 }}>
                <Text style={{ fontSize: 15, lineHeight: 22, color: t.ink }}>{c.body}</Text>
                {c.points.map((p) => (
                  <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="checkmark-circle" size={18} color={t.teal} accessibilityElementsHidden />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: t.ink }}>{p}</Text>
                  </View>
                ))}
                <View style={{ marginTop: 6, borderWidth: 2, borderColor: t.border, borderRadius: Radii.pill, backgroundColor: t.surface2, minHeight: Touch.min, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: t.inkSoft }}>{c.cta}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 8 }}>
        {CONCEPTS.map((c, i) => (
          <Pressable
            key={c.key}
            onPress={() => {
              setPage(i);
              listRef.current?.scrollTo({ x: i * (CARD_W + 12), animated: !reduce });
            }}
            accessibilityLabel={`Go to ${c.title}`}
            accessibilityRole="button"
            hitSlop={8}
            style={{
              width: i === page ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === page ? Brand.turquoise : t.inputTrack,
              borderWidth: i === page ? 1 : 0,
              borderColor: t.border,
            }}
          />
        ))}
      </View>
      <Text style={{ textAlign: 'center', fontSize: 11, color: t.inkSoft, paddingBottom: 16 }}>
        Mocks only — nothing here writes data or connects accounts.
      </Text>
    </SafeAreaView>
  );
}
