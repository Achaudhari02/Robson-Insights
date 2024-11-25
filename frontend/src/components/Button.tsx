import React from 'react';
import { Button as InternalButton, YStack, Text } from 'tamagui';

export const Button = ({
  children,
  onPress,
  disabled = undefined,
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
      borderRadius="$3" // Rounded corners
      paddingHorizontal="$4"
      paddingVertical="$6"
      shadowColor={disabled ? undefined : "$shadowColor"} // Drop shadow when active
      elevation={disabled ? 0 : 3} // Shadow depth for disabled and active states
      hoverStyle={{
        backgroundColor: hoverBgColor,
        transform: disabled ? undefined : "scale(1.03)", // Slight scale effect on hover
        elevation: disabled ? 0 : 6,
      }}
      pressStyle={{
        backgroundColor: pressBgColor,
        transform: disabled ? undefined : "scale(0.97)", // Shrink slightly on press
      }}
      transition="all 0.2s ease-in-out" // Smooth transitions for styles
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
