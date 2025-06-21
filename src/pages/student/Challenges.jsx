import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Clock, Book, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChallengeDetail from '@/components/challenge/ChallengeDetail';
import ChallengeAttempt from '@/components/challenge/ChallengeAttempt';
import { getMockChallenges } from '@/services/mockChallengeData';

const Challenges = () => {
  const [challenges, setChallenges] = useState({ active: [], upcoming: [], completed: [] });
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [attemptingChallenge, setAttemptingChallenge] = useState(null);
  const [submittedChallenges, setSubmittedChallenges] = useState(new Set());
  const [waitlistedChallengeId, setWaitlistedChallengeId] = useState(null);
  const { toast } = useToast();

  // Load challenges from mockChallengeData.js
  useEffect(() => {
    setChallenges(getMockChallenges());
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

    return (
      <Card key={challenge.id} className="p-6 mb-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedChallenge(challenge)}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Book className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500">{challenge.courseTitle}</span>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Course Challenges</h1>
      
      {/* Active Challenges Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Active Challenges</h2>
        {challenges.active.length > 0 ? (
          challenges.active.map(renderChallengeCard)
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No active challenges at the moment</p>
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
            <p className="text-gray-600">No upcoming challenges scheduled</p>
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
            <p className="text-gray-600">No challenges completed yet</p>
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

const formatTimeRemaining = (ms) => {
  if (ms <= 0) return 'Expired';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

export default Challenges;