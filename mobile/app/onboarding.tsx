/** M2 Onboarding: illustrated pager, one screen at a time, goal-first preview. */
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Brand, Colors } from '../constants/colors';
import { Radii, Spacing } from '../constants/spacing';
import { FontFamily, Typography } from '../constants/typography';
import { OnboardingArt } from '../components/OnboardingArt';
import { BackdropArt } from '../components/BackdropArt';
import { Card, PillButton } from '../components/ui';
import { templateMeta } from '../lib/templates';

const STEPS = [  {
    title: 'Welcome to OnTrack',
    body: 'Chat-first accountability. Say a goal, get a tracker, prove progress.',
    artLabel: 'Illustration: the OnTrack arrow mark drawing itself',
  },
  {
    title: 'Trackers that build themselves',
    body: 'Counters, checklists and logs appear from plain words — then update live.',
    artLabel: 'Illustration: a tracker card filling with progress and checklist ticks',
  },
  {
    title: 'Try your first goal',
    body: 'Type it below to preview — no account needed yet.',
    artLabel: 'Illustration: coach and user trading chat messages',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');

  const goAuth = (login: boolean) => {
    const params = !login && draft.trim() ? { pendingGoal: draft.trim().slice(0, 500) } : {};
    router.replace({ pathname: login ? '/(auth)/login' : '/(auth)/signup', params });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.grayCanvas, padding: Spacing.xl }}>
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
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === step ? Brand.turquoise : Colors.light.inputBorder,
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
          <Text style={{ fontWeight: '700', color: Brand.teal }}>Skip</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
        <Animated.View key={step} entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(200)}>
          <View accessibilityLabel={STEPS[step].artLabel} accessibilityRole="image">
            <OnboardingArt step={step} />
          </View>
        </Animated.View>
        <Card>
          <Text style={{ fontFamily: FontFamily.expressive, fontSize: 28, color: Brand.navy }}>
            {STEPS[step].title}
          </Text>
          <Text style={{ marginTop: 8, fontSize: Typography.body.fontSize, color: Brand.navy, lineHeight: Typography.body.lineHeight }}>
            {STEPS[step].body}
          </Text>
          {step === 2 && (
            <>
              <TextInput
                value={draft}
                onChangeText={(t) => setDraft(t.slice(0, 500))}
                placeholder="e.g. Run 3 mornings a week"
                placeholderTextColor={Brand.placeholder}
                accessibilityLabel="Your first goal"
                accessibilityHint="Typed goal is queued and created after signup"
                returnKeyType="done"
                maxLength={500}
                style={{
                  marginTop: Spacing.md,
                  borderWidth: 2,
                  borderColor: Colors.light.inputBorder,
                  borderRadius: Radii.input,
                  padding: Spacing.md,
                  fontSize: Typography.body.fontSize,
                  backgroundColor: Brand.white,
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
      <Text style={{ textAlign: 'center', color: Brand.navy, opacity: 0.5 }}>
        Step {step + 1} of 3
      </Text>
    </SafeAreaView>
  );
}

/** Local tracker preview — keyword shape detection, no network needed.
 * Shows the user what kind of tracker their words will become. */
function DraftPreview({ text }: { text: string }) {
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
      <Text style={{ fontSize: 12, fontWeight: '700', color: Brand.teal }}>
        {type === 'counter' ? `Counter${num ? ` · target ${num[1]}` : ''}` : type === 'checklist' ? 'Checklist' : 'Daily log'} · {meta.unit}
      </Text>
    </View>
  );
}
