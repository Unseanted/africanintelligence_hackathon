import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Button, Text, List, IconButton, Divider } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND, BORDER_COLOR } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CourseContentScreen() {
  const { id } = useLocalSearchParams();
  const { CoursesHub, user, token } = useTourLMS();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        const foundCourse = CoursesHub.find(c => c._id === id);
        if (foundCourse) {
          setCourse(foundCourse);
          // Initialize expanded state for each module
          const initialExpanded = {};
          foundCourse.modules?.forEach(module => {
            initialExpanded[module._id] = false;
          });
          setExpandedModules(initialExpanded);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, CoursesHub]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleLessonPress = (lesson) => {
    router.push({
      pathname: `/course/${id}/lesson/${lesson._id}`,
      params: { lessonData: JSON.stringify(lesson) }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Course not found</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{course.title}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Progress: {course.progress || 0}%</Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar,
                { width: `${course.progress || 0}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {course.modules?.map((module, index) => (
          <Card key={module._id} style={styles.moduleCard}>
            <Card.Content>
              <View style={styles.moduleHeader}>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleTitle}>
                    Module {index + 1}: {module.title}
                  </Text>
                  <Text style={styles.moduleDescription}>
                    {module.description}
                  </Text>
                </View>
                <IconButton
                  icon={expandedModules[module._id] ? 'chevron-up' : 'chevron-down'}
                  onPress={() => toggleModule(module._id)}
                />
              </View>

              {expandedModules[module._id] && (
                <View style={styles.lessonsContainer}>
                  {module.lessons?.map((lesson, lessonIndex) => (
                    <React.Fragment key={lesson._id}>
                      <List.Item
                        title={`${lessonIndex + 1}. ${lesson.title}`}
                        description={lesson.description}
                        left={props => (
                          <List.Icon
                            {...props}
                            icon={lesson.completed ? 'check-circle' : 'circle-outline'}
                            color={lesson.completed ? PRIMARY : TEXT_SECONDARY}
                          />
                        )}
                        right={props => (
                          <List.Icon
                            {...props}
                            icon="chevron-right"
                            color={TEXT_SECONDARY}
                          />
                        )}
                        onPress={() => handleLessonPress(lesson)}
                        style={styles.lessonItem}
                      />
                      {lessonIndex < module.lessons.length - 1 && (
                        <Divider style={styles.divider} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
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
    padding: 16,
    backgroundColor: CARD_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: BORDER_COLOR,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: PRIMARY,
  },
  content: {
    flex: 1,
  },
  moduleCard: {
    margin: 8,
    backgroundColor: CARD_BACKGROUND,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  moduleInfo: {
    flex: 1,
    marginRight: 8,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  lessonsContainer: {
    marginTop: 8,
  },
  lessonItem: {
    paddingVertical: 8,
  },
  divider: {
    backgroundColor: BORDER_COLOR,
  },
}); 