import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSocket } from '@/services/socketService';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { Trophy, Users, Clock, Star, Award, Target, Zap } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { socketService } from '@/services/socketService';

interface Score {
  userId: string;
  username: string;
  score: number;
  role: string;
  teamId?: string;
  achievements?: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
}

interface TeamScore {
  teamId: string;
  teamName: string;
  score: number;
  members: string[];
}

interface ScoringSystemProps {
  challengeId: string;
  duration: number;
  onComplete?: () => void;
}

const ScoringSystem: React.FC<ScoringSystemProps> = ({
  challengeId,
  duration,
  onComplete
}) => {
  const socket = useSocket();
  const { user } = useTourLMS();
  const [timeLeft, setTimeLeft] = useState(duration);
  const [scores, setScores] = useState<Score[]>([]);
  const [teamScores, setTeamScores] = useState<TeamScore[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('score:update', (data: Score) => {
      setScores(prev => {
        const index = prev.findIndex(s => s.userId === data.userId);
        if (index >= 0) {
          const newScores = [...prev];
          newScores[index] = data;
          return newScores;
        }
        return [...prev, data];
      });
    });

    socket.on('leaderboard:update', (data: Score[]) => {
      setScores(data);
    });

    socket.on('team:update', (data: TeamScore) => {
      setTeamScores(prev => {
        const index = prev.findIndex(t => t.teamId === data.teamId);
        if (index >= 0) {
          const newScores = [...prev];
          newScores[index] = data;
          return newScores;
        }
        return [...prev, data];
      });
    });

    socket.on('achievement:unlocked', (achievement: Achievement) => {
      setAchievements(prev => [...prev, achievement]);
      toast({
        title: "Achievement Unlocked! 🎉",
        description: `${achievement.name} - ${achievement.description}`,
      });
    });

    return () => {
      socket.off('score:update');
      socket.off('leaderboard:update');
      socket.off('team:update');
      socket.off('achievement:unlocked');
    };
  }, [socket]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsActive(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleScoreUpdate = (score: number, challengeId: string) => {
    if (user?.role === 'facilitator' || user?.role === 'admin') {
      socketService.updateScore(score, challengeId);
    } else {
      toast({
        title: "Permission Denied",
        description: "Only facilitators or admins can score students.",
        variant: "destructive",
      });
    }
  };

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'trophy': return <Trophy className="h-4 w-4" />;
      case 'star': return <Star className="h-4 w-4" />;
      case 'target': return <Target className="h-4 w-4" />;
      case 'zap': return <Zap className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Challenge Progress</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(timeLeft / duration) * 100} className="h-2" />
        </CardContent>
      </Card>

      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {getAchievementIcon(achievement.icon)}
                  </div>
                  <div>
                    <h4 className="font-medium">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <Badge variant="secondary" className="mt-1">+{achievement.points} points</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Individual Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scores
              .sort((a, b) => b.score - a.score)
              .map((score, index) => (
                <div key={score.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{score.username}</span>
                    <Badge variant="secondary">{score.role}</Badge>
                    {score.achievements?.length > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {score.achievements.length}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(score.score / Math.max(...scores.map(s => s.score))) * 100}
                      className={`h-2 w-32 ${getProgressColor(score.score, Math.max(...scores.map(s => s.score)))}`}
                    />
                    <span className="font-bold">{score.score}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {teamScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamScores
                .sort((a, b) => b.score - a.score)
                .map((team, index) => (
                  <div key={team.teamId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{team.teamName}</span>
                      <Badge variant="secondary">
                        {team.members.length} members
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(team.score / Math.max(...teamScores.map(t => t.score))) * 100}
                        className={`h-2 w-32 ${getProgressColor(team.score, Math.max(...teamScores.map(t => t.score)))}`}
                      />
                      <span className="font-bold">{team.score}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScoringSystem; 