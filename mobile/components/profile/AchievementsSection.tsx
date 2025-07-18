import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AchievementsSectionProps {
  expanded: boolean;
  onToggle: () => void;
  stats: {
    certificates: number;
    achievements: number;
  };
  colors: {
    CARD_BACKGROUND: string;
    BORDER_COLOR: string;
    TEXT_PRIMARY: string;
    TEXT_SECONDARY: string;
  };
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({ expanded, onToggle, stats, colors }) => (
  <>
    <TouchableOpacity onPress={onToggle}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Achievements</Text>
        <Icon 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color={colors.TEXT_PRIMARY} 
        />
      </View>
    </TouchableOpacity>
    {expanded && (
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { backgroundColor: colors.CARD_BACKGROUND, borderColor: colors.BORDER_COLOR }]}> 
          <Card.Content>
            <Text style={[styles.statValue, { color: colors.TEXT_PRIMARY }]}>{stats.certificates}</Text>
            <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>Certificates</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: colors.CARD_BACKGROUND, borderColor: colors.BORDER_COLOR }]}> 
          <Card.Content>
            <Text style={[styles.statValue, { color: colors.TEXT_PRIMARY }]}>{stats.achievements}</Text>
            <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>Badges</Text>
          </Card.Content>
        </Card>
      </View>
    )}
  </>
);

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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AchievementsSection; 