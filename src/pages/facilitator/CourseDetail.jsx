import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Book, Users, Clock, Star, PlayCircle, FileText, Edit, Trash2, Loader2, Share2, Mail, MessageCircle
} from 'lucide-react'; // Added Mail and MessageCircle for share options
import { useToast } from "@/hooks/use-toast";
import { deleteCourse } from '@/api/courseService';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { clg, ocn } from '../../lib/basic';
import { convertYouTubeLink } from '../../lib/ConvertYouTubeLink';
import QuizTaker from '@/components/course/QuizTaker';
import CourseForum from '@/components/course/CourseForum';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, facilitatorCourses, setFacilitatorCourses } = useTourLMS();
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizModule, setCurrentQuizModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Get the current URL and replace /facilitator/ with /student/
  const currentUrl = window.location.href;
  const shareUrl = currentUrl.replace('/facilitator/', '/student/');
  const shareText = `Check out this course: ${course?.title || 'A great course'} on TourLMS!`;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "The student share link has been copied to your clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy link. Please copy it manually.",
        variant: "destructive",
      });
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title || 'TourLMS Course',
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Shared Successfully",
          description: "The course link has been shared.",
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setIsShareDialogOpen(true);
        }
      }
    } else {
      // Fallback to dialog if Web Share API is not supported
      setIsShareDialogOpen(true);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleGmailShare = () => {
    const gmailUrl = `mailto:?subject=${encodeURIComponent(course?.title || 'TourLMS Course')}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(gmailUrl, '_blank');
  };

  useEffect(() => {
    if(!ocn(facilitatorCourses)) return;
    let x = facilitatorCourses.find(crs => (crs.key == id));
    if(x) setCourse(x);
    setLoading(false);
  }, [facilitatorCourses, navigate, id, token, setFacilitatorCourses]);

  const handleStartQuiz = (moduleIndex) => {
    setCurrentQuizModule(moduleIndex);
    setShowQuiz(true);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setCurrentQuizModule(null);
  };

  const handleEditCourse = () => {
    navigate(`/facilitator/edit-course/${id}`);
  };

  const handleDeleteCourse = async () => {
    try {
      setIsDeleting(true);
      await deleteCourse(id, token);
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted",
      });
      
      if (facilitatorCourses && setFacilitatorCourses) {
        const updatedCourses = facilitatorCourses.filter(c => c.key !== id);
        setFacilitatorCourses(updatedCourses);
      }
      
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
    }
  };

  const handleSubmitQuiz = async (quizData) => {
    toast({
      title: "Quiz Preview",
      description: `You scored ${quizData.score}%. This is just a preview - student responses will be saved.`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Course Header */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-200">
            <img 
              src={course.thumbnail ? course.thumbnail : `https://images.unsplash.com/photo-1564648351416-3eec9f3e85de?auto=format&fit=crop&w=800&q=80`}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{course.level}</Badge>
              <Badge variant="outline">{course.category}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.enrolled || 0} enrolled</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration || 0} weeks</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{course.rating || 0}</span>
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              {course.status === 'draft' ? (
                <Button 
                  onClick={handleEditCourse}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Continue Editing
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleEditCourse}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Course
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNativeShare}
                    title="Share this course"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="flex items-center gap-2"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the course 
                          and remove all student enrollments and forum discussions.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-700">
                          Delete Course
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Course Content */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Course Content</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Modules List */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Course Modules</h3>
              <div className="space-y-2">
                {course.modules && course.modules.map((module, index) => (
                  <Button
                    key={index}
                    variant={activeModule === index ? "default" : "outline"}
                    className="w-full flex justify-start text-left"
                    onClick={() => setActiveModule(index)}
                  >
                    <div className="w-full flex justify-between items-center">
                    <Book className="mr-2 h-4 w-4" />
                    
                                      <span className="truncate mr-2">{module.title}</span>
                                    </div>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Content Area */}
            <Card className="md:col-span-2 p-4">
              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    {course.modules[activeModule]?.title}
                  </h2>
                  <p className="text-gray-600">
                    {course.modules[activeModule]?.description}
                  </p>
                  
                  {course.modules[activeModule]?.content?.map((content, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-4">
                        {content.type === 'video' ? (
                          <PlayCircle className="w-6 h-6 text-red-500" />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-500" />
                        )}
                        <div>
                          <h4 className="font-medium">{content.title}</h4>
                          <p className="text-sm text-gray-600">
                            {content.description}
                          </p>
                          {content.type === 'video' && (
                            <div className="mt-2">
                              {content.url.includes('youtube.com') || content.url.includes('youtu.be') ? (
                                <div className="aspect-video mt-2 rounded overflow-hidden">
                                  <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src={convertYouTubeLink(content.url)} 
                                    title={content.title}
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              ) : (
                                <video 
                                  controls 
                                  className="w-full mt-2 rounded" 
                                  src={content.url}
                                ></video>
                              )}
                            </div>
                          )}
                          {content.type === 'document' && (
                            <Button size="sm" variant="outline" className="mt-2" onClick={() => window.open(content.url, '_blank')}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Document
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {course.modules[activeModule]?.quiz && (
                    <Card className="p-4 border-red-200 bg-red-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-red-800">Module Quiz</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {course.modules[activeModule].quiz.description || 'Test your knowledge of this module'}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleStartQuiz(activeModule)}
                        >
                          Preview Quiz
                        </Button>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{course.modules[activeModule].quiz.questions?.length || 0} Questions</span>
                          <span>Pass Score: {course.modules[activeModule].quiz.passScore || 70}%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">This course doesn't have any modules yet.</p>
                  <Button onClick={handleEditCourse}>Add Modules</Button>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="overview">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Course Description</h2>
                <div className="prose max-w-none">
                  <p>{course.fullDescription || course.shortDescription}</p>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Learning Outcomes</h2>
                {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
                  <ul className="space-y-2 list-disc pl-5">
                    {course.learningOutcomes.map((outcome, index) => (
                      <li key={index}>{outcome}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No learning outcomes specified.</p>
                )}
              </Card>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
                {course.prerequisites && course.prerequisites.length > 0 ? (
                  <ul className="space-y-2 list-disc pl-5">
                    {course.prerequisites.map((prerequisite, index) => (
                      <li key={index}>{prerequisite}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No prerequisites specified.</p>
                )}
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Course Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Enrolled Students</span>
                      <span>{course.enrolled || 0}</span>
                    </div>
                    <Progress value={course.enrolled > 0 ? 100 : 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Completion</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Course Rating</span>
                      <span>{course.rating || 0}/5</span>
                    </div>
                    <Progress value={(course.rating || 0) * 20} className="h-2" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Modules</h3>
                <ul className="space-y-3">
                  {course.modules && course.modules.map((module, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-sm">{module.title}</span>
                      <Badge variant="outline">
                        {module.content?.length || 0} items
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="discussion">
          <CourseForum courseId={id} isFacilitator={true} />
        </TabsContent>
      </Tabs>
      
      {/* Quiz Modal */}
      {showQuiz && currentQuizModule !== null && course.modules[currentQuizModule]?.quiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <QuizTaker
            course={course}
              quiz={course.modules[currentQuizModule].quiz}
              onClose={handleCloseQuiz}
              onSubmit={handleSubmitQuiz}
              isFacilitator={true}
              courseId={id}
              moduleId={course.modules[currentQuizModule]._id}
            />
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share This Course</DialogTitle>
            <DialogDescription>
              Share this course with students using one of the options below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleWhatsAppShare}
            >
              <MessageCircle className="w-5 h-5" />
              Share via WhatsApp
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleGmailShare}
            >
              <Mail className="w-5 h-5" />
              Share via Gmail
            </Button>
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-md">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent outline-none"
              />
              <Button onClick={handleCopyToClipboard}>Copy Link</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetail;