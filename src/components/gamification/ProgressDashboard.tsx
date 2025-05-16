import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Trophy, Flame, Star, Target } from 'lucide-react';

interface UserStats {
  totalXp: number;
  currentStreak: number;
  longestStreak?: number;
  totalPoints: number;
  rank: number;
  completedChallenges: number;
  activeChallenges: number;
}

interface ProgressDashboardProps {
  userStats: UserStats;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  userStats,
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* XP and Streak Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Total XP</span>
                <span className="text-sm font-medium">{userStats.totalXp}</span>
              </div>
              <Progress value={userStats.totalXp % 1000} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {1000 - (userStats.totalXp % 1000)} XP until next level
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Streak</span>
                <Badge variant="secondary">
                  {userStats.currentStreak} days 🔥
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep up the good work!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-medium">Total Points</h4>
                <p className="text-sm text-muted-foreground">{userStats.totalPoints}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Star className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium">Current Rank</h4>
                <p className="text-sm text-muted-foreground">#{userStats.rank}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Target className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h4 className="font-medium">Completed</h4>
                <p className="text-sm text-muted-foreground">{userStats.completedChallenges}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <h4 className="font-medium">Active</h4>
                <p className="text-sm text-muted-foreground">{userStats.activeChallenges}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 