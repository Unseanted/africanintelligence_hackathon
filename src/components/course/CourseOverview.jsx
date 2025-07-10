import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, Star, User, Share2, Mail, MessageCircle } from 'lucide-react'; // Added Mail and MessageCircle
import EnrollButton from './EnrollButton';
import CourseRating from './CourseRating';
import { image_01, image_02 } from '../../js/Data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // Added useToast for notifications

// Suggestion: WhatsApp share base URL could be made configurable via environment variables if needed.

const CourseOverview = ({ course, isEnrolled }) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();
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

  if (!course) {
    return null;
  }

  return (
    <div className="space-y-6 mt-16">
      <Card className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              
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
              
              <p className="text-gray-600 mt-2">{course.description}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden">
              <img 
                src={course.thumbnail || image_01}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex items-center gap-3">
              {!isEnrolled && (
                <EnrollButton course={course} isEnrolled={isEnrolled} className="w-full" />
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={handleNativeShare}
                title="Share this course"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="about">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="about">About This Course</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Course Description</h3>
                <p className="text-gray-600">{course.description}</p>
              </div>
              
              {course.prerequisites && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Prerequisites</h3>
                  <div className="text-gray-600">
                    {Array.isArray(course.prerequisites) ? (
                      <ul className="list-disc list-inside space-y-4">
                        {course.prerequisites.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{course.prerequisites}</p>
                    )}
                  </div>
                </div>
              )}
              
              {course.learningOutcomes && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">What You'll Learn</h3>
                  <div className="text-gray-600">
                    {Array.isArray(course.learningOutcomes) ? (
                      <ul className="list-disc list-inside space-y-4">
                        {course.learningOutcomes.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{course.learningOutcomes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="instructor">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <img 
                    src={course.facilitatorInfo?.profilePicture||image_01} 
                    alt={course.facilitatorName || "Instructor"}
                    className="w-full h-full object-cover"
                  />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold">
                  {course.facilitatorName || "Unknown Instructor"}
                </h3>
                <p className="text-gray-600">{course.facilitatorInfo?.title || "Course Instructor"}</p>
                
                <p className="mt-4 text-gray-600">
                  {course.facilitatorInfo?.bio || "No instructor information available."}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews">
          <Card className="p-6">
            <CourseRating courseId={course._id} />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share This Course</DialogTitle>
            <DialogDescription>
              Share this course with others using one of the options below.
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

export default CourseOverview;