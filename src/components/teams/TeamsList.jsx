
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, Users, Crown, XCircle, Calendar, Info } from 'lucide-react';

const TeamsList = ({ eventId, userId, onTeamsUpdated }) => {
  const { API_URL } = useTourLMS();
  const { toast } = useToast();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningTeamId, setJoiningTeamId] = useState(null);
  const [leavingTeamId, setLeavingTeamId] = useState(null);
  
  useEffect(() => {
    fetchTeams();
  }, [eventId, API_URL]);
  
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/admin/events/${eventId}/teams`,
        {
          headers: { 'x-auth-token': token },
        }
      );
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Failed to load teams',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinTeam = async (teamId) => {
    try {
      setJoiningTeamId(teamId);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/events/${eventId}/teams/${teamId}/members/${userId}`,
        {},
        {
          headers: { 'x-auth-token': token },
        }
      );
      
      toast({
        title: 'Team joined',
        description: 'You have successfully joined the team',
        variant: 'success',
      });
      
      fetchTeams();
      if (onTeamsUpdated) {
        onTeamsUpdated();
      }
    } catch (error) {
      console.error('Error joining team:', error);
      toast({
        title: 'Failed to join team',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setJoiningTeamId(null);
    }
  };
  
  const handleLeaveTeam = async (teamId) => {
    try {
      setLeavingTeamId(teamId);
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/admin/events/${eventId}/teams/${teamId}/members/${userId}`,
        {
          headers: { 'x-auth-token': token },
        }
      );
      
      toast({
        title: 'Team left',
        description: 'You have successfully left the team',
        variant: 'default',
      });
      
      fetchTeams();
      if (onTeamsUpdated) {
        onTeamsUpdated();
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      toast({
        title: 'Failed to leave team',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLeavingTeamId(null);
    }
  };
  
  const userInTeam = (team) => {
    return team.members && team.members.includes(userId);
  };
  
  const isTeamLeader = (team) => {
    return team.leader === userId;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }
  
  if (teams.length === 0) {
    return (
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          No teams have been created for this event yet. Be the first to create a team!
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      {teams.map((team) => (
        <Card key={team._id} className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-100/10 to-blue-100/5">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {team.name}
                  <Badge variant="outline" className="ml-2">
                    {team.memberDetails?.length || 0} members
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-2">
                  {team.description || 'No description provided'}
                </CardDescription>
              </div>
              {!userInTeam(team) && (
                <Button
                  size="sm"
                  onClick={() => handleJoinTeam(team._id.toString())}
                  disabled={joiningTeamId === team._id.toString()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {joiningTeamId === team._id.toString() ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Join
                    </>
                  )}
                </Button>
              )}
              {userInTeam(team) && !isTeamLeader(team) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLeaveTeam(team._id.toString())}
                  disabled={leavingTeamId === team._id.toString()}
                >
                  {leavingTeamId === team._id.toString() ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Leave
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Team Members
            </h4>
            <ScrollArea className="h-[120px]">
              <div className="space-y-2">
                {team.memberDetails?.map((member) => (
                  <div key={member._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {member.profilePicture ? (
                          <AvatarImage src={member.profilePicture} alt={member.name} />
                        ) : (
                          <AvatarFallback>
                            {member.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email || ''}</p>
                      </div>
                    </div>
                    {team.leader === member._id.toString() && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Leader
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          {userInTeam(team) && isTeamLeader(team) && (
            <CardFooter className="bg-amber-100/10 py-3 px-6">
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <Info size={14} />
                <span>You are the leader of this team</span>
              </div>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default TeamsList;
