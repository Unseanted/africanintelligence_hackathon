import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Trophy, 
  Zap, 
  CheckCircle, 
  Clock, 
  BarChart2, 
  Award, 
  Users,
  HeartPulse,
  Footprints,
  Droplets,
  ChevronLeft,
  RotateCcw,
  Code,
  PenTool,
  Target,
  Gift,
    Crown,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { useToast } from '../../hooks/use-toast';
import { Card } from '../../components/ui/card';

const CompetitionPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get competition data from navigation state or fallback to mock data
  const [competition, setCompetition] = useState(state?.competition || null);
  const [userStats, setUserStats] = useState(state?.userStats || {
    totalParticipants: 0,
    currentRank: null,
    pointsEarned: 0
  });
  const [leaderboard, setLeaderboard] = useState(state?.leaderboard || []);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isJoined, setIsJoined] = useState(true); // Assume user joined since they're on this page

  // If no competition in state, load mock data based on ID
  useEffect(() => {
    if (!competition) {
      const mockCompetition = getMockCompetition(id);
      if (mockCompetition) {
        setCompetition(mockCompetition);
        setUserStats(getMockUserStats(id));
        setLeaderboard(getMockLeaderboard(id));
      }
    }
  }, [id, competition]);

  // Timer for competition countdown
  useEffect(() => {
    if (competition) {
      const timer = setInterval(() => {
        const now = Date.now();
        const endTime = new Date(competition.endTime).getTime();
        const remaining = endTime - now;
        
        if (remaining <= 0) {
          setTimeLeft(null);
          clearInterval(timer);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [competition]);

  // Simulate real-time updates
  useEffect(() => {
    if (!competition) return;
    
    const interval = setInterval(() => {
      // Update user stats
      setUserStats(prev => {
        const newPoints = prev.pointsEarned + Math.floor(Math.random() * 20);
        return {
          ...prev,
          pointsEarned: newPoints,
          currentRank: calculateRank(newPoints, leaderboard)
        };
      });
      
      // Update leaderboard
      setLeaderboard(prev => 
        prev.map(player => ({
          ...player,
          points: player.name === 'You' 
            ? userStats.pointsEarned
            : player.points + Math.floor(Math.random() * 15)
        })).sort((a, b) => b.points - a.points)
        .map((player, index) => ({
          ...player,
          rank: index + 1
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [competition, userStats.pointsEarned, leaderboard]);

  const calculateRank = (points, board) => {
    const sorted = [...board].sort((a, b) => b.points - a.points);
    const youIndex = sorted.findIndex(p => p.name === 'You');
    return youIndex >= 0 ? youIndex + 1 : null;
  };

  const formatTimeRemaining = (ms) => {
    if (!ms || ms <= 0) return '00:00:00';
    
    const hours = Math.floor(ms / (1000 * 60 * 60)).toString().padStart(2, '0');
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const seconds = Math.floor((ms % (1000 * 60)) / 1000).toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleManualUpdate = () => {
    toast({
      title: "Progress Updated!",
      description: "Your competition data has been refreshed.",
    });
  };

  const handleLeaveCompetition = () => {
    navigate('/student/challenges');
  };

  const getCompetitionIcon = () => {
    if (!competition) return <Trophy className="w-6 h-6" />;
    
    switch(competition.type) {
      case 'fitness': return <Zap className="w-6 h-6 text-green-500" />;
      case 'coding': return <Code className="w-6 h-6 text-blue-500" />;
      case 'creative': return <PenTool className="w-6 h-6 text-purple-500" />;
      default: return <Trophy className="w-6 h-6 text-amber-500" />;
    }
  };

  const renderCompetitionContent = () => {
    if (!competition) return <div>Loading competition data...</div>;
    
    switch(competition.type) {
      case 'fitness':
        return <FitnessCompetitionView 
                 competition={competition} 
                 userStats={userStats} 
                 leaderboard={leaderboard} 
               />;
      case 'coding':
        return <CodingCompetitionView 
                 competition={competition} 
                 userStats={userStats} 
                 leaderboard={leaderboard} 
               />;
      case 'creative':
        return <CreativeCompetitionView 
                 competition={competition} 
                 userStats={userStats} 
                 leaderboard={leaderboard} 
               />;
      default:
        return <DefaultCompetitionView 
                 competition={competition} 
                 userStats={userStats} 
                 leaderboard={leaderboard} 
               />;
    }
  };

  if (!competition) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold">Competition not found</h1>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={handleLeaveCompetition}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Competitions
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Competition Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={handleLeaveCompetition}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-4">
          <Badge variant="destructive" className="animate-pulse">
            <Flame className="w-4 h-4 mr-1" />
            LIVE
          </Badge>
          <div className="text-lg font-bold font-mono">
            {timeLeft ? formatTimeRemaining(timeLeft) : '00:00:00'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        {getCompetitionIcon()}
        <h1 className="text-3xl font-bold">{competition.title}</h1>
      </div>
      
      {/* Dynamic Competition Content */}
      {renderCompetitionContent()}
    </div>
  );
};

// Helper function to get mock competition data based on ID
const getMockCompetition = (id) => {
  const now = Date.now();
  const mockCompetitions = {
    'live-comp-1': {
      id: 'live-comp-1',
      title: 'Global Fitness Challenge',
      description: 'Complete as many fitness challenges as possible in 2 hours. Track workouts, steps, and healthy habits.',
      type: 'fitness',
      status: 'active',
      startTime: now - 45 * 60 * 1000,
      endTime: now + 75 * 60 * 1000,
      participants: 2847,
      prizePool: '$10,000',
      rewards: {
        first: '$5,000 + Fitness Equipment',
        second: '$2,500 + Supplements',
        third: '$1,500 + Gear',
        participation: '50 XP + Badge'
      },
      format: {
        type: 'multi-challenge',
        challenges: [
          {
            id: 'challenge-1',
            type: 'step-count',
            title: 'Daily Steps',
            target: 10000,
            points: 500
          },
          {
            id: 'challenge-2',
            type: 'workout-minutes',
            title: 'Workout Minutes',
            target: 60,
            points: 300
          },
          {
            id: 'challenge-3',
            type: 'hydration',
            title: 'Water Intake',
            target: 8,
            points: 200
          }
        ]
      }
    },
    'live-comp-2': {
      id: 'live-comp-2',
      title: 'AI Coding Marathon',
      description: 'Build an AI-powered application in 4 hours. Judged on creativity, functionality, and innovation.',
      type: 'coding',
      status: 'active',
      startTime: now - 60 * 60 * 1000,
      endTime: now + 3 * 60 * 60 * 1000,
      participants: 156,
      prizePool: '$25,000',
      rewards: {
        first: '$15,000 + Mentorship',
        second: '$7,500 + Course Access',
        third: '$2,500 + Tools',
        participation: '100 XP + Certificate'
      },
      format: {
        type: 'hackathon',
        submissionType: 'github-repo',
        judgingCriteria: ['creativity', 'functionality', 'innovation']
      }
    },
    'live-comp-3': {
      id: 'live-comp-3',
      title: 'Creative Writing Sprint',
      description: 'Write a compelling short story in 90 minutes. Theme will be revealed at start.',
      type: 'creative',
      status: 'active',
      startTime: now - 30 * 60 * 1000,
      endTime: now + 60 * 60 * 1000,
      participants: 89,
      prizePool: '$5,000',
      rewards: {
        first: '$2,500 + Publishing Deal',
        second: '$1,500 + Writing Course',
        third: '$1,000 + Books',
        participation: '75 XP + Badge'
      },
      format: {
        type: 'timed-writing',
        wordLimit: 2000,
        theme: 'The Unexpected Journey'
      }
    }
  };
  
  return mockCompetitions[id] || null;
};

const getMockUserStats = (id) => {
  const baseStats = {
    totalParticipants: 0,
    currentRank: null,
    pointsEarned: 0
  };
  
  const competitionStats = {
    'live-comp-1': {
      totalParticipants: 2847,
      currentRank: 6,
      pointsEarned: 2350
    },
    'live-comp-2': {
      totalParticipants: 156,
      currentRank: 12,
      pointsEarned: 850
    },
    'live-comp-3': {
      totalParticipants: 89,
      currentRank: 5,
      pointsEarned: 420
    }
  };
  
  return competitionStats[id] || baseStats;
};

const getMockLeaderboard = (id) => {
  const baseLeaders = [
    { rank: 1, name: 'Top Player', points: 1000, country: 'US', streak: 10 },
    { rank: 2, name: 'Second Place', points: 900, country: 'UK', streak: 8 },
    { rank: 3, name: 'Third Place', points: 800, country: 'CA', streak: 5 },
    { rank: 4, name: 'You', points: 700, country: 'US', streak: 3 }
  ];
  
  const competitionLeaders = {
    'live-comp-1': [
      { rank: 1, name: 'Alex Chen', points: 2850, country: 'USA', streak: 15 },
      { rank: 2, name: 'Maria Rodriguez', points: 2720, country: 'Spain', streak: 12 },
      { rank: 3, name: 'Yuki Tanaka', points: 2680, country: 'Japan', streak: 18 },
      { rank: 6, name: 'You', points: 2350, country: 'USA', streak: 8 }
    ],
    'live-comp-2': [
      { rank: 1, name: 'Sam Wilson', points: 1200, country: 'UK', streak: 7 },
      { rank: 2, name: 'Priya Patel', points: 1100, country: 'IN', streak: 5 },
      { rank: 3, name: 'Liam Johnson', points: 950, country: 'CA', streak: 4 },
      { rank: 12, name: 'You', points: 850, country: 'US', streak: 2 }
    ],
    'live-comp-3': [
      { rank: 1, name: 'Emma Davis', points: 650, country: 'UK', streak: 6 },
      { rank: 2, name: 'Carlos Mendez', points: 580, country: 'MX', streak: 4 },
      { rank: 3, name: 'Sophie Kim', points: 520, country: 'KR', streak: 5 },
      { rank: 5, name: 'You', points: 420, country: 'US', streak: 3 }
    ]
  };
  
  return competitionLeaders[id] || baseLeaders;
};

// Competition Type Views
const FitnessCompetitionView = ({ competition, userStats, leaderboard }) => {
  const [challenges, setChallenges] = useState(
    competition.format.challenges.map(challenge => ({
      ...challenge,
      current: Math.floor(Math.random() * challenge.target * 0.7),
      completed: false,
      progress: 0
    }))
  );

  useEffect(() => {
    setChallenges(prev => 
      prev.map(challenge => {
        const newCurrent = Math.min(
          challenge.current + Math.floor(Math.random() * 20), 
          challenge.target
        );
        const completed = newCurrent >= challenge.target;
        const progress = (newCurrent / challenge.target) * 100;
        
        return {
          ...challenge,
          current: newCurrent,
          completed,
          progress
        };
      })
    );
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Your Rank" 
          value={`#${userStats.currentRank}`} 
          icon={<Award className="w-6 h-6 text-yellow-500" />} 
        />
        <StatCard 
          title="Total Points" 
          value={userStats.pointsEarned} 
          icon={<Trophy className="w-6 h-6 text-amber-500" />} 
        />
        <StatCard 
          title="Participants" 
          value={competition.participants.toLocaleString()} 
          icon={<Users className="w-6 h-6 text-blue-500" />} 
        />
        <StatCard 
          title="Prize Pool" 
          value={competition.prizePool} 
          icon={<Gift className="w-6 h-6 text-green-500" />} 
        />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5" />
          Your Fitness Challenges
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {challenges.map((challenge) => (
            <ChallengeCard 
              key={challenge.id}
              challenge={challenge}
              icon={getChallengeIcon(challenge.type)}
            />
          ))}
        </div>
      </div>
      
      <LeaderboardSection leaderboard={leaderboard} />
      <PrizeSection competition={competition} />
    </>
  );
};

const CodingCompetitionView = ({ competition, userStats, leaderboard }) => {
  const [submission, setSubmission] = useState({
    repoUrl: '',
    description: '',
    submitted: false
  });

  const handleSubmit = () => {
    setSubmission(prev => ({
      ...prev,
      submitted: true
    }));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Your Rank" 
          value={`#${userStats.currentRank}`} 
          icon={<Award className="w-6 h-6 text-yellow-500" />} 
        />
        <StatCard 
          title="Time Left" 
          value="2:45:30" 
          icon={<Clock className="w-6 h-6 text-blue-500" />} 
        />
        <StatCard 
          title="Participants" 
          value={competition.participants.toLocaleString()} 
          icon={<Users className="w-6 h-6 text-purple-500" />} 
        />
        <StatCard 
          title="Prize Pool" 
          value={competition.prizePool} 
          icon={<Gift className="w-6 h-6 text-green-500" />} 
        />
      </div>
      
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Code className="w-5 h-5" />
          Submission Details
        </h2>
        
        {submission.submitted ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Submission Complete!</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              You've submitted your project for judging. Good luck!
            </p>
            <div className="text-sm">
              <span className="font-medium">Repo URL:</span> {submission.repoUrl}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Repository URL
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="https://github.com/yourusername/yourrepo"
                value={submission.repoUrl}
                onChange={(e) => setSubmission({...submission, repoUrl: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Description
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows="4"
                placeholder="Describe your project and its innovative features..."
                value={submission.description}
                onChange={(e) => setSubmission({...submission, description: e.target.value})}
              />
            </div>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Submit Project
            </Button>
          </div>
        )}
      </Card>
      
      <LeaderboardSection leaderboard={leaderboard} />
      <PrizeSection competition={competition} />
    </>
  );
};

const CreativeCompetitionView = ({ competition, userStats, leaderboard }) => {
  const [writing, setWriting] = useState({
    content: '',
    wordCount: 0,
    submitted: false
  });

  const handleContentChange = (e) => {
    const content = e.target.value;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWriting({ content, wordCount, submitted: false });
  };

  const handleSubmit = () => {
    setWriting(prev => ({ ...prev, submitted: true }));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Your Rank" 
          value={`#${userStats.currentRank}`} 
          icon={<Award className="w-6 h-6 text-yellow-500" />} 
        />
        <StatCard 
          title="Word Count" 
          value={`${writing.wordCount}/${competition.format.wordLimit}`} 
          icon={<PenTool className="w-6 h-6 text-purple-500" />} 
        />
        <StatCard 
          title="Participants" 
          value={competition.participants.toLocaleString()} 
          icon={<Users className="w-6 h-6 text-blue-500" />} 
        />
        <StatCard 
          title="Prize Pool" 
          value={competition.prizePool} 
          icon={<Gift className="w-6 h-6 text-green-500" />} 
        />
      </div>
      
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Writing Challenge
        </h2>
        
        <div className="mb-4">
          <h3 className="font-medium">Theme: {competition.format.theme}</h3>
          <p className="text-sm text-gray-600">Word limit: {competition.format.wordLimit} words</p>
        </div>
        
        {writing.submitted ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Submission Complete!</span>
            </div>
            <p className="text-sm text-gray-700">
              Your story has been submitted for judging. Good luck!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              className="w-full p-3 border rounded-md min-h-[300px]"
              placeholder="Write your story here..."
              value={writing.content}
              onChange={handleContentChange}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {writing.wordCount} / {competition.format.wordLimit} words
              </div>
              
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleSubmit}
                disabled={writing.wordCount < 100} // Minimum 100 words
              >
                Submit Story
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      <LeaderboardSection leaderboard={leaderboard} />
      <PrizeSection competition={competition} />
    </>
  );
};

const DefaultCompetitionView = ({ competition, userStats, leaderboard }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Your Rank" 
          value={`#${userStats.currentRank}`} 
          icon={<Award className="w-6 h-6 text-yellow-500" />} 
        />
        <StatCard 
          title="Total Points" 
          value={userStats.pointsEarned} 
          icon={<Trophy className="w-6 h-6 text-amber-500" />} 
        />
        <StatCard 
          title="Participants" 
          value={competition.participants.toLocaleString()} 
          icon={<Users className="w-6 h-6 text-blue-500" />} 
        />
        <StatCard 
          title="Prize Pool" 
          value={competition.prizePool} 
          icon={<Gift className="w-6 h-6 text-green-500" />} 
        />
      </div>
      
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Competition Details
        </h2>
        <p className="text-gray-700">{competition.description}</p>
      </Card>
      
      <LeaderboardSection leaderboard={leaderboard} />
      <PrizeSection competition={competition} />
    </>
  );
};

// Reusable Components
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg border shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      {icon}
    </div>
  </div>
);

const ChallengeCard = ({ challenge, icon }) => (
  <div className={`p-4 rounded-lg border ${challenge.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-medium">{challenge.title}</h3>
      </div>
      {challenge.completed ? (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      ) : (
        <Badge variant="outline">
          {challenge.current}/{challenge.target}
        </Badge>
      )}
    </div>
    
    <Progress value={challenge.progress} className="h-2 mb-3" />
    
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">
        {challenge.points} pts
      </span>
      <span className={`font-medium ${challenge.completed ? 'text-green-600' : 'text-amber-600'}`}>
        {challenge.completed ? 'Reward unlocked!' : `${Math.floor(challenge.progress)}% complete`}
      </span>
    </div>
  </div>
);

const LeaderboardSection = ({ leaderboard }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
      <Trophy className="w-5 h-5" />
      Live Leaderboard
    </h2>
    
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="grid grid-cols-12 bg-gray-50 p-3 border-b font-medium text-sm text-gray-600">
        <div className="col-span-1">Rank</div>
        <div className="col-span-6">Player</div>
        <div className="col-span-3">Points</div>
        <div className="col-span-2">Streak</div>
      </div>
      
      {leaderboard.slice(0, 10).map((player) => (
        <div 
          key={player.rank}
          className={`grid grid-cols-12 p-3 border-b items-center ${
            player.name === 'You' ? 'bg-blue-50 font-medium' : ''
          }`}
        >
          <div className="col-span-1 font-bold">#{player.rank}</div>
          <div className="col-span-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {player.name.charAt(0)}
            </div>
            <div>
              <div>{player.name}</div>
              <div className="text-xs text-gray-500">{player.country}</div>
            </div>
          </div>
          <div className="col-span-3 font-mono">{player.points}</div>
          <div className="col-span-2 flex items-center gap-1">
            <Flame className="w-4 h-4 text-red-500" />
            {player.streak}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PrizeSection = ({ competition }) => (
  <div className="p-6 bg-amber-50 rounded-lg border border-amber-200">
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
      <Trophy className="w-5 h-5 text-amber-600" />
      Prize Information
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PrizeCard 
        place="1st Place" 
        description="Winner" 
        reward={competition.rewards.first} 
        icon={<Crown className="w-5 h-5 text-yellow-500" />}
      />
      <PrizeCard 
        place="2nd Place" 
        description="Runner-up" 
        reward={competition.rewards.second} 
        icon={<Award className="w-5 h-5 text-gray-500" />}
      />
      <PrizeCard 
        place="3rd Place" 
        description="Third" 
        reward={competition.rewards.third} 
        icon={<Award className="w-5 h-5 text-amber-700" />}
      />
    </div>
  </div>
);

const PrizeCard = ({ place, description, reward, icon }) => (
  <div className="bg-white p-4 rounded-lg border">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <h3 className="font-semibold">{place}</h3>
    </div>
    <p className="text-gray-700">{reward}</p>
  </div>
);

const getChallengeIcon = (type) => {
  switch(type) {
    case 'step-count': return <Footprints className="w-5 h-5 text-green-500" />;
    case 'workout-minutes': return <HeartPulse className="w-5 h-5 text-red-500" />;
    case 'hydration': return <Droplets className="w-5 h-5 text-blue-500" />;
    default: return <Target className="w-5 h-5 text-gray-500" />;
  }
};

export default CompetitionPage;