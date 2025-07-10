import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Card, Text, Button, ProgressBar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND, BORDER_COLOR } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSocket } from '../../services/socketService';

// Enhanced Type definitions
interface Course {
  _id: string;
  title: string;
  category?: string;
  thumbnail?: string;
  progress?: number;
  nextModule?: string;
  facilitatorName?: string;
  instructor?: string;
  totalLessons?: number;
  completedLessons?: number;
  totalQuizzes?: number;
  completedQuizzes?: number;
  averageScore?: number;
  points?: number;
  xp?: number;
  completed?: boolean;
  certificateIssued?: boolean;
  lastAccessedAt?: string;
  shortDescription?: string;
  description?: string;
  enrollment?: {
    moduleProgress?: Array<{
      contentProgress?: Array<{
        contentId: string;
        lastAccessedAt?: string;
        completed?: boolean;
      }>;
    }>;
  };
}

interface Activity {
  _id: string;
  courseId: string;
  courseTitle: string;
  contentId: string;
  contentTitle: string;
  type: 'lesson' | 'quiz' | 'assignment';
  action: 'completed' | 'started' | 'submitted';
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalPoints: number;
  rank: number;
  completedCourses: number;
  activeCourses: number;
  currentStreak: number;
  totalXp: number;
  totalEnrolled: number;
  certificatesEarned: number;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageScore: number;
  lastActive: string;
  streakDays: number;
}

interface UserXP {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  streak: {
    current: number;
    longest: number;
    lastUpdated: string;
  };
}

const DEFAULT_USER_STATS: UserStats = {
  totalPoints: 0,
  rank: 0,
  completedCourses: 0,
  activeCourses: 0,
  currentStreak: 0,
  totalXp: 0,
  totalEnrolled: 0,
  certificatesEarned: 0,
  completedLessons: 0,
  totalLessons: 0,
  completedQuizzes: 0,
  totalQuizzes: 0,
  averageScore: 0,
  lastActive: new Date().toISOString(),
  streakDays: 0,
};

export default function StudentDashboardScreen() {
  const router = useRouter();
  const {
    enrolledCourses = [],
    CoursesHub = [],
    user,
    token,
    userXP,
    fetchUserXP,
    fetchEnrolledCourses,
    fetchUserStats, 
    fetchRecentActivities,
    fetchRecommendedCourses,
    refreshDashboard,
    socket,
  } = useTourLMS();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_USER_STATS);
  const [categories, setCategories] = useState<string[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  // Format date for display
  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const [activities, recommended] = await Promise.all([
        fetchRecentActivities(),
        fetchRecommendedCourses()
      ]);

      // Removed stats as fetchUserStats does not exist
      setRecentActivities(activities);
      setRelatedCourses(recommended);

      // Process enrolled courses to get categories
      const uniqueCategories = [...new Set(
        enrolledCourses.map(course => (course.category || "").toLowerCase()).filter(Boolean)
      )];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Dashboard data error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [token, enrolledCourses, fetchUserStats, fetchRecentActivities, fetchRecommendedCourses]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshDashboard();
      await fetchDashboardData();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshDashboard, fetchDashboardData]);

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleXPUpdate = (data: { xp: number; level: number; currentLevelXP: number; nextLevelXP: number }) => {
      // Update XP in context or local state
    };

    const handleProgressUpdate = (data: { courseId: string; progress: number }) => {
      // Update course progress
    };

    const handleActivityUpdate = (activity: Activity) => {
      setRecentActivities(prev => [activity, ...prev.slice(0, 2)]);
    };

    socket.on('xp:update', handleXPUpdate);
    socket.on('progress:update', handleProgressUpdate);
    socket.on('activity:new', handleActivityUpdate);

    return () => {
      socket.off('xp:update', handleXPUpdate);
      socket.off('progress:update', handleProgressUpdate);
      socket.off('activity:new', handleActivityUpdate);
    };
  }, [socket]);

  // Filter courses by active category
  const filteredCourses = activeCategory === "all"
    ? enrolledCourses
    : enrolledCourses.filter(course => 
        (course.category || "").toLowerCase().includes(activeCategory.toLowerCase())
      );

  // Navigation handlers
  const handleCoursePress = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  const handleEnrollPress = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  const handleBrowseCourses = () => {
    router.replace('../courses'); 
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome back, {user?.name || 'Learner'}!</Text>
        <Text style={styles.welcomeSubtitle}>
          Your journey into advanced AI education continues. Track your progress, join events, and connect with fellow learners.
        </Text>
        <Button
          mode="contained"
          onPress={handleBrowseCourses}
          style={styles.browseButton}
          labelStyle={styles.browseButtonLabel}
        >
          Browse More Courses
        </Button>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="trophy" size={24} color={PRIMARY} />
              <Text style={styles.statTitle}>Total XP</Text>
            </View>
            <Text style={styles.statValue}>{userXP?.totalXP || 0}</Text>
            <ProgressBar
              progress={userXP && userXP.nextLevelXP > 0 ? (userXP.currentLevelXP / userXP.nextLevelXP) : 0}
              color={PRIMARY}
              style={styles.progressBar}
            />
            <Text style={styles.statSubtitle}>
              Level {userXP?.level || 1} • {userXP?.currentLevelXP || 0}/{userXP?.nextLevelXP || 100} XP
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="book-open" size={24} color={PRIMARY} />
              <Text style={styles.statTitle}>Progress</Text>
            </View>
            <Text style={styles.statValue}>
              {userStats.totalLessons > 0
                ? Math.round((userStats.completedLessons / userStats.totalLessons) * 100)
                : 0}%
            </Text>
            <ProgressBar
              progress={userStats.totalLessons > 0
                ? (userStats.completedLessons / userStats.totalLessons)
                : 0}
              color={PRIMARY}
              style={styles.progressBar}
            />
            <Text style={styles.statSubtitle}>
              {userStats.completedLessons}/{userStats.totalLessons} lessons
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="fire" size={24} color={PRIMARY} />
              <Text style={styles.statTitle}>Current Streak</Text>
            </View>
            <Text style={styles.statValue}>{userXP?.streak?.current || userStats.currentStreak} days</Text>
            <Text style={styles.statSubtitle}>
              {userXP?.streak?.current ? 'Keep it up!' : 'Start a streak today!'}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="target" size={24} color={PRIMARY} />
              <Text style={styles.statTitle}>Courses</Text>
            </View>
            <Text style={styles.statValue}>{userStats.completedCourses}/{userStats.totalEnrolled}</Text>
            <Text style={styles.statSubtitle}>
              {userStats.totalEnrolled === 0 ? 'Enroll in your first course' : 'Completed'}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Course Progress Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your Learning Journey</Text>
            <Text style={styles.sectionSubtitle}>Continue where you left off</Text>
          </View>

          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              <Chip
                selected={activeCategory === 'all'}
                onPress={() => setActiveCategory('all')}
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                All
              </Chip>
              {categories.map(category => (
                <Chip
                  key={category}
                  selected={activeCategory === category}
                  onPress={() => setActiveCategory(category)}
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Chip>
              ))}
            </ScrollView>
          )}
        </View>

        {error ? (
          <Card style={styles.errorCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="alert-circle" size={48} color={TEXT_SECONDARY} />
              <Text style={styles.emptyTitle}>Error loading courses</Text>
              <Text style={styles.emptySubtitle}>
                {error}
              </Text>
              <Button
                mode="contained"
                onPress={fetchDashboardData}
                style={styles.emptyButton}
              >
                Try Again
              </Button>
            </Card.Content>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="book-open" size={48} color={TEXT_SECONDARY} />
              <Text style={styles.emptyTitle}>No courses found</Text>
              <Text style={styles.emptySubtitle}>
                {activeCategory === 'all'
                  ? "You haven't enrolled in any courses yet."
                  : `You don't have any ${activeCategory} courses yet.`}
              </Text>
              <Button
                mode="contained"
                onPress={handleBrowseCourses}
                style={styles.emptyButton}
              >
                Browse Courses
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.courseGrid}>
            {filteredCourses.map((course) => (
              <Card
                key={course._id}
                style={styles.courseCard}
                onPress={() => handleCoursePress(course._id)}
              >
                <Card.Cover
                  source={{
                    uri: course.thumbnail || 'https://via.placeholder.com/800x400?text=No+Thumbnail'
                  }}
                  style={styles.courseImage}
                />
                <Card.Content style={styles.courseContent}>
                  <Text style={styles.courseTitle} numberOfLines={2}>
                    {course.title}
                  </Text>
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Progress</Text>
                    <Text style={styles.progressValue}>{course.progress || 0}%</Text>
                  </View>
                  <ProgressBar
                    progress={(course.progress || 0) / 100}
                    color={PRIMARY}
                    style={styles.progressBar}
                  />
                  <View style={styles.courseMeta}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color={TEXT_SECONDARY} />
                      <Text style={styles.metaText}>
                        Next: {course.nextModule || "Start learning"}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="account" size={16} color={TEXT_SECONDARY} />
                      <Text style={styles.metaText}>
                        {course.facilitatorName || course.instructor || "Unknown instructor"}
                      </Text>
                    </View>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() => handleCoursePress(course._id)}
                    style={styles.continueButton}
                    labelStyle={styles.continueButtonLabel}
                  >
                    {course.progress ? "Continue" : "Start"} Learning
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* Related Courses and Recent Activities */}
      <View style={styles.bottomSection}>
        <Card style={styles.halfSectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            {relatedCourses.length === 0 ? (
              <View style={styles.emptyContent}>
                <MaterialCommunityIcons name="book-open" size={32} color={TEXT_SECONDARY} />
                <Text style={styles.emptySubtitle}>No recommendations yet</Text>
              </View>
            ) : (
              relatedCourses.map((course) => (
                <Card
                  key={course._id}
                  style={styles.relatedCourseCard}
                  onPress={() => handleEnrollPress(course._id)}
                >
                  <Card.Content style={styles.relatedCourseContent}>
                    <Card.Cover
                      source={{
                        uri: course.thumbnail || 'https://via.placeholder.com/150x150?text=No+Thumbnail'
                      }}
                      style={styles.relatedCourseImage}
                    />
                    <View style={styles.relatedCourseInfo}>
                      <Text style={styles.relatedCourseTitle} numberOfLines={2}>
                        {course.title}
                      </Text>
                      <Text style={styles.relatedCourseDescription} numberOfLines={2}>
                        {course.shortDescription || course.description || "No description available."}
                      </Text>
                      <View style={styles.relatedCourseMeta}>
                        <MaterialCommunityIcons name="account" size={16} color={TEXT_SECONDARY} />
                        <Text style={styles.relatedCourseInstructor}>
                          {course.facilitatorName || course.instructor || "Unknown"}
                        </Text>
                      </View>
                    </View>
                    <Button
                      mode="outlined"
                      onPress={() => handleEnrollPress(course._id)}
                      style={styles.enrollButton}
                      labelStyle={styles.enrollButtonLabel}
                    >
                      View
                    </Button>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>

        <Card style={styles.halfSectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            {recentActivities.length === 0 ? (
              <View style={styles.emptyContent}>
                <MaterialCommunityIcons name="clock-outline" size={32} color={TEXT_SECONDARY} />
                <Text style={styles.emptySubtitle}>No recent activities</Text>
              </View>
            ) : (
              recentActivities.map((activity) => (
                <View key={activity._id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <MaterialCommunityIcons 
                      name={activity.type === 'quiz' ? 'file-question' : 'book-open'} 
                      size={20} 
                      color={PRIMARY} 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      {activity.action === 'completed' ? 'Completed' : 'Started'} {' '}
                      <Text style={styles.activityHighlight}>{activity.contentTitle}</Text> in{' '}
                      <Text style={styles.activityHighlight}>{activity.courseTitle}</Text>
                    </Text>
                    <Text style={styles.activityDate}>
                      {formatDate(activity.createdAt)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    backgroundColor: PRIMARY,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  browseButtonLabel: {
    color: PRIMARY,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  statSubtitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  categoryScroll: {
    marginTop: 12,
    maxHeight: 40,
  },
  categoryScrollContent: {
    paddingRight: 16,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  categoryChipText: {
    fontSize: 12,
  },
  courseGrid: {
    gap: 16,
  },
  courseCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: CARD_BACKGROUND,
    elevation: 1,
  },
  courseImage: {
    height: 160,
  },
  courseContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: 'bold',
  },
  courseMeta: {
    marginTop: 12,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    flexShrink: 1,
  },
  continueButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  continueButtonLabel: {
    fontWeight: 'bold',
  },
  emptyCard: {
    marginTop: 16,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
  },
  errorCard: {
    marginTop: 16,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  halfSectionCard: {
    flex: 1,
    minWidth: '100%',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
    elevation: 1,
  },
  relatedCourseCard: {
    marginBottom: 12,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  relatedCourseContent: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  relatedCourseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  relatedCourseInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  relatedCourseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  relatedCourseDescription: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 4,
    lineHeight: 16,
  },
  relatedCourseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relatedCourseInstructor: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  enrollButton: {
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  enrollButtonLabel: {
    color: PRIMARY,
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${PRIMARY}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    lineHeight: 20,
  },
  activityHighlight: {
    fontWeight: 'bold',
  },
  activityDate: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
});