import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

interface Course {
  id: string;
  title: string;
  progress: number;
}

export default function CoursesList() {
  // Placeholder data - replace with actual data fetching
  const courses: Course[] = [
    { id: '1', title: 'Introduction to AI', progress: 75 },
    { id: '2', title: 'Machine Learning Basics', progress: 30 },
    { id: '3', title: 'Deep Learning Fundamentals', progress: 0 },
  ];

  const renderCourse = ({ item }: { item: Course }) => (
    <ThemedView style={styles.courseCard}>
      <ThemedText type="subtitle">{item.title}</ThemedText>
      <ThemedText>Progress: {item.progress}%</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>My Courses</ThemedText>
      <FlatList
        data={courses}
        renderItem={renderCourse}
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
  courseCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
}); 