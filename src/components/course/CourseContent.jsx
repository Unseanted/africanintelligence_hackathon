import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, FileText, Download, AlertCircle, HelpCircle, CheckCircle, Share2, Mail, MessageCircle, Lock } from 'lucide-react';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useToast } from '@/hooks/use-toast';
import VideoPlayer from './VideoPlayer';
import { clg } from '../../lib/basic';
import QuizTaker from './QuizTaker';
import QuizSummary from './QuizSummary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const CourseContent = ({ course }) => {
  const [completedContent, setCompletedContent] = useState({});
  const { token, API_URL } = useTourLMS();
  const { toast } = useToast();
  const [showQuiz, setShowQuiz] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [activeModule, setActiveModule] = useState(false);
  const [activeContent, setActiveContent] = useState(false);
  const [currentQuizModule, setCurrentQuizModule] = useState(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const shareUrl = window.location.href;
  const shareText = `Check out this course: ${course?.title || 'A great course'} on TourLMS!`;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "The course link has been copied to your clipboard.",
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
          toast({
            title: "Share Failed",
            description: "Could not share the course link.",
            variant: "destructive",
          });
        }
      }
    } else {
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
    if (course && course.enrollment && course.enrollment.moduleProgress) {
      const completed = {};
      course.enrollment.moduleProgress.forEach(module => {
        module.contentProgress.forEach(content => {
          if (content.completed) {
            completed[`${module.moduleId}-${content.contentId}`] = true;
          }
        });
      });
      setCompletedContent(completed);
    }
  }, [course]);

  const handleStartQuiz = (moduleIndex) => {
    clg('quiz started -- ', moduleIndex);
    setCurrentQuizModule(moduleIndex);
    setShowQuiz(true);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setCurrentQuizModule(null);
  };

  const handleSubmitQuiz = (data) => {
    clg(data);
  };

  const markContentAsCompleted = async (moduleId, contentId) => {
    try {
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to track your progress",
          variant: "destructive",
        });
        return;
      }

      const key = `${moduleId}-${contentId}`;
      if (completedContent[key]) return;

      const response = await fetch(`${API_URL}/learner/courses/${course.key}/modules/${moduleId}/contents/${contentId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark content as completed');
      }

      const data = await response.json();
      const updatedProgress = data.progress;

      setCompletedContent(prev => ({
        ...prev,
        [key]: true,
      }));

      const updatedModuleProgress = course.enrollment.moduleProgress.map(mp => {
        if (mp.moduleId === moduleId) {
          return {
            ...mp,
            contentProgress: mp.contentProgress.map(cp => {
              if (cp.contentId === contentId) {
                return { ...cp, completed: true, lastAccessedAt: new Date().toISOString() };
              }
              return cp;
            }),
          };
        }
        return mp;
      });

      course.enrollment.moduleProgress = updatedModuleProgress;
      course.enrollment.progress = updatedProgress;

      toast({
        title: "Content marked as completed",
        description: "Your progress has been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking content as completed:', error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVideoWatchProgress = (moduleId, contentId, completed) => {
    if (completed) {
      const key = `${moduleId}-${contentId}`;
      if (!completedContent[key]) {
        setCompletedContent(prev => ({
          ...prev,
          [key]: true,
        }));
        markContentAsCompleted(moduleId, contentId);
      }
    }
  };

  const handleVideoWatchvideo = (moduleIndex, contentIndex) => {
    setActiveContent(contentIndex);
    setActiveModule(moduleIndex);
    setShowVideo(true);
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
    setActiveContent(false);
    setActiveModule(false);
  };

  // Check if a module is fully completed (content + quiz if applicable)
  const isModuleFullyCompleted = (module, moduleProgress) => {
    const contentCompleted = !module.content || module.content.length === 0 || module.content.every(content => {
      const key = `${module.title}-${content.title}`;
      return completedContent[key];
    });
    const quizCompleted = !module.quiz || (moduleProgress && moduleProgress.quizAttempt && Object.keys(moduleProgress.quizAttempt).length > 0);
    return contentCompleted && quizCompleted;
  };

  // Determine if a module is accessible based on previous modules' completion
  const isModuleAccessible = (moduleIndex) => {
    if (moduleIndex === 0) return true; // First module is always accessible
    for (let i = 0; i < moduleIndex; i++) {
      const prevModule = course.modules[i];
      const prevModuleProgress = course.enrollment.moduleProgress.find(mp => mp.moduleId === prevModule.title);
      if (!isModuleFullyCompleted(prevModule, prevModuleProgress)) {
        return false; // A previous module is not completed
      }
    }
    return true;
  };

  const isModuleContentCompleted = (module) => {
    if (!module.content || module.content.length === 0) return true;
    return module.content.every(content => {
      const key = `${module.title}-${content.title}`;
      return completedContent[key];
    });
  };

  if (!course || !course.modules || !course.enrollment || course.modules.length === 0) {
    return (
      <Card className="p-4 sm:p-6 text-center backdrop-blur-lg bg-white/20 rounded-2xl shadow-lg border border-white/30 w-full max-w-full">
        <AlertCircle className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-500 mb-4" />
        <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">No Content Available</h3>
        <p className="text-gray-600 text-xs sm:text-sm">This course doesn't have any modules or content yet.</p>
      </Card>
    );
  }

  const totalContent = course.modules.reduce((sum, module) => sum + (module.content ? module.content.length : 0), 0);
  const completedContentCount = course.enrollment.moduleProgress.reduce((sum, module) => {
    return sum + (Array.isArray(module.contentProgress) ? module.contentProgress.filter(cp => cp.completed).length : 0);
  }, 0);
  const totalQuizzes = course.modules.filter(module => module.quiz).length;
  const completedQuizzes = course.enrollment.moduleProgress.filter(mp => mp.quizAttempt && Object.keys(mp.quizAttempt).length > 0).length;
  const lastActivityDate = new Date(course.enrollment.lastAccessedAt);
  const now = new Date();
  const diffDays = Math.floor((now - lastActivityDate) / (1000 * 60 * 60 * 24));
  const lastActivity = diffDays === 0 ? 'Today' : `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return (
    <div className="grid md:grid-cols-4 gap-3 p-2 sm:p-3 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen w-full max-w-full">
      {/* Progress Section */}
      <Card className="p-3 sm:p-4 md:col-span-1 order-1 backdrop-blur-lg bg-white/20 rounded-2xl shadow-lg border border-white/30 w-full max-w-full">
        <h3 className="font-semibold mb-4 text-base sm:text-lg text-gray-800">Course Progress</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-600">Progress</p>
            <div className="w-full bg-gray-300/50 rounded-full h-2 mt-1">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${course.enrollment.progress}%` }}
              ></div>
            </div>
            <p className="text-xs font-medium mt-1 text-gray-800">{course.enrollment.progress}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Content Completed</p>
            <p className="text-sm font-medium text-gray-800">{completedContentCount}/{totalContent}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Quizzes Completed</p>
            <p className="text-sm font-medium text-gray-800">{completedQuizzes}/{totalQuizzes}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Last Activity</p>
            <p className="text-sm font-medium text-gray-800">{lastActivity}</p>
          </div>
          <div>
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 text-xs text-gray-800 border-gray-400/50 bg-gray-100/20 hover:bg-gray-100/40 transition-colors rounded-lg py-2"
              onClick={handleNativeShare}
            >
              <Share2 className="w-4 h-4 text-gray-600" />
              Share Course
            </Button>
          </div>
        </div>
      </Card>

      {/* Module List */}
      <div className="md:col-span-3 order-2 space-y-3 w-full max-w-full">
        {course.modules.map((module, index) => {
          const moduleProgress = course.enrollment.moduleProgress.find(mp => mp.moduleId === module.title);
          const hasTakenQuiz = moduleProgress && moduleProgress.quizAttempt && Object.keys(moduleProgress.quizAttempt).length > 0;
          const isContentCompleted = isModuleContentCompleted(module);
          const isAccessible = isModuleAccessible(index);

          return (
            <Card key={index} className={`p-3 sm:p-4 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 w-full max-w-full ${isAccessible ? 'bg-white/20' : 'bg-gray-200/50 opacity-70'}`}>
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-amber-500">Module {index + 1}.</span>
                  <h2 className="text-base font-semibold text-gray-800 break-words">{module.title}</h2>
                  {!isAccessible && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Lock className="h-4 w-4" />
                      <span className="text-xs">Complete previous modules to unlock</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 text-xs leading-relaxed break-words">{module.description || "No description provided for this module."}</p>

                {/* Content Items */}
                {module.content && module.content.length > 0 ? (
                  <div className="space-y-3">
                    {module.content.map((content, contentIndex) => {
                      const key = `${module.title}-${content.title}`;
                      const isCompleted = completedContent[key];

                      return (
                        <div key={contentIndex} className={`flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-3 border border-white/30 rounded-lg ${isCompleted ? "bg-green-200/30" : "bg-white/10"} gap-2 transition-colors w-full max-w-full`}>
                          <div className="flex items-center gap-2 w-full">
                            {content.type === 'video' ? (
                              <PlayCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            ) : (
                              <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm break-words text-gray-800">{content.title}</h4>
                              {content.type === 'video' && (
                                <p className="text-xs text-gray-500">20 mins</p>
                              )}
                              {isCompleted && (
                                <div className="flex items-center gap-1 mt-1">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-xs text-green-600 font-medium">Completed</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto justify-end flex-wrap">
                            {content.type === 'video' ? (
                              <Button
                                className={`${isCompleted ? "bg-green-600/80" : "bg-blue-500/80"} text-white hover:bg-blue-600/90 text-xs px-3 py-1.5 rounded-lg transition-colors w-full sm:w-auto ${!isAccessible ? 'bg-gray-400/50 cursor-not-allowed hover:bg-gray-400/50' : ''}`}
                                onClick={() => {
                                  if (isAccessible) {
                                    handleVideoWatchvideo(index, contentIndex);
                                  } else {
                                    toast({
                                      title: "Module Locked",
                                      description: "Please complete all previous modules to unlock this content.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                disabled={!isAccessible}
                              >
                                Watch
                              </Button>
                            ) : (
                              <>
                                <Button 
                                  asChild 
                                  variant="outline" 
                                  size="sm" 
                                  className={`border-gray-400/50 ${isCompleted ? "bg-green-500/20 text-green-800" : "text-gray-800 bg-gray-100/20"} hover:bg-gray-100/40 text-xs px-3 py-1.5 rounded-lg transition-colors w-full sm:w-auto ${!isAccessible ? 'bg-gray-400/50 cursor-not-allowed hover:bg-gray-400/50' : ''}`}
                                  disabled={!isAccessible}
                                >
                                  <a 
                                    href={content.url} 
                                    download
                                    target='_blank'
                                    className="flex items-center gap-1"
                                    onClick={(e) => {
                                      if (!isAccessible) {
                                        e.preventDefault();
                                        toast({
                                          title: "Module Locked",
                                          description: "Please complete all previous modules to unlock this content.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    <Download className="h-4 w-4" />
                                    <span>DL</span>
                                  </a>
                                </Button>
                                {!isCompleted && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`text-green-600 border-green-500/50 bg-green-100/20 hover:bg-green-100/40 text-xs px-3 py-1.5 rounded-lg transition-colors w-full sm:w-auto ${!isAccessible ? 'bg-gray-400/50 cursor-not-allowed hover:bg-gray-400/50 text-gray-600 border-gray-400/50' : ''}`}
                                    onClick={() => {
                                      if (isAccessible) {
                                        markContentAsCompleted(module.title, content.title);
                                      } else {
                                        toast({
                                          title: "Module Locked",
                                          description: "Please complete all previous modules to unlock this content.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                    disabled={!isAccessible}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    <span>CM</span>
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500 text-xs">No content available for this lesson.</p>
                  </div>
                )}

                {/* Quiz Section */}
                {module.quiz && (
                  console.log('Rendering quiz for module:', module.title, 'Quiz data:', module.quiz),
                  hasTakenQuiz ? (
                    <QuizSummary quiz={module.quiz} quizAttempts={moduleProgress.quizAttempt} />
                  ) : (
                    <div className="p-3 border border-white/30 rounded-lg flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-white/10 gap-2 w-full max-w-full">
                      <div className="flex items-center gap-2 w-full">
                        <HelpCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-purple-600 text-sm break-words">
                            {typeof module.quiz.title === 'string' ? module.quiz.title : 'Untitled Quiz'}
                          </h4>
                          <p className="text-xs text-gray-600 break-words">
                            {isAccessible && isContentCompleted
                              ? "Test your knowledge of this module."
                              : !isAccessible
                              ? "Complete all previous modules to unlock the quiz."
                              : "Complete all module content to unlock the quiz."}
                          </p>
                        </div>
                      </div>
                      <Button 
                        className={`text-xs px-3 py-1.5 w-full sm:w-auto rounded-lg transition-colors ${
                          isAccessible && isContentCompleted 
                            ? "bg-purple-600/80 text-white hover:bg-purple-700/90" 
                            : "bg-gray-400/50 text-gray-700 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          if (isAccessible) {
                            handleStartQuiz(index);
                          } else {
                            toast({
                              title: "Module Locked",
                              description: "Please complete all previous modules to unlock this quiz.",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={!isAccessible || !isContentCompleted}
                      >
                        Start Quiz
                      </Button>
                    </div>
                  )
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quiz Modal */}
      {showQuiz && currentQuizModule !== null && course.modules[currentQuizModule]?.quiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-lg max-w-full w-full max-h-[90vh] overflow-y-auto">
            <QuizTaker 
              course={course}
              quiz={course.modules[currentQuizModule].quiz}
              onClose={handleCloseQuiz}
              onSubmit={handleSubmitQuiz}
              courseId={course.key}
              moduleId={course.modules[currentQuizModule].title}
            />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideo && activeContent !== false && activeModule !== false && course.modules[activeModule]?.content[activeContent]?.type === 'video' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-lg lg:max-w-[80rem] max-h-[90vh] overflow-y-auto">
            <VideoPlayer 
              videoUrl={course.modules[activeModule].content[activeContent].url}
              videoTitle={course.modules[activeModule].content[activeContent].title}
              videoDescription={course.modules[activeModule].content[activeContent].description || "No description available."}
              courseId={course.key}
              moduleId={course.modules[activeModule].title}
              contentId={course.modules[activeModule].content[activeContent].title}
              onWatchProgress={(completed) => handleVideoWatchProgress(
                course.modules[activeModule].title,
                course.modules[activeModule].content[activeContent].title,
                completed
              )}
              onClose={handleCloseVideo}
            />
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="backdrop-blur-lg bg-white/20 border border-white/30 rounded-2xl max-w-[90vw] w-full">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Share This Course</DialogTitle>
            <DialogDescription className="text-gray-600">
              Share this course with others using one of the options below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 text-xs text-gray-800 border-gray-400/50 bg-gray-100/20 hover:bg-gray-100/40 rounded-lg py-2 transition-colors"
              onClick={handleWhatsAppShare}
            >
              <MessageCircle className="w-4 h-4 text-gray-600" />
              Share via WhatsApp
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 text-xs text-gray-800 border-gray-400/50 bg-gray-100/20 hover:bg-gray-100/40 rounded-lg py-2 transition-colors"
              onClick={handleGmailShare}
            >
              <Mail className="w-4 h-4 text-gray-600" />
              Share via Gmail
            </Button>
            <div className="flex items-center gap-2 p-3 bg-gray-100/50 rounded-lg border border-white/30 flex-wrap">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent outline-none text-xs text-gray-800 min-w-0 break-all"
              />
              <Button 
                onClick={handleCopyToClipboard} 
                className="text-xs bg-blue-500/80 hover:bg-blue-600/90 text-white rounded-lg px-3 py-1.5 transition-colors"
              >
                Copy Link
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsShareDialogOpen(false)} 
              className="text-xs text-gray-800 border-gray-400/50 bg-gray-100/20 hover:bg-gray-100/40 rounded-lg py-2 transition-colors"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseContent;