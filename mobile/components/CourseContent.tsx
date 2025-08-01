import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, IconButton, ProgressBar, Text } from 'react-native-paper';
import { useTheme } from '../app/contexts/ThemeContext';

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

interface CourseContentProps {
  course: {
    modules: Module[];
    totalProgress: number;
  };
  isEnrolled: boolean;
  onLessonPress: (lessonId: string) => void;
  onEnroll: () => Promise<void>;
  onContinue: () => void;
}

export default function CourseContent({ course, isEnrolled, onLessonPress, onEnroll, onContinue }: CourseContentProps) {
  const { colors } = useTheme();
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video':
        return 'play-circle-outline';
      case 'quiz':
        return 'help-circle-outline';
      case 'assignment':
        return 'file-document-outline';
      default:
        return 'circle-outline';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={[styles.progressCard, { backgroundColor: colors.cardBackground }]}>
        <Card.Content>
          <Text style={[styles.progressTitle, { color: colors.text }]}>Course Progress</Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={course.totalProgress / 100}
              style={[styles.progressBar, { backgroundColor: colors.borderColor }]}
              color={colors.primary}
            />
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {Math.round(course.totalProgress)}%
            </Text>
          </View>
        </Card.Content>
      </Card>

      {course.modules.map((module) => (
        <Card
          key={module.id}
          style={[styles.moduleCard, { backgroundColor: colors.cardBackground }]}
        >
          <TouchableOpacity
            onPress={() => toggleModule(module.id)}
            style={styles.moduleHeader}
          >
            <View style={styles.moduleHeaderContent}>
              <Text style={[styles.moduleTitle, { color: colors.text }]}>
                {module.title}
              </Text>
              <Text style={[styles.moduleDescription, { color: colors.textSecondary }]}>
                {module.description}
              </Text>
            </View>
            <IconButton
              icon={expandedModules[module.id] ? 'chevron-up' : 'chevron-down'}
              iconColor={colors.textSecondary}
              size={24}
            />
          </TouchableOpacity>

          <ProgressBar
            progress={module.progress / 100}
            style={[styles.moduleProgress, { backgroundColor: colors.borderColor }]}
            color={colors.primary}
          />

          {expandedModules[module.id] && (
            <View style={styles.lessonsContainer}>
              {module.lessons.map((lesson, index) => (
                <React.Fragment key={lesson.id}>
                  {index > 0 && <Divider style={[styles.divider, { backgroundColor: colors.borderColor }]} />}
                  <TouchableOpacity
                    style={styles.lessonItem}
                    onPress={() => !lesson.locked && onLessonPress(lesson.id)}
                    disabled={lesson.locked}
                  >
                    <MaterialCommunityIcons
                      name={getLessonIcon(lesson.type)}
                      size={24}
                      color={lesson.locked ? colors.textSecondary : colors.primary}
                    />
                    <View style={styles.lessonContent}>
                      <Text style={[styles.lessonTitle, { color: lesson.locked ? colors.textSecondary : colors.text }]}>
                        {lesson.title}
                      </Text>
                      <Text style={[styles.lessonDuration, { color: colors.textSecondary }]}>
                        {lesson.duration}
                      </Text>
                    </View>
                    {lesson.completed ? (
                      <MaterialCommunityIcons name="check-circle" size={24} color={colors.primary} />
                    ) : lesson.locked ? (
                      <MaterialCommunityIcons name="lock" size={24} color={colors.textSecondary} />
                    ) : (
                      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          )}
        </Card>
      ))}

      <Button
        mode="contained"
        onPress={async () => {
          if (isEnrolled) {
            onContinue();
          } else {
            await onEnroll();
          }
        }}
        style={{ marginTop: 12 }}
        buttonColor={colors.primary}
      >
        {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressCard: {
    margin: 16,
    borderWidth: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  moduleCard: {
    margin: 16,
    marginTop: 0,
    borderWidth: 1,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  moduleHeaderContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
  },
  moduleProgress: {
    height: 4,
    borderRadius: 2,
    
  },
  lessonsContainer: {
    padding: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  lessonContent: {
    flex: 1,
    marginLeft: 12,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  lessonDuration: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});