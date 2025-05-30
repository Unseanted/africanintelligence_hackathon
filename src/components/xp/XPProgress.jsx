import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';
import { xpService } from '@/services/xp';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { formatDistanceToNow } from 'date-fns';

const XPProgress = ({ userId }) => {
  const [userXP, setUserXP] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const { course } = useTourLMS();

  useEffect(() => {
    const loadXPData = async () => {
      try {
        const [xpData, activity, userAchievements, topUsers] = await Promise.all([
          xpService.getUserXP(userId),
          xpService.getRecentActivity(userId),
          xpService.getAchievements(userId),
          xpService.getLeaderboard()
        ]);

        setUserXP(xpData);
        setRecentActivity(activity);
        setAchievements(userAchievements);
        setLeaderboard(topUsers);
      } catch (error) {
        console.error('Error loading XP data:', error);
      }
    };

    if (userId) {
      loadXPData();
    }
  }, [userId]);

  if (!userXP) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* XP Progress Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Level {userXP.level}</h3>
            <p className="text-sm text-gray-500">
              {userXP.nextLevelXP} XP to next level
            </p>
          </div>
          <Badge variant="outline" className="text-lg">
            {userXP.totalXP} XP
          </Badge>
        </div>
        <Progress value={xpService.getLevelProgress(userXP.totalXP)} className="h-2" />
      </Card>

      {/* Recent Activity */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Star className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                +{activity.points} XP
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Achievements</h3>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                achievement.unlocked
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Trophy
                  className={`w-5 h-5 ${
                    achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                  }`}
                />
                <h4 className="font-medium text-sm">{achievement.title}</h4>
              </div>
              <p className="text-xs text-gray-600">{achievement.description}</p>
              {achievement.progress && (
                <div className="mt-2">
                  <Progress
                    value={(achievement.progress.current / achievement.progress.target) * 100}
                    className="h-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {achievement.progress.current}/{achievement.progress.target}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Top Learners</h3>
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div
              key={user._id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                user._id === userId ? 'bg-blue-50' : ''
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-medium">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">Level {user.level}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {user.totalXP} XP
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default XPProgress; 