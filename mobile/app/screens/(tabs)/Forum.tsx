import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Searchbar, FAB, Chip, useTheme } from 'react-native-paper';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ForumThread: { threadId: string };
  CreateThread: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Discussion {
  id: string;
  title: string;
  author: string;
  replies: number;
  lastActivity: string;
  likes: number;
  category: string;
  isPopular?: boolean;
}

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();

  const categories = ['all', 'ai', 'ml', 'programming', 'projects', 'general'];

  // Placeholder data - replace with actual data fetching
  const discussions: Discussion[] = [
    {
      id: '1',
      title: 'Understanding AI Basics',
      author: 'John Doe',
      replies: 5,
      lastActivity: '2h ago',
      likes: 15,
      category: 'ai',
      isPopular: true
    },
    {
      id: '2',
      title: 'Machine Learning Project Help',
      author: 'Jane Smith',
      replies: 3,
      lastActivity: '5h ago',
      likes: 8,
      category: 'ml'
    },
    {
      id: '3',
      title: 'Deep Learning Resources',
      author: 'Mike Johnson',
      replies: 8,
      lastActivity: '1d ago',
      likes: 20,
      category: 'ml',
      isPopular: true
    },
  ];

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularThreads = discussions.filter(d => d.isPopular);

  const renderDiscussion = ({ item }: { item: Discussion }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ForumThread', { threadId: item.id })}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <ThemedText type="subtitle">{item.title}</ThemedText>
            {item.isPopular && (
              <Chip icon="star" style={styles.popularChip}>Popular</Chip>
            )}
          </View>
          <View style={styles.discussionMeta}>
            <ThemedText>By {item.author}</ThemedText>
            <View style={styles.stats}>
              <ThemedText>{item.replies} replies</ThemedText>
              <ThemedText>{item.likes} likes</ThemedText>
              <ThemedText style={styles.lastActivity}>{item.lastActivity}</ThemedText>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Discussion Forum</ThemedText>
      
      <Searchbar
        placeholder="Search discussions..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map(category => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={styles.categoryChip}
          >
            {category.toUpperCase()}
          </Chip>
        ))}
      </ScrollView>

      {popularThreads.length > 0 && (
        <View style={styles.popularSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Popular Threads</ThemedText>
          <FlatList
            data={popularThreads}
            renderItem={renderDiscussion}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <ThemedText type="subtitle" style={styles.sectionTitle}>All Discussions</ThemedText>
      <FlatList
        data={filteredDiscussions}
        renderItem={renderDiscussion}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CreateThread')}
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
  searchBar: {
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  list: {
    gap: 12,
  },
  card: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  popularChip: {
    backgroundColor: '#FFD700',
  },
  popularSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 