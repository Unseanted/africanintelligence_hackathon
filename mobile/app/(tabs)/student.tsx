import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Text, Card, Button, ProgressBar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTourLMS } from '../contexts/TourLMSContext';
import type { Course } from '../contexts/TourLMSContext';
import { useToast } from '../hooks/use-toast';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND, BORDER_COLOR } from '../constants/colors';
import { router } from 'expo-router';

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

export default function StudentDashboard() {
  const { user, token, enrolledCourses, CoursesHub, API_URL } = useTourLMS();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const courses = enrolledCourses || [];
        
        // Extract unique categories from enrolled courses
        const uniqueCategories = [...new Set(courses.map((course: Course) => (course.category || "").toLowerCase()).filter((cat: string) => cat))] as string[];
        setCategories(uniqueCategories);

        // Update user stats
        setUserStats({
          totalPoints: courses.reduce((sum: number, course: Course) => sum + (course.points || 0), 0),
          rank: Math.floor(Math.random() * 100) + 1, // Placeholder for actual rank
          completedChallenges: courses.filter((c: Course) => c.completed).length,
          activeChallenges: courses.filter((c: Course) => !c.completed).length,
          currentStreak: calculateStreak(courses),
          totalXp: courses.reduce((sum: number, course: Course) => sum + (course.xp || 0), 0),
          totalEnrolled: courses.length,
          certificatesEarned: courses.filter((c: Course) => c.certificateIssued).length,
          completedLessons: courses.reduce((sum: number, course: Course) => sum + (course.completedLessons || 0), 0),
          totalLessons: courses.reduce((sum: number, course: Course) => sum + (course.totalLessons || 0), 0),
          completedQuizzes: courses.reduce((sum: number, course: Course) => sum + (course.completedQuizzes || 0), 0),
          totalQuizzes: courses.reduce((sum: number, course: Course) => sum + (course.totalQuizzes || 0), 0),
          averageScore: courses.reduce((sum: number, course: Course) => sum + (course.averageScore || 0), 0) / courses.length,
          lastActive: new Date(courses[0]?.lastAccessedAt || new Date()),
          streakDays: calculateStreak(courses),
        });

        // Find related courses
        const enrolledCourseIds = new Set(courses.map((course: Course) => course._id));
        const related = CoursesHub.filter((course: Course) => 
          !enrolledCourseIds.has(course._id) && 
          uniqueCategories.includes((course.category || "").toLowerCase())
        ).slice(0, 3);
        setRelatedCourses(related);

        // Calculate recent activities
        const activities: Activity[] = [];
        courses.forEach((course: Course) => {
          const enrollment = course.enrollment || {};
          const moduleProgress = enrollment.moduleProgress || [];
          moduleProgress.forEach((module: { contentProgress?: { contentId: string; lastAccessedAt: string; completed: boolean }[] }) => {
            const contentProgress = module.contentProgress || [];
            contentProgress.forEach((content: { contentId: string; lastAccessedAt: string; completed: boolean }) => {
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
        toast({
          title: "Failed to load courses",
          description: "There was an error loading your enrolled courses",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrolledCourses();
  }, [enrolledCourses, CoursesHub, token, toast]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id || !token) return;

      try {
        const response = await fetch(`${API_URL}/users/${user.id}/stats`, {
          headers: {
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user stats");
        }

        const stats = await response.json();
        setUserStats(prev => ({
          ...prev,
          ...stats
        }));
      } catch (error) {
        console.error("Error fetching user stats:", error);
        toast({
          title: "Failed to load stats",
          description: "There was an error loading your statistics",
          variant: "destructive",
        });
      }
    };

    fetchUserStats();
  }, [user?.id, API_URL, token, toast]);

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
    ? enrolledCourses 
    : enrolledCourses.filter((course: Course) => (course.category || "").toLowerCase().includes(activeCategory));

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: BACKGROUND }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: BACKGROUND }]}>
      {/* Welcome Section */}
      <View style={[styles.welcomeSection, { backgroundColor: PRIMARY }]}>
        <Text style={[styles.welcomeTitle, { color: TEXT_PRIMARY }]}>
          Welcome back, {user?.name}!
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: TEXT_PRIMARY }]}>
          Your journey into advanced AI education continues. Track your progress, join events, and connect with fellow learners.
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('/courses')}
          style={[styles.browseButton, { backgroundColor: TEXT_PRIMARY }]}
          textColor={PRIMARY}
        >
          Browse More Courses
        </Button>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { backgroundColor: CARD_BACKGROUND }]}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="trophy" size={24} color={PRIMARY} />
              <Text style={[styles.statTitle, { color: TEXT_PRIMARY }]}>Total XP</Text>
            </View>
            <Text style={[styles.statValue, { color: TEXT_PRIMARY }]}>{userStats.totalXp}</Text>
            <ProgressBar
              progress={userStats.totalXp / (userStats.totalXp + 1000)}
              style={[styles.progressBar, { backgroundColor: BORDER_COLOR }]}
              color={PRIMARY}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: CARD_BACKGROUND }]}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="book-open-page-variant" size={24} color={PRIMARY} />
              <Text style={[styles.statTitle, { color: TEXT_PRIMARY }]}>Progress</Text>
            </View>
            <Text style={[styles.statValue, { color: TEXT_PRIMARY }]}>
              {userStats.totalLessons > 0 
                ? Math.round((userStats.completedLessons / userStats.totalLessons) * 100)
                : 0}%
            </Text>
            <ProgressBar
              progress={userStats.totalLessons > 0 
                ? userStats.completedLessons / userStats.totalLessons 
                : 0}
              style={[styles.progressBar, { backgroundColor: BORDER_COLOR }]}
              color={PRIMARY}
            />
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: CARD_BACKGROUND }]}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="fire" size={24} color={PRIMARY} />
              <Text style={[styles.statTitle, { color: TEXT_PRIMARY }]}>Current Streak</Text>
            </View>
            <Text style={[styles.statValue, { color: TEXT_PRIMARY }]}>{userStats.currentStreak} days</Text>
            <Text style={[styles.statSubtitle, { color: TEXT_SECONDARY }]}>Keep it up!</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Course Progress Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Your Learning Journey</Text>
          <Text style={[styles.sectionSubtitle, { color: TEXT_SECONDARY }]}>Continue where you left off</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          <Chip
            selected={activeCategory === 'all'}
            onPress={() => setActiveCategory('all')}
            style={[
              styles.categoryChip,
              {
                backgroundColor: activeCategory === 'all' ? PRIMARY : CARD_BACKGROUND,
                borderColor: BORDER_COLOR,
              },
            ]}
            textStyle={{ color: TEXT_PRIMARY }}
          >
            All
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category}
              selected={activeCategory === category}
              onPress={() => setActiveCategory(category)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: activeCategory === category ? PRIMARY : CARD_BACKGROUND,
                  borderColor: BORDER_COLOR,
                },
              ]}
              textStyle={{ color: TEXT_PRIMARY }}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>

        <View style={styles.coursesContainer}>
          {filteredCourses.map((course: Course) => (
            <Card key={course._id} style={[styles.courseCard, { backgroundColor: CARD_BACKGROUND }]}>
              <Card.Cover source={{ uri: course.thumbnail || 'https://via.placeholder.com/800x400' }} />
              <Card.Content>
                <Text style={[styles.courseTitle, { color: TEXT_PRIMARY }]}>{course.title}</Text>
                <View style={styles.progressContainer}>
                  <Text style={[styles.progressText, { color: TEXT_SECONDARY }]}>
                    Progress: {course.progress || 0}%
                  </Text>
                  <ProgressBar
                    progress={(course.progress || 0) / 100}
                    style={[styles.progressBar, { backgroundColor: BORDER_COLOR }]}
                    color={PRIMARY}
                  />
                </View>
                <View style={styles.courseInfo}>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={PRIMARY} />
                    <Text style={[styles.infoText, { color: TEXT_SECONDARY }]}>
                      Next: {course.nextModule || "Start learning"}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="account" size={16} color={PRIMARY} />
                    <Text style={[styles.infoText, { color: TEXT_SECONDARY }]}>
                      Instructor: {course.facilitatorName || "Unknown"}
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  onPress={() => {/* Navigate to course */}}
                  style={styles.continueButton}
                  buttonColor={PRIMARY}
                >
                  Continue Learning
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {/* Related Courses and Recent Activities */}
      <View style={styles.section}>
        <Card style={[styles.relatedCard, { backgroundColor: CARD_BACKGROUND }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Explore Related Courses</Text>
            {relatedCourses.map((course) => (
              <View key={course._id} style={styles.relatedCourse}>
                <Image
                  source={{ uri: course.thumbnail || 'https://via.placeholder.com/800x400' }}
                  style={styles.relatedThumbnail}
                />
                <View style={styles.relatedInfo}>
                  <Text style={[styles.relatedTitle, { color: TEXT_PRIMARY }]}>{course.title}</Text>
                  <Text style={[styles.relatedDescription, { color: TEXT_SECONDARY }]}>
                    {course.shortDescription || "No description available."}
                  </Text>
                  <View style={styles.relatedMeta}>
                    <MaterialCommunityIcons name="account" size={16} color={PRIMARY} />
                    <Text style={[styles.relatedMetaText, { color: TEXT_SECONDARY }]}>
                      Instructor: {course.facilitatorName || "Unknown"}
                    </Text>
                  </View>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => {/* Handle enrollment */}}
                  style={styles.enrollButton}
                  textColor={PRIMARY}
                >
                  Enroll
                </Button>
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={[styles.activitiesCard, { backgroundColor: CARD_BACKGROUND }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: TEXT_PRIMARY }]}>Recent Activities</Text>
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: `${PRIMARY}20` }]}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={PRIMARY} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityText, { color: TEXT_PRIMARY }]}>
                    Completed {activity.contentTitle} in {activity.courseTitle}
                  </Text>
                  <Text style={[styles.activityDate, { color: TEXT_SECONDARY }]}>
                    {formatDate(activity.lastAccessedAt)}
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  browseButton: {
    marginTop: 8,
  },
  statsContainer: {
    padding: 16,
    gap: 16,
  },
  statCard: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statSubtitle: {
    fontSize: 12,
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    borderWidth: 1,
  },
  coursesContainer: {
    gap: 16,
  },
  courseCard: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  courseInfo: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  continueButton: {
    marginTop: 8,
  },
  relatedCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  relatedCourse: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  relatedThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  relatedInfo: {
    flex: 1,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  relatedDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  relatedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relatedMetaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  enrollButton: {
    marginLeft: 12,
  },
  activitiesCard: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
  },
}); 