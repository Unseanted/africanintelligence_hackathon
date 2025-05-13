import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Plus, 
  Trash, 
  Edit, 
  ChevronRight, 
  Users, 
  Clock, 
  MapPin,
  Tag,
  Search,
  Filter,
  RefreshCcw,
  CheckCircle,
  XCircle,
  CalendarX,
  CircleEllipsis
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { useToast } from '../../components/ui/use-toast';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { Skeleton } from '../../components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import Select from 'react-select';
import { useDropzone } from 'react-dropzone';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { clg } from '../../lib/basic';

// Custom styles for react-select
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    color: '#fff',
    boxShadow: 'none',
    '&:hover': { borderColor: '#8B5CF6' }
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    color: '#fff'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#4B5563' : '#1F2937',
    color: '#fff',
    '&:hover': { backgroundColor: '#374151' }
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#fff'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#D1D5DB'
  })
};

// ReactQuill custom styles
const quillStyles = `
  .ql-container {
    background-color: #1F2937;
    color: #fff;
    border-color: #374151;
  }
  .ql-toolbar {
    background-color: #1F2937;
    border-color: #374151;
  }
  .ql-toolbar .ql-stroke {
    stroke: #fff;
  }
  .ql-toolbar .ql-fill {
    fill: #fff;
  }
  .ql-toolbar .ql-picker {
    color: #fff;
  }
  .ql-editor::before {
    color: #D1D5DB;
  }
`;

// Event Type Components
const EventTypeItem = ({ eventType, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-800 text-white">
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full" 
          style={{ backgroundColor: eventType.color }}
        ></div>
        <div>
          <h3 className="font-medium text-white">{eventType.name}</h3>
          {eventType.description && (
            <p className="text-sm text-white">{eventType.description}</p>
          )}
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
        onClick={() => onDelete(eventType._id)}
      >
        <Trash size={16} />
      </Button>
    </div>
  );
};

const CreateEventTypeDialog = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) return;
    setLoading(true);
    try {
      await onSubmit({ name, description, color });
      setOpen(false);
      setName('');
      setDescription('');
      setColor('#8B5CF6');
    } catch (error) {
      console.error('Error creating event type:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-gray-700 bg-gray-800/50 text-white">
          <Plus size={16} />
          <span>New Type</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Event Type</DialogTitle>
          <DialogDescription className="text-white">Add a new event type for categorizing events</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter event type name"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color" className="text-white">Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 p-1 bg-transparent"
              />
              <div className="flex-1 h-10 rounded-md" style={{ backgroundColor: color }}></div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="text-white">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!name || loading}
            className="gap-2 text-white"
          >
            {loading && <RefreshCcw className="w-4 h-4 animate-spin" />}
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Event Components
const EventItem = ({ event }) => {
  const eventDate = new Date(event.eventDate);
  const formattedDate = format(eventDate, 'PPP');
  const formattedTime = format(eventDate, 'p');
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return <Badge variant="outline" className="bg-green-900/20 text-white border-green-800">Completed</Badge>;
      case 'cancelled': return <Badge variant="outline" className="bg-red-900/20 text-white border-red-800">Cancelled</Badge>;
      case 'upcoming': default: return <Badge variant="outline" className="bg-blue-900/20 text-white border-blue-800">Upcoming</Badge>;
    }
  };
  const eventTypeColor = event.eventTypeDetails?.color || '#8B5CF6';
  return (
    <Link to={`/oracle/events/${event._id}`} >
      <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-800 text-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {event.eventTypeDetails ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: eventTypeColor }}></div>
                <span className="text-sm text-white">{event.eventTypeDetails.name}</span>
              </div>
            ) : <div></div>}
            <div className="ml-auto">{getStatusBadge(event.status)}</div>
          </div>
          <h3 className="text-lg font-medium text-white">{event.title}</h3>
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center gap-2 text-sm text-white my-2">
              <Calendar className="w-4 h-4" />
              <div >
              <span className="block">{formattedDate}</span>
              <span>{event.duration?.value} {event.duration?.unit}</span>
              </div>
              
            </div>
            <div className="flex items-center gap-2 text-sm text-white">
              <Clock className="w-4 h-4" />
              <span>{formattedTime}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-white">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-white" />
          <span className="text-sm text-white">{event.participants?.length || 0} participants</span>
        </div>
        <Link 
          to={`/oracle/events/${event._id}`}
          className="p-2 text-white hover:text-gray-200 hover:bg-gray-700/50 rounded-full transition-colors"
        >
          <ChevronRight size={18} />
        </Link>
      </div>
    </div>
    </Link>
  );
};

// Create Event Dialog
const CreateEventDialog = ({ eventTypes = [], onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    flyer: '',
    flyerType: 'file', // 'file' or 'url'
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    eventType: '',
    status: 'upcoming',
    capacity: '',
    duration: { value: '', unit: 'Days' },
    visibility: 'public',
    guidelinesText: '',
    guidelinesPDF: '',
    anchors: [],
    prizes: [],
    media: [],
    timeline: [],
    mentorship: '',
    techStack: [],
    customFields: []
  });
  const [guidelinesMode, setGuidelinesMode] = useState('text'); // 'text' or 'pdf'
  const [openSections, setOpenSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [flyerPreviewError, setFlyerPreviewError] = useState(false);
  const { toast } = useToast();
  const { API_URL } = useTourLMS();

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDurationChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      duration: { ...prev.duration, [key]: value }
    }));
  };

  const addDynamicItem = (field, item) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], item] }));
  };

  const removeDynamicItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const updateDynamicItem = (field, index, updatedItem) => {
    setFormData(prev => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = updatedItem;
      return { ...prev, [field]: updatedArray };
    });
  };

  const validateURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      'video/mp4': ['.mp4']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        toast({
          title: 'File Error',
          description: 'Files must be PNG/JPEG/PDF/MP4 and under 10MB.',
          variant: 'destructive'
        });
        return;
      }
      for (const file of acceptedFiles) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileType', file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document');
          if (formData.flyer && formData.flyerType === 'file' && file.type.startsWith('image')) {
            formData.append('xfileUrl', formData.flyer);
          }
          const token = localStorage.getItem('token');
          const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'x-auth-token': token }
          });
          if (guidelinesMode === 'pdf' && file.type === 'application/pdf') {
            handleInputChange('guidelinesPDF', response.data.fileUrl);
          } else if (file.type.startsWith('image')) {
            handleInputChange('flyer', response.data.fileUrl);
            handleInputChange('flyerType', 'file');
            setFlyerPreviewError(false);
          } else {
            addDynamicItem('media', { type: 'file', url: response.data.fileUrl, name: file.name, mimeType: file.type });
          }
          toast({ title: 'File Uploaded', description: `${file.name} uploaded successfully`, variant: 'default' });
        } catch (error) {
          console.error('Error uploading file:', error);
          toast({
            title: 'Upload Failed',
            description: error.response?.data?.error || 'Failed to upload file',
            variant: 'destructive'
          });
        }
      }
    }
  });

  const handleFlyerURLChange = (url) => {
    handleInputChange('flyer', url);
    handleInputChange('flyerType', 'url');
    setFlyerPreviewError(false);
  };

  const handleFlyerImageError = () => {
    setFlyerPreviewError(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.eventDate || !formData.eventTime || !formData.status) {
      toast({ title: 'Missing Fields', description: 'Title, date, time, and status are required.', variant: 'destructive' });
      return;
    }
    if (formData.duration.value && !formData.duration.unit) {
      toast({ title: 'Missing Duration Unit', description: 'Please select a duration unit.', variant: 'destructive' });
      return;
    }
    if (formData.flyerType === 'url' && formData.flyer && !validateURL(formData.flyer)) {
      toast({ title: 'Invalid Flyer URL', description: 'Please enter a valid URL for the flyer.', variant: 'destructive' });
      return;
    }
    const dateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
    if (isNaN(dateTime)) {
      toast({ title: 'Invalid Date', description: 'Please enter a valid date and time.', variant: 'destructive' });
      return;
    }
    for (const media of formData.media) {
      if (media.type === 'url' && !validateURL(media.url)) {
        toast({ title: 'Invalid URL', description: `Media URL "${media.url}" is invalid.`, variant: 'destructive' });
        return;
      }
    }
    setLoading(true);
    try {
      await onSubmit({
        title: formData.title,
        flyer: formData.flyer,
        description: formData.description,
        eventDate: dateTime,
        location: formData.location,
        eventType: formData.eventType,
        status: formData.status,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        duration: formData.duration.value ? { value: parseInt(formData.duration.value, 10), unit: formData.duration.unit } : null,
        visibility: formData.visibility,
        guidelines: { text: formData.guidelinesText, pdf: formData.guidelinesPDF },
        anchors: formData.anchors,
        prizes: formData.prizes,
        media: formData.media,
        timeline: formData.timeline,
        mentorship: formData.mentorship,
        techStack: formData.techStack,
        customFields: formData.customFields
      });
      setOpen(false);
      setFormData({
        title: '',
        flyer: '',
        flyerType: 'file',
        description: '',
        eventDate: '',
        eventTime: '',
        location: '',
        eventType: '',
        status: 'upcoming',
        capacity: '',
        duration: { value: '', unit: 'Days' },
        visibility: 'public',
        guidelinesText: '',
        guidelinesPDF: '',
        anchors: [],
        prizes: [],
        media: [],
        timeline: [],
        mentorship: '',
        techStack: [],
        customFields: []
      });
      setGuidelinesMode('text');
      setOpenSections({});
      setFlyerPreviewError(false);
      toast({ title: 'Event Created', description: 'Event has been created successfully.', variant: 'default' });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Failed to Create Event',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const eventTypeOptions = [
    { value: '', label: 'None' },
    ...eventTypes.map(type => ({
      value: type._id,
      label: (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
          <span>{type.name}</span>
        </div>
      )
    }))
  ];

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'students', label: 'Students Only' },
    { value: 'facilitators', label: 'Facilitators Only' },
    { value: 'invited', label: 'Invited Users Only' }
  ];

  const durationUnitOptions = [
    { value: 'Hours', label: 'Hours' },
    { value: 'Days', label: 'Days' },
    { value: 'Weeks', label: 'Weeks' },
    { value: 'Months', label: 'Months' }
  ];

  const customFieldTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 text-white bg-green-600 hover:bg-green-700">
          <Plus size={16} />
          <span>Create Event</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border border-gray-800 max-w-4xl max-h-[80vh] overflow-y-auto text-white">
        <style>{quillStyles}</style>
        <DialogHeader>
          <DialogTitle className="text-white">Create New Event</DialogTitle>
          <DialogDescription className="text-white">Add details for your new event</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className="text-white">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter event title"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-white">Event Flyer (Optional)</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    variant={formData.flyerType === 'file' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('flyerType', 'file')}
                    className="text-white bg-orange-600 hover:bg-orange-700"
                  >
                    Upload File
                  </Button>
                  <Button
                    variant={formData.flyerType === 'url' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('flyerType', 'url')}
                    className="text-white bg-orange-600 hover:bg-orange-700"
                  >
                    Enter URL
                  </Button>
                </div>
                {formData.flyerType === 'file' ? (
                  <div
                    {...getRootProps()}
                    className={`p-4 border-2 border-dashed rounded-lg text-center ${isDragActive ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800/50'}`}
                  >
                    <input {...getInputProps()} accept="image/png,image/jpeg" />
                    <p className="text-white">Drag and drop an image here, or click to select</p>
                    <p className="text-sm text-gray-300">Max 10MB, PNG/JPEG only</p>
                  </div>
                ) : (
                  <Input
                    value={formData.flyer}
                    onChange={(e) => handleFlyerURLChange(e.target.value)}
                    placeholder="Enter flyer image URL"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                  />
                )}
                {formData.flyer && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-white mb-1">Preview</p>
                    {flyerPreviewError ? (
                      <div className="p-4 bg-gray-800/30 border border-red-800 rounded-lg text-white">
                        Unable to load flyer image
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <img
                          src={formData.flyer}
                          alt="Flyer Preview"
                          className="h-20 w-20 object-cover rounded"
                          onError={handleFlyerImageError}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            handleInputChange('flyer', '');
                            setFlyerPreviewError(false);
                          }}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter event description"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-white">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-white">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => handleInputChange('eventTime', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter event location"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-white">Capacity (Optional)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  placeholder="Maximum participants"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-white">Duration (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration.value}
                    onChange={(e) => handleDurationChange('value', e.target.value)}
                    placeholder="Enter duration"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                  />
                  <Select
                    id="durationUnit"
                    value={durationUnitOptions.find(opt => opt.value === formData.duration.unit)}
                    onChange={(option) => handleDurationChange('unit', option ? option.value : 'Days')}
                    options={durationUnitOptions}
                    styles={customSelectStyles}
                    placeholder="Select unit"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-white">Event Type</Label>
                <Select
                  id="eventType"
                  value={eventTypeOptions.find(option => option.value === formData.eventType)}
                  onChange={(option) => handleInputChange('eventType', option ? option.value : '')}
                  options={eventTypeOptions}
                  styles={customSelectStyles}
                  placeholder="Select event type"
                  isClearable
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">Status</Label>
                <Select
                  id="status"
                  value={statusOptions.find(option => option.value === formData.status)}
                  onChange={(option) => handleInputChange('status', option ? option.value : 'upcoming')}
                  options={statusOptions}
                  styles={customSelectStyles}
                  placeholder="Select status"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility" className="text-white">Visibility</Label>
                <Select
                  id="visibility"
                  value={visibilityOptions.find(option => option.value === formData.visibility)}
                  onChange={(option) => handleInputChange('visibility', option ? option.value : 'public')}
                  options={visibilityOptions}
                  styles={customSelectStyles}
                  placeholder="Select visibility"
                />
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Guidelines</h3>
              <Button 
                onClick={() => toggleSection('guidelines')} 
                className="text-white bg-orange-600 hover:bg-orange-700"
              >
                {openSections.guidelines ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.guidelines && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                <div className="space-y-2">
                  <Label className="text-white">Guidelines Format</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={guidelinesMode === 'text' ? 'default' : 'outline'}
                      onClick={() => setGuidelinesMode('text')}
                      className="text-white bg-orange-600 hover:bg-orange-700"
                    >
                      Rich Text
                    </Button>
                    <Button
                      variant={guidelinesMode === 'pdf' ? 'default' : 'outline'}
                      onClick={() => setGuidelinesMode('pdf')}
                      className="text-white bg-orange-600 hover:bg-orange-700"
                    >
                      PDF Upload
                    </Button>
                  </div>
                </div>
                {guidelinesMode === 'text' ? (
                  <div className="space-y-2">
                    <Label htmlFor="guidelinesText" className="text-white">Guidelines Text</Label>
                    <ReactQuill
                      id="guidelinesText"
                      value={formData.guidelinesText}
                      onChange={(value) => handleInputChange('guidelinesText', value)}
                      theme="snow"
                      className="bg-gray-800 text-white"
                      style={{ minHeight: '200px' }}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-white">Guidelines PDF</Label>
                    <div
                      {...getRootProps()}
                      className={`p-4 border-2 border-dashed rounded-lg text-center ${isDragActive ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800/50'}`}
                    >
                      <input {...getInputProps()} accept="application/pdf" />
                      <p className="text-white">Drag and drop a PDF file here, or click to select</p>
                      <p className="text-sm text-gray-300">Max 10MB, PDF only</p>
                    </div>
                    {formData.guidelinesPDF && (
                      <div className="flex items-center gap-2 mt-2">
                        <a href={formData.guidelinesPDF} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          View Uploaded PDF
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white bg-red-600 hover:bg-red-700"
                          onClick={() => handleInputChange('guidelinesPDF', '')}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Anchors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Key Contacts (Anchors)</h3>
              <Button 
                onClick={() => toggleSection('anchors')} 
                className="text-white bg-orange-600 hover:bg-orange-700"
              >
                {openSections.anchors ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.anchors && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.anchors.map((anchor, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-700 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-white">Name</Label>
                      <Input
                        value={anchor.name}
                        onChange={(e) => updateDynamicItem('anchors', index, { ...anchor, name: e.target.value })}
                        placeholder="Enter name"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Email</Label>
                      <Input
                        type="email"
                        value={anchor.email}
                        onChange={(e) => updateDynamicItem('anchors', index, { ...anchor, email: e.target.value })}
                        placeholder="Enter email"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Role</Label>
                      <Input
                        value={anchor.role}
                        onChange={(e) => updateDynamicItem('anchors', index, { ...anchor, role: e.target.value })}
                        placeholder="Enter role"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white bg-red-600 hover:bg-red-700"
                      onClick={() => removeDynamicItem('anchors', index)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => addDynamicItem('anchors', { name: '', email: '', role: '' })}
                  className="text-white bg-green-600 hover:bg-green-700"
                >
                  Add Anchor
                </Button>
              </div>
            )}
          </div>

          {/* Prizes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Prizes</h3>
              <Button 
                onClick={() => toggleSection('prizes')} 
                className="text-white bg-orange-600 hover:bg-orange-700"
              >
                {openSections.prizes ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.prizes && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.prizes.map((prize, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-700 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-white">Title</Label>
                      <Input
                        value={prize.title}
                        onChange={(e) => updateDynamicItem('prizes', index, { ...prize, title: e.target.value })}
                        placeholder="Enter prize title"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Amount (NGN)</Label>
                      <Input
                        type="number"
                        value={prize.amount}
                        onChange={(e) => updateDynamicItem('prizes', index, { ...prize, amount: e.target.value })}
                        placeholder="Enter amount"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white">Description</Label>
                      <Textarea
                        value={prize.description}
                        onChange={(e) => updateDynamicItem('prizes', index, { ...prize, description: e.target.value })}
                        placeholder="Enter prize description"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white">Criteria</Label>
                      <Textarea
                        value={prize.criteria}
                        onChange={(e) => updateDynamicItem('prizes', index, { ...prize, criteria: e.target.value })}
                        placeholder="Enter prize criteria"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white bg-red-600 hover:bg-red-700"
                      onClick={() => removeDynamicItem('prizes', index)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => addDynamicItem('prizes', { title: '', amount: '', description: '', criteria: '' })}
                  className="text-white bg-green-600 hover:bg-green-700"
                >
                  Add Prize
                </Button>
              </div>
            )}
          </div>

          {/* Media */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Media</h3>
              <Button 
                onClick={() => toggleSection('media')} 
                className="text-white bg-orange-600 hover:bg-orange-700"
              >
                {openSections.media ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.media && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.media.map((media, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-700 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-white">Type</Label>
                      <Select
                        value={[{ value: 'url', label: 'URL' }, { value: 'file', label: 'File' }].find(opt => opt.value === media.type)}
                        onChange={(option) => updateDynamicItem('media', index, { ...media, type: option.value, url: '', name: '' })}
                        options={[{ value: 'url', label: 'URL' }, { value: 'file', label: 'File' }]}
                        styles={customSelectStyles}
                      />
                    </div>
                    {media.type === 'url' ? (
                      <div className="space-y-2">
                        <Label className="text-white">URL</Label>
                        <Input
                          value={media.url}
                          onChange={(e) => updateDynamicItem('media', index, { ...media, url: e.target.value })}
                          placeholder="Enter media URL"
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-white">Uploaded File</Label>
                        {media.url ? (
                          <div className="flex items-center gap-2">
                            {media.mimeType.startsWith('image') ? (
                              <img src={media.url} alt={media.name} className="h-20 w-20 object-cover rounded" />
                            ) : (
                              <a href={media.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                {media.name}
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white bg-red-600 hover:bg-red-700"
                              onClick={() => updateDynamicItem('media', index, { ...media, url: '', name: '', mimeType: '' })}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        ) : (
                          <div
                            {...getRootProps()}
                            className={`p-4 border-2 border-dashed rounded-lg text-center ${isDragActive ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800/50'}`}
                          >
                            <input {...getInputProps()} />
                            <p className="text-white">Drag and drop a file here, or click to select</p>
                            <p className="text-sm text-gray-300">Max 10MB, PNG/JPEG/PDF/MP4</p>
                          </div>
                        )}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white bg-red-600 hover:bg-red-700"
                      onClick={() => removeDynamicItem('media', index)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => addDynamicItem('media', { type: 'url', url: '', name: '', mimeType: '' })}
                  className="text-white bg-green-600 hover:bg-green-700"
                >
                  Add Media
                </Button>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Timeline</h3>
              <Button 
                onClick={() => toggleSection('timeline')} 
                className="text-white bg-orange-600 hover:bg-orange-700"
              >
                {openSections.timeline ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.timeline && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.timeline.map((milestone, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-700 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-white">Date</Label>
                      <Input
                        type="date"
                        value={milestone.date}
                        onChange={(e) => updateDynamicItem('timeline', index, { ...milestone, date: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Title</Label>
                      <Input
                        value={milestone.title}
                        onChange={(e) => updateDynamicItem('timeline', index, { ...milestone, title: e.target.value })}
                        placeholder="Enter milestone title"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white">Description</Label>
                      <Textarea
                        value={milestone.description}
                        onChange={(e) => updateDynamicItem('timeline', index, { ...milestone, description: e.target.value })}
                        placeholder="Enter milestone description"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white bg-red-600 hover:bg-red-700"
                      onClick={() => removeDynamicItem('timeline', index)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => addDynamicItem('timeline', { date: '', title: '', description: '' })}
                  className="text-white bg-green-600 hover:bg-green-700"
                >
                  Add Milestone
                </Button>
              </div>
            )}
          </div>

          {/* Mentorship */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Mentorship/Support</h3>
              <Button 
                onClick={() => toggleSection('mentorship')} 
                className="text-white bg-orange-600 hover:bg-orange-700"
              >
                {openSections.mentorship ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.mentorship && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                <div className="space-y-2">
                  <Label htmlFor="mentorship" className="text-white">Mentorship Details</Label>
                  <Textarea
                    id="mentorship"
                    value={formData.mentorship}
                    onChange={(e) => handleInputChange('mentorship', e.target.value)}
                    placeholder="Enter mentorship/support details"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Technology Stack */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Technology Stack</h3>
              <Button 
                onClick={() => toggleSection('techStack')} 
                className="text-white bg-orange-600 hover:bg-orange-700"
              >
                {openSections.techStack ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.techStack && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.techStack.map((tech, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-700 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-white">Name</Label>
                      <Input
                        value={tech.name}
                        onChange={(e) => updateDynamicItem('techStack', index, { ...tech, name: e.target.value })}
                        placeholder="Enter technology name"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Description</Label>
                      <Textarea
                        value={tech.description}
                        onChange={(e) => updateDynamicItem('techStack', index, { ...tech, description: e.target.value })}
                        placeholder="Enter technology description"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white bg-red-600 hover:bg-red-700"
                      onClick={() => removeDynamicItem('techStack', index)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => addDynamicItem('techStack', { name: '', description: '' })}
                  className="text-white bg-green-600 hover:bg-green-700"
                >
                  Add Technology
                </Button>
              </div>
            )}
          </div>

          {/* Custom Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Custom Fields</h3>
              <Button 
                onClick={() => toggleSection('customFields')} 
                className="text-white bg-orange-600 hover:bg-orange-700"
              >
                {openSections.customFields ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.customFields && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.customFields.map((field, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-700 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-white">Key</Label>
                      <Input
                        value={field.key}
                        onChange={(e) => updateDynamicItem('customFields', index, { ...field, key: e.target.value })}
                        placeholder="Enter field key"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Type</Label>
                      <Select
                        value={customFieldTypeOptions.find(opt => opt.value === field.type)}
                        onChange={(option) => updateDynamicItem('customFields', index, { ...field, type: option.value, value: '' })}
                        options={customFieldTypeOptions}
                        styles={customSelectStyles}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Value</Label>
                      <Input
                        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                        value={field.value}
                        onChange={(e) => updateDynamicItem('customFields', index, { ...field, value: e.target.value })}
                        placeholder="Enter field value"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white bg-red-600 hover:bg-red-700"
                      onClick={() => removeDynamicItem('customFields', index)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                ))}
                {formData.customFields.length < 10 && (
                  <Button
                    onClick={() => addDynamicItem('customFields', { key: '', type: 'text', value: '' })}
                    className="text-white bg-green-600 hover:bg-green-700"
                  >
                    Add Custom Field
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => setOpen(false)} 
            className="text-white bg-orange-600 hover:bg-orange-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="gap-2 text-white bg-green-600 hover:bg-green-700"
          >
            {loading && <RefreshCcw className="w-4 h-4 animate-spin" />}
            <Calendar className="w-4 h-4" />
            <span>Create Event</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Events Component
const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeLoading, setTypeLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const { API_URL } = useTourLMS();

  useEffect(() => {
    fetchEvents();
    fetchEventTypes();
  }, [API_URL]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/events`, {
        headers: { 'x-auth-token': token }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Failed to load events",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    try {
      setTypeLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/event-types`, {
        headers: { 'x-auth-token': token }
      });
      setEventTypes(response.data);
    } catch (error) {
      console.error('Error fetching event types:', error);
      toast({
        title: "Failed to load event types",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setTypeLoading(false);
    }
  };

  const createEventType = async (eventTypeData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/admin/event-types`, eventTypeData, {
        headers: { 'x-auth-token': token }
      });
      setEventTypes(prev => [...prev, response.data.eventType]);
      toast({
        title: "Event type created",
        description: "New event type has been added successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error creating event type:', error);
      toast({
        title: "Failed to create event type",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteEventType = async (typeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/event-types/${typeId}`, {
        headers: { 'x-auth-token': token }
      });
      setEventTypes(prev => prev.filter(type => type._id !== typeId));
      toast({
        title: "Event type deleted",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting event type:', error);
      toast({
        title: "Failed to delete event type",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive"
      });
    }
  };

  const createEvent = async (eventData) => {
    clg('event data -- ',eventData)
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/admin/events`, eventData, {
        headers: { 'x-auth-token': token }
      });
      fetchEvents();
      toast({
        title: "Event created",
        description: "New event has been added successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Failed to create event",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive"
      });
      throw error;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()));
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && event.status === statusFilter;
  });

  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = new Date(event.eventDate);
    const monthYear = format(date, 'MMMM yyyy');
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(event);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groupedEvents).sort((a, b) => new Date(a) - new Date(b));

  const upcomingCount = events.filter(e => e.status === 'upcoming').length;
  const completedCount = events.filter(e => e.status === 'completed').length;
  const cancelledCount = events.filter(e => e.status === 'cancelled').length;

  return (
    <div className="text-white">
      <header className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <Calendar /> Events Management
        </h1>
        <p className="text-white mt-1">Create and manage events for your platform</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-white">All Events</p>
                <p className="text-2xl font-bold text-white">{events.length}</p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-full text-white">
                <Calendar size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-white">Upcoming</p>
                <p className="text-2xl font-bold text-white">{upcomingCount}</p>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-full text-blue-400">
                <Clock size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-white">Completed</p>
                <p className="text-2xl font-bold text-white">{completedCount}</p>
              </div>
              <div className="p-3 bg-green-900/30 rounded-full text-green-400">
                <CheckCircle size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-white">Cancelled</p>
                <p className="text-2xl font-bold text-white">{cancelledCount}</p>
              </div>
              <div className="p-3 bg-red-900/30 rounded-full text-red-400">
                <XCircle size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="events">
        <TabsList className="bg-gray-800/50">
          <TabsTrigger value="events" className="data-[state=active]:bg-purple-900/30 text-white">Events</TabsTrigger>
          <TabsTrigger value="types" className="data-[state=active]:bg-purple-900/30 text-white">Event Types</TabsTrigger>
        </TabsList>
        <TabsContent value="events" className="mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={18} />
              <Input 
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 focus:border-purple-500 text-white placeholder:text-gray-300"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-700 bg-gray-800/50 text-white">
                    <Filter size={16} className="mr-2" />
                    {statusFilter === 'all' ? 'All' : statusFilter === 'upcoming' ? 'Upcoming' : statusFilter === 'completed' ? 'Completed' : 'Cancelled'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border border-gray-700">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-white hover:bg-gray-700 cursor-pointer">
                    All Events
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('upcoming')} className="text-white hover:bg-gray-700 cursor-pointer">
                    Upcoming
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('completed')} className="text-white hover:bg-gray-700 cursor-pointer">
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('cancelled')} className="text-white hover:bg-gray-700 cursor-pointer">
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                className="border-gray-700 bg-gray-800/50 text-white"
                onClick={fetchEvents}
              >
                <RefreshCcw size={16} />
              </Button>
              <CreateEventDialog 
                eventTypes={eventTypes}
                onSubmit={createEvent}
              />
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-800/30">
                  <div className="flex justify-between mb-3">
                    <Skeleton className="h-4 w-20 bg-gray-700" />
                    <Skeleton className="h-6 w-24 bg-gray-700" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-4 bg-gray-700" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-32 bg-gray-700" />
                    <Skeleton className="h-4 w-24 bg-gray-700" />
                    <Skeleton className="h-4 w-40 bg-gray-700" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20 bg-gray-700" />
                    <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="space-y-8">
              {sortedMonths.map(month => (
                <div key={month}>
                  <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
                    {month}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedEvents[month].map(event => (
                      <EventItem key={event._id} event={event} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarX className="w-16 h-16 mx-auto text-white mb-3" />
              <p className="text-xl font-semibold text-white">No events found</p>
              <p className="text-white mt-2">
                {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters or search term' : 'Create your first event to get started'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <CreateEventDialog 
                  eventTypes={eventTypes}
                  onSubmit={createEvent}
                  btnText="Create Your First Event"
                />
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="types" className="mt-6">
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Event Types</CardTitle>
              <CreateEventTypeDialog onSubmit={createEventType} />
            </CardHeader>
            <CardContent>
              {typeLoading ? (
                <div className="space-y-3">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded-full bg-gray-700" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-1 bg-gray-700" />
                          <Skeleton className="h-3 w-48 bg-gray-700" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                    </div>
                  ))}
                </div>
              ) : eventTypes.length > 0 ? (
                <div className="space-y-3">
                  {eventTypes.map(type => (
                    <EventTypeItem 
                      key={type._id} 
                      eventType={type} 
                      onDelete={deleteEventType}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 mx-auto text-white mb-3" />
                  <p className="text-white">No event types found</p>
                  <p className="text-white mt-1">Create event types to categorize your events</p>
                  <div className="mt-4">
                    <CreateEventTypeDialog onSubmit={createEventType} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEvents;