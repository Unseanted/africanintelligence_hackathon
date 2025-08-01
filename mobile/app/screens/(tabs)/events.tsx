import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext'; // Adjust the import path as needed

export default function Events() {
  const { colors } = useTheme(); // Get colors from ThemeContext

  const upcomingEvents = [
    {
      id: '1',
      title: 'AI Workshop',
      date: 'August 15, 2025', // Updated to future date
      time: '10:00 AM - 2:00 PM',
      location: 'Virtual',
      description: 'Learn about the latest developments in AI and machine learning.',
      attendees: 45,
    },
    {
      id: '2',
      title: 'Hackathon',
      date: 'August 20, 2025', // Updated to future date
      time: '9:00 AM - 5:00 PM',
      location: 'Main Campus',
      description: 'Build innovative solutions using AI and emerging technologies.',
      attendees: 120,
    },
  ];

  const pastEvents = [
    {
      id: '3',
      title: 'Tech Talk: Future of AI',
      date: 'July 15, 2025', // Updated to recent past date
      time: '2:00 PM - 4:00 PM',
      location: 'Virtual',
      description: 'Discussion about the future of AI and its impact on society.',
      attendees: 78,
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Events</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Join our community events
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Events</Text>
        {upcomingEvents.map((event) => (
          <Card key={event.id} style={[styles.eventCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
            <Card.Content>
              <View style={styles.eventHeader}>
                <View style={[styles.eventIcon, { backgroundColor: `${colors.primary}1A` }]}>
                  <MaterialCommunityIcons name="calendar-star" size={24} color={colors.primary} />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                  <Text style={[styles.eventDate, { color: colors.textSecondary }]}>{event.date}</Text>
                </View>
              </View>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>{event.time}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
                  <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>{event.location}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="account-group" size={16} color={colors.textSecondary} />
                  <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                    {event.attendees} attendees
                  </Text>
                </View>
              </View>
              <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                {event.description}
              </Text>
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.registerButton}
                buttonColor={colors.primary}
                textColor={colors.onPrimary}
              >
                Register Now
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Past Events</Text>
        {pastEvents.map((event) => (
          <Card key={event.id} style={[styles.eventCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
            <Card.Content>
              <View style={styles.eventHeader}>
                <View style={[styles.eventIcon, { backgroundColor: `${colors.primary}1A` }]}>
                  <MaterialCommunityIcons name="calendar-check" size={24} color={colors.textSecondary} />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                  <Text style={[styles.eventDate, { color: colors.textSecondary }]}>{event.date}</Text>
                </View>
              </View>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>{event.time}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
                  <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>{event.location}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="account-group" size={16} color={colors.textSecondary} />
                  <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                    {event.attendees} attendees
                  </Text>
                </View>
              </View>
              <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                {event.description}
              </Text>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={[styles.viewRecordingButton, { borderColor: colors.primary }]}
                textColor={colors.primary}
              >
                View Recording
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
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventCard: {
    marginBottom: 16,
    borderWidth: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDetailText: {
    fontSize: 14,
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  registerButton: {
    borderRadius: 8,
  },
  viewRecordingButton: {
    borderRadius: 8,
  },
});