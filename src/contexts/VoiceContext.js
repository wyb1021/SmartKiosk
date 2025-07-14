import React, { createContext, useState, useEffect, useContext } from 'react';
import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';
import { useNavigation } from '@react-navigation/native';
import { PermissionsAndroid, Platform } from 'react-native';
import { processVoiceCommand } from '../services/openaiService';
import { useMenu } from '../contexts/MenuContext';
import { useCart } from '../context/CartContext';

export const VoiceContext = createContext();

async function requestAudioPermission() {
  if (Platform.OS === 'android') {
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: '마이크 권한 요청',
        message: '음성 인식을 위해 마이크 권한이 필요합니다',
        buttonPositive: '확인',
        buttonNegative: '취소',
      }
    );
    return res === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [recognizedTextTimer, setRecognizedTextTimer] = useState(null);

  const navigation = useNavigation();
  const { findMenuItem, menus } = useMenu();
  const { cartItems } = useCart();

  // 사용자가 텍스트로 직접 명령을 보낼 때 호출
  const simulateTextCommand = async (text) => {
    await processCommand(text);
  };

  // 실제 음성 또는 텍스트 명령어 공통 처리
  const processCommand = async (userText) => {
    try {
      Tts.speak('잠시만 기다려 주세요.');
      const result = await processVoiceCommand(userText, cartItems, menus);

      if (result?.response) Tts.speak(result.response);

      const first = result.items?.[0];
      const menuObj = first && findMenuItem(first.menu.toLowerCase());

      if (result.action === '추천') {
        const recs = result.items
          .map(i => menus.find(m => m.name === i.menu))
          .filter(Boolean);
        return navigation.navigate('RecommendationList', { items: recs });
      }

      switch (result.action) {
        case '주문':
          if (menuObj) navigation.navigate('MenuDetail', { item: menuObj });
          else Tts.speak('해당 메뉴를 찾지 못했습니다.');
          break;
        case '장바구니':
        case '조회':
          navigation.navigate('Cart');
          break;
        case '취소':
          // TODO
          break;
        default:
          Tts.speak('죄송합니다. 지원하지 않는 요청입니다.');
      }
    } catch (e) {
      console.error('[processCommand] LLM 오류:', e);
      Tts.speak('요청을 처리하지 못했습니다. 다시 말씀해 주세요.');
    }
  };

  // STT 이벤트 핸들러들은 processCommand 호출만 다릅니다.
  const onSpeechStart = () => { setError(''); setRecognizedText(''); };
  const onSpeechEnd   = () => setIsListening(false);
  const onSpeechError = e => { setError(e.error); setIsListening(false); Tts.speak('음성 인식 실패'); };
  const onSpeechResults = e => {
    const txt = e.value[0];
    setRecognizedText(txt);
    processCommand(txt);
    clearTimeout(recognizedTextTimer);
    setRecognizedTextTimer(setTimeout(() => setRecognizedText(''), 5000));
  };
  const onSpeechPartialResults = e => {
    setRecognizedText(e.value[0]);
    clearTimeout(silenceTimer);
    setSilenceTimer(setTimeout(() => isListening && stopListening(), 2000));
  };

  const startListening = async () => {
    if (!(await requestAudioPermission())) {
      return Tts.speak('마이크 권한이 거부되었습니다.');
    }
    setIsListening(true);
    await Voice.start('ko-KR');
  };
  const stopListening = async () => {
    clearTimeout(silenceTimer);
    setSilenceTimer(null);
    await Voice.stop();
    setIsListening(false);
  };

  useEffect(() => {
    Tts.setDefaultLanguage('ko-KR');
    Tts.setDefaultRate(0.5);
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    return () => Voice.destroy().then(Voice.removeAllListeners);
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        recognizedText,
        error,
        startListening,
        stopListening,
        simulateTextCommand,  // ← 텍스트 시뮬레이션용
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);