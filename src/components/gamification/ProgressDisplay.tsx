import React from 'react';
import { UserStats, XP_CONSTANTS } from '../../types/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Trophy, Flame, Star } from 'lucide-react';

interface ProgressDisplayProps {
  stats: UserStats;
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ stats }) => {
  const xpForNextLevel = Math.round(
    XP_CONSTANTS.LEVEL_UP_THRESHOLD * Math.pow(XP_CONSTANTS.LEVEL_MULTIPLIER, stats.level - 1)
  );
  const xpProgress = (stats.xp % xpForNextLevel) / xpForNextLevel * 100;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Level</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.level}</div>
          <Progress value={xpProgress} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.xp % xpForNextLevel} / {xpForNextLevel} XP to next level
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.streak.current} days</div>
          <p className="text-xs text-muted-foreground mt-2">
            Longest streak: {stats.streak.longest} days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Achievements</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.achievements.length}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {stats.achievements.map((achievement) => (
              <Badge key={achievement.id} variant="secondary">
                {achievement.icon} {achievement.title}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 