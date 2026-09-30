/** M2 Onboarding: illustrated pager, one screen at a time, goal-first preview. */
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Brand } from '../constants/colors';
import { useTheme } from '../lib/theme';
import { Radii, Spacing } from '../constants/spacing';
import { FontFamily, Typography } from '../constants/typography';
import { OnboardingArt } from '../components/OnboardingArt';
import { ThreeHero } from '../components/ThreeHero';
import { BackdropArt } from '../components/BackdropArt';
import { Card, PillButton } from '../components/ui';
import { templateMeta } from '../lib/templates';

const STEPS = [  {
    title: 'Welcome to OnTrack',
    body: 'Chat-first accountability. Say a goal, get a tracker, prove progress.',
    artLabel: 'Illustration: the OnTrack arrow mark drawing itself',
    caption: 'Step 1 · Meet OnTrack',
  },
  {
    title: 'Trackers that build themselves',
    body: 'Counters, checklists and logs appear from plain words — then update live.',
    artLabel: 'Illustration: a tracker card filling with progress and checklist ticks',
    caption: 'Step 2 · Watch it build',
  },
  {
    title: 'Try your first goal',
    body: 'Type it below to preview — no account needed yet.',
    artLabel: 'Illustration: assistant and user trading chat messages',
    caption: 'Step 3 · Your turn',
  },
];

const GOAL_TEMPLATES = [
  { label: 'Close 5 deals', text: 'I want to close 5 enterprise deals in 14 days' },
  { label: 'Ship the MVP', text: 'I want to ship the mobile app MVP this week' },
  { label: 'Reflect daily', text: 'I want to journal every evening for 2 weeks' },
];

export default function Onboarding() {
  const t = useTheme();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  const [glOk, setGlOk] = useState(true);

  const goAuth = (login: boolean) => {
    const params = !login && draft.trim() ? { pendingGoal: draft.trim().slice(0, 500) } : {};
    router.replace({ pathname: login ? '/(auth)/login' : '/(auth)/signup', params });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas, padding: Spacing.xl }}>
      <BackdropArt variant="full" />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 }}>
        <View
          accessibilityLabel={`Step ${step + 1} of ${STEPS.length}`}
          accessibilityRole="text"
          style={{ flexDirection: 'row', gap: 6 }}
        >
          {STEPS.map((_, i) => (
            <View
              key={i}
              accessibilityElementsHidden
              style={{
                width: i === step ? 30 : 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: i === step ? Brand.turquoise : t.inputBorder,
              }}
            />
          ))}
        </View>
        <Pressable
          onPress={() => goAuth(false)}
          hitSlop={12}
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
          accessibilityHint="Goes straight to account creation"
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={{ fontWeight: '700', color: t.teal }}>Skip</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
        <Animated.View key={step} entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(200)}>
          {step === 0 && glOk ? (
            <View accessibilityLabel={STEPS[step].artLabel} accessibilityRole="image" style={{ marginVertical: 6 }}>
              <ThreeHero height={250} onFail={() => setGlOk(false)} />
            </View>
          ) : (
            <View accessibilityLabel={STEPS[step].artLabel} accessibilityRole="image" style={{ transform: [{ scale: 1.3 }], marginVertical: 18 }}>
              <OnboardingArt step={step} />
            </View>
          )}
        </Animated.View>
        <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '700', color: t.teal }}>
          {STEPS[step].caption}
        </Text>
        <Card>
          <Text style={{ fontFamily: FontFamily.expressive, fontSize: 34, color: t.ink }}>
            {STEPS[step].title}
          </Text>
          <Text style={{ marginTop: 8, fontSize: 16, color: t.ink, lineHeight: 23 }}>
            {STEPS[step].body}
          </Text>
          {step === 2 && (
            <>
              <Text style={{ marginTop: 12, fontSize: 11, fontWeight: '700', color: t.teal }}>
                OR START FROM A TEMPLATE
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {GOAL_TEMPLATES.map((tpl) => {
                  const selected = draft === tpl.text;
                  return (
                    <Pressable
                      key={tpl.label}
                      onPress={() => setDraft(tpl.text)}
                      accessibilityLabel={`Use template: ${tpl.label}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={{
                        borderWidth: 2,
                        borderColor: t.border,
                        borderRadius: Radii.pill,
                        paddingVertical: 9,
                        paddingHorizontal: 14,
                        backgroundColor: selected ? Brand.turquoise : t.surface,
                        minHeight: 44,
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: selected ? Brand.navy : t.ink }}>
                        {tpl.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                value={draft}
                onChangeText={(text) => setDraft(text.slice(0, 500))}
                placeholder="e.g. Run 3 mornings a week"
                placeholderTextColor={t.inkSoft}
                accessibilityLabel="Your first goal"
                accessibilityHint="Typed goal is queued and created after signup"
                returnKeyType="done"
                maxLength={500}
                style={{
                  marginTop: Spacing.md,
                  borderWidth: 2,
                  borderColor: t.inputBorder,
                  borderRadius: Radii.input,
                  padding: Spacing.md,
                  fontSize: Typography.body.fontSize,
                  backgroundColor: t.surface,
                  color: t.ink,
                }}
              />
              {draft.trim().length > 0 && <DraftPreview text={draft} />}
            </>
          )}
        </Card>
        {step < 2 ? (
          <PillButton title="Continue" primary onPress={() => setStep(step + 1)} accessibilityHint={`Goes to step ${step + 2}: ${STEPS[step + 1].title}`} />
        ) : (
          <View style={{ gap: 12 }}>
            <PillButton
              title={draft.trim() ? 'Preview my tracker' : 'Create account'}
              primary
              onPress={() => goAuth(false)}
              accessibilityHint="Queues your typed goal, then creates your account"
            />
            <PillButton title="I already have an account" onPress={() => goAuth(true)} />
          </View>
        )}
      </View>
      <Text style={{ textAlign: 'center', color: t.inkSoft }}>
        Step {step + 1} of 3
      </Text>
    </SafeAreaView>
  );
}

/** Local tracker preview — keyword shape detection, no network needed.
 * Shows the user what kind of tracker their words will become. */
function DraftPreview({ text }: { text: string }) {
  const t = useTheme();
  const lower = text.toLowerCase();
  const num = text.match(/\b(\d+)\b/);
  const type = /book|read|ship|task|checklist|steps/.test(lower)
    ? 'checklist'
    : /reflect|journal|meditat|habit|mood/.test(lower)
    ? 'manual'
    : 'counter';
  const meta = templateMeta({ goal_template: undefined, goal_type: type });
  return (
    <View
      accessibilityLabel={`Preview: ${meta.label} tracker${num ? `, target ${num[1]}` : ''}`}
      style={{
        marginTop: Spacing.md,
        borderWidth: 2,
        borderColor: Brand.turquoise,
        borderRadius: Radii.input,
        backgroundColor: Brand.cyanBg,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '700', color: t.teal }}>
        {type === 'counter' ? `Counter${num ? ` · target ${num[1]}` : ''}` : type === 'checklist' ? 'Checklist' : 'Daily log'} · {meta.unit}
      </Text>
    </View>
  );
}
