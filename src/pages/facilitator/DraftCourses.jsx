
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useTourLMS } from "@/contexts/TourLMSContext";
import { getFacilitatorDraftCourses, deleteCourse } from '@/api/courseService';

const DraftCourses = () => {
  const [draftCourses, setDraftCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useTourLMS();

  useEffect(() => {
    const fetchDraftCourses = async () => {
      try {
        setIsLoading(true);
        const courses = await getFacilitatorDraftCourses(token);
        setDraftCourses(courses);
      } catch (error) {
        console.error('Error fetching draft courses:', error);
        toast({
          title: "Error",
          description: "Failed to load draft courses. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDraftCourses();
    }
  }, [token, toast]);

  const handleEditCourse = (courseId) => {
    navigate(`/facilitator/edit-course/${courseId}`);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this draft course?')) {
      try {
        await deleteCourse(courseId, token);
        setDraftCourses(draftCourses.filter(course => course.key !== courseId));
        toast({
          title: "Course deleted",
          description: "The draft course has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting course:', error);
        toast({
          title: "Error",
          description: "Failed to delete course. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Draft Courses</h1>
      
      {draftCourses.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Draft Courses Yet</h2>
          <p className="text-gray-600 mb-4">
            You don't have any course drafts yet. Start creating a new course to save as draft.
          </p>
          <Button 
            onClick={() => navigate('/facilitator/create-course')} 
            className="bg-red-600 hover:bg-red-700"
          >
            Create New Course
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {draftCourses.map((course) => (
            <Card key={course.key} className="overflow-hidden flex flex-col">
              <div className="aspect-video bg-gray-100 relative">
                <img 
                  src={`https://source.unsplash.com/${course.thumbnail || 'photo-1516321318423-f06f85e504b3'}`} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                  Draft
                </div>
              </div>
              
              <div className="p-4 flex-grow">
                <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{course.shortDescription}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    {course.category}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    {course.level}
                  </span>
                  {course.duration && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {course.duration} weeks
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4 pt-0 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteCourse(course.key)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button 
                  onClick={() => handleEditCourse(course.key)}
                  className="bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Continue Editing
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftCourses;
