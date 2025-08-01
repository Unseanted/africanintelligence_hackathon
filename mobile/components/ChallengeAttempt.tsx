import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { 
  Text, 
  Button, 
  TextInput, 
  RadioButton, 
  Checkbox, 
  Card, 
  IconButton,
  Chip,
  ProgressBar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../app/contexts/ThemeContext';

// Type definitions
interface Question {
  text: string;
  options?: string[];
  multiple?: boolean;
  type?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  submissionType: 'text' | 'quiz' | 'timed-quiz' | 'video' | 'image';
  timeLimit?: number;
  questions?: Question[];
}

interface Submission {
  type: string;
  answers?: Record<number, string | string[]>;
  text?: string;
  submittedAt: number;
  timeSpent?: number;
}

interface ChallengeAttemptProps {
  challenge: Challenge;
  onClose: () => void;
  onSubmit: (challengeId: string, submission: Submission) => Promise<void>;
}

type SubmissionType = 'text' | 'quiz' | 'timed-quiz' | 'video' | 'image';

export default function ChallengeAttempt({ challenge, onClose, onSubmit }: ChallengeAttemptProps) {
  const { colors } = useTheme();
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [textSubmission, setTextSubmission] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isTimedQuiz = challenge.submissionType === 'timed-quiz';
  const hasQuestions = challenge.questions && challenge.questions.length > 0;
  const isQuizType = challenge.submissionType === 'quiz' || challenge.submissionType === 'timed-quiz';

  const handleAutoSubmit = useCallback(() => {
    Alert.alert(
      "Time's Up!",
      "Your submission will be automatically submitted.",
      [{ text: "OK", onPress: handleSubmit }]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateAnswers()) {
      Alert.alert(
        "Incomplete Submission",
        isQuizType ? "Please answer all questions before submitting." : "Please provide your submission text."
      );
      return;
    }

    setIsSubmitting(true);
    
    const submission: Submission = {
      type: challenge.submissionType,
      answers: isQuizType ? answers : undefined,
      text: !isQuizType ? textSubmission : undefined,
      submittedAt: Date.now(),
      timeSpent: isTimedQuiz ? (challenge.timeLimit ? challenge.timeLimit * 60 - (timeLeft || 0) : undefined) : undefined
    };

    try {
      await onSubmit(challenge.id, submission);
    } catch (error) {
      setIsSubmitting(false);
    }
  }, [answers, textSubmission, timeLeft, isQuizType, isTimedQuiz, challenge, onSubmit]);

  useEffect(() => {
    if (isTimedQuiz && challenge.timeLimit) {
      setTimeLeft(challenge.timeLimit * 60); // Convert minutes to seconds
    }
  }, [isTimedQuiz, challenge.timeLimit]);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
  
    if (timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft, handleAutoSubmit]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionIndex: number, answer: string): void => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleMultipleAnswerChange = (questionIndex: number, option: string, checked: boolean): void => {
    setAnswers(prev => {
      const currentAnswers = (prev[questionIndex] as string[]) || [];
      if (checked) {
        return {
          ...prev,
          [questionIndex]: [...currentAnswers, option]
        };
      } else {
        return {
          ...prev,
          [questionIndex]: currentAnswers.filter(a => a !== option)
        };
      }
    });
  };

  const validateAnswers = (): boolean => {
    if (!isQuizType) {
      return textSubmission.trim().length > 0;
    }

    if (!hasQuestions || !challenge.questions) return true;

    for (let i = 0; i < challenge.questions.length; i++) {
      if (!answers[i] || (Array.isArray(answers[i]) && (answers[i] as string[]).length === 0)) {
        return false;
      }
    }
    return true;
  };

  const getSubmissionIcon = (submissionType: SubmissionType): string => {
    const iconMap: Record<SubmissionType, string> = {
      text: 'text-box',
      video: 'video',
      image: 'image',
      quiz: 'help-circle',
      'timed-quiz': 'timer'
    };
    return iconMap[submissionType] || 'file-document';
  };

  const renderQuestion = (question: Question, index: number): React.ReactNode => {
    const isCurrentQuestion = !isTimedQuiz || index === currentQuestionIndex;
    
    if (!isCurrentQuestion) return null;

    return (
      <Card key={index} style={[styles.questionCard, { backgroundColor: colors.surface }]} mode="outlined">
        <Card.Content>
          <Text style={[styles.questionNumber, { color: colors.primary }]}>
            Question {index + 1} of {challenge.questions?.length || 0}
          </Text>
          <Text style={[styles.questionText, { color: colors.onSurface }]}>
            {question.text}
          </Text>

          {question.options ? (
            <View style={styles.optionsContainer}>
              {question.options.map((option, optionIndex) => (
                <View key={optionIndex} style={styles.option}>
                  {question.multiple ? (
                    <View style={styles.checkboxContainer}>
                      <Checkbox
                        status={
                          ((answers[index] as string[]) || []).includes(option) ? 'checked' : 'unchecked'
                        }
                        onPress={() => 
                          handleMultipleAnswerChange(
                            index, 
                            option, 
                            !((answers[index] as string[]) || []).includes(option)
                          )
                        }
                        color={colors.primary}
                      />
                      <Text style={[styles.optionText, { color: colors.onSurface }]}>
                        {option}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.radioContainer}>
                      <RadioButton
                        value={option}
                        status={answers[index] === option ? 'checked' : 'unchecked'}
                        onPress={() => handleAnswerChange(index, option)}
                        color={colors.primary}
                      />
                      <Text style={[styles.optionText, { color: colors.onSurface }]}>
                        {option}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={4}
              value={(answers[index] as string) || ''}
              onChangeText={(text: string) => handleAnswerChange(index, text)}
              placeholder="Enter your answer here..."
              style={styles.textInput}
            />
          )}
        </Card.Content>
      </Card>
    );
  };

  const canGoNext = (): boolean => {
    return challenge.questions ? currentQuestionIndex < challenge.questions.length - 1 : false;
  };

  const canGoPrevious = (): boolean => {
    return currentQuestionIndex > 0;
  };

  const progress = hasQuestions && challenge.questions ? (currentQuestionIndex + 1) / challenge.questions.length : 1;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {challenge.title}
          </Text>
          <IconButton 
            icon="close" 
            size={24} 
            onPress={onClose}
            iconColor={colors.onSurface}
          />
        </View>
        
        {/* Timer for timed quizzes */}
        {isTimedQuiz && timeLeft !== null && (
          <Card style={[styles.timerCard, { backgroundColor: colors.errorContainer }]} mode="outlined">
            <Card.Content style={styles.timerContent}>
              <MaterialCommunityIcons name="timer" size={20} color={colors.onErrorContainer} />
              <Text style={[styles.timerText, { color: colors.onErrorContainer }]}>
                {formatTime(timeLeft)}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Progress bar */}
        {hasQuestions && challenge.questions && (
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progress} 
              color={colors.primary}
              style={[styles.progressBar, { backgroundColor: `${colors.primary}20` }]}
            />
            <Text style={[styles.progressText, { color: colors.onSurfaceVariant }]}>
              {isTimedQuiz ? `Question ${currentQuestionIndex + 1} of ${challenge.questions.length}` 
                          : `Progress: ${Math.round(progress * 100)}%`}
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Challenge Description */}
        <Card style={[styles.descriptionCard, { backgroundColor: colors.surfaceVariant }]} mode="outlined">
          <Card.Content>
            <Text style={[styles.instructionTitle, { color: colors.onSurface }]}>
              Challenge Instructions
            </Text>
            <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
              {challenge.description}
            </Text>
            <View style={styles.submissionInfo}>
              <Chip
                mode="outlined"
                icon={getSubmissionIcon(challenge.submissionType)}
                style={{ borderColor: colors.primary }}
                textStyle={{ color: colors.primary }}
              >
                {challenge.submissionType?.replace('-', ' ').toUpperCase()}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Questions or Text Input */}
        {isQuizType && hasQuestions && challenge.questions ? (
          <>
            {challenge.questions.map((question, index) => renderQuestion(question, index))}
            
            {isTimedQuiz && (
              <View style={styles.navigationButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={!canGoPrevious()}
                  style={styles.navButton}
                >
                  Previous
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    if (canGoNext()) {
                      setCurrentQuestionIndex(prev => prev + 1);
                    }
                  }}
                  disabled={!canGoNext()}
                  style={styles.navButton}
                >
                  Next
                </Button>
              </View>
            )}
          </>
        ) : (
          <Card style={[styles.textSubmissionCard, { backgroundColor: colors.surface }]} mode="outlined">
            <Card.Content>
              <Text style={[styles.submissionTitle, { color: colors.onSurface }]}>
                Your Submission
              </Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={8}
                value={textSubmission}
                onChangeText={setTextSubmission}
                placeholder="Share your approach, learnings, or solution here..."
                style={styles.textSubmissionInput}
              />
              <Text style={[styles.charCount, { color: colors.onSurfaceVariant }]}>
                {textSubmission.length} characters
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!validateAnswers() || isSubmitting}
          loading={isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Challenge'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: '95%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  timerCard: {
    marginBottom: 16,
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  descriptionCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  submissionInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  questionCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 16,
  },
  optionsContainer: {
    marginTop: 8,
  },
  option: {
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 15,
    marginLeft: 8,
    flex: 1,
  },
  textInput: {
    marginTop: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  textSubmissionCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  textSubmissionInput: {
    minHeight: 150,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    borderRadius: 8,
  },
});