
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  FAB,
  Modal,
  Portal,
  Text,
} from 'react-native-paper';
import ChallengeAttempt from '../../../components/ChallengeAttempt';
import ChallengeDetail from '../../../components/ChallengeDetail';
import XPProgress from '../../../components/XPProgress';
import aiChallengeService from '../../../services/aiChallengeService';
import type { Challenge, Question } from '../../../types/Challenge';
import { useTheme } from '../../contexts/ThemeContext';


type UserStats = {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalChallenges: number;
  completedChallenges: number;
  streak: number;
};

type UserPreferences = {
  categories: string[];
  difficulty: string;
  interests: string[];
};

type ChallengesByStatus = {
  active: Challenge[];
  upcoming: Challenge[];
  completed: Challenge[];
};

export default function Challenges() {
  const { colors } = useTheme();
  const [challenges, setChallenges] = useState<ChallengesByStatus>({
    active: [],
    upcoming: [],
    completed: []
  });
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [attemptingChallenge, setAttemptingChallenge] = useState<Challenge | null>(null);
  const [submittedChallenges, setSubmittedChallenges] = useState<Set<string>>(new Set());
  const [waitlistedChallengeId, setWaitlistedChallengeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [userStats, setUserStats] = useState<UserStats>({
    level: 7,
    currentXp: 2150,
    nextLevelXp: 3000,
    totalChallenges: 23,
    completedChallenges: 18,
    streak: 12
  });
  const [userPreferences] = useState<UserPreferences>({
    categories: ['health', 'career', 'learning', 'creativity'],
    difficulty: 'mixed',
    interests: ['technology', 'fitness', 'personal-growth']
  });

  const scaleAnim = new Animated.Value(1);

  // AI Challenge Generation Function
  const generateAIChallenges = async (): Promise<ChallengesByStatus> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const aiResponse = await generatePersonalizedChallenges(userPreferences, userStats);
      return aiResponse;
    } catch (error) {
      console.error("AI challenge generation failed:", error);
      Alert.alert("Generation Error", "Couldn't generate challenges. Showing default set instead.");
      return getDefaultChallenges();
    } finally {
      setIsLoading(false);
    }
  };

  // AI-powered challenge generation function
  const generatePersonalizedChallenges = async (
    preferences: UserPreferences,
    stats: UserStats
  ): Promise<ChallengesByStatus> => {
    const categories = preferences.categories;
    const currentTime = Date.now();

    const challengeTemplates: Record<string, Omit<Challenge, 'id' | 'status' | 'startTime' | 'endTime' | 'participants' | 'category'>[]> = {
      health: [
        {
          title: 'Mindful Hydration Challenge',
          description: 'Track and maintain optimal water intake daily with mindfulness techniques. Learn to recognize your body\'s hydration signals and develop sustainable habits.',
          submissionType: 'text',
          difficulty: 'Beginner',
          maxScore: 350,
          requirements: '',
          rewards: '',
          questions: []
        },
        {
          title: 'Morning Movement Ritual',
          description: 'Establish a 15-minute morning movement routine combining stretching, breathing, and light exercise to energize your day.',
          submissionType: 'video',
          difficulty: 'Beginner',
          maxScore: 400,
          requirements: '',
          rewards: '',
          questions: []
        }
      ],
      // ... other categories
    };

    // Generate active challenges
    const activeTemplates = categories.flatMap(cat => challengeTemplates[cat] || []);
    const selectedActive = activeTemplates.slice(0, 3).map((template, index) => ({
      id: `ai-active-${currentTime}-${index}`,
      ...template,
      category: categories[index % categories.length],
      status: 'active' as const,
      startTime: currentTime - Math.random() * 3 * 24 * 60 * 60 * 1000,
      endTime: currentTime + (7 + Math.random() * 14) * 24 * 60 * 60 * 1000,
      participants: Math.floor(Math.random() * 2000) + 200,
      requirements: 'Basic commitment and willingness to learn',
      rewards: 'Personal growth, new skills, achievement badges',
      questions: generateQuestionsForType(template.submissionType),
      aiPowered: true
    }));

    // Generate upcoming challenges
    const upcomingTemplates = activeTemplates.slice(3, 5);
    const selectedUpcoming = upcomingTemplates.map((template, index) => ({
      id: `ai-upcoming-${currentTime}-${index}`,
      ...template,
      category: categories[(index + 3) % categories.length],
      status: 'upcoming' as const,
      startTime: currentTime + (1 + Math.random() * 7) * 24 * 60 * 60 * 1000,
      endTime: currentTime + (8 + Math.random() * 21) * 24 * 60 * 60 * 1000,
      participants: 0,
      requirements: 'Pre-registration required',
      rewards: 'Early access, bonus XP, exclusive content',
      questions: generateQuestionsForType(template.submissionType),
      aiPowered: true
    }));

    // Generate completed challenges
    const completedTemplates = activeTemplates.slice(5, 7);
    const selectedCompleted = completedTemplates.map((template, index) => ({
      id: `ai-completed-${currentTime}-${index}`,
      ...template,
      category: categories[(index + 5) % categories.length],
      status: 'completed' as const,
      startTime: currentTime - (30 + Math.random() * 30) * 24 * 60 * 60 * 1000,
      endTime: currentTime - (7 + Math.random() * 23) * 24 * 60 * 60 * 1000,
      participants: Math.floor(Math.random() * 5000) + 1000,
      requirements: 'Challenge completed successfully',
      rewards: 'Achievement unlocked, XP earned, community recognition',
      questions: generateQuestionsForType(template.submissionType),
      aiPowered: true
    }));

    return {
      active: selectedActive,
      upcoming: selectedUpcoming,
      completed: selectedCompleted
    };
  };

  // Generate questions based on submission type
  const generateQuestionsForType = (submissionType: string): Question[] => {
    const questionSets: Record<string, Question[]> = {
      quiz: [
        {
          text: 'What is your primary motivation for taking this challenge?',
          options: [
            'Personal growth and development',
            'Building new habits',
            'Connecting with others',
            'Achieving specific goals'
          ],
          multiple: false
        },
        {
          text: 'Which strategies will you use to stay consistent?',
          options: [
            'Daily reminders and tracking',
            'Accountability partner',
            'Reward system',
            'Community support'
          ],
          multiple: true
        }
      ],
      'timed-quiz': [
        {
          text: 'What is the most important factor in successful habit formation?',
          options: [
            'Consistency over perfection',
            'Setting ambitious goals',
            'Having the right tools',
            'External motivation'
          ],
          multiple: false
        }
      ]
    };

    return questionSets[submissionType] || [
      {
        text: 'How will you approach this challenge?',
        type: 'text'
      }
    ];
  };

  // Fallback challenges if AI fails
  const getDefaultChallenges = (): ChallengesByStatus => ({
    active: [
      {
        id: 'default-1',
        title: 'Daily Mindfulness Practice',
        description: 'Practice 10 minutes of mindfulness meditation each day for a week.',
        category: 'health',
        status: 'active',
        startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
        endTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
        participants: 1234,
        maxScore: 300,
        difficulty: 'Beginner',
        requirements: 'Quiet space, 10 minutes daily',
        rewards: 'Reduced stress, better focus',
        submissionType: 'text',
        questions: [
          {
            text: 'Describe your meditation experience',
            type: 'text'
          }
        ],
        aiPowered: false
      }
    ],
    upcoming: [],
    completed: []
  });

  useEffect(() => {
    const loadChallenges = async () => {
      const aiChallenges = await generateAIChallenges();
      setChallenges(aiChallenges);
    };
    loadChallenges();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const newChallenges = await generateAIChallenges();
    setChallenges(newChallenges);
    setRefreshing(false);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const challenge = [
        ...challenges.active,
        ...challenges.upcoming,
        ...challenges.completed
      ].find(c => c.id === challengeId);

      if (challenge) {
        setAttemptingChallenge(challenge);
        setSelectedChallenge(null);
        Alert.alert("Challenge Started!", `You've begun the ${challenge.title} challenge.`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to join challenge. Please try again.");
    }
  };

  const handleSubmitSolution = async (challengeId: string, submission: any) => {
    try {
      const result = await aiChallengeService.submitChallenge(challengeId, submission);

      setSubmittedChallenges(prev => {
        const newSet = new Set(prev);
        newSet.add(challengeId);
        return newSet;
      });

      setUserStats(prev => ({
        ...prev,
        currentXp: prev.currentXp + (result.xpEarned || 150),
        completedChallenges: prev.completedChallenges + 1,
        streak: prev.streak + 1
      }));

      setAttemptingChallenge(null);
      Alert.alert("Submission Received!", `Your solution has been submitted successfully. +${result.xpEarned || 150} XP earned!`);
    } catch (error) {
      Alert.alert("Submission Failed", "There was an error submitting your solution.");
    }
  };

  const handleJoinWaitlist = async (challengeId: string) => {
    setWaitlistedChallengeId(challengeId);
    Alert.alert('Waitlist Joined', 'You have joined the waitlist for this challenge.');
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      health: 'heart-pulse',
      career: 'briefcase',
      relationships: 'account-group',
      environment: 'leaf',
      learning: 'brain',
      creativity: 'music',
      global: 'earth'
    };
    return icons[category] || 'book-open';
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return colors.success;
      case 'intermediate': return colors.warning;
      case 'advanced': return colors.error;
      default: return colors.onSurfaceVariant;
    }
  };

  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return 'Expired';

    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderChallengeCard = (challenge: Challenge) => {
    const isSubmitted = submittedChallenges.has(challenge.id);
    const isActive = challenge.status === 'active';
    const isCompleted = challenge.status === 'completed';
    const isUpcoming = challenge.status === 'upcoming';
    const isWaitlisted = isUpcoming && waitlistedChallengeId === challenge.id;

    return (
      <TouchableOpacity
        key={challenge.id}
        onPress={() => setSelectedChallenge(challenge)}
        activeOpacity={0.7}
      >
        <Card style={[styles.challengeCard, { backgroundColor: colors.surface }]} mode="outlined">
          <Card.Content>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIconContainer}>
                <Avatar.Icon
                  size={48}
                  icon={getCategoryIcon(challenge.category)}
                  style={{ backgroundColor: `${colors.primary}20` }}
                />
                {challenge.aiPowered && (
                  <View style={[styles.aiBadge, { backgroundColor: colors.primary }]}>
                    <MaterialCommunityIcons name="robot" size={12} color={colors.onPrimary} />
                  </View>
                )}
              </View>
              <View style={styles.challengeInfo}>
                <View style={styles.challengeTitleRow}>
                  <Text style={[styles.challengeTitle, { color: colors.onSurface }]} numberOfLines={2}>
                    {challenge.title}
                  </Text>
                  {isActive && (
                    <Chip
                      mode="outlined"
                      compact
                      icon="clock-outline"
                      style={[styles.timeChip, { borderColor: colors.primary }]}
                      textStyle={{ color: colors.primary, fontSize: 12 }}
                    >
                      {formatTimeRemaining(challenge.endTime - Date.now())}
                    </Chip>
                  )}
                </View>
                <View style={styles.challengeMeta}>
                  <Chip
                    mode="flat"
                    compact
                    style={[styles.categoryChip, { backgroundColor: `${colors.primary}15` }]}
                    textStyle={{ color: colors.primary, fontSize: 10 }}
                  >
                    {challenge.category}
                  </Chip>
                  <Chip
                    mode="flat"
                    compact
                    style={[styles.difficultyChip, { backgroundColor: `${getDifficultyColor(challenge.difficulty)}15` }]}
                    textStyle={{ color: getDifficultyColor(challenge.difficulty), fontSize: 10 }}
                  >
                    {challenge.difficulty}
                  </Chip>
                </View>
              </View>
            </View>

            <Text style={[styles.challengeDescription, { color: colors.onSurfaceVariant }]} numberOfLines={3}>
              {challenge.description}
            </Text>

            <View style={styles.challengeStats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account-group" size={16} color={colors.onSurfaceVariant} />
                <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>
                  {challenge.participants.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="trophy" size={16} color={colors.primary} />
                <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>
                  {challenge.maxScore} XP
                </Text>
              </View>
            </View>

            <Button
              mode={isActive ? 'contained' : 'outlined'}
              onPress={() => setSelectedChallenge(challenge)}
              disabled={isCompleted || isSubmitted}
              style={[styles.challengeButton, isWaitlisted && { backgroundColor: colors.successContainer }]}
              labelStyle={isWaitlisted ? { color: colors.onSuccessContainer } : {}}
            >
              {isCompleted ? 'Completed ✓' :
                isSubmitted ? 'Submitted ✓' :
                  isActive ? 'Join Challenge' :
                    isWaitlisted ? 'Waitlisted' :
                      'View Details'}
            </Button>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const getCurrentChallenges = (): Challenge[] => {
    switch (activeTab) {
      case 'active': return challenges.active;
      case 'upcoming': return challenges.upcoming;
      case 'completed': return challenges.completed;
      default: return challenges.active;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <MaterialCommunityIcons
          name="star-four-points"
          size={24}
          color={colors.primary}
          style={styles.sparkleIcon}
        />
        <Text style={[styles.loadingTitle, { color: colors.onBackground }]}>
          Generating AI-Powered Challenges
        </Text>
        <Text style={[styles.loadingSubtitle, { color: colors.onSurfaceVariant }]}>
          Creating personalized challenges tailored to your growth...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.onBackground }]}>
            AI-Powered Life Challenges
          </Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Transform your life through personalized challenges designed by AI
          </Text>
        </View>

        {/* User Stats */}
        <XPProgress
          currentXp={userStats.currentXp}
          nextLevelXp={userStats.nextLevelXp}
          level={userStats.level}
        />

        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: `${colors.primary}15` }]} mode="outlined">
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {userStats.completedChallenges}
              </Text>
              <Text style={[styles.statLabel, { color: colors.primary }]}>Completed</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: `${colors.secondary}15` }]} mode="outlined">
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: colors.secondary }]}>
                {userStats.streak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>Day Streak</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: `${colors.tertiary}15` }]} mode="outlined">
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: colors.tertiary }]}>
                {userStats.totalChallenges}
              </Text>
              <Text style={[styles.statLabel, { color: colors.tertiary }]}>Total</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'active', label: 'Active', count: challenges.active.length },
            { key: 'upcoming', label: 'Upcoming', count: challenges.upcoming.length },
            { key: 'completed', label: 'Completed', count: challenges.completed.length }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { backgroundColor: colors.primaryContainer }
              ]}
              onPress={() => setActiveTab(tab.key as 'active' | 'upcoming' | 'completed')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === tab.key ? colors.onPrimaryContainer : colors.onSurfaceVariant }
              ]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Challenges List */}
        <View style={styles.challengesList}>
          {getCurrentChallenges().length > 0 ? (
            getCurrentChallenges().map(renderChallengeCard)
          ) : (
            <Card style={[styles.emptyCard, { backgroundColor: colors.surfaceVariant }]} mode="outlined">
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons
                  name={
                    activeTab === 'active'
                      ? 'star-four-points' // or another valid "sparkle-like" icon
                      : activeTab === 'upcoming'
                        ? 'clock-outline'
                        : 'trophy'
                  }
                  size={48}
                  color={colors.onSurfaceVariant}
                />

                <Text style={[styles.emptyTitle, { color: colors.onSurfaceVariant }]}>
                  No {activeTab} challenges
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
                  {activeTab === 'active' ? 'New challenges are being generated!' :
                    activeTab === 'upcoming' ? 'Check back soon for new opportunities!' :
                      'Complete challenges to see them here!'}
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="refresh"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={onRefresh}
        label="Generate New"
      />

      {/* Modals */}
      <Portal>
        <Modal
          visible={!!selectedChallenge}
          onDismiss={() => setSelectedChallenge(null)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.surface }]}
        >
          {selectedChallenge && (
            <ChallengeDetail
              challenge={selectedChallenge}
              onClose={() => setSelectedChallenge(null)}
              onJoin={handleJoinChallenge}
              isSubmitted={submittedChallenges.has(selectedChallenge.id)}
              isWaitlisted={selectedChallenge.status === 'upcoming' && waitlistedChallengeId === selectedChallenge.id}
              onJoinWaitlist={handleJoinWaitlist}
            />
          )}
        </Modal>

        <Modal
          visible={!!attemptingChallenge}
          onDismiss={() => setAttemptingChallenge(null)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.surface }]}
        >
          {attemptingChallenge && (
            <ChallengeAttempt
              challenge={attemptingChallenge}
              onClose={() => setAttemptingChallenge(null)}
              onSubmit={handleSubmitSolution}
            />
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sparkleIcon: {
    position: 'absolute',
    top: '45%',
    right: '45%',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  challengesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  challengeCard: {
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  challengeIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  aiBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  timeChip: {
    height: 24,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    height: 24,
  },
  difficultyChip: {
    height: 24,
  },
  challengeDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  challengeStats: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  challengeButton: {
    borderRadius: 8,
  },
  emptyCard: {
    marginTop: 40,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
});