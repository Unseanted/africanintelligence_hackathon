import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, ProgressBar } from 'react-native-paper';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CoursesPage() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Courses</ThemedText>

        {/* In Progress Courses */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>In Progress</ThemedText>
          
          <Card style={styles.courseCard}>
            <Card.Content>
              <View style={styles.courseHeader}>
                <MaterialCommunityIcons name="book-open" size={24} color="#6366f1" />
                <View style={styles.courseInfo}>
                  <ThemedText style={styles.courseTitle}>Introduction to Machine Learning</ThemedText>
                  <ThemedText style={styles.courseSubtitle}>Module 3 of 8</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.courseDescription}>
                Learn the fundamentals of machine learning algorithms and their applications.
              </ThemedText>
              <View style={styles.progressContainer}>
                <ThemedText style={styles.progressText}>Course Progress</ThemedText>
                <ProgressBar
                  progress={0.4}
                  color="#6366f1"
                  style={styles.progressBar}
                />
                <ThemedText style={styles.progressPercentage}>40% Complete</ThemedText>
              </View>
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.continueButton}
                theme={{ colors: { primary: '#6366f1' } }}
              >
                Continue Learning
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Available Courses */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Available Courses</ThemedText>
          
          <Card style={styles.courseCard}>
            <Card.Content>
              <View style={styles.courseHeader}>
                <MaterialCommunityIcons name="code-braces" size={24} color="#22c55e" />
                <View style={styles.courseInfo}>
                  <ThemedText style={styles.courseTitle}>Deep Learning with Python</ThemedText>
                  <ThemedText style={styles.courseSubtitle}>8 modules • 12 hours</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.courseDescription}>
                Master deep learning concepts and implement neural networks using Python and TensorFlow.
              </ThemedText>
              <View style={styles.courseStats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="account-group" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>1.2k students</ThemedText>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="star" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>4.8/5 rating</ThemedText>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.enrollButton}
                theme={{ colors: { primary: '#22c55e' } }}
              >
                Enroll Now
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.courseCard}>
            <Card.Content>
              <View style={styles.courseHeader}>
                <MaterialCommunityIcons name="robot" size={24} color="#a855f7" />
                <View style={styles.courseInfo}>
                  <ThemedText style={styles.courseTitle}>Natural Language Processing</ThemedText>
                  <ThemedText style={styles.courseSubtitle}>6 modules • 10 hours</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.courseDescription}>
                Learn to build and deploy NLP models for text classification, sentiment analysis, and more.
              </ThemedText>
              <View style={styles.courseStats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="account-group" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>850 students</ThemedText>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="star" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>4.9/5 rating</ThemedText>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.enrollButton}
                theme={{ colors: { primary: '#a855f7' } }}
              >
                Enroll Now
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Completed Courses */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Completed Courses</ThemedText>
          <Card style={styles.courseCard}>
            <Card.Content>
              <View style={styles.courseHeader}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                <View style={styles.courseInfo}>
                  <ThemedText style={styles.courseTitle}>Python for Data Science</ThemedText>
                  <ThemedText style={styles.courseSubtitle}>Completed 2 weeks ago</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.courseDescription}>
                Mastered Python programming and data analysis using pandas, NumPy, and scikit-learn.
              </ThemedText>
              <View style={styles.courseStats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="certificate" size={16} color="#eab308" />
                  <ThemedText style={styles.statText}>Certificate earned</ThemedText>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="star" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>Final grade: 95%</ThemedText>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.viewButton}
                theme={{ colors: { primary: '#10b981' } }}
              >
                View Certificate
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  courseDescription: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 16,
  },
  courseStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#6366f1',
    textAlign: 'right',
    marginTop: 4,
  },
  continueButton: {
    marginTop: 8,
  },
  enrollButton: {
    marginTop: 8,
  },
  viewButton: {
    marginTop: 8,
  },
}); 