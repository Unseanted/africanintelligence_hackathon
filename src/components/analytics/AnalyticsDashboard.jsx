import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Activity, 
  Clock, 
  Users, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Bell,
  Eye,
  Palette,
  Mail,
  Shield,
  Target,
  BarChart2,
  Zap,
  BookOpen
} from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AnalyticsSettings from './AnalyticsSettings';

// Mock data for charts
const timeSpentData = [
  { name: 'Mon', hours: 2.5 },
  { name: 'Tue', hours: 3.2 },
  { name: 'Wed', hours: 4.1 },
  { name: 'Thu', hours: 2.8 },
  { name: 'Fri', hours: 3.5 },
  { name: 'Sat', hours: 1.5 },
  { name: 'Sun', hours: 2.0 },
];

const skillProgressData = [
  { name: 'JavaScript', value: 75 },
  { name: 'Python', value: 60 },
  { name: 'React', value: 85 },
  { name: 'Node.js', value: 70 },
  { name: 'SQL', value: 65 },
];

const activityData = [
  { name: 'Jan', completed: 4, inProgress: 2 },
  { name: 'Feb', completed: 3, inProgress: 3 },
  { name: 'Mar', completed: 5, inProgress: 1 },
  { name: 'Apr', completed: 6, inProgress: 2 },
  { name: 'May', completed: 4, inProgress: 3 },
  { name: 'Jun', completed: 7, inProgress: 1 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [data, setData] = useState({
    timeSpent: timeSpentData,
    skillProgress: skillProgressData,
    activity: activityData
  });
  const [settings, setSettings] = useState({
    display: {
      showTimeSpent: true,
      showCollaborations: true,
      showAchievements: true,
      showProgress: true,
      chartTheme: 'default',
      dataDensity: 'normal',
      showTrends: true,
      showComparisons: true,
      showPredictions: true,
      showInsights: true,
      showRecommendations: true,
      showMilestones: true,
      showLeaderboard: true
    },
    notifications: {
      weeklyReport: true,
      achievementAlerts: true,
      progressUpdates: true,
      collaborationRequests: true,
      emailDigest: false,
      milestoneAlerts: true,
      performanceAlerts: true,
      customAlerts: false,
      goalReminders: true,
      skillGapAlerts: true,
      learningPathUpdates: true,
      peerActivityAlerts: true
    },
    privacy: {
      shareProgress: false,
      showInLeaderboard: true,
      allowDataCollection: true,
      exportData: true,
      shareAchievements: true,
      shareActivity: false,
      sharePredictions: false,
      shareSkills: false,
      shareGoals: false,
      shareMilestones: false,
      shareRecommendations: false
    },
    preferences: {
      defaultTimeRange: 'week',
      refreshInterval: '5',
      chartAnimation: true,
      compactView: false,
      defaultView: 'dashboard',
      showTooltips: true,
      showGuides: true,
      autoRefresh: true,
      defaultChartType: 'line',
      showDataPoints: true,
      showGridLines: true,
      showLegend: true
    },
    analytics: {
      trackTimeSpent: true,
      trackProgress: true,
      trackAchievements: true,
      trackCollaborations: true,
      trackSkills: true,
      trackGoals: true,
      trackPredictions: true,
      trackComparisons: true,
      trackEngagement: true,
      trackPerformance: true,
      trackLearningPath: true,
      trackPeerActivity: true
    },
    goals: {
      showGoalProgress: true,
      showGoalPredictions: true,
      showGoalRecommendations: true,
      showGoalMilestones: true,
      showGoalAlerts: true,
      showGoalInsights: true,
      showGoalComparisons: true,
      showGoalTrends: true,
      showGoalHistory: true
    },
    learning: {
      showLearningPath: true,
      showSkillGaps: true,
      showRecommendations: true,
      showPrerequisites: true,
      showRelatedContent: true,
      showLearningHistory: true,
      showLearningInsights: true,
      showLearningTrends: true
    }
  });

  // Function to generate data based on time range
  const generateDataForTimeRange = (range) => {
    const now = new Date();
    let data = [];

    switch (range) {
      case 'week':
        // Generate data for the last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          data.push({
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            hours: Math.random() * 5 + 1,
            completed: Math.floor(Math.random() * 5) + 1,
            inProgress: Math.floor(Math.random() * 3) + 1
          });
        }
        break;
      case 'month':
        // Generate data for the last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          data.push({
            name: date.toLocaleDateString('en-US', { day: 'numeric' }),
            hours: Math.random() * 5 + 1,
            completed: Math.floor(Math.random() * 5) + 1,
            inProgress: Math.floor(Math.random() * 3) + 1
          });
        }
        break;
      case 'year':
        // Generate data for the last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          data.push({
            name: date.toLocaleDateString('en-US', { month: 'short' }),
            hours: Math.random() * 20 + 10,
            completed: Math.floor(Math.random() * 10) + 5,
            inProgress: Math.floor(Math.random() * 5) + 2
          });
        }
        break;
    }

    return data;
  };

  const handleTimeRangeChange = (range) => {
    setIsLoading(true);
    setTimeRange(range);
    
    // Simulate data loading
    setTimeout(() => {
      const newData = generateDataForTimeRange(range);
      setData(prev => ({
        ...prev,
        timeSpent: newData,
        activity: newData
      }));
      setIsLoading(false);
      toast.success(`Updated to ${range} view`);
    }, 500);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate data refresh
    setTimeout(() => {
      const newData = generateDataForTimeRange(timeRange);
      setData(prev => ({
        ...prev,
        timeSpent: newData,
        activity: newData
      }));
      setIsLoading(false);
      toast.success('Data refreshed successfully');
    }, 1000);
  };

  const handleExport = () => {
    setIsLoading(true);
    
    // Prepare data for export
    const exportData = {
      timeRange,
      timeSpent: data.timeSpent,
      skillProgress: data.skillProgress,
      activity: data.activity,
      exportDate: new Date().toISOString()
    };

    // Convert to JSON and create blob
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-export-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsLoading(false);
    toast.success('Analytics data exported successfully');
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    toast.success('Settings updated successfully');
  };

  const handleResetSettings = () => {
    setSettings({
      display: {
        showTimeSpent: true,
        showCollaborations: true,
        showAchievements: true,
        showProgress: true,
        chartTheme: 'default',
        dataDensity: 'normal',
        showTrends: true,
        showComparisons: true,
        showPredictions: true,
        showInsights: true,
        showRecommendations: true,
        showMilestones: true,
        showLeaderboard: true
      },
      notifications: {
        weeklyReport: true,
        achievementAlerts: true,
        progressUpdates: true,
        collaborationRequests: true,
        emailDigest: false,
        milestoneAlerts: true,
        performanceAlerts: true,
        customAlerts: false,
        goalReminders: true,
        skillGapAlerts: true,
        learningPathUpdates: true,
        peerActivityAlerts: true
      },
      privacy: {
        shareProgress: false,
        showInLeaderboard: true,
        allowDataCollection: true,
        exportData: true,
        shareAchievements: true,
        shareActivity: false,
        sharePredictions: false,
        shareSkills: false,
        shareGoals: false,
        shareMilestones: false,
        shareRecommendations: false
      },
      preferences: {
        defaultTimeRange: 'week',
        refreshInterval: '5',
        chartAnimation: true,
        compactView: false,
        defaultView: 'dashboard',
        showTooltips: true,
        showGuides: true,
        autoRefresh: true,
        defaultChartType: 'line',
        showDataPoints: true,
        showGridLines: true,
        showLegend: true
      },
      analytics: {
        trackTimeSpent: true,
        trackProgress: true,
        trackAchievements: true,
        trackCollaborations: true,
        trackSkills: true,
        trackGoals: true,
        trackPredictions: true,
        trackComparisons: true,
        trackEngagement: true,
        trackPerformance: true,
        trackLearningPath: true,
        trackPeerActivity: true
      },
      goals: {
        showGoalProgress: true,
        showGoalPredictions: true,
        showGoalRecommendations: true,
        showGoalMilestones: true,
        showGoalAlerts: true,
        showGoalInsights: true,
        showGoalComparisons: true,
        showGoalTrends: true,
        showGoalHistory: true
      },
      learning: {
        showLearningPath: true,
        showSkillGaps: true,
        showRecommendations: true,
        showPrerequisites: true,
        showRelatedContent: true,
        showLearningHistory: true,
        showLearningInsights: true,
        showLearningTrends: true
      }
    });
    toast.success('Settings reset to default values');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleTimeRangeChange('week')}
            className={cn(
              timeRange === 'week' && 'bg-primary text-primary-foreground',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            disabled={isLoading}
          >
            Week
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleTimeRangeChange('month')}
            className={cn(
              timeRange === 'month' && 'bg-primary text-primary-foreground',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            disabled={isLoading}
          >
            Month
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleTimeRangeChange('year')}
            className={cn(
              timeRange === 'year' && 'bg-primary text-primary-foreground',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            disabled={isLoading}
          >
            Year
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(isLoading && 'opacity-50 cursor-not-allowed')}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={isLoading}
            className={cn(isLoading && 'opacity-50 cursor-not-allowed')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeRange === 'week' ? '75%' : timeRange === 'month' ? '82%' : '90%'}
            </div>
            <Progress 
              value={timeRange === 'week' ? 75 : timeRange === 'month' ? 82 : 90} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {timeRange === 'week' ? '+5% from last week' : 
               timeRange === 'month' ? '+8% from last month' : 
               '+12% from last year'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19.6h</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaborations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Active projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Earned this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements Progress</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Time Spent Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.timeSpent}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skill Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.skillProgress}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.skillProgress.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['JavaScript Master', 'Python Basics', 'React Expert', 'Node.js Developer'].map((achievement, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{achievement}</span>
                      <Badge variant="secondary">{Math.floor(Math.random() * 100)}%</Badge>
                    </div>
                    <Progress value={Math.floor(Math.random() * 100)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.activity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#8884d8" name="Completed" />
                    <Bar dataKey="inProgress" fill="#82ca9d" name="In Progress" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <AnalyticsSettings 
            settings={settings}
            onSettingsChange={handleSettingChange}
            onResetSettings={handleResetSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard; 