import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// Define your questions and the logic to determine the next question or result
const questions = [
  { question: '1. Was this a multiple pregnancy?', key: 'mp' },
  { question: '2. Was this a transverse or oblique lie?', key: 'lie' },
  { question: '3. Was this a breech pregnancy?', key: 'bp' },
  { question: '4. Was the gestational age <37 weeks?', key: 'ga' },
  { question: '5. Was this a multiparous woman?', key: 'mw' },
  { question: '6. Were there previous uterine scars?', key: 'us' },
  { question: '7. Was the labor induced or the cesarean section started before labor?', key: 'li' },
];

const HomeScreen = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState([]);

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [questions[currentQuestionIndex].key]: answer };
    setAnswers(newAnswers);

    // Determine the next question or compute the result based on the answers so far
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      computeResult(newAnswers);
    }
  };

  const computeResult = (answers) => {
    let groups = [];
    if (answers.mp === 'y') groups.push('8');
    if (answers.lie === 'y') groups.push('9');
    if (answers.bp === 'y') {
      groups.push(answers.mw === 'y' ? '7' : '6');
    }
    if (answers.ga === 'y') {
      groups.push('10');
      if (answers.mw === 'y') {
        groups.push(answers.us === 'y' ? '5' : (answers.li === 'y' ? '4' : '3'));
      } else {
        groups.push(answers.li === 'y' ? '2' : '1');
      }
    }
    setResult(groups);
    setCurrentQuestionIndex(0); // Reset for next quiz
  };

  const renderContent = () => {
    if (result.length > 0) {
      return (
        <View>
          <Text style={styles.text}>Result: {result.join(', ')}</Text>
          <Button title="Restart Quiz" onPress={() => {setResult([]); setAnswers({});}} />
        </View>
      );
    } else {
      return (
        <View>
        <Text style={styles.text}>{questions[currentQuestionIndex].question}</Text>
        <View style={styles.buttonsContainer}>
          <View style={styles.individualButton}>
            <Button title="Yes" onPress={() => handleAnswer('y')} />
          </View>
          <View style={styles.individualButton}>
            <Button title="No" onPress={() => handleAnswer('n')} />
          </View>
        </View>
      </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'center', 
    width: '100%', 
  },
  individualButton: {
    marginTop: 10,
    width: '80%',
    alignSelf: 'center',
  },
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