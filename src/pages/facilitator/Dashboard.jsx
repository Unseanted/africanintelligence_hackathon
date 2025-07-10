import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Users, 
  Clock, 
  TrendingUp, 
  Award, 
  Zap 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, LineChart } from '@/components/ui/chart';
import { motion } from "framer-motion";
import { useTourLMS } from '../../contexts/TourLMSContext';

// Required env: VITE_UNSPLASH_URL, VITE_AVATAR_URL
const UNSPLASH_URL = import.meta.env.VITE_UNSPLASH_URL || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80';
const AVATAR_URL = import.meta.env.VITE_AVATAR_URL || 'https://ui-avatars.com/api/';

// Glassy styles with golden accents
const dashboardStyles = `
  .dashboard-container {
    min-height: 100vh;
    padding: 1.5rem;
    box-sizing: border-box;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }

  .dashboard-container[data-theme="dark"] {
    background: linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(42, 42, 42, 0.8));
    color: #ffffff;
  }

  .dashboard-container[data-theme="light"] {
    background: linear-gradient(135deg, rgba(240, 240, 240, 0.9), rgba(255, 255, 255, 0.8));
    color: #1a1a1a;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(234, 179, 8, 0.5); /* Golden border accent */
    backdrop-filter: blur(15px);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .glass-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px rgba(234, 179, 8, 0.3); /* Golden shadow on hover */
  }

  .glass-card[data-theme="dark"] {
    background: rgba(255, 255, 255, 0.05);
  }

  .glass-card[data-theme="light"] {
    background: rgba(0, 0, 0, 0.03);
  }

  .gradient-text {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    background: linear-gradient(45deg, #eab308, #facc15);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .subtitle-text[data-theme="dark"] {
    color: #facc15;
    text-shadow: 0 0 5px rgba(250, 204, 21, 0.5);
  }

  .subtitle-text[data-theme="light"] {
    color: #facc15;
  }

  .subtitle-text {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }

  .golden-accent-icon[data-theme="dark"] {
    color: #eab308;
  }

  .golden-accent-icon[data-theme="light"] {
    color: #facc15;
  }

  .chart-container {
    width: 100%;
    height: 200px;
    overflow: hidden;
  }

  @media (max-width: 640px) {
    .dashboard-container {
      padding: 1rem;
    }

    .chart-container {
      height: 150px;
    }
  }
`;

const Dashboard = () => {
  const { facilitatorCourses, coursesLoaded, theme, setTheme } = useTourLMS();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageProgress: 0,
    completionRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [progressTrendData, setProgressTrendData] = useState(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleThemeChange);
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [setTheme]);

  useEffect(() => {
    if (coursesLoaded && facilitatorCourses) {
      // Calculate stats
      const totalCourses = facilitatorCourses.length;
      const enrollments = facilitatorCourses.flatMap(course => course.enrollments || []);
      const totalStudents = [...new Set(enrollments.map(enrollment => enrollment.studentId))].length;
      const totalProgress = enrollments.reduce((sum, enrollment) => sum + parseFloat(enrollment.progress || 0), 0);
      const averageProgress = enrollments.length > 0 ? (totalProgress / enrollments.length).toFixed(1) : 0;
      const completedEnrollments = enrollments.filter(enrollment => parseFloat(enrollment.progress || 0) === 100).length;
      const completionRate = enrollments.length > 0 ? ((completedEnrollments / enrollments.length) * 100).toFixed(1) : 0;

      setStats({
        totalCourses,
        totalStudents,
        averageProgress,
        completionRate,
      });

      // Extract recent activities
      const activities = [];
      facilitatorCourses.forEach(course => {
        (course.enrollments || []).forEach(enrollment => {
          const moduleProgress = enrollment.moduleProgress || [];
          moduleProgress.forEach(module => {
            const contentProgress = module.contentProgress || [];
            contentProgress.forEach(content => {
              if (content.lastAccessedAt && content.completed) {
                activities.push({
                  courseTitle: course.title,
                  contentTitle: content.contentId,
                  studentName: enrollment.studentName,
                  lastAccessedAt: new Date(content.lastAccessedAt),
                });
              }
            });
          });
        });
      });
      activities.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
      setRecentActivities(activities.slice(0, 3));

      // Extract unique students
      const studentMap = new Map();
      enrollments.forEach(enrollment => {
        if (!studentMap.has(enrollment.studentId)) {
          studentMap.set(enrollment.studentId, {
            studentId: enrollment.studentId,
            studentName: enrollment.studentName,
            studentProfilePicture: enrollment.studentProfilePicture,
            progress: parseFloat(enrollment.progress || 0),
          });
        }
      });
      setStudents(Array.from(studentMap.values()));

      // Get top 3 courses by enrollment
      const sortedCourses = [...facilitatorCourses].sort((a, b) => (b.enrollments?.length || 0) - (a.enrollments?.length || 0)).slice(0, 3);
      setTopCourses(sortedCourses);

      // Prepare analytics data for charts
      if (sortedCourses.length > 0) {
        // Enrollment distribution data
        setEnrollmentData({
          labels: sortedCourses.map(course => course.title.length > 20 ? course.title.substring(0, 17) + '...' : course.title),
          datasets: [
            {
              label: 'Enrollments',
              data: sortedCourses.map(course => course.enrollments?.length || 0),
              backgroundColor: '#eab308', // Golden for bars
              borderColor: '#facc15',
              borderWidth: 1,
            },
          ],
        });

        // Average progress trend data
        const progressData = sortedCourses.map(course => {
          const enrollments = course.enrollments || [];
          return enrollments.length > 0
            ? (enrollments.reduce((sum, enrollment) => sum + parseFloat(enrollment.progress || 0), 0) / enrollments.length).toFixed(1)
            : 0;
        });
        setProgressTrendData({
          labels: sortedCourses.map(course => course.title.length > 20 ? course.title.substring(0, 17) + '...' : course.title),
          datasets: [
            {
              label: 'Average Progress',
              data: progressData,
              borderColor: '#eab308', // Golden line
              backgroundColor: 'rgba(234, 179, 8, 0.2)',
              tension: 0.4,
              pointBackgroundColor: '#facc15',
              pointBorderColor: '#facc15',
              pointRadius: 5,
              pointHoverRadius: 8,
            },
          ],
        });
      }
    }
  }, [facilitatorCourses, coursesLoaded]);

  const formatDate = (date) => {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (!coursesLoaded) {
    return (
      <div className="dashboard-container" data-theme={theme}>
        <style>{dashboardStyles}</style>
        <div className="space-y-8 mt-16">
          {/* Skeleton Welcome Section */}
          <section className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-2xl p-6 md:p-8 text-white animate-pulse">
            <div className="h-8 bg-yellow-500 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-yellow-500 rounded w-1/2"></div>
          </section>

          {/* Skeleton Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="glass-card p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Skeleton Courses Section */}
          <section className="space-y-6">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="glass-card overflow-hidden h-full flex flex-col animate-pulse">
                  <div className="h-36 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="pt-2 flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mt-2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                    </div>
                    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" data-theme={theme}>
      <style>{dashboardStyles}</style>
      <div className="space-y-8 mt-16 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-2xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, Facilitator!</h1>
              <p className="text-yellow-100 max-w-xl">
                Manage your courses, track student progress, and gain insights into learning trends.
              </p>
            </div>
            <Button 
              className="bg-white text-yellow-600 hover:bg-yellow-50"
              onClick={() => window.location.href = "/facilitator/courses"}
            >
              Manage Courses
            </Button>
          </div>
        </section>

        {/* Stats Overview */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <Card className="glass-card p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800/50">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-xl">
                    <BookOpen className="h-6 w-6 golden-accent-icon" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Total Courses</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">{stats.totalCourses}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800/50">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-800/30 rounded-xl">
                    <Users className="h-6 w-6 golden-accent-icon" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Total Students</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-50">{stats.totalStudents}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800/50">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-xl">
                    <TrendingUp className="h-6 w-6 golden-accent-icon" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Average Progress</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-50">{stats.averageProgress}%</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800/50">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-800/30 rounded-xl">
                    <Award className="h-6 w-6 golden-accent-icon" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600 dark:text-amber-400">Completion Rate</p>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-50">{stats.completionRate}%</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Top 3 Courses Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Courses by Engagement</h2>
            <p className="text-gray-500 dark:text-gray-400">Your most enrolled courses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCourses.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No courses found</h3>
                <p className="text-gray-500 dark:text-gray-400">Create a new course to get started.</p>
                <Button className="mt-4 bg-yellow-600 hover:bg-yellow-700">
                  <Link to="/facilitator/courses">Create Course</Link>
                </Button>
              </div>
            ) : (
              topCourses.map((course) => {
                const enrollments = course.enrollments || [];
                const averageProgress = enrollments.length > 0
                  ? (enrollments.reduce((sum, enrollment) => sum + parseFloat(enrollment.progress || 0), 0) / enrollments.length).toFixed(1)
                  : 0;

                return (
                  <motion.div
                    key={course.key}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link to={`/facilitator/courses/${course.key}`}>
                      <Card className="glass-card overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                        <div className="h-36 relative">
                          <img 
                            src={course.thumbnail || UNSPLASH_URL}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                            <p className="p-3 text-white font-semibold line-clamp-1">{course.title}</p>
                          </div>
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>Enrolled Students</span>
                            <span>{enrollments.length}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>Average Progress</span>
                            <span>{averageProgress}%</span>
                          </div>
                          <Progress value={averageProgress} className="h-2 border border-yellow-500" />
                          <div className="pt-2 flex-1">
                            <div className="flex items-start gap-2">
                              <Users className="h-4 w-4 golden-accent-icon mt-0.5" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Category: {course.category || "N/A"}
                              </p>
                            </div>
                          </div>
                          <Button className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700">
                            View Details
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {/* Students Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Students</h2>
            <p className="text-gray-500 dark:text-gray-400">Monitor student progress</p>
          </div>

          <Card className="glass-card">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No students yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Students will appear here once they enroll in your courses.</p>
                  </div>
                ) : (
                  students.slice(0, 6).map((student) => (
                    <motion.div
                      key={student.studentId}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="glass-card overflow-hidden h-full flex flex-col">
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-yellow-500">
                              <AvatarImage src={student.studentProfilePicture || `${AVATAR_URL}?name=${encodeURIComponent(student.studentName)}&background=random`} />
                              <AvatarFallback>{student.studentName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{student.studentName}</p>
                              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span>Progress</span>
                                <span>{student.progress}%</span>
                              </div>
                              <Progress value={student.progress} className="h-2 mt-1 border border-yellow-500" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
              {students.length > 6 && (
                <div className="text-center mt-4">
                  <Button className="bg-yellow-600 hover:bg-yellow-700">
                    <Link to="/facilitator/students">View All Students</Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Recent Activities and Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="glass-card h-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Student Activities</h2>
                <div className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-4">
                      <Clock className="h-8 w-8 mx-auto golden-accent-icon mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No recent activities.</p>
                    </div>
                  ) : (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 border-yellow-500/50">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-800/30 rounded-xl golden-accent-icon">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{activity.studentName}</span> completed <span className="font-medium">{activity.contentTitle}</span> in <span className="font-medium">{activity.courseTitle}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(activity.lastAccessedAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          <Card className="glass-card h-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span>Quick Insights</span>
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-300">
                  Your courses have an average completion rate of <span className="font-semibold">{stats.completionRate}%</span>. Consider adding more interactive content to boost engagement.
                </p>
                <div className="pt-2">
                  <Button className="w-full flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white">
                    <Zap className="h-4 w-4" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Snapshot</h2>
            <p className="text-gray-500 dark:text-gray-400">Insights from your top courses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-yellow-500 shadow-md shadow-yellow-200">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enrollment Distribution</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Across top courses</p>
                <div className="chart-container">
                  {enrollmentData ? (
                    <BarChart data={enrollmentData} className="h-full" />
                  ) : (
                    <div className="h-full flex items-end" role="img" aria-label="Enrollment Distribution Chart">
                      <div className="w-1/2 bg-yellow-500 h-full rounded"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 truncate md:whitespace-normal">
                  {enrollmentData?.labels[0] || 'Digital Marketing for Beginners'}
                </p>
              </div>
            </Card>

            <Card className="glass-card border-yellow-500 shadow-md shadow-yellow-200">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Progress Trends</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Average progress in top courses</p>
                <div className="chart-container relative">
                  {progressTrendData ? (
                    <LineChart data={progressTrendData} className="h-full" />
                  ) : (
                    <>
                      <div className="absolute top-0 left-0 w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <div className="absolute top-16 left-1/2 w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <svg className="w-full h-full" role="img" aria-label="Progress Trends Chart">
                        <polyline
                          points="0,0 50%,50 100%,100%"
                          fill="none"
                          stroke="#facc15"
                          strokeWidth="2"
                        />
                      </svg>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 truncate md:whitespace-normal">
                  {progressTrendData?.labels[0] || 'Digital Marketing for Beginners'}
                </p>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;