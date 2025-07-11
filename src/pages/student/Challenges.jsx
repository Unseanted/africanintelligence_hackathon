import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Trophy, Users, Clock, Book, Loader2, HeartPulse, Briefcase, Leaf, Globe, Brain, Music, Sparkles, Star, X, Bot } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import ChallengeDetail from '../../components/challenge/ChallengeDetail';
import ChallengeAttempt from '../../components/challenge/ChallengeAttempt';
import { XPProgress } from '../../components/challenge/XPProgress';
import aiChallengeService from '../../services/aiChallegeService';

const Challenges = () => {
  const [challenges, setChallenges] = useState({ active: [], upcoming: [], completed: [] });
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [attemptingChallenge, setAttemptingChallenge] = useState(null);
  const [submittedChallenges, setSubmittedChallenges] = useState(new Set());
  const [waitlistedChallengeId, setWaitlistedChallengeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    level: 7,
    currentXp: 2150,
    nextLevelXp: 3000,
    totalChallenges: 23,
    completedChallenges: 18,
    streak: 12
  });
  const [userPreferences, setUserPreferences] = useState({
    categories: ['health', 'career', 'learning', 'creativity'],
    difficulty: 'mixed',
    interests: ['technology', 'fitness', 'personal-growth']
  });
  const { toast } = useToast();

  // AI Challenge Generation Function
  const generateAIChallenges = async () => {
    setIsLoading(true);
    try {
      // Simulate AI API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate challenges based on user preferences and current time
      const aiResponse = await generatePersonalizedChallenges(userPreferences, userStats);
      
      return aiResponse;
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

  // AI-powered challenge generation function
  const generatePersonalizedChallenges = async (preferences, stats) => {
    // Simulate AI processing with dynamic content generation
    const categories = preferences.categories;
    const currentTime = Date.now();
    
    const challengeTemplates = {
      health: [
        {
          title: 'Mindful Hydration Challenge',
          description: 'Track and maintain optimal water intake daily with mindfulness techniques. Learn to recognize your body\'s hydration signals and develop sustainable habits.',
          submissionType: 'text',
          difficulty: 'Beginner',
          maxScore: 350
        },
        {
          title: 'Morning Movement Ritual',
          description: 'Establish a 15-minute morning movement routine combining stretching, breathing, and light exercise to energize your day.',
          submissionType: 'video',
          difficulty: 'Beginner',
          maxScore: 400
        }
      ],
      career: [
        {
          title: 'Networking Sprint',
          description: 'Connect with 5 new professionals in your field this week. Build meaningful relationships and expand your professional network strategically.',
          submissionType: 'quiz',
          difficulty: 'Intermediate',
          maxScore: 450
        },
        {
          title: 'Skill Documentation Project',
          description: 'Create a comprehensive portfolio showcasing your top 3 professional skills with real examples and measurable outcomes.',
          submissionType: 'document',
          difficulty: 'Intermediate',
          maxScore: 500
        }
      ],
      learning: [
        {
          title: 'AI Literacy Bootcamp',
          description: 'Master AI fundamentals through daily 15-minute lessons. Understand how AI works, its applications, and ethical considerations.',
          submissionType: 'timed-quiz',
          difficulty: 'Beginner',
          maxScore: 600,
          timeLimit: 30
        },
        {
          title: 'Language Learning Sprint',
          description: 'Learn 50 new words in a foreign language using spaced repetition and practical conversation practice.',
          submissionType: 'quiz',
          difficulty: 'Intermediate',
          maxScore: 400
        }
      ],
      creativity: [
        {
          title: 'Visual Storytelling Challenge',
          description: 'Create a compelling story using only images, no text. Develop your visual narrative skills and artistic expression.',
          submissionType: 'image',
          difficulty: 'Intermediate',
          maxScore: 300
        },
        {
          title: 'Daily Creative Writing',
          description: 'Write a 200-word creative piece every day for a week, exploring different genres and styles.',
          submissionType: 'text',
          difficulty: 'Beginner',
          maxScore: 350
        }
      ]
    };

    // Generate active challenges
    const activeTemplates = categories.flatMap(cat => challengeTemplates[cat] || []);
    const selectedActive = activeTemplates.slice(0, 3).map((template, index) => ({
      id: `ai-active-${currentTime}-${index}`,
      ...template,
      category: categories[index % categories.length],
      status: 'active',
      startTime: currentTime - Math.random() * 3 * 24 * 60 * 60 * 1000,
      endTime: currentTime + (7 + Math.random() * 14) * 24 * 60 * 60 * 1000,
      participants: Math.floor(Math.random() * 2000) + 200,
      requirements: 'Basic commitment and willingness to learn',
      rewards: 'Personal growth, new skills, achievement badges',
      questions: generateQuestionsForType(template.submissionType)
    }));

    // Generate upcoming challenges
    const upcomingTemplates = activeTemplates.slice(3, 5);
    const selectedUpcoming = upcomingTemplates.map((template, index) => ({
      id: `ai-upcoming-${currentTime}-${index}`,
      ...template,
      category: categories[(index + 3) % categories.length],
      status: 'upcoming',
      startTime: currentTime + (1 + Math.random() * 7) * 24 * 60 * 60 * 1000,
      endTime: currentTime + (8 + Math.random() * 21) * 24 * 60 * 60 * 1000,
      participants: 0,
      requirements: 'Pre-registration required',
      rewards: 'Early access, bonus XP, exclusive content',
      questions: generateQuestionsForType(template.submissionType)
    }));

    // Generate completed challenges
    const completedTemplates = activeTemplates.slice(5, 7);
    const selectedCompleted = completedTemplates.map((template, index) => ({
      id: `ai-completed-${currentTime}-${index}`,
      ...template,
      category: categories[(index + 5) % categories.length],
      status: 'completed',
      startTime: currentTime - (30 + Math.random() * 30) * 24 * 60 * 60 * 1000,
      endTime: currentTime - (7 + Math.random() * 23) * 24 * 60 * 60 * 1000,
      participants: Math.floor(Math.random() * 5000) + 1000,
      requirements: 'Challenge completed successfully',
      rewards: 'Achievement unlocked, XP earned, community recognition',
      questions: generateQuestionsForType(template.submissionType)
    }));

    return {
      active: selectedActive,
      upcoming: selectedUpcoming,
      completed: selectedCompleted
    };
  };

  // Generate questions based on submission type
  const generateQuestionsForType = (submissionType) => {
    const questionSets = {
      quiz: [
        {
          text: 'What is your primary motivation for taking this challenge?',
          options: [
            'Personal growth and development',
            'Building new habits',
            'Connecting with others',
            'Achieving specific goals'
          ],
          multiple: false
        },
        {
          text: 'Which strategies will you use to stay consistent?',
          options: [
            'Daily reminders and tracking',
            'Accountability partner',
            'Reward system',
            'Community support'
          ],
          multiple: true
        }
      ],
      'timed-quiz': [
        {
          text: 'What is the most important factor in successful habit formation?',
          options: [
            'Consistency over perfection',
            'Setting ambitious goals',
            'Having the right tools',
            'External motivation'
          ],
          multiple: false
        },
        {
          text: 'Which technique helps maintain long-term motivation?',
          options: [
            'Tracking progress visually',
            'Celebrating small wins',
            'Connecting with purpose',
            'All of the above'
          ],
          multiple: false
        }
      ]
    };

    return questionSets[submissionType] || [
      {
        text: 'How will you approach this challenge?',
        type: 'text'
      }
    ];
  };

  // Fallback challenges if AI fails
  const getDefaultChallenges = () => ({
    active: [
      {
        id: 'default-1',
        title: 'Daily Mindfulness Practice',
        description: 'Practice 10 minutes of mindfulness meditation each day for a week.',
        category: 'health',
        status: 'active',
        startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
        endTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
        participants: 1234,
        maxScore: 300,
        difficulty: 'Beginner',
        requirements: 'Quiet space, 10 minutes daily',
        rewards: 'Reduced stress, better focus',
        submissionType: 'text',
        questions: [
          {
            text: 'Describe your meditation experience',
            type: 'text'
          }
        ]
      }
    ],
    upcoming: [],
    completed: []
  });

  // Auto-generate new challenges periodically
  useEffect(() => {
    const autoGenerateInterval = setInterval(async () => {
      // Check if we need new challenges (less than 2 active challenges)
      if (challenges.active.length < 2) {
        const newChallenges = await generateAIChallenges();
        setChallenges(prev => ({
          ...prev,
          active: [...prev.active, ...newChallenges.active.slice(0, 2)]
        }));
        
        toast({
          title: "New Challenges Available!",
          description: "AI has generated new personalized challenges for you.",
        });
      }
    }, 10 * 60 * 1000); // Check every 10 minutes

    return () => clearInterval(autoGenerateInterval);
  }, [challenges.active.length, toast]);

  // Load challenges from AI on component mount
  useEffect(() => {
    const loadChallenges = async () => {
      const aiChallenges = await generateAIChallenges();
      setChallenges(aiChallenges);
    };
    loadChallenges();
  }, []);

  // Mock real-time challenge updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update participant counts
      setChallenges(prev => ({
        ...prev,
        active: prev.active.map(challenge => ({
          ...challenge,
          participants: challenge.participants + Math.floor(Math.random() * 5)
        }))
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
      // Submit to backend via AI service
      const result = await aiChallengeService.submitChallenge(challengeId, submission);
      
      setSubmittedChallenges(prev => {
        const newSet = new Set(prev);
        newSet.add(challengeId);
        return newSet;
      });
      
      // Update user stats
      setUserStats(prev => ({
        ...prev,
        currentXp: prev.currentXp + (result.xpEarned || 150),
        completedChallenges: prev.completedChallenges + 1,
        streak: prev.streak + 1
      }));
      
      setAttemptingChallenge(null);
      toast({
        title: "Submission Received!",
        description: `Your solution has been submitted successfully. +${result.xpEarned || 150} XP earned!`,
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your solution.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateChallenge = async () => {
    toast({
      title: "Regenerating Challenges",
      description: "AI is creating new personalized challenges for you...",
    });
    const newChallenges = await generateAIChallenges();
    setChallenges(newChallenges);
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

    const getDifficultyColor = (difficulty) => {
      switch (difficulty?.toLowerCase()) {
        case 'beginner': return 'bg-green-100 text-green-800';
        case 'intermediate': return 'bg-yellow-100 text-yellow-800';
        case 'advanced': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <Card key={challenge.id} className="mb-6 p-6 relative">
        {/* Grand Prize & AI Powered Badges */}
        {(challenge.isGrandPrize || challenge.type === 'ai-grand-prize' || challenge.grandPrize) && (
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-yellow-700 text-xs">Grand Prize</span>
            {challenge.grandPrize && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-semibold ml-1 text-xs">{challenge.grandPrize}</span>
            )}
          </div>
        )}
        {challenge.aiPowered && (
          <div className="absolute top-4 left-4 flex items-center gap-1 z-10">
            <Bot className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-blue-700 text-xs">AI Powered</span>
          </div>
        )}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {categoryIcons[challenge.category] || <Book className="w-5 h-5 text-gray-500" />}
              <span className="text-sm font-medium text-gray-600 capitalize bg-gray-100 px-3 py-1 rounded-full">
                {challenge.category}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
              {challenge.title}
            </h3>
          </div>
          {isActive && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-full border border-green-200">
              <Clock className="w-4 h-4 text-green-600 animate-pulse" />
              <span className="text-sm font-medium text-green-700">
                {formatTimeRemaining(challenge.endTime - Date.now())}
              </span>
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                {challenge.participants.toLocaleString()} participants
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">
                {challenge.maxScore} XP
              </span>
            </div>
          </div>

          <Button
            variant={isActive ? 'default' : 'outline'}
            style={isWaitlisted ? { backgroundColor: '#bbf7d0', color: '#166534', border: 'none' } : {}}
            onClick={(e) => { e.stopPropagation(); setSelectedChallenge(challenge); }}
            disabled={isCompleted || isSubmitted}
            className="transition-all duration-200"
          >
            {isCompleted ? 'Completed ✓' :
             isSubmitted ? 'Submitted ✓' :
             isActive ? 'Join Challenge' :
             isWaitlisted ? 'Waitlisted' :
             'View Details'}
          </Button>
        </div>
      </Card>
    );
  };

  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return 'Expired';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Generating AI-Powered Challenges
            </h2>
            <p className="text-gray-600">
              Creating personalized challenges tailored to your growth...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Life Challenges
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your life through personalized challenges designed by AI to help you grow, learn, and achieve your goals.
          </p>
          <div className="mt-6">
            <Button onClick={handleRegenerateChallenge} variant="outline" className="mr-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New Challenges
            </Button>
          </div>
        </div>

        {/* User Stats */}
        <div className="mb-12">
          <XPProgress 
            currentXp={userStats.currentXp}
            nextLevelXp={userStats.nextLevelXp}
            level={userStats.level}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="p-6 text-center bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userStats.completedChallenges}
              </div>
              <div className="text-sm text-blue-700">Challenges Completed</div>
            </Card>
            
            <Card className="p-6 text-center bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userStats.streak}
              </div>
              <div className="text-sm text-green-700">Day Streak</div>
            </Card>
            
            <Card className="p-6 text-center bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {userStats.totalChallenges}
              </div>
              <div className="text-sm text-purple-700">Total Challenges</div>
            </Card>
          </div>
        </div>

        {/* Active Challenges Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Active Challenges</h2>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {challenges.active.length} Available
            </span>
          </div>
          {challenges.active.length > 0 ? (
            challenges.active.map(renderChallengeCard)
          ) : (
            <Card className="p-12 text-center bg-gradient-to-r from-gray-50 to-gray-100">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No active challenges right now.</p>
              <p className="text-gray-500">New challenges are being generated daily!</p>
            </Card>
          )}
        </div>

        {/* Upcoming Challenges Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Challenges</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {challenges.upcoming.length} Coming Soon
            </span>
          </div>
          {challenges.upcoming.length > 0 ? (
            challenges.upcoming.map(renderChallengeCard)
          ) : (
            <Card className="p-12 text-center bg-gradient-to-r from-blue-50 to-blue-100">
              <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-700 text-lg">New challenges being generated...</p>
              <p className="text-blue-600">Check back soon for exciting new opportunities!</p>
            </Card>
          )}
        </div>

        {/* Completed Challenges Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Completed Challenges</h2>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              {challenges.completed.length} Achievements
            </span>
          </div>
          {challenges.completed.length > 0 ? (
            challenges.completed.map(renderChallengeCard)
          ) : (
            <Card className="p-12 text-center bg-gradient-to-r from-amber-50 to-amber-100">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-700 text-lg">Your completed challenges will appear here</p>
              <p className="text-amber-600">Start your first challenge to see your progress!</p>
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
    </div>
  );
};

export default Challenges;