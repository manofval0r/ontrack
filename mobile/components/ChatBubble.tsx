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
import { Radii } from '../constants/spacing';
import { speakText, stopSpeaking } from '../lib/speech';

export interface ChatMsg {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  proposal?: any;
  chips?: string[];
  source?: 'ai' | 'offline';
  timestamp: string;
}

export function ChatBubble({
  msg,
  index,
  compact,
  onActivate,
  onChip,
}: {
  msg: ChatMsg;
  index: number;
  compact?: boolean;
  onActivate: (proposal: any) => void;
  onChip?: (chip: string) => void;
}) {
  const isUser = msg.sender === 'user';
  const [speaking, setSpeaking] = useState(false);

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
          backgroundColor: isUser ? Brand.navy : Brand.white,
          borderWidth: 2,
          borderColor: Brand.navy,
          borderRadius: Radii.bubble,
          padding: 14,
          shadowColor: Brand.navy,
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 16, lineHeight: 23, color: isUser ? Brand.white : Brand.navy }}>{msg.content}</Text>
        {!isUser && msg.source === 'offline' && (
          <Text style={{ fontSize: 10, fontWeight: '700', color: Brand.amberText, marginTop: 6 }}>
            OFFLINE MODE · DEVICE-ONLY
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
                style={{ borderWidth: 2, borderColor: Brand.navy, borderRadius: Radii.pill, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: Brand.white, minHeight: 44, justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: Brand.navy }}>{chip}</Text>
              </Pressable>
            ))}
          </View>
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
            <Ionicons name={speaking ? 'pause-circle' : 'volume-high'} size={20} color={Brand.teal} />
            {speaking ? (
              <Equalizer />
            ) : (
              <Text style={{ fontSize: 11, fontWeight: '600', color: Brand.teal }}>
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
              style={{ marginTop: 8, backgroundColor: Brand.navy, borderRadius: Radii.pill, paddingVertical: 12, alignItems: 'center', minHeight: 44, justifyContent: 'center' }}
            >
              <Text style={{ color: Brand.white, fontWeight: '700' }}>Use this tracker</Text>
            </Pressable>
          </View>
        )}
        <Text style={{ fontSize: 10, color: isUser ? 'rgba(255,255,255,0.65)' : Brand.navy, opacity: isUser ? 1 : 0.5, marginTop: 4 }}>
          {msg.timestamp}
        </Text>
      </View>
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
