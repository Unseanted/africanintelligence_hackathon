import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  Calendar, Users, ChevronRight, User, Crown, 
  Loader2, Target, UserPlus, Shield, AlertTriangle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

const MyTeams = () => {
  // State for storing user's teams
  const [myTeams, setMyTeams] = useState([]);
  // Loading state
  const [loading, setLoading] = useState(true);
  // Selected team for leave/disband action
  const [selectedTeam, setSelectedTeam] = useState(null);
  // Loading state for leave/disband action
  const [isLeaving, setIsLeaving] = useState(false);
  // Dialog open state
  const [confirmLeaveDialogOpen, setConfirmLeaveDialogOpen] = useState(false);
  
  // Get user from auth context
  const { user } = useAuth();
  // Get API URL from context
  const { API_URL } = useTourLMS();
  // Toast notification hook
  const { toast } = useToast();
  // Navigation hook
  const navigate = useNavigate();

  // Fetch user's teams on component mount
  useEffect(() => {
    fetchMyTeams();
  }, []);

  // Function to fetch all teams the user is a member of
  const fetchMyTeams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // First get all events
      const eventsResponse = await axios.get(`${API_URL}/admin/events`, {
        headers: { 'x-auth-token': token }
      });
      
      const events = eventsResponse.data;
      const teamsByEvent = [];
      
      // For each event, check if there are teams with the user as member
      for (const event of events) {
        try {
          // Get teams for the current event
          const teamsResponse = await axios.get(`${API_URL}/admin/events/${event._id}/teams`, {
            headers: { 'x-auth-token': token }
          });
          
          const teams = teamsResponse.data || [];
          // Filter teams where current user is a member
          const userTeams = teams.filter(team => 
            team.members && team.members.includes(user.id)
          );
          
          // If user is in any teams for this event, add to display list
          if (userTeams.length > 0) {
            teamsByEvent.push({
              event: {
                _id: event._id,
                title: event.title,
                flyer: event.flyer,
                eventDate: event.eventDate,
                eventTypeDetails: event.eventTypeDetails
              },
              teams: userTeams
            });
          }
        } catch (error) {
          console.error(`Error fetching teams for event ${event._id}:`, error);
        }
      }
      
      setMyTeams(teamsByEvent);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Failed to load your teams',
        description: error.response?.data?.message || 'An error occurred while loading your teams',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle leaving or disbanding a team
  const handleLeaveTeam = async () => {
    if (!selectedTeam || !selectedTeam.eventId || !selectedTeam.teamId) return;
    
    try {
      setIsLeaving(true);
      const token = localStorage.getItem('token');
      const isLeader = selectedTeam.isLeader;
      
      if (isLeader) {
        // If user is the leader, delete the entire team
        await axios.delete(`${API_URL}/admin/events/${selectedTeam.eventId}/teams/${selectedTeam.teamId}`, {
          headers: { 'x-auth-token': token }
        });
        
        toast({
          title: 'Team disbanded',
          description: 'As the leader, your team has been disbanded',
        });
      } else {
        // If user is not leader, just remove themselves from the team
        await axios.delete(
          `${API_URL}/admin/events/${selectedTeam.eventId}/teams/${selectedTeam.teamId}/members/${user.id}`, 
          {
            headers: { 'x-auth-token': token }
          }
        );
        
        toast({
          title: 'Left team successfully',
          description: 'You are no longer a member of the team',
        });
      }
      
      // Refresh the team list
      fetchMyTeams();
    } catch (error) {
      console.error('Error leaving team:', error);
      toast({
        title: 'Failed to leave team',
        description: error.response?.data?.message || 'An error occurred while leaving the team',
        variant: 'destructive',
      });
    } finally {
      setIsLeaving(false);
      setConfirmLeaveDialogOpen(false);
      setSelectedTeam(null);
    }
  };

  // Function to show confirmation dialog before leaving/disbanding
  const confirmLeaveTeam = (eventId, teamId, teamName, isLeader) => {
    setSelectedTeam({
      eventId,
      teamId,
      teamName,
      isLeader
    });
    setConfirmLeaveDialogOpen(true);
  };

  // Helper function to format event date
  const formatEventDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  // Helper function to get initials from a name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-gray-400">Loading your teams...</p>
        </div>
      </div>
    );
  }

  // Empty state UI (no teams)
  if (myTeams.length === 0) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold tracking-tight mb-8">My Teams</h1>
        
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center justify-center">
            <Shield className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold">No Teams Found</h2>
            <p className="text-gray-500 mt-2 mb-6 max-w-md mx-auto">
              You haven't joined any teams yet. Browse events and join or create a team to collaborate with others.
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link to="/student/events">
                <Calendar className="mr-2 h-4 w-4" />
                Browse Events
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main component UI
  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold tracking-tight mb-8">My Teams</h1>
      
      <div className="space-y-12">
        {/* Map through each event that has teams */}
        {myTeams.map((item, eventIndex) => (
          <div key={eventIndex} className="space-y-4">
            {/* Event header */}
            <div 
              className="cursor-pointer group" 
              onClick={() => navigate(`/student/events/${item.event._id}`)}
            >
              <h2 className="text-xl font-semibold flex items-center gap-2 group-hover:text-purple-600">
                <Target className="h-5 w-5 text-purple-600" />
                {item.event.title}
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-sm text-gray-500">
                Event Date: {formatEventDate(item.event.eventDate)}
              </p>
            </div>
            
            {/* Teams grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Map through each team in the event */}
              {item.teams.map((team, teamIndex) => {
                const isLeader = team.leader === user.id;
                
                return (
                  <Card key={teamIndex} className="border-purple-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {/* Team avatar with initials */}
                          <Avatar className="h-10 w-10 bg-purple-600">
                            <AvatarFallback>
                              {getInitials(team.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                            {/* Show badge if user is leader */}
                            {isLeader && (
                              <Badge className="mt-1 bg-purple-600">Team Leader</Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Leave/Disband button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmLeaveTeam(item.event._id, team._id, team.name, isLeader);
                          }}
                        >
                          {isLeader ? 'Disband' : 'Leave'}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {/* Team description */}
                      {team.description && (
                        <p className="text-sm text-gray-600 mb-4">{team.description}</p>
                      )}
                      
                      {/* Team members section */}
                      <h4 className="font-medium mb-2 flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        Team Members ({team.members.length})
                      </h4>
                      
                      {/* Member avatars */}
                      <div className="flex flex-wrap gap-2">
                        {team.memberDetails && team.memberDetails.map((member, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center p-1 pr-3 rounded-full bg-background border"
                          >
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={member.profilePicture} alt={member.name} />
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.name}</span>
                            {/* Show crown icon for leader */}
                            {team.leader === member._id && (
                              <Crown className="h-3 w-3 text-yellow-500 ml-1" />
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* View event button */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 w-full"
                        onClick={() => navigate(`/student/events/${item.event._id}`)}
                      >
                        View Event
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Leave/Disband confirmation dialog */}
      <AlertDialog open={confirmLeaveDialogOpen} onOpenChange={setConfirmLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              {selectedTeam?.isLeader ? 'Disband Team?' : 'Leave Team?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTeam?.isLeader ? 
                `As the leader, disbanding "${selectedTeam?.teamName}" will remove the team permanently for all members.` : 
                `Are you sure you want to leave "${selectedTeam?.teamName}"? You'll need to rejoin or create a new team.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLeaveTeam}
              disabled={isLeaving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLeaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : selectedTeam?.isLeader ? (
                'Disband Team'
              ) : (
                'Leave Team'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTeams;