import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useTheme } from '../../app/contexts/ThemeContext';

interface StatsSectionProps {
  stats: {
    coursesCompleted: number;
    totalXP: number;
    currentStreak: number;
  };
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.statsContainer}>
      <Card style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
        <Card.Content>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.coursesCompleted ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Courses</Text>
        </Card.Content>
      </Card>
      <Card style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
        <Card.Content>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.totalXP ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total XP</Text>
        </Card.Content>
      </Card>
      <Card style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
        <Card.Content>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.currentStreak ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

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
    fontWeight: 'bold' as 'bold',
    textAlign: 'center' as 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center' as 'center',
  },
});

export default StatsSection;