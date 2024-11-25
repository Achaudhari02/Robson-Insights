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
  const hoverBgColor = disabled ? "$gray3" : "$blue9";
  const pressBgColor = disabled ? "$gray3" : "$blue8";

  return (
    <InternalButton
      onPress={onPress}
      disabled={disabled}
      backgroundColor={bgColor}
      borderRadius="$3"
      paddingHorizontal="$4"
      paddingVertical="$6"
      shadowColor={disabled ? undefined : "$shadowColor"}
      elevation={disabled ? 0 : 3}
      hoverStyle={{
        backgroundColor: hoverBgColor,
        transform: disabled ? undefined : "scale(1.03)",
        elevation: disabled ? 0 : 6,
      }}
      pressStyle={{
        backgroundColor: pressBgColor,
        transform: disabled ? undefined : "scale(0.97)",
      }}
      transition="all 0.2s ease-in-out"
      {...props}
    >
      <YStack justifyContent="center" alignItems="center" flex={1}>
        <Text
          fontSize="$5"
          color={textColor}
          fontWeight={fontWeight}
          textAlign="center" // Center the text
        >
          {children}
        </Text>
      </YStack>
    </InternalButton>
  );
};
