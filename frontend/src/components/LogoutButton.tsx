import React from 'react';
import { Button as TamaguiButton } from 'tamagui';
import { StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export const LogoutButton = () => {
  const { logoutFn } = useAuth();

  return (
    <TamaguiButton
      size="$4"
      backgroundColor="$blue10"
      color="white"
      borderRadius="$2"
      margin="$2"
      onPress={logoutFn}
      hoverStyle={styles.tamaguiButton}
    >
      Logout
    </TamaguiButton>
  );
};

const styles = StyleSheet.create({
  tamaguiButton: {
    backgroundColor: "#007bff",
  },
});