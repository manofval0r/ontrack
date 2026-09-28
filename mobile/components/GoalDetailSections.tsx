/** Goal detail sections — GitHub-style header, generic header, activity log. */
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '../constants/colors';
import { Radii, Spacing } from '../constants/spacing';
import { FontFamily, Typography } from '../constants/typography';
import { Card, StatusPill } from './ui';
import type { TemplateMeta } from '../lib/templates';

export function StatTile({ value, label, dark }: { value: string; label: string; dark?: boolean }) {
  const count = Number.parseInt(value, 10);
  const visible = Number.isNaN(count) || !/day streak/.test(label)
    ? label
    : count === 1 ? 'day streak' : 'days streak';
  return (
    <View
      accessibilityLabel={`${value} ${label}`}
      style={{
        flex: 1,
        backgroundColor: dark ? Brand.cardOnNavy : Brand.grayCanvas,
        borderWidth: dark ? 0 : 2,
        borderColor: Brand.navy,
        borderRadius: Radii.input,
        paddingVertical: 10,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: FontFamily.expressive, fontSize: 22, color: dark ? Brand.white : Brand.navy }}>{value}</Text>
      <Text style={{ fontSize: 11, fontWeight: '600', color: dark ? Brand.turquoise : Brand.teal, marginTop: 2 }}>{visible}</Text>
    </View>
  );
}

export function GithubHeader({
  goal,
  prog,
  ctx,
  left,
  strip,
  stripColor,
  github,
}: {
  goal: any;
  prog: { pct: number };
  ctx: any;
  left: string | null;
  strip: number[];
  stripColor: (n: number) => string;
  github: any | null;
}) {
  const total = strip.reduce((a, b) => a + b, 0);
  return (
    <View style={{ backgroundColor: Brand.navy, borderWidth: 2, borderColor: Brand.navy, borderRadius: Radii.card, padding: Spacing.lg, gap: Spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Brand.turquoise, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="logo-github" size={26} color={Brand.navy} accessibilityElementsHidden />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: Typography.cardHeading.fontSize, fontWeight: '700', color: Brand.white }} numberOfLines={2}>
            {goal.title}
          </Text>
          <Text style={{ fontSize: Typography.caption.fontSize, color: Brand.turquoise, fontWeight: '600', marginTop: 2 }}>
            {github?.connected ? `${github.repo ?? 'ontrack'} · ${github.branch ?? 'main'}` : 'GitHub not connected'}
            {left ? ` · ${left}` : ''}
          </Text>
        </View>
        <StatusPill status={goal.status} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <StatTile dark value={String(ctx.streak_days ?? 0)} label={ctx.streak_days === 1 ? 'day streak' : 'day streak'} />
        <StatTile dark value={String(ctx.commits_this_week ?? 0)} label="logs this week" />
        <StatTile dark value={`${prog.pct}%`} label="shipped" />
      </View>
      <View
        accessibilityLabel={`${total} logs in the last 7 days`}
        accessibilityRole="progressbar"
        accessibilityValue={{ now: Math.min(7, total), min: 0, max: 7 }}
      >
        <Text style={{ fontSize: 11, fontWeight: '700', color: Brand.faintOnNavy, marginBottom: 6 }}>
          ACTIVITY · LAST 7 DAYS
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }} accessibilityElementsHidden>
          {strip.map((n, i) => (
            <View key={i} style={{ flex: 1, height: 26, borderRadius: 6, backgroundColor: stripColor(n), borderWidth: 1, borderColor: Brand.hairOnNavy }} />
          ))}
        </View>
      </View>
    </View>
  );
}

export function GoalHeaderCard({
  goal,
  prog,
  meta,
  ctx,
  left,
}: {
  goal: any;
  prog: { current: number; target: number | null; pct: number };
  meta: TemplateMeta;
  ctx: any;
  left: string | null;
}) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Ionicons name={meta.icon} size={24} color={Brand.teal} accessibilityElementsHidden />
        <Text style={{ fontFamily: Typography.title.fontFamily, fontSize: 20, color: Brand.navy, flex: 1 }} numberOfLines={2}>
          {goal.title}
        </Text>
        <StatusPill status={goal.status} />
      </View>
      <Text style={{ marginTop: 6, fontSize: 13, fontWeight: '600', color: Brand.teal }}>
        {meta.label} · {meta.tagline}
      </Text>
      <Text style={{ marginTop: 4, color: Brand.navy, opacity: 0.7, fontSize: 13 }}>
        {prog.current} of {prog.target ?? 'unknown'} {meta.unit}
        {left ? ` · ${left}` : ''}
      </Text>
      <View style={{ marginTop: 10, flexDirection: 'row', gap: 8 }}>
        <StatTile value={String(ctx.streak_days ?? 0)} label="day streak" />
        <StatTile value={String(ctx.commits_this_week ?? 0)} label="logs this week" />
        <StatTile value={`${prog.pct}%`} label="shipped" />
      </View>
    </Card>
  );
}

export function ActivitySection({ logs, unit }: { logs: any[]; unit: string }) {
  if (logs.length === 0) return null;
  return (
    <Card>
      <Text style={{ fontWeight: '700', color: Brand.navy, marginBottom: 8 }}>Recent activity</Text>
      {logs.map((log: any, i: number) => (
        <View
          key={String(log.id)}
          accessibilityLabel={`Plus ${log.value} ${unit}${log.note ? `, ${log.note}` : ''}`}
          style={{
            flexDirection: 'row',
            gap: 10,
            paddingVertical: 6,
            borderTopWidth: i === 0 ? 0 : 1,
            borderTopColor: Brand.hairline,
          }}
        >
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Brand.turquoise, marginTop: 5 }} accessibilityElementsHidden />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: Brand.navy, fontWeight: '600' }}>
              +{log.value} {unit}
            </Text>
            {!!log.note && (
              <Text style={{ fontSize: 12, color: Brand.navy, opacity: 0.65 }} numberOfLines={2}>
                {log.note}
              </Text>
            )}
            <Text style={{ fontSize: 11, color: Brand.navy, opacity: 0.45 }}>
              {String(log.logged_at).slice(0, 16).replace('T', ' ')}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}
