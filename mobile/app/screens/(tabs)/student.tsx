import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Button, Card, Chip, ProgressBar, Text } from "react-native-paper";
import { useTheme } from "../../contexts/ThemeContext";
import { useTourLMS } from "../../contexts/TourLMSContext";

// Hardcoded demo data (would come from context in real app)
const demoData = {
  user: { name: "Demo User", email: "demo@tourlms.com" },
  stats: {
    totalPoints: 100,
    rank: 2,
    completedCourses: 2,
    activeCourses: 3,
    currentStreak: 5,
    totalXp: 1200,
    totalEnrolled: 5,
    certificatesEarned: 1,
    completedLessons: 10,
    totalLessons: 20,
    completedQuizzes: 3,
    totalQuizzes: 5,
    averageScore: 85,
    lastActive: new Date().toISOString(),
  },
  enrolledCourses: [
    {
      _id: "1",
      title: "Introduction to Artificial Intelligence",
      category: "ai",
      progress: 50,
      nextModule: "Neural Networks Basics",
      facilitatorName: "Dr. Jane Smith",
      thumbnail: "https://source.unsplash.com/random/800x400/?ai",
    },
    {
      _id: "2",
      title: "Advanced Python Programming",
      category: "programming",
      progress: 30,
      nextModule: "Decorators and Generators",
      facilitatorName: "John Doe",
      thumbnail: "https://source.unsplash.com/random/800x400/?python",
    },
  ],
  relatedCourses: [
    {
      _id: "3",
      title: "Machine Learning Fundamentals",
      shortDescription: "Learn the core concepts of ML with practical examples.",
      facilitatorName: "Dr. Sarah Johnson",
      thumbnail: "https://source.unsplash.com/random/800x400/?machinelearning",
    },
    {
      _id: "4",
      title: "Data Visualization with Python",
      shortDescription: "Create stunning visualizations with Matplotlib and Seaborn.",
      facilitatorName: "Mike Chen",
      thumbnail: "https://source.unsplash.com/random/800x400/?datavisualization",
    },
  ],
  recentActivities: [
    {
      _id: "a1",
      courseId: "1",
      courseTitle: "Intro to AI",
      contentId: "c1",
      contentTitle: "Lesson 1: AI History",
      type: "lesson",
      action: "completed",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: "a2",
      courseId: "2",
      courseTitle: "Advanced Python",
      contentId: "c3",
      contentTitle: "Quiz: OOP Concepts",
      type: "quiz",
      action: "completed",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  achievements: [
    {
      id: "1",
      name: "Fast Learner",
      description: "Completed 3 lessons in one day",
      icon: "rocket",
      unlockedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Quiz Master",
      description: "Scored 100% on 5 quizzes",
      icon: "trophy",
      unlockedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};

export default function StudentDashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, userXP, refreshDashboard } = useTourLMS();
  
  // Use demo data if context data not available
  const currentUser = user || demoData.user;
  const currentStats = demoData.stats; // In real app, would come from context
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Categories would normally come from API
  const categories = ["ai", "programming", "data-science", "web-dev"];

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Filter courses by active category
  const filteredCourses = 
    activeCategory === "all"
      ? demoData.enrolledCourses
      : demoData.enrolledCourses.filter(course => 
          course.category === activeCategory
        );

  // Navigation handlers
  const handleCoursePress = (courseId: string) => {
    router.push(`/screens/course/${courseId}`);
  };

  const handleBrowseCourses = () => {
    router.push("/screens/(tabs)/course");  
  };

  const handleViewAchievements = () => {
    router.push("/screens/achievements");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDashboard();
    } catch (err) {
      setError("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  // --- Stats Grid Component ---
  const renderStatsGrid = () => (
    <View style={styles.statsGridWrapper}>
      <View style={styles.statsRow}>
        {/* XP Card */}
        <Card style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="trophy" size={24} color={colors.primary} />
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                Total XP
              </Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {userXP?.totalXP || currentStats.totalXp}
            </Text>
            <ProgressBar
              progress={
                userXP && userXP.nextLevelXP > 0
                  ? userXP.currentLevelXP / userXP.nextLevelXP
                  : 0.5
              }
              color={colors.primary}
              style={styles.progressBar}
            />
            <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
              Level {userXP?.level || 3} • {userXP?.currentLevelXP || 200}/
              {userXP?.nextLevelXP || 400} XP
            </Text>
          </Card.Content>
        </Card>

        {/* Progress Card */}
        <Card style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="book-open" size={24} color={colors.primary} />
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                Progress
              </Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {Math.round(
                (currentStats.completedLessons / currentStats.totalLessons) * 100
              )}
              %
            </Text>
            <ProgressBar
              progress={currentStats.completedLessons / currentStats.totalLessons}
              color={colors.primary}
              style={styles.progressBar}
            />
            <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
              {currentStats.completedLessons}/{currentStats.totalLessons} lessons
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.statsRow}>
        {/* Streak Card */}
        <Card style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="fire" size={24} color={colors.primary} />
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                Current Streak
              </Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {currentStats.currentStreak} days
            </Text>
            <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
              {currentStats.currentStreak > 0 
                ? "Keep it up!" 
                : "Start learning to begin a streak!"}
            </Text>
          </Card.Content>
        </Card>

        {/* Courses Card */}
        <Card style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="target" size={24} color={colors.primary} />
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                Courses
              </Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {currentStats.completedCourses}/{currentStats.totalEnrolled}
            </Text>
            <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
              {currentStats.totalEnrolled === 0
                ? "Enroll in your first course"
                : "Completed"}
            </Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );

  // --- Course Card Component ---
  const renderCourseCard = (course: typeof demoData.enrolledCourses[0]) => (
    <Card
      key={course._id}
      style={[styles.courseCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleCoursePress(course._id)}
    >
      <Card.Cover
        source={{ uri: course.thumbnail }}
        style={styles.courseImage}
        resizeMode="cover"
      />
      <Card.Content style={styles.courseContent}>
        <Text 
          style={[styles.courseTitle, { color: colors.text }]} 
          numberOfLines={2}
        >
          {course.title}
        </Text>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Progress
          </Text>
          <Text style={[styles.progressValue, { color: colors.textSecondary }]}>
            {course.progress}%
          </Text>
        </View>
        <ProgressBar
          progress={course.progress / 100}
          color={colors.primary}
          style={styles.progressBar}
        />
        <View style={styles.courseMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Next: {course.nextModule}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons
              name="account"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {course.facilitatorName}
            </Text>
          </View>
        </View>
        <Button
          mode="contained"
          onPress={() => handleCoursePress(course._id)}
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          labelStyle={styles.continueButtonLabel}
        >
          {course.progress > 0 ? "Continue" : "Start"} Learning
        </Button>
      </Card.Content>
    </Card>
  );

  // --- Related Course Card Component ---
  const renderRelatedCourseCard = (course: typeof demoData.relatedCourses[0]) => (
    <Card
      key={course._id}
      style={[styles.relatedCourseCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleCoursePress(course._id)}
    >
      <View style={styles.relatedCourseRow}>
        <Card.Cover
          source={{ uri: course.thumbnail }}
          style={styles.relatedCourseImage}
          resizeMode="cover"
        />
        <View style={styles.relatedCourseInfo}>
          <Text 
            style={[styles.relatedCourseTitle, { color: colors.text }]} 
            numberOfLines={2}
          >
            {course.title}
          </Text>
          <Text 
            style={[styles.relatedCourseDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {course.shortDescription}
          </Text>
          <View style={styles.relatedCourseMeta}>
            <MaterialCommunityIcons
              name="account"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.relatedCourseInstructor, { color: colors.textSecondary }]}>
              {course.facilitatorName}
            </Text>
          </View>
          <Button
            mode="outlined"
            onPress={() => handleCoursePress(course._id)}
            style={[styles.enrollButton, { borderColor: colors.primary }]}
            labelStyle={[styles.enrollButtonLabel, { color: colors.primary }]}
          >
            View Details
          </Button>
        </View>
      </View>
    </Card>
  );

  // --- Activity Item Component ---
  const renderActivityItem = (activity: typeof demoData.recentActivities[0]) => (
    <View key={activity._id} style={styles.activityItemWrapper}>
      <View style={[styles.activityIcon, { backgroundColor: `${colors.primary}20` }]}>
        <MaterialCommunityIcons
          name={activity.type === "quiz" ? "file-question" : "book-open"}
          size={20}
          color={colors.primary}
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityText, { color: colors.text }]}>
          {activity.action === "completed" ? "Completed" : "Started"}{" "}
          <Text style={[styles.activityHighlight, { color: colors.primary }]}>
            {activity.contentTitle}
          </Text>{" "}
          in{" "}
          <Text style={[styles.activityHighlight, { color: colors.primary }]}>
            {activity.courseTitle}
          </Text>
        </Text>
        <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
          {formatDate(activity.createdAt)}
        </Text>
      </View>
    </View>
  );

  // --- Achievement Badge Component ---
  const renderAchievementBadge = (achievement: typeof demoData.achievements[0]) => (
    <View key={achievement.id} style={styles.achievementBadge}>
      <View style={[styles.achievementIcon, { backgroundColor: `${colors.primary}20` }]}>
        <MaterialCommunityIcons
          name={achievement.icon as any}
          size={24}
          color={colors.primary}
        />
      </View>
      <View style={styles.achievementInfo}>
        <Text style={[styles.achievementTitle, { color: colors.text }]}>
          {achievement.name}
        </Text>
        <Text style={[styles.achievementDesc, { color: colors.textSecondary }]}>
          {achievement.description}
        </Text>
        <Text style={[styles.achievementDate, { color: colors.textSecondary }]}>
          Earned {formatDate(achievement.unlockedAt)}
        </Text>
      </View>
    </View>
  );

  // --- Main Loading State ---
  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    >
      {/* Welcome Section */}
      <View style={[styles.welcomeSection, { backgroundColor: colors.primary }]}>
        <Text style={[styles.welcomeTitle, { color: colors.surface }]}>
          Welcome back, {currentUser.name}!
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: `${colors.surface}CC` }]}>
          {currentStats.completedCourses > 0
            ? "Keep up the great work on your learning journey!"
            : "Ready to start your first course?"}
        </Text>
        <Button
          mode="contained"
          onPress={handleBrowseCourses}
          style={[styles.browseButton, { backgroundColor: colors.surface }]}
          labelStyle={[styles.browseButtonLabel, { color: colors.primary }]}
        >
          Browse Courses
        </Button>
      </View>

      {/* Stats Overview */}
      {renderStatsGrid()}

      {/* Learning Progress Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Learning Journey
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {filteredCourses.length > 0 
                ? "Continue where you left off" 
                : "Discover new courses"}
            </Text>
          </View>
          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              <Chip
                selected={activeCategory === "all"}
                onPress={() => setActiveCategory("all")}
                style={[
                  styles.categoryChip,
                  { 
                    backgroundColor: activeCategory === "all" 
                      ? colors.primary 
                      : 'transparent',
                    borderColor: colors.borderColor
                  }
                ]}
                textStyle={[
                  styles.categoryChipText,
                  { 
                    color: activeCategory === "all" 
                      ? colors.surface 
                      : colors.textSecondary
                  }
                ]}
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
                      backgroundColor: activeCategory === category 
                        ? colors.primary 
                        : 'transparent',
                      borderColor: colors.borderColor
                    }
                  ]}
                  textStyle={[
                    styles.categoryChipText,
                    { 
                      color: activeCategory === category 
                        ? colors.surface 
                        : colors.textSecondary
                    }
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Chip>
              ))}
            </ScrollView>
          )}
        </View>

        {error ? (
          <Card style={[styles.errorCard, { backgroundColor: colors.cardBackground }]}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={48}
                color={colors.error}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Error loading courses
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {error}
              </Text>
              <Button
                mode="contained"
                onPress={() => setError(null)}
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              >
                Try Again
              </Button>
            </Card.Content>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons
                name="book-open"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {activeCategory === "all"
                  ? "No courses enrolled yet"
                  : `No ${activeCategory} courses`}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {activeCategory === "all"
                  ? "Browse our catalog to find your first course"
                  : "Try another category or browse all courses"}
              </Text>
              <Button
                mode="contained"
                onPress={handleBrowseCourses}
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              >
                Browse Courses
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.courseGridWrapper}>
            {filteredCourses.map(renderCourseCard)}
          </View>
        )}
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Achievements
          </Text>
          <Button 
            mode="text" 
            onPress={handleViewAchievements}
            textColor={colors.primary}
            style={styles.viewAllButton}
          >
            View All
          </Button>
        </View>
        {demoData.achievements.length > 0 ? (
          <Card style={[styles.achievementsCard, { backgroundColor: colors.cardBackground }]}>
            <Card.Content style={styles.achievementsContent}>
              {demoData.achievements.slice(0, 2).map(renderAchievementBadge)}
            </Card.Content>
          </Card>
        ) : (
          <Card style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons
                name="trophy"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No achievements yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Complete courses and activities to earn achievements
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Bottom Section - Recommendations and Activities */}
      <View style={styles.bottomSectionWrapper}>
        {/* Recommended Courses */}
        <Card style={[styles.halfSectionCard, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recommended For You
            </Text>
            <View style={styles.relatedCoursesWrapper}>
              {demoData.relatedCourses.length > 0 ? (
                demoData.relatedCourses.slice(0, 2).map(renderRelatedCourseCard)
              ) : (
                <View style={styles.emptyContent}>
                  <MaterialCommunityIcons
                    name="book-open"
                    size={32}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    No recommendations yet
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activities */}
        <Card style={[styles.halfSectionCard, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Activities
            </Text>
            {demoData.recentActivities.length > 0 ? (
              <View style={styles.activitiesList}>
                {demoData.recentActivities.map(renderActivityItem)}
              </View>
            ) : (
              <View style={styles.emptyContent}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={32}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  No recent activities
                </Text>
              </View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeSection: {
    padding: 24,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  browseButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
  browseButtonLabel: {
    fontWeight: "bold",
  },
  statsGridWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 12,
    elevation: 1,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginVertical: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
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
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  courseGridWrapper: {
    gap: 16,
  },
  courseCard: {
    borderRadius: 12,
    overflow: "hidden",
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
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  courseMeta: {
    marginTop: 12,
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    flexShrink: 1,
  },
  continueButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  continueButtonLabel: {
    fontWeight: "bold",
  },
  emptyCard: {
    borderRadius: 12,
  },
  errorCard: {
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  bottomSectionWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  halfSectionCard: {
    borderRadius: 12,
    elevation: 1,
  },
  relatedCoursesWrapper: {
    gap: 12,
    marginTop: 8,
  },
  relatedCourseCard: {
    elevation: 0,
  },
  relatedCourseRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  relatedCourseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  relatedCourseInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  relatedCourseTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  relatedCourseDescription: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  relatedCourseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  relatedCourseInstructor: {
    fontSize: 12,
  },
  enrollButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
  },
  enrollButtonLabel: {
    fontWeight: "bold",
  },
  activitiesList: {
    marginTop: 8,
  },
  activityItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  activityHighlight: {
    fontWeight: "bold",
  },
  activityDate: {
    fontSize: 12,
    marginTop: 2,
  },
  achievementsCard: {
    borderRadius: 12,
  },
  achievementsContent: {
    paddingVertical: 12,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 10,
    fontStyle: 'italic',
  },
});