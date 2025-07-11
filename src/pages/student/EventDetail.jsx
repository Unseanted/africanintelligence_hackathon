import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Users, Award, PenTool, 
  Loader2, FileText, CalendarX, Share2, Monitor, UserPlus, Shield, 
  AlignJustify, BookOpen, Target, Printer, Download, Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useAuth } from '@/contexts/AuthContext';
import TeamFormDialog from '@/components/teams/TeamFormDialog';
import TeamsList from '@/components/teams/TeamsList';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ShareEventButton from '@/components/events/ShareEventButton';
import { clg, ocn } from '../../lib/basic';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { API_URL } = useTourLMS();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegisteringForEvent, setIsRegisteringForEvent] = useState(false);
  const [guidelinesToc, setGuidelinesToc] = useState([]);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if(!ocn(event))return;
    if (user && event.participants) {
        setIsParticipant(event.participants.includes(user.id));
        setParticipantCount(event.participants.length);
      }
      
  },[event,user])

  // Extract table of contents from guidelines HTML
  useEffect(() => {
    if (event?.guidelines) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = event.guidelines;
      const headings = tempDiv.querySelectorAll('h1, h2, h3');
      const toc = Array.from(headings).map((heading, index) => ({
        id: `guideline-${index}`,
        text: heading.textContent,
        level: parseInt(heading.tagName.charAt(1)),
        element: heading
      }));
      setGuidelinesToc(toc);
    }
  }, [event?.guidelines]);
  
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/events/${id}`, {
        headers: { 'x-auth-token': token },
      });
      
      const eventData = response.data;
      clg('event data - ',eventData)
      setEvent(eventData);
      
      // Check if current user is a participant
      if (user && eventData.participants) {
        setIsParticipant(eventData.participants.includes(user.id));
        setParticipantCount(eventData.participants.length);
      }
      
      // Count teams if available
      if (eventData.teams) {
        setTeamCount(eventData.teams.length);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: 'Failed to load event details',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = async () => {
    try {
      setIsRegisteringForEvent(true);
      const token = localStorage.getItem('token');
      
      if (isParticipant) {
        // Leave the event
        const response = await axios.delete(`${API_URL}/events/${id}/leave/`, {
          headers: { 'x-auth-token': token },
        });
        
        toast({
          title: 'Successfully left the event',
          variant: 'default',
        });
        
        setIsParticipant(false);
        setParticipantCount(prev => Math.max(0, prev - 1));
        
        // Update capacity if provided
        if (response.data.remainingCapacity !== undefined) {
          // This will be updated when we refresh event data
        }
      } else {
        // Join the event
        const response = await axios.post(`${API_URL}/events/${id}/register/`, {}, {
          headers: { 'x-auth-token': token },
        });
        
        toast({
          title: 'Successfully joined the event',
          variant: 'success',
        });
        
        setIsParticipant(true);
        setParticipantCount(prev => prev + 1);
        
        // Update capacity if provided
        if (response.data.remainingCapacity !== undefined) {
          // This will be updated when we refresh event data
        }
      }
      
      // Refresh event data
      fetchEventDetails();
    } catch (error) {
      console.error('Error updating participation:', error);
      toast({
        title: isParticipant ? 'Failed to leave event' : 'Failed to join event',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsRegisteringForEvent(false);
    }
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <CalendarX className="w-16 h-16 mx-auto text-gray-600 mb-3" />
        <h2 className="text-2xl font-bold text-gray-300">Event Not Found</h2>
        <p className="text-gray-400 mt-2">
          The event you are looking for does not exist or has been deleted
        </p>
        <Button asChild className="mt-6">
          <Link to="/student/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const isEventPast = new Date(event.date) < new Date();

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <Button variant="ghost" className="mb-6" asChild>
        <Link
          to="/student/events"
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          <span>Back to Events</span>
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Header */}
          <div className="relative rounded-lg overflow-hidden">
            <div className="h-64 w-full">
              {event.media ? (
                <img 
                  src={event.media[0]} 
                  alt={event.title} 
                  className={`w-full h-full object-cover ${isEventPast ? 'grayscale' : ''}`}
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-r ${isEventPast ? 'from-gray-600 to-gray-800' : 'from-purple-600 to-blue-600'} flex items-center justify-center`}>
                  <Calendar className="h-24 w-24 text-white" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-6">
              {event.eventTypeDetails && (
                <Badge 
                  className="self-start mb-3" 
                  style={{ backgroundColor: event.eventTypeDetails.color || '#8B5CF6' }}
                >
                  {event.eventTypeDetails.name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-white">{event.title}</h1>
            </div>
          </div>

          {/* Event Tabs */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Event Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{event.description}</p>
                </CardContent>
              </Card>



              {event.timeline && event.timeline.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="relative border-l border-purple-200 dark:border-purple-800">
                      {event.timeline.map((item, index) => (
                        <li key={index} className="mb-6 ml-4">
                          <div className="absolute w-3 h-3 bg-purple-600 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900"></div>
                          <time className="mb-1 text-sm font-normal leading-none text-gray-400">{item.date}</time>
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <p className="text-base font-normal text-gray-500">{item.description}</p>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {event.prizes && event.prizes.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-5 w-5" />
                      Prizes & Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {event.prizes.map((prize, index) => {
                        // Handle both old string format and new object format
                        const prizeData = typeof prize === 'string' ? {
                          title: prize,
                          category: 'other',
                          value: 'TBD',
                          description: 'Prize details to be announced',
                          eligibility: 'Open to all participants',
                          rank: index + 1
                        } : prize;

                        const isFirst = prizeData.rank === 1;
                        const isSecond = prizeData.rank === 2;
                        const isThird = prizeData.rank === 3;
                        
                        // Category colors and icons
                        const categoryConfig = {
                          cash: {
                            color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                            border: 'border-green-200 dark:border-green-700',
                            icon: '💰',
                            badgeColor: 'bg-green-500',
                            textColor: 'text-green-800 dark:text-green-200'
                          },
                          experience: {
                            color: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
                            border: 'border-blue-200 dark:border-blue-700',
                            icon: '🎯',
                            badgeColor: 'bg-blue-500',
                            textColor: 'text-blue-800 dark:text-blue-200'
                          },
                          recognition: {
                            color: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
                            border: 'border-purple-200 dark:border-purple-700',
                            icon: '🏆',
                            badgeColor: 'bg-purple-500',
                            textColor: 'text-purple-800 dark:text-purple-200'
                          },
                          resources: {
                            color: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
                            border: 'border-orange-200 dark:border-orange-700',
                            icon: '📚',
                            badgeColor: 'bg-orange-500',
                            textColor: 'text-orange-800 dark:text-orange-200'
                          },
                          opportunity: {
                            color: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
                            border: 'border-pink-200 dark:border-pink-700',
                            icon: '🚀',
                            badgeColor: 'bg-pink-500',
                            textColor: 'text-pink-800 dark:text-pink-200'
                          },
                          other: {
                            color: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
                            border: 'border-gray-200 dark:border-gray-700',
                            icon: '🎁',
                            badgeColor: 'bg-gray-500',
                            textColor: 'text-gray-800 dark:text-gray-200'
                          }
                        };

                        const config = categoryConfig[prizeData.category] || categoryConfig.other;
                        
                        return (
                          <div 
                            key={index} 
                            className={`
                              relative p-6 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                              ${config.color} ${config.border}
                            `}
                          >
                            {/* Prize Rank Badge */}
                            <div className="absolute -top-3 -left-3">
                              <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                                ${isFirst ? 'bg-yellow-500' : isSecond ? 'bg-gray-500' : isThird ? 'bg-orange-500' : config.badgeColor}
                              `}>
                                {prizeData.rank}
                              </div>
                            </div>

                            {/* Category Badge */}
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary" className="text-xs">
                                {config.icon} {prizeData.category.charAt(0).toUpperCase() + prizeData.category.slice(1)}
                              </Badge>
                            </div>

                            {/* Prize Content */}
                            <div className="space-y-4">
                              {/* Prize Icon and Title */}
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">
                                  {config.icon}
                                </div>
                                <div className="flex-1">
                                  <h4 className={`
                                    font-bold text-xl mb-2 ${config.textColor}
                                  `}>
                                    {prizeData.title}
                                  </h4>
                                  
                                  {/* Prize Value */}
                                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 mb-3">
                                    <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                      {prizeData.value}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Prize Description */}
                              <div className="space-y-3">
                                <div>
                                  <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    What you'll get:
                                  </h5>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                    {prizeData.description}
                                  </p>
                                </div>

                                {/* Eligibility */}
                                <div>
                                  <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Eligibility:
                                  </h5>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {prizeData.eligibility}
                                  </p>
                                </div>
                              </div>

                              {/* Action Button */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-4"
                                onClick={() => {
                                  toast({
                                    title: "Prize Details",
                                    description: `Learn more about the ${prizeData.title} prize!`,
                                  });
                                }}
                              >
                                Learn More
                              </Button>
                            </div>
                        </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="guidelines">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Event Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {event.guidelines ? (
                    <div className="space-y-6">
                      {/* Table of Contents */}
                      {guidelinesToc.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <AlignJustify className="h-4 w-4" />
                            Table of Contents
                          </h4>
                          <nav className="space-y-1">
                            {guidelinesToc.map((item, index) => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  const element = document.querySelector(`h${item.level}`);
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }}
                                className={`
                                  block w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                                  ${item.level === 1 
                                    ? 'font-semibold text-gray-900 dark:text-gray-100' 
                                    : item.level === 2 
                                    ? 'font-medium text-gray-700 dark:text-gray-300 ml-4' 
                                    : 'text-gray-600 dark:text-gray-400 ml-8'
                                  }
                                  hover:bg-gray-200 dark:hover:bg-gray-800
                                `}
                              >
                                {item.text}
                              </button>
                            ))}
                          </nav>
                        </div>
                      )}

                      {/* Guidelines Content */}
                      <div className="prose dark:prose-invert max-w-none">
                        <div 
                          dangerouslySetInnerHTML={{ __html: event.guidelines }} 
                          className="
                            prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                            prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4
                            prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-6
                            prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2 prose-h3:mt-4
                            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                            prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                            prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                            prose-li:my-1
                            prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
                            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                            prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic
                            prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:underline
                          "
                        />
                      </div>

                      {/* Quick Actions */}
                      <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                          Quick Actions
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-2"
                            onClick={() => window.print()}
                          >
                            <Printer className="h-4 w-4" />
                            Print Guidelines
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-2"
                            onClick={() => {
                              navigator.share?.({
                                title: `${event.title} - Guidelines`,
                                text: 'Check out the event guidelines!',
                                url: window.location.href
                              }).catch(() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast({
                                  title: 'Link copied!',
                                  description: 'Event guidelines link copied to clipboard',
                                });
                              });
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                            Share Guidelines
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-2"
                            onClick={() => {
                              // Save to localStorage for later
                              const savedGuidelines = JSON.parse(localStorage.getItem('savedGuidelines') || '[]');
                              const newGuideline = {
                                id: event._id,
                                title: event.title,
                                date: new Date().toISOString(),
                                url: window.location.href
                              };
                              if (!savedGuidelines.find(g => g.id === event._id)) {
                                savedGuidelines.push(newGuideline);
                                localStorage.setItem('savedGuidelines', JSON.stringify(savedGuidelines));
                                toast({
                                  title: 'Guidelines saved!',
                                  description: 'You can find this in your saved items',
                                });
                              } else {
                                toast({
                                  title: 'Already saved',
                                  description: 'These guidelines are already in your saved items',
                                });
                              }
                            }}
                          >
                            <Bookmark className="h-4 w-4" />
                            Save for Later
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No Guidelines Available
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Guidelines for this event haven't been provided yet. Check back later or contact the event organizer.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {event.techStack && event.techStack.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Monitor className="mr-2 h-5 w-5" />
                      Technology Stack
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {event.techStack.map((tech, index) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="teams">
              {!isParticipant ? (
                <Alert className="mb-6">
                  <Shield className="h-4 w-4" />
                  <AlertTitle>You need to join this event first</AlertTitle>
                  <AlertDescription>
                    Please register for the event before creating or joining teams.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Teams</h3>
                    <TeamFormDialog 
                      eventId={id}
                      onTeamCreated={() => fetchEventDetails()}
                    />
                  </div>

                  <TeamsList 
                    eventId={id} 
                    userId={user.id}
                    onTeamsUpdated={() => fetchEventDetails()}
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Actions */}
          <Card className="bg-gradient-to-br from-purple-50/10 to-blue-50/10 backdrop-blur-sm border-purple-200/20">
            <CardContent className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatEventDate(event.date)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{event.location || 'Virtual'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {event.duration || 'TBD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="font-medium">
                      {participantCount}
                      {event.capacity && (
                        <span className="text-gray-400"> / {event.capacity}</span>
                      )}
                    </p>
                  </div>
                </div>

                {event.capacity && (
                  <div className="flex items-center">
                    <Target className="h-5 w-5 mr-3 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Remaining Spots</p>
                      <p className="font-medium">
                        {event.remainingCapacity !== null ? event.remainingCapacity : 'Unlimited'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <CalendarX className="h-5 w-5 mr-3 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Registration Deadline</p>
                    <p className="font-medium">{formatEventDate(event.deadline)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-3 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Teams</p>
                    <p className="font-medium">{teamCount}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {!isEventPast ? (
                <>
                  {!event.isRegistrationOpen ? (
                    <Button disabled className="w-full bg-gray-600">
                      Registration Closed
                    </Button>
                  ) : !event.hasCapacity ? (
                    <Button disabled className="w-full bg-red-600">
                      Event Full
                    </Button>
                  ) : (
                <Button 
                  onClick={handleParticipate} 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isRegisteringForEvent}
                >
                  {isRegisteringForEvent ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : isParticipant ? (
                    'Leave Event'
                  ) : (
                    'Join Event'
                  )}
                </Button>
                  )}
                </>
              ) : (
                <Button disabled className="w-full">
                  Event Ended
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Mentorship Info */}
          {event.mentorship && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PenTool className="mr-2 h-5 w-5" />
                  Mentorship
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{event.mentorship}</p>
              </CardContent>
            </Card>
          )}

          {/* Event Share */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="mr-2 h-5 w-5" />
                Share Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <ShareEventButton eventTitle={event.title} eventId={id} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
