import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MenuProvider } from './src/contexts/MenuContext';    // ★ 추가
import { CartProvider } from './src/context/CartContext';
import { VoiceProvider } from './src/contexts/VoiceContext';

import AppNavigator from './src/navigation/AppNavigator';
import GlobalVoiceButton from './src/components/GlobalVoiceButton';

export default function App() {
  return (
    <SafeAreaProvider>
      <MenuProvider>             
        <CartProvider>
          <NavigationContainer>
            <VoiceProvider>
              <AppNavigator />
              <GlobalVoiceButton />
            </VoiceProvider>
          </NavigationContainer>
        </CartProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
}

