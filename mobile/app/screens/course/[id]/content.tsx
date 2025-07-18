import { useColorScheme } from "@/hooks/useColorScheme";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, ProgressBar, Text } from "react-native-paper";
import { useTourLMS } from "../../../../contexts/TourLMSContext";
import Colors from "../../../constants/colors";

// Define types for course, module, and content
interface CourseContent {
  _id: string;
  type: string;
  title?: string;
  description?: string;
  url?: string;
  source?: string;
  content?: string;
  text?: string;
  file?: string;
}

interface CourseModule {
  _id: string;
  title: string;
  contents: CourseContent[];
}

interface Course {
  _id: string;
  title: string;
  modules: CourseModule[];
}

function CourseContentScreen() {
  const { id } = useLocalSearchParams();
  const { lastModuleId, lastContentId } = useLocalSearchParams();
  const { token } = useTourLMS();
  const theme = useColorScheme() ?? "light";
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [currentContent, setCurrentContent] = useState<CourseContent | null>(
    null
  );
  const [progress, setProgress] = useState(0);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    const fetchCourseContent = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/courses/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const responseData = await data.json();
        setCourse(responseData.course);
        setProgress(responseData.progress || 0);

        // Find initial module and content to display
        let moduleToDisplay = responseData.course.modules?.[0];
        let contentToDisplay = moduleToDisplay?.contents?.[0];

        // If we have last accessed info, use that
        if (lastModuleId) {
          const lastModule = responseData.course.modules.find(
            (m: CourseModule) => m._id === lastModuleId
          );
          if (lastModule) {
            moduleToDisplay = lastModule;
            if (lastContentId) {
              const lastContent = moduleToDisplay.contents.find(
                (c: CourseContent) => c._id === lastContentId
              );
              if (lastContent) contentToDisplay = lastContent;
            }
          }
        }

        setCurrentModule(moduleToDisplay);
        setCurrentContent(contentToDisplay);
      } catch (error) {
        console.error("Error fetching course content:", error);
        Alert.alert("Error", "Failed to load course content");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [id, lastModuleId, lastContentId, token]);

  const handleContentComplete = async () => {
    if (!course || !currentModule || !currentContent) return;

    try {
      setContentLoading(true);

      // Update progress on server
      await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/courses/${id}/progress`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            moduleId: currentModule._id,
            contentId: currentContent._id,
            completed: true,
          }),
        }
      );

      // Find next content item
      const currentModuleIndex = course.modules.findIndex(
        (m: CourseModule) => m._id === currentModule._id
      );
      const currentContentIndex = currentModule.contents.findIndex(
        (c: CourseContent) => c._id === currentContent._id
      );

      let nextModule = currentModule;
      let nextContent = null;

      // Check if there's more content in current module
      if (currentContentIndex < currentModule.contents.length - 1) {
        nextContent = currentModule.contents[currentContentIndex + 1];
      }
      // Otherwise move to next module
      else if (currentModuleIndex < course.modules.length - 1) {
        nextModule = course.modules[currentModuleIndex + 1];
        nextContent = nextModule.contents[0];
      }

      if (nextContent) {
        setCurrentModule(nextModule);
        setCurrentContent(nextContent);
      } else {
        // Course completed
        Alert.alert("Congratulations!", "You have completed this course!");
        router.back();
      }

      // Refresh progress
      const progressData = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/courses/${id}/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const progressResponse = await progressData.json();
      setProgress(progressResponse.progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      Alert.alert("Error", "Failed to update progress");
    } finally {
      setContentLoading(false);
    }
  };

  const renderContent = () => {
    if (!currentContent) return null;

    switch (currentContent.type) {
      case "video":
        return (
          <View style={styles.videoContainer}>
            <Text style={styles.contentDescription}>Video Content</Text>
            <Text style={styles.contentTitle}>{currentContent.title}</Text>
            {currentContent.description && (
              <Text style={styles.contentDescription}>
                {currentContent.description}
              </Text>
            )}
            {/* In a real app, you would use a video player component here */}
            <View style={styles.videoPlaceholder}>
              <Text>
                Video would play here:{" "}
                {currentContent.url || currentContent.source}
              </Text>
            </View>
          </View>
        );
      case "text":
        return (
          <View style={styles.textContainer}>
            <Text style={styles.contentTitle}>{currentContent.title}</Text>
            <Text style={styles.textContent}>
              {currentContent.content ||
                currentContent.text ||
                "No content available"}
            </Text>
          </View>
        );
      case "quiz":
        return (
          <View style={styles.quizContainer}>
            <Text style={styles.quizTitle}>
              {currentContent.title || "Quiz"}
            </Text>
            <Text style={styles.contentDescription}>
              {currentContent.description || "Complete the quiz to continue"}
            </Text>
            {/* In a real app, you would render quiz questions here */}
            <View style={styles.quizPlaceholder}>
              <Text>Quiz questions would appear here</Text>
            </View>
          </View>
        );
      case "document":
        return (
          <View style={styles.documentContainer}>
            <Text style={styles.contentTitle}>{currentContent.title}</Text>
            <Text style={styles.contentDescription}>
              {currentContent.description || "Document resource"}
            </Text>
            {/* In a real app, you would use a document viewer or download link */}
            <View style={styles.documentPlaceholder}>
              <Text>Document: {currentContent.url || currentContent.file}</Text>
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.unknownContainer}>
            <Text style={styles.contentTitle}>{currentContent.title}</Text>
            <Text>Unsupported content type: {currentContent.type}</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          { backgroundColor: Colors[theme].BACKGROUND },
        ]}
      >
        <ActivityIndicator size="large" color={Colors[theme].PRIMARY} />
        <Text
          style={[styles.loadingText, { color: Colors[theme].TEXT_PRIMARY }]}
        >
          Loading course content...
        </Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          { backgroundColor: Colors[theme].BACKGROUND },
        ]}
      >
        <Text style={[styles.errorText, { color: Colors[theme].TEXT_PRIMARY }]}>
          Course not found
        </Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (!currentModule || !currentContent) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          { backgroundColor: Colors[theme].BACKGROUND },
        ]}
      >
        <Text style={[styles.errorText, { color: Colors[theme].TEXT_PRIMARY }]}>
          Content not available
        </Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].BACKGROUND }]}
    >
      <View style={styles.header}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text
          style={[styles.moduleTitle, { color: Colors[theme].TEXT_PRIMARY }]}
        >
          {currentModule.title}
        </Text>
        <ProgressBar
          progress={progress / 100}
          color={Colors[theme].PRIMARY}
          style={styles.progressBar}
        />
      </View>

      <ScrollView style={styles.contentContainer}>{renderContent()}</ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContentComplete}
          style={styles.completeButton}
          loading={contentLoading}
          disabled={contentLoading}
        >
          {contentLoading ? "Processing..." : "Mark as Complete"}
        </Button>
      </View>
    </View>
  );
}

export default CourseContentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  courseTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 12,
    backgroundColor: "#e0e0e0",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  contentDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    lineHeight: 24,
  },
  videoContainer: {
    marginBottom: 24,
  },
  videoPlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 16,
  },
  textContainer: {
    marginBottom: 24,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  quizContainer: {
    marginBottom: 24,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  quizPlaceholder: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  documentContainer: {
    marginBottom: 24,
  },
  documentPlaceholder: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  unknownContainer: {
    marginBottom: 24,
  },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  completeButton: {
    borderRadius: 8,
    paddingVertical: 8,
  },
});
