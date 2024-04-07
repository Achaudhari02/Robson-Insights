import React, { useEffect } from 'react';
import { createStackNavigator,  } from '@react-navigation/stack';
import LoginScreen from '@/screens/LoginScreen';
import HomeScreen from '@/screens/HomeScreen';
import { View, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

const Stack = createStackNavigator();

export const AppRoutes = () => {
  const { user, loading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigation.navigate('Login');
      }
    }
  }, [user, loading]);

  return (
    <Stack.Navigator>
      {loading ? (
        <Stack.Screen name="Loading" component={() => <View><Text>Loading...</Text></View>} />
      ) : user ? (
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};