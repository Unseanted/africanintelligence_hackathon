import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PRIMARY } from '../../constants/colors';

export default function Events() {
  const upcomingEvents = [
    {
      id: '1',
      title: 'AI Workshop',
      date: 'March 15, 2024',
      time: '10:00 AM - 2:00 PM',
      location: 'Virtual',
      description: 'Learn about the latest developments in AI and machine learning.',
      attendees: 45,
    },
    {
      id: '2',
      title: 'Hackathon',
      date: 'March 20, 2024',
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
      date: 'February 28, 2024',
      time: '2:00 PM - 4:00 PM',
      location: 'Virtual',
      description: 'Discussion about the future of AI and its impact on society.',
      attendees: 78,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.subtitle}>Join our community events</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {upcomingEvents.map((event) => (
          <Card key={event.id} style={styles.eventCard}>
            <Card.Content>
              <View style={styles.eventHeader}>
                <View style={styles.eventIcon}>
                  <MaterialCommunityIcons name="calendar-star" size={24} color={PRIMARY} />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
              </View>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#666666" />
                  <Text style={styles.eventDetailText}>{event.time}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#666666" />
                  <Text style={styles.eventDetailText}>{event.location}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="account-group" size={16} color="#666666" />
                  <Text style={styles.eventDetailText}>{event.attendees} attendees</Text>
                </View>
              </View>
              <Text style={styles.eventDescription}>{event.description}</Text>
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.registerButton}
                buttonColor={PRIMARY}
              >
                Register Now
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past Events</Text>
        {pastEvents.map((event) => (
          <Card key={event.id} style={styles.eventCard}>
            <Card.Content>
              <View style={styles.eventHeader}>
                <View style={styles.eventIcon}>
                  <MaterialCommunityIcons name="calendar-check" size={24} color="#666666" />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
              </View>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#666666" />
                  <Text style={styles.eventDetailText}>{event.time}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#666666" />
                  <Text style={styles.eventDetailText}>{event.location}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <MaterialCommunityIcons name="account-group" size={16} color="#666666" />
                  <Text style={styles.eventDetailText}>{event.attendees} attendees</Text>
                </View>
              </View>
              <Text style={styles.eventDescription}>{event.description}</Text>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.viewRecordingButton}
                textColor={PRIMARY}
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
  eventCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: 'rgba(255, 191, 0, 0.1)',
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
    color: '#000000',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#666666',
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
    color: '#666666',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  registerButton: {
    borderRadius: 8,
  },
  viewRecordingButton: {
    borderRadius: 8,
    borderColor: PRIMARY,
  },
}); 