import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const questions = [
  { question: 'Was this a multiple pregnancy? (twins, triplets, etc.)', key: 'mp' },
  { question: 'Was this a transverse or oblique lie?', key: 'lie' },
  { question: 'Was this a breech pregnancy?', key: 'bp' },
  { question: 'Was the gestational age <37 weeks?', key: 'ga' },
  { question: 'Was this a multiparous woman?', key: 'mw' },
  { question: 'Were there previous uterine scars?', key: 'us' },
  { question: 'Was the labor induced or the cesarean section started before labor?', key: 'li' },
  { question: 'Was this a cesarean section?', key: 'cs' },
];

const robsonClassification = {
  1: "Nulliparous women with a term, single, cephalic pregnancy in spontaneous labor.",
  2: "Nulliparous women with a term, single, cephalic pregnancy in induced labor or pre-labor cesarean.",
  3: "Multiparous women without previous cesarean, with a term, single, cephalic pregnancy in spontaneous labor.",
  4: "Multiparous women without previous cesarean, with a term, single, cephalic pregnancy in induced labor or pre-labor cesarean.",
  5: "Multiparous women with at least one previous cesarean and a term, single, cephalic pregnancy.",
  6: "Nulliparous women with a single, breech pregnancy.",
  7: "Multiparous women with a single, breech pregnancy.",
  8: "Women with multiple pregnancies (twins, triplets, etc.).",
  9: "Women with a single pregnancy in a transverse or oblique lie.",
  10: "Women with a preterm, single, cephalic pregnancy."
};
const HomeScreen = ({ navigation}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState("");
  const {user, logoutFn} = useAuth();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => logoutFn()}
          title="Logout"
        />
      ),
    });
  }, [navigation]);


  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [questions[currentQuestionIndex].key]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 2) {
      computeResult(newAnswers, true).then((tempResult) => {
        if (tempResult) {
          setCurrentQuestionIndex(questions.length - 1);
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      });
    } else {
      computeResult(newAnswers, false);
    }
  };

  const computeResult = async (answers, isEarlyComputation) => {
    let result = "";
    if (answers.mp === 'y') result = '8';
    if (answers.lie === 'y') result = '9';
    if (answers.bp === 'y') {
      result = (answers.mw === 'y' ? '7' : '6');
    }
    if (answers.ga === 'y') {
      result = '10';
      if (answers.mw === 'y') {
        result = (answers.us === 'y' ? '5' : (answers.li === 'y' ? '4' : '3'));
      } else {
        result = (answers.li === 'y' ? '2' : '1');
      }
    }

    if (isEarlyComputation) {
      return result;
    } else {
      setResult(result);
      setCurrentQuestionIndex(0);

      try {
          await axiosInstance.post('/survey/entries/', {
            classification: result,
            csection: answers.cs === 'y'
          }, {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${user.token}`
          }});
      } catch (error) {
        console.error('Error submitting survey results:', error);
      }
    }
  };

  const renderContent = () => {
    if (result.length > 0) {
      return (
        <View>
          <Text style={styles.text}>Result: {result}</Text>
          <Text style={styles.text}>Description: {robsonClassification[result]}</Text>
          <Button title="Restart Quiz" onPress={() => {setResult(""); setAnswers({}); setCurrentQuestionIndex(0);}} />
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
    backgroundColor: 'white',
  },
  text: {
    marginBottom: 20,
    fontSize: 18,
  },
});

export default HomeScreen;