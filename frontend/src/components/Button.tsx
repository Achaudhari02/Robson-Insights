import React from 'react';
import { Button as InternalButton, YStack, Text } from 'tamagui';

export const Button = ({ children, onPress, disabled, backgroundColor = "$blue10", color = "white", fontWeight = "bold", ...props }) => {
  return (
    <InternalButton
      onPress={onPress}
      disabled={disabled}
      backgroundColor={disabled ? "$gray3" : backgroundColor}
      width="100%"
      paddingHorizontal="$4"
      paddingVertical="$6"
      color={disabled ? "$gray11" : color} 
      {...props}
    >
      <YStack justifyContent="center" alignItems="center" flex={1}>
      <Text fontSize="$5" color={disabled ? "$gray11" : color} fontWeight={fontWeight}>
          {children}
        </Text>
      </YStack>
    </InternalButton>
  );
};

