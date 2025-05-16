import React from 'react';
import { Achievement } from '../../types/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const renderAchievement = (achievement: Achievement) => {
    const isUnlocked = achievement.unlockedAt !== null;
    const progress = (achievement.progress / achievement.target) * 100;

    return (
      <div
        key={achievement.id}
        className={`p-4 rounded-lg border ${
          isUnlocked ? 'bg-muted/50' : 'bg-background'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{achievement.icon}</span>
            <div>
              <h3 className="font-medium">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
            </div>
          </div>
          {isUnlocked && (
            <Badge variant="secondary" className="ml-2">
              +{achievement.xpReward} XP
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>
              {achievement.progress}/{achievement.target}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {isUnlocked && (
          <p className="text-xs text-muted-foreground mt-2">
            Unlocked on{' '}
            {achievement.unlockedAt?.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {achievements.map(renderAchievement)}
        </div>
      </CardContent>
    </Card>
  );
}; 