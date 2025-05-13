
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CalendarX } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { Loader2 } from 'lucide-react';
import ParticipantsTable from './ParticipantsTable';
import AddParticipantDialog from './AddParticipantDialog';
import EditEventDialog from './EditEventDialog';
import DeleteEventDialog from './DeleteEventDialog';
import EventDetailsSection from './EventDetailsSection';
import TeamView from './TeamView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const { API_URL } = useTourLMS();

  useEffect(() => {
    fetchEvent();
    fetchEventTypes();
  }, [id, API_URL]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/events/${id}`, {
        headers: { 'x-auth-token': token },
      });
      setEvent(response.data);
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

  const fetchEventTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/event-types`, {
        headers: { 'x-auth-token': token },
      });
      setEventTypes(response.data);
    } catch (error) {
      console.error('Error fetching event types:', error);
    }
  };

  const updateEvent = async (eventData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/events/${id}`, eventData, {
        headers: { 'x-auth-token': token },
      });
      toast({
        title: 'Event updated',
        description: 'Event details have been updated successfully',
        variant: 'success',
      });
      fetchEvent();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Failed to update event',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/events/${id}`, {
        headers: { 'x-auth-token': token },
      });
      toast({
        title: 'Event deleted',
        description: 'Event has been deleted successfully',
        variant: 'default',
      });
      navigate('/oracle/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Failed to delete event',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const addParticipant = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/events/${id}/register/${userId}`,
        {},
        {
          headers: { 'x-auth-token': token },
        }
      );
      toast({
        title: 'Participant added',
        description: 'User has been added to the event',
        variant: 'success',
      });
      fetchEvent();
    } catch (error) {
      console.error('Error adding participant:', error);
      toast({
        title: 'Failed to add participant',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const removeParticipant = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/events/${id}/register/${userId}`, {
        headers: { 'x-auth-token': token },
      });
      toast({
        title: 'Participant removed',
        description: 'User has been removed from the event',
        variant: 'default',
      });
      fetchEvent();
    } catch (error) {
      console.error('Error removing participant:', error);
      toast({
        title: 'Failed to remove participant',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    }
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
          <Link to="/oracle/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" className="mb-6" asChild>
        <Link
          to="/oracle/events"
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          <span>Back to Events</span>
        </Link>
      </Button>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>
        <TabsList>

      <TabsContent value="details" className="mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <EventDetailsSection
              event={event}
              eventTypes={eventTypes}
              onUpdate={updateEvent}
              onDelete={deleteEvent}
            />
          </div>

          {/* Participants Summary */}
          <div>
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold leading-none tracking-tight">Participants</h3>
                <p className="text-sm text-muted-foreground">
                  {event.participantDetails?.length || 0} participants registered
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="mb-4">
                  <AddParticipantDialog
                    onAdd={addParticipant}
                    excludeIds={event.participantDetails?.map((p) => p._id) || []}
                  />
                </div>
                {event.participantDetails?.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    <ParticipantsTable
                      participants={event.participantDetails.slice(0, 5)}
                      onRemove={removeParticipant}
                      showAll={false}
                    />
                    {event.participantDetails.length > 5 && (
                      <Button
                        variant="link"
                        onClick={() => setActiveTab("participants")}
                        className="mt-2 w-full"
                      >
                        Show all {event.participantDetails.length} participants
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">No participants yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="participants" className="mt-0">
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Participants</h3>
            <AddParticipantDialog
              onAdd={addParticipant}
              excludeIds={event.participantDetails?.map((p) => p._id) || []}
            />
          </div>
          <ParticipantsTable
            participants={event.participantDetails || []}
            onRemove={removeParticipant}
          />
        </div>
      </TabsContent>

      <TabsContent value="teams" className="mt-0">
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <TeamView eventId={id} />
        </div>
      </TabsContent>
        </TabsList>
      </Tabs>

    </div>
  );
};

export default EventDetail;
