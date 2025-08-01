import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Button,
  Chip,
  Surface,
  Text,
  TouchableRipple
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../app/contexts/ThemeContext';

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');

// Types
interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  type: 'video' | 'quiz' | 'assignment';
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  progress: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  enrolledStudents: number;
  price: number;
  thumbnail: string;
  modules: Module[];
  totalProgress: number;
  tags: string[];
}

interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  replies: number;
  likes: number;
}

type RootStackParamList = {
  CourseDetails: { courseId: string };
  Lesson: { courseId: string; lessonId: string };
  Home: undefined;
};

type CourseDetailsRouteProp = RouteProp<RootStackParamList, 'CourseDetails'>;
type CourseDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CourseDetails'>;

// Dummy Data
const dummyForumPosts: ForumPost[] = [
  {
    id: '1',
    author: 'Jane Doe',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    content: 'Has anyone completed the React Native assignment? I need some help with the navigation part.',
    timestamp: '2 hours ago',
    replies: 5,
    likes: 12
  },
  {
    id: '2',
    author: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    content: 'The video about state management was really helpful. I implemented Context API in my project successfully!',
    timestamp: '1 day ago',
    replies: 3,
    likes: 8
  },
  {
    id: '3',
    author: 'Alex Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    content: 'When will the next module be released? I finished all the current content.',
    timestamp: '3 days ago',
    replies: 2,
    likes: 4
  }
];

const dummyCourse: Course = {
  id: '1',
  title: "Complete React Native Development",
  description: "Master React Native development from basics to advanced concepts. Build real-world mobile applications for iOS and Android platforms with hands-on projects and expert guidance.",
  instructor: "John Smith",
  duration: "12 weeks",
  level: "Intermediate",
  rating: 4.8,
  enrolledStudents: 2340,
  price: 99.99,
  thumbnail: "https://via.placeholder.com/400x250/6366f1/ffffff?text=React+Native+Course",
  totalProgress: 35,
  tags: ["React Native", "Mobile Development", "JavaScript", "iOS", "Android"],
  modules: [
    {
      id: "module-1",
      title: "Getting Started with React Native",
      description: "Learn the fundamentals of React Native development",
      progress: 100,
      lessons: [
        {
          id: "lesson-1-1",
          title: "Introduction to React Native",
          duration: "15 min",
          completed: true,
          locked: false,
          type: "video"
        },
        {
          id: "lesson-1-2",
          title: "Setting up Development Environment",
          duration: "20 min",
          completed: true,
          locked: false,
          type: "video"
        },
        {
          id: "lesson-1-3",
          title: "Your First App",
          duration: "10 min",
          completed: true,
          locked: false,
          type: "quiz"
        }
      ]
    },
    {
      id: "module-2",
      title: "Core Components and Styling",
      description: "Master React Native components and styling techniques",
      progress: 60,
      lessons: [
        {
          id: "lesson-2-1",
          title: "Understanding Components",
          duration: "25 min",
          completed: true,
          locked: false,
          type: "video"
        },
        {
          id: "lesson-2-2",
          title: "Styling with StyleSheet",
          duration: "18 min",
          completed: true,
          locked: false,
          type: "video"
        },
        {
          id: "lesson-2-3",
          title: "Layout and Flexbox",
          duration: "22 min",
          completed: false,
          locked: false,
          type: "video"
        },
        {
          id: "lesson-2-4",
          title: "Component Styling Assignment",
          duration: "30 min",
          completed: false,
          locked: false,
          type: "assignment"
        }
      ]
    },
    {
      id: "module-3",
      title: "Navigation and State Management",
      description: "Learn advanced navigation patterns and state management",
      progress: 0,
      lessons: [
        {
          id: "lesson-3-1",
          title: "React Navigation Basics",
          duration: "20 min",
          completed: false,
          locked: false,
          type: "video"
        },
        {
          id: "lesson-3-2",
          title: "Stack and Tab Navigation",
          duration: "25 min",
          completed: false,
          locked: false,
          type: "video"
        },
        {
          id: "lesson-3-3",
          title: "State Management with Context",
          duration: "30 min",
          completed: false,
          locked: false,
          type: "video"
        }
      ]
    }
  ]
};

// Helper function (needs to be defined before component usage)
const getLevelColor = (level: string, colors: any) => {
  switch (level) {
    case 'Beginner': return '#4CAF50';
    case 'Intermediate': return '#FF9800';
    case 'Advanced': return '#F44336';
    default: return colors.primary;
  }
};

// Components
const CourseContent = ({ course, onLessonPress }: { course: Course, onLessonPress: (lessonId: string) => void }) => {
  const { colors } = useTheme();
  
  return (
    <ScrollView style={[styles.tabContent, { backgroundColor: colors.background }]}>
      {course.modules.map((module) => (
        <View key={module.id} style={[styles.moduleContainer, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.moduleHeader}>
            <Text style={[styles.moduleTitle, { color: colors.text }]}>{module.title}</Text>
            <Text style={[styles.moduleProgress, { color: colors.primary }]}>
              {module.progress}% complete
            </Text>
          </View>
          <Text style={[styles.moduleDescription, { color: colors.textSecondary }]}>
            {module.description}
          </Text>
          
          {module.lessons.map((lesson) => (
            <TouchableRipple 
              key={lesson.id} 
              onPress={() => !lesson.locked && onLessonPress(lesson.id)}
              disabled={lesson.locked}
            >
              <View style={styles.lessonItem}>
                <MaterialCommunityIcons 
                  name={
                    lesson.type === 'video' ? 'play-circle-outline' : 
                    lesson.type === 'quiz' ? 'help-circle-outline' : 'assignment'
                  } 
                  size={24} 
                  color={lesson.locked ? colors.textDisabled : colors.primary} 
                />
                <View style={styles.lessonInfo}>
                  <Text style={[
                    styles.lessonTitle, 
                    { 
                      color: lesson.locked ? colors.textDisabled : colors.text,
                      fontWeight: lesson.completed ? 'normal' : 'bold'
                    }
                  ]}>
                    {lesson.title}
                  </Text>
                  <Text style={[styles.lessonDuration, { color: colors.textSecondary }]}>
                    {lesson.duration}
                  </Text>
                </View>
                {lesson.completed && (
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={24} 
                    color={colors.success} 
                  />
                )}
              </View>
            </TouchableRipple>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const CourseForum = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.tabContent, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Discussion Forum</Text>
      
      <FlatList
        data={dummyForumPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Surface style={[styles.forumPost, { backgroundColor: colors.cardBackground }]} elevation={2}>
            <View style={styles.postHeader}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.postAuthor}>
                <Text style={[styles.authorName, { color: colors.text }]}>{item.author}</Text>
                <Text style={[styles.postTime, { color: colors.textSecondary }]}>{item.timestamp}</Text>
              </View>
            </View>
            <Text style={[styles.postContent, { color: colors.text }]}>{item.content}</Text>
            <View style={styles.postActions}>
              <View style={styles.actionItem}>
                <MaterialCommunityIcons name="message-reply-text" size={18} color={colors.textSecondary} />
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>{item.replies}</Text>
              </View>
              <View style={styles.actionItem}>
                <MaterialCommunityIcons name="thumb-up-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>{item.likes}</Text>
              </View>
            </View>
          </Surface>
        )}
      />
      
      <Button 
        mode="contained" 
        onPress={() => console.log('New post')}
        style={styles.newPostButton}
      >
        New Post
      </Button>
    </View>
  );
};

const CourseResources = () => {
  const { colors } = useTheme();
  
  const resources = [
    { id: '1', title: 'React Native Documentation', type: 'link', icon: 'link' },
    { id: '2', title: 'Download Starter Files', type: 'download', icon: 'download' },
    { id: '3', title: 'Additional Reading Materials', type: 'book', icon: 'book-open' },
    { id: '4', title: 'Community Slack Channel', type: 'slack', icon: 'slack' },
  ];

  return (
    <ScrollView style={[styles.tabContent, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Resources</Text>
      
      {resources.map((resource) => (
        <TouchableOpacity 
          key={resource.id} 
          onPress={() => console.log(`Open ${resource.title}`)}
        >
          <Surface style={[styles.resourceItem, { backgroundColor: colors.cardBackground }]} elevation={2}>
            <MaterialCommunityIcons 
              name={resource.icon} 
              size={24} 
              color={colors.primary} 
              style={styles.resourceIcon}
            />
            <Text style={[styles.resourceTitle, { color: colors.text }]}>
              {resource.title}
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={colors.textSecondary} 
            />
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Main Screen
export default function CourseDetailsScreen() {
  const route = useRoute<CourseDetailsRouteProp>();
  const navigation = useNavigation<CourseDetailsNavigationProp>();
  const { colors } = useTheme();
  const { courseId } = route.params;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCourse(dummyCourse);
        setIsEnrolled(Math.random() > 0.5); // Random enrollment status for demo
      } catch (error) {
        Alert.alert('Error', 'Failed to load course details');
        console.error('Failed to fetch course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsEnrolled(true);
      Alert.alert(
        'Success!', 
        `You have successfully enrolled in ${course.title}`,
        [{ text: 'Start Learning', onPress: () => {} }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to enroll in course. Please try again.');
      console.error('Enrollment failed:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleLessonPress = (lessonId: string) => {
    navigation.navigate('Lesson', { 
      courseId, 
      lessonId
    });
  };



  const HeaderSection = () => (
    <View style={styles.headerContainer}>
      <Text style={[styles.courseTitle, { color: colors.text }]}>
        {course?.title}
      </Text>
      <Text style={[styles.courseDescription, { color: colors.textSecondary }]}>
        {course?.description}
      </Text>
      <Image
        source={{ uri: course?.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
    </View>
  );

  const MetaSection = () => (
    <View style={[styles.metaContainer, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="account" size={16} color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.text }]}>Instructor: {course?.instructor}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.text }]}>Duration: {course?.duration}</Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
          <Text style={[styles.metaText, { color: colors.text }]}>
            Rating: {course?.rating} ({course?.enrolledStudents.toLocaleString()} students)
          </Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="school" size={16} color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.text }]}>
            Level: <Text style={{ color: getLevelColor(course?.level || 'Beginner', colors) }}>
              {course?.level}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );

  const TagsSection = () => (
    <View style={styles.tagsContainer}>
      {course?.tags.map(tag => (
        <Chip 
          key={tag}
          style={[styles.tag, { backgroundColor: colors.surface }]}
          textStyle={{ color: colors.text, fontSize: 12 }}
        >
          {tag}
        </Chip>
      ))}
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <View style={[styles.skeletonThumbnail, { backgroundColor: colors.surface }]} />
          <View style={styles.skeletonTextContainer}>
            <View style={[styles.skeletonText, { width: '70%', backgroundColor: colors.surface }]} />
            <View style={[styles.skeletonText, { width: '90%', backgroundColor: colors.surface }]} />
            <View style={[styles.skeletonText, { width: '90%', backgroundColor: colors.surface }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (!course) {
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
            Course not found
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

  // Main render
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar backgroundColor={colors.background} />
      
      <ScrollView>
        <HeaderSection />
        <MetaSection />
        <TagsSection />
        
        {isEnrolled ? (
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.textSecondary,
              tabBarIndicatorStyle: { backgroundColor: colors.primary },
              tabBarLabelStyle: { fontWeight: 'bold', textTransform: 'none', fontSize: 14 },
              tabBarStyle: { backgroundColor: colors.background },
            }}
          >
            <Tab.Screen 
              name="Content" 
              children={() => <CourseContent course={course} onLessonPress={handleLessonPress} />}
            />
            <Tab.Screen 
              name="Forum" 
              component={CourseForum}
            />
            <Tab.Screen 
              name="Resources" 
              component={CourseResources}
            />
          </Tab.Navigator>
        ) : (
          <Button 
            mode="contained" 
            onPress={handleEnroll}
            style={styles.enrollButton}
            loading={enrolling}
          >
            Enroll Now (${course?.price})
          </Button>
        )}
      </ScrollView>

      {enrolling && (
        <View style={styles.overlay}>
          <Surface style={[styles.overlayContent, { backgroundColor: colors.cardBackground }]} elevation={4}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.overlayText, { color: colors.text }]}>
              Enrolling in course...
            </Text>
          </Surface>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  skeletonThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  skeletonTextContainer: {
    paddingHorizontal: 8,
  },
  skeletonText: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
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
  overviewContainer: {
    padding: 16,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  courseHeader: {
    marginBottom: 24,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  courseMetaContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  enrollButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  moduleContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moduleProgress: {
    fontSize: 14,
  },
  moduleDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lessonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  lessonTitle: {
    fontSize: 16,
  },
  lessonDuration: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  forumPost: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postAuthor: {
    flex: 1,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTime: {
    fontSize: 12,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
  },
  newPostButton: {
    marginTop: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  resourceIcon: {
    marginRight: 16,
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  overlayText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  metaContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  tag: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});