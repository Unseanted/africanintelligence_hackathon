import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { 
  ActivityIndicator, 
  Card, 
  Searchbar, 
  Text, 
  TouchableRipple,
  Button,
} from "react-native-paper";
import { useTheme } from "../../contexts/ThemeContext";
import { useTourLMS } from "../../contexts/TourLMSContext";

const CourseCard = ({ course, isEnrolled, onPress, colors }) => {
  const progress = course.progress || 0;
  
  return (
    <Card style={[styles.courseCard, { backgroundColor: colors.cardBackground }]}>
      <TouchableRipple onPress={onPress}>
        <>
          <View style={styles.imageContainer}>
            {course.thumbnail ? (
              <Image
                source={{ uri: course.thumbnail }}
                style={styles.courseImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.courseImage, 
                  styles.placeholderImage,
                  { backgroundColor: colors.primary + '20' }
                ]}
              >
                <Text style={[styles.placeholderText, { color: colors.primary }]}>
                  {course.title.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          <Card.Content style={styles.cardContent}>
            <Text style={[styles.courseTitle, { color: colors.text }]}>
              {course.title}
            </Text>
            <Text 
              style={[styles.courseDescription, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {course.description}
            </Text>
            <View style={styles.courseMeta}>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {course.category || "Uncategorized"}
              </Text>
              {isEnrolled && (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {progress}% Complete
                </Text>
              )}
            </View>
            {isEnrolled && (
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { 
                  backgroundColor: colors.primary + '20',
                  width: '100%' 
                }]}>
                  <View style={[styles.progressFill, { 
                    backgroundColor: colors.primary,
                    width: `${progress}%` 
                  }]} />
                </View>
              </View>
            )}
          </Card.Content>
        </>
      </TouchableRipple>
    </Card>
  );
};

export default function CoursesScreen() {
  const { colors } = useTheme();
  const {
    CoursesHub,
    enrolledCourses,
    loading: contextLoading,
    getCoursesHub,
    enrollInCourse,
  } = useTourLMS();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled'>('all');

  useEffect(() => {
    if (CoursesHub && CoursesHub.length > 0) {
      setFilteredCourses(CoursesHub);
    }
  }, [CoursesHub]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getCoursesHub();
    } catch (error) {
      console.error("Error refreshing courses:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredCourses(CoursesHub);
    } else {
      const filtered = CoursesHub.filter(
        (course) =>
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase()) ||
          (course.category?.toLowerCase() || "").includes(query.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const handleCoursePress = (courseId: string) => {
    router.push(`/screens/course/${courseId}`);
  };

  const displayedCourses = activeTab === 'enrolled' 
    ? enrolledCourses 
    : filteredCourses;

  if (contextLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Courses
        </Text>
        <Searchbar
          placeholder="Search courses..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={[styles.searchBar, { 
            backgroundColor: colors.background,
            borderColor: colors.primary 
          }]}
          iconColor={colors.primary}
          inputStyle={{ color: colors.text }}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'all' && styles.activeTab,
            activeTab === 'all' && { borderBottomColor: colors.primary }
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'all' && { color: colors.primary }
          ]}>
            All Courses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'enrolled' && styles.activeTab,
            activeTab === 'enrolled' && { borderBottomColor: colors.primary }
          ]}
          onPress={() => setActiveTab('enrolled')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'enrolled' && { color: colors.primary }
          ]}>
            My Learning
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.coursesGrid}>
          {displayedCourses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.noCourses, { color: colors.textSecondary }]}>
                {activeTab === 'enrolled' 
                  ? "You haven't enrolled in any courses yet" 
                  : "No courses found"}
              </Text>
              {activeTab === 'enrolled' && (
                <Button 
                  mode="contained" 
                  onPress={() => setActiveTab('all')}
                  style={{ marginTop: 16 }}
                  buttonColor={colors.primary}
                >
                  Browse Courses
                </Button>
              )}
            </View>
          ) : (
            displayedCourses.map((course) => {
              const isEnrolled = enrolledCourses?.some(c => c._id === course._id);
              return (
                <CourseCard
                  key={course._id}
                  course={course}
                  isEnrolled={isEnrolled}
                  onPress={() => handleCoursePress(course._id)}
                  colors={colors}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
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
  header: {
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  searchBar: {
    elevation: 0,
    borderWidth: 1,
    borderRadius: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  coursesGrid: {
    padding: 16,
    gap: 16,
  },
  courseCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  imageContainer: {
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  courseImage: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 24,
  },
  courseDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  courseMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  noCourses: {
    textAlign: "center",
    fontSize: 16,
  },
});