// app/achievements.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, ProgressBar, Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { useTourLMS } from '../../contexts/TourLMSContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: 'learning' | 'progress' | 'engagement' | 'milestone';
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-100
  requirement: string;
  points: number;
}

const ACHIEVEMENT_CATEGORIES = {
  learning: { label: 'Learning', color: '#4CAF50' },
  progress: { label: 'Progress', color: '#2196F3' },
  engagement: { label: 'Engagement', color: '#FF9800' },
  milestone: { label: 'Milestones', color: '#9C27B0' }
};

export default function AchievementsPage() {
  const { colors } = useTheme();
  const { user } = useTourLMS();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Simulate fetching achievements data
    const fetchAchievements = async () => {
      try {
        // Mock achievements data
        const mockAchievements: Achievement[] = [
          {
            id: '1',
            title: 'First Steps',
            description: 'Complete your first lesson',
            icon: 'footsteps-outline',
            category: 'learning',
            isUnlocked: true,
            unlockedAt: '2024-01-15',
            progress: 100,
            requirement: 'Complete 1 lesson',
            points: 10
          },
          {
            id: '2',
            title: 'Knowledge Seeker',
            description: 'Complete 10 lessons',
            icon: 'book-outline',
            category: 'learning',
            isUnlocked: true,
            unlockedAt: '2024-01-20',
            progress: 100,
            requirement: 'Complete 10 lessons',
            points: 50
          },
          {
            id: '3',
            title: 'Course Master',
            description: 'Complete your first course',
            icon: 'trophy-outline',
            category: 'milestone',
            isUnlocked: false,
            progress: 75,
            requirement: 'Complete 1 full course',
            points: 100
          },
          {
            id: '4',
            title: 'Streak Champion',
            description: 'Maintain a 7-day learning streak',
            icon: 'flame-outline',
            category: 'engagement',
            isUnlocked: false,
            progress: 57,
            requirement: '7 consecutive days of learning',
            points: 75
          },
          {
            id: '5',
            title: 'Quiz Master',
            description: 'Score 100% on 5 quizzes',
            icon: 'checkmark-circle-outline',
            category: 'progress',
            isUnlocked: false,
            progress: 40,
            requirement: 'Perfect score on 5 quizzes (2/5)',
            points: 60
          },
          {
            id: '6',
            title: 'Early Bird',
            description: 'Complete lessons before 9 AM for 5 days',
            icon: 'sunny-outline',
            category: 'engagement',
            isUnlocked: false,
            progress: 20,
            requirement: 'Learn before 9 AM (1/5 days)',
            points: 40
          },
          {
            id: '7',
            title: 'Scholar',
            description: 'Complete 3 courses',
            icon: 'school-outline',
            category: 'milestone',
            isUnlocked: false,
            progress: 33,
            requirement: 'Complete 3 courses (1/3)',
            points: 200
          },
          {
            id: '8',
            title: 'Speed Learner',
            description: 'Complete 5 lessons in one day',
            icon: 'flash-outline',
            category: 'progress',
            isUnlocked: false,
            progress: 0,
            requirement: 'Complete 5 lessons in 24 hours',
            points: 80
          }
        ];

        setTimeout(() => {
          setAchievements(mockAchievements);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const totalPoints = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  const renderAchievement = ({ item }: { item: Achievement }) => {
    const categoryColor = ACHIEVEMENT_CATEGORIES[item.category].color;
    
    return (
      <Card 
        style={[
          styles.achievementCard, 
          { 
            backgroundColor: colors.cardBackground,
            borderColor: item.isUnlocked ? categoryColor : colors.borderColor,
            borderWidth: item.isUnlocked ? 2 : 1,
            opacity: item.isUnlocked ? 1 : 0.7
          }
        ]}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.achievementHeader}>
            <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
              <Ionicons 
                name={item.icon} 
                size={32} 
                color={item.isUnlocked ? categoryColor : colors.textSecondary} 
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text 
                variant="titleMedium" 
                style={[styles.achievementTitle, { color: colors.text }]}
              >
                {item.title}
              </Text>
              <Text 
                variant="bodySmall" 
                style={[styles.category, { color: categoryColor }]}
              >
                {ACHIEVEMENT_CATEGORIES[item.category].label}
              </Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={[styles.pointsText, { color: colors.primary }]}>
                {item.points}pts
              </Text>
            </View>
          </View>
          
          <Text 
            variant="bodyMedium" 
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {item.description}
          </Text>
          
          <Text 
            variant="bodySmall" 
            style={[styles.requirement, { color: colors.textSecondary }]}
          >
            {item.requirement}
          </Text>
          
          {!item.isUnlocked && (
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={item.progress / 100} 
                color={categoryColor}
                style={styles.progressBar}
              />
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {item.progress}% Complete
              </Text>
            </View>
          )}
          
          {item.isUnlocked && item.unlockedAt && (
            <View style={styles.unlockedContainer}>
              <Ionicons name="checkmark-circle" size={16} color={categoryColor} />
              <Text style={[styles.unlockedText, { color: categoryColor }]}>
                Unlocked on {new Date(item.unlockedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <Button
        mode={selectedCategory === 'all' ? 'contained' : 'outlined'}
        onPress={() => setSelectedCategory('all')}
        style={styles.filterButton}
        compact
      >
        All
      </Button>
      {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, value]) => (
        <Button
          key={key}
          mode={selectedCategory === key ? 'contained' : 'outlined'}
          onPress={() => setSelectedCategory(key)}
          style={styles.filterButton}
          compact
        >
          {value.label}
        </Button>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading achievements...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Button 
          mode="text" 
          onPress={() => router.back()}
          style={styles.backButton}
          labelStyle={{ color: colors.primary }}
        >
          ← Back
        </Button>
        
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
          Achievements
        </Text>
        
        <Card style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
          <Card.Content style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: colors.primary }]}>
                {unlockedCount}
              </Text>
              <Text variant="bodySmall" style={[styles.statLabel, { color: colors.textSecondary }]}>
                Unlocked
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: colors.primary }]}>
                {achievements.length - unlockedCount}
              </Text>
              <Text variant="bodySmall" style={[styles.statLabel, { color: colors.textSecondary }]}>
                In Progress
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: colors.primary }]}>
                {totalPoints}
              </Text>
              <Text variant="bodySmall" style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Points
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
      
      {renderCategoryFilter()}
      
      <FlatList
        data={filteredAchievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    borderRadius: 20,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  achievementCard: {
    marginBottom: 16,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  pointsBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 8,
    lineHeight: 20,
  },
  requirement: {
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  unlockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: '500',
  },
});