import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTourLMS } from '@/contexts/TourLMSContext';
import ChallengeInterface from '@/components/challenge/ChallengeInterface';
import { Loader2, ArrowLeft } from 'lucide-react';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'llm_integration' | 'api_handling' | 'material_processing';
  duration: number;
  requirements: string[];
  resources: {
    title: string;
    url: string;
  }[];
}

const Challenge: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useTourLMS();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallengeAndTeam = async () => {
      if (!token || !id) return;

      try {
        setLoading(true);
        
        // Fetch challenge details
        const response = await fetch(`/api/challenges/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch challenge');
        }

        const challengeData = await response.json();
        setChallenge(challengeData);

        // Fetch user's team for this challenge
        const teamResponse = await fetch(`/api/challenges/${id}/team`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamId(teamData.teamId);
        }
      } catch (error) {
        console.error('Error fetching challenge data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load challenge details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeAndTeam();
  }, [token, id, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Challenge Not Found</h2>
          <p className="text-gray-600 mb-6">The challenge you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/student/challenges')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/student/challenges')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Challenges
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>
            <p className="text-gray-600 mb-6">{challenge.description}</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                <ul className="list-disc list-inside space-y-2">
                  {challenge.requirements.map((req, index) => (
                    <li key={index} className="text-gray-600">{req}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Resources</h3>
                <ul className="space-y-2">
                  {challenge.resources.map((resource, index) => (
                    <li key={index}>
                      <a 
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Challenge Interface */}
        <div className="lg:col-span-1">
          {teamId ? (
            <ChallengeInterface challengeId={id!} teamId={teamId} />
          ) : (
            <Card className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-4">Join a Team</h3>
              <p className="text-gray-600 mb-6">
                You need to be part of a team to participate in this challenge.
              </p>
              <Button onClick={() => navigate(`/student/challenges/${id}/teams`)}>
                Find a Team
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Challenge; 