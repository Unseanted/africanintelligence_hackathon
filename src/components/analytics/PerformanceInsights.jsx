import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  Clock,
  Target,
  Award,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

const PerformanceInsights = () => {
  // Mock data for performance metrics
  const performanceData = {
    overall: {
      score: 85,
      change: 5,
      trend: 'up'
    },
    timeSpent: {
      total: '24h 30m',
      average: '2h 15m',
      change: -10,
      trend: 'down'
    },
    completion: {
      rate: 78,
      change: 3,
      trend: 'up'
    },
    engagement: {
      score: 92,
      change: 8,
      trend: 'up'
    }
  };

  // Mock data for skill progression
  const skillProgression = [
    {
      skill: 'React',
      level: 'Advanced',
      progress: 85,
      change: 5
    },
    {
      skill: 'TypeScript',
      level: 'Intermediate',
      progress: 65,
      change: 15
    },
    {
      skill: 'Node.js',
      level: 'Intermediate',
      progress: 70,
      change: 10
    },
    {
      skill: 'GraphQL',
      level: 'Beginner',
      progress: 40,
      change: 20
    }
  ];

  // Mock data for recent achievements
  const achievements = [
    {
      id: 1,
      title: 'Fast Learner',
      description: 'Completed 5 courses in one week',
      date: '2024-03-15',
      icon: <Award className="w-5 h-5" />
    },
    {
      id: 2,
      title: 'Consistent Contributor',
      description: 'Submitted 10 content pieces',
      date: '2024-03-10',
      icon: <Activity className="w-5 h-5" />
    }
  ];

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <ArrowUpRight className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Insights</h2>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall Score</p>
              <h3 className="text-2xl font-bold mt-1">{performanceData.overall.score}%</h3>
            </div>
            <div className="flex items-center">
              {getTrendIcon(performanceData.overall.trend)}
              <span className="text-sm ml-1">{performanceData.overall.change}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Time Spent</p>
              <h3 className="text-2xl font-bold mt-1">{performanceData.timeSpent.total}</h3>
            </div>
            <div className="flex items-center">
              {getTrendIcon(performanceData.timeSpent.trend)}
              <span className="text-sm ml-1">{performanceData.timeSpent.change}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <h3 className="text-2xl font-bold mt-1">{performanceData.completion.rate}%</h3>
            </div>
            <div className="flex items-center">
              {getTrendIcon(performanceData.completion.trend)}
              <span className="text-sm ml-1">{performanceData.completion.change}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Engagement Score</p>
              <h3 className="text-2xl font-bold mt-1">{performanceData.engagement.score}%</h3>
            </div>
            <div className="flex items-center">
              {getTrendIcon(performanceData.engagement.trend)}
              <span className="text-sm ml-1">{performanceData.engagement.change}%</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Skill Progression</h3>
          <div className="space-y-4">
            {skillProgression.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-medium">{skill.skill}</h4>
                    <p className="text-sm text-gray-500">{skill.level}</p>
                  </div>
                  <div className="flex items-center">
                    {getTrendIcon('up')}
                    <span className="text-sm ml-1">+{skill.change}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${skill.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
          <div className="space-y-4">
            {achievements.map(achievement => (
              <div key={achievement.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {achievement.icon}
                </div>
                <div>
                  <h4 className="font-medium">{achievement.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                  <p className="text-sm text-gray-400 mt-1">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceInsights; 