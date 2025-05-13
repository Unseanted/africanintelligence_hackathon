
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart as BarChartIcon, 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  LineChart,
  PieChart,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../../components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useTourLMS } from '../../contexts/TourLMSContext';

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const {API_URL}= useTourLMS();
    const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/admin/analytics`, {
          headers: { 'x-auth-token': token }
        });
        setAnalyticsData(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast({
          title: "Failed to load analytics data",
          description: error.response?.data?.message || "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Format data for charts
  const userGrowthData = analyticsData?.userGrowth || [];
  const roleDistribution = analyticsData?.roleDistribution || [];
  const enrollmentGrowthData = analyticsData?.enrollmentGrowth || [];
  const courseGrowthData = analyticsData?.courseGrowth || [];
  
  // Get the summary stats
  const summary = analyticsData?.summary || { 
    totalUsers: 0, 
    totalCourses: 0, 
    totalEnrollments: 0, 
    activeUsers: 0 
  };

  // Format role distribution for pie chart
  const roleDistributionFormatted = roleDistribution.map(item => ({
    name: item.role.charAt(0).toUpperCase() + item.role.slice(1),
    value: item.count
  }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <BarChartIcon /> Platform Analytics
        </h1>
        <p className="text-gray-400 mt-1">
          Comprehensive metrics and statistics about platform usage
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Users</p>
                <p className="text-2xl font-bold">{summary.totalUsers}</p>
              </div>
              <div className="p-3 bg-indigo-900/30 rounded-full text-indigo-400">
                <Users size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Courses</p>
                <p className="text-2xl font-bold">{summary.totalCourses}</p>
              </div>
              <div className="p-3 bg-purple-900/30 rounded-full text-purple-400">
                <BookOpen size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Enrollments</p>
                <p className="text-2xl font-bold">{summary.totalEnrollments}</p>
              </div>
              <div className="p-3 bg-green-900/30 rounded-full text-green-400">
                <GraduationCap size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Users</p>
                <p className="text-2xl font-bold">{summary.activeUsers}</p>
              </div>
              <div className="p-3 bg-amber-900/30 rounded-full text-amber-400">
                <TrendingUp size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            <span>User Growth</span>
          </CardTitle>
          <CardDescription>Monthly user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={userGrowthData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#718096" 
                    tick={{ fill: '#a0aec0' }} 
                    tickFormatter={(date) => {
                      const [year, month] = date.split('-');
                      return `${month}/${year.slice(2)}`;
                    }}
                  />
                  <YAxis stroke="#718096" tick={{ fill: '#a0aec0' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a202c', 
                      border: '1px solid #2d3748',
                      borderRadius: '0.375rem',
                      color: '#e2e8f0'
                    }} 
                    labelFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `Month: ${month}/${year}`;
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="New Users" 
                    stroke="#8B5CF6" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: '#8B5CF6' }} 
                    activeDot={{ r: 6 }} 
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No user growth data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        {/* Role Distribution */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              <span>User Role Distribution</span>
            </CardTitle>
            <CardDescription>Breakdown of user types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {roleDistributionFormatted.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={roleDistributionFormatted}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleDistributionFormatted.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a202c', 
                        border: '1px solid #2d3748',
                        borderRadius: '0.375rem',
                        color: '#e2e8f0'
                      }} 
                    />
                    <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No role distribution data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Growth Chart */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="w-5 h-5" />
              <span>Enrollment Growth</span>
            </CardTitle>
            <CardDescription>Monthly course enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {enrollmentGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={enrollmentGrowthData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#718096" 
                      tick={{ fill: '#a0aec0' }} 
                      tickFormatter={(date) => {
                        const [year, month] = date.split('-');
                        return `${month}/${year.slice(2)}`;
                      }}
                    />
                    <YAxis stroke="#718096" tick={{ fill: '#a0aec0' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a202c', 
                        border: '1px solid #2d3748',
                        borderRadius: '0.375rem',
                        color: '#e2e8f0'
                      }} 
                      labelFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `Month: ${month}/${year}`;
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                    <Bar dataKey="count" name="Enrollments" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No enrollment growth data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>Course Growth</span>
            </CardTitle>
            <CardDescription>Course creation over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {courseGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={courseGrowthData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#718096" 
                      tick={{ fill: '#a0aec0' }} 
                      tickFormatter={(date) => {
                        const [year, month] = date.split('-');
                        return `${month}/${year.slice(2)}`;
                      }}
                    />
                    <YAxis stroke="#718096" tick={{ fill: '#a0aec0' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a202c', 
                        border: '1px solid #2d3748',
                        borderRadius: '0.375rem',
                        color: '#e2e8f0'
                      }} 
                      labelFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `Month: ${month}/${year}`;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="New Courses" 
                      stroke="#F59E0B" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: '#F59E0B' }} 
                      activeDot={{ r: 6 }} 
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No course growth data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              <span>Course Completion</span>
            </CardTitle>
            <CardDescription>Course completion metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col justify-center">
              {analyticsData?.completionMetrics ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Overall Completion Rate</h3>
                    <div className="flex items-end gap-4">
                      <div className="w-full">
                        <div className="flex justify-between mb-2 text-sm">
                          <span>Completed Enrollments</span>
                          <span>
                            {analyticsData.completionMetrics.completedEnrollments} / {analyticsData.completionMetrics.totalEnrollments}
                          </span>
                        </div>
                        <Progress 
                          value={analyticsData.completionMetrics.completionRate} 
                          className="h-3" 
                          indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-500" 
                        />
                      </div>
                      <div className="text-xl font-bold text-green-400">
                        {analyticsData.completionMetrics.completionRate}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                      <div className="text-sm text-gray-400">Total Enrollments</div>
                      <div className="text-2xl font-bold mt-1">
                        {analyticsData.completionMetrics.totalEnrollments}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                      <div className="text-sm text-gray-400">Completed Enrollments</div>
                      <div className="text-2xl font-bold mt-1">
                        {analyticsData.completionMetrics.completedEnrollments}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No completion metrics available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
