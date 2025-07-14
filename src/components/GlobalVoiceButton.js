import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';  // ← 추가
import { useVoice } from '../contexts/VoiceContext';

export default function GlobalVoiceButton() {
  const { isListening, startListening, stopListening } = useVoice();
  const insets = useSafeAreaInsets(); // ← 상태바 높이 등

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: insets.top + 8,      // 상태바 + 8px
        right: 12,                // 우측 여백
        transform: [{ scale: pulseAnim }],
        zIndex: 999,              // 맨 위에
      }}
    >
      <TouchableOpacity
        style={{
          width: 42, height: 42, borderRadius: 21,
          backgroundColor: isListening ? '#f44336' : '#007AFF',
          justifyContent: 'center', alignItems: 'center',
          elevation: 5,
        }}
        onPress={isListening ? stopListening : startListening}
        activeOpacity={0.8}
      >
        <Icon name={isListening ? 'mic' : 'mic-none'} size={24} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
}