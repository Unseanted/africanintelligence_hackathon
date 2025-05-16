import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import WebSocketService from '@/services/websocket';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { Loader2, Users, Trophy, Clock } from 'lucide-react';

interface ChallengeInterfaceProps {
  challengeId: string;
  teamId: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface ChallengeUpdate {
  type: string;
  endTime?: number;
  challenge?: any;
  score?: number;
  rankings?: Array<{ teamId: string; score: number }>;
}

const ChallengeInterface: React.FC<ChallengeInterfaceProps> = ({ challengeId, teamId }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [rankings, setRankings] = useState<Array<{ teamId: string; score: number }>>([]);
  const { token } = useTourLMS();
  const { toast } = useToast();
  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    if (!token) return;

    // Initialize WebSocket connection
    wsService.initialize(token);

    // Join team room
    wsService.joinTeam(teamId);

    // Set up event listeners
    wsService.onTeamUpdate((data) => {
      if (data.type === 'member_joined') {
        setTeamMembers(prev => [...prev, { id: data.userId, name: data.userName, role: 'member' }]);
      }
    });

    wsService.onChallengeUpdate((data: ChallengeUpdate) => {
      handleChallengeUpdate(data);
    });

    wsService.onLeaderboardUpdate((data) => {
      setRankings(prev => {
        const newRankings = [...prev];
        const index = newRankings.findIndex(r => r.teamId === data.teamId);
        if (index >= 0) {
          newRankings[index].score = data.score;
        } else {
          newRankings.push({ teamId: data.teamId, score: data.score });
        }
        return newRankings.sort((a, b) => b.score - a.score);
      });
    });

    // Start challenge
    wsService.startChallenge(challengeId);

    return () => {
      wsService.disconnect();
    };
  }, [token, teamId, challengeId]);

  const handleChallengeUpdate = (data: ChallengeUpdate) => {
    switch (data.type) {
      case 'started':
        setIsActive(true);
        if (data.endTime) {
          const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, data.endTime! - now);
            setTimeLeft(remaining);
            if (remaining > 0) {
              setTimeout(updateTimer, 1000);
            } else {
              setIsActive(false);
            }
          };
          updateTimer();
        }
        break;
      case 'solution_submitted':
        if (data.score) {
          setCurrentScore(data.score);
          toast({
            title: 'Solution Submitted',
            description: `Your solution scored ${data.score} points!`,
          });
        }
        break;
      case 'ended':
        setIsActive(false);
        if (data.rankings) {
          setRankings(data.rankings);
        }
        break;
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Challenge Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Challenge in Progress</h2>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-lg font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <Progress value={(timeLeft / (60 * 60 * 1000)) * 100} className="h-2" />
      </Card>

      {/* Team Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h3 className="text-xl font-semibold">Team Members</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map(member => (
            <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {member.name[0]}
              </div>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5" />
          <h3 className="text-xl font-semibold">Leaderboard</h3>
        </div>
        <div className="space-y-2">
          {rankings.map((rank, index) => (
            <div key={rank.teamId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-bold">{index + 1}</span>
                <span>Team {rank.teamId}</span>
              </div>
              <span className="font-medium">{rank.score} points</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Current Score */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Your Team's Score</h3>
          <p className="text-4xl font-bold text-red-600">{currentScore}</p>
        </div>
      </Card>
    </div>
  );
};

export default ChallengeInterface; 