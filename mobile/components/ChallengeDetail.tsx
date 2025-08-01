import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Button,
  Card,
  Chip,
  Avatar,
  Divider,
  IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../app/contexts/ThemeContext';

// Type definitions
interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'upcoming' | 'completed';
  startTime: number;
  endTime: number;
  participants: number;
  maxScore: number;
  difficulty: string;
  requirements?: string;
  rewards?: string;
  submissionType: string;
  timeLimit?: number;
}

interface ChallengeDetailProps {
  challenge: Challenge;
  onClose: () => void;
  onJoin: (challengeId: string) => void;
  isSubmitted: boolean;
  isWaitlisted: boolean;
  onJoinWaitlist: (challengeId: string) => void;
}

type CategoryType = 'health' | 'career' | 'relationships' | 'environment' | 'learning' | 'creativity' | 'global';
type DifficultyType = 'beginner' | 'intermediate' | 'advanced';
type SubmissionType = 'text' | 'video' | 'image' | 'quiz' | 'timed-quiz';

export default function ChallengeDetail({
  challenge,
  onClose,
  onJoin,
  isSubmitted,
  isWaitlisted,
  onJoinWaitlist
}: ChallengeDetailProps) {
  const { colors } = useTheme();

  const getCategoryIcon = (category: string): string => {
    const icons: Record<CategoryType, string> = {
      health: 'heart-pulse',
      career: 'briefcase',
      relationships: 'account-group',
      environment: 'leaf',
      learning: 'brain',
      creativity: 'music',
      global: 'earth'
    };
    return icons[category as CategoryType] || 'book-open';
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty?.toLowerCase() as DifficultyType) {
      case 'beginner': return colors.success;
      case 'intermediate': return colors.warning;
      case 'advanced': return colors.error;
      default: return colors.onSurfaceVariant;
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return 'Expired';

    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days, ${hours} hours`;
    return `${hours} hours`;
  };

  const getSubmissionIcon = (submissionType: string): string => {
    const iconMap: Record<SubmissionType, string> = {
      text: 'text-box',
      video: 'video',
      image: 'image',
      quiz: 'help-circle',
      'timed-quiz': 'timer'
    };
    return iconMap[submissionType as SubmissionType] || 'file-document';
  };

  const isActive = challenge.status === 'active';
  const isCompleted = challenge.status === 'completed';
  const isUpcoming = challenge.status === 'upcoming';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>
          Challenge Details
        </Text>
        <IconButton
          icon="close"
          size={24}
          onPress={onClose}
          iconColor={colors.onSurface}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Challenge Header */}
        <View style={styles.challengeHeader}>
          <Avatar.Icon
            size={64}
            icon={getCategoryIcon(challenge.category)}
            style={{ backgroundColor: `${colors.primary}20` }}
          />
          <View style={styles.headerText}>
            <Text style={[styles.challengeTitle, { color: colors.onSurface }]}>
              {challenge.title}
            </Text>
            <View style={styles.metaRow}>
              <Chip
                mode="flat"
                compact
                style={[styles.categoryChip, { backgroundColor: `${colors.primary}15` }]}
                textStyle={{ color: colors.primary, fontSize: 12 }}
              >
                {challenge.category}
              </Chip>
              <Chip
                mode="flat"
                compact
                style={[styles.difficultyChip, { backgroundColor: `${getDifficultyColor(challenge.difficulty)}15` }]}
                textStyle={{ color: getDifficultyColor(challenge.difficulty), fontSize: 12 }}
              >
                {challenge.difficulty}
              </Chip>
            </View>
          </View>
        </View>

        {/* Description */}
        <Card style={[styles.section, { backgroundColor: colors.surfaceVariant }]} mode="outlined">
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
              {challenge.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Challenge Stats */}
        <Card style={[styles.section, { backgroundColor: colors.surface }]} mode="outlined">
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Challenge Stats
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account-group" size={20} color={colors.primary} />
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                  Participants
                </Text>
                <Text style={[styles.statValue, { color: colors.onSurface }]}>
                  {challenge.participants.toLocaleString()}
                </Text>
              </View>

              <View style={styles.statItem}>
                <MaterialCommunityIcons name="trophy" size={20} color={colors.secondary} />
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                  Max XP
                </Text>
                <Text style={[styles.statValue, { color: colors.onSurface }]}>
                  {challenge.maxScore}
                </Text>
              </View>

              {isActive && (
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={colors.tertiary} />
                  <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                    Time Left
                  </Text>
                  <Text style={[styles.statValue, { color: colors.onSurface }]}>
                    {formatTimeRemaining(challenge.endTime - Date.now())}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Timeline */}
        <Card style={[styles.section, { backgroundColor: colors.surface }]} mode="outlined">
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Timeline
            </Text>
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <MaterialCommunityIcons name="play-circle" size={16} color={colors.primary} />
                <Text style={[styles.timelineLabel, { color: colors.onSurfaceVariant }]}>
                  Start Date
                </Text>
                <Text style={[styles.timelineValue, { color: colors.onSurface }]}>
                  {formatDate(challenge.startTime)}
                </Text>
              </View>
              <View style={styles.timelineItem}>
                <MaterialCommunityIcons name="stop-circle" size={16} color={colors.secondary} />
                <Text style={[styles.timelineLabel, { color: colors.onSurfaceVariant }]}>
                  End Date
                </Text>
                <Text style={[styles.timelineValue, { color: colors.onSurface }]}>
                  {formatDate(challenge.endTime)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Requirements */}
        {challenge.requirements && (
          <Card style={[styles.section, { backgroundColor: colors.surface }]} mode="outlined">
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Requirements
              </Text>
              <Text style={[styles.requirementsText, { color: colors.onSurfaceVariant }]}>
                {challenge.requirements}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Rewards */}
        {challenge.rewards && (
          <Card style={[styles.section, { backgroundColor: colors.surface }]} mode="outlined">
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Rewards
              </Text>
              <Text style={[styles.rewardsText, { color: colors.onSurfaceVariant }]}>
                {challenge.rewards}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Submission Type */}
        <Card style={[styles.section, { backgroundColor: colors.surfaceVariant }]} mode="outlined">
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Submission Type
            </Text>
            <View style={styles.submissionType}>
              <MaterialCommunityIcons
                name={getSubmissionIcon(challenge.submissionType) as any}
                size={20}
                color={colors.primary}
              />

              <Text style={[styles.submissionTypeText, { color: colors.onSurface }]}>
                {challenge.submissionType?.replace('-', ' ').toUpperCase() || 'DOCUMENT'}
              </Text>
              {challenge.timeLimit && (
                <Chip
                  mode="outlined"
                  compact
                  icon="timer"
                  style={{ borderColor: colors.warning }}
                  textStyle={{ color: colors.warning, fontSize: 10 }}
                >
                  {challenge.timeLimit} min limit
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Divider />

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isCompleted ? (
          <Button
            mode="outlined"
            disabled
            style={styles.actionButton}
          >
            Challenge Completed ✓
          </Button>
        ) : isSubmitted ? (
          <Button
            mode="outlined"
            disabled
            style={styles.actionButton}
          >
            Solution Submitted ✓
          </Button>
        ) : isActive ? (
          <Button
            mode="contained"
            onPress={() => onJoin(challenge.id)}
            style={styles.actionButton}
          >
            Join Challenge
          </Button>
        ) : isUpcoming ? (
          <Button
            mode={isWaitlisted ? "outlined" : "contained"}
            onPress={() => onJoinWaitlist(challenge.id)}
            disabled={isWaitlisted}
            style={styles.actionButton}
          >
            {isWaitlisted ? "Joined Waitlist ✓" : "Join Waitlist"}
          </Button>
        ) : (
          <Button
            mode="outlined"
            disabled
            style={styles.actionButton}
          >
            View Only
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    height: 28,
  },
  difficultyChip: {
    height: 28,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeline: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineLabel: {
    fontSize: 14,
    flex: 1,
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  requirementsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  rewardsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  submissionType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submissionTypeText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    padding: 20,
    paddingTop: 16,
  },
  actionButton: {
    borderRadius: 8,
  },
});