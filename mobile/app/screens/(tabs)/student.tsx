import { useColorScheme } from "@/hooks/useColorScheme";
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
import Colors from "../../constants/colors";

// Hardcoded demo data
const user = { name: "Demo User" };
const userXP = {
  totalXP: 1200,
  level: 3,
  currentLevelXP: 200,
  nextLevelXP: 400,
  streak: { current: 5 },
};
const userStats = {
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
  streakDays: 5,
};
const enrolledCourses = [
  {
    _id: "1",
    title: "Intro to AI",
    category: "ai",
    progress: 50,
    nextModule: "Module 2",
    facilitatorName: "Jane Doe",
    thumbnail: "",
  },
];
const relatedCourses = [
  {
    _id: "2",
    title: "Advanced AI",
    shortDescription: "Take your AI skills to the next level.",
    facilitatorName: "John Smith",
    thumbnail: "",
  },
];
const recentActivities = [
  {
    _id: "a1",
    courseId: "1",
    courseTitle: "Intro to AI",
    contentId: "c1",
    contentTitle: "Lesson 1",
    type: "lesson",
    action: "completed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
const categories = ["ai"];

export default function StudentDashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const theme = useColorScheme() ?? "light";

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
      ? enrolledCourses
      : enrolledCourses.filter((course) =>
          (course.category || "")
            .toLowerCase()
            .includes(activeCategory.toLowerCase())
        );

  // Navigation handlers
  const handleCoursePress = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };
  const handleEnrollPress = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };
  const handleBrowseCourses = () => {
    router.replace("../courses");
  };
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Simulate loading state
  const [loading] = useState(false);

  // --- Stats Grid: 2 cards per row, improved spacing ---
  const renderStatsGrid = () => (
    <View style={styles.statsGridWrapper}>
      <View style={styles.statsRow}>
        <Card
          style={[
            styles.statCard,
            { backgroundColor: Colors[theme].CARD_BACKGROUND },
          ]}
        >
          {" "}
          {/* XP */}
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons
                name="trophy"
                size={24}
                color={Colors[theme].PRIMARY}
              />
              <Text
                style={[
                  styles.statTitle,
                  { color: Colors[theme].TEXT_SECONDARY },
                ]}
              >
                Total XP
              </Text>
            </View>
            <Text
              style={[styles.statValue, { color: Colors[theme].TEXT_PRIMARY }]}
            >
              {userXP?.totalXP || 0}
            </Text>
            <ProgressBar
              progress={
                userXP && userXP.nextLevelXP > 0
                  ? userXP.currentLevelXP / userXP.nextLevelXP
                  : 0
              }
              color={Colors[theme].PRIMARY}
              style={styles.progressBar}
            />
            <Text
              style={[
                styles.statSubtitle,
                { color: Colors[theme].TEXT_SECONDARY },
              ]}
            >
              Level {userXP?.level || 1} • {userXP?.currentLevelXP || 0}/
              {userXP?.nextLevelXP || 100} XP
            </Text>
          </Card.Content>
        </Card>
        <Card
          style={[
            styles.statCard,
            { backgroundColor: Colors[theme].CARD_BACKGROUND },
          ]}
        >
          {" "}
          {/* Progress */}
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons
                name="book-open"
                size={24}
                color={Colors[theme].PRIMARY}
              />
              <Text
                style={[
                  styles.statTitle,
                  { color: Colors[theme].TEXT_SECONDARY },
                ]}
              >
                Progress
              </Text>
            </View>
            <Text
              style={[styles.statValue, { color: Colors[theme].TEXT_PRIMARY }]}
            >
              {userStats.totalLessons > 0
                ? Math.round(
                    (userStats.completedLessons / userStats.totalLessons) * 100
                  )
                : 0}
              %
            </Text>
            <ProgressBar
              progress={
                userStats.totalLessons > 0
                  ? userStats.completedLessons / userStats.totalLessons
                  : 0
              }
              color={Colors[theme].PRIMARY}
              style={styles.progressBar}
            />
            <Text
              style={[
                styles.statSubtitle,
                { color: Colors[theme].TEXT_SECONDARY },
              ]}
            >
              {userStats.completedLessons}/{userStats.totalLessons} lessons
            </Text>
          </Card.Content>
        </Card>
      </View>
      <View style={styles.statsRow}>
        <Card
          style={[
            styles.statCard,
            { backgroundColor: Colors[theme].CARD_BACKGROUND },
          ]}
        >
          {" "}
          {/* Streak */}
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons
                name="fire"
                size={24}
                color={Colors[theme].PRIMARY}
              />
              <Text
                style={[
                  styles.statTitle,
                  { color: Colors[theme].TEXT_SECONDARY },
                ]}
              >
                Current Streak
              </Text>
            </View>
            <Text
              style={[styles.statValue, { color: Colors[theme].TEXT_PRIMARY }]}
            >
              {userXP?.streak?.current || userStats.currentStreak} days
            </Text>
            <Text
              style={[
                styles.statSubtitle,
                { color: Colors[theme].TEXT_SECONDARY },
              ]}
            >
              {userXP?.streak?.current
                ? "Keep it up!"
                : "Start a streak today!"}
            </Text>
          </Card.Content>
        </Card>
        <Card
          style={[
            styles.statCard,
            { backgroundColor: Colors[theme].CARD_BACKGROUND },
          ]}
        >
          {" "}
          {/* Courses */}
          <Card.Content>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons
                name="target"
                size={24}
                color={Colors[theme].PRIMARY}
              />
              <Text
                style={[
                  styles.statTitle,
                  { color: Colors[theme].TEXT_SECONDARY },
                ]}
              >
                Courses
              </Text>
            </View>
            <Text
              style={[styles.statValue, { color: Colors[theme].TEXT_PRIMARY }]}
            >
              {userStats.completedCourses}/{userStats.totalEnrolled}
            </Text>
            <Text
              style={[
                styles.statSubtitle,
                { color: Colors[theme].TEXT_SECONDARY },
              ]}
            >
              {userStats.totalEnrolled === 0
                ? "Enroll in your first course"
                : "Completed"}
            </Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );

  // --- Course Cards: improved margin, image aspect, button placement ---
  const renderCourseGrid = () => (
    <View style={styles.courseGridWrapper}>
      {filteredCourses.map((course) => (
        <Card
          key={course._id}
          style={[
            styles.courseCard,
            { backgroundColor: Colors[theme].CARD_BACKGROUND },
          ]}
          onPress={() => handleCoursePress(course._id)}
        >
          <Card.Cover
            source={{
              uri:
                course.thumbnail ||
                "https://via.placeholder.com/800x400?text=No+Thumbnail",
            }}
            style={styles.courseImage}
            resizeMode="cover"
          />
          <Card.Content style={styles.courseContent}>
            <Text
              style={[
                styles.courseTitle,
                { color: Colors[theme].TEXT_PRIMARY },
              ]}
              numberOfLines={2}
            >
              {course.title}
            </Text>
            <View style={styles.progressContainer}>
              <Text
                style={[
                  styles.progressText,
                  { color: Colors[theme].TEXT_SECONDARY },
                ]}
              >
                Progress
              </Text>
              <Text
                style={[
                  styles.progressValue,
                  { color: Colors[theme].TEXT_SECONDARY },
                ]}
              >
                {course.progress || 0}%
              </Text>
            </View>
            <ProgressBar
              progress={(course.progress || 0) / 100}
              color={Colors[theme].PRIMARY}
              style={styles.progressBar}
            />
            <View style={styles.courseMeta}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color={Colors[theme].TEXT_SECONDARY}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: Colors[theme].TEXT_SECONDARY },
                  ]}
                >
                  Next: {course.nextModule || "Start learning"}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="account"
                  size={16}
                  color={Colors[theme].TEXT_SECONDARY}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: Colors[theme].TEXT_SECONDARY },
                  ]}
                >
                  {course.facilitatorName || "Unknown instructor"}
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
  );

  // --- Related Courses: vertical list, clear separation, always visible button ---
  const renderRelatedCourses = () => (
    <View style={styles.relatedCoursesWrapper}>
      {relatedCourses.length === 0 ? (
        <View style={styles.emptyContent}>
          <MaterialCommunityIcons
            name="book-open"
            size={32}
            color={Colors[theme].TEXT_SECONDARY}
          />
          <Text
            style={[
              styles.emptySubtitle,
              { color: Colors[theme].TEXT_SECONDARY },
            ]}
          >
            No recommendations yet
          </Text>
        </View>
      ) : (
        relatedCourses.map((course) => (
          <Card
            key={course._id}
            style={[
              styles.relatedCourseCard,
              { backgroundColor: Colors[theme].CARD_BACKGROUND },
            ]}
            onPress={() => handleEnrollPress(course._id)}
          >
            <View style={styles.relatedCourseRow}>
              <Card.Cover
                source={{
                  uri:
                    course.thumbnail ||
                    "https://via.placeholder.com/150x150?text=No+Thumbnail",
                }}
                style={styles.relatedCourseImage}
                resizeMode="cover"
              />
              <View style={styles.relatedCourseInfo}>
                <Text
                  style={[
                    styles.relatedCourseTitle,
                    { color: Colors[theme].TEXT_PRIMARY },
                  ]}
                  numberOfLines={2}
                >
                  {course.title}
                </Text>
                <Text
                  style={[
                    styles.relatedCourseDescription,
                    { color: Colors[theme].TEXT_SECONDARY },
                  ]}
                  numberOfLines={2}
                >
                  {course.shortDescription || "No description available."}
                </Text>
                <View style={styles.relatedCourseMeta}>
                  <MaterialCommunityIcons
                    name="account"
                    size={16}
                    color={Colors[theme].TEXT_SECONDARY}
                  />
                  <Text
                    style={[
                      styles.relatedCourseInstructor,
                      { color: Colors[theme].TEXT_SECONDARY },
                    ]}
                  >
                    {course.facilitatorName || "Unknown"}
                  </Text>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => handleEnrollPress(course._id)}
                  style={styles.enrollButton}
                  labelStyle={[
                    styles.enrollButtonLabel,
                    { color: Colors[theme].PRIMARY },
                  ]}
                >
                  View
                </Button>
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );

  // --- Recent Activities: padded card, spacing between items ---
  const renderRecentActivities = () => (
    <Card
      style={[
        styles.halfSectionCard,
        { backgroundColor: Colors[theme].CARD_BACKGROUND },
      ]}
    >
      <Card.Content>
        <Text
          style={[styles.sectionTitle, { color: Colors[theme].TEXT_PRIMARY }]}
        >
          Recent Activities
        </Text>
        {recentActivities.length === 0 ? (
          <View style={styles.emptyContent}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={32}
              color={Colors[theme].TEXT_SECONDARY}
            />
            <Text
              style={[
                styles.emptySubtitle,
                { color: Colors[theme].TEXT_SECONDARY },
              ]}
            >
              No recent activities
            </Text>
          </View>
        ) : (
          recentActivities.map((activity) => (
            <View key={activity._id} style={styles.activityItemWrapper}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: `${Colors[theme].PRIMARY}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    activity.type === "quiz" ? "file-question" : "book-open"
                  }
                  size={20}
                  color={Colors[theme].PRIMARY}
                />
              </View>
              <View style={styles.activityContent}>
                <Text
                  style={[
                    styles.activityText,
                    { color: Colors[theme].TEXT_PRIMARY },
                  ]}
                >
                  {activity.action === "completed" ? "Completed" : "Started"}{" "}
                  <Text style={styles.activityHighlight}>
                    {activity.contentTitle}
                  </Text>{" "}
                  in{" "}
                  <Text style={styles.activityHighlight}>
                    {activity.courseTitle}
                  </Text>
                </Text>
                <Text
                  style={[
                    styles.activityDate,
                    { color: Colors[theme].TEXT_SECONDARY },
                  ]}
                >
                  {formatDate(activity.createdAt)}
                </Text>
              </View>
            </View>
          ))
        )}
      </Card.Content>
    </Card>
  );

  // --- Main render ---
  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: Colors[theme].BACKGROUND },
        ]}
      >
        <ActivityIndicator size="large" color={Colors[theme].PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[theme].BACKGROUND }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View
        style={[
          styles.welcomeSection,
          { backgroundColor: Colors[theme].PRIMARY },
        ]}
      >
        <Text
          style={[styles.welcomeTitle, { color: Colors[theme].TEXT_PRIMARY }]}
        >
          Welcome back, {user?.name || "Learner"}!
        </Text>
        <Text
          style={[
            styles.welcomeSubtitle,
            { color: Colors[theme].TEXT_SECONDARY },
          ]}
        >
          Your journey into advanced AI education continues. Track your
          progress, join events, and connect with fellow learners.
        </Text>
        <Button
          mode="contained"
          onPress={handleBrowseCourses}
          style={styles.browseButton}
          labelStyle={[
            styles.browseButtonLabel,
            { color: Colors[theme].PRIMARY },
          ]}
        >
          Browse More Courses
        </Button>
      </View>
      {/* Stats Overview */}
      {renderStatsGrid()}
      {/* Course Progress Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                { color: Colors[theme].TEXT_PRIMARY },
              ]}
            >
              Your Learning Journey
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: Colors[theme].TEXT_SECONDARY },
              ]}
            >
              Continue where you left off
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
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                All
              </Chip>
              {categories.map((category) => (
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
          <Card
            style={[
              styles.errorCard,
              { backgroundColor: Colors[theme].CARD_BACKGROUND },
            ]}
          >
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={48}
                color={Colors[theme].TEXT_SECONDARY}
              />
              <Text
                style={[
                  styles.emptyTitle,
                  { color: Colors[theme].TEXT_PRIMARY },
                ]}
              >
                Error loading courses
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: Colors[theme].TEXT_SECONDARY },
                ]}
              >
                {error}
              </Text>
              <Button
                mode="contained"
                onPress={() => setError(null)}
                style={styles.emptyButton}
              >
                Try Again
              </Button>
            </Card.Content>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card
            style={[
              styles.emptyCard,
              { backgroundColor: Colors[theme].CARD_BACKGROUND },
            ]}
          >
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons
                name="book-open"
                size={48}
                color={Colors[theme].TEXT_SECONDARY}
              />
              <Text
                style={[
                  styles.emptyTitle,
                  { color: Colors[theme].TEXT_PRIMARY },
                ]}
              >
                No courses found
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: Colors[theme].TEXT_SECONDARY },
                ]}
              >
                {activeCategory === "all"
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
          renderCourseGrid()
        )}
      </View>
      {/* Related Courses and Recent Activities */}
      <View style={styles.bottomSectionWrapper}>
        <Card
          style={[
            styles.halfSectionCard,
            { backgroundColor: Colors[theme].CARD_BACKGROUND },
          ]}
        >
          <Card.Content>
            <Text
              style={[
                styles.sectionTitle,
                { color: Colors[theme].TEXT_PRIMARY },
              ]}
            >
              Recommended For You
            </Text>
            {renderRelatedCourses()}
          </Card.Content>
        </Card>
        {renderRecentActivities()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeSection: {
    padding: 20,
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
    backgroundColor: "white",
  },
  browseButtonLabel: {
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
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
    backgroundColor: "rgba(0, 0, 0, 0.1)",
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
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.light.BORDER_COLOR,
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
    marginTop: 16,
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
  errorCard: {
    marginTop: 16,
    borderRadius: 12,
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  halfSectionCard: {
    flex: 1,
    minWidth: "100%",
    borderRadius: 12,
    elevation: 1,
  },
  relatedCourseCard: {
    marginBottom: 12,
    backgroundColor: "transparent",
    elevation: 0,
  },
  relatedCourseContent: {
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
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
  },
  relatedCourseInstructor: {
    fontSize: 12,
  },
  enrollButton: {
    alignSelf: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.PRIMARY,
  },
  enrollButtonLabel: {
    fontWeight: "bold",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.BORDER_COLOR,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.PRIMARY,
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
  // --- Added styles for improved layout ---
  statsGridWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  courseGridWrapper: {
    gap: 16,
  },
  relatedCoursesWrapper: {
    gap: 12,
  },
  relatedCourseRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  activityItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.BORDER_COLOR,
  },
  bottomSectionWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
    flexDirection: "column",
    flexWrap: "nowrap",
  },
});
