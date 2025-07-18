import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Card, Searchbar } from "react-native-paper";
import CourseContent from "../../components/CourseContent";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import Colors from "../../constants/colors";
import type { Course } from "../../contexts/TourLMSContext";
import { useTourLMS } from "../../contexts/TourLMSContext";

export default function CoursesScreen() {
  const {
    CoursesHub,
    loading: contextLoading,
    getCoursesHub,
    enrolledCourses,
    enrollInCourse,
  } = useTourLMS();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (CoursesHub.length > 0) {
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
    router.push(`/course/${courseId}`);
  };

  if (contextLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="primary" style={styles.title}>
          Courses
        </ThemedText>
        <Searchbar
          placeholder="Search courses..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={Colors.PRIMARY}
          inputStyle={{ color: Colors.TEXT_PRIMARY }}
          placeholderTextColor={Colors.TEXT_SECONDARY}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]}
            tintColor={Colors.PRIMARY}
          />
        }
      >
        <View style={styles.coursesGrid}>
          {Array.isArray(filteredCourses) && filteredCourses.length === 0 ? (
            <ThemedText type="secondary" style={styles.noCourses}>
              No courses found
            </ThemedText>
          ) : (
            (filteredCourses || []).map((course) => {
              const isEnrolled = enrolledCourses?.some(
                (c) => c._id === course._id
              );
              return (
                <Card
                  key={course._id}
                  style={styles.courseCard}
                  onPress={() => handleCoursePress(course._id)}
                >
                  <View style={styles.imageContainer}>
                    {course.thumbnail ? (
                      <Image
                        source={{ uri: course.thumbnail }}
                        style={styles.courseImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[styles.courseImage, styles.placeholderImage]}
                      >
                        <ThemedText
                          type="secondary"
                          style={styles.placeholderText}
                        >
                          {course.title.charAt(0)}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <Card.Content style={styles.cardContent}>
                    <ThemedText type="primary" style={styles.courseTitle}>
                      {course.title}
                    </ThemedText>
                    <ThemedText
                      type="secondary"
                      style={styles.courseDescription}
                    >
                      {course.description}
                    </ThemedText>
                    <View style={styles.courseMeta}>
                      <ThemedText type="secondary" style={styles.metaText}>
                        {course.category || "Uncategorized"}
                      </ThemedText>
                      <ThemedText type="secondary" style={styles.metaText}>
                        {course.totalStudents || 0} students
                      </ThemedText>
                    </View>
                    <CourseContent
                      course={{
                        modules: course.modules || [],
                        totalProgress: course.progress ?? 0,
                      }}
                      isEnrolled={isEnrolled}
                      onLessonPress={handleCoursePress}
                      onEnroll={async () => {
                        await enrollInCourse(course._id);
                      }}
                      onContinue={() => handleCoursePress(course._id)}
                    />
                  </Card.Content>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </ThemedView>
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
    backgroundColor: Colors.CARD_BACKGROUND,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: Colors.BACKGROUND,
    elevation: 0,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  coursesGrid: {
    padding: 16,
    gap: 16,
  },
  courseCard: {
    backgroundColor: Colors.CARD_BACKGROUND,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  imageContainer: {
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  courseImage: {
    flex: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
  },
  noCourses: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 16,
  },
});
