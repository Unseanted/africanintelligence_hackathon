import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface StatsSectionProps {
  stats: {
    coursesCompleted: number;
    totalXP: number;
    currentStreak: number;
  };
  colors: {
    CARD_BACKGROUND: string;
    BORDER_COLOR: string;
    TEXT_PRIMARY: string;
    TEXT_SECONDARY: string;
  };
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats, colors }) => (
  <View style={styles.statsContainer}>
    <Card style={[styles.statCard, { backgroundColor: colors.CARD_BACKGROUND, borderColor: colors.BORDER_COLOR }]}> 
      <Card.Content>
        <Text style={[styles.statValue, { color: colors.TEXT_PRIMARY }]}>{stats.coursesCompleted}</Text>
        <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>Courses</Text>
      </Card.Content>
    </Card>
    <Card style={[styles.statCard, { backgroundColor: colors.CARD_BACKGROUND, borderColor: colors.BORDER_COLOR }]}> 
      <Card.Content>
        <Text style={[styles.statValue, { color: colors.TEXT_PRIMARY }]}>{stats.totalXP}</Text>
        <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>Total XP</Text>
      </Card.Content>
    </Card>
    <Card style={[styles.statCard, { backgroundColor: colors.CARD_BACKGROUND, borderColor: colors.BORDER_COLOR }]}> 
      <Card.Content>
        <Text style={[styles.statValue, { color: colors.TEXT_PRIMARY }]}>{stats.currentStreak}</Text>
        <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>Day Streak</Text>
      </Card.Content>
    </Card>
  </View>
);

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StatsSection; 