import React from 'react';
import { Button as InternalButton, YStack, Text } from 'tamagui';

export const Button = ({
  children,
  onPress,
  disabled = false,
  backgroundColor = "$blue10",
  fontWeight = "bold",
  ...props
}) => {
  const bgColor = disabled ? "$gray3" : backgroundColor;
  const textColor = disabled ? "$gray11" : "white";

  return (
    <InternalButton
      onPress={onPress}
      disabled={disabled}
      backgroundColor={bgColor}
      paddingHorizontal="$4"
      paddingVertical="$6"
      hoverStyle={{
        backgroundColor: "$blue9",
      }}
      {...props}
    >
      <YStack justifyContent="center" alignItems="center" flex={1}>
        <Text fontSize="$5" color={textColor} fontWeight={fontWeight}>
          {children}
        </Text>
      </YStack>
    </InternalButton>
  );
};
