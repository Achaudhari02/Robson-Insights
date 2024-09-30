import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';
import { Input, Stack, Label, Text } from 'tamagui';

export const TextField = ({ label = "", value, onChangeText, placeholder, secureTextEntry = false, helperText = "" }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { setError } = useAuth();

  const handleChangeText = (text) => {
    onChangeText(text);
    if (setError) setError(null);
  };

  return (
    <Stack width="100%" gap="$2">
      <Label>{label}</Label>
      <Stack position="relative">
        {isFocused || value ? (
          <Stack
            position="absolute"
            top={-10}
            left={10}
            backgroundColor="$background"
            paddingHorizontal={4}
          >
            <Text fontSize={12} color="gray">
              {placeholder}
            </Text>
          </Stack>
        ) : null}
        <Input
          paddingHorizontal="$4"
          paddingVertical="$6"
          value={value}
          placeholder={isFocused ? "" : placeholder}
          onChangeText={handleChangeText}
          secureTextEntry={secureTextEntry}
          borderColor="#E2E8F0"
          borderWidth="$1"
          background="white"
          style={{ fontSize: 16 }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </Stack>
      {helperText ? (
        <Stack>
          <Text fontSize="$3" color="$red10">
            {helperText}
          </Text>
        </Stack>
      ) : null}
    </Stack>
  );
};