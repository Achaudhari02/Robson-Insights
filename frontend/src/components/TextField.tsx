import React from 'react';
import { Input, Stack, Label, Text } from 'tamagui';

const TextField = ({ label, value, onChangeText, placeholder, secureTextEntry = false, helperText = "" }) => {
  return (
    <Stack width="100%" space="$2">
      <Label>{label}</Label>
      <Input
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
      {helperText && (
        <Text fontSize="$2" color="$gray10">
          {helperText}
        </Text>
      )}
    </Stack>
  );
};

export default TextField;
