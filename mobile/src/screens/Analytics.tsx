import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, ProgressBar } from 'react-native-paper';

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
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Title title="Learning Progress" />
          <Card.Content>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analyticsData.totalCourses}</Text>
                <Text style={styles.statLabel}>Courses</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analyticsData.completedModules}</Text>
                <Text style={styles.statLabel}>Modules</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analyticsData.averageScore}%</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Content Completion</Text>
              <ProgressBar
                progress={analyticsData.contentCompletion}
                style={styles.progressBar}
                color="#2563eb"
              />
              <Text style={styles.progressValue}>
                {Math.round(analyticsData.contentCompletion * 100)}%
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Recent Activity" />
          <Card.Content>
            {analyticsData.recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
                <Text style={styles.activityType}>{activity.type}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressSection: {
    marginTop: 16,
  },
  progressLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressValue: {
    textAlign: 'right',
    marginTop: 4,
    color: '#666',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activityType: {
    fontSize: 12,
    color: '#2563eb',
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});

export default Analytics; 