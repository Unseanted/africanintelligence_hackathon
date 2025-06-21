import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PRIMARY } from '../../constants/colors';

export default function Challenges() {
  const activeChallenges = [
    {
      id: '1',
      title: 'AI Model Training',
      description: 'Train a machine learning model to classify images with 90% accuracy.',
      deadline: 'March 25, 2024',
      participants: 45,
      progress: 0.6,
      points: 500,
    },
    {
      id: '2',
      title: 'Data Visualization',
      description: 'Create an interactive dashboard using Python and Plotly.',
      deadline: 'March 30, 2024',
      participants: 32,
      progress: 0.3,
      points: 300,
    },
  ];

  const completedChallenges = [
    {
      id: '3',
      title: 'Python Basics',
      description: 'Complete 10 Python programming exercises.',
      completedDate: 'February 28, 2024',
      points: 200,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
        <Text style={styles.subtitle}>Test your skills and earn points</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        {activeChallenges.map((challenge) => (
          <Card key={challenge.id} style={styles.challengeCard}>
            <Card.Content>
              <View style={styles.challengeHeader}>
                <View style={styles.challengeIcon}>
                  <MaterialCommunityIcons name="trophy" size={24} color={PRIMARY} />
                </View>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengePoints}>{challenge.points} points</Text>
                </View>
              </View>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              <View style={styles.challengeDetails}>
                <View style={styles.challengeDetail}>
                  <MaterialCommunityIcons name="calendar-clock" size={16} color="#666666" />
                  <Text style={styles.challengeDetailText}>Due: {challenge.deadline}</Text>
                </View>
                <View style={styles.challengeDetail}>
                  <MaterialCommunityIcons name="account-group" size={16} color="#666666" />
                  <Text style={styles.challengeDetailText}>{challenge.participants} participants</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Progress: {Math.round(challenge.progress * 100)}%</Text>
                <ProgressBar
                  progress={challenge.progress}
                  color={PRIMARY}
                  style={styles.progressBar}
                />
              </View>
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.continueButton}
                buttonColor={PRIMARY}
              >
                Continue Challenge
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completed Challenges</Text>
        {completedChallenges.map((challenge) => (
          <Card key={challenge.id} style={styles.challengeCard}>
            <Card.Content>
              <View style={styles.challengeHeader}>
                <View style={styles.challengeIcon}>
                  <MaterialCommunityIcons name="trophy-award" size={24} color="#666666" />
                </View>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengePoints}>{challenge.points} points earned</Text>
                </View>
              </View>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              <View style={styles.challengeDetails}>
                <View style={styles.challengeDetail}>
                  <MaterialCommunityIcons name="calendar-check" size={16} color="#666666" />
                  <Text style={styles.challengeDetailText}>Completed: {challenge.completedDate}</Text>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.viewDetailsButton}
                textColor={PRIMARY}
              >
                View Details
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  challengeCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 191, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  challengePoints: {
    fontSize: 14,
    color: '#666666',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  challengeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  challengeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeDetailText: {
    fontSize: 14,
    color: '#666666',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  continueButton: {
    borderRadius: 8,
  },
  viewDetailsButton: {
    borderRadius: 8,
    borderColor: PRIMARY,
  },
}); 