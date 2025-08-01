import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../app/contexts/ThemeContext';

interface XPProgressProps {
  currentXp: number;
  nextLevelXp: number;
  level: number;
}

export default function XPProgress({ currentXp, nextLevelXp, level }: XPProgressProps) {
  const { colors } = useTheme();
  
  const progress = currentXp / nextLevelXp;
  const xpToNext = nextLevelXp - currentXp;
  
  return (
    <Card style={[styles.container, { backgroundColor: colors.surface }]} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.levelContainer}>
            <MaterialCommunityIcons 
              name="star-circle" 
              size={32} 
              color={colors.primary} 
            />
            <Text style={[styles.levelText, { color: colors.primary }]}>
              Level {level}
            </Text>
          </View>
          <Text style={[styles.xpText, { color: colors.onSurfaceVariant }]}>
            {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            color={colors.primary}
            style={[styles.progressBar, { backgroundColor: `${colors.primary}20` }]}
          />
          <Text style={[styles.remainingText, { color: colors.onSurfaceVariant }]}>
            {xpToNext.toLocaleString()} XP to Level {level + 1}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 12,
    textAlign: 'center',
  },
});