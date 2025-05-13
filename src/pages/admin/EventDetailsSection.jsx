import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import EditEventDialog from './EditEventDialog';
import DeleteEventDialog from './DeleteEventDialog';
import { Calendar, Clock, MapPin, Tag, Users, FileText, User, Award, Image, History, BookOpen, Code, File } from 'lucide-react';
import { Button } from '../../components/ui/button';

const EventDetailsSection = ({ event, eventTypes = [], onUpdate, onDelete }) => {
  const eventDate = new Date(event.eventDate);
  const formattedDate = format(eventDate, 'PPP');
  const formattedTime = format(eventDate, 'p');
  const eventTypeDetails = eventTypes.find((type) => type._id === event.eventType);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-900/20 text-white border-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-900/20 text-white border-red-800">Cancelled</Badge>;
      case 'upcoming':
      default:
        return <Badge variant="outline" className="bg-blue-900/20 text-white border-blue-800">Upcoming</Badge>;
    }
  };

  const visibilityLabels = {
    public: 'Public',
    students: 'Students Only',
    facilitators: 'Facilitators Only',
    invited: 'Invited Users Only',
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          {event.title}
        </h1>
        <div className="flex gap-2">
          <EditEventDialog event={event} eventTypes={eventTypes} onUpdate={onUpdate} />
          <DeleteEventDialog onDelete={onDelete} />
        </div>
      </div>

      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {event.flyer && (
            <div className="mt-4">
              <img
                src={event.flyer}
                alt="Event Flyer"
                className="w-auto rounded-lg mt-2"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            
            {eventTypeDetails ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: eventTypeDetails.color || '#8B5CF6' }}
                ></div>
                <span className="text-sm text-white">{eventTypeDetails.name}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">No event type</span>
            )}
            <div className="ml-auto">{getStatusBadge(event.status)}</div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-white">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-white">{formattedTime}</span>
          </div>
          {event.duration && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-white">
                Duration: {event.duration.value} {event.duration.unit}
              </span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-white">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-white">{event.participants?.length || 0} Participants</span>
          </div>
          {event.capacity && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-white">Capacity: {event.capacity}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-white">Visibility: {visibilityLabels[event.visibility] || 'Public'}</span>
          </div>
          {event.description && (
            <div className="mt-4">
              <h4 className="font-semibold text-white">Description</h4>
              <p className="text-gray-300">{event.description}</p>
            </div>
          )}
          
        </CardContent>
      </Card>

      {(event.guidelines?.text || event.guidelines?.pdf) && (
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="w-5 h-5" />
              Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {event.guidelines.text && (
              <div
                className="prose text-white prose-invert"
                dangerouslySetInnerHTML={{ __html: event.guidelines.text }}
              />
            )}
            {event.guidelines.pdf && (
              <div className="mt-4">
                <a
                  href={event.guidelines.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline flex items-center gap-2"
                >
                  <File className="w-4 h-4" />
                  View Guidelines PDF
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {event.anchors?.length > 0 && (
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="w-5 h-5" />
              Key Contacts (Anchors)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.anchors.map((anchor, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/30 border border-gray-800"
                >
                  <p className="font-semibold text-white">{anchor.name}</p>
                  <p className="text-gray-300">{anchor.email}</p>
                  <p className="text-gray-400 text-sm">{anchor.role}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {event.prizes?.length > 0 && (
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Award className="w-5 h-5" />
              Prizes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {event.prizes.map((prize, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/30 border border-gray-800"
                >
                  <h4 className="font-semibold text-white">{prize.title}</h4>
                  <p className="text-gray-300">Amount: ₦{prize.amount}</p>
                  {prize.description && (
                    <p className="text-gray-300 mt-2">{prize.description}</p>
                  )}
                  {prize.criteria && (
                    <p className="text-gray-400 text-sm mt-2">Criteria: {prize.criteria}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {event.media?.length > 0 && (
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Image className="w-5 h-5" />
              Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {event.media.map((media, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/30 border border-gray-800"
                >
                  {media.type === 'file' && media.mimeType?.startsWith('image') ? (
                    <img
                      src={media.url}
                      alt={media.name}
                      className="h-32 w-full object-cover rounded-lg"
                    />
                  ) : media.type === 'file' && media.mimeType?.startsWith('video') ? (
                    <video
                      src={media.url}
                      controls
                      className="h-32 w-full object-cover rounded-lg"
                    />
                  ) : (
                    <a
                      href={media.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline"
                    >
                      {media.name || media.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {event.History?.length > 0 && (
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <History className="w-5 h-5" />
              History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {event.History.map((milestone, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/30 border border-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-white">
                      {milestone.date ? format(new Date(milestone.date), 'PPP') : 'TBD'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white mt-2">{milestone.title}</h4>
                  {milestone.description && (
                    <p className="text-gray-300 mt-2">{milestone.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {event.mentorship && (
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BookOpen className="w-5 h-5" />
              Mentorship/Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{event.mentorship}</p>
          </CardContent>
        </Card>
      )}

      {event.techStack?.length > 0 && (
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Code className="w-5 h-5" />
              Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.techStack.map((tech, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/30 border border-gray-800"
                >
                  <h4 className="font-semibold text-white">{tech.name}</h4>
                  {tech.description && (
                    <p className="text-gray-300 mt-2">{tech.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {event.customFields?.length > 0 && (
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <File className="w-5 h-5" />
              Custom Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.customFields.map((field, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/30 border border-gray-800"
                >
                  <p className="font-semibold text-white">{field.key}</p>
                  <p className="text-gray-300">
                    {field.type === 'date' && field.value
                      ? format(new Date(field.value), 'PPP')
                      : field.value || 'N/A'}
                  </p>
                  <p className="text-gray-400 text-sm">Type: {field.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventDetailsSection;