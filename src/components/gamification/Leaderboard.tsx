import React, { useState, useEffect } from 'react';
import { Leaderboard as LeaderboardType, LeaderboardEntry } from '../../types/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface LeaderboardProps {
  courseId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ courseId }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'course' | 'weekly'>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardType | null>(null);

  useEffect(() => {
    // Fetch leaderboard data based on active tab
    fetchLeaderboardData(activeTab);
  }, [activeTab, courseId]);

  const fetchLeaderboardData = async (type: 'global' | 'course' | 'weekly') => {
    // TODO: Implement API call to fetch leaderboard data
    // For now, using mock data
    const mockData: LeaderboardType = {
      id: '1',
      type,
      courseId: type === 'course' ? courseId : undefined,
      entries: [
        {
          userId: '1',
          username: 'John Doe',
          avatarUrl: 'https://github.com/shadcn.png',
          xp: 1500,
          streak: 7,
          achievements: 5,
          rank: 1,
        },
        // Add more mock entries
      ],
      lastUpdated: new Date(),
    };
    setLeaderboard(mockData);
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry) => (
    <div
      key={entry.userId}
      className="flex items-center justify-between p-4 border-b last:border-b-0"
    >
      <div className="flex items-center space-x-4">
        <span className="text-lg font-bold w-8">{entry.rank}</span>
        <Avatar>
          <AvatarImage src={entry.avatarUrl} />
          <AvatarFallback>{entry.username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{entry.username}</p>
          <div className="flex space-x-2">
            <Badge variant="secondary">{entry.xp} XP</Badge>
            <Badge variant="outline">{entry.streak} 🔥</Badge>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">
          {entry.achievements} Achievements
        </p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="course">Course</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {leaderboard?.entries.map(renderLeaderboardEntry)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 