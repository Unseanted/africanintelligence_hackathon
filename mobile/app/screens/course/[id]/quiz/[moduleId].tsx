import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, Button, RadioButton, TextInput } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY } from '../constants/colors';

export default function QuizScreen() {
  const { id, moduleId } = useLocalSearchParams();
  const { apiCall } = useTourLMS();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await apiCall(`/courses/${id}/modules/${moduleId}/quiz`);
        setQuiz(data.quiz);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        Alert.alert('Error', 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, moduleId, apiCall]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    try {
      setSubmitting(true);
      const result = await apiCall(`/courses/${id}/modules/${moduleId}/quiz`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      });

      Alert.alert(
        'Quiz Submitted',
        `You scored ${result.score} out of ${quiz.questions.length}`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Quiz not found</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{quiz.title}</Text>
      <Text style={styles.description}>{quiz.description}</Text>

      {quiz.questions.map((question, index) => (
        <View key={question._id} style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {index + 1}. {question.text}
          </Text>

          {question.type === 'multiple_choice' && (
            <RadioButton.Group
              onValueChange={value => handleAnswerChange(question._id, value)}
              value={answers[question._id] || ''}
            >
              {question.options.map(option => (
                <View key={option.value} style={styles.optionContainer}>
                  <RadioButton value={option.value} />
                  <Text style={styles.optionText}>{option.text}</Text>
                </View>
              ))}
            </RadioButton.Group>
          )}

          {question.type === 'text' && (
            <TextInput
              mode="outlined"
              placeholder="Your answer"
              value={answers[question._id] || ''}
              onChangeText={text => handleAnswerChange(question._id, text)}
              style={styles.textAnswer}
            />
          )}
        </View>
      ))}

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        loading={submitting}
        disabled={submitting || Object.keys(answers).length < quiz.questions.length}
      >
        Submit Quiz
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    padding: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    color: TEXT_PRIMARY,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: TEXT_PRIMARY,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    color: TEXT_PRIMARY,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: TEXT_PRIMARY,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 8,
    color: TEXT_PRIMARY,
  },
  textAnswer: {
    marginTop: 8,
    backgroundColor: BACKGROUND,
  },
  submitButton: {
    marginVertical: 24,
    borderRadius: 8,
  },
});