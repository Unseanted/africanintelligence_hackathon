import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { checkEnrollmentStatus } from '@/api/courseService';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CourseOverview from '@/components/course/CourseOverview';
import CourseContent from '@/components/course/CourseContent';
import CourseForum from '@/components/course/CourseForum';
import { clg, ocn } from '../../lib/basic';
import { image_01, image_02 } from '../../js/Data';

const CourseDetail = () => {
  const params = useParams();
  console.log('useParams() object:', params);
  console.log('window.location.pathname:', window.location.pathname);
  const { id } = params;
  const { user, token, CoursesHub,enrolledCourses } = useTourLMS();
  const { toast } = useToast();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');


  useEffect(() => {
    clg('🔍 [CourseDetail] useEffect triggered');
    clg('🔍 [CourseDetail] id from useParams:', id);
    clg('🔍 [CourseDetail] params object:', params);
    clg('🔍 [CourseDetail] window.location.pathname:', window.location.pathname);
    clg('🔍 [CourseDetail] CoursesHub loaded:', Array.isArray(CoursesHub), 'length:', CoursesHub?.length);
    clg('🔍 [CourseDetail] user:', user);
    clg('🔍 [CourseDetail] token exists:', !!token);
    clg('🔍 [CourseDetail] enrolledCourses length:', enrolledCourses?.length);
    
    if (CoursesHub && CoursesHub.length > 0) {
      clg('🔍 [CourseDetail] All CoursesHub courseIds:', CoursesHub.map(c => c.courseId));
      clg('🔍 [CourseDetail] All CoursesHub _ids:', CoursesHub.map(c => c._id));
      clg('🔍 [CourseDetail] First 3 CoursesHub items:', CoursesHub.slice(0, 3).map(c => ({ 
        courseId: c.courseId, 
        _id: c._id,
        title: c.title,
        keys: Object.keys(c)
      })));
      
      // Test exact matching for the current ID
      clg('🔍 [CourseDetail] Testing exact matches for ID:', id);
      clg('🔍 [CourseDetail] Exact courseId match:', CoursesHub.find(c => c.courseId === id));
      clg('🔍 [CourseDetail] Exact _id match:', CoursesHub.find(c => c._id === id));
      clg('🔍 [CourseDetail] String comparison courseId match:', CoursesHub.find(c => String(c.courseId) === String(id)));
      clg('🔍 [CourseDetail] String comparison _id match:', CoursesHub.find(c => String(c._id) === String(id)));
    }
    
    const fetchCourseAndEnrollmentStatus = async () => {
      try {
        setLoading(true);
        
        // Always use courseId for lookups, fallback to _id if missing
        const foundCourse = CoursesHub?.find(c => 
          (c.courseId && (c.courseId === id || c.courseId === params.id)) ||
          (c._id && (c._id === id || c._id === params.id))
        );
        clg('🔍 [CourseDetail] Searching for courseId:', id);
        clg('🔍 [CourseDetail] Found course by courseId/_id:', foundCourse);
        
        if (!foundCourse) {
          clg('❌ [CourseDetail] Course not found in CoursesHub');
          clg('❌ [CourseDetail] Available courseIds:', CoursesHub?.map(c => c.courseId));
          clg('❌ [CourseDetail] Available _ids:', CoursesHub?.map(c => c._id));
          clg('❌ [CourseDetail] Searching for ID:', id);
          clg('❌ [CourseDetail] ID type:', typeof id);
          toast({
            title: 'Error',
            description: 'Course not found',
            variant: 'destructive',
          });
          return;
        }
        
        // Check enrollment status from enrolledCourses
        let enrollmentStatus = false;
        if (token && Array.isArray(enrolledCourses) && user) {
          enrollmentStatus = enrolledCourses.some(c =>
            (c.courseId && (c.courseId === id || c.courseId === params.id)) ||
            (c._id && (c._id === id || c._id === params.id))
          );
        }
        setIsEnrolled(enrollmentStatus);
        
        // If enrolled, prefer enrolledCourses for up-to-date progress
        if (enrollmentStatus && Array.isArray(enrolledCourses)) {
          const mycourse = enrolledCourses.find(c => 
            (c.courseId && (c.courseId === id || c.courseId === params.id)) ||
            (c._id && (c._id === id || c._id === params.id))
          );
          clg('🔍 [CourseDetail] Found in enrolledCourses:', mycourse);
          setCourse(mycourse || foundCourse);
        } else {
          setCourse(foundCourse);
        }
        // If user is enrolled, default to content tab
        if (enrollmentStatus) {
          setActiveTab('content');
        }
      } catch (error) {
        console.error('❌ [CourseDetail] Error fetching course details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load course details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id && CoursesHub && CoursesHub.length > 0) {
      fetchCourseAndEnrollmentStatus();
    } else {
      clg('🔍 [CourseDetail] Missing dependencies:', { id, hasCoursesHub: !!CoursesHub, coursesHubLength: CoursesHub?.length });
    }
  }, [id, token, CoursesHub, enrolledCourses]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600">Course Not Found</h2>
        <p className="text-slate-600 mt-2">The course you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  // If not enrolled, only show the overview
  if (!isEnrolled) {
    return <CourseOverview course={course} isEnrolled={isEnrolled} />;
  }

  // For enrolled students, show full course tabs
  return (
    <div className="container mx-auto p-6 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h1>
        <p className="text-slate-600 dark:text-slate-300">{course.description}</p>
        <img 
          src={course.thumbnail|| image_02} 
          alt={`${course.title} thumbnail`} 
          className="w-full h-48 object-cover rounded-lg mt-4 lg:h-96"
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="forum" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Forum</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="content">
          <CourseContent course={course} />
        </TabsContent>
        
        <TabsContent value="overview">
          <CourseOverview course={course} isEnrolled={isEnrolled} />
        </TabsContent>
        
        <TabsContent value="forum">
          <CourseForum courseId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseDetail;