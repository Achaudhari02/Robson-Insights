import React, { useState } from 'react';
import { Button, Text, YStack, Theme } from 'tamagui';
import TextField from '@/components/TextField';

const SignUpScreen = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Theme name="light">
      <YStack f={1} padding="$4" justifyContent="center" alignItems="center">
        <Text fontSize="$8" marginBottom="$4">Sign up</Text>

        <YStack width="100%" space="$4">
          <TextField
            label="First name"
            value={formData.firstName}
            onChangeText={(text) => handleInputChange('firstName', text)}
            placeholder="First name"
          />
          <TextField
            label="Last name"
            value={formData.lastName}
            onChangeText={(text) => handleInputChange('lastName', text)}
            placeholder="Last name"
            helperText="Make sure it matches the name on your government ID."
          />
          <TextField
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            placeholder="Email"
            helperText="Ensure this is the email used at work."
          />
          <TextField
            label="Password"
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            placeholder="Password"
            secureTextEntry={true}
          />
        </YStack>

        <YStack marginTop="$4" alignItems="center">
          <Text fontSize="$2" color="$gray10" textAlign="center">
            By selecting Agree and continue, I agree to Dynamic Layers{' '}
            <Text color="$blue9" textDecorationLine="underline">
              Terms of Service
            </Text>
            ,{' '}
            <Text color="$blue9" textDecorationLine="underline">
              Payments Terms of Service
            </Text>{' '}
            and acknowledge the{' '}
            <Text color="$blue9" textDecorationLine="underline">
              Privacy Policy
            </Text>
            .
          </Text>
        </YStack>

        <Button
          marginTop="$6"
          disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.password}
          onPress={() => console.log('Sign up')}
        >
          Agree and continue
        </Button>
      </YStack>
    </Theme>
  );
};

export default SignUpScreen;
