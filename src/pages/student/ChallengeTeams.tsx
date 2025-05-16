import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { Loader2, Users, Plus, Search, UserPlus } from 'lucide-react';

interface Team {
  _id: string;
  name: string;
  members: {
    _id: string;
    name: string;
    role: 'leader' | 'member';
  }[];
  maxSize: number;
  description: string;
  isOpen: boolean;
}

interface Challenge {
  _id: string;
  title: string;
  maxTeamSize: number;
}

const ChallengeTeams: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useTourLMS();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !id) return;

      try {
        setLoading(true);
        
        // Fetch challenge details
        const challengeResponse = await fetch(`/api/challenges/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!challengeResponse.ok) {
          throw new Error('Failed to fetch challenge');
        }

        const challengeData = await challengeResponse.json();
        setChallenge(challengeData);

        // Fetch teams
        const teamsResponse = await fetch(`/api/challenges/${id}/teams`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!teamsResponse.ok) {
          throw new Error('Failed to fetch teams');
        }

        const teamsData = await teamsResponse.json();
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load teams',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, id, toast]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: 'Error',
        description: 'Team name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/challenges/${id}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDescription,
          maxSize: challenge?.maxTeamSize || 4
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create team');
      }

      const newTeam = await response.json();
      setTeams([...teams, newTeam]);
      setShowCreateTeam(false);
      setNewTeamName('');
      setNewTeamDescription('');

      toast({
        title: 'Success',
        description: 'Team created successfully',
      });
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to create team',
        variant: 'destructive',
      });
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/challenges/${id}/teams/${teamId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to join team');
      }

      // Update teams list
      const updatedTeams = teams.map(team => {
        if (team._id === teamId) {
          return {
            ...team,
            members: [...team.members, { _id: user?._id || '', name: user?.name || '', role: 'member' }]
          };
        }
        return team;
      });

      setTeams(updatedTeams);

      toast({
        title: 'Success',
        description: 'Joined team successfully',
      });

      // Navigate to challenge page
      navigate(`/student/challenges/${id}`);
    } catch (error) {
      console.error('Error joining team:', error);
      toast({
        title: 'Error',
        description: 'Failed to join team',
        variant: 'destructive',
      });
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teams for {challenge?.title}</h1>
        <p className="text-gray-600">Join a team or create your own to participate in this challenge</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreateTeam(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      {showCreateTeam && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <Input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                type="text"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                placeholder="Enter team description"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>
                Create Team
              </Button>
            </div>
          </div>
        </Card>
      )}

      {filteredTeams.length === 0 ? (
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No Teams Found</h2>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? 'No teams match your search criteria'
              : 'No teams have been created yet. Be the first to create one!'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateTeam(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team._id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{team.name}</h2>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  team.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {team.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{team.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{team.members.length} / {team.maxSize} members</span>
                </div>
                <div className="text-sm text-gray-500">
                  <p className="font-medium mb-1">Team Members:</p>
                  <ul className="space-y-1">
                    {team.members.map((member) => (
                      <li key={member._id} className="flex items-center">
                        <span className="mr-2">•</span>
                        {member.name}
                        {member.role === 'leader' && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Leader
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {team.isOpen && team.members.length < team.maxSize && (
                <Button
                  className="w-full"
                  onClick={() => handleJoinTeam(team._id)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Team
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengeTeams; 