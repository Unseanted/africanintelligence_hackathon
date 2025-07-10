import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY } from '../constants/colors';

export default function CourseContentScreen() {
  const { id } = useLocalSearchParams();
  const { lastModuleId, lastContentId } = useLocalSearchParams();
  const { user, token, apiCall } = useTourLMS();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentContent, setCurrentContent] = useState(null);
  const [progress, setProgress] = useState(0);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    const fetchCourseContent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await apiCall(`/courses/${id}`);
        setCourse(data.course);
        setProgress(data.progress || 0);

        // Find initial module and content to display
        let moduleToDisplay = data.course.modules?.[0];
        let contentToDisplay = moduleToDisplay?.contents?.[0];

        // If we have last accessed info, use that
        if (lastModuleId) {
          const lastModule = data.course.modules.find(m => m._id === lastModuleId);
          if (lastModule) {
            moduleToDisplay = lastModule;
            if (lastContentId) {
              const lastContent = moduleToDisplay.contents.find(c => c._id === lastContentId);
              if (lastContent) contentToDisplay = lastContent;
            }
          }
        }

        setCurrentModule(moduleToDisplay);
        setCurrentContent(contentToDisplay);
      } catch (error) {
        console.error('Error fetching course content:', error);
        Alert.alert('Error', 'Failed to load course content');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [id, lastModuleId, lastContentId]);

  const handleContentComplete = async () => {
    if (!course || !currentModule || !currentContent) return;
    
    try {
      setContentLoading(true);
      
      // Update progress on server
      await apiCall(`/courses/${id}/progress`, {
        method: 'PUT',
        body: JSON.stringify({
          moduleId: currentModule._id,
          contentId: currentContent._id,
          completed: true
        })
      });

      // Find next content item
      const currentModuleIndex = course.modules.findIndex(m => m._id === currentModule._id);
      const currentContentIndex = currentModule.contents.findIndex(c => c._id === currentContent._id);

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
        Alert.alert('Congratulations!', 'You have completed this course!');
        router.back();
      }

      // Refresh progress
      const progressData = await apiCall(`/courses/${id}/progress`);
      setProgress(progressData.progress);
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to update progress');
    } finally {
      setContentLoading(false);
    }
  };

  const renderContent = () => {
    if (!currentContent) return null;

    switch (currentContent.type) {
      case 'video':
        return (
          <View style={styles.videoContainer}>
            <Text style={styles.contentDescription}>Video Content</Text>
            <Text style={styles.contentTitle}>{currentContent.title}</Text>
            {currentContent.description && (
              <Text style={styles.contentDescription}>{currentContent.description}</Text>
            )}
            {/* In a real app, you would use a video player component here */}
            <View style={styles.videoPlaceholder}>
              <Text>Video would play here: {currentContent.url || currentContent.source}</Text>
            </View>
          </View>
        );

      case 'text':
        return (
          <View style={styles.textContainer}>
            <Text style={styles.contentTitle}>{currentContent.title}</Text>
            <Text style={styles.textContent}>
              {currentContent.content || currentContent.text || 'No content available'}
            </Text>
          </View>
        );

      case 'quiz':
        return (
          <View style={styles.quizContainer}>
            <Text style={styles.quizTitle}>{currentContent.title || 'Quiz'}</Text>
            <Text style={styles.contentDescription}>
              {currentContent.description || 'Complete the quiz to continue'}
            </Text>
            {/* In a real app, you would render quiz questions here */}
            <View style={styles.quizPlaceholder}>
              <Text>Quiz questions would appear here</Text>
            </View>
          </View>
        );

      case 'document':
        return (
          <View style={styles.documentContainer}>
            <Text style={styles.contentTitle}>{currentContent.title}</Text>
            <Text style={styles.contentDescription}>
              {currentContent.description || 'Document resource'}
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
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Loading course content...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Course not found</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (!currentModule || !currentContent) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Content not available</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.moduleTitle}>{currentModule.title}</Text>
        <ProgressBar
          progress={progress / 100}
          color={PRIMARY}
          style={styles.progressBar}
        />
      </View>

      <ScrollView style={styles.contentContainer}>
        {renderContent()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContentComplete}
          style={styles.completeButton}
          loading={contentLoading}
          disabled={contentLoading}
        >
          {contentLoading ? 'Processing...' : 'Mark as Complete'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: TEXT_PRIMARY,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    color: TEXT_PRIMARY,
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  courseTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 12,
    backgroundColor: '#e0e0e0',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: TEXT_PRIMARY,
  },
  contentDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  videoContainer: {
    marginBottom: 24,
  },
  videoPlaceholder: {
    aspectRatio: 16/9,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
  },
  textContainer: {
    marginBottom: 24,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
    color: TEXT_PRIMARY,
  },
  quizContainer: {
    marginBottom: 24,
  },
  quizPlaceholder: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  documentContainer: {
    marginBottom: 24,
  },
  documentPlaceholder: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  unknownContainer: {
    marginBottom: 24,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  completeButton: {
    borderRadius: 8,
    paddingVertical: 8,
  },
});