import { useRef } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Platform } from 'react-native';

export const useRecorder = () => {
  const recorder = useRef(new AudioRecorderPlayer()).current;
  const path = Platform.select({
    ios: 'speech.m4a',
    android: `${AudioRecorderPlayer.DEFAULT_OUTPUT}`,
  });

  const startRecording = async () => {
    await recorder.startRecorder(path);
    return path;
  };

  const stopRecording = async () => {
    const result = await recorder.stopRecorder();
    recorder.removeRecordBackListener();
    return result;           // 파일 경로 반환
  };

  return { startRecording, stopRecording };
};
