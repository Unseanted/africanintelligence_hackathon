import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Button, ProgressBar } from 'react-native-paper';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual data from your API
  const userStats = {
    totalXP: 1250,
    progress: 75,
    currentStreak: 5,
    challenges: '0/1',
  };

  const enrolledCourses = [
    {
      id: '1',
      title: 'AI Fundamentals',
      progress: 75,
      nextModule: 'Neural Networks',
      instructor: 'Dr. Akin',
      thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '2',
      title: 'Tourism Tech',
      progress: 45,
      nextModule: 'Digital Marketing',
      instructor: 'Prof. Zulu',
      thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      courseTitle: 'AI Fundamentals',
      contentTitle: 'Introduction to Machine Learning',
      lastAccessedAt: new Date(),
    },
    {
      id: '2',
      courseTitle: 'Tourism Tech',
      contentTitle: 'Digital Marketing Basics',
      lastAccessedAt: new Date(Date.now() - 86400000), // yesterday
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText style={styles.welcomeTitle}>
            Welcome to African Intelligence
          </ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            Your journey into advanced AI education continues. Track your progress, join events, and connect with fellow learners.
          </ThemedText>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.browseButton}
            theme={{ colors: { primary: '#eab308' } }}
          >
            Browse More Courses
          </Button>
        </View>

        {/* Progress Overview */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, styles.blueCard]}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="trophy" size={24} color="#3b82f6" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Total XP</Text>
                <Text style={styles.statValue}>{userStats.totalXP}</Text>
                <ProgressBar
                  progress={0.7}
                  color="#3b82f6"
                  style={styles.progressBar}
                />
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.greenCard]}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="book-open" size={24} color="#22c55e" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Progress</Text>
                <Text style={styles.statValue}>{userStats.progress}%</Text>
                <ProgressBar
                  progress={userStats.progress / 100}
                  color="#22c55e"
                  style={styles.progressBar}
                />
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.yellowCard]}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="fire" size={24} color="#eab308" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Current Streak</Text>
                <Text style={styles.statValue}>{userStats.currentStreak} days</Text>
                <Text style={styles.statSubtext}>Keep it up!</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.purpleCard]}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="target" size={24} color="#a855f7" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Challenges</Text>
                <Text style={styles.statValue}>{userStats.challenges}</Text>
                <Text style={styles.statSubtext}>Completed</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Course Progress Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <ThemedText style={styles.sectionTitle}>Your Learning Journey</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>Continue where you left off</ThemedText>
            </View>
          </View>

          <View style={styles.coursesContainer}>
            {enrolledCourses.map((course) => (
              <Card key={course.id} style={styles.courseCard}>
                <Image
                  source={{ uri: course.thumbnail }}
                  style={styles.courseImage}
                />
                <View style={styles.courseOverlay}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                </View>
                <Card.Content style={styles.courseContent}>
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressValue}>{course.progress}%</Text>
                  </View>
                  <ProgressBar
                    progress={course.progress / 100}
                    color="#eab308"
                    style={styles.courseProgressBar}
                  />
                  <View style={styles.courseInfo}>
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color="#9ca3af" />
                      <Text style={styles.infoText}>Next: {course.nextModule}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="account" size={16} color="#9ca3af" />
                      <Text style={styles.infoText}>Instructor: {course.instructor}</Text>
                    </View>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() => {}}
                    style={styles.continueButton}
                    theme={{ colors: { primary: '#eab308' } }}
                  >
                    Continue Learning
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Card style={styles.activitiesCard}>
            <Card.Content>
              <ThemedText style={styles.sectionTitle}>Recent Activities</ThemedText>
              <View style={styles.activitiesList}>
                {recentActivities.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <MaterialCommunityIcons name="clock-outline" size={20} color="#3b82f6" />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>
                        Completed <Text style={styles.activityHighlight}>{activity.contentTitle}</Text> in{' '}
                        <Text style={styles.activityHighlight}>{activity.courseTitle}</Text>
                      </Text>
                      <Text style={styles.activityTime}>
                        {activity.lastAccessedAt.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
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
    paddingBottom: 100, // Account for bottom navigation
  },
  welcomeSection: {
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#fecaca',
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  blueCard: {
    borderColor: '#3b82f6',
  },
  greenCard: {
    borderColor: '#22c55e',
  },
  yellowCard: {
    borderColor: '#eab308',
  },
  purpleCard: {
    borderColor: '#a855f7',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  coursesContainer: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 160,
  },
  courseOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  courseContent: {
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  progressValue: {
    fontSize: 14,
    color: '#9ca3af',
  },
  courseProgressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  courseInfo: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  continueButton: {
    backgroundColor: '#eab308',
  },
  activitiesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  activitiesList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  activityHighlight: {
    fontWeight: 'bold',
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
}); 