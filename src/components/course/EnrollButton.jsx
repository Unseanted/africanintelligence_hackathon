
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useNavigate } from 'react-router-dom';
import { enrollInCourse, syncEnrollmentData } from '@/api/courseService';
import { subscribeToCourseNotifications } from '@/api/notificationService';
import { useToast } from '@/hooks/use-toast';
import EnrollmentDialog from './EnrollmentDialog';
import { clg } from '../../lib/basic';

const EnrollButton = ({ course, isEnrolled, className }) => {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { user,token, CoursesHub, setCoursesHub,packLoad } = useTourLMS();
  const navigate = useNavigate();
  const { toast } = useToast();
  clg('button course --',token);
  console.log(user)

  const handleEnroll = async () => {
    if (!token) {
      navigate('/login', { state: { from: `/courses/${course.courseId || course._id}` } });
      return;
    }

    setLoading(true);
    try {
      const result = await enrollInCourse(course.courseId || course._id, token);
      console.log('Enrollment successful:', result);
      
      // Subscribe to course notifications
      try {
        await subscribeToCourseNotifications(course.courseId || course._id, token);
      } catch (error) {
        console.warn('Failed to subscribe to notifications:', error);
      }
      
      toast({
        title: "Success!",
        description: "You have been enrolled in this course.",
        variant: "default",
      });
      
      // Refresh course data
      await packLoad(user, token);
      
      // Navigate to course detail page
      navigate(`/student/courses/${course.courseId || course._id}`);
    } catch (error) {
      console.error('Enrollment failed:', error);
      toast({
        title: "Enrollment Failed",
        description: error.response?.data?.message || "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!token) {
      navigate('/login', { state: { from: `/courses/${course.courseId || course._id}` } });
      return;
    }
    navigate(`/student/courses/${course.courseId || course._id}`);
  };

  const handleButtonClick = () => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login', { state: { from: `/courses/${course.courseId || course._id}` } });
      return;
    }

    // If already enrolled, navigate to course content
    if (isEnrolled) {
      navigate(`/student/courses/${course.courseId || course._id}`);
      return;
    }

    // Otherwise, show enrollment dialog
    setShowDialog(true);
  };

  return (
    <>
      <Button 
        className={`bg-red-600 hover:bg-red-700 text-white ${className}`} 
        onClick={handleButtonClick} 
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
            <span>Processing...</span>
          </div>
        ) : isEnrolled ? (
          'Continue Learning'
        ) : (
          'Enroll Now'
        )}
      </Button>
      
      <EnrollmentDialog 
        open={showDialog} 
        onOpenChange={setShowDialog} 
        course={course}
        onConfirm={handleEnroll}
        isLoading={loading}
      />
    </>
  );
};

export default EnrollButton;
