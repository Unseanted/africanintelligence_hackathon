import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

const Analytics = () => {
  // Dummy data for demonstration
  const analyticsData = {
    totalCourses: 5,
    completedModules: 12,
    contentCompletion: 0.75,
    averageScore: 85,
    recentActivity: [
      { title: 'Content Analysis', date: '2024-02-20', type: 'PDF' },
      { title: 'Question Generation', date: '2024-02-19', type: 'Video' },
    ],
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Learning Progress</ThemedText>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <ThemedText type="title">{analyticsData.totalCourses}</ThemedText>
              <ThemedText>Courses</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title">{analyticsData.completedModules}</ThemedText>
              <ThemedText>Modules</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title">{analyticsData.averageScore}%</ThemedText>
              <ThemedText>Score</ThemedText>
            </View>
          </View>

          <View style={styles.progressSection}>
            <ThemedText type="subtitle">Content Completion</ThemedText>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${analyticsData.contentCompletion * 100}%` }
                ]} 
              />
            </View>
            <ThemedText style={styles.progressValue}>
              {Math.round(analyticsData.contentCompletion * 100)}%
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Recent Activity</ThemedText>
          {analyticsData.recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View>
                <ThemedText type="defaultSemiBold">{activity.title}</ThemedText>
                <ThemedText style={styles.activityDate}>{activity.date}</ThemedText>
              </View>
              <ThemedText style={styles.activityType}>{activity.type}</ThemedText>
            </View>
          ))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  cardTitle: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  progressSection: {
    marginTop: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  progressValue: {
    textAlign: 'right',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityDate: {
    fontSize: 12,
    marginTop: 2,
  },
  activityType: {
    fontSize: 12,
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});

export default Analytics; 