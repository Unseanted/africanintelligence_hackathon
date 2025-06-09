import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, ProgressBar } from 'react-native-paper';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ChallengesPage() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Challenges</ThemedText>

        {/* Active Challenges */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Active Challenges</ThemedText>
          
          <Card style={styles.challengeCard}>
            <Card.Content>
              <View style={styles.challengeHeader}>
                <MaterialCommunityIcons name="cpu" size={24} color="#6366f1" />
                <View style={styles.challengeInfo}>
                  <ThemedText style={styles.challengeTitle}>AI Image Recognition</ThemedText>
                  <ThemedText style={styles.challengeSubtitle}>3 days remaining</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.challengeDescription}>
                Build an AI model that can accurately classify images into 10 different categories.
              </ThemedText>
              <View style={styles.challengeStats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="account-group" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>45 participants</ThemedText>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="trophy" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>500 points</ThemedText>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <ThemedText style={styles.progressText}>Your Progress</ThemedText>
                <ProgressBar
                  progress={0.7}
                  color="#6366f1"
                  style={styles.progressBar}
                />
                <ThemedText style={styles.progressPercentage}>70%</ThemedText>
              </View>
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.continueButton}
                theme={{ colors: { primary: '#6366f1' } }}
              >
                Continue Challenge
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Available Challenges */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Available Challenges</ThemedText>
          
          <Card style={styles.challengeCard}>
            <Card.Content>
              <View style={styles.challengeHeader}>
                <MaterialCommunityIcons name="code-braces" size={24} color="#22c55e" />
                <View style={styles.challengeInfo}>
                  <ThemedText style={styles.challengeTitle}>Natural Language Processing</ThemedText>
                  <ThemedText style={styles.challengeSubtitle}>Starts in 2 days</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.challengeDescription}>
                Create a sentiment analysis model that can accurately classify text into positive, negative, or neutral.
              </ThemedText>
              <View style={styles.challengeStats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>7 days duration</ThemedText>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="trophy" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>750 points</ThemedText>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.registerButton}
                theme={{ colors: { primary: '#22c55e' } }}
              >
                Register Interest
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.challengeCard}>
            <Card.Content>
              <View style={styles.challengeHeader}>
                <MaterialCommunityIcons name="robot" size={24} color="#a855f7" />
                <View style={styles.challengeInfo}>
                  <ThemedText style={styles.challengeTitle}>Reinforcement Learning</ThemedText>
                  <ThemedText style={styles.challengeSubtitle}>Coming soon</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.challengeDescription}>
                Develop an AI agent that can learn to play a simple game using reinforcement learning algorithms.
              </ThemedText>
              <View style={styles.challengeStats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>10 days duration</ThemedText>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="trophy" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>1000 points</ThemedText>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.registerButton}
                theme={{ colors: { primary: '#a855f7' } }}
              >
                Register Interest
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Completed Challenges */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Completed Challenges</ThemedText>
          <Card style={styles.challengeCard}>
            <Card.Content>
              <View style={styles.challengeHeader}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                <View style={styles.challengeInfo}>
                  <ThemedText style={styles.challengeTitle}>Data Visualization</ThemedText>
                  <ThemedText style={styles.challengeSubtitle}>Completed 2 weeks ago</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.challengeDescription}>
                Created interactive visualizations for a complex dataset using D3.js and React.
              </ThemedText>
              <View style={styles.challengeStats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="star" size={16} color="#eab308" />
                  <ThemedText style={styles.statText}>3rd Place</ThemedText>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="trophy" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>500 points earned</ThemedText>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.viewButton}
                theme={{ colors: { primary: '#10b981' } }}
              >
                View Submission
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
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  challengeSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 16,
  },
  challengeStats: {
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
  registerButton: {
    marginTop: 8,
  },
  viewButton: {
    marginTop: 8,
  },
}); 