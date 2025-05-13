
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  BookOpen, 
  Users, 
  Star, 
  BarChart,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { clg } from '../../lib/basic';

const FacilitatorDetail = () => {
  const { id } = useParams();
  const [facilitator, setFacilitator] = useState(null);
  const {API_URL}= useTourLMS();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFacilitatorDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/admin/users/${id}`, {
          headers: { 'x-auth-token': token }
        });
        clg('facilitator load ---  ',response)
        setFacilitator(response.data);
      } catch (error) {
        console.error('Error fetching facilitator details:', error);
        toast({
          title: "Failed to load facilitator details",
          description: error.response?.data?.message || "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFacilitatorDetails();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-gray-400">Loading facilitator details...</p>
        </div>
      </div>
    );
  }

  if (!facilitator) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-300">Facilitator Not Found</h2>
        <p className="text-gray-400 mt-2">The facilitator you are looking for does not exist</p>
        <Button asChild className="mt-6">
          <Link to="/oracle/facilitators">Back to Facilitators</Link>
        </Button>
      </div>
    );
  }

  // Calculate total students
  const totalStudents = facilitator.stats?.totalStudents || 0;
  const totalCoursesCreated = facilitator.stats?.totalCourses || 0;

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-6"
        asChild
      >
        <Link to="/oracle/facilitators" className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft size={16} />
          <span>Back to Facilitators</span>
        </Link>
      </Button>

      {/* Facilitator Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
          {facilitator.facilitator?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{facilitator.facilitator?.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2 text-gray-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{facilitator.facilitator?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(facilitator.facilitator?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Facilitator Bio */}
          {facilitator.facilitator?.bio && (
            <div className="mt-4 bg-gray-800/30 p-4 rounded-lg border border-gray-800">
              <p className="text-gray-300">{facilitator.facilitator.bio}</p>
            </div>
          )}

          {/* Facilitator Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-800">
              <div className="text-sm text-gray-400">Total Courses</div>
              <div className="text-2xl font-bold mt-1">{facilitator.stats?.totalCourses || 0}</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-800">
              <div className="text-sm text-gray-400">Total Students</div>
              <div className="text-2xl font-bold mt-1">{facilitator.stats?.totalStudents || 0}</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-800">
              <div className="text-sm text-gray-400">Enrollments</div>
              <div className="text-2xl font-bold mt-1">{facilitator.stats?.totalEnrollments || 0}</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-800">
              <div className="text-sm text-gray-400">Average Rating</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-2xl font-bold">{facilitator.stats?.averageRating || 0}</span>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courses">
        <TabsList className="bg-gray-800/50 border border-gray-800">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="mt-6">
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>Created Courses</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {facilitator.createdCourses && facilitator.createdCourses.length > 0 ? (
                <div className="space-y-6">
                  {facilitator.createdCourses.map((course, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{course.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600">
                              Created: {new Date(course.createdAt).toLocaleDateString()}
                            </Badge>
                            <Badge 
                              className={`${
                                course.status === 'published' 
                                  ? 'bg-green-900/30 text-green-400 border-green-800' 
                                  : 'bg-amber-900/30 text-amber-400 border-amber-800'
                              }`}
                            >
                              {course.status === 'published' ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400">
                              {course.enrolled} {course.enrolled === 1 ? 'student' : 'students'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400">{course.rating || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Student Progress</span>
                          <span>{course.averageProgress}%</span>
                        </div>
                        <Progress 
                          value={course.averageProgress} 
                          className="h-2" 
                          indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-500" 
                        />
                      </div>
                      <div className="mt-4 text-xs text-gray-400">
                        {course.completedCount} out of {course.enrolled} students have completed this course
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p>This facilitator hasn't created any courses yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students" className="mt-6">
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Recent Students</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {facilitator.recentStudents && facilitator.recentStudents.length > 0 ? (
                <div className="space-y-4">
                  {facilitator.recentStudents.map((student, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">{student.studentName}</h3>
                          <p className="text-sm text-gray-400">{student.studentEmail}</p>
                        </div>
                        <div>
                          <Badge className="bg-indigo-900/30 text-indigo-300 border-indigo-800">
                            {student.courseTitle}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Progress</span>
                          <span>{student.progress}%</span>
                        </div>
                        <Progress 
                          value={student.progress} 
                          className="h-1.5" 
                          indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500" 
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Enrolled on: {new Date(student.enrolledAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  
                  {totalStudents > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-400">
                        Showing 5 of {totalStudents} total students
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p>No students have enrolled in this facilitator's courses yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  <span>Course Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Course Status</h3>
                    <div className="flex gap-4">
                      <div className="flex-1 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                        <div className="text-sm text-gray-400">Published</div>
                        <div className="text-2xl font-bold mt-1">
                          {facilitator.stats?.publishedCourses || 0}
                        </div>
                      </div>
                      <div className="flex-1 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                        <div className="text-sm text-gray-400">Draft</div>
                        <div className="text-2xl font-bold mt-1">
                          {facilitator.stats?.draftCourses || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Course Completion Rate</h3>
                    {facilitator.stats?.totalEnrollments > 0 ? (
                      <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-400">Average Completion</span>
                          {/* Calculate the completion rate across all courses */}
                          <span>{facilitator.createdCourses.reduce((sum, course) => 
                            sum + (course.completedCount / (course.enrolled || 1)), 0) / 
                            (facilitator.createdCourses.length || 1) * 100}%</span>
                        </div>
                        <Progress 
                          value={facilitator.createdCourses.reduce((sum, course) => 
                            sum + (course.completedCount / (course.enrolled || 1)), 0) / 
                            (facilitator.createdCourses.length || 1) * 100} 
                          className="h-2" 
                          indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-500" 
                        />
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-800 text-gray-400">
                        No enrollment data available
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Course Rating</h3>
                    <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(facilitator.stats?.averageRating || 0)
                                  ? 'text-amber-400 fill-amber-400'
                                  : i < (facilitator.stats?.averageRating || 0)
                                  ? 'text-amber-400 fill-amber-400/50'
                                  : 'text-gray-500'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xl font-bold">{facilitator.stats?.averageRating || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Student Engagement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Student Overview</h3>
                    <div className="flex gap-4">
                      <div className="flex-1 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                        <div className="text-sm text-gray-400">Total Students</div>
                        <div className="text-2xl font-bold mt-1">
                          {facilitator.stats?.totalStudents || 0}
                        </div>
                      </div>
                      <div className="flex-1 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                        <div className="text-sm text-gray-400">Total Enrollments</div>
                        <div className="text-2xl font-bold mt-1">
                          {facilitator.stats?.totalEnrollments || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Average Student Progress</h3>
                    <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span>{facilitator.createdCourses.reduce((sum, course) => 
                            sum + (course.averageProgress || 0), 0) / 
                            (facilitator.createdCourses.length || 1)}%</span>
                      </div>
                      <Progress 
                        value={facilitator.createdCourses.reduce((sum, course) => 
                          sum + (course.averageProgress || 0), 0) / 
                          (facilitator.createdCourses.length || 1)} 
                        className="h-2" 
                        indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Forum Activity</h3>
                    <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Forum Posts</span>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-indigo-400" />
                          <span className="text-lg font-semibold">{facilitator.stats?.forumActivity || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Students per Course</h3>
                    <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Average</span>
                        <span className="text-lg font-semibold">
                          {totalCoursesCreated > 0 
                            ? (totalStudents / totalCoursesCreated).toFixed(1) 
                            : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacilitatorDetail;
