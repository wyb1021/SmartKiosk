import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useVoice } from '../contexts/VoiceContext';

const GlobalVoiceButton = () => {
  const { isListening, recognizedText, startListening, stopListening } = useVoice();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      // 펄스 애니메이션
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, isListening && styles.listeningButton]}
          onPress={isListening ? stopListening : startListening}
          activeOpacity={0.8}
        >
          {/* 변경된 부분 시작: Text와 Icon을 하나의 View로 감쌈 */}
          <View style={styles.buttonContent}> 
            <Text style={styles.label}>
              {isListening ? 'Listening...' : '음성 인식'}
            </Text>
            <Icon 
              name={isListening ? "mic" : "mic-none"} 
              size={30} 
              color="white" 
            />
          </View>
          {/* 변경된 부분 끝 */}
        </TouchableOpacity>
      </Animated.View>

      {/* 인식된 텍스트 표시 */}
      {recognizedText !== '' && (
        <View style={styles.textContainer}>
          <Text style={styles.recognizedText}>{recognizedText}</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3', 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listeningButton: {
    backgroundColor: '#f44336',
  },
  // 새로 추가된 스타일
  buttonContent: {
    flexDirection: 'row', // 아이콘과 텍스트가 가로로 나란히 보이도록
    alignItems: 'center', // 세로 중앙 정렬
    justifyContent: 'center', // 가로 중앙 정렬
    // 필요에 따라 패딩이나 마진을 추가할 수 있습니다.
    // paddingHorizontal: 10, 
  },
  label: {
    color: 'white',
    fontSize: 14,
    marginRight: 5, // 텍스트와 아이콘 사이 간격
  },
  textContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
  },
  recognizedText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GlobalVoiceButton;