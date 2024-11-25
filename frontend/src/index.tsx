import React from 'react';
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '@/lib/auth';
import { AppRoutes } from '@/routes';
import { TamaguiProvider, createTamagui, Theme } from 'tamagui'
import { config } from '@tamagui/config/v3'
import { useFonts } from 'expo-font'
import { ToastProvider, ToastViewport } from '@tamagui/toast'


const tamaguiConfig = createTamagui(config)

const navigationConfig = {
  linking: {
    prefixes: ['http://localhost:8081'],
    config: {
      screens: {
        App: {
          screens: {
            Home: '',
            ResultsWrapper: {
              screens: {
                Results: 'results',
              }
            },
            Groups: 'groups',
          }
        },
        Auth: {
        screens: {
          Login: 'login',
          Signup: 'signup',
        }
      },
      }
    }
  }
};


// TypeScript types across all Tamagui APIs
type Conf = typeof tamaguiConfig
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf { }
}

const App = () => {
  const [loadedFonts] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  if (!loadedFonts) {
    return null
  }
  return (
    <AuthProvider>
      <NavigationContainer linking={navigationConfig.linking}>
        <TamaguiProvider config={tamaguiConfig}>
          <Theme name="light">
            <ToastProvider>
              <AppRoutes />
              <ToastViewport />
            </ToastProvider>
          </Theme>
        </TamaguiProvider>
      </NavigationContainer>
    </AuthProvider>
  );
}

registerRootComponent(App);
