import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Card, Button, Text, ProgressBar, Chip } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND, BORDER_COLOR } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { CoursesHub, user, token, enrollInCourse } = useTourLMS();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        const foundCourse = CoursesHub.find(c => c._id === id);
        if (foundCourse) {
          setCourse(foundCourse);
          setIsEnrolled(foundCourse.enrolledStudents?.includes(user?.id));
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, CoursesHub, user]);

  const handleEnroll = async () => {
    if (!course || !token) return;

    try {
      setEnrolling(true);
      await enrollInCourse(course._id);
      setIsEnrolled(true);
      router.push(`/course/${course._id}/content`);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrolling(false);
    }
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
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: course.thumbnail || 'https://via.placeholder.com/800x400' }}
          style={styles.courseImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{course.title}</Text>
        
        <View style={styles.metaContainer}>
          <Chip icon="account-group" style={styles.chip}>
            {course.totalStudents || 0} students
          </Chip>
          <Chip icon="clock-outline" style={styles.chip}>
            {course.duration || 'Self-paced'}
          </Chip>
          <Chip icon="star" style={styles.chip}>
            {course.level || 'Beginner'}
          </Chip>
        </View>

        {isEnrolled && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Progress: {course.progress || 0}%</Text>
            <ProgressBar
              progress={(course.progress || 0) / 100}
              color={PRIMARY}
              style={styles.progressBar}
            />
          </View>
        )}

        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{course.description}</Text>
          </Card.Content>
        </Card>

        {course.whatYouWillLearn && (
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>What You'll Learn</Text>
              {course.whatYouWillLearn.map((item, index) => (
                <View key={index} style={styles.learningItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={PRIMARY} />
                  <Text style={styles.learningText}>{item}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {course.facilitatorInfo && (
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Instructor</Text>
              <View style={styles.instructorContainer}>
                <Image
                  source={{ uri: course.facilitatorInfo.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.facilitatorInfo.name)}&background=random` }}
                  style={styles.instructorImage}
                />
                <View style={styles.instructorInfo}>
                  <Text style={styles.instructorName}>{course.facilitatorInfo.name}</Text>
                  <Text style={styles.instructorTitle}>{course.facilitatorInfo.title}</Text>
                  <Text style={styles.instructorBio}>{course.facilitatorInfo.bio}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          {isEnrolled ? (
            <Button
              mode="contained"
              onPress={() => router.push(`/course/${course._id}/content`)}
              style={styles.button}
              buttonColor={PRIMARY}
            >
              Continue Learning
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleEnroll}
              style={styles.button}
              buttonColor={PRIMARY}
              loading={enrolling}
              disabled={enrolling}
            >
              Enroll Now
            </Button>
          )}
        </View>
      </View>
    </ScrollView>
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
  imageContainer: {
    height: 250,
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: CARD_BACKGROUND,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  section: {
    marginBottom: 16,
    backgroundColor: CARD_BACKGROUND,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    lineHeight: 24,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  learningText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginLeft: 8,
    flex: 1,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  instructorTitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  instructorBio: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    borderRadius: 8,
  },
}); 