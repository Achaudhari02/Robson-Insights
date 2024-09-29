import React, { useState } from 'react';
import { Input, Stack, Label, Text } from 'tamagui';

export const TextField = ({ label = "", value, onChangeText, placeholder, secureTextEntry = false, helperText = "" }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Stack width="100%" gap="$2">
      <Label>{label}</Label>
      <Stack position="relative">
        {isFocused || value ? (
          <Text
            position="absolute"
            top={-10}
            left={10}
            fontSize={12}
            color="gray"
            backgroundColor="$background"
            paddingHorizontal={4}
          >
            {placeholder}
          </Text>
        ) : null}
        <Input
          paddingHorizontal="$4"
          paddingVertical="$6"
          value={value}
          placeholder={isFocused ? "" : placeholder}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          borderColor="#E2E8F0"
          borderWidth="$1"
          background="white"
          style={{ fontSize: 16 }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </Stack>
      {helperText && (
        <Text fontSize="$3" color="$red10">
          {helperText}
        </Text>
      )}
    </Stack>
  );
};

