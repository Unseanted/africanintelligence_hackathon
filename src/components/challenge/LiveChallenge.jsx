// import React, { useState, useEffect } from 'react';
// import { Card } from '../ui/card';
// import { Button } from '../ui/button';
// import { Badge } from '../ui/badge';
// import { 
//   Trophy, 
//   Users, 
//   Clock, 
//   Zap, 
//   Crown, 
//   Medal, 
//   Star,
//   Flame,
//   Target,
//   Timer,
//   Gift,
//   Sparkles,
//   TrendingUp,
//   Award,
//   ChevronRight,
//   Play,
//   Pause,
//   RotateCcw
// } from 'lucide-react';
// import { useToast } from '../../hooks/use-toast';

// const LiveCompetition = ({ userStats, onJoinCompetition }) => {
//   const [activeCompetitions, setActiveCompetitions] = useState([]);
//   const [upcomingCompetitions, setUpcomingCompetitions] = useState([]);
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [currentCompetition, setCurrentCompetition] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(null);
//   const [isJoined, setIsJoined] = useState(false);
//   const [liveStats, setLiveStats] = useState({
//     totalParticipants: 0,
//     currentRank: null,
//     pointsEarned: 0
//   });
//   const { toast } = useToast();

//   // Initialize with mock data and real-time updates
//   useEffect(() => {
//     generateLiveCompetitions();
    
//     // Update every 30 seconds
//     const interval = setInterval(() => {
//       updateLiveStats();
//       updateLeaderboard();
//     }, 30000);

//     return () => clearInterval(interval);
//   }, []);

//   // Timer for active competition
//   useEffect(() => {
//     if (currentCompetition && currentCompetition.status === 'active') {
//       const timer = setInterval(() => {
//         const now = Date.now();
//         const endTime = new Date(currentCompetition.endTime).getTime();
//         const remaining = endTime - now;
        
//         if (remaining <= 0) {
//           setTimeLeft(null);
//           setCurrentCompetition(prev => prev ? { ...prev, status: 'ended' } : null);
//         } else {
//           setTimeLeft(remaining);
//         }
//       }, 1000);

//       return () => clearInterval(timer);
//     }
//   }, [currentCompetition]);

//   const generateLiveCompetitions = () => {
//     const now = Date.now();
    
//     // Active competition
//     const active = {
//       id: 'live-comp-1',
//       title: 'Global Fitness Challenge',
//       description: 'Complete as many fitness challenges as possible in 2 hours. Track workouts, steps, and healthy habits.',
//       type: 'fitness',
//       status: 'active',
//       startTime: now - 45 * 60 * 1000, // Started 45 minutes ago
//       endTime: now + 75 * 60 * 1000, // Ends in 75 minutes
//       participants: 2847,
//       maxParticipants: 5000,
//       prizePool: '$10,000',
//       entryFee: 'Free',
//       difficulty: 'Intermediate',
//       categories: ['health', 'fitness', 'wellness'],
//       rewards: {
//         first: '$5,000 + Fitness Equipment',
//         second: '$2,500 + Supplements',
//         third: '$1,500 + Gear',
//         participation: '50 XP + Badge'
//       }
//     };

//     const upcoming = [
//       {
//         id: 'live-comp-2',
//         title: 'AI Coding Marathon',
//         description: 'Build an AI-powered application in 4 hours. Judged on creativity, functionality, and innovation.',
//         type: 'coding',
//         status: 'upcoming',
//         startTime: now + 2 * 60 * 60 * 1000, // Starts in 2 hours
//         endTime: now + 6 * 60 * 60 * 1000, // 4 hour duration
//         participants: 156,
//         maxParticipants: 1000,
//         prizePool: '$25,000',
//         entryFee: '$50',
//         difficulty: 'Advanced',
//         categories: ['coding', 'ai', 'innovation'],
//         rewards: {
//           first: '$15,000 + Mentorship',
//           second: '$7,500 + Course Access',
//           third: '$2,500 + Tools',
//           participation: '100 XP + Certificate'
//         }
//       },
//       {
//         id: 'live-comp-3',
//         title: 'Creative Writing Sprint',
//         description: 'Write a compelling short story in 90 minutes. Theme will be revealed at start.',
//         type: 'creative',
//         status: 'upcoming',
//         startTime: now + 24 * 60 * 60 * 1000, // Tomorrow
//         endTime: now + 24 * 60 * 60 * 1000 + 90 * 60 * 1000,
//         participants: 89,
//         maxParticipants: 500,
//         prizePool: '$5,000',
//         entryFee: 'Free',
//         difficulty: 'Beginner',
//         categories: ['writing', 'creativity', 'storytelling'],
//         rewards: {
//           first: '$2,500 + Publishing Deal',
//           second: '$1,500 + Writing Course',
//           third: '$1,000 + Books',
//           participation: '75 XP + Badge'
//         }
//       }
//     ];

//     setActiveCompetitions([active]);
//     setUpcomingCompetitions(upcoming);
//     setCurrentCompetition(active);

//     // Generate leaderboard
//     generateLeaderboard();
//   };

//   const generateLeaderboard = () => {
//     const leaders = [
//       { rank: 1, name: 'Alex Chen', avatar: '/avatars/alex.jpg', points: 2850, country: 'USA', streak: 15 },
//       { rank: 2, name: 'Maria Rodriguez', avatar: '/avatars/maria.jpg', points: 2720, country: 'Spain', streak: 12 },
//       { rank: 3, name: 'Yuki Tanaka', avatar: '/avatars/yuki.jpg', points: 2680, country: 'Japan', streak: 18 },
//       { rank: 4, name: 'David Kim', avatar: '/avatars/david.jpg', points: 2540, country: 'Korea', streak: 9 },
//       { rank: 5, name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', points: 2480, country: 'Canada', streak: 14 },
//       { rank: 6, name: 'You', avatar: '/avatars/current-user.jpg', points: 2350, country: 'USA', streak: 8 },
//       { rank: 7, name: 'Emma Wilson', avatar: '/avatars/emma.jpg', points: 2290, country: 'UK', streak: 11 },
//       { rank: 8, name: 'Lucas Silva', avatar: '/avatars/lucas.jpg', points: 2180, country: 'Brazil', streak: 7 }
//     ];

//     setLeaderboard(leaders);
//     setLiveStats({
//       totalParticipants: 2847,
//       currentRank: 6,
//       pointsEarned: 2350
//     });
//   };

//   const updateLiveStats = () => {
//     setLiveStats(prev => ({
//       ...prev,
//       totalParticipants: prev.totalParticipants + Math.floor(Math.random() * 10),
//       pointsEarned: isJoined ? prev.pointsEarned + Math.floor(Math.random() * 50) : prev.pointsEarned
//     }));
//   };

//   const updateLeaderboard = () => {
//     if (isJoined) {
//       setLeaderboard(prev => prev.map(player => ({
//         ...player,
//         points: player.name === 'You' 
//           ? player.points + Math.floor(Math.random() * 50)
//           : player.points + Math.floor(Math.random() * 30)
//       })).sort((a, b) => b.points - a.points).map((player, index) => ({
//         ...player,
//         rank: index + 1
//       })));
//     }
//   };

//   const handleJoinCompetition = (competitionId) => {
//     setIsJoined(true);
//     onJoinCompetition(competitionId);
//     toast({
//       title: "Competition Joined!",
//       description: "You're now competing live! Good luck!",
//     });
//   };

//   const formatTimeRemaining = (ms) => {
//     if (!ms || ms <= 0) return 'Ended';
    
//     const hours = Math.floor(ms / (1000 * 60 * 60));
//     const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
//     if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
//     if (minutes > 0) return `${minutes}m ${seconds}s`;
//     return `${seconds}s`;
//   };

//   const getCompetitionIcon = (type) => {
//     switch (type) {
//       case 'fitness': return <Zap className="w-5 h-5 text-green-500" />;
//       case 'coding': return <Target className="w-5 h-5 text-blue-500" />;
//       case 'creative': return <Sparkles className="w-5 h-5 text-purple-500" />;
//       default: return <Trophy className="w-5 h-5 text-amber-500" />;
//     }
//   };

//   const getRankIcon = (rank) => {
//     switch (rank) {
//       case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
//       case 2: return <Medal className="w-5 h-5 text-gray-400" />;
//       case 3: return <Award className="w-5 h-5 text-amber-600" />;
//       default: return <Star className="w-4 h-4 text-gray-400" />;
//     }
//   };

//   return (
//     <div className="space-y-8">
//       {/* Live Competition Header */}
//       <div className="text-center">
//         <div className="flex items-center justify-center gap-3 mb-4">
//           <div className="relative">
//             <Flame className="w-8 h-8 text-red-500 animate-pulse" />
//             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900">Live Competition</h2>
//         </div>
//         <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//           Compete with thousands of players worldwide in real-time challenges for amazing prizes!
//         </p>
//       </div>

//       {/* Active Competition */}
//       {currentCompetition && (
//         <Card className="p-8 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-2 border-red-200">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-3">
//               <div className="relative">
//                 {getCompetitionIcon(currentCompetition.type)}
//                 <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
//               </div>
//               <div>
//                 <h3 className="text-2xl font-bold text-gray-900">{currentCompetition.title}</h3>
//                 <div className="flex items-center gap-4 mt-1">
//                   <Badge variant="destructive" className="animate-pulse">
//                     <Play className="w-3 h-3 mr-1" />
//                     LIVE NOW
//                   </Badge>
//                   <span className="text-sm text-gray-600">
//                     {currentCompetition.participants.toLocaleString()} participants
//                   </span>
//                 </div>
//               </div>
//             </div>
            
//             {timeLeft && (
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-red-600 font-mono">
//                   {formatTimeRemaining(timeLeft)}
//                 </div>
//                 <div className="text-sm text-gray-600">Time Remaining</div>
//               </div>
//             )}
//           </div>

//           <p className="text-gray-700 mb-6">{currentCompetition.description}</p>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//             <div className="text-center p-4 bg-white rounded-lg border">
//               <Gift className="w-6 h-6 text-green-500 mx-auto mb-2" />
//               <div className="font-bold text-lg">{currentCompetition.prizePool}</div>
//               <div className="text-sm text-gray-600">Prize Pool</div>
//             </div>
//             <div className="text-center p-4 bg-white rounded-lg border">
//               <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
//               <div className="font-bold text-lg">{currentCompetition.participants.toLocaleString()}</div>
//               <div className="text-sm text-gray-600">Participants</div>
//             </div>
//             <div className="text-center p-4 bg-white rounded-lg border">
//               <Target className="w-6 h-6 text-purple-500 mx-auto mb-2" />
//               <div className="font-bold text-lg">{currentCompetition.difficulty}</div>
//               <div className="text-sm text-gray-600">Difficulty</div>
//             </div>
//             <div className="text-center p-4 bg-white rounded-lg border">
//               <Timer className="w-6 h-6 text-orange-500 mx-auto mb-2" />
//               <div className="font-bold text-lg">{currentCompetition.entryFee}</div>
//               <div className="text-sm text-gray-600">Entry Fee</div>
//             </div>
//           </div>

//           {!isJoined ? (
//             <div className="text-center">
//               <Button 
//                 size="lg" 
//                 className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
//                 onClick={() => handleJoinCompetition(currentCompetition.id)}
//               >
//                 <Flame className="w-5 h-5 mr-2" />
//                 Join Live Competition
//               </Button>
//             </div>
//           ) : (
//             <div className="bg-white rounded-lg p-6 border-2 border-green-200">
//               <div className="flex items-center justify-between mb-4">
//                 <h4 className="text-lg font-semibold text-green-800">You're Competing!</h4>
//                 <Badge variant="default" className="bg-green-600">
//                   Rank #{liveStats.currentRank}
//                 </Badge>
//               </div>
//               <div className="grid grid-cols-3 gap-4 text-center">
//                 <div>
//                   <div className="text-2xl font-bold text-green-600">{liveStats.pointsEarned}</div>
//                   <div className="text-sm text-gray-600">Points Earned</div>
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-blue-600">#{liveStats.currentRank}</div>
//                   <div className="text-sm text-gray-600">Current Rank</div>
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-purple-600">{liveStats.totalParticipants}</div>
//                   <div className="text-sm text-gray-600">Total Players</div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </Card>
//       )}

//       {/* Live Leaderboard */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <Card className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-xl font-semibold flex items-center gap-2">
//               <TrendingUp className="w-5 h-5 text-blue-500" />
//               Live Leaderboard
//             </h3>
//             <Badge variant="outline" className="animate-pulse">
//               <RotateCcw className="w-3 h-3 mr-1" />
//               Live Updates
//             </Badge>
//           </div>
          
//           <div className="space-y-3">
//             {leaderboard.slice(0, 8).map((player) => (
//               <div 
//                 key={player.rank}
//                 className={`flex items-center justify-between p-3 rounded-lg transition-all ${
//                   player.name === 'You' 
//                     ? 'bg-blue-50 border-2 border-blue-200' 
//                     : 'bg-gray-50 hover:bg-gray-100'
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="flex items-center gap-2">
//                     {getRankIcon(player.rank)}
//                     <span className="font-bold text-lg">#{player.rank}</span>
//                   </div>
//                   <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
//                     <span className="text-xs font-bold">
//                       {player.name.charAt(0)}
//                     </span>
//                   </div>
//                   <div>
//                     <div className="font-medium">{player.name}</div>
//                     <div className="text-xs text-gray-500">{player.country}</div>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className="font-bold">{player.points.toLocaleString()}</div>
//                   <div className="text-xs text-gray-500 flex items-center gap-1">
//                     <Flame className="w-3 h-3" />
//                     {player.streak} streak
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>

//         {/* Prize Breakdown */}
//         <Card className="p-6">
//           <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
//             <Gift className="w-5 h-5 text-amber-500" />
//             Prize Breakdown
//           </h3>
          
//           <div className="space-y-4">
//             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
//               <div className="flex items-center gap-3">
//                 <Crown className="w-6 h-6 text-yellow-500" />
//                 <div>
//                   <div className="font-bold">1st Place</div>
//                   <div className="text-sm text-gray-600">Winner</div>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="font-bold text-lg">{currentCompetition?.rewards.first}</div>
//               </div>
//             </div>
            
//             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
//               <div className="flex items-center gap-3">
//                 <Medal className="w-6 h-6 text-gray-400" />
//                 <div>
//                   <div className="font-bold">2nd Place</div>
//                   <div className="text-sm text-gray-600">Runner-up</div>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="font-bold text-lg">{currentCompetition?.rewards.second}</div>
//               </div>
//             </div>
            
//             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
//               <div className="flex items-center gap-3">
//                 <Award className="w-6 h-6 text-amber-600" />
//                 <div>
//                   <div className="font-bold">3rd Place</div>
//                   <div className="text-sm text-gray-600">Third</div>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="font-bold text-lg">{currentCompetition?.rewards.third}</div>
//               </div>
//             </div>
            
//             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
//               <div className="flex items-center gap-3">
//                 <Star className="w-6 h-6 text-blue-500" />
//                 <div>
//                   <div className="font-bold">All Participants</div>
//                   <div className="text-sm text-gray-600">Participation Reward</div>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="font-bold text-lg">{currentCompetition?.rewards.participation}</div>
//               </div>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Upcoming Competitions */}
//       <div>
//         <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//           <Clock className="w-6 h-6 text-blue-500" />
//           Upcoming Competitions
//         </h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {upcomingCompetitions.map((competition) => (
//             <Card key={competition.id} className="p-6 hover:shadow-lg transition-shadow">
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   {getCompetitionIcon(competition.type)}
//                   <div>
//                     <h4 className="text-lg font-semibold">{competition.title}</h4>
//                     <div className="flex items-center gap-2 mt-1">
//                       <Badge variant="outline">
//                         {new Date(competition.startTime).toLocaleDateString()}
//                       </Badge>
//                       <span className="text-sm text-gray-600">
//                         {competition.participants} registered
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <Badge variant="secondary">{competition.difficulty}</Badge>
//               </div>
              
//               <p className="text-gray-600 mb-4">{competition.description}</p>
              
//               <div className="flex items-center justify-between">
//                 <div className="text-sm text-gray-600">
//                   Prize: <span className="font-semibold text-green-600">{competition.prizePool}</span>
//                 </div>
//                 <Button variant="outline" size="sm">
//                   Register
//                   <ChevronRight className="w-4 h-4 ml-1" />
//                 </Button>
//               </div>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LiveCompetition; 


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Trophy, 
  Users, 
  Clock, 
  Zap, 
  Crown, 
  Medal, 
  Star,
  Flame,
  Target,
  Timer,
  Gift,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const LiveCompetition = ({ userStats }) => {
  const navigate = useNavigate();
  const [activeCompetitions, setActiveCompetitions] = useState([]);
  const [upcomingCompetitions, setUpcomingCompetitions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentCompetition, setCurrentCompetition] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [liveStats, setLiveStats] = useState({
    totalParticipants: 0,
    currentRank: null,
    pointsEarned: 0
  });
  const { toast } = useToast();

  // Initialize with mock data and real-time updates
  useEffect(() => {
    generateLiveCompetitions();
    
    // Update every 30 seconds
    const interval = setInterval(() => {
      updateLiveStats();
      updateLeaderboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Timer for active competition
  useEffect(() => {
    if (currentCompetition && currentCompetition.status === 'active') {
      const timer = setInterval(() => {
        const now = Date.now();
        const endTime = new Date(currentCompetition.endTime).getTime();
        const remaining = endTime - now;
        
        if (remaining <= 0) {
          setTimeLeft(null);
          setCurrentCompetition(prev => prev ? { ...prev, status: 'ended' } : null);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentCompetition]);

  const generateLiveCompetitions = () => {
    const now = Date.now();
    
    // Active competition
    const active = {
      id: 'live-comp-1',
      title: 'Global Fitness Challenge',
      description: 'Complete as many fitness challenges as possible in 2 hours. Track workouts, steps, and healthy habits.',
      type: 'fitness',
      status: 'active',
      startTime: now - 45 * 60 * 1000, // Started 45 minutes ago
      endTime: now + 75 * 60 * 1000, // Ends in 75 minutes
      participants: 2847,
      maxParticipants: 5000,
      prizePool: '$10,000',
      entryFee: 'Free',
      difficulty: 'Intermediate',
      categories: ['health', 'fitness', 'wellness'],
      rewards: {
        first: '$5,000 + Fitness Equipment',
        second: '$2,500 + Supplements',
        third: '$1,500 + Gear',
        participation: '50 XP + Badge'
      },
      // Added competition format details
      format: {
        type: 'multi-challenge',
        challenges: [
          {
            id: 'challenge-1',
            type: 'step-count',
            target: 10000,
            points: 500
          },
          {
            id: 'challenge-2',
            type: 'workout-minutes',
            target: 60,
            points: 300
          },
          {
            id: 'challenge-3',
            type: 'hydration',
            target: 8,
            points: 200
          }
        ]
      }
    };

    const upcoming = [
      {
        id: 'live-comp-2',
        title: 'AI Coding Marathon',
        description: 'Build an AI-powered application in 4 hours. Judged on creativity, functionality, and innovation.',
        type: 'coding',
        status: 'upcoming',
        startTime: now + 2 * 60 * 60 * 1000, // Starts in 2 hours
        endTime: now + 6 * 60 * 60 * 1000, // 4 hour duration
        participants: 156,
        maxParticipants: 1000,
        prizePool: '$25,000',
        entryFee: '$50',
        difficulty: 'Advanced',
        categories: ['coding', 'ai', 'innovation'],
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
      {
        id: 'live-comp-3',
        title: 'Creative Writing Sprint',
        description: 'Write a compelling short story in 90 minutes. Theme will be revealed at start.',
        type: 'creative',
        status: 'upcoming',
        startTime: now + 24 * 60 * 60 * 1000, // Tomorrow
        endTime: now + 24 * 60 * 60 * 1000 + 90 * 60 * 1000,
        participants: 89,
        maxParticipants: 500,
        prizePool: '$5,000',
        entryFee: 'Free',
        difficulty: 'Beginner',
        categories: ['writing', 'creativity', 'storytelling'],
        rewards: {
          first: '$2,500 + Publishing Deal',
          second: '$1,500 + Writing Course',
          third: '$1,000 + Books',
          participation: '75 XP + Badge'
        },
        format: {
          type: 'timed-writing',
          wordLimit: 2000,
          theme: 'random'
        }
      }
    ];

    setActiveCompetitions([active]);
    setUpcomingCompetitions(upcoming);
    setCurrentCompetition(active);

    // Generate leaderboard
    generateLeaderboard();
  };

  const generateLeaderboard = () => {
    const leaders = [
      { rank: 1, name: 'Alex Chen', avatar: '/avatars/alex.jpg', points: 2850, country: 'USA', streak: 15 },
      { rank: 2, name: 'Maria Rodriguez', avatar: '/avatars/maria.jpg', points: 2720, country: 'Spain', streak: 12 },
      { rank: 3, name: 'Yuki Tanaka', avatar: '/avatars/yuki.jpg', points: 2680, country: 'Japan', streak: 18 },
      { rank: 4, name: 'David Kim', avatar: '/avatars/david.jpg', points: 2540, country: 'Korea', streak: 9 },
      { rank: 5, name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', points: 2480, country: 'Canada', streak: 14 },
      { rank: 6, name: 'You', avatar: '/avatars/current-user.jpg', points: 2350, country: 'USA', streak: 8 },
      { rank: 7, name: 'Emma Wilson', avatar: '/avatars/emma.jpg', points: 2290, country: 'UK', streak: 11 },
      { rank: 8, name: 'Lucas Silva', avatar: '/avatars/lucas.jpg', points: 2180, country: 'Brazil', streak: 7 }
    ];

    setLeaderboard(leaders);
    setLiveStats({
      totalParticipants: 2847,
      currentRank: 6,
      pointsEarned: 2350
    });
  };

  const updateLiveStats = () => {
    setLiveStats(prev => ({
      ...prev,
      totalParticipants: prev.totalParticipants + Math.floor(Math.random() * 10),
      pointsEarned: isJoined ? prev.pointsEarned + Math.floor(Math.random() * 50) : prev.pointsEarned
    }));
  };

  const updateLeaderboard = () => {
    if (isJoined) {
      setLeaderboard(prev => prev.map(player => ({
        ...player,
        points: player.name === 'You' 
          ? player.points + Math.floor(Math.random() * 50)
          : player.points + Math.floor(Math.random() * 30)
      })).sort((a, b) => b.points - a.points).map((player, index) => ({
        ...player,
        rank: index + 1
      })));
    }
  };

  const handleJoinCompetition = (competitionId) => {
    setIsJoined(true);
    toast({
      title: "Competition Joined!",
      description: "You're now competing live! Good luck!",
    });
    
    // Navigate to the competition page
    navigate(`/student/competition/${competitionId}`, { 
      state: { 
        competition: currentCompetition,
        leaderboard,
        userStats: {
          ...liveStats,
          userId: 'current-user-id'
        }
      }
    });
  };

  const formatTimeRemaining = (ms) => {
    if (!ms || ms <= 0) return 'Ended';
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getCompetitionIcon = (type) => {
    switch (type) {
      case 'fitness': return <Zap className="w-5 h-5 text-green-500" />;
      case 'coding': return <Target className="w-5 h-5 text-blue-500" />;
      case 'creative': return <Sparkles className="w-5 h-5 text-purple-500" />;
      default: return <Trophy className="w-5 h-5 text-amber-500" />;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Live Competition Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Flame className="w-8 h-8 text-red-500 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Live Competition</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Compete with thousands of players worldwide in real-time challenges for amazing prizes!
        </p>
      </div>

      {/* Active Competition */}
      {currentCompetition && (
        <Card className="p-8 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-2 border-red-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                {getCompetitionIcon(currentCompetition.type)}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{currentCompetition.title}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <Badge variant="destructive" className="animate-pulse">
                    <Play className="w-3 h-3 mr-1" />
                    LIVE NOW
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {currentCompetition.participants.toLocaleString()} participants
                  </span>
                </div>
              </div>
            </div>
            
            {timeLeft && (
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 font-mono">
                  {formatTimeRemaining(timeLeft)}
                </div>
                <div className="text-sm text-gray-600">Time Remaining</div>
              </div>
            )}
          </div>

          <p className="text-gray-700 mb-6">{currentCompetition.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg border">
              <Gift className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="font-bold text-lg">{currentCompetition.prizePool}</div>
              <div className="text-sm text-gray-600">Prize Pool</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="font-bold text-lg">{currentCompetition.participants.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Participants</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Target className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="font-bold text-lg">{currentCompetition.difficulty}</div>
              <div className="text-sm text-gray-600">Difficulty</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Timer className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="font-bold text-lg">{currentCompetition.entryFee}</div>
              <div className="text-sm text-gray-600">Entry Fee</div>
            </div>
          </div>

          {!isJoined ? (
            <div className="text-center">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                onClick={() => handleJoinCompetition(currentCompetition.id)}
              >
                <Flame className="w-5 h-5 mr-2" />
                Join Live Competition
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-green-800">You're Competing!</h4>
                <Badge variant="default" className="bg-green-600">
                  Rank #{liveStats.currentRank}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{liveStats.pointsEarned}</div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">#{liveStats.currentRank}</div>
                  <div className="text-sm text-gray-600">Current Rank</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{liveStats.totalParticipants}</div>
                  <div className="text-sm text-gray-600">Total Players</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Live Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Live Leaderboard
            </h3>
            <Badge variant="outline" className="animate-pulse">
              <RotateCcw className="w-3 h-3 mr-1" />
              Live Updates
            </Badge>
          </div>
          
          <div className="space-y-3">
            {leaderboard.slice(0, 8).map((player) => (
              <div 
                key={player.rank}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  player.name === 'You' 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getRankIcon(player.rank)}
                    <span className="font-bold text-lg">#{player.rank}</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {player.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-xs text-gray-500">{player.country}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{player.points.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {player.streak} streak
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Prize Breakdown */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            Prize Breakdown
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-500" />
                <div>
                  <div className="font-bold">1st Place</div>
                  <div className="text-sm text-gray-600">Winner</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{currentCompetition?.rewards.first}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <Medal className="w-6 h-6 text-gray-400" />
                <div>
                  <div className="font-bold">2nd Place</div>
                  <div className="text-sm text-gray-600">Runner-up</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{currentCompetition?.rewards.second}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-amber-600" />
                <div>
                  <div className="font-bold">3rd Place</div>
                  <div className="text-sm text-gray-600">Third</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{currentCompetition?.rewards.third}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-blue-500" />
                <div>
                  <div className="font-bold">All Participants</div>
                  <div className="text-sm text-gray-600">Participation Reward</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{currentCompetition?.rewards.participation}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Competitions */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-500" />
          Upcoming Competitions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingCompetitions.map((competition) => (
            <Card key={competition.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getCompetitionIcon(competition.type)}
                  <div>
                    <h4 className="text-lg font-semibold">{competition.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {new Date(competition.startTime).toLocaleDateString()}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {competition.participants} registered
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">{competition.difficulty}</Badge>
              </div>
              
              <p className="text-gray-600 mb-4">{competition.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Prize: <span className="font-semibold text-green-600">{competition.prizePool}</span>
                </div>
                <Button variant="outline" size="sm">
                  Register
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveCompetition;