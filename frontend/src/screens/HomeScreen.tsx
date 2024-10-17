import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const questions = [
  { question: 'Was this a multiple pregnancy?', key: 'mp' },
  { question: 'Was this a transverse or oblique lie?', key: 'lie' },
  { question: 'Was this a breech pregnancy?', key: 'bp' },
  { question: 'Was the gestational age <37 weeks?', key: 'ga' },
  { question: 'Was this a multiparous woman?', key: 'mw' },
  { question: 'Were there previous uterine scars?', key: 'us' },
  { question: 'Was the labor induced or the cesarean section started before labor?', key: 'li' },
  { question: 'Was this a cesarean section?', key: 'cs' }, 
];

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

  const handleExport = () => {
    const header = 'Question,Answer';
    const rows = questions.map(q => {
      const answer = answers[q.key] === 'y'; 
      return `${q.question},${answer}`; 
    });
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'questions_answers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <View style={styles.results}>
          <Text style={styles.text}>Result: {result}</Text>
          <Button title="Restart Quiz" onPress={() => {setResult(""); setAnswers({}); setCurrentQuestionIndex(0);}} />
          <Button title="Download Results" onPress={() => handleExport()} />
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
  results: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
});

export default HomeScreen;