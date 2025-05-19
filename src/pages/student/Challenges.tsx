import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { Loader2, Users, Clock, Trophy } from 'lucide-react';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'llm_integration' | 'api_handling' | 'material_processing';
  duration: number;
  maxTeamSize: number;
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  participants: number;
}

const Challenges: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useTourLMS();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed'>('upcoming');

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch('/api/challenges', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch challenges');
        }

        const data = await response.json();
        setChallenges(data);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        toast({
          title: 'Error',
          description: 'Failed to load challenges',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [token, toast]);

  const filteredChallenges = challenges.filter(challenge => challenge.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Challenges</h1>
        <div className="flex space-x-4">
          <Button
            variant={activeTab === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={activeTab === 'active' ? 'default' : 'outline'}
            onClick={() => setActiveTab('active')}
          >
            Active
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'default' : 'outline'}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </Button>
        </div>
      </div>

      {filteredChallenges.length === 0 ? (
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No Challenges Available</h2>
          <p className="text-gray-600">
            There are no {activeTab} challenges at the moment. Check back later!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <Card key={challenge._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{challenge.title}</h2>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(challenge.status)}`}>
                  {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{challenge.duration} minutes</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Max {challenge.maxTeamSize} members</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Trophy className="w-4 h-4 mr-2" />
                  <span>{challenge.participants} participants</span>
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                <p>Starts: {formatDate(challenge.startDate)}</p>
                <p>Ends: {formatDate(challenge.endDate)}</p>
              </div>

              <Button
                className="w-full"
                onClick={() => navigate(`/student/challenges/${challenge._id}`)}
              >
                View Details
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Challenges; 