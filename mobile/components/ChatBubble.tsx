/** Chat bubble — AI/user variants, TTS replay on AI, goal proposal card. */
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Brand } from '../constants/colors';
import { Radii } from '../constants/spacing';
import { speakText, stopSpeaking } from '../lib/speech';

export interface ChatMsg {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  proposal?: any;
}

export function ChatBubble({
  msg,
  index,
  onActivate,
}: {
  msg: ChatMsg;
  index: number;
  onActivate: (proposal: any) => void;
}) {
  const isUser = msg.sender === 'user';
  const [speaking, setSpeaking] = useState(false);

  const replay = async () => {
    if (speaking) {
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
      }}
    >
      <View
        style={{
          backgroundColor: isUser ? Brand.navy : '#fff',
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
        <Text style={{ fontSize: 15, color: isUser ? '#fff' : Brand.navy }}>{msg.content}</Text>
        {!isUser && (
          <Pressable
            onPress={replay}
            hitSlop={10}
            accessibilityLabel={speaking ? 'Stop voice replay' : 'Replay with voice'}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}
          >
            <Ionicons name={speaking ? 'pause-circle' : 'volume-high'} size={20} color={Brand.teal} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: Brand.teal }}>
              {speaking ? 'Playing…' : 'Voice replay'}
            </Text>
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
              style={{ marginTop: 8, backgroundColor: Brand.navy, borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Use this tracker</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
