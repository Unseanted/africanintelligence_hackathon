// import React, { useEffect, useState } from 'react';
// import { View, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
// import { Card, ActivityIndicator, Searchbar } from 'react-native-paper';
// import { useTourLMS } from '../../contexts/TourLMSContext';
// import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND } from '../constants/colors';
// import { router } from 'expo-router';
// import { ThemedView } from '../../components/ThemedView';
// import { ThemedText } from '../../components/ThemedText';
// import type { Course } from '../../contexts/TourLMSContext';
// import CourseContent from '../../components/CourseContent';


// export default function CoursesScreen() {
//   const { CoursesHub, loading: contextLoading, getCoursesHub, enrolledCourses, enrollInCourse } = useTourLMS();
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
 

//   useEffect(() => {
//     if (CoursesHub.length > 0) {
//       setFilteredCourses(CoursesHub);
//     }
//   }, [CoursesHub]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     try {
//       await getCoursesHub();
//     } catch (error) {
//       console.error('Error refreshing courses:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     if (query.trim() === '') {
//       setFilteredCourses(CoursesHub);
//     } else {
//       const filtered = CoursesHub.filter(course => 
//         course.title.toLowerCase().includes(query.toLowerCase()) ||
//         course.description.toLowerCase().includes(query.toLowerCase()) ||
//         (course.category?.toLowerCase() || '').includes(query.toLowerCase())
//       );
//       setFilteredCourses(filtered);
//     }
//   };

//   const handleCoursePress = (courseId: string) => {
//     router.push(`/course/${courseId}`);
//   };

//   if (contextLoading) {
//     return (
//       <ThemedView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={PRIMARY} />
//       </ThemedView>
//     );
//   }

//   return (
//     <ThemedView style={styles.container}>
//       <View style={styles.header}>
//         <ThemedText type="primary" style={styles.title}>Courses</ThemedText>
//         <Searchbar
//           placeholder="Search courses..."
//           onChangeText={handleSearch}
//           value={searchQuery}
//           style={styles.searchBar}
//           iconColor={PRIMARY}
//           inputStyle={{ color: TEXT_PRIMARY }}
//           placeholderTextColor={TEXT_SECONDARY}
//         />
//       </View>

//       <ScrollView
//         style={styles.scrollView}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[PRIMARY]}
//             tintColor={PRIMARY}
//           />
//         }
//       >
//         <View style={styles.coursesGrid}>
//           {Array.isArray(filteredCourses) && filteredCourses.length === 0 ? (
//             <ThemedText type="secondary" style={styles.noCourses}>
//               No courses found
//             </ThemedText>
//           ) : (
//             (filteredCourses || []).map((course) => {
//               const isEnrolled = enrolledCourses?.some(c => c._id === course._id);
//               return (
//                 <Card
//                   key={course._id}
//                   style={styles.courseCard}
//                   onPress={() => handleCoursePress(course._id)}
//                 >
//                   <View style={styles.imageContainer}>
//                     {course.thumbnail ? (
//                       <Image
//                         source={{ uri: course.thumbnail }}
//                         style={styles.courseImage}
//                         resizeMode="cover"
//                       />
//                     ) : (
//                       <View style={[styles.courseImage, styles.placeholderImage]}>
//                         <ThemedText type="secondary" style={styles.placeholderText}>
//                           {course.title.charAt(0)}
//                         </ThemedText>
//                       </View>
//                     )}
//                   </View>
//                   <Card.Content style={styles.cardContent}>
//                     <ThemedText type="primary" style={styles.courseTitle}>
//                       {course.title}
//                     </ThemedText>
//                     <ThemedText type="secondary" style={styles.courseDescription}>
//                       {course.description}
//                     </ThemedText>
//                     <View style={styles.courseMeta}>
//                       <ThemedText type="secondary" style={styles.metaText}>
//                         {course.category || 'Uncategorized'}
//                       </ThemedText>
//                       <ThemedText type="secondary" style={styles.metaText}>
//                         {course.totalStudents || 0} students
//                       </ThemedText>
//                     </View>
//                     <CourseContent
//                       course={{
//                         modules: course.modules || [],
//                         totalProgress: course.progress ?? 0
//                       }}
//                       isEnrolled={isEnrolled}
//                       onLessonPress={handleCoursePress}
//                       onEnroll={async () => { await enrollInCourse(course._id); }}
//                       onContinue={() => handleCoursePress(course._id)}
//                     />
//                   </Card.Content>
//                 </Card>
//               );
//             })
//           )}
//         </View>
//       </ScrollView>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     padding: 16,
//     backgroundColor: CARD_BACKGROUND,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   searchBar: {
//     backgroundColor: BACKGROUND,
//     elevation: 0,
//     borderWidth: 1,
//     borderColor: PRIMARY,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   coursesGrid: {
//     padding: 16,
//     gap: 16,
//   },
//   courseCard: {
//     backgroundColor: CARD_BACKGROUND,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   imageContainer: {
//     height: 200,
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
//   courseImage: {
//     flex: 1,
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
//   placeholderImage: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   placeholderText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   cardContent: {
//     padding: 16,
//   },
//   courseTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   courseDescription: {
//     fontSize: 14,
//     marginBottom: 12,
//   },
//   courseMeta: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   metaText: {
//     fontSize: 12,
//   },
//   noCourses: {
//     textAlign: 'center',
//     marginTop: 32,
//     fontSize: 16,
//   },
// }); 



import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, Alert } from 'react-native';
import { Card, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { PRIMARY, BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND } from '../constants/colors';
import { router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import type { Course } from '../../contexts/TourLMSContext';
import CourseContent from '../../components/CourseContent';

export default function CoursesScreen() {
  const { 
    CoursesHub, 
    loading: contextLoading, 
    getCoursesHub, 
    enrolledCourses, 
    enrollInCourse,
    getCourseProgress,
    trackModuleCompletion,
    completeQuiz
  } = useTourLMS();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, boolean>>({});

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
      console.error('Error refreshing courses:', error);
      Alert.alert('Error', 'Failed to refresh courses. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredCourses(CoursesHub);
    } else {
      const filtered = CoursesHub.filter(course => 
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        (course.category?.toLowerCase() || '').includes(query.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const handleCoursePress = async (courseId: string) => {
    try {
      // Check if enrolled and get progress
      const isEnrolled = enrolledCourses?.some(c => c._id === courseId);
      if (isEnrolled) {
        setLoadingProgress(prev => ({ ...prev, [courseId]: true }));
        await getCourseProgress(courseId);
      }
      router.push(`/course/${courseId}`);
    } catch (error) {
      console.error('Error navigating to course:', error);
      Alert.alert('Error', 'Failed to load course details. Please try again.');
    } finally {
      setLoadingProgress(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollInCourse(courseId);
      Alert.alert('Success', 'You have successfully enrolled in this course');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      Alert.alert('Error', 'Failed to enroll in course. Please try again.');
    }
  };

  const handleModuleComplete = async (courseId: string, moduleId: string) => {
    try {
      await trackModuleCompletion(courseId, moduleId);
      // Refresh course progress
      await getCourseProgress(courseId);
    } catch (error) {
      console.error('Error completing module:', error);
      Alert.alert('Error', 'Failed to mark module as complete. Please try again.');
    }
  };

  const handleQuizComplete = async (courseId: string, moduleId: string, score: number) => {
    try {
      await completeQuiz(courseId, moduleId, score);
      // Refresh course progress
      await getCourseProgress(courseId);
    } catch (error) {
      console.error('Error completing quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz results. Please try again.');
    }
  };

  if (contextLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="primary" style={styles.title}>Courses</ThemedText>
        <Searchbar
          placeholder="Search courses..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={PRIMARY}
          inputStyle={{ color: TEXT_PRIMARY }}
          placeholderTextColor={TEXT_SECONDARY}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
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
              const isEnrolled = enrolledCourses?.some(c => c._id === course._id);
              const isLoading = loadingProgress[course._id] || false;
              
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
                      <View style={[styles.courseImage, styles.placeholderImage]}>
                        <ThemedText type="secondary" style={styles.placeholderText}>
                          {course.title.charAt(0)}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <Card.Content style={styles.cardContent}>
                    <ThemedText type="primary" style={styles.courseTitle}>
                      {course.title}
                    </ThemedText>
                    <ThemedText type="secondary" style={styles.courseDescription}>
                      {course.shortDescription || course.description || 'No description available'}
                    </ThemedText>
                    <View style={styles.courseMeta}>
                      <ThemedText type="secondary" style={styles.metaText}>
                        {course.category || 'Uncategorized'}
                      </ThemedText>
                      <ThemedText type="secondary" style={styles.metaText}>
                        {course.totalStudents || 0} students
                      </ThemedText>
                    </View>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={PRIMARY} style={styles.loadingIndicator} />
                    ) : (
                      <CourseContent
                        course={{
                          _id: course._id,
                          modules: course.modules || [],
                          totalProgress: course.progress ?? 0,
                          nextModule: course.nextModule
                        }}
                        isEnrolled={isEnrolled}
                        onLessonPress={(moduleId, lessonId) => router.push(`/course/${course._id}/module/${moduleId}/lesson/${lessonId}`)}
                        onEnroll={() => handleEnroll(course._id)}
                        onContinue={() => handleCoursePress(course._id)}
                        onModuleComplete={(moduleId) => handleModuleComplete(course._id, moduleId)}
                        onQuizComplete={(moduleId, score) => handleQuizComplete(course._id, moduleId, score)}
                      />
                    )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: CARD_BACKGROUND,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: BACKGROUND,
    elevation: 0,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  coursesGrid: {
    padding: 16,
    gap: 16,
  },
  courseCard: {
    backgroundColor: CARD_BACKGROUND,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: TEXT_SECONDARY,
  },
  cardContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
  },
  noCourses: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  loadingIndicator: {
    marginVertical: 16,
  },
});