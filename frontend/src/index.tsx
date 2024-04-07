import React, { StyleSheet, Text, View } from 'react-native';
import {registerRootComponent} from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '@/lib/auth';
import { AppRoutes } from '@/routes'; 


const App = () => {

  return (
    <AuthProvider>
    <NavigationContainer>
    <AppRoutes /> 
    </NavigationContainer>
    </AuthProvider>
  );
}

registerRootComponent(App);
