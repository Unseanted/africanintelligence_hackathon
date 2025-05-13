
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import CourseGrid from '@/components/course/CourseGrid'; // Importing as default import
import { useTourLMS } from '@/contexts/TourLMSContext';
import { getLearnerCourses, getStudentLearningMaterials } from '@/api/courseService';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const EnrolledCourseCard = ({ course }) => {
  const completedPercent = course.progress || 0;
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={course.thumbnail || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80"} 
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
      try {
        setLoading(true);
        const courses = await getLearnerCourses(token);
        setEnrolledCourses(courses);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        toast({
          title: "Error",
          description: "Failed to load your enrolled courses",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEnrolledCourses();
    }
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
          {CoursesHub && CoursesHub.length > 0 ? (
            <CourseGrid />
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
          ) : enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <a href={`/student/courses/${course._id}`} key={course._id}>
                  <EnrolledCourseCard course={course} />
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">You haven't enrolled in any courses yet</h3>
              <p className="text-gray-600 mt-1">Explore our courses and start learning today!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentCourses;
