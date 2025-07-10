import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Filter, Users, BookOpen, GraduationCap, Mail, Download, CheckCircle, XCircle } from 'lucide-react';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Required env: VITE_AVATAR_URL
const AVATAR_URL = import.meta.env.VITE_AVATAR_URL || 'https://ui-avatars.com/api/';

const StudentCard = ({ student, onClick }) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onClick(student)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={student.profilePicture || `${AVATAR_URL}?name=${encodeURIComponent(student.name)}&background=random`} />
            <AvatarFallback>{student.name?.charAt(0) || 'S'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg">{student.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              <span className="truncate">{student.email}</span>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {student.tags?.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Course Completion</span>
            <span className="font-medium">{student.completionRate || 0}%</span>
          </div>
          <Progress value={student.completionRate || 0} />
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
          <div className="bg-gray-50 rounded-md p-2">
            <div className="font-semibold">{student.enrolledCourses || 0}</div>
            <div className="text-gray-500">Courses</div>
          </div>
          <div className="bg-gray-50 rounded-md p-2">
            <div className="font-semibold">{student.progress?.filter(p => p.completed)?.length || 0}</div>
            <div className="text-gray-500">Completed</div>
          </div>
          <div className="bg-gray-50 rounded-md p-2">
            <div className="font-semibold">{student.lastActive}</div>
            <div className="text-gray-500">Last Active</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StudentRow = ({ student, onClick }) => {
  return (
    <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => onClick(student)}>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={student.profilePicture || `${AVATAR_URL}?name=${encodeURIComponent(student.name)}&background=random`} />
            <AvatarFallback>{student.name?.charAt(0) || 'S'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{student.name}</div>
            <div className="text-sm text-gray-500">{student.email}</div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex gap-1 flex-wrap">
          {student.tags?.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
          ))}
          {student.tags?.length > 2 && <Badge variant="outline" className="text-xs">+{student.tags.length - 2}</Badge>}
        </div>
      </td>
      <td className="p-4">
        <div className="font-medium">{student.enrolledCourses || 0}</div>
      </td>
      <td className="p-4">
        <div className="w-full max-w-[100px] flex items-center gap-2">
          <Progress value={student.completionRate || 0} className="h-2" />
          <span className="text-sm">{student.completionRate || 0}%</span>
        </div>
      </td>
      <td className="p-4 text-right">
        <div className="text-sm text-gray-500">{student.lastActive}</div>
      </td>
    </tr>
  );
};

const Students = () => {
  const [view, setView] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { token, facilitatorCourses } = useTourLMS();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!facilitatorCourses || facilitatorCourses.length === 0) {
      setStudents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Step 1: Collect all enrollments from facilitatorCourses
      const allEnrollments = facilitatorCourses.flatMap(course => course.enrollments || []);

      // Step 2: Deduplicate students by studentId using a Map
      const studentsMap = new Map();

      allEnrollments.forEach(enrollment => {
        const studentId = enrollment.studentId;

        if (studentsMap.has(studentId)) {
          // Student already exists, update their data
          const existingStudent = studentsMap.get(studentId);

          // Update enrolledCourses count
          existingStudent.enrolledCourses = (existingStudent.enrolledCourses || 0) + 1;

          // Update completionRate (average across courses)
          existingStudent.completionRates = existingStudent.completionRates || [];
          existingStudent.completionRates.push(parseFloat(enrollment.progress) || 0);
          existingStudent.completionRate =
            existingStudent.completionRates.reduce((sum, rate) => sum + rate, 0) /
            existingStudent.completionRates.length;

          // Combine progress (completed content)
          const newProgress = enrollment.moduleProgress?.flatMap(module => {
            return module.contentProgress?.map(content => ({
              contentId: content.contentId,
              completed: content.completed,
            })) || [];
          }) || [];
          existingStudent.progress = [...(existingStudent.progress || []), ...newProgress];

          // Update lastActive (use the most recent)
          const existingLastAccessed = existingStudent.lastAccessedAt
            ? new Date(existingStudent.lastAccessedAt)
            : new Date(0);
          const newLastAccessed = enrollment.lastAccessedAt
            ? new Date(enrollment.lastAccessedAt)
            : new Date(0);
          if (newLastAccessed > existingLastAccessed) {
            existingStudent.lastAccessedAt = enrollment.lastAccessedAt;
          }

          // Update name if provided and not "Unknown"
          if (enrollment.studentName && enrollment.studentName !== "Unknown") {
            existingStudent.name = enrollment.studentName;
          }

          // Store enrollment details for the dialog
          existingStudent.enrollments = existingStudent.enrollments || [];
          existingStudent.enrollments.push({
            courseId: enrollment.courseId,
            progress: parseFloat(enrollment.progress) || 0,
            moduleProgress: enrollment.moduleProgress,
            enrolledAt: enrollment.enrolledAt,
            lastAccessedAt: enrollment.lastAccessedAt,
          });
        } else {
          // New student, initialize data
          const progress = enrollment.moduleProgress?.flatMap(module => {
            return module.contentProgress?.map(content => ({
              contentId: content.contentId,
              completed: content.completed,
            })) || [];
          }) || [];

          studentsMap.set(studentId, {
            _id: studentId,
            name: enrollment.studentName === "Unknown" ? `Student ${studentId.slice(-4)}` : enrollment.studentName,
            email: "Not provided",
            profilePicture: enrollment.studentProfilePicture,
            tags: [],
            completionRate: parseFloat(enrollment.progress) || 0,
            completionRates: [parseFloat(enrollment.progress) || 0], // For averaging
            progress: progress,
            enrolledCourses: 1,
            lastAccessedAt: enrollment.lastAccessedAt,
            enrollments: [{
              courseId: enrollment.courseId,
              progress: parseFloat(enrollment.progress) || 0,
              moduleProgress: enrollment.moduleProgress,
              enrolledAt: enrollment.enrolledAt,
              lastAccessedAt: enrollment.lastAccessedAt,
            }],
          });
        }
      });

      // Step 3: Convert Map to array and format lastActive
      const processedStudents = Array.from(studentsMap.values()).map(student => {
        // Calculate lastActive based on lastAccessedAt
        let lastActive = "Unknown";
        if (student.lastAccessedAt) {
          const lastAccessed = new Date(student.lastAccessedAt);
          const now = new Date("2025-04-26T04:23:00.000Z"); // Current time
          const diffMs = now - lastAccessed;
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHours / 24);

          if (diffHours < 1) {
            lastActive = "Recently";
          } else if (diffHours < 24) {
            lastActive = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
          } else {
            lastActive = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
          }
        }

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          profilePicture: student.profilePicture,
          tags: student.tags,
          completionRate: student.completionRate,
          progress: student.progress,
          enrolledCourses: student.enrolledCourses,
          lastActive: lastActive,
          enrollments: student.enrollments, // For dialog details
        };
      });

      setStudents(processedStudents);
    } catch (error) {
      console.error('Error processing students from facilitatorCourses:', error);
      toast({
        title: 'Error loading students',
        description: 'Failed to load student data from courses. Please try again.',
        variant: 'destructive',
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [facilitatorCourses, toast]);

  // Filter and search students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && (student.lastActive?.includes('Recently') || student.lastActive?.includes('hour'));
    if (filter === 'inactive') return matchesSearch && student.lastActive?.includes('day');
    if (filter === 'completed') return matchesSearch && (student.completionRate >= 80);
    return matchesSearch;
  });

  // Handle student click to open dialog
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  // Get course title by courseId
  const getCourseTitle = (courseId) => {
    const course = facilitatorCourses.find(course => course.key === courseId || course.courseId === courseId);
    return course?.title || courseId;
  };

  return (
    <div className="container px-4 py-6 mx-auto max-w-full mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-gray-600">Manage and monitor your students' progress</p>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
            <Mail className="h-4 w-4" />
            Message All
          </Button>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" />
              <select 
                className="w-full border-gray-300 rounded-md" 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Students</option>
                <option value="active">Active Students</option>
                <option value="inactive">Inactive Students</option>
                <option value="completed">Completed Courses</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Tabs defaultValue={view} value={view} onValueChange={setView} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger 
                    value="grid" 
                    className={view === "grid" ? "data-[state=active]:bg-red-50 data-[state=active]:text-red-600" : ""}
                  >
                    <div className="grid grid-cols-3 w-5 h-5 gap-0.5">
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="list" 
                    className={view === "list" ? "data-[state=active]:bg-red-50 data-[state=active]:text-red-600" : ""}
                  >
                    <div className="flex flex-col justify-between w-5 h-5">
                      <div className="h-1 bg-current rounded-full"></div>
                      <div className="h-1 bg-current rounded-full"></div>
                      <div className="h-1 bg-current rounded-full"></div>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading student data...</p>
          </div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="space-y-6">
          {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <StudentCard key={student._id} student={student} onClick={handleStudentClick} />
              ))}
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">Interests</th>
                      <th className="p-4">Courses</th>
                      <th className="p-4">Completion</th>
                      <th className="p-4 text-right">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <StudentRow key={student._id} student={student} onClick={handleStudentClick} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium">No students found</h3>
          <p className="text-gray-600 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Student Details Dialog */}
      {selectedStudent && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedStudent.name}'s Details</DialogTitle>
              <DialogDescription>View detailed engagement information for this student.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedStudent.profilePicture || `${AVATAR_URL}?name=${encodeURIComponent(selectedStudent.name)}&background=random`} />
                  <AvatarFallback>{selectedStudent.name?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                </div>
              </div>

              {/* Engagement Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Enrolled Courses</p>
                      <p className="font-semibold">{selectedStudent.enrolledCourses}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average Completion</p>
                      <p className="font-semibold">{selectedStudent.completionRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Active</p>
                      <p className="font-semibold">{selectedStudent.lastActive}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Content Completed</p>
                      <p className="font-semibold">{selectedStudent.progress?.filter(p => p.completed).length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Breakdown */}
              {selectedStudent.enrollments?.map((enrollment, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{getCourseTitle(enrollment.courseId)}</CardTitle>
                    <CardDescription>Enrolled on: {new Date(enrollment.enrolledAt).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Course Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Course Progress</span>
                          <span className="font-medium">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} />
                      </div>

                      {/* Module Progress */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Module Progress</h4>
                        {enrollment.moduleProgress?.map((module, modIndex) => (
                          <div key={modIndex} className="border-b py-2 last:border-b-0">
                            <div className="flex items-center gap-2">
                              <span>{module.moduleId}</span>
                              {module.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div className="ml-4 mt-2">
                              {module.contentProgress?.map((content, contentIndex) => (
                                <div key={contentIndex} className="text-sm text-gray-600 flex items-center gap-2">
                                  <span>{content.contentId}</span>
                                  {content.completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  {content.lastAccessedAt && (
                                    <span className="text-xs text-gray-400">
                                      (Last accessed: {new Date(content.lastAccessedAt).toLocaleString()})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                            {module.quizAttempt && Object.keys(module.quizAttempt).length > 0 && (
                              <div className="ml-4 mt-2">
                                <p className="text-sm font-semibold">Quiz Attempt</p>
                                <p className="text-sm text-gray-600">
                                  Score: {module.quizAttempt.score || 'N/A'} / {module.quizAttempt.total || 'N/A'}
                                </p>
                                {module.quizAttempt.timestamp && (
                                  <p className="text-sm text-gray-400">
                                    Taken on: {new Date(module.quizAttempt.timestamp).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  toast({
                    title: 'Message Sent',
                    description: `A message has been sent to ${selectedStudent.name}.`,
                  });
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Message Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Students;