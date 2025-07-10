import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Text, Button, SegmentedButtons, Card } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTourLMS, Course } from '../contexts/TourLMSContext';
import { useToast } from '../hooks/use-toast';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND, BORDER_COLOR } from '../constants/colors';
import CourseContent from '../components/CourseContent';
import CourseOverview from '../components/CourseOverview';
import AIAssistantButton from '../components/AIAssistantButton';

export default function CourseDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, token, CoursesHub, enrolledCourses, enrollInCourse, packLoad } = useTourLMS();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourseAndEnrollmentStatus = async () => {
      try {
        setLoading(true);
        
        if (!id || !CoursesHub) {
          throw new Error('Course ID or CoursesHub not available');
        }

        // Find the course in CoursesHub by ID or key
        const foundCourse = CoursesHub.find(c => c._id === id || c.key === id);
        
        if (!foundCourse) {
          throw new Error('Course not found');
        }

        // Check enrollment status if user is logged in
        if (token && user) {
          const enrollmentStatus = foundCourse.enrolledStudents?.includes(user.id) ?? false;
          setIsEnrolled(enrollmentStatus);
          
          if (enrollmentStatus && enrolledCourses) {
            const myCourse = enrolledCourses.find(c => c._id === id || c.key === id);
            setCourse(myCourse || foundCourse);
          } else {
            setCourse(foundCourse);
          }
          
          // If user is enrolled, default to content tab
          if (enrollmentStatus) {
            setActiveTab('content');
          }
        } else {
          setCourse(foundCourse);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load course details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndEnrollmentStatus();
  }, [id, token, user, CoursesHub, enrolledCourses, toast]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: BACKGROUND }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: BACKGROUND }]}>
        <Text style={[styles.errorTitle, { color: TEXT_PRIMARY }]}>Course Not Found</Text>
        <Text style={[styles.errorDescription, { color: TEXT_SECONDARY }]}>
          The course you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </Text>
      </View>
    );
  }

  // If not enrolled, only show the overview
  if (!isEnrolled) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: BACKGROUND }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: TEXT_PRIMARY }]}>{course.title}</Text>
          <Text style={[styles.description, { color: TEXT_SECONDARY }]}>{course.description}</Text>
          <Image 
            source={{ uri: course.thumbnail || 'https://via.placeholder.com/800x400' }} 
            style={styles.thumbnail}
          />
        </View>
        
        <Card style={[styles.overviewCard, { backgroundColor: CARD_BACKGROUND }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Course Overview</Text>
            <Text style={[styles.overviewText, { color: TEXT_SECONDARY }]}>{course.overview}</Text>
            
            <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY, marginTop: 16 }]}>What You&apos;ll Learn</Text>
            {course.learningObjectives?.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <Text style={[styles.objectiveText, { color: TEXT_SECONDARY }]}>{objective}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
        
        <Button
          mode="contained"
          onPress={async () => {
            const courseId = course._id || course.key;
            if (!enrollInCourse || !courseId) return;
            try {
              await enrollInCourse(courseId);
              await packLoad(user, token); // refresh state
              toast({ title: 'Enrolled!', description: 'You have been enrolled in this course.' });
            } catch (error: any) {
              toast({ title: 'Error', description: error?.message || 'Failed to enroll.' });
            }
          }}
          style={styles.enrollButton}
          buttonColor={PRIMARY}
        >
          Enroll Now
        </Button>
      </ScrollView>
    );
  }

  // For enrolled students, show full course tabs
  return (
    <View style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, { color: TEXT_PRIMARY }]}>{course.title}</Text>
          <Text style={[styles.description, { color: TEXT_SECONDARY }]}>{course.description}</Text>
          <Image 
            source={{ uri: course.thumbnail || 'https://via.placeholder.com/800x400' }} 
            style={styles.thumbnail}
          />
        </View>

        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            {
              value: 'content',
              label: 'Content',
              icon: ({ color }: { color: string }) => <MaterialCommunityIcons name="book-open-page-variant" size={24} color={color} />
            },
            {
              value: 'overview',
              label: 'Overview',
              icon: ({ color }: { color: string }) => <MaterialCommunityIcons name="file-document-outline" size={24} color={color} />
            },
            {
              value: 'forum',
              label: 'Forum',
              icon: ({ color }: { color: string }) => <MaterialCommunityIcons name="forum-outline" size={24} color={color} />
            }
          ]}
          style={styles.tabs}
        />

        {activeTab === 'content' && (
          <View style={styles.tabContent}>
            <CourseContent
              course={{
                modules: course.modules || [],
                totalProgress: course.progress || 0
              }}
              isEnrolled={isEnrolled}
              onLessonPress={(lessonId) => {
                router.push(`/lesson/${lessonId}` as any);
              }}
              onEnroll={async () => {
                const courseId = course._id || course.key;
                if (!enrollInCourse || !courseId) return;
                try {
                  await enrollInCourse(courseId);
                  await packLoad(user, token);
                  toast({ title: 'Enrolled!', description: 'You have been enrolled in this course.' });
                } catch (error: any) {
                  toast({ title: 'Error', description: error?.message || 'Failed to enroll.' });
                }
              }}
              onContinue={() => {
                // Optionally handle continue action
              }}
            />
          </View>
        )}

        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <CourseOverview
              course={{
                title: course.title,
                description: course.description,
                instructor: course.instructor,
                level: course.level,
                duration: course.duration,
                totalLessons: course.totalLessons || 0,
                totalStudents: course.totalStudents || 0,
                rating: course.rating || 0,
                overview: course.overview || '',
                learningObjectives: course.learningObjectives || [],
                requirements: course.requirements || [],
                thumbnail: course.thumbnail
              }}
              isEnrolled={isEnrolled}
              onEnroll={async () => {
                const courseId = course._id || course.key;
                if (!enrollInCourse || !courseId) return;
                try {
                  await enrollInCourse(courseId);
                  await packLoad(user, token);
                  toast({ title: 'Enrolled!', description: 'You have been enrolled in this course.' });
                } catch (error: any) {
                  toast({ title: 'Error', description: error?.message || 'Failed to enroll.' });
                }
              }}
            />
          </View>
        )}

        {activeTab === 'forum' && (
          <View style={styles.tabContent}>
            {/* Course forum implementation */}
          </View>
        )}
      </ScrollView>
      <AIAssistantButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  overviewCard: {
    margin: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  objectiveText: {
    fontSize: 14,
    marginLeft: 8,
  },
  enrollButton: {
    margin: 16,
  },
  tabs: {
    backgroundColor: CARD_BACKGROUND,
  },
  tabContent: {
    padding: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 32,
  },
  errorDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
}); 