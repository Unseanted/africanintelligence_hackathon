import React from 'react';
import { Achievement } from '../../types/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Lock, Unlock } from 'lucide-react';

interface AchievementsDisplayProps {
  achievements: Achievement[];
  userProgress: {
    streak: number;
    completedLessons: number;
    totalXP: number;
  };
}

export const AchievementsDisplay: React.FC<AchievementsDisplayProps> = ({
  achievements,
  userProgress,
}) => {
  const calculateProgress = (achievement: Achievement): number => {
    const { type, value } = achievement.requirements;

    switch (type) {
      case 'streak':
        return Math.min((userProgress.streak / value) * 100, 100);
      case 'completion':
        return Math.min((userProgress.completedLessons / value) * 100, 100);
      case 'mastery':
        return Math.min((userProgress.totalXP / value) * 100, 100);
      default:
        return 0;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => {
            const progress = calculateProgress(achievement);
            const isUnlocked = achievement.unlockedAt !== null;

            return (
              <Card key={achievement.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {achievement.icon} {achievement.title}
                    </CardTitle>
                    {isUnlocked ? (
                      <Unlock className="h-5 w-5 text-green-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {Math.round(progress)}% Complete
                      </span>
                      <Badge variant="secondary">
                        +{achievement.xpReward} XP
                      </Badge>
                    </div>
                  </div>
                  {isUnlocked && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Unlocked on{' '}
                      {achievement.unlockedAt?.toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}; 