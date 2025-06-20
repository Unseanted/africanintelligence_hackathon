import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { ThemedView } from '../../../components/ThemedView';
import { ThemedText } from '../../../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ApiDocsPage() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>API Documentation</ThemedText>

        {/* Quick Start */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Start</ThemedText>
          <Card style={styles.codeCard}>
            <Card.Content>
              <ThemedText style={styles.codeBlock}>
                {`npm install @africanintelligence/api-client

import { ApiClient } from '@africanintelligence/api-client';

const client = new ApiClient({
  apiKey: 'your-api-key',
  environment: 'production'
});`}
              </ThemedText>
            </Card.Content>
          </Card>
        </View>

        {/* Authentication */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Authentication</ThemedText>
          <Card style={styles.docCard}>
            <Card.Content>
              <View style={styles.endpointHeader}>
                <MaterialCommunityIcons name="key" size={24} color="#6366f1" />
                <ThemedText style={styles.endpointTitle}>API Key Authentication</ThemedText>
              </View>
              <ThemedText style={styles.endpointDescription}>
                All API requests require authentication using an API key. Include your API key in the Authorization header:
              </ThemedText>
              <Card style={styles.codeCard}>
                <Card.Content>
                  <ThemedText style={styles.codeBlock}>
                    Authorization: Bearer your-api-key
                  </ThemedText>
                </Card.Content>
              </Card>
            </Card.Content>
          </Card>
        </View>

        {/* Endpoints */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Endpoints</ThemedText>
          
          <Card style={styles.docCard}>
            <Card.Content>
              <View style={styles.endpointHeader}>
                <MaterialCommunityIcons name="api" size={24} color="#22c55e" />
                <ThemedText style={styles.endpointTitle}>Get User Profile</ThemedText>
              </View>
              <ThemedText style={styles.endpointMethod}>GET /api/v1/users/profile</ThemedText>
              <ThemedText style={styles.endpointDescription}>
                Retrieve the profile information for the authenticated user.
              </ThemedText>
              <Card style={styles.codeCard}>
                <Card.Content>
                  <ThemedText style={styles.codeBlock}>
                    {`const profile = await client.users.getProfile();

console.log(profile);
// {
//   id: 'user_123',
//   name: 'John Doe',
//   email: 'john@example.com',
//   role: 'student'
// }`}
                  </ThemedText>
                </Card.Content>
              </Card>
            </Card.Content>
          </Card>

          <Card style={styles.docCard}>
            <Card.Content>
              <View style={styles.endpointHeader}>
                <MaterialCommunityIcons name="api" size={24} color="#22c55e" />
                <ThemedText style={styles.endpointTitle}>List Courses</ThemedText>
              </View>
              <ThemedText style={styles.endpointMethod}>GET /api/v1/courses</ThemedText>
              <ThemedText style={styles.endpointDescription}>
                Retrieve a list of available courses with optional filtering.
              </ThemedText>
              <Card style={styles.codeCard}>
                <Card.Content>
                  <ThemedText style={styles.codeBlock}>
                    {`const courses = await client.courses.list({
  category: 'machine-learning',
  limit: 10,
  offset: 0
});`}
                  </ThemedText>
                </Card.Content>
              </Card>
            </Card.Content>
          </Card>
        </View>

        <Button
          mode="contained"
          onPress={() => {}}
          style={styles.viewMoreButton}
          theme={{ colors: { primary: '#6366f1' } }}
        >
          View Full Documentation
        </Button>
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
  docCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  endpointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  endpointTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  endpointMethod: {
    fontSize: 14,
    color: '#22c55e',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  endpointDescription: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 16,
  },
  codeCard: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
  },
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#d1d5db',
  },
  viewMoreButton: {
    marginTop: 16,
  },
}); 