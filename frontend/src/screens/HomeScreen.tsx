import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';

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

const HomeScreen = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const { user, logoutFn } = useAuth();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => logoutFn()}
            title="Logout"
          />
        </View>
      ),
    });
  }, [navigation]);

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [questions[currentQuestionIndex].key]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      computeResult(newAnswers);
      setIsQuizFinished(true);
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

  const AnswerButton = ({ title, onPress }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <TouchableOpacity
        style={[
          styles.answerButton,
          isHovered && styles.answerButtonHover,
        ]}
        onPress={onPress}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const computeResult = (answers) => {
    let result = "";
    setError("");

    if (answers.mw === 'n' && answers.us === 'y') {
      setError("Invalid response: Nulliparous women cannot have previous uterine scars.");
      return;
    }

    if (answers.mw === 'y' && answers.us === 'n' && answers.cs === 'y') {
      setError("Invalid response: Multiparous women who had a cesarean should have previous uterine scars.");
      return;
    }

    if (answers.bp === 'y' && answers.lie === 'y') {
      setError("Invalid response: A fetus cannot be both in breech position and transverse/oblique lie.");
      return;
    }

    if (answers.mp === 'y') {
      result = '8';
    } else if (answers.lie === 'y') {
      result = '9';
    } else if (answers.bp === 'y') {
      result = (answers.mw === 'y' ? '7' : '6');
    } else if (answers.ga === 'y') {
      result = '10';
    } else if (answers.us === 'y') {
      result = '5';
    } else if (answers.mw === 'y') {
      result = (answers.li === 'y' ? '4' : '3');
    } else {
      result = (answers.li === 'y' ? '2' : '1');
    }

    if (!result) {
      setError("Your responses do not correspond to any valid classification. Please review your answers.");
    } else {
      setResult(result);
    }
  };

  const handleSubmitAndRestart = async () => {
    try {
      await axiosInstance.post('/survey/entries/', {
        classification: result || 'Invalid',
        csection: answers.cs === 'y'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`
        }
      });
    } catch (error) {
      console.error('Error submitting survey results:', error);
    }
    setResult("");
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsQuizFinished(false);
  };

  const handleDiscardAndRestart = () => {
    setResult("");
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsQuizFinished(false);
  };

  const renderContent = () => {
    if (isQuizFinished) {
      if (error) {
        return (
          <View style={styles.results}>
            <Text style={styles.text}>Error: {error}</Text>
            <Button title="Restart Quiz" onPress={() => {
              setError("");
              setAnswers({});
              setCurrentQuestionIndex(0);
              setIsQuizFinished(false);
            }} />
          </View>
        );
      } else if (result.length > 0) {
        return (
          <View style={styles.results}>
            <Text style={styles.text}>Result: {result}</Text>
            <Text style={styles.text}>Description: {robsonClassification[result]}</Text>
            <Button title="Restart Quiz and Submit Result" onPress={handleSubmitAndRestart} />
            <Button title="Restart Quiz and Discard Result" onPress={handleDiscardAndRestart} />
          </View>
        );
      } else {
        return (
          <View style={styles.results}>
            <Text style={styles.text}>Calculating result...</Text>
          </View>
        );
      }
    } else {
      return (
        <View>
          <Text style={styles.text}>{questions[currentQuestionIndex].question}</Text>
          <View style={styles.buttonsContainer}>
            <AnswerButton title="Yes" onPress={() => handleAnswer('y')} />
            <AnswerButton title="No" onPress={() => handleAnswer('n')} />
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    marginBottom: 20,
    fontSize: 25,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  buttonContainer: {
    marginRight: 10,
  },
  answerButton: {
    borderColor: '#A9A9A9',
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  answerButtonHover: {
    backgroundColor: 'lightblue',
  },
  buttonText: {
    color: '#A9A9A9',
    textAlign: 'center',
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
  },
});


export default HomeScreen;
