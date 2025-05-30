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

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      toast.success('Analytics data exported successfully!');
      setIsLoading(false);
    }, 1500);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      toast.success('Analytics data refreshed!');
      setIsLoading(false);
    }, 1000);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    toast.info(`Time range updated to ${range}`);
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
            className={timeRange === 'week' ? 'bg-primary text-primary-foreground' : ''}
          >
            Week
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleTimeRangeChange('month')}
            className={timeRange === 'month' ? 'bg-primary text-primary-foreground' : ''}
          >
            Month
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleTimeRangeChange('year')}
            className={timeRange === 'year' ? 'bg-primary text-primary-foreground' : ''}
          >
            Year
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={isLoading}
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
            <div className="text-2xl font-bold">75%</div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              +5% from last month
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
                    <AreaChart data={timeSpentData}>
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
                        data={skillProgressData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {skillProgressData.map((entry, index) => (
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
                  <BarChart data={activityData}>
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Analytics Preferences</h3>
              <p className="text-sm text-muted-foreground">Configure your analytics preferences and notification settings</p>
            </div>
            <Button variant="outline" onClick={handleResetSettings}>
              Reset to Defaults
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Display Settings
                </CardTitle>
                <CardDescription>Customize how your analytics are displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Chart Theme</Label>
                  <Select
                    value={settings.display.chartTheme}
                    onValueChange={(value) => handleSettingChange('display', 'chartTheme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="contrast">High Contrast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Density</Label>
                  <Select
                    value={settings.display.dataDensity}
                    onValueChange={(value) => handleSettingChange('display', 'dataDensity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showTrends">Show Trends</Label>
                    <Switch
                      id="showTrends"
                      checked={settings.display.showTrends}
                      onCheckedChange={(checked) => handleSettingChange('display', 'showTrends', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showComparisons">Show Comparisons</Label>
                    <Switch
                      id="showComparisons"
                      checked={settings.display.showComparisons}
                      onCheckedChange={(checked) => handleSettingChange('display', 'showComparisons', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showPredictions">Show Predictions</Label>
                    <Switch
                      id="showPredictions"
                      checked={settings.display.showPredictions}
                      onCheckedChange={(checked) => handleSettingChange('display', 'showPredictions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showInsights">Show Insights</Label>
                    <Switch
                      id="showInsights"
                      checked={settings.display.showInsights}
                      onCheckedChange={(checked) => handleSettingChange('display', 'showInsights', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Analytics Tracking
                </CardTitle>
                <CardDescription>Configure what data to track and analyze</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trackTimeSpent">Track Time Spent</Label>
                    <Switch
                      id="trackTimeSpent"
                      checked={settings.analytics.trackTimeSpent}
                      onCheckedChange={(checked) => handleSettingChange('analytics', 'trackTimeSpent', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trackProgress">Track Progress</Label>
                    <Switch
                      id="trackProgress"
                      checked={settings.analytics.trackProgress}
                      onCheckedChange={(checked) => handleSettingChange('analytics', 'trackProgress', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trackSkills">Track Skills</Label>
                    <Switch
                      id="trackSkills"
                      checked={settings.analytics.trackSkills}
                      onCheckedChange={(checked) => handleSettingChange('analytics', 'trackSkills', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trackEngagement">Track Engagement</Label>
                    <Switch
                      id="trackEngagement"
                      checked={settings.analytics.trackEngagement}
                      onCheckedChange={(checked) => handleSettingChange('analytics', 'trackEngagement', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Learning Settings
                </CardTitle>
                <CardDescription>Configure learning path and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showLearningPath">Show Learning Path</Label>
                    <Switch
                      id="showLearningPath"
                      checked={settings.learning.showLearningPath}
                      onCheckedChange={(checked) => handleSettingChange('learning', 'showLearningPath', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showSkillGaps">Show Skill Gaps</Label>
                    <Switch
                      id="showSkillGaps"
                      checked={settings.learning.showSkillGaps}
                      onCheckedChange={(checked) => handleSettingChange('learning', 'showSkillGaps', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showRecommendations">Show Recommendations</Label>
                    <Switch
                      id="showRecommendations"
                      checked={settings.learning.showRecommendations}
                      onCheckedChange={(checked) => handleSettingChange('learning', 'showRecommendations', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showPrerequisites">Show Prerequisites</Label>
                    <Switch
                      id="showPrerequisites"
                      checked={settings.learning.showPrerequisites}
                      onCheckedChange={(checked) => handleSettingChange('learning', 'showPrerequisites', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weeklyReport">Weekly Report</Label>
                    <Switch
                      id="weeklyReport"
                      checked={settings.notifications.weeklyReport}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'weeklyReport', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="achievementAlerts">Achievement Alerts</Label>
                    <Switch
                      id="achievementAlerts"
                      checked={settings.notifications.achievementAlerts}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'achievementAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="goalReminders">Goal Reminders</Label>
                    <Switch
                      id="goalReminders"
                      checked={settings.notifications.goalReminders}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'goalReminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="skillGapAlerts">Skill Gap Alerts</Label>
                    <Switch
                      id="skillGapAlerts"
                      checked={settings.notifications.skillGapAlerts}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'skillGapAlerts', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goals Settings
                </CardTitle>
                <CardDescription>Configure goal tracking and display preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showGoalProgress">Show Goal Progress</Label>
                    <Switch
                      id="showGoalProgress"
                      checked={settings.goals.showGoalProgress}
                      onCheckedChange={(checked) => handleSettingChange('goals', 'showGoalProgress', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showGoalPredictions">Show Goal Predictions</Label>
                    <Switch
                      id="showGoalPredictions"
                      checked={settings.goals.showGoalPredictions}
                      onCheckedChange={(checked) => handleSettingChange('goals', 'showGoalPredictions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showGoalInsights">Show Goal Insights</Label>
                    <Switch
                      id="showGoalInsights"
                      checked={settings.goals.showGoalInsights}
                      onCheckedChange={(checked) => handleSettingChange('goals', 'showGoalInsights', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showGoalTrends">Show Goal Trends</Label>
                    <Switch
                      id="showGoalTrends"
                      checked={settings.goals.showGoalTrends}
                      onCheckedChange={(checked) => handleSettingChange('goals', 'showGoalTrends', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  General Preferences
                </CardTitle>
                <CardDescription>Configure general analytics preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Time Range</Label>
                  <Select
                    value={settings.preferences.defaultTimeRange}
                    onValueChange={(value) => handleSettingChange('preferences', 'defaultTimeRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Refresh Interval (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.preferences.refreshInterval}
                    onChange={(e) => handleSettingChange('preferences', 'refreshInterval', e.target.value)}
                    min="1"
                    max="60"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoRefresh">Auto Refresh</Label>
                    <Switch
                      id="autoRefresh"
                      checked={settings.preferences.autoRefresh}
                      onCheckedChange={(checked) => handleSettingChange('preferences', 'autoRefresh', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showTooltips">Show Tooltips</Label>
                    <Switch
                      id="showTooltips"
                      checked={settings.preferences.showTooltips}
                      onCheckedChange={(checked) => handleSettingChange('preferences', 'showTooltips', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showGuides">Show Guides</Label>
                    <Switch
                      id="showGuides"
                      checked={settings.preferences.showGuides}
                      onCheckedChange={(checked) => handleSettingChange('preferences', 'showGuides', checked)}
                    />
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

export default AnalyticsDashboard; 