import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ForumPage() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Forum</ThemedText>
        
        {/* Forum Categories */}
        <View style={styles.categoriesContainer}>
          <Card style={styles.categoryCard}>
            <Card.Content>
              <View style={styles.categoryHeader}>
                <MaterialCommunityIcons name="message-square" size={24} color="#6366f1" />
                <Text style={styles.categoryTitle}>General Discussion</Text>
              </View>
              <Text style={styles.categoryDescription}>
                Discuss general topics about AI and technology
              </Text>
              <Text style={styles.stats}>24 topics • 156 posts</Text>
            </Card.Content>
          </Card>

          <Card style={styles.categoryCard}>
            <Card.Content>
              <View style={styles.categoryHeader}>
                <MaterialCommunityIcons name="code-braces" size={24} color="#22c55e" />
                <Text style={styles.categoryTitle}>Technical Support</Text>
              </View>
              <Text style={styles.categoryDescription}>
                Get help with technical issues and coding problems
              </Text>
              <Text style={styles.stats}>18 topics • 89 posts</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Discussions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Recent Discussions</ThemedText>
          <Card style={styles.discussionCard}>
            <Card.Content>
              <Text style={styles.discussionTitle}>Understanding Neural Networks</Text>
              <Text style={styles.discussionMeta}>
                Posted by John Doe • 2 hours ago
              </Text>
              <Text style={styles.discussionPreview}>
                I'm having trouble understanding the backpropagation algorithm...
              </Text>
              <View style={styles.discussionStats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="eye" size={16} color="#9ca3af" />
                  <Text style={styles.statText}>245 views</Text>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="comment" size={16} color="#9ca3af" />
                  <Text style={styles.statText}>12 replies</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        <Button
          mode="contained"
          onPress={() => {}}
          style={styles.newTopicButton}
          theme={{ colors: { primary: '#6366f1' } }}
        >
          Start New Topic
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
  categoriesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  stats: {
    fontSize: 12,
    color: '#6b7280',
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
  discussionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  discussionMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  discussionPreview: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 12,
  },
  discussionStats: {
    flexDirection: 'row',
    gap: 16,
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
  newTopicButton: {
    marginTop: 16,
  },
}); 