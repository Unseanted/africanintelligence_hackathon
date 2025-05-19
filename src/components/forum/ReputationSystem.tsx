import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { Trophy, Star, ThumbsUp, MessageSquare, Flag, Shield } from 'lucide-react';

interface ReputationStats {
  totalPoints: number;
  level: number;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }[];
  activities: {
    type: 'upvote' | 'downvote' | 'comment' | 'solution' | 'moderation';
    points: number;
    count: number;
  }[];
  recentActivity: {
    type: string;
    description: string;
    points: number;
    timestamp: string;
  }[];
}

interface ReputationSystemProps {
  userId: string;
}

const ReputationSystem: React.FC<ReputationSystemProps> = ({ userId }) => {
  const [stats, setStats] = useState<ReputationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useTourLMS();

  useEffect(() => {
    const fetchReputationStats = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}/reputation`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch reputation stats');

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching reputation stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReputationStats();
  }, [token, userId]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const getLevelProgress = () => {
    const nextLevel = stats.level + 1;
    const currentLevelPoints = stats.level * 100;
    const nextLevelPoints = nextLevel * 100;
    const progress = ((stats.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upvote':
        return <ThumbsUp className="w-4 h-4" />;
      case 'downvote':
        return <ThumbsUp className="w-4 h-4 transform rotate-180" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'solution':
        return <Star className="w-4 h-4" />;
      case 'moderation':
        return <Shield className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Reputation Profile</h2>
            <p className="text-gray-500">Level {stats.level} Contributor</p>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-2xl font-bold">{stats.totalPoints}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress to Level {stats.level + 1}</span>
            <span>{getLevelProgress().toFixed(1)}%</span>
          </div>
          <Progress value={getLevelProgress()} className="h-2" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Activity Breakdown</h3>
          <div className="space-y-4">
            {stats.activities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.type)}
                  <span className="capitalize">{activity.type}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{activity.count} times</div>
                  <div className="text-sm text-gray-500">
                    {activity.points > 0 ? '+' : ''}{activity.points} points each
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Badges</h3>
          <div className="grid grid-cols-2 gap-4">
            {stats.badges.map((badge) => (
              <Card key={badge.id} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {badge.icon === 'trophy' && <Trophy className="w-5 h-5 text-yellow-500" />}
                  {badge.icon === 'star' && <Star className="w-5 h-5 text-yellow-500" />}
                  {badge.icon === 'shield' && <Shield className="w-5 h-5 text-blue-500" />}
                  <span className="font-medium">{badge.name}</span>
                </div>
                <p className="text-sm text-gray-500">{badge.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getActivityIcon(activity.type)}
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`font-medium ${
                activity.points > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {activity.points > 0 ? '+' : ''}{activity.points}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ReputationSystem; 