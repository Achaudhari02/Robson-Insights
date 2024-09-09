import React from 'react';
import {registerRootComponent} from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '@/lib/auth';
import { AppRoutes } from '@/routes'; 
import { TamaguiProvider, createTamagui } from 'tamagui'
import defaultConfig from '@tamagui/config/v3'

const App = () => {
  const config = createTamagui(defaultConfig)

  return (
    <AuthProvider>
    <NavigationContainer>
    <TamaguiProvider config={config}>
    <AppRoutes /> 
    </TamaguiProvider>
    </NavigationContainer>
    </AuthProvider>
  );
}

registerRootComponent(App);
