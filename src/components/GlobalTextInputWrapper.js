import React from 'react';
import GlobalTextInput from './GlobalTextInput';
import { useVoice } from '../contexts/VoiceContext';

export default function GlobalTextInputWrapper() {
  const { simulateTextCommand } = useVoice();
  
  return <GlobalTextInput onSubmit={simulateTextCommand} />;
}