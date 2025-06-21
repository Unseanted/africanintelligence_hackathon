import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Button, Text, IconButton, Card } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useTourLMS } from '../../../contexts/TourLMSContext';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND, BORDER_COLOR } from '../../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import YouTube from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

export default function LessonScreen() {
  const { id, lessonId } = useLocalSearchParams();
  const { CoursesHub, user, token, markLessonAsCompleted } = useTourLMS();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id || !lessonId) return;
      
      try {
        const foundCourse = CoursesHub.find(c => c._id === id);
        if (foundCourse) {
          setCourse(foundCourse);
          
          // Find the lesson and its position
          let foundLesson = null;
          let moduleIndex = -1;
          let lessonIndex = -1;

          foundCourse.modules?.forEach((module, mIndex) => {
            const lIndex = module.lessons?.findIndex(l => l._id === lessonId);
            if (lIndex !== -1) {
              foundLesson = module.lessons[lIndex];
              moduleIndex = mIndex;
              lessonIndex = lIndex;
            }
          });

          if (foundLesson) {
            setLesson(foundLesson);
            setCurrentModuleIndex(moduleIndex);
            setCurrentLessonIndex(lessonIndex);
          }
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id, lessonId, CoursesHub]);

  const handleComplete = async () => {
    if (!lesson || !token) return;

    try {
      setCompleting(true);
      await markLessonAsCompleted(lesson._id);
      // Navigate to next lesson or course content
      navigateToNextLesson();
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setCompleting(false);
    }
  };

  const navigateToNextLesson = () => {
    if (!course) return;

    const currentModule = course.modules[currentModuleIndex];
    const nextLessonIndex = currentLessonIndex + 1;

    if (nextLessonIndex < currentModule.lessons.length) {
      // Next lesson in current module
      router.push(`/course/${id}/lesson/${currentModule.lessons[nextLessonIndex]._id}`);
    } else if (currentModuleIndex + 1 < course.modules.length) {
      // First lesson of next module
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        router.push(`/course/${id}/lesson/${nextModule.lessons[0]._id}`);
      }
    } else {
      // Course completed, go back to content
      router.push(`/course/${id}/content`);
    }
  };

  const navigateToPreviousLesson = () => {
    if (!course) return;

    const currentModule = course.modules[currentModuleIndex];
    const prevLessonIndex = currentLessonIndex - 1;

    if (prevLessonIndex >= 0) {
      // Previous lesson in current module
      router.push(`/course/${id}/lesson/${currentModule.lessons[prevLessonIndex]._id}`);
    } else if (currentModuleIndex > 0) {
      // Last lesson of previous module
      const prevModule = course.modules[currentModuleIndex - 1];
      if (prevModule.lessons.length > 0) {
        router.push(`/course/${id}/lesson/${prevModule.lessons[prevModule.lessons.length - 1]._id}`);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Lesson not found</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
        />
        <Text style={styles.title} numberOfLines={2}>
          {lesson.title}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {lesson.videoUrl && (
          <View style={styles.videoContainer}>
            <YouTube
              videoId={lesson.videoUrl.split('v=')[1]}
              height={width * 0.5625} // 16:9 aspect ratio
              width={width}
              play={false}
            />
          </View>
        )}

        <Card style={styles.lessonCard}>
          <Card.Content>
            <Text style={styles.description}>{lesson.description}</Text>
            
            {lesson.content && (
              <View style={styles.contentContainer}>
                <Text style={styles.contentText}>{lesson.content}</Text>
              </View>
            )}

            {lesson.resources && lesson.resources.length > 0 && (
              <View style={styles.resourcesContainer}>
                <Text style={styles.sectionTitle}>Resources</Text>
                {lesson.resources.map((resource, index) => (
                  <Button
                    key={index}
                    mode="outlined"
                    icon="file-document"
                    onPress={() => {/* Handle resource download */}}
                    style={styles.resourceButton}
                  >
                    {resource.name}
                  </Button>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={navigateToPreviousLesson}
          disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
          style={styles.navigationButton}
        >
          Previous
        </Button>
        
        <Button
          mode="contained"
          onPress={handleComplete}
          loading={completing}
          disabled={completing || lesson.completed}
          style={styles.completeButton}
        >
          {lesson.completed ? 'Completed' : 'Mark as Complete'}
        </Button>

        <Button
          mode="outlined"
          onPress={navigateToNextLesson}
          style={styles.navigationButton}
        >
          Next
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: CARD_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    marginBottom: 16,
  },
  lessonCard: {
    margin: 16,
    backgroundColor: CARD_BACKGROUND,
  },
  description: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    marginBottom: 16,
  },
  contentContainer: {
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    lineHeight: 24,
  },
  resourcesContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  resourceButton: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: CARD_BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  navigationButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  completeButton: {
    flex: 2,
    marginHorizontal: 4,
    backgroundColor: PRIMARY,
  },
}); 