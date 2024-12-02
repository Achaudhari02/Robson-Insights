import React, { useCallback, useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@/screens/LoginScreen';
import HomeScreen from '@/screens/HomeScreen';
import { View, Text, Modal, Button, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ResultsScreen from '@/screens/ResultsScreen';
import GroupsScreen from '@/screens/GroupsScreen';
import { MaterialIcons } from '@expo/vector-icons';
import SignUpScreen from '@/screens/SignupScreen';
import PieChartAnalysisScreen from '@/screens/PieChartAnalysisScreen';
import BarChartAnalysisScreen from '@/screens/BarChartAnalysisScreen';
import { axiosInstance } from '@/lib/axios';
import { LogoutButton } from '@/components/LogoutButton';
import { Button as TamaguiButton,  updateTheme, useThemeName } from 'tamagui';
import { lightTheme, darkTheme } from '../themes';
import { Sun, Moon } from '@tamagui/lucide-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = ({ toggleTheme }) => {
  const theme = useThemeName();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          const IconComponent = MaterialIcons;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'ResultsWrapper') {
            iconName = 'assignment';
          } else if (route.name === 'Groups') {
            iconName = 'group';
          }

          return <IconComponent name={iconName} size={size} color={color} />;
        },
        headerRight: () => <View style={{ display: 'flex', flexDirection: 'row' }}>
          <ThemeToggle toggleTheme={toggleTheme} />
          <LogoutButton />
        </View>,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : lightTheme.backgroundColor,
          borderTopColor: theme === 'dark' ? 'transparent' : 'rgb(216, 216, 216)',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{
        headerStyle: { backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : lightTheme.backgroundColor, borderBottomColor: theme=== 'dark' ? darkTheme.backgroundColor : 'rgb(216, 216, 216)' },
        headerTintColor: theme === 'dark' ? darkTheme.color : lightTheme.color,
      }} />
      <Tab.Screen
        name="ResultsWrapper"
        options={{
          unmountOnBlur: true,
          headerShown: false,
          headerStyle: {
            backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : lightTheme.backgroundColor,
            borderBottomColor: theme === 'dark' ? darkTheme.backgroundColor : 'rgb(216, 216, 216)',
          },
          headerTintColor: theme === 'dark' ? darkTheme.color : lightTheme.color,
          tabBarLabel: 'Results',
        }}
      >
        {() => <ResultsStack toggleTheme={toggleTheme} />}
      </Tab.Screen>
      <Tab.Screen name="Groups" component={GroupsScreen} options={{
        headerStyle: { backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : lightTheme.backgroundColor, borderBottomColor: theme === 'dark' ? darkTheme.backgroundColor : 'rgb(216, 216, 216)' },
        headerTintColor: theme === 'dark' ? darkTheme.color : lightTheme.color,
      }} />
    </Tab.Navigator>
  );
};

const AuthScreens = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Login'
        }}
      />
      <Stack.Screen
        name="Signup"
        component={SignUpScreen}
        options={{
          title: 'Sign Up'
        }}
      />
    </Stack.Navigator>
  );
};

const ResultsStack = ({ toggleTheme }) => {
  const theme = useThemeName();
  return (
    <Stack.Navigator screenOptions={{
      headerRight: () => <View style={{ display: 'flex', flexDirection: 'row' }}>
        <ThemeToggle toggleTheme={toggleTheme}/>
        <LogoutButton />
      </View>,
      headerStyle: { backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : lightTheme.backgroundColor, borderBottomColor: theme === 'dark' ? darkTheme.backgroundColor : 'rgb(216, 216, 216)' },
      headerTintColor: theme === 'dark' ? darkTheme.color : lightTheme.color,
      headerShown: true
    }}>
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
      />
      <Stack.Screen
        name="Pie Chart"
        component={PieChartAnalysisScreen}
      />
      <Stack.Screen
        name="Bar Chart"
        component={BarChartAnalysisScreen}
      />

    </Stack.Navigator>
  );
};

const ThemeToggle = ({ toggleTheme }) => {
  const themeName = useThemeName();
 
  return (
    <TamaguiButton
      icon={themeName === 'dark' ? <Sun size="$2" /> : <Moon size="$2" />}
      backgroundColor="$colorTransparent"
      margin="$2"
      onPress={() => {
        console.log('ThemeToggle button clicked');
        toggleTheme();
      }}
      hoverStyle={{ borderColor: '$colorTransparent' }}
    />
  );
};

const AppStack = ({ toggleTheme }) => {
  return (
    <Stack.Navigator>
     <Stack.Screen name="App" options={{ headerShown: false }}>
        {() => <AppTabs toggleTheme={toggleTheme} />}
      </Stack.Screen>
  </Stack.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Auth" component={AuthScreens} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export const AppRoutes = ({ toggleTheme }) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const InvitationModal = ({ visible, invitations, onClose }) => {
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [selectedInvite, setSelectedInvite] = useState(null);

    const handleAccept = async (invite) => {
      try {
        await axiosInstance.get(`users/accept-invitation/${invite.token}/`, {
          headers: { Authorization: `Token ${user.token}` },
        });
        console.log(`Accepted invite for group: ${invite.group_name}`);
        await fetchInvitations();
      } catch (error) {
        console.error('Error accepting invitation:', error);
      }
    };

    const handleReject = (invite) => {
      setSelectedInvite(invite);
      setConfirmVisible(true);
    };

    const confirmReject = async () => {
      try {
        await axiosInstance.delete(`users/reject-invitation/${selectedInvite.token}/`, {
          headers: { Authorization: `Token ${user.token}` },
        });
        console.log(`Rejected invite for group: ${selectedInvite.group_name}`);
        setConfirmVisible(false);
        await fetchInvitations();
      } catch (error) {
        console.error('Error rejecting invitation:', error);
      }
    };

    return (
      <>
        <Modal visible={visible} transparent={true} animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Pending Invitations</Text>
              {invitations.map((invite, index) => (
                <View key={index} style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text>Group: {invite.group_name}</Text>
                    <Text>Members: {invite.group_members.length}</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <MaterialIcons name="check" size={24} color="green" onPress={() => handleAccept(invite)} />
                    <MaterialIcons name="close" size={24} color="red" onPress={() => handleReject(invite)} />
                  </View>
                </View>
              ))}
              <Button title="Close" onPress={onClose} />
            </View>
          </View>
        </Modal>

        <Modal visible={confirmVisible} transparent={true} animationType="fade">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ width: 250, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
              <Text style={{ fontSize: 16, marginBottom: 20 }}>Are you sure you want to reject this invitation?</Text>
              <Button title="Yes, Reject" onPress={confirmReject} />
              <Button title="Cancel" onPress={() => setConfirmVisible(false)} />
            </View>
          </View>
        </Modal>
      </>
    );
  };

  const fetchInvitations = async () => {
    try {
      const response = await axiosInstance.get('users/invitations/', {
        headers: { Authorization: `Token ${user.token}` },
      });
      setInvitations(response.data);
      setModalVisible(response.data.length > 0); // Close modal if no invitations
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user]);

  return (
    <>
      {user ? <AppStack toggleTheme={toggleTheme}/> : <AuthStack />}
      <InvitationModal
        visible={modalVisible}
        invitations={invitations}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tamaguiButton: {
    backgroundColor: "#007bff",
    color: '#fff',
  },
  button: {
    margin: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center'
  },

});
