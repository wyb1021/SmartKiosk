import OpenAI from 'openai';
import RNFS from 'react-native-fs';      // Expo는 'expo-file-system'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * fileUri: react-native-audio, expo-av 등으로 저장한 로컬 파일 경로
 * 반환값: Whisper가 인식한 텍스트 (string)
 */
export const transcribeAudio = async (fileUri) => {
  // 1) 파일을 Base64로 읽기
  const base64Audio = await RNFS.readFile(fileUri, 'base64');

  // 2) FormData 구성 (RN의 Blob은 FFD 지원; base64→Blob 변환)
  const form = new FormData();
  form.append('file', {
    uri: fileUri,
    name: 'recording.m4a',        // 확장자 m4a / wav / mp3 모두 지원
    type: 'audio/m4a',
  });
  form.append('model', process.env.OPENAI_WHISPER_MODEL || 'whisper-1');
  form.append('language', process.env.WHISPER_LANGUAGE || 'ko');

  // 3) fetch 직접 호출 — SDK 4.x는 RN에서 파일 업로드가 미지원
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: form,
  });

  if (!res.ok) throw new Error(`Whisper error ${res.status}`);
  const data = await res.json();
  return data.text;    // 예: "아이스 아메리카노 두 잔 주세요."
};
