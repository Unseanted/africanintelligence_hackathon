import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Eye,
  BarChart2,
  BookOpen,
  Bell,
  Target,
  Zap,
  Palette,
  Shield,
  Mail,
  Download,
  RefreshCw,
  Settings,
  Trash2,
  Save,
  Upload
} from 'lucide-react';
import { toast } from "sonner";

const AnalyticsSettings = ({ settings, onSettingsChange, onResetSettings }) => {
  const handleSettingChange = (category, setting, value) => {
    onSettingsChange(category, setting, value);
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          onSettingsChange('import', null, importedSettings);
          toast.success('Settings imported successfully');
        } catch (error) {
          toast.error('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportSettings = () => {
    const settingsBlob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(settingsBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
      // Implement data clearing logic here
      toast.success('Analytics data cleared successfully');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold">Analytics Settings</h3>
          <p className="text-sm text-muted-foreground">Configure your analytics preferences and data management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button variant="outline" onClick={onResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button variant="outline" onClick={handleClearData}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Data
          </Button>
        </div>
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
                  <SelectItem value="custom">Custom</SelectItem>
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

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Data Management
            </CardTitle>
            <CardDescription>Manage your analytics data and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoBackup">Auto Backup</Label>
                <Switch
                  id="autoBackup"
                  checked={settings.preferences.autoBackup}
                  onCheckedChange={(checked) => handleSettingChange('preferences', 'autoBackup', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dataRetention">Data Retention (days)</Label>
                <Input
                  type="number"
                  value={settings.preferences.dataRetention || 30}
                  onChange={(e) => handleSettingChange('preferences', 'dataRetention', e.target.value)}
                  min="1"
                  max="365"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="compressData">Compress Data</Label>
                <Switch
                  id="compressData"
                  checked={settings.preferences.compressData}
                  onCheckedChange={(checked) => handleSettingChange('preferences', 'compressData', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import/Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import/Export
            </CardTitle>
            <CardDescription>Import or export your settings and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Import Settings</Label>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Export Settings</Label>
                <Button variant="outline" onClick={handleExportSettings}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSettings; 