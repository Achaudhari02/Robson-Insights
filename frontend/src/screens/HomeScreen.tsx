import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import React, { useState } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';

// Define the type for answers
interface Answers {
  multiple_pregnancy?: string;
  fetal_presentation?: string;
  gestational_age?: string;
  parity?: string;
  previous_cesarean?: string;
  num_previous_cesarean?: string;
  onset_of_labor?: string;
  csection?: string;
}

const questions = [
  {
    question: 'Is this a multiple pregnancy (e.g., twins or triplets)?',
    key: 'multiple_pregnancy',
    type: 'multiple_pregnancy',
    options: ['Yes', 'No'],
  },
  {
    question: 'What is the fetal lie and presentation?',
    key: 'fetal_presentation',
    type: 'fetal_presentation',
    options: ['Cephalic', 'Breech', 'Transverse or oblique'],
  },
  {
    question: 'What is the gestational age?',
    key: 'gestational_age',
    type: 'gestational_age',
    options: ['37 weeks or more', 'Less than 37 weeks'],
  },
  {
    question: 'Is the woman multiparous (has given birth before)?',
    key: 'parity',
    type: 'parity',
    options: ['Multiparous', 'Nulliparous'],
  },
  {
    question: 'Has the woman had any previous cesarean sections?',
    key: 'previous_cesarean',
    type: 'previous_cesarean',
    options: ['Yes', 'No'],
  },
  {
    question: 'How many previous cesarean sections has the woman had?',
    key: 'num_previous_cesarean',
    type: 'num_previous_cesarean',
    options: ['One', 'More than one'],
  },
  {
    question: 'What was the onset of labor?',
    key: 'onset_of_labor',
    type: 'onset_of_labor',
    options: ['Spontaneous labor', 'Induced labor or pre-labor cesarean section'],
  },
  {
    question: 'Did the pregnancy result in a cesarean section?',
    key: 'csection',
    type: 'csection',
    options: ['Yes', 'No'],
  },
];

const robsonClassification = {
  '1': 'Nulliparous women with a term, single, cephalic pregnancy in spontaneous labor.',
  '2': 'Nulliparous women with a term, single, cephalic pregnancy in induced labor or pre-labor cesarean.',
  '3': 'Multiparous women without previous cesarean, with a term, single, cephalic pregnancy in spontaneous labor.',
  '4': 'Multiparous women without previous cesarean, with a term, single, cephalic pregnancy in induced labor or pre-labor cesarean.',
  '5.1': 'Multiparous women with one previous cesarean and a term, single, cephalic pregnancy.',
  '5.2': 'Multiparous women with more than one previous cesarean and a term, single, cephalic pregnancy.',
  '6': 'Nulliparous women with a single, breech pregnancy.',
  '7': 'Multiparous women with a single, breech pregnancy.',
  '8': 'Women with multiple pregnancies (twins, triplets, etc.).',
  '9': 'Women with a single pregnancy in a transverse or oblique lie.',
  '10': 'Women with a preterm, single, cephalic pregnancy.',
};

const HomeScreen = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const { user } = useAuth();

  const handleAnswer = (answer: string) => {
    const newAnswers: Answers = { ...answers, [questions[currentQuestionIndex].key]: answer };
    setAnswers(newAnswers);

    const currentQuestionType = questions[currentQuestionIndex].type;

    if (currentQuestionType === 'multiple_pregnancy') {
      if (answer === 'Yes') {
        // Multiple pregnancy -> Group 8
        setResult('8');
        // Proceed to the final question
        const finalQuestionIndex = questions.findIndex((q) => q.type === 'csection');
        setCurrentQuestionIndex(finalQuestionIndex);
      } else {
        // Singleton -> Proceed to Question 2
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } else if (currentQuestionType === 'fetal_presentation') {
      if (answer === 'Breech') {
        // Skip to Question 4 (Parity)
        const question4Index = questions.findIndex((q) => q.type === 'parity');
        setCurrentQuestionIndex(question4Index);
      } else if (answer === 'Cephalic') {
        // Proceed to Question 3 (Gestational Age)
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (answer === 'Transverse or oblique') {
        // Transverse lie -> Group 9
        setResult('9');
        // Proceed to the final question
        const finalQuestionIndex = questions.findIndex((q) => q.type === 'csection');
        setCurrentQuestionIndex(finalQuestionIndex);
      }
    } else if (currentQuestionType === 'gestational_age') {
      if (answer === '37 weeks or more') {
        // Proceed to Question 4 (Parity)
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (answer === 'Less than 37 weeks') {
        // Group 10
        setResult('10');
        // Proceed to the final question
        const finalQuestionIndex = questions.findIndex((q) => q.type === 'csection');
        setCurrentQuestionIndex(finalQuestionIndex);
      }
    } else if (currentQuestionType === 'parity') {
      const presentation = newAnswers['fetal_presentation'];
      if (presentation === 'Breech') {
        if (answer === 'Multiparous') {
          // Group 7
          setResult('7');
          // Proceed to the final question
          const finalQuestionIndex = questions.findIndex((q) => q.type === 'csection');
          setCurrentQuestionIndex(finalQuestionIndex);
        } else if (answer === 'Nulliparous') {
          // Group 6
          setResult('6');
          // Proceed to the final question
          const finalQuestionIndex = questions.findIndex((q) => q.type === 'csection');
          setCurrentQuestionIndex(finalQuestionIndex);
        }
      } else if (presentation === 'Cephalic') {
        if (answer === 'Multiparous') {
          // Proceed to Question 5 (Previous Cesarean)
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (answer === 'Nulliparous') {
          // Skip to Question 7 (Onset of labor)
          const question7Index = questions.findIndex((q) => q.type === 'onset_of_labor');
          setCurrentQuestionIndex(question7Index);
        }
      }
    } else if (currentQuestionType === 'previous_cesarean') {
      if (answer === 'Yes') {
        // Proceed to Question 6 (Number of previous CS)
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (answer === 'No') {
        // Skip to Question 7 (Onset of labor)
        const question7Index = questions.findIndex((q) => q.type === 'onset_of_labor');
        setCurrentQuestionIndex(question7Index);
      }
    } else if (currentQuestionType === 'num_previous_cesarean') {
      if (answer === 'One') {
        // Group 5.1
        setResult('5.1');
      } else if (answer === 'More than one') {
        // Group 5.2
        setResult('5.2');
      }
      // Proceed to the final question
      const finalQuestionIndex = questions.findIndex((q) => q.type === 'csection');
      setCurrentQuestionIndex(finalQuestionIndex);
    } else if (currentQuestionType === 'onset_of_labor') {
      const parity = newAnswers['parity'];
      if (parity === 'Multiparous') {
        if (answer === 'Spontaneous labor') {
          // Group 3
          setResult('3');
        } else {
          // Group 4
          setResult('4');
        }
      } else if (parity === 'Nulliparous') {
        if (answer === 'Spontaneous labor') {
          // Group 1
          setResult('1');
        } else {
          // Group 2
          setResult('2');
        }
      }
      // Proceed to the final question
      const finalQuestionIndex = questions.findIndex((q) => q.type === 'csection');
      setCurrentQuestionIndex(finalQuestionIndex);
    } else if (currentQuestionType === 'csection') {
      // Store the answer
      setAnswers(newAnswers);
      // Quiz is finished
      setIsQuizFinished(true);
    }
  };

  const AnswerButton = ({ title, onPress }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <TouchableOpacity
        style={[styles.answerButton, isHovered && styles.answerButtonHover]}
        onPress={onPress}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const handleSubmitAndRestart = async () => {
    try {
      await axiosInstance.post(
        '/survey/entries/',
        {
          classification: result || 'Invalid',
          csection: answers.csection === 'Yes',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${user.token}`,
          },
        }
      );
    } catch (error) {
      console.error('Error submitting survey results:', error);
    }
    setResult('');
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsQuizFinished(false);
  };

  const handleDiscardAndRestart = () => {
    setResult('');
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
            <Button
              title="Restart Quiz"
              onPress={() => {
                setError('');
                setAnswers({});
                setCurrentQuestionIndex(0);
                setIsQuizFinished(false);
              }}
            />
          </View>
        );
      } else if (result.length > 0) {
        return (
          <View style={styles.results}>
            <Text style={styles.text}>Result: Group {result}</Text>
            <Text style={styles.text}>Description: {robsonClassification[result]}</Text>
            <Text style={styles.text}>
              Pregnancy resulted in cesarean section: {answers.csection}
            </Text>
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
      const currentQuestion = questions[currentQuestionIndex];
      return (
        <View>
          <Text style={styles.text}>{currentQuestion.question}</Text>
          <View style={styles.buttonsContainer}>
            {currentQuestion.options.map((option) => (
              <AnswerButton key={option} title={option} onPress={() => handleAnswer(option)} />
            ))}
          </View>
        </View>
      );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  text: {
    marginBottom: 20,
    fontSize: 22,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
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
    fontSize: 18,
  },
  results: {
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
  },
});

export default HomeScreen;
