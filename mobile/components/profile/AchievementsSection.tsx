import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useTheme } from '../../app/contexts/ThemeContext';

interface AchievementsSectionProps {
  expanded: boolean;
  onToggle: () => void;
  stats: {
    certificates: number;
    achievements: number;
  };
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({ expanded, onToggle, stats }) => {
  const { colors } = useTheme();

  return (
    <>
      <TouchableOpacity onPress={onToggle}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.text}
          />
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
            <Card.Content>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.certificates}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Certificates</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
            <Card.Content>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.achievements}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Badges</Text>
            </Card.Content>
          </Card>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as 'bold',
  },
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

export default AchievementsSection;