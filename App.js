import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MenuProvider } from './src/contexts/MenuContext';
import { CartProvider } from './src/context/CartContext';
import { VoiceProvider } from './src/contexts/VoiceContext';

import AppNavigator from './src/navigation/AppNavigator';
import GlobalVoiceButton from './src/components/GlobalVoiceButton';
import GlobalTextInputWrapper from './src/components/GlobalTextInputWrapper';

export default function App() {
  return (
    <SafeAreaProvider>
      <MenuProvider>             
        <CartProvider>
          <NavigationContainer>
            <VoiceProvider>
              <AppNavigator />
              <GlobalVoiceButton />
              <GlobalTextInputWrapper />
            </VoiceProvider>
          </NavigationContainer>
        </CartProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
}