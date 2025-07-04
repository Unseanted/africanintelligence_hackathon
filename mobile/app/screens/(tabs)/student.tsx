import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Card, Text, Button, ProgressBar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND, BORDER_COLOR } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSocket } from '../../services/socketService';

// Type definitions
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
  courseTitle: string;
  contentTitle: string;
  lastAccessedAt: Date;
}

interface UserStats {
  totalPoints: number;
  rank: number;
  completedChallenges: number;
  activeChallenges: number;
  currentStreak: number;
  totalXp: number;
  totalEnrolled: number;
  certificatesEarned: number;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  averageScore: number;
  lastActive: Date;
  streakDays: number;
}

export default function StudentDashboardScreen() {
  const router = useRouter();
  const {
    enrolledCourses,
    CoursesHub,
    user,
    token,
    userXP,
    awardXP,
    fetchUserXP,
    packLoad
  } = useTourLMS();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    rank: 0,
    completedChallenges: 0,
    activeChallenges: 0,
    currentStreak: 0,
    totalXp: 0,
    totalEnrolled: 0,
    certificatesEarned: 0,
    completedLessons: 0,
    totalLessons: 0,
    completedQuizzes: 0,
    totalQuizzes: 0,
    averageScore: 0,
    lastActive: new Date(),
    streakDays: 0,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const socket = useSocket();

  const fetchEnrolledCourses = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const courses: Course[] = enrolledCourses || [];

      // Extract unique categories from enrolled courses
      const uniqueCategories: string[] = [...new Set(courses.map(course => (course.category || "").toLowerCase()).filter(cat => cat))];
      setCategories(uniqueCategories);

      // Update user stats
      const totalLessons = courses.reduce((sum, course) => sum + (course.totalLessons || 0), 0);
      const completedLessons = courses.reduce((sum, course) => sum + (course.completedLessons || 0), 0);
      const totalQuizzes = courses.reduce((sum, course) => sum + (course.totalQuizzes || 0), 0);
      const completedQuizzes = courses.reduce((sum, course) => sum + (course.completedQuizzes || 0), 0);
      const averageScore = courses.length > 0
        ? courses.reduce((sum, course) => sum + (course.averageScore || 0), 0) / courses.length
        : 0;

      setUserStats({
        totalPoints: courses.reduce((sum, course) => sum + (course.points || 0), 0),
        rank: Math.floor(Math.random() * 100) + 1, // Placeholder for actual rank
        completedChallenges: courses.filter(c => c.completed).length,
        activeChallenges: courses.filter(c => !c.completed).length,
        currentStreak: calculateStreak(courses),
        totalXp: courses.reduce((sum, course) => sum + (course.xp || 0), 0),
        totalEnrolled: courses.length,
        certificatesEarned: courses.filter(c => c.certificateIssued).length,
        completedLessons,
        totalLessons,
        completedQuizzes,
        totalQuizzes,
        averageScore,
        lastActive: new Date(courses[0]?.lastAccessedAt || new Date()),
        streakDays: calculateStreak(courses),
      });

      // Find related courses
      const enrolledCourseIds = new Set(courses.map(course => course._id));
      const related: Course[] = (CoursesHub || []).filter(course =>
        !enrolledCourseIds.has(course._id) &&
        uniqueCategories.includes((course.category || "").toLowerCase())
      ).slice(0, 3);
      setRelatedCourses(related);

      // Calculate recent activities
      const activities: Activity[] = [];
      courses.forEach(course => {
        const enrollment = course.enrollment || {};
        const moduleProgress = enrollment.moduleProgress || [];
        moduleProgress.forEach(module => {
          const contentProgress = module.contentProgress || [];
          contentProgress.forEach(content => {
            if (content.lastAccessedAt && content.completed) {
              activities.push({
                courseTitle: course.title,
                contentTitle: content.contentId,
                lastAccessedAt: new Date(content.lastAccessedAt)
              });
            }
          });
        });
      });
      activities.sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime());
      setRecentActivities(activities.slice(0, 3));
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, [enrolledCourses, CoursesHub, token]);

  useEffect(() => {
    if (!socket) return;

    socket.on('challenge:stats', (stats: Partial<UserStats>) => {
      setUserStats(prev => ({
        ...prev,
        ...stats
      }));
    });

    return () => {
      socket.off('challenge:stats');
    };
  }, [socket]);

  const calculateStreak = (courses: Course[]): number => {
    if (!courses || courses.length === 0) return 0;

    const sortedCourses = [...courses].sort((a, b) => {
      const dateA = new Date(a.lastAccessedAt || 0);
      const dateB = new Date(b.lastAccessedAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    const mostRecent = new Date(sortedCourses[0].lastAccessedAt || 0);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = mostRecent.toDateString() === today.toDateString();
    const isYesterday = mostRecent.toDateString() === yesterday.toDateString();

    if (isToday || isYesterday) {
      return Math.max(1, Math.min(courses.length * 2, 8));
    }

    return 0;
  };

  const filteredCourses = activeCategory === "all"
    ? (enrolledCourses || [])
    : (enrolledCourses || []).filter(course => (course.category || "").toLowerCase().includes(activeCategory));

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchEnrolledCourses(),
      fetchUserXP()
    ]).finally(() => setRefreshing(false));
  }, [fetchUserXP]);

  const handleCoursePress = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  const handleEnrollPress = async (courseId: string) => {
    try {
      await router.push(`/course/${courseId}`);
    } catch (error) {
      console.error('Error navigating to course:', error);
    }
  };

  if (loading) {
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
        <Text style={styles.welcomeTitle}>Welcome to African Intelligence</Text>
        <Text style={styles.welcomeSubtitle}>
          Your journey into advanced AI education continues. Track your progress, join events, and connect with fellow learners.
        </Text>
        <Button
          mode="contained"
          onPress={() => router.replace('./courses')}
          style={styles.browseButton}
        >
          Browse More Courses
        </Button>
      </View>

      {/* Progress Overview */}
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
            <Text style={styles.statSubtitle}>Keep it up!</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="target" size={24} color={PRIMARY} />
              <Text style={styles.statTitle}>Courses</Text>
            </View>
            <Text style={styles.statValue}>{userStats.completedChallenges}/{userStats.totalEnrolled}</Text>
            <Text style={styles.statSubtitle}>Completed</Text>
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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <Chip
              selected={activeCategory === 'all'}
              onPress={() => setActiveCategory('all')}
              style={styles.categoryChip}
            >
              All
            </Chip>
            {categories.map(category => (
              <Chip
                key={category}
                selected={activeCategory === category}
                onPress={() => setActiveCategory(category)}
                style={styles.categoryChip}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {filteredCourses.length === 0 ? (
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
                onPress={() => router.push('./courses')}
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
                    uri: course.thumbnail || 'https://via.placeholder.com/800x400'
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
                        {course.facilitatorName || course.instructor || "Unknown"}
                      </Text>
                    </View>
                  </View>
                  <Button
                    mode="contained"
                    onPress={() => handleCoursePress(course._id)}
                    style={styles.continueButton}
                  >
                    Continue Learning
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* Related Courses and Recent Activities */}
      <View style={styles.bottomSection}>
        <Card style={styles.relatedCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Explore Related Courses</Text>
            {relatedCourses.length === 0 ? (
              <View style={styles.emptyContent}>
                <MaterialCommunityIcons name="book-open" size={32} color={TEXT_SECONDARY} />
                <Text style={styles.emptySubtitle}>No related courses found.</Text>
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
                        uri: course.thumbnail || 'https://via.placeholder.com/800x400'
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
                    >
                      View
                    </Button>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>

        <Card style={styles.activitiesCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            {recentActivities.length === 0 ? (
              <View style={styles.emptyContent}>
                <MaterialCommunityIcons name="clock-outline" size={32} color={TEXT_SECONDARY} />
                <Text style={styles.emptySubtitle}>No recent activities.</Text>
              </View>
            ) : (
              recentActivities.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color={PRIMARY} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      Completed <Text style={styles.activityHighlight}>{activity.contentTitle}</Text> in{' '}
                      <Text style={styles.activityHighlight}>{activity.courseTitle}</Text>
                    </Text>
                    <Text style={styles.activityDate}>
                      {formatDate(activity.lastAccessedAt)}
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
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    margin: 4,
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
  },
  statValue: {
    fontSize: 24,
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
    height: 4,
    borderRadius: 2,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  categoryScroll: {
    marginTop: 12,
  },
  categoryChip: {
    marginRight: 8,
  },
  courseGrid: {
    gap: 16,
  },
  courseCard: {
    marginBottom: 16,
  },
  courseImage: {
    height: 160,
  },
  courseContent: {
    padding: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  progressValue: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  courseMeta: {
    marginTop: 8,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  continueButton: {
    marginTop: 12,
  },
  emptyCard: {
    marginTop: 16,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  bottomSection: {
    padding: 16,
    gap: 16,
  },
  relatedCard: {
    marginBottom: 16,
  },
  relatedCourseCard: {
    marginBottom: 12,
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
  },
  activitiesCard: {
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  },
  activityHighlight: {
    fontWeight: 'bold',
  },
  activityDate: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
});