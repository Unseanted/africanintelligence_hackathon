import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { ThemedView } from '../../../components/ThemedView';
import { ThemedText } from '../../../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Badges() {
  const badges = [
    { id: 1, name: 'Python Master', icon: 'language-python', color: '#3b82f6', progress: 100 },
    { id: 2, name: 'Data Science', icon: 'chart-bar', color: '#6366f1', progress: 75 },
    { id: 3, name: 'Machine Learning', icon: 'brain', color: '#eab308', progress: 50 },
    { id: 4, name: 'AI Ethics', icon: 'shield-check', color: '#22c55e', progress: 25 },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Badges</ThemedText>
      <ScrollView style={styles.content}>
        <ThemedText style={styles.title}>Your Badges</ThemedText>
        
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <Card key={badge.id} style={styles.badgeCard}>
              <Card.Content style={styles.badgeContent}>
                <MaterialCommunityIcons 
                  name={badge.icon as any} 
                  size={32} 
                  color={badge.color} 
                />
                <ThemedText style={styles.badgeName}>{badge.name}</ThemedText>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${badge.progress}%`, backgroundColor: badge.color }
                    ]} 
                  />
                </View>
                <ThemedText style={styles.progressText}>{badge.progress}%</ThemedText>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  badgeContent: {
    alignItems: 'center',
    padding: 16,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 4,
  },
}); 