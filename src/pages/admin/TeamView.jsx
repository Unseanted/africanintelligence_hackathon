
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  UserPlus,
  Users,
  Crown,
  RefreshCw,
  Trash2,
  UserX,
} from 'lucide-react';

const TeamView = ({ eventId }) => {
  const { toast } = useToast();
  const { API_URL } = useTourLMS();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState(null);
  const [removingUserData, setRemovingUserData] = useState({ teamId: null, userId: null });

  useEffect(() => {
    fetchTeams();
  }, [eventId]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/events/${eventId}/teams`, {
        headers: { 'x-auth-token': token },
      });
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Failed to load teams',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTeams = async () => {
    try {
      setIsRefreshing(true);
      await fetchTeams();
      toast({
        title: 'Teams refreshed',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error refreshing teams:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      setDeletingTeamId(teamId);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/events/${eventId}/teams/${teamId}`, {
        headers: { 'x-auth-token': token },
      });
      
      toast({
        title: 'Team deleted',
        description: 'Team has been deleted successfully',
        variant: 'default',
      });
      
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: 'Failed to delete team',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setDeletingTeamId(null);
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    try {
      setRemovingUserData({ teamId, userId });
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/events/${eventId}/teams/${teamId}/members/${userId}`, {
        headers: { 'x-auth-token': token },
      });
      
      toast({
        title: 'Member removed',
        description: 'Member has been removed from the team',
        variant: 'default',
      });
      
      fetchTeams();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Failed to remove member',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setRemovingUserData({ teamId: null, userId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-gray-400">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Event Teams</h3>
        <Button
          variant="outline"
          size="sm"
          className="text-green-400 hover:text-green-500 border-green-800 hover:border-green-700 hover:bg-green-900/20"
          onClick={handleRefreshTeams}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Teams
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-500 mb-4" />
            <p className="text-gray-300 text-lg">No teams created yet</p>
            <p className="text-gray-500 mt-1">Teams will appear here when participants create them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map((team) => (
            <Card key={team._id} className="bg-gray-800/50 border-gray-700 overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-white flex items-center gap-2">
                      {team.name}
                      <Badge variant="outline" className="bg-gray-700/50 text-green-400 border-green-700/50">
                        {team.memberDetails?.length || 0} members
                      </Badge>
                    </CardTitle>
                    {team.description && (
                      <p className="text-sm text-gray-400">{team.description}</p>
                    )}
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="bg-red-900/50 hover:bg-red-900/80 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-gray-100">Delete Team</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Are you sure you want to delete the team "{team.name}"? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleDeleteTeam(team._id.toString())}
                          disabled={deletingTeamId === team._id.toString()}
                          className="bg-red-900/50 hover:bg-red-900/80 text-red-400"
                        >
                          {deletingTeamId === team._id.toString() ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Delete Team
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <h4 className="text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  Team Members
                </h4>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {team.memberDetails?.map((member) => (
                      <div key={member._id} className="flex items-center justify-between bg-gray-900/40 p-3 rounded-md">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-gray-700">
                            {member.profilePicture ? (
                              <AvatarImage src={member.profilePicture} alt={member.name} />
                            ) : (
                              <AvatarFallback className="bg-gray-700 text-gray-300">
                                {member.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-200">{member.name}</p>
                            <p className="text-xs text-gray-400">{member.email || ''}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {team.leader === member._id.toString() ? (
                            <Badge className="bg-amber-900/50 text-amber-400 border-amber-800/50">
                              <Crown className="h-3 w-3 mr-1" />
                              Leader
                            </Badge>
                          ) : (
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveMember(team._id.toString(), member._id.toString())}
                              disabled={removingUserData.teamId === team._id.toString() && 
                                        removingUserData.userId === member._id.toString()}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              {removingUserData.teamId === team._id.toString() && 
                               removingUserData.userId === member._id.toString() ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <UserX className="h-3 w-3" />
                              )}
                              <span className="ml-1">Remove</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamView;
