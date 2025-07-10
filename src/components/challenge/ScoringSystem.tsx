import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSocket } from '@/services/socketService';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { Trophy, Users, Clock, Star, Award, Target, Zap } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

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
  timestamp?: number;
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

// Memoized components for better performance
const AchievementBadge = React.memo(({ achievement }: { achievement: Achievement }) => {
  const getAchievementIcon = useCallback((icon: string) => {
    switch (icon) {
      case 'trophy': return <Trophy className="h-4 w-4" />;
      case 'star': return <Star className="h-4 w-4" />;
      case 'target': return <Target className="h-4 w-4" />;
      case 'zap': return <Zap className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  }, []);

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="p-2 bg-primary/10 rounded-full">
        {getAchievementIcon(achievement.icon)}
      </div>
      <div>
        <h4 className="font-medium">{achievement.name}</h4>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
        <Badge variant="secondary" className="mt-1">+{achievement.points} points</Badge>
      </div>
    </div>
  );
});

const ScoreRow = React.memo(({ 
  score, 
  index, 
  maxScore 
}: { 
  score: Score, 
  index: number, 
  maxScore: number 
}) => {
  const progressColor = useCallback((score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }, []);

  return (
    <div className="flex items-center justify-between">
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
          value={(score.score / maxScore) * 100}
          className={`h-2 w-32 ${progressColor(score.score, maxScore)}`}
        />
        <span className="font-bold">{score.score}</span>
      </div>
    </div>
  );
});

const TeamScoreRow = React.memo(({ 
  team, 
  index, 
  maxScore 
}: { 
  team: TeamScore, 
  index: number, 
  maxScore: number 
}) => {
  const progressColor = useCallback((score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }, []);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{index + 1}</Badge>
        <span className="font-medium">{team.teamName}</span>
        <Badge variant="secondary">
          {team.members.length} members
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Progress
          value={(team.score / maxScore) * 100}
          className={`h-2 w-32 ${progressColor(team.score, maxScore)}`}
        />
        <span className="font-bold">{team.score}</span>
      </div>
    </div>
  );
});

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

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Handle score updates
  const handleScoreUpdate = useCallback((score: number, challengeId: string) => {
    if (user?.role === 'facilitator' || user?.role === 'admin') {
      socket?.emit('score:update', { score, challengeId });
    } else {
      toast({
        title: "Permission Denied",
        description: "Only facilitators or admins can score students.",
        variant: "destructive",
      });
    }
  }, [socket, user?.role]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleScoreUpdate = (data: Score) => {
      setScores(prev => {
        const existingIndex = prev.findIndex(s => s.userId === data.userId);
        if (existingIndex >= 0) {
          const newScores = [...prev];
          newScores[existingIndex] = data;
          return newScores;
        }
        return [...prev, data];
      });
    };

    const handleLeaderboardUpdate = (data: Score[]) => {
      setScores(data);
    };

    const handleTeamUpdate = (data: TeamScore) => {
      setTeamScores(prev => {
        const existingIndex = prev.findIndex(t => t.teamId === data.teamId);
        if (existingIndex >= 0) {
          const newScores = [...prev];
          newScores[existingIndex] = data;
          return newScores;
        }
        return [...prev, data];
      });
    };

    const handleAchievementUnlocked = (achievement: Achievement) => {
      setAchievements(prev => {
        // Prevent duplicates and limit to 5 most recent
        const exists = prev.some(a => a.id === achievement.id);
        if (exists) return prev;
        
        const newAchievements = [{ ...achievement, timestamp: Date.now() }, ...prev];
        return newAchievements.slice(0, 5); // Keep only 5 most recent
      });
      
      toast({
        title: "Achievement Unlocked! 🎉",
        description: `${achievement.name} - ${achievement.description}`,
      });
    };

    socket.on('score:update', handleScoreUpdate);
    socket.on('leaderboard:update', handleLeaderboardUpdate);
    socket.on('team:update', handleTeamUpdate);
    socket.on('achievement:unlocked', handleAchievementUnlocked);

    // Initial data fetch
    socket.emit('leaderboard:request', challengeId);
    socket.emit('teams:request', challengeId);

    return () => {
      socket.off('score:update', handleScoreUpdate);
      socket.off('leaderboard:update', handleLeaderboardUpdate);
      socket.off('team:update', handleTeamUpdate);
      socket.off('achievement:unlocked', handleAchievementUnlocked);
    };
  }, [socket, challengeId]);

  // Timer logic
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

  // Calculate max scores for progress bars
  const maxIndividualScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 1;
  const maxTeamScore = teamScores.length > 0 ? Math.max(...teamScores.map(t => t.score)) : 1;

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
                <AchievementBadge key={achievement.id} achievement={achievement} />
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
                <ScoreRow 
                  key={score.userId} 
                  score={score} 
                  index={index} 
                  maxScore={maxIndividualScore} 
                />
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
                  <TeamScoreRow 
                    key={team.teamId} 
                    team={team} 
                    index={index} 
                    maxScore={maxTeamScore} 
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default React.memo(ScoringSystem);