import React, { useEffect } from 'react';
import { createStackNavigator,  } from '@react-navigation/stack';
import LoginScreen from '@/screens/LoginScreen';
import HomeScreen from '@/screens/HomeScreen';
import { View, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ResultsScreen from '@/screens/ResultsScreen';
import GroupsScreen from '@/screens/GroupsScreen';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import SignUpScreen from '@/screens/SignupScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        const IconComponent = MaterialIcons;

        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Results') {
          iconName = 'assignment';
        } else if (route.name === 'Groups') {
          iconName = 'group';
        }

        return <IconComponent name={iconName} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Results" component={ResultsScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
    </Tab.Navigator>
    
  )
}
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
        <Stack.Screen name="Loading" component={() => <View><Text>Loading...</Text></View>} />
          <Stack.Screen name="Home" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignUpScreen} />
    </Stack.Navigator>
  );
};