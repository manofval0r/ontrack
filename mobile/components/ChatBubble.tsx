/** Chat bubble — AI/user variants, TTS replay on AI, goal proposal card. */
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Brand } from '../constants/colors';
import { useTheme } from '../lib/theme';
import { Radii } from '../constants/spacing';
import { speakText, stopSpeaking, prefetchSpeech } from '../lib/speech';

export interface ChatMsg {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  proposal?: any;
  chips?: string[];
  references?: string[];
  source?: 'ai' | 'offline' | 'fallback';
  timestamp: string;
  /** Follow-up tracker offer: rendered as a floating Yes/No bar under the
   * bubble. `prompt` is re-run through goal structuring on Yes. */
  trackable?: { prompt: string; score: number };
}

export function ChatBubble({
  msg,
  index,
  compact,
  onActivate,
  onChip,
  onTrackAnswer,
}: {
  msg: ChatMsg;
  index: number;
  compact?: boolean;
  onActivate: (proposal: any) => void;
  onChip?: (chip: string) => void;
  onTrackAnswer?: (msgId: string, yes: boolean) => void;
}) {
  const isUser = msg.sender === 'user';
  const t = useTheme();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!isUser && msg.content) prefetchSpeech(msg.content);
  }, [isUser, msg.content]);

  const replay = async () => {    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    try {
      await speakText(msg.content, () => setSpeaking(false));
    } catch {
      setSpeaking(false);
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(280).delay(Math.min(index, 4) * 40)}
      style={{
        maxWidth: '88%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginTop: compact ? -6 : 0,
      }}
    >
      <View
        style={{
          backgroundColor: isUser ? Brand.navy : t.surface,
          borderWidth: 2,
          borderColor: t.border,
          borderRadius: Radii.bubble,
          padding: 14,
          shadowColor: t.shadow,
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 17, lineHeight: 25, color: isUser ? Brand.white : t.ink }}>{msg.content}</Text>
        {!isUser && msg.source && msg.source !== 'ai' && (
          <Text style={{ fontSize: 10, fontWeight: '700', color: Brand.amberText, marginTop: 6 }}>
            {msg.source === 'offline' ? 'OFFLINE MODE · DEVICE-ONLY' : 'BASIC MODE · RETRY FOR FULL AI'}
          </Text>
        )}
        {!!msg.chips?.length && onChip && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {msg.chips.map((chip) => (
              <Pressable
                key={chip}
                onPress={() => onChip(chip)}
                accessibilityLabel={`Reply: ${chip}`}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  borderWidth: 2,
                  borderColor: t.border,
                  borderRadius: Radii.pill,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: pressed ? Brand.turquoise : t.surface,
                  minHeight: 44,
                  justifyContent: 'center',
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: t.ink }}>{chip}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {!!msg.references?.length && (
          <Animated.View
            entering={FadeInUp.duration(280).delay(120)}
            style={{ marginTop: 10 }}
            accessibilityLabel={`Sources: ${msg.references.join(', ')}`}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: t.teal, marginBottom: 4 }}>SOURCES</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {msg.references.map((ref, i) => (
                <View
                  key={`${i}-${ref}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: Brand.teal, borderRadius: Radii.pill, paddingVertical: 5, paddingHorizontal: 10, backgroundColor: Brand.cyanBg }}
                >
                  <Ionicons name="link" size={12} color={t.teal} />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: t.teal }} numberOfLines={1}>{ref}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
        {!isUser && (
          <Pressable
            onPress={replay}
            hitSlop={10}
            accessibilityLabel={speaking ? 'Stop voice replay' : 'Replay with voice'}
            accessibilityRole="button"
            accessibilityState={{ busy: speaking }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, minHeight: 44 }}
          >
            <Ionicons name={speaking ? 'pause-circle' : 'volume-high'} size={20} color={t.teal} />
            {speaking ? (
              <Equalizer />
            ) : (
              <Text style={{ fontSize: 11, fontWeight: '600', color: t.teal }}>
                Voice replay
              </Text>
            )}
          </Pressable>
        )}
        {msg.proposal && (
          <View style={{ marginTop: 10, backgroundColor: Brand.cyanBg, borderWidth: 2, borderColor: Brand.navy, borderRadius: 12, padding: 12 }}>
            <Text style={{ fontWeight: '700', color: Brand.navy }}>
              {msg.proposal.title ?? 'New tracker'}
            </Text>
            {!!msg.proposal.goal_type && (
              <Text style={{ fontSize: 12, color: Brand.teal, fontWeight: '600', marginTop: 2 }}>
                {msg.proposal.goal_type} tracker
              </Text>
            )}
            <Pressable
              onPress={() => onActivate(msg.proposal)}
              accessibilityLabel={`Use this tracker: ${msg.proposal.title ?? 'new goal'}`}
              accessibilityRole="button"
              style={({ pressed }) => ({
                marginTop: 8,
                backgroundColor: Brand.navy,
                borderRadius: Radii.pill,
                paddingVertical: 12,
                alignItems: 'center',
                minHeight: 44,
                justifyContent: 'center',
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: Brand.white, fontWeight: '700' }}>Use this tracker</Text>
            </Pressable>
          </View>
        )}
        <Text style={{ fontSize: 10, color: isUser ? 'rgba(255,255,255,0.65)' : t.inkSoft, marginTop: 4 }}>
          {msg.timestamp}
        </Text>
      </View>
      {!isUser && msg.trackable && onTrackAnswer && (
        <Animated.View
          entering={FadeInUp.duration(280).delay(200)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
            backgroundColor: t.surface,
            borderWidth: 2,
            borderColor: t.border,
            borderRadius: Radii.pill,
            paddingVertical: 6,
            paddingLeft: 14,
            paddingRight: 6,
            shadowColor: t.shadow,
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 2,
          }}
          accessibilityLabel="Make this a goal?"
          accessibilityRole="toolbar"
        >
          <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: t.ink }}>
            Make this a goal?
          </Text>
          <Pressable
            onPress={() => onTrackAnswer(msg.id, true)}
            accessibilityLabel="Yes, track it"
            accessibilityRole="button"
            style={({ pressed }) => ({
              minWidth: 52,
              minHeight: 40,
              paddingHorizontal: 14,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: Radii.pill,
              backgroundColor: Brand.turquoise,
              borderWidth: 2,
              borderColor: t.border,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Text style={{ fontWeight: '800', color: Brand.navy, fontSize: 13 }}>Yes</Text>
          </Pressable>
          <Pressable
            onPress={() => onTrackAnswer(msg.id, false)}
            accessibilityLabel="No, just chatting"
            accessibilityRole="button"
            style={({ pressed }) => ({
              minWidth: 52,
              minHeight: 40,
              paddingHorizontal: 14,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: Radii.pill,
              backgroundColor: t.surface,
              borderWidth: 2,
              borderColor: t.border,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Text style={{ fontWeight: '800', color: t.ink, fontSize: 13 }}>No</Text>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function Equalizer() {
  const bar = useSharedValue(0.4);
  useEffect(() => {
    bar.value = withRepeat(withSequence(withTiming(1, { duration: 350 }), withTiming(0.3, { duration: 350 })), -1, true);
    return () => cancelAnimation(bar);
  }, [bar]);
  return (
    <View accessibilityElementsHidden style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 }}>
      {[6, 9, 12].map((h, i) => (
        <EqBar key={i} bar={bar} max={h} />
      ))}
    </View>
  );
}

function EqBar({ bar, max }: { bar: any; max: number }) {
  const style = useAnimatedStyle(() => ({ height: 5 + bar.value * max }));
  return <Animated.View style={[{ width: 3, borderRadius: 2, backgroundColor: Brand.teal }, style]} />;
}
