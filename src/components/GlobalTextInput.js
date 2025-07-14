// src/components/GlobalTextInput.js
import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  TextInput,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function GlobalTextInput({ onSubmit }) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(true);
  const [text, setText] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 키보드 올라오면 살짝 위로
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(slideAnim, {
        toValue: -insets.bottom - 60,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 8,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.inner}>
        <TextInput
          style={styles.input}
          placeholder="텍스트를 입력하세요..."
          value={text}
          onChangeText={setText}
          returnKeyType="send"
          onSubmitEditing={() => {
            onSubmit(text);
            setText('');
            Keyboard.dismiss();
          }}
          // 한국어 키보드 지원은 기본으로 제공됩니다
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            onSubmit(text);
            setText('');
            Keyboard.dismiss();
          }}
        >
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.close}
          onPress={() => setVisible(false)}
        >
          <Icon name="close" size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    zIndex: 1000,
    width: screenWidth - 24,     // 좌우 12px씩 마진
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 4,
    borderRadius: 25,
    paddingHorizontal: 12,
    height: 48,                   // 높이를 약간 키움
  },
  input: {
    flex: 1,
    fontSize: 16,                // 글자 크기도 키워서 가독성↑
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  close: {
    marginLeft: 8,
    padding: 4,
  },
});

