import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Card,
  Chip,
  ProgressBar,
  Rating,
  Text,
  TextInput,
} from "react-native-paper";
import Colors from "../../constants/colors";
import { useTourLMS } from "../../contexts/TourLMSContext";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, token, apiCall, socket } = useTourLMS();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;

      try {
        const data = await apiCall(`/courses/${id}`);
        setCourse(data.course);
        setIsEnrolled(data.isEnrolled); // Assuming API returns isEnrolled flag
      } catch (error) {
        console.error("Error fetching course:", error);
        Alert.alert("Error", "Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();

    // Set up socket listeners for real-time updates
    if (socket) {
      socket.on("courseUpdate", (updatedCourse) => {
        if (updatedCourse._id === id) {
          setCourse((prev) => ({ ...prev, ...updatedCourse }));
        }
      });

      socket.on("enrollmentUpdate", ({ courseId, enrolled }) => {
        if (courseId === id) {
          setIsEnrolled(enrolled);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("courseUpdate");
        socket.off("enrollmentUpdate");
      }
    };
  }, [id, apiCall, socket]);

  const handleEnroll = async () => {
    if (!course || !token) return;

    try {
      setEnrolling(true);
      await apiCall(`/courses/${id}/enroll`, { method: "POST" });
      setIsEnrolled(true);
      router.push(`/course/${id}/content`);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      Alert.alert("Error", error.message || "Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  const handleRateCourse = async () => {
    try {
      await apiCall(`/courses/${id}/rate`, {
        method: "POST",
        body: JSON.stringify({ rating, comment: review }),
      });
      setRatingModalVisible(false);
      Alert.alert("Success", "Thank you for your rating!");
    } catch (error) {
      console.error("Error rating course:", error);
      Alert.alert("Error", "Failed to submit rating");
    }
  };

  const handleContinueLearning = () => {
    router.push({
      pathname: `/course/${id}/content`,
      params: {
        lastModuleId: course.lastAccessedModule,
        lastContentId: course.lastAccessedContent,
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Course not found</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: course.thumbnail || "https://via.placeholder.com/800x400",
          }}
          style={styles.courseImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{course.title}</Text>

        <View style={styles.metaContainer}>
          <Chip icon="account-group" style={styles.chip}>
            {course.enrolledStudents || 0} students
          </Chip>
          <Chip icon="clock-outline" style={styles.chip}>
            {course.duration || "Self-paced"}
          </Chip>
          <Chip icon="star" style={styles.chip}>
            {course.averageRating
              ? `${course.averageRating.toFixed(1)}/5`
              : "Not rated"}
          </Chip>
        </View>

        {isEnrolled && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Progress: {course.progress || 0}%
            </Text>
            <ProgressBar
              progress={(course.progress || 0) / 100}
              color={Colors.PRIMARY}
              style={styles.progressBar}
            />
          </View>
        )}

        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{course.description}</Text>
          </Card.Content>
        </Card>

        {course.learningOutcomes && (
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>What You'll Learn</Text>
              {course.learningOutcomes.map((item, index) => (
                <View key={index} style={styles.learningItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={Colors.PRIMARY}
                  />
                  <Text style={styles.learningText}>{item}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {course.instructor && (
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Instructor</Text>
              <View style={styles.instructorContainer}>
                <Image
                  source={{
                    uri:
                      course.instructor.profilePicture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        course.instructor.name
                      )}&background=random`,
                  }}
                  style={styles.instructorImage}
                />
                <View style={styles.instructorInfo}>
                  <Text style={styles.instructorName}>
                    {course.instructor.name}
                  </Text>
                  <Text style={styles.instructorTitle}>
                    {course.instructor.title}
                  </Text>
                  <Text style={styles.instructorBio}>
                    {course.instructor.bio}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {course.modules && (
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Course Content</Text>
              {course.modules.map((module, index) => (
                <View key={module._id} style={styles.moduleItem}>
                  <Text style={styles.moduleTitle}>
                    {index + 1}. {module.title}
                  </Text>
                  <Text style={styles.moduleDuration}>{module.duration}</Text>
                  {isEnrolled && module.completed && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color="green"
                    />
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          {isEnrolled ? (
            <>
              <Button
                mode="contained"
                onPress={handleContinueLearning}
                style={styles.button}
                buttonColor={Colors.PRIMARY}
              >
                Continue Learning
              </Button>
              <Button
                mode="outlined"
                onPress={() => setRatingModalVisible(true)}
                style={[styles.button, { marginTop: 12 }]}
                textColor={Colors.PRIMARY}
              >
                Rate This Course
              </Button>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={handleEnroll}
              style={styles.button}
              buttonColor={Colors.PRIMARY}
              loading={enrolling}
              disabled={enrolling}
            >
              Enroll Now
            </Button>
          )}
        </View>
      </View>

      {/* Rating Modal */}
      <Modal
        visible={ratingModalVisible}
        onDismiss={() => setRatingModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={styles.modalTitle}>Rate This Course</Text>
        <Rating value={rating} onValueChange={setRating} count={5} size={30} />
        <TextInput
          label="Your Review"
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={4}
          style={styles.reviewInput}
        />
        <View style={styles.modalButtons}>
          <Button
            mode="outlined"
            onPress={() => setRatingModalVisible(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleRateCourse}
            style={styles.modalButton}
            disabled={rating === 0}
          >
            Submit
          </Button>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    color: Colors.TEXT_PRIMARY,
  },
  imageContainer: {
    height: 250,
  },
  courseImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: Colors.CARD_BACKGROUND,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  section: {
    marginBottom: 16,
    backgroundColor: Colors.CARD_BACKGROUND,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 24,
  },
  learningItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  learningText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginLeft: 8,
    flex: 1,
  },
  instructorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  instructorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.TEXT_PRIMARY,
  },
  instructorTitle: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
  },
  instructorBio: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  moduleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  moduleTitle: {
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
    flex: 1,
  },
  moduleDuration: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginHorizontal: 8,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    borderRadius: 8,
  },
  modalContainer: {
    backgroundColor: Colors.BACKGROUND,
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: Colors.TEXT_PRIMARY,
    textAlign: "center",
  },
  reviewInput: {
    marginVertical: 16,
    backgroundColor: Colors.CARD_BACKGROUND,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
