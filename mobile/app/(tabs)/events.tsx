import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EventsPage() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Events</ThemedText>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Upcoming Events</ThemedText>
          
          <Card style={styles.eventCard}>
            <Card.Content>
              <View style={styles.eventHeader}>
                <MaterialCommunityIcons name="calendar" size={24} color="#6366f1" />
                <View style={styles.eventInfo}>
                  <ThemedText style={styles.eventTitle}>AI Workshop: Introduction to Machine Learning</ThemedText>
                  <ThemedText style={styles.eventDate}>March 15, 2024 • 2:00 PM</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.eventDescription}>
                Learn the fundamentals of machine learning and how to implement basic algorithms.
              </ThemedText>
              <View style={styles.eventStats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="account-group" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>45 registered</ThemedText>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>2 hours</ThemedText>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.registerButton}
                theme={{ colors: { primary: '#6366f1' } }}
              >
                Register Now
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.eventCard}>
            <Card.Content>
              <View style={styles.eventHeader}>
                <MaterialCommunityIcons name="code-braces" size={24} color="#22c55e" />
                <View style={styles.eventInfo}>
                  <ThemedText style={styles.eventTitle}>Hackathon: AI for Social Good</ThemedText>
                  <ThemedText style={styles.eventDate}>March 20-22, 2024</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.eventDescription}>
                Join us for a 48-hour hackathon focused on using AI to solve social challenges.
              </ThemedText>
              <View style={styles.eventStats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="account-group" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>120 registered</ThemedText>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="trophy" size={16} color="#9ca3af" />
                  <ThemedText style={styles.statText}>$10,000 in prizes</ThemedText>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.registerButton}
                theme={{ colors: { primary: '#22c55e' } }}
              >
                Register Now
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Past Events */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Past Events</ThemedText>
          <Card style={styles.eventCard}>
            <Card.Content>
              <View style={styles.eventHeader}>
                <MaterialCommunityIcons name="presentation" size={24} color="#6b7280" />
                <View style={styles.eventInfo}>
                  <ThemedText style={styles.eventTitle}>Webinar: Future of AI in Education</ThemedText>
                  <ThemedText style={styles.eventDate}>February 28, 2024</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.eventDescription}>
                Recording available for registered participants.
              </ThemedText>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.watchButton}
                theme={{ colors: { primary: '#6b7280' } }}
              >
                Watch Recording
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
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  eventDescription: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 16,
  },
  eventStats: {
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
  registerButton: {
    marginTop: 8,
  },
  watchButton: {
    marginTop: 8,
    borderColor: '#6b7280',
  },
}); 