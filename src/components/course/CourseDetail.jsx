
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Book, 
  Users, 
  Clock, 
  Star, 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  MessageCircle, 
  LockIcon,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ForumTopicDetail from '../forum/ForumTopicDetail';
import CourseDiscussion from '../forum/CourseDiscussion';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { checkEnrollmentStatus, getCourseById, deleteCourse } from '@/api/courseService';
import EnrollButton from './EnrollButton';
import { useToast } from '@/hooks/use-toast';
import CourseForum from './CourseForum';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CourseDetail = () => {
  const { id } = useParams();
  const { CoursesHub, user, token } = useTourLMS();
  const [activeModule, setActiveModule] = useState(0);
  const [activeContent, setActiveContent] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Find course from context instead of sample data
  const course = CoursesHub?.find(c => c._id === id) || courseDetails || null;
  const isFacilitator = user?.role === 'facilitator';
  const isCourseFacilitator = isFacilitator && course?.facilitator === user?._id;

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id || !token) {
        setLoading(false);
        return;
      }
      
      try {
        const fetchedCourse = await getCourseById(id, token);
        setCourseDetails(fetchedCourse);
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };
    
    fetchCourseDetails();
  }, [id, token]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!course || !token) {
        setLoading(false);
        return;
      }
      
      try {
        const enrolled = course.enrolledStudents.find(id=>id==user.id);
        setIsEnrolled(enrolled?true:false);
      } catch (error) {
        console.error('Error checking enrollment:', error);
        setIsEnrolled(false);
      } finally {
        setLoading(false);
      }
    };

    checkEnrollment();
  }, [course, token]);

  const handleDeleteCourse = async () => {
    try {
      setIsDeleting(true);
      await deleteCourse(id, token);
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted",
      });
      navigate('/facilitator/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!course) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold">Course not found</h2>
        <p className="mt-2 text-gray-600">The course you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Course Header */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="aspect-video rounded-xl overflow-hidden">
            <img 
              src={course.thumbnail ? `${course.thumbnail}` : "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <Card className="p-4 md:p-6">
          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-bold line-clamp-2">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{course.level || "Beginner"}</Badge>
              <Badge variant="outline">{course.category || "General"}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.enrolled || 0} enrolled</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration || "Self-paced"}</span>
              </div>
              {course.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{course.rating}</span>
                </div>
              )}
            </div>
            {isEnrolled && (
              <div className="pt-4">
                <Progress value={course.progress || 0} className="mb-2" />
                <p className="text-sm text-gray-600">{course.progress || 0}% Complete</p>
              </div>
            )}
            <div className="pt-2 flex flex-wrap gap-2">
              {!isCourseFacilitator && (
                <EnrollButton course={course} isEnrolled={isEnrolled} className="flex-1" />
              )}
              {isCourseFacilitator && (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/facilitator/courses/${id}/edit`)}
                  >
                    Edit Course
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Course Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Course Content</TabsTrigger>
          {isEnrolled && <TabsTrigger value="discussion">Discussion</TabsTrigger>}
          {isCourseFacilitator && <TabsTrigger value="forum">Forum</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-4 md:p-6">
            <h3 className="text-xl font-semibold mb-4">Course Description</h3>
            <p className="text-gray-600">{course.description}</p>
            
            {course.prerequisites && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Prerequisites</h4>
                <p className="text-gray-600">{course.prerequisites}</p>
              </div>
            )}

            {course.whatYouWillLearn && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">What You'll Learn</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {course.whatYouWillLearn.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {course.facilitatorInfo && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">About the Instructor</h4>
                <div className="flex items-start gap-4">
                  <img 
                    src={course.facilitatorInfo.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.facilitatorInfo.name)}&background=random`} 
                    alt={course.facilitatorInfo.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{course.facilitatorInfo.name}</p>
                    <p className="text-sm text-gray-600">{course.facilitatorInfo.title}</p>
                    <p className="text-sm mt-1">{course.facilitatorInfo.bio}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Modules List */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Course Modules</h3>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {course.modules?.map((module, index) => (
                  <Button
                    key={index}
                    variant={activeModule === index ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveModule(index)}
                    disabled={!isEnrolled && module.locked}
                  >
                    {!isEnrolled && module.locked && <LockIcon className="mr-2 h-4 w-4 flex-shrink-0" />}
                    <Book className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{module.title}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Content Area */}
            <Card className="md:col-span-2 p-4">
              {!isEnrolled && !isCourseFacilitator ? (
                <div className="text-center py-8">
                  <LockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Content Locked</h3>
                  <p className="text-gray-600 mb-4">Enroll in this course to access all content</p>
                  <EnrollButton course={course} isEnrolled={isEnrolled} />
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold line-clamp-2">
                    {course.modules?.[activeModule]?.title || "Module Overview"}
                  </h2>
                  <p className="text-gray-600">
                    {course.modules?.[activeModule]?.description || "No description available"}
                  </p>
                  
                  {course.modules?.[activeModule]?.content?.map((content, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-4">
                        {content.type === 'video' ? (
                          <PlayCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        )}
                        <div className="overflow-hidden">
                          <h4 className="font-medium truncate">{content.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {content.description || "No description"}
                          </p>
                          {content.type === 'video' && (
                            <div className="mt-3">
                              <video 
                                controls 
                                className="w-full rounded" 
                                src={content.url}
                              >
                                Your browser does not support the video element.
                              </video>
                            </div>
                          )}
                          {content.type === 'document' && (
                            <Button 
                              className="mt-3"
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(content.url, '_blank')}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Open Document
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {course.modules?.[activeModule]?.quiz && (
                    <Card className="p-4 bg-red-50 border border-red-200">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">{course.modules?.[activeModule]?.quiz.title || "Module Quiz"}</h4>
                          <p className="text-sm text-gray-600">
                            {course.modules?.[activeModule]?.quiz.description || "Test your knowledge of this module"}
                          </p>
                          <Button className="mt-3" size="sm">
                            Start Quiz
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {isEnrolled && (
          <TabsContent value="discussion">
            <CourseDiscussion courseId={id} />
          </TabsContent>
        )}

        {isCourseFacilitator && (
          <TabsContent value="forum">
            <CourseForum courseId={id} />
          </TabsContent>
        )}
      </Tabs>

      {/* Delete Course Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course and remove all student 
              enrollments and related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Course
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseDetail;
