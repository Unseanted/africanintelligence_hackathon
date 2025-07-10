// import React, { useState, useEffect } from 'react';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Trophy, Users, Clock, Book, CheckCircle, AlertCircle, FileText } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import ChallengeDetail from '@/components/challenge/ChallengeDetail';
// import ChallengeAttempt from '@/components/challenge/ChallengeAttempt';
// import { getMockChallenges } from '@/services/mockChallengeData';

// const Challenges = () => {
//   const [challenges, setChallenges] = useState({ active: [], upcoming: [], completed: [] });
//   const [selectedChallenge, setSelectedChallenge] = useState(null);
//   const [attemptingChallenge, setAttemptingChallenge] = useState(null);
//   const [submittedChallenges, setSubmittedChallenges] = useState(new Set());
//   const [waitlistedChallengeId, setWaitlistedChallengeId] = useState(null);
//   const { toast } = useToast();

//   // Load challenges from mockChallengeData.js
//   useEffect(() => {
//     setChallenges(getMockChallenges());
//   }, []);

//   const handleJoinChallenge = async (challengeId) => {
//     try {
//       await new Promise(resolve => setTimeout(resolve, 800));
      
//       const challenge = [
//         ...challenges.active,
//         ...challenges.upcoming,
//         ...challenges.completed
//       ].find(c => c.id === challengeId);
      
//       if (challenge) {
//         setAttemptingChallenge(challenge);
//         setSelectedChallenge(null);
//         toast({
//           title: "Challenge Started!",
//           description: `You've begun the ${challenge.title} challenge.`,
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to join challenge. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleSubmitSolution = async (challengeId, submission) => {
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       setSubmittedChallenges(prev => {
//         const newSet = new Set(prev);
//         newSet.add(challengeId);
//         return newSet;
//       });
//       setAttemptingChallenge(null);
//       toast({
//         title: "Submission Received!",
//         description: "Your solution has been submitted successfully.",
//       });
//     } catch (error) {
//       toast({
//         title: "Submission Failed",
//         description: "There was an error submitting your solution.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleJoinWaitlist = async (challengeId) => {
//     setWaitlistedChallengeId(challengeId);
//     toast({
//       title: 'Waitlist Joined',
//       description: 'You have joined the waitlist for this challenge.',
//     });
//   };

//   const renderChallengeCard = (challenge) => {
//     const isSubmitted = submittedChallenges.has(challenge.id);
//     const isActive = challenge.status === 'active';
//     const isCompleted = challenge.status === 'completed';
//     const isUpcoming = challenge.status === 'upcoming';
//     const isWaitlisted = isUpcoming && waitlistedChallengeId === challenge.id;

//     return (
//       <Card key={challenge.id} className="p-6 mb-4 hover:shadow-lg transition-shadow cursor-pointer"
//             onClick={() => setSelectedChallenge(challenge)}>
//         <div className="flex items-start justify-between mb-4">
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               <Book className="w-5 h-5 text-blue-500" />
//               <span className="text-sm text-gray-500">{challenge.courseTitle}</span>
//             </div>
//             <h3 className="text-xl font-semibold">{challenge.title}</h3>
//           </div>
//           {isActive && (
//             <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
//               <Clock className="w-4 h-4 text-green-600" />
//               <span className="text-sm font-medium text-green-600">
//                 {formatTimeRemaining(challenge.endTime - Date.now())}
//               </span>
//             </div>
//           )}
//         </div>

//         <p className="text-gray-600 dark:text-gray-300 mb-4">{challenge.description}</p>

//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <Users className="w-4 h-4 text-blue-500" />
//               <span className="text-sm">{challenge.participants} participants</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Trophy className="w-4 h-4 text-amber-500" />
//               <span className="text-sm">{challenge.maxScore} points</span>
//             </div>
//           </div>

//           <Button
//             variant={isActive ? 'default' : 'outline'}
//             style={isWaitlisted ? { backgroundColor: '#bbf7d0', color: '#166534', border: 'none' } : {}}
//             onClick={(e) => { e.stopPropagation(); setSelectedChallenge(challenge); }}
//             disabled={isCompleted || isSubmitted}
//           >
//             {isCompleted ? 'Completed' :
//              isSubmitted ? 'Submitted' :
//              isActive ? 'Participate' :
//              'View Details'}
//           </Button>
//         </div>
//       </Card>
//     );
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Course Challenges</h1>
      
//       {/* Active Challenges Section */}
//       <div className="mb-8">
//         <h2 className="text-2xl font-semibold mb-4">Active Challenges</h2>
//         {challenges.active.length > 0 ? (
//           challenges.active.map(renderChallengeCard)
//         ) : (
//           <Card className="p-6 text-center">
//             <p className="text-gray-600">No active challenges at the moment</p>
//           </Card>
//         )}
//       </div>

//       {/* Upcoming Challenges Section */}
//       <div className="mb-8">
//         <h2 className="text-2xl font-semibold mb-4">Upcoming Challenges</h2>
//         {challenges.upcoming.length > 0 ? (
//           challenges.upcoming.map(renderChallengeCard)
//         ) : (
//           <Card className="p-6 text-center">
//             <p className="text-gray-600">No upcoming challenges scheduled</p>
//           </Card>
//         )}
//       </div>

//       {/* Completed Challenges Section */}
//       <div className="mb-8">
//         <h2 className="text-2xl font-semibold mb-4">Completed Challenges</h2>
//         {challenges.completed.length > 0 ? (
//           challenges.completed.map(renderChallengeCard)
//         ) : (
//           <Card className="p-6 text-center">
//             <p className="text-gray-600">No challenges completed yet</p>
//           </Card>
//         )}
//       </div>

//       {/* Modals */}
//       {selectedChallenge && (
//         <ChallengeDetail
//           challenge={selectedChallenge}
//           onClose={() => setSelectedChallenge(null)}
//           onJoin={handleJoinChallenge}
//           isSubmitted={submittedChallenges.has(selectedChallenge.id)}
//           isWaitlisted={selectedChallenge.status === 'upcoming' && waitlistedChallengeId === selectedChallenge.id}
//           onJoinWaitlist={handleJoinWaitlist}
//         />
//       )}

//       {attemptingChallenge && (
//         <ChallengeAttempt
//           challenge={attemptingChallenge}
//           onClose={() => setAttemptingChallenge(null)}
//           onSubmit={handleSubmitSolution}
//         />
//       )}
//     </div>
//   );
// };

// const formatTimeRemaining = (ms) => {
//   if (ms <= 0) return 'Expired';
  
//   const hours = Math.floor(ms / (1000 * 60 * 60));
//   const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
//   if (hours > 0) return `${hours}h ${minutes}m remaining`;
//   return `${minutes}m remaining`;
// };

// export default Challenges;







import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Clock, Book, Loader2, HeartPulse, Briefcase, Leaf, Globe, Brain, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChallengeDetail from '@/components/challenge/ChallengeDetail';
import ChallengeAttempt from '@/components/challenge/ChallengeAttempt';

const Challenges = () => {
  const [challenges, setChallenges] = useState({ active: [], upcoming: [], completed: [] });
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [attemptingChallenge, setAttemptingChallenge] = useState(null);
  const [submittedChallenges, setSubmittedChallenges] = useState(new Set());
  const [waitlistedChallengeId, setWaitlistedChallengeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // AI Challenge Generation Function
  const generateAIChallenges = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would call your AI API here
      // For example, using OpenAI's API:
      /*
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: "Generate 2 active, 2 upcoming, and 2 completed challenges across different life categories (health, career, relationships, environment, learning, creativity). Return as JSON with this structure: { active: [], upcoming: [], completed: [] }"
          }],
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
      */

      // Mock response - in a real app, replace with actual API call
      const mockAIResponse = {
        active: [
          {
            id: 'health-ai-1',
            title: 'Mindful Hydration Challenge',
            description: 'Track and maintain optimal water intake daily with mindfulness techniques for 14 days.',
            category: 'health',
            status: 'active',
            startTime: Date.now() - 3 * 86400000,
            endTime: Date.now() + 11 * 86400000,
            participants: 842,
            maxScore: 350,
            difficulty: 'Beginner',
            requirements: 'Water bottle, tracking app optional',
            rewards: 'Better hydration habits, improved energy'
          },
          {
            id: 'career-ai-1',
            title: 'Networking Sprint',
            description: 'Connect with 5 new professionals in your field this week and document key takeaways.',
            category: 'career',
            status: 'active',
            startTime: Date.now() - 86400000,
            endTime: Date.now() + 6 * 86400000,
            participants: 567,
            maxScore: 450,
            difficulty: 'Intermediate',
            requirements: 'LinkedIn or other professional network',
            rewards: 'Expanded network, potential opportunities'
          }
        ],
        upcoming: [
          {
            id: 'learning-ai-1',
            title: 'AI Literacy Bootcamp',
            description: 'Daily 15-minute lessons on AI fundamentals and practical applications starting next week.',
            category: 'learning',
            status: 'upcoming',
            startTime: Date.now() + 5 * 86400000,
            endTime: Date.now() + 26 * 86400000,
            participants: 0,
            maxScore: 600,
            difficulty: 'Beginner',
            requirements: 'Curiosity about technology',
            rewards: 'AI understanding, digital literacy badge'
          },
          {
            id: 'environment-ai-1',
            title: 'Carbon Footprint Reduction',
            description: 'Learn and implement ways to reduce your household carbon footprint by 20% this month.',
            category: 'environment',
            status: 'upcoming',
            startTime: Date.now() + 2 * 86400000,
            endTime: Date.now() + 30 * 86400000,
            participants: 0,
            maxScore: 800,
            difficulty: 'Intermediate',
            requirements: 'Willingness to change habits',
            rewards: 'Environmental impact, sustainable living guide'
          }
        ],
        completed: [
          {
            id: 'relationships-ai-1',
            title: 'Digital Detox for Connections',
            description: 'Spent quality device-free time with loved ones daily for 2 weeks.',
            category: 'relationships',
            status: 'completed',
            startTime: Date.now() - 21 * 86400000,
            endTime: Date.now() - 7 * 86400000,
            participants: 1203,
            maxScore: 400,
            difficulty: 'Intermediate',
            requirements: 'Willingness to disconnect',
            rewards: 'Deeper connections, mindfulness certificate'
          },
          {
            id: 'creativity-ai-1',
            title: 'Photo-a-Day Challenge',
            description: 'Capture and share one meaningful photo each day for 30 days with creative prompts.',
            category: 'creativity',
            status: 'completed',
            startTime: Date.now() - 60 * 86400000,
            endTime: Date.now() - 30 * 86400000,
            participants: 2156,
            maxScore: 500,
            difficulty: 'Beginner',
            requirements: 'Camera phone or camera',
            rewards: 'Improved photography skills, memory archive'
          }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockAIResponse;
    } catch (error) {
      console.error("AI challenge generation failed:", error);
      toast({
        title: "Generation Error",
        description: "Couldn't generate challenges. Showing default set instead.",
        variant: "destructive",
      });
      return getDefaultChallenges();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback challenges if AI fails
  const getDefaultChallenges = () => ({
    active: [],
    upcoming: [],
    completed: []
  });

  // Load challenges from AI
  useEffect(() => {
    const loadChallenges = async () => {
      const aiChallenges = await generateAIChallenges();
      setChallenges(aiChallenges);
    };
    loadChallenges();
  }, []);

  // ... rest of your existing handlers (handleJoinChallenge, handleSubmitSolution, etc.) ...
  const handleJoinChallenge = async (challengeId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const challenge = [
        ...challenges.active,
        ...challenges.upcoming,
        ...challenges.completed
      ].find(c => c.id === challengeId);
      
      if (challenge) {
        setAttemptingChallenge(challenge);
        setSelectedChallenge(null);
        toast({
          title: "Challenge Started!",
          description: `You've begun the ${challenge.title} challenge.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitSolution = async (challengeId, submission) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmittedChallenges(prev => {
        const newSet = new Set(prev);
        newSet.add(challengeId);
        return newSet;
      });
      setAttemptingChallenge(null);
      toast({
        title: "Submission Received!",
        description: "Your solution has been submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your solution.",
        variant: "destructive",
      });
    }
  };

  const handleJoinWaitlist = async (challengeId) => {
    setWaitlistedChallengeId(challengeId);
    toast({
      title: 'Waitlist Joined',
      description: 'You have joined the waitlist for this challenge.',
    });
  };


  const renderChallengeCard = (challenge) => {
    const isSubmitted = submittedChallenges.has(challenge.id);
    const isActive = challenge.status === 'active';
    const isCompleted = challenge.status === 'completed';
    const isUpcoming = challenge.status === 'upcoming';
    const isWaitlisted = isUpcoming && waitlistedChallengeId === challenge.id;

    const categoryIcons = {
      health: <HeartPulse className="w-5 h-5 text-red-500" />,
      career: <Briefcase className="w-5 h-5 text-blue-500" />,
      relationships: <Users className="w-5 h-5 text-pink-500" />,
      environment: <Leaf className="w-5 h-5 text-green-500" />,
      learning: <Brain className="w-5 h-5 text-purple-500" />,
      creativity: <Music className="w-5 h-5 text-yellow-500" />,
      global: <Globe className="w-5 h-5 text-indigo-500" />
    };

    return (
      <Card key={challenge.id} className="p-6 mb-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedChallenge(challenge)}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {categoryIcons[challenge.category] || <Book className="w-5 h-5 text-gray-500" />}
              <span className="text-sm text-gray-500 capitalize">{challenge.category}</span>
            </div>
            <h3 className="text-xl font-semibold">{challenge.title}</h3>
          </div>
          {isActive && (
            <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                {formatTimeRemaining(challenge.endTime - Date.now())}
              </span>
            </div>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">{challenge.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{challenge.participants} participants</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm">{challenge.maxScore} points</span>
            </div>
          </div>

          <Button
            variant={isActive ? 'default' : 'outline'}
            style={isWaitlisted ? { backgroundColor: '#bbf7d0', color: '#166534', border: 'none' } : {}}
            onClick={(e) => { e.stopPropagation(); setSelectedChallenge(challenge); }}
            disabled={isCompleted || isSubmitted}
          >
            {isCompleted ? 'Completed' :
             isSubmitted ? 'Submitted' :
             isActive ? 'Participate' :
             'View Details'}
          </Button>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Generating AI-powered challenges...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI-Powered Life Challenges</h1>
      
      {/* Active Challenges Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Active Challenges</h2>
        {challenges.active.length > 0 ? (
          challenges.active.map(renderChallengeCard)
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No active challenges right now. Check back soon!</p>
          </Card>
        )}
      </div>

      {/* Upcoming Challenges Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Challenges</h2>
        {challenges.upcoming.length > 0 ? (
          challenges.upcoming.map(renderChallengeCard)
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">New challenges being generated...</p>
          </Card>
        )}
      </div>

      {/* Completed Challenges Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Completed Challenges</h2>
        {challenges.completed.length > 0 ? (
          challenges.completed.map(renderChallengeCard)
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">Your completed challenges will appear here</p>
          </Card>
        )}
      </div>

      {/* Modals */}
      {selectedChallenge && (
        <ChallengeDetail
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onJoin={handleJoinChallenge}
          isSubmitted={submittedChallenges.has(selectedChallenge.id)}
          isWaitlisted={selectedChallenge.status === 'upcoming' && waitlistedChallengeId === selectedChallenge.id}
          onJoinWaitlist={handleJoinWaitlist}
        />
      )}

      {attemptingChallenge && (
        <ChallengeAttempt
          challenge={attemptingChallenge}
          onClose={() => setAttemptingChallenge(null)}
          onSubmit={handleSubmitSolution}
        />
      )}
    </div>
  );
};

// ... formatTimeRemaining and export ...

const formatTimeRemaining = (ms) => {
  if (ms <= 0) return 'Expired';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

export default Challenges;

