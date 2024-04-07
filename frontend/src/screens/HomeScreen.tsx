import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = () => {
  const handlePress = () => {
    // Navigate to the quiz screen or handle the button press
    console.log('Navigate to the quiz');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Are you ready for your quiz?</Text>
      <Button title="Start Quiz" onPress={handlePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginBottom: 20,
    fontSize: 18,
  },
});

export default HomeScreen;