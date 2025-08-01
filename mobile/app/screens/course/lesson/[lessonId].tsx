import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text as RNText
} from 'react-native';
import {
  Button,
  Card,
  Chip,
  ProgressBar,
  Surface,
  Text,
  Title
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
import { useTheme } from '../../../../app/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Types
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  submissionFormat: string;
  dueDate: string;
}

interface LessonContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'quiz' | 'assignment';
  duration: string;
  moduleId: string;
  courseId: string;
  
  // Video content
  videoUrl?: string;
  videoTranscript?: string;
  
  // Quiz content
  questions?: Question[];
  passingScore?: number;
  
  // Assignment content
  assignment?: Assignment;
  
  // Learning objectives
  objectives: string[];
  keyPoints: string[];
  resources: {
    title: string;
    url: string;
    type: 'pdf' | 'link' | 'download';
  }[];
}

type RootStackParamList = {
  CourseDetails: { courseId: string };
  Lesson: { courseId: string; lessonId: string };
  Home: undefined;
};

type LessonDetailsRouteProp = RouteProp<RootStackParamList, 'Lesson'>;
type LessonDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lesson'>;

// Dummy lesson data
const getDummyLessonContent = (lessonId: string, courseId: string): LessonContent => {
  const lessonMap: { [key: string]: Partial<LessonContent> } = {
    'lesson-1-1': {
      title: 'Introduction to React Native',
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoTranscript: 'This is a sample video transcript for the React Native introduction lesson...',
      objectives: [
        'Understand what React Native is and its core concepts',
        'Learn the advantages of React Native development',
        'Explore the React Native ecosystem'
      ],
      keyPoints: [
        'React Native allows you to build mobile apps using React',
        'Code once, run on both iOS and Android',
        'Uses native components for better performance',
        'Large community and ecosystem support'
      ]
    },
    'lesson-2-3': {
      title: 'Layout and Flexbox',
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      objectives: [
        'Master Flexbox layout in React Native',
        'Implement responsive designs',
        'Handle different screen sizes'
      ],
      keyPoints: [
        'Flexbox is the primary layout system in React Native',
        'Use flexDirection to control layout direction',
        'JustifyContent and alignItems for positioning',
        'Flex property for sizing components'
      ]
    },
    'lesson-1-3': {
      title: 'Your First App Quiz',
      type: 'quiz',
      passingScore: 80,
      questions: [
        {
          id: 'q1',
          question: 'What command is used to create a new React Native project?',
          options: [
            'react-native init ProjectName',
            'npx react-native init ProjectName', 
            'create-react-native-app ProjectName',
            'expo init ProjectName'
          ],
          correctAnswer: 1,
          explanation: 'The correct command is "npx react-native init ProjectName" which creates a new React Native project with the latest template.'
        },
        {
          id: 'q2',
          question: 'Which component is used to display text in React Native?',
          options: ['<Text>', '<Label>', '<TextView>', '<TextComponent>'],
          correctAnswer: 0,
          explanation: 'The <Text> component is the fundamental component for displaying text in React Native applications.'
        },
        {
          id: 'q3',
          question: 'What is JSX in React Native?',
          options: [
            'A JavaScript library',
            'A syntax extension for JavaScript',
            'A mobile framework',
            'A testing tool'
          ],
          correctAnswer: 1,
          explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.'
        }
      ],
      objectives: [
        'Test your understanding of React Native basics',
        'Verify knowledge of core components',
        'Assess setup and initialization concepts'
      ],
      keyPoints: [
        'React Native CLI vs Expo CLI',
        'Core components: View, Text, Image',
        'JSX syntax and rules',
        'Project structure understanding'
      ]
    },
    'lesson-2-4': {
      title: 'Component Styling Assignment',
      type: 'assignment',
      assignment: {
        id: 'assignment-1',
        title: 'Build a Profile Card Component',
        description: 'Create a reusable profile card component with proper styling using StyleSheet and Flexbox.',
        requirements: [
          'Create a ProfileCard component that accepts props for name, title, avatar, and bio',
          'Use StyleSheet for all styling (no inline styles)',
          'Implement proper Flexbox layout',
          'Make the component responsive for different screen sizes',
          'Add proper spacing, colors, and typography',
          'Include a follow/unfollow button with state management'
        ],
        submissionFormat: 'Submit your ProfileCard.js file and a screenshot of the rendered component',
        dueDate: '2024-02-15'
      },
      objectives: [
        'Apply styling concepts learned in previous lessons',
        'Practice component composition and props',
        'Implement responsive design principles',
        'Use proper React Native styling patterns'
      ],
      keyPoints: [
        'StyleSheet.create() for performance',
        'Flexbox for layout management',
        'Responsive design techniques',
        'Component reusability patterns'
      ]
    }
  };

  const baseContent: LessonContent = {
    id: lessonId,
    title: 'Sample Lesson',
    description: 'This is a sample lesson description that explains what students will learn in this lesson.',
    type: 'video',
    duration: '15 min',
    moduleId: 'module-1',
    courseId: courseId,
    objectives: ['Sample objective'],
    keyPoints: ['Sample key point'],
    resources: [
      {
        title: 'React Native Documentation',
        url: 'https://reactnative.dev/docs/getting-started',
        type: 'link'
      },
      {
        title: 'Lesson Notes PDF',
        url: '#',
        type: 'pdf'
      }
    ]
  };

  return { ...baseContent, ...lessonMap[lessonId] } as LessonContent;
};

// Components
const VideoPlayer = ({ videoUrl, onProgress }: { videoUrl: string; onProgress: (progress: number) => void }) => {
  const [videoStatus, setVideoStatus] = useState<any>({});
  
  return (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: videoUrl }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        shouldPlay={false}
        onPlaybackStatusUpdate={(status) => {
          setVideoStatus(status);
          if (status.isLoaded && status.durationMillis) {
            const progress = (status.positionMillis || 0) / status.durationMillis;
            onProgress(progress);
          }
        }}
      />
    </View>
  );
};

const QuizContent = ({ 
  questions, 
  passingScore, 
  onComplete 
}: { 
  questions: Question[]; 
  passingScore: number; 
  onComplete: (score: number) => void;
}) => {
  const { colors } = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      const correctAnswers = questions.reduce((acc, question, index) => {
        return selectedAnswers[index] === question.correctAnswer ? acc + 1 : acc;
      }, 0);
      const finalScore = (correctAnswers / questions.length) * 100;
      setScore(finalScore);
      setShowResults(true);
      onComplete(finalScore);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showResults) {
    const passed = score >= passingScore;
    return (
      <View style={styles.quizResults}>
        <MaterialCommunityIcons 
          name={passed ? "check-circle" : "close-circle"} 
          size={64} 
          color={passed ? colors.success : colors.error} 
        />
        <Title style={[styles.resultTitle, { color: colors.text }]}>
          {passed ? 'Congratulations!' : 'Try Again'}
        </Title>
        <Text style={[styles.scoreText, { color: colors.text }]}>
          Your Score: {score.toFixed(0)}%
        </Text>
        <Text style={[styles.passingText, { color: colors.textSecondary }]}>
          Passing Score: {passingScore}%
        </Text>
        {!passed && (
          <Button 
            mode="contained" 
            onPress={() => {
              setCurrentQuestion(0);
              setSelectedAnswers([]);
              setShowResults(false);
              setScore(0);
            }}
            style={styles.retryButton}
          >
            Retry Quiz
          </Button>
        )}
      </View>
    );
  }

  const question = questions[currentQuestion];
  const progress = (currentQuestion + 1) / questions.length;

  return (
    <View style={styles.quizContainer}>
      <View style={styles.quizProgress}>
        <Text style={[styles.progressText, { color: colors.text }]}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
        <ProgressBar progress={progress} color={colors.primary} style={styles.progressBar} />
      </View>

      <Card style={[styles.questionCard, { backgroundColor: colors.cardBackground }]}>
        <Card.Content>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {question.question}
          </Text>
          
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                { 
                  backgroundColor: selectedAnswers[currentQuestion] === index 
                    ? colors.primary 
                    : colors.surface,
                  borderColor: colors.primary
                }
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <Text style={[
                styles.optionText,
                { 
                  color: selectedAnswers[currentQuestion] === index 
                    ? 'white' 
                    : colors.text 
                }
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      <View style={styles.quizNavigation}>
        <Button 
          mode="outlined" 
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <Button 
          mode="contained" 
          onPress={handleNext}
          disabled={selectedAnswers[currentQuestion] === undefined}
        >
          {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </View>
    </View>
  );
};

const AssignmentContent = ({ assignment }: { assignment: Assignment }) => {
  const { colors } = useTheme();
  const [submitted, setSubmitted] = useState(false);

  return (
    <ScrollView style={styles.assignmentContainer}>
      <Card style={[styles.assignmentCard, { backgroundColor: colors.cardBackground }]}>
        <Card.Content>
          <Title style={[styles.assignmentTitle, { color: colors.text }]}>
            {assignment.title}
          </Title>
          
          <Text style={[styles.assignmentDescription, { color: colors.text }]}>
            {assignment.description}
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Requirements:
            </Text>
            {assignment.requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <MaterialCommunityIcons 
                  name="check-circle-outline" 
                  size={16} 
                  color={colors.primary} 
                />
                <Text style={[styles.requirementText, { color: colors.text }]}>
                  {req}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Submission Format:
            </Text>
            <Text style={[styles.submissionText, { color: colors.text }]}>
              {assignment.submissionFormat}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Due Date:
            </Text>
            <Text style={[styles.dueDateText, { color: colors.error }]}>
              {assignment.dueDate}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Button 
        mode="contained" 
        onPress={() => setSubmitted(true)}
        style={styles.submitButton}
        disabled={submitted}
      >
        {submitted ? 'Submitted' : 'Submit Assignment'}
      </Button>
    </ScrollView>
  );
};

// Main Component
export default function LessonDetailsScreen() {
  const route = useRoute<LessonDetailsRouteProp>();
  const navigation = useNavigation<LessonDetailsNavigationProp>();
  const { colors } = useTheme();
  const { courseId, lessonId } = route.params;
  
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const lessonData = getDummyLessonContent(lessonId, courseId);
        setLesson(lessonData);
      } catch (error) {
        Alert.alert('Error', 'Failed to load lesson content');
        console.error('Failed to fetch lesson:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, courseId]);

  const handleVideoProgress = (videoProgress: number) => {
    setProgress(videoProgress);
    if (videoProgress > 0.9 && !completed) {
      setCompleted(true);
      Alert.alert('Lesson Completed!', 'Great job! You can now proceed to the next lesson.');
    }
  };

  const handleQuizComplete = (score: number) => {
    if (lesson?.passingScore && score >= lesson.passingScore) {
      setCompleted(true);
      setProgress(1);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading lesson content...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar backgroundColor={colors.background} />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons 
            name="alert-circle-outline" 
            size={64} 
            color={colors.textSecondary} 
          />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Lesson not found
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    switch (lesson.type) {
      case 'video':
        return lesson.videoUrl ? (
          <VideoPlayer 
            videoUrl={lesson.videoUrl} 
            onProgress={handleVideoProgress}
          />
        ) : (
          <Text style={{ color: colors.text }}>Video content not available</Text>
        );
      
      case 'quiz':
        return lesson.questions ? (
          <QuizContent 
            questions={lesson.questions}
            passingScore={lesson.passingScore || 70}
            onComplete={handleQuizComplete}
          />
        ) : (
          <Text style={{ color: colors.text }}>Quiz content not available</Text>
        );
      
      case 'assignment':
        return lesson.assignment ? (
          <AssignmentContent assignment={lesson.assignment} />
        ) : (
          <Text style={{ color: colors.text }}>Assignment content not available</Text>
        );
      
      default:
        return <Text style={{ color: colors.text }}>Content type not supported</Text>;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {lesson.duration}
          </Text>
        </View>
        <Chip 
          icon={
            lesson.type === 'video' ? 'play' : 
            lesson.type === 'quiz' ? 'help-circle' : 'assignment'
          }
          style={{ backgroundColor: colors.primary }}
          textStyle={{ color: 'white', fontSize: 12 }}
        >
          {lesson.type.toUpperCase()}
        </Chip>
      </View>

      {/* Progress Bar */}
      {lesson.type === 'video' && (
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            color={colors.primary} 
            style={styles.lessonProgress}
          />
          <Text style={[styles.progressPercentage, { color: colors.textSecondary }]}>
            {Math.round(progress * 100)}% Complete
          </Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* Lesson Description */}
        <Card style={[styles.descriptionCard, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <Text style={[styles.description, { color: colors.text }]}>
              {lesson.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Main Content */}
        {renderContent()}

        {/* Learning Objectives */}
        <Card style={[styles.objectivesCard, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: colors.primary }]}>
              Learning Objectives
            </Title>
            {lesson.objectives.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <MaterialCommunityIcons 
                  name="target" 
                  size={16} 
                  color={colors.primary} 
                />
                <Text style={[styles.objectiveText, { color: colors.text }]}>
                  {objective}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Key Points */}
        <Card style={[styles.keyPointsCard, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: colors.primary }]}>
              Key Points
            </Title>
            {lesson.keyPoints.map((point, index) => (
              <View key={index} style={styles.keyPointItem}>
                <MaterialCommunityIcons 
                  name="lightbulb-outline" 
                  size={16} 
                  color={colors.primary} 
                />
                <Text style={[styles.keyPointText, { color: colors.text }]}>
                  {point}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Resources */}
        <Card style={[styles.resourcesCard, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, { color: colors.primary }]}>
              Additional Resources
            </Title>
            {lesson.resources.map((resource, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.resourceItem}
                onPress={() => console.log(`Open ${resource.title}`)}
              >
                <MaterialCommunityIcons 
                  name={
                    resource.type === 'pdf' ? 'file-pdf-outline' :
                    resource.type === 'download' ? 'download' : 'link'
                  } 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={[styles.resourceTitle, { color: colors.text }]}>
                  {resource.title}
                </Text>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { backgroundColor: colors.cardBackground }]}>
        <Button 
          mode="outlined" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Back to Course
        </Button>
        <Button 
          mode="contained" 
          onPress={() => {
            if (completed) {
              Alert.alert('Next Lesson', 'Navigate to next lesson');
            } else {
              Alert.alert('Complete Lesson', 'Please complete this lesson first');
            }
          }}
          disabled={!completed}
          style={styles.nextButton}
        >
          Next Lesson
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  lessonProgress: {
    height: 4,
    borderRadius: 2,
  },
  progressPercentage: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  descriptionCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  videoContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 200,
  },
  quizContainer: {
    marginBottom: 16,
  },
  quizProgress: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  questionCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionButton: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
  quizNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quizResults: {
    alignItems: 'center',
    padding: 32,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  passingText: {
    fontSize: 16,
    marginTop: 4,
  },
  retryButton: {
    marginTop: 24,
  },
  assignmentContainer: {
    marginBottom: 16,
  },
  assignmentCard: {
    borderRadius: 8,
    marginBottom: 16,
  },
  assignmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  assignmentDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requirementText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  submissionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  dueDateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 16,
  },
  objectivesCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  objectiveText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  keyPointsCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  keyPointText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  resourcesCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resourceTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    flex: 1,
    marginLeft: 8,
  },
});