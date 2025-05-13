import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  BarChart,
  Loader2,
  ChevronDown,
  ChevronUp,
  Film
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { clg } from '../../lib/basic';
import QuizSummary from '../../components/course/QuizSummary';

const StudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const { API_URL } = useTourLMS();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/admin/users/${id}`, {
          headers: { 'x-auth-token': token }
        });
        clg('student details - ', response);
        setStudent(response.data);
      } catch (error) {
        console.error('Error fetching student details:', error);
        toast({
          title: "Failed to load student details",
          description: error.response?.data?.message || "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id, toast, API_URL]);

  const toggleModule = (courseId, moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [`${courseId}-${moduleId}`]: !prev[`${courseId}-${moduleId}`]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-amber-100">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-amber-100">Student Not Found</h2>
        <p className="text-gold-500 mt-2">The student you are looking for does not exist</p>
        <Button asChild className="mt-6 bg-gold-500 text-amber-100 hover:bg-green-500">
          <Link to="/oracle/students">Back to Students</Link>
        </Button>
      </div>
    );
  }

  // Calculate analytics
  const totalModules = student.enrollments.reduce((sum, enrollment) => 
    sum + (enrollment.moduleProgress?.length || 0), 0);
  const completedModules = student.enrollments.reduce((sum, enrollment) => 
    sum + (enrollment.moduleProgress?.filter(m => m.completed).length || 0), 0);
  const totalContent = student.enrollments.reduce((sum, enrollment) => 
    sum + (enrollment.moduleProgress?.reduce((s, m) => s + (m.contentProgress?.length || 0), 0) || 0), 0);
  const completedContent = student.enrollments.reduce((sum, enrollment) => 
    sum + (enrollment.moduleProgress?.reduce((s, m) => 
      s + (m.contentProgress?.filter(c => c.completed).length || 0), 0) || 0), 0);

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-6 text-amber-100 hover:text-gold-500"
        asChild
      >
        <Link to="/oracle/students" className="flex items-center gap-2">
          <ArrowLeft size={16} className="text-green-500" />
          <span className="text-amber-100">Back to Students</span>
        </Link>
      </Button>

      {/* Student Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-amber-100 text-3xl font-bold">
          {student.name?.charAt(0).toUpperCase() || '?'}
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-amber-100">{student.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2 text-gold-500">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-500" />
              <span className="text-gold-500">{student.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="text-gold-500">Joined {new Date(student.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Student Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-green-500">
              <div className="text-sm text-gold-500">Enrolled Courses</div>
              <div className="text-2xl font-bold mt-1 text-amber-100">{student.enrolledCourses?.length || 0}</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-green-500">
              <div className="text-sm text-gold-500">Completed Modules</div>
              <div className="text-2xl font-bold mt-1 text-amber-100">{completedModules}</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-green-500">
              <div className="text-sm text-gold-500">Content Completed</div>
              <div className="text-2xl font-bold mt-1 text-amber-100">{completedContent}/{totalContent}</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-green-500">
              <div className="text-sm text-gold-500">Average Progress</div>
              <div className="text-2xl font-bold mt-1 text-amber-100">
                {student.enrollments.length 
                  ? Math.round(student.enrollments.reduce((sum, e) => sum + parseFloat(e.progress), 0) / student.enrollments.length)
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="enrollments">
        <TabsList className="bg-gray-800/50 border border-green-500">
          <TabsTrigger 
            value="enrollments" 
            className="text-gold-500 data-[state=active]:bg-green-500 data-[state=active]:text-amber-100"
          >
            Course Enrollments
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="text-gold-500 data-[state=active]:bg-green-500 data-[state=active]:text-amber-100"
          >
            Learning Progress
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="enrollments" className="mt-6">
          <Card className="border-green-500 bg-gray-900/50 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-100">
                <BookOpen className="w-5 h-5 text-green-500" />
                <span className="text-amber-100">Course Enrollments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.enrollments && student.enrollments.length > 0 ? (
                <div className="space-y-6">
                  {student.enrollments.map((enrollment) => (
                    <div key={enrollment._id} className="p-4 rounded-lg bg-gray-800/30 border border-green-500">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-amber-100">{enrollment.title}</h3>
                          <p className="text-sm text-green-500">Facilitator: {enrollment.facilitatorName}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gold-500">
                            <span className="text-gold-500">Enrolled: </span>
                            <span className="text-amber-100">{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                          </div>
                          {parseFloat(enrollment.progress) >= 100 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-amber-100">
                              <CheckCircle className="w-3 h-3 text-green-500" /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-900/50 text-amber-100">
                              <Clock className="w-3 h-3 text-gold-500" /> In Progress
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between mb-1 text-sm text-gold-500">
                          <span className="text-amber-100">Progress</span>
                          <span className="text-amber-100">{enrollment.progress}%</span>
                        </div>
                        <Progress 
                          value={parseFloat(enrollment.progress)} 
                          className="h-2 bg-gray-700" 
                          indicatorClassName={parseFloat(enrollment.progress) >= 100 ? 'bg-green-500' : 'bg-gold-500'}
                        />
                      </div>
                      <div className="mt-4 text-xs text-gold-500">
                        Last accessed: {enrollment.lastAccessedAt ? <span className="text-amber-100">{new Date(enrollment.lastAccessedAt).toLocaleString()}</span> : <span className="text-amber-100">Never</span>}
                      </div>
                      {/* Module Details */}
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-amber-100">Modules ({enrollment.moduleProgress?.length || 0})</h4>
                        <div className="mt-2 space-y-2">
                          {enrollment.moduleProgress?.map((module) => (
                            <div key={module.moduleId} className="border border-green-500 rounded-lg">
                              <div 
                                className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-700/50"
                                onClick={() => toggleModule(enrollment._id, module.moduleId)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-amber-100">{module.moduleId}</span>
                                  {module.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                                </div>
                                {expandedModules[`${enrollment._id}-${module.moduleId}`] ? (
                                  <ChevronUp className="w-4 h-4 text-gold-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gold-500" />
                                )}
                              </div>
                              {expandedModules[`${enrollment._id}-${module.moduleId}`] && (
                                <div className="p-3 bg-gray-800/50">
                                  <div className="text-sm text-gold-500">
                                    <p className='text-amber-100'>Content Completed: <span className="text-amber-100">{module.contentProgress?.filter(c => c.completed).length || 0}/{module.contentProgress?.length || 0}</span></p>
                                    {module.watchData && Object.keys(module.watchData).length > 0 && (
                                      <p>
                                        Watch Progress: <span className="text-amber-100">{Object.values(module.watchData).filter(w => w.completed).length}/
                                        {Object.keys(module.watchData).length}</span> videos completed
                                      </p>
                                    )}
                                    
                                  </div>
                                  <div className="mt-2">
                                    <h5 className="text-xs font-semibold text-amber-100">Content</h5>
                                    <ul className="mt-1 space-y-1 text-sm text-gold-500">
                                      {module.contentProgress?.map((content, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                          {content.completed ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                          ) : (
                                            <Clock className="w-4 h-4 text-gold-500" />
                                          )}
                                          <span className="text-amber-100">{content.contentId}</span>
                                          {content.lastAccessedAt && (
                                            <span className="text-xs text-amber-100">
                                              (Last accessed: {new Date(content.lastAccessedAt).toLocaleString()})
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                    
                                  </div>
                                  {/* {module.watchData && Object.keys(module.watchData).length > 0 && (
                                    <div className="mt-2">
                                      <h5 className="text-xs font-semibold text-amber-100">Video Watch Progress</h5>
                                      <ul className="mt-1 space-y-1 text-sm text-gold-500">
                                        {Object.entries(module.watchData).map(([contentId, watch]) => (
                                          <li key={contentId} className="flex items-center gap-2">
                                            <Film className="w-4 h-4 text-green-500" />
                                            <span className="text-amber-100">{contentId}</span>
                                            <span className="text-amber-100">
                                              ({watch.watchPercentage ? `${watch.watchPercentage}%` : 'Not started'})
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )} */}
                                  {module.quizAttempt && Object.keys(module.quizAttempt).length > 0 && (
                                      <div className="">
                                        <p className='text-amber-100 my-2'>Quiz Attempt</p>
                                      <QuizSummary quiz={{title:'Module Quiz'}} quizAttempts={module.quizAttempt} />
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gold-500">
                  <BookOpen className="w-12 h-12 mx-auto text-green-500 mb-3" />
                  <p className="text-amber-100">This student is not enrolled in any courses</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress" className="mt-6">
          <Card className="border-green-500 bg-gray-900/50 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-100">
                <BarChart className="w-5 h-5 text-green-500" />
                <span className="text-amber-100">Learning Progress Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-amber-100">Overall Module Completion</h3>
                  <div className="flex items-end gap-4">
                    <div className="w-full">
                      <div className="flex justify-between mb-2 text-sm text-gold-500">
                        <span className="text-amber-100">Modules Completed</span>
                        <span className="text-amber-100">{completedModules}/{totalModules}</span>
                      </div>
                      <Progress 
                        value={(completedModules / (totalModules || 1)) * 100} 
                        className="h-3 bg-gray-700" 
                        indicatorClassName="bg-green-500" 
                      />
                    </div>
                    <div className="text-xl font-bold text-green-500">
                      {totalModules ? Math.round((completedModules / totalModules) * 100) : 0}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-amber-100">Content Completion</h3>
                  <div className="flex items-end gap-4">
                    <div className="w-full">
                      <div className="flex justify-between mb-2 text-sm text-gold-500">
                        <span className="text-amber-100">Content Completed</span>
                        <span className="text-amber-100">{completedContent}/{totalContent}</span>
                      </div>
                      <Progress 
                        value={(completedContent / (totalContent || 1)) * 100} 
                        className="h-3 bg-gray-700" 
                        indicatorClassName="bg-green-500" 
                      />
                    </div>
                    <div className="text-xl font-bold text-green-500">
                      {totalContent ? Math.round((completedContent / totalContent) * 100) : 0}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-amber-100">Course Progress Details</h3>
                  {student.enrollments && student.enrollments.length > 0 ? (
                    <div className="space-y-4">
                      {student.enrollments.map((enrollment) => (
                        <div key={enrollment._id} className="p-4 rounded-lg bg-gray-800/30 border border-green-500">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-amber-100">{enrollment.title}</span>
                            <span className="text-sm text-gold-500">{enrollment.progress}%</span>
                          </div>
                          <Progress 
                            value={parseFloat(enrollment.progress)} 
                            className="h-2 bg-gray-700" 
                            indicatorClassName={parseFloat(enrollment.progress) >= 100 ? 'bg-green-500' : 'bg-gold-500'}
                          />
                          <div className="mt-2 text-sm text-gold-500">
                            Modules: <span className="text-amber-100">{enrollment.moduleProgress?.filter(m => m.completed).length || 0}/{enrollment.moduleProgress?.length || 0}</span>
                          </div>
                          <div className="mt-1 text-sm text-gold-500">
                            Content: <span className="text-amber-100">{enrollment.moduleProgress?.reduce((sum, m) => 
                              sum + (m.contentProgress?.filter(c => c.completed).length || 0), 0)}/
                            {enrollment.moduleProgress?.reduce((sum, m) => sum + (m.contentProgress?.length || 0), 0) || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gold-500">
                      <span className="text-amber-100">No course progress data available</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-amber-100">Last Activity</h3>
                  <div className="p-4 rounded-lg bg-gray-800/30 border border-green-500">
                    <p className="text-gold-500">
                      {student.enrollments.some(e => e.lastAccessedAt) 
                        ? <span className="text-amber-100">Last active on {new Date(
                            Math.max(...student.enrollments
                              .filter(e => e.lastAccessedAt)
                              .map(e => new Date(e.lastAccessedAt))
                            )
                          ).toLocaleString()}</span>
                        : <span className="text-amber-100">No recent activity recorded</span>}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetail;