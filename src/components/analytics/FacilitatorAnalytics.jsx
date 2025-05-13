
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { 
  Users, BookOpen, TrendingUp, Calendar, Award, 
  Clock, BarChart2, PieChart as PieChartIcon, 
  Activity, CheckCircle 
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';

// Sample data for analytics
const enrollmentData = [
  { month: 'Jan', students: 45 },
  { month: 'Feb', students: 52 },
  { month: 'Mar', students: 49 },
  { month: 'Apr', students: 63 },
  { month: 'May', students: 71 },
  { month: 'Jun', students: 86 },
  { month: 'Jul', students: 93 },
  { month: 'Aug', students: 105 },
];

const courseEngagementData = [
  { name: 'Plumbing Basics', engagement: 87, students: 38, color: '#8B5CF6' },
  { name: 'Advanced Plumbing', engagement: 72, students: 29, color: '#D946EF' },
  { name: 'Electrical Fundamentals', engagement: 93, students: 42, color: '#F97316' },
  { name: 'Carpentry Essentials', engagement: 65, students: 25, color: '#0EA5E9' },
  { name: 'HVAC Systems', engagement: 78, students: 31, color: '#22C55E' },
];

const studentProgressData = [
  { status: 'Completed', value: 32, color: '#22C55E' },
  { status: 'In Progress', value: 45, color: '#3B82F6' },
  { status: 'Just Started', value: 23, color: '#F97316' },
];

const completionRateData = [
  { month: 'Jan', rate: 68 },
  { month: 'Feb', rate: 72 },
  { month: 'Mar', rate: 75 },
  { month: 'Apr', rate: 70 },
  { month: 'May', rate: 78 },
  { month: 'Jun', rate: 82 },
  { month: 'Jul', rate: 85 },
  { month: 'Aug', rate: 88 },
];

const topPerformingStudents = [
  { id: 1, name: 'Sophia Chen', course: 'Electrical Fundamentals', progress: 98, avatar: 'SC' },
  { id: 2, name: 'Marcus Johnson', course: 'Plumbing Basics', progress: 95, avatar: 'MJ' },
  { id: 3, name: 'Emily Rodriguez', course: 'HVAC Systems', progress: 94, avatar: 'ER' },
  { id: 4, name: 'David Kim', course: 'Carpentry Essentials', progress: 92, avatar: 'DK' },
];

const recentActivities = [
  { id: 1, activity: 'New enrollment in Plumbing Basics', time: '2 hours ago', icon: Users, color: 'bg-blue-100 text-blue-600' },
  { id: 2, activity: 'Course completion: Advanced Plumbing', time: '5 hours ago', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
  { id: 3, activity: 'Quiz submitted in HVAC Systems', time: '1 day ago', icon: Award, color: 'bg-purple-100 text-purple-600' },
  { id: 4, activity: 'New forum discussion in Electrical Fundamentals', time: '2 days ago', icon: Activity, color: 'bg-red-100 text-red-600' },
];

const StatCard = ({ title, value, icon: Icon, trend, color }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <h3 className="text-3xl font-bold mt-1">{value}</h3>
              {trend && (
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs font-medium text-green-500">{trend}</span>
                </div>
              )}
            </div>
            <div className={`p-4 rounded-full ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const FacilitatorAnalytics = () => {
  const [period, setPeriod] = useState('month');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            variant={period === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('week')}
          >
            Week
          </Button>
          <Button 
            variant={period === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('month')}
          >
            Month
          </Button>
          <Button 
            variant={period === 'year' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('year')}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value="156" 
          icon={Users} 
          trend="+12% from last month"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="Active Courses" 
          value="8" 
          icon={BookOpen} 
          trend="+2 new courses"
          color="bg-purple-100 text-purple-600"
        />
        <StatCard 
          title="Completion Rate" 
          value="88%" 
          icon={Award} 
          trend="+5% from last month"
          color="bg-green-100 text-green-600"
        />
        <StatCard 
          title="Avg. Learning Time" 
          value="42 min" 
          icon={Clock} 
          trend="+8 min from last month"
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-gray-500" />
              <span>Student Enrollment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-gray-500" />
              <span>Student Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentProgressData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="status"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {studentProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-500" />
            <span>Course Engagement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={courseEngagementData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="engagement" name="Engagement %" barSize={20}>
                  {courseEngagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="students" name="Students" barSize={20} fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Students and Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span>Top Performing Students</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                      {student.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.course}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Progress value={student.progress} className="w-20 mr-2" />
                    <span className="text-sm font-medium">{student.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-500" />
              <span>Recent Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${activity.color} mt-1`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.activity}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-500" />
            <span>Completion Rate Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacilitatorAnalytics;
