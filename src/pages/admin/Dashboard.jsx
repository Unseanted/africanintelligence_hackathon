
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  BookOpen, 
  BarChart, 
  GraduationCap,
  CircuitBoard, 
  Calendar, 
  Clock, 
  MessageSquare,
  BookIcon,
  UserPlus,
  FilePlus,
  UserCheck,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { clg } from '../../lib/basic';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [activities, setActivities] = useState([]);
  const {API_URL}= useTourLMS();
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: { 'x-auth-token': token }
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Failed to load dashboard data",
          description: error.response?.data?.message || "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/admin/activities?limit=10`, {
          headers: { 'x-auth-token': token }
        });
        clg(response)
        setActivities(response.data);
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Failed to load recent activities",
          description: error.response?.data?.message || "Please try again later",
          variant: "destructive"
        });
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchDashboardData();
    fetchActivities();
  }, [toast, API_URL]);

  // Stat cards data
  const statCards = [
    { 
      title: "Total Users", 
      value: dashboardData?.stats?.totalUsers || 0,
      icon: <Users className="text-blue-400" />,
      color: "from-blue-600 to-blue-400"
    },
    { 
      title: "Learners", 
      value: dashboardData?.stats?.learners || 0,
      icon: <GraduationCap className="text-green-400" />,
      color: "from-green-600 to-green-400"
    },
    { 
      title: "Facilitators", 
      value: dashboardData?.stats?.facilitators || 0, 
      icon: <CircuitBoard className="text-amber-400" />,
      color: "from-amber-600 to-amber-400"
    },
    { 
      title: "Total Courses", 
      value: dashboardData?.stats?.courses || 0,
      icon: <BookOpen className="text-purple-400" />,
      color: "from-purple-600 to-purple-400"
    }
  ];

  // Helper function to get activity icon
  const getActivityIcon = (type) => {
    switch(type) {
      case 'enrollment':
        return <UserCheck className="text-green-400" size={16} />;
      case 'forum_post':
        return <MessageSquare className="text-amber-400" size={16} />;
      case 'course_creation':
        return <FilePlus className="text-purple-400" size={16} />;
      case 'user_registration':
        return <UserPlus className="text-blue-400" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  // Helper function to format activity text
  const getActivityText = (activity) => {
    switch(activity.type) {
      case 'enrollment':
        return (
          <span>
            <span className="font-medium">{activity.user.name}</span> enrolled in{" "}
            <span className="font-medium">{activity.course.title}</span>
          </span>
        );
      case 'forum_post':
        return (
          <span>
            <span className="font-medium">{activity.user.name}</span> posted{" "}
            <span className="font-medium">"{activity.title}"</span> in the forum
          </span>
        );
      case 'course_creation':
        return (
          <span>
            <span className="font-medium">{activity.facilitator.name}</span> created a new course{" "}
            <span className="font-medium">"{activity.title}"</span>
          </span>
        );
      case 'user_registration':
        return (
          <span>
            <span className="font-medium">{activity.user.name}</span> joined as a new{" "}
            <span className="font-medium">{activity.role}</span>
          </span>
        );
      default:
        return <span>Unknown activity occurred</span>;
    }
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-1">
          Overview of platform statistics and recent activities
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          // Skeleton Loaders
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
              <CardContent className="p-6">
                <div className="h-20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, index) => (
            <Card key={index} className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.color}"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1 text-white">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-800/50">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-xl">
              <Users size={20} /> Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-800 animate-pulse rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-800 animate-pulse rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {dashboardData?.recentUsers?.map((user) => (
                  <div key={user._id} className="flex items-center p-2 hover:bg-gray-800/30 rounded-md transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-white">{user.name}</p>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-400">
                          {user.email} • {user.role}
                        </p>
                        <p className="text-xs text-gray-500">{format(new Date(user.createdAt), 'PPpp')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Courses */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <TrendingUp size={20} /> Popular Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="mb-4">
                    <div className="h-5 bg-gray-800 animate-pulse rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-800 animate-pulse rounded w-1/2 mb-2"></div>
                    <div className="h-2 bg-gray-800 animate-pulse rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData?.popularCourses?.map((course) => (
                  <div key={course._id} className="mb-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-white">{course.title}</h4>
                      <span className="text-sm bg-gray-800 px-2 py-0.5 rounded-full text-white">
                        {course.enrolled || 0} students
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">
                      By {course.facilitator?.name || "Unknown"}
                    </p>
                    <Progress value={course.rating * 20 || 0} 
                      className="h-1.5 bg-gray-700" 
                      indicatorClassName="bg-gradient-to-r from-amber-500 to-yellow-300" 
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock size={20} /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, index) => (
                  <div key={index} className="flex gap-3 mb-4">
                    <Skeleton className="w-8 h-8 rounded-full bg-gray-800" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-1 bg-gray-800" />
                      <Skeleton className="h-3 w-1/4 bg-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-800/20 rounded-md transition-colors">
                    <Avatar className="w-9 h-9 border border-gray-700">
                      <AvatarFallback className="bg-gray-800 text-gray-400">
                        {getActivityIcon(activity.type)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm text-gray-300">
                        {getActivityText(activity)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(new Date(activity.date), 'Pp')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p>No recent activity found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar size={20} /> Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, index) => (
                  <div key={index} className="mb-4">
                    <Skeleton className="h-4 w-40 mb-1 bg-gray-800" />
                    <Skeleton className="h-3 w-full bg-gray-800" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p>No upcoming events</p>
                <p className="text-sm">Schedule events from the Events page</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
