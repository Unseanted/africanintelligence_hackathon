import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND, BORDER_COLOR } from '../constants/colors';

interface CourseOverviewProps {
  course: {
    title: string;
    description: string;
    instructor: string;
    level: string;
    duration: string;
    totalLessons: number;
    totalStudents: number;
    rating: number;
    overview: string;
    learningObjectives: string[];
    requirements: string[];
    thumbnail: string;
  };
  isEnrolled: boolean;
  onEnroll: () => void;
}

export default function CourseOverview({ course, isEnrolled, onEnroll }: CourseOverviewProps) {
  return (
    <ScrollView style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <Card style={[styles.headerCard, { backgroundColor: CARD_BACKGROUND }]}>
        <Card.Content>
          <Text style={[styles.title, { color: TEXT_PRIMARY }]}>{course.title}</Text>
          <Text style={[styles.description, { color: TEXT_SECONDARY }]}>{course.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="account" size={20} color={PRIMARY} />
              <Text style={[styles.statText, { color: TEXT_SECONDARY }]}>
                {course.instructor}
              </Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="signal" size={20} color={PRIMARY} />
              <Text style={[styles.statText, { color: TEXT_SECONDARY }]}>
                {course.level}
              </Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={PRIMARY} />
              <Text style={[styles.statText, { color: TEXT_SECONDARY }]}>
                {course.duration}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color={PRIMARY} />
              <Text style={[styles.statText, { color: TEXT_SECONDARY }]}>
                {course.totalLessons} Lessons
              </Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="account-group" size={20} color={PRIMARY} />
              <Text style={[styles.statText, { color: TEXT_SECONDARY }]}>
                {course.totalStudents} Students
              </Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="star" size={20} color={PRIMARY} />
              <Text style={[styles.statText, { color: TEXT_SECONDARY }]}>
                {course.rating} Rating
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.sectionCard, { backgroundColor: CARD_BACKGROUND }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Course Overview</Text>
          <Text style={[styles.overviewText, { color: TEXT_SECONDARY }]}>{course.overview}</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.sectionCard, { backgroundColor: CARD_BACKGROUND }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>What You'll Learn</Text>
          {course.learningObjectives.map((objective, index) => (
            <View key={index} style={styles.objectiveItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={PRIMARY} />
              <Text style={[styles.objectiveText, { color: TEXT_SECONDARY }]}>{objective}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={[styles.sectionCard, { backgroundColor: CARD_BACKGROUND }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Requirements</Text>
          {course.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <MaterialCommunityIcons name="information" size={20} color={PRIMARY} />
              <Text style={[styles.requirementText, { color: TEXT_SECONDARY }]}>{requirement}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {!isEnrolled && (
        <Button
          mode="contained"
          onPress={onEnroll}
          style={styles.enrollButton}
          buttonColor={PRIMARY}
        >
          Enroll Now
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 8,
    fontSize: 14,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  overviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  objectiveText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requirementText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  enrollButton: {
    margin: 16,
    marginTop: 0,
  },
}); 