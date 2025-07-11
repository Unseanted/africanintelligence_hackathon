import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import CourseGrid from '@/components/course/CourseGrid';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { getLearnerCourses } from '@/api/courseService';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Required env: VITE_UNSPLASH_URL
const UNSPLASH_URL = import.meta.env.VITE_UNSPLASH_URL || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80';

const EnrolledCourseCard = ({ course }) => {
  const completedPercent = course.progress || 0;
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={course.thumbnail || UNSPLASH_URL} 
          alt={course.title}
          className="h-40 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
          <Badge className="self-start mb-2">{course.category}</Badge>
          <h3 className="text-lg font-bold text-white">{course.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{completedPercent}% Complete</span>
          <Badge variant={completedPercent === 100 ? "success" : "outline"}>
            {completedPercent === 100 ? "Completed" : "In Progress"}
          </Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-600 h-2 rounded-full" 
            style={{ width: `${completedPercent}%` }}
          ></div>
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}</span>
          <span>Last activity: {new Date(course.lastAccessedAt || course.enrolledAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
};

const StudentCourses = () => {
  const [activeTab, setActiveTab] = useState("explore");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { CoursesHub, user, token } = useTourLMS();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      console.log('🔍 [StudentCourses] fetchEnrolledCourses called');
      console.log('🔍 [StudentCourses] token exists:', !!token);
      console.log('🔍 [StudentCourses] user:', user);
      
      if (!token) {
        console.log('❌ [StudentCourses] No token, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 [StudentCourses] Calling getLearnerCourses...');
        const courses = await getLearnerCourses(token);
        console.log('🔍 [StudentCourses] getLearnerCourses response:', courses);
        console.log('🔍 [StudentCourses] Response type:', typeof courses);
        console.log('🔍 [StudentCourses] Response length:', courses?.length);
        
        if (courses && courses.length > 0) {
          console.log('🔍 [StudentCourses] First course sample:', {
            courseId: courses[0].courseId,
            _id: courses[0]._id,
            title: courses[0].title,
            keys: Object.keys(courses[0])
          });
        }
        
        setEnrolledCourses(courses || []);
      } catch (error) {
        console.error("❌ [StudentCourses] Error fetching enrolled courses:", error);
        console.error("❌ [StudentCourses] Error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        toast({
          title: "Error",
          description: "Failed to load your enrolled courses",
          variant: "destructive",
        });
        setEnrolledCourses([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [token, toast]);

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Courses</h1>

      <Tabs defaultValue="explore" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="explore">Explore Courses</TabsTrigger>
          <TabsTrigger value="learning">My Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-4">
          {console.log('🔍 [StudentCourses] Explore tab - CoursesHub:', {
            exists: !!CoursesHub,
            length: CoursesHub?.length,
            sample: CoursesHub?.slice(0, 2)?.map(c => ({ courseId: c.courseId, _id: c._id, title: c.title }))
          })}
          {CoursesHub && CoursesHub.length > 0 ? (
            <CourseGrid 
              title="Available Courses"
              emptyMessage="No courses available at the moment"
              path="student/courses"
            />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No courses available at the moment</h3>
              <p className="text-gray-600 mt-1">Please check back later for new course offerings</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : enrolledCourses && enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => { 
                if (course) {
                  // Always use courseId for navigation, fallback to _id if missing
                  const courseIdentifier = course.courseId || course._id;
                  // Skip rendering if no valid identifier
                  if (!courseIdentifier) {
                    console.log('❌ [StudentCourses] Skipping course with no valid identifier:', course);
                    return null;
                  }
                  const link = `/student/courses/${courseIdentifier}`;
                  console.log(`🔍 [StudentCourses] Generated link: ${link} for course: ${course.title}`);
                  return (
                    <a href={link} key={courseIdentifier}>
                      <EnrolledCourseCard course={course} />
                    </a>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">You haven't enrolled in any courses yet</h3>
              <p className="text-gray-600 mt-1">Explore our courses and start learning today!</p>
              <button 
                onClick={() => setActiveTab("explore")}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Browse Courses
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentCourses;
