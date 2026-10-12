/** Weekly review (M2) — the Friday ritual.
 *
 *  A board with no review is just a list. Once a week the app surfaces what
 *  actually closed, what it scored, and what is still queued behind the WIP
 *  limit, so the next week starts with a decision instead of drift.
 *
 *  Everything shown is derived from real goal data — no invented numbers.
 *  Dismissal is stored per ISO week so the card comes back next Friday.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { Radii, Spacing, Touch } from '../constants/spacing';
import { FontFamily } from '../constants/typography';
import { useReduceMotion } from '../lib/useReduceMotion';

const DISMISS_KEY = 'ontrack_weekly_review_dismissed_v1';
/** Friday (5) through Sunday — the window where the ritual is offered. */
const REVIEW_DAYS = [5, 6, 0];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function weekKey(d = new Date()): string {
  // ISO-ish week stamp: year + day-of-year bucket, enough to change weekly.
  const start = new Date(d.getFullYear(), 0, 1);
  const day = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return `${d.getFullYear()}-W${Math.floor(day / 7)}`;
}

export function isReviewWindow(d = new Date()): boolean {
  return REVIEW_DAYS.includes(d.getDay());
}

interface Props {
  goals: any[];
  onReview: () => void;
}

export function WeeklyReview({ goals, onReview }: Props) {
  const t = useTheme();
  const reduceMotion = useReduceMotion();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const key = useMemo(() => weekKey(), []);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(DISMISS_KEY)
      .then((v) => {
        if (alive) setDismissed(v);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Goals closed inside the last 7 days, newest first.
  const closed = useMemo(() => {
    const cutoff = Date.now() - WEEK_MS;
    return goals
      .filter((g) => {
        if (g.status === 'active') return false;
        const t0 = Date.parse(String(g.finished_at ?? ''));
        return Number.isFinite(t0) ? t0 >= cutoff : false;
      })
      .sort((a, b) => Date.parse(String(b.finished_at)) - Date.parse(String(a.finished_at)));
  }, [goals]);

  const missed = closed.filter((g) => g.status === 'missed' || g.verdict_passed === false);
  const scored = closed.filter((g) => typeof g.verdict_score === 'number');
  const average = scored.length
    ? Math.round(scored.reduce((sum, g) => sum + Number(g.verdict_score), 0) / scored.length)
    : null;

  const visible = isReviewWindow() && dismissed !== key && (closed.length > 0 || goals.length > 0);

  const dismiss = useCallback(() => {
    setDismissed(key);
    AsyncStorage.setItem(DISMISS_KEY, key).catch(() => {});
  }, [key]);

  if (!visible) return null;

  const headline =
    closed.length === 0
      ? 'Nothing closed this week.'
      : missed.length === 0
        ? 'You kept every commitment this week.'
        : `${missed.length} commitment${missed.length === 1 ? '' : 's'} slipped.`;

  return (
    <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(320)}>
      <View
        accessibilityRole="summary"
        accessibilityLabel={`Weekly review. ${headline} ${closed.length} goals closed${average !== null ? `, average score ${average} out of 100` : ''}.`}
        style={{
          backgroundColor: t.surface,
          borderWidth: 2,
          borderColor: t.border,
          borderRadius: Radii.card,
          padding: Spacing.lg,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="calendar-outline" size={18} color={t.teal} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal, letterSpacing: 0.6 }}>
            WEEKLY REVIEW
          </Text>
        </View>

        <Text style={{ fontFamily: FontFamily.expressive, fontSize: 22, color: t.ink }}>
          {headline}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
          <Stat label="Closed" value={String(closed.length)} />
          <Stat label="Slipped" value={String(missed.length)} tone={missed.length ? '#DC2626' : undefined} />
          <Stat label="Avg score" value={average === null ? '—' : `${average}`} />
        </View>

        {closed.slice(0, 3).map((g) => (
          <View key={String(g.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons
              name={g.verdict_passed === false || g.status === 'missed' ? 'close-circle' : 'checkmark-circle'}
              size={15}
              color={g.verdict_passed === false || g.status === 'missed' ? '#DC2626' : t.teal}
            />
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, color: t.ink }}>
              {String(g.title)}
            </Text>
            {typeof g.verdict_score === 'number' && (
              <Text style={{ fontSize: 12, fontWeight: '700', color: t.inkSoft }}>{g.verdict_score}/100</Text>
            )}
          </View>
        ))}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
          <Pressable
            onPress={onReview}
            accessibilityRole="button"
            accessibilityLabel="Open the goals board to pull the next item into active"
            style={{
              flex: 1,
              backgroundColor: t.primary,
              borderRadius: Radii.pill,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: Touch.min,
            }}
          >
            <Text style={{ color: t.primaryInk, fontWeight: '700' }}>Review the board</Text>
          </Pressable>
          <Pressable
            onPress={dismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss this week's review"
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              justifyContent: 'center',
              minHeight: Touch.min,
            }}
          >
            <Text style={{ color: t.inkSoft, fontWeight: '700' }}>Later</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  const t = useTheme();
  return (
    <View accessibilityLabel={`${label}: ${value}`}>
      <Text style={{ fontFamily: FontFamily.expressive, fontSize: 22, color: tone ?? t.ink }}>{value}</Text>
      <Text style={{ fontSize: 11, color: t.inkSoft }}>{label}</Text>
    </View>
  );
}
