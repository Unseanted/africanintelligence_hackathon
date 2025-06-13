import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card } from 'react-native-paper';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

interface Discussion {
  id: string;
  title: string;
  author: string;
  replies: number;
  lastActivity: string;
}

export default function Forum() {
  // Placeholder data - replace with actual data fetching
  const discussions: Discussion[] = [
    {
      id: '1',
      title: 'Understanding AI Basics',
      author: 'John Doe',
      replies: 5,
      lastActivity: '2h ago',
    },
    {
      id: '2',
      title: 'Machine Learning Project Help',
      author: 'Jane Smith',
      replies: 3,
      lastActivity: '5h ago',
    },
    {
      id: '3',
      title: 'Deep Learning Resources',
      author: 'Mike Johnson',
      replies: 8,
      lastActivity: '1d ago',
    },
  ];

  const renderDiscussion = ({ item }: { item: Discussion }) => (
    <Card style={styles.card}>
      <Card.Content>
        <ThemedText type="subtitle">{item.title}</ThemedText>
        <View style={styles.discussionMeta}>
          <ThemedText>By {item.author}</ThemedText>
          <View style={styles.stats}>
            <ThemedText>{item.replies} replies</ThemedText>
            <ThemedText style={styles.lastActivity}>{item.lastActivity}</ThemedText>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Discussion Forum</ThemedText>
      <FlatList
        data={discussions}
        renderItem={renderDiscussion}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    marginBottom: 8,
  },
  discussionMeta: {
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  lastActivity: {
    fontSize: 12,
  },
}); 