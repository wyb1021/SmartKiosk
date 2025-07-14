import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from 'react';
import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';
import { useNavigation } from '@react-navigation/native';
import { processVoiceCommand } from '../services/openaiService';   // LLM 호출
import { useMenu } from './MenuContext';                          // ★ 새 컨텍스트
import { useCart } from '../context/CartContext';

export const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  /* ---------- 상태 ---------- */
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [recognizedTextTimer, setRecognizedTextTimer] = useState(null);

  /* ---------- 훅스 ---------- */
  const navigation = useNavigation();
  const { findMenuItem } = useMenu();               // ★ DB 메뉴 검색 함수
  const { cartItems }    = useCart();
  const { menus }        = useMenu();

  /* ---------- 초기화 ---------- */
  useEffect(() => {
    // TTS 기본값
    Tts.setDefaultLanguage('ko-KR');
    Tts.setDefaultRate(0.5);

    // Voice 이벤트 리스너
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  /* ---------- Voice 이벤트 ---------- */
  const onSpeechStart = () => {
    setError('');
    setRecognizedText('');
    console.log('음성 인식 시작');
  };

  const onSpeechEnd = () => {
    console.log('음성 인식 종료');
    setIsListening(false);
  };

  const onSpeechError = e => {
    console.log('음성 인식 오류:', e);
    setError(e.error);
    setIsListening(false);
    Tts.speak('음성 인식에 실패했습니다. 다시 시도해주세요.');
  };

  const onSpeechResults = event => {
    const text = event.value[0];
    setRecognizedText(text);
    processCommand(text, cartItems, menus);                      // 비동기 LLM 호출

    // 5초 후 텍스트 초기화
    clearTimeout(recognizedTextTimer);
    setRecognizedTextTimer(setTimeout(() => setRecognizedText(''), 5000));
  };

  const onSpeechPartialResults = event => {
    setRecognizedText(event.value[0]);

    clearTimeout(silenceTimer);
    setSilenceTimer(
      setTimeout(() => isListening && stopListening(), 2000),
    );
  };

  /* ---------- 음성 시작/종료 ---------- */
  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start('ko-KR');
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  /* ---------- LLM + 메뉴 매핑 ---------- */
  const processCommand = async (userText, cartItems, menus)  => {
    try {
      Tts.speak('잠시만 기다려 주세요.');

      const result = await processVoiceCommand(userText, cartItems, menus);   // LLM 호출

      if (result?.response) Tts.speak(result.response);

      // LLM이 반환한 메뉴명을 DB 객체로 매핑
      const firstItem = result.items?.[0];
      const menuObj =
        firstItem && findMenuItem(firstItem.menu.toLowerCase());

      if (result.action === '추천') {
        const recObjs = result.items
          .map(i => menus.find(m => m.name === i.menu))
          .filter(Boolean);
        navigation.navigate('RecommendationList', { items: recObjs });
      if (result.response) Tts.speak(result.response);
      return;
      }
      switch (result.action) {
        case '주문':
          if (menuObj) {
            navigation.navigate('MenuDetail', { item: menuObj });
          } else {
            Tts.speak('해당 메뉴를 찾지 못했습니다.');
          }
          break;
        case '장바구니':
        case '조회':
          navigation.navigate('Cart');
          break;
        case '취소':
          // TODO: 취소 로직
          break;
        default:
          Tts.speak('죄송합니다. 아직 지원하지 않는 요청입니다.');
      }
    } catch (e) {
      console.error('[processCommand] LLM 오류:', e);
      Tts.speak('요청을 처리하지 못했습니다. 다시 말씀해 주세요.');
    }
  };

  /* ---------- 컨텍스트 제공 ---------- */
  return (
    <VoiceContext.Provider
      value={{
        isListening,
        recognizedText,
        error,
        startListening,
        stopListening,
      }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);
