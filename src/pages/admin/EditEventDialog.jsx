import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import Select from 'react-select';
import { useDropzone } from 'react-dropzone';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Edit, Loader2, Trash, Calendar } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { format } from 'date-fns';
import { useTourLMS } from '../../contexts/TourLMSContext';
import axios from 'axios';

// Custom styles for react-select and quill (same as Events.jsx)
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    color: '#fff',
    boxShadow: 'none',
    '&:hover': { borderColor: '#8B5CF6' },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    color: '#fff',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#4B5563' : '#1F2937',
    color: '#fff',
    '&:hover': { backgroundColor: '#374151' },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#D1D5DB',
  }),
};

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

const EditEventDialog = ({ event, eventTypes = [], onUpdate }) => {
  const [formData, setFormData] = useState({
    title: event.title || '',
    flyer: event.flyer || '',
    flyerType: event.flyer ? (event.flyer.startsWith('http') ? 'url' : 'file') : 'file',
    description: event.description || '',
    eventDate: event.eventDate ? format(new Date(event.eventDate), 'yyyy-MM-dd') : '',
    eventTime: event.eventDate ? format(new Date(event.eventDate), 'HH:mm') : '',
    location: event.location || '',
    eventType: event.eventType || '',
    status: event.status || 'upcoming',
    capacity: event.capacity ? String(event.capacity) : '',
    duration: event.duration || { value: '', unit: 'Days' },
    visibility: event.visibility || 'public',
    guidelinesText: event.guidelines?.text || '',
    guidelinesPDF: event.guidelines?.pdf || '',
    anchors: event.anchors || [],
    prizes: event.prizes || [],
    media: event.media || [],
    timeline: event.timeline || [],
    mentorship: event.mentorship || '',
    techStack: event.techStack || [],
    customFields: event.customFields || [],
  });
  const [guidelinesMode, setGuidelinesMode] = useState(event.guidelines?.pdf ? 'pdf' : 'text');
  const [openSections, setOpenSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [flyerPreviewError, setFlyerPreviewError] = useState(false);
  const { toast } = useToast();
  const { API_URL } = useTourLMS();

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDurationChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      duration: { ...prev.duration, [key]: value },
    }));
  };

  const addDynamicItem = (field, item) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], item] }));
  };

  const removeDynamicItem = (field, index) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const updateDynamicItem = (field, index, updatedItem) => {
    setFormData((prev) => {
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
      'video/mp4': ['.mp4'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        toast({
          title: 'File Error',
          description: 'Files must be PNG/JPEG/PDF/MP4 and under 10MB.',
          variant: 'destructive',
        });
        return;
      }
      for (const file of acceptedFiles) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          uploadFormData.append('fileType', file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document');
          if (formData.flyer && formData.flyerType === 'file' && file.type.startsWith('image')) {
            uploadFormData.append('xfileUrl', formData.flyer);
          }
          const token = localStorage.getItem('token');
          const response = await axios.post(`${API_URL}/upload`, uploadFormData, {
            headers: { 'x-auth-token': token },
          });
          if (guidelinesMode === 'pdf' && file.type === 'application/pdf') {
            handleInputChange('guidelinesPDF', response.data.fileUrl);
          } else if (file.type.startsWith('image')) {
            handleInputChange('flyer', response.data.fileUrl);
            handleInputChange('flyerType', 'file');
            setFlyerPreviewError(false);
          } else {
            addDynamicItem('media', {
              type: 'file',
              url: response.data.fileUrl,
              name: file.name,
              mimeType: file.type,
            });
          }
          toast({
            title: 'File Uploaded',
            description: `${file.name} uploaded successfully`,
            variant: 'success',
          });
        } catch (error) {
          console.error('Error uploading file:', error);
          toast({
            title: 'Upload Failed',
            description: error.response?.data?.error || 'Failed to upload file',
            variant: 'destructive',
          });
        }
      }
    },
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
      toast({
        title: 'Missing Fields',
        description: 'Title, date, time, and status are required.',
        variant: 'destructive',
      });
      return;
    }
    if (formData.duration.value && !formData.duration.unit) {
      toast({
        title: 'Missing Duration Unit',
        description: 'Please select a duration unit.',
        variant: 'destructive',
      });
      return;
    }
    if (formData.flyerType === 'url' && formData.flyer && !validateURL(formData.flyer)) {
      toast({
        title: 'Invalid Flyer URL',
        description: 'Please enter a valid URL for the flyer.',
        variant: 'destructive',
      });
      return;
    }
    const dateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
    if (isNaN(dateTime)) {
      toast({
        title: 'Invalid Date',
        description: 'Please enter a valid date and time.',
        variant: 'destructive',
      });
      return;
    }
    for (const media of formData.media) {
      if (media.type === 'url' && !validateURL(media.url)) {
        toast({
          title: 'Invalid URL',
          description: `Media URL "${media.url}" is invalid.`,
          variant: 'destructive',
        });
        return;
      }
    }
    setLoading(true);
    try {
      await onUpdate({
        title: formData.title,
        flyer: formData.flyer,
        description: formData.description,
        eventDate: dateTime,
        location: formData.location,
        eventType: formData.eventType,
        status: formData.status,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        duration: formData.duration.value
          ? { value: parseInt(formData.duration.value, 10), unit: formData.duration.unit }
          : null,
        visibility: formData.visibility,
        guidelines: { text: formData.guidelinesText, pdf: formData.guidelinesPDF },
        anchors: formData.anchors,
        prizes: formData.prizes,
        media: formData.media,
        timeline: formData.timeline,
        mentorship: formData.mentorship,
        techStack: formData.techStack,
        customFields: formData.customFields,
      });
      setOpen(false);
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setLoading(false);
    }
  };

  const eventTypeOptions = [
    { value: '', label: 'None' },
    ...eventTypes.map((type) => ({
      value: type._id,
      label: (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
          <span>{type.name}</span>
        </div>
      ),
    })),
  ];

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'students', label: 'Students Only' },
    { value: 'facilitators', label: 'Facilitators Only' },
    { value: 'invited', label: 'Invited Users Only' },
  ];

  const durationUnitOptions = [
    { value: 'Hours', label: 'Hours' },
    { value: 'Days', label: 'Days' },
    { value: 'Weeks', label: 'Weeks' },
    { value: 'Months', label: 'Months' },
  ];

  const customFieldTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-gray-700 bg-gray-800/50 text-white">
          <Edit size={16} />
          <span>Edit Event</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border border-gray-800 max-w-4xl max-h-[80vh] overflow-y-auto text-white">
        <style>{quillStyles}</style>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update details for the event.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className="text-white">
                  Event Title
                </Label>
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
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Upload File
                  </Button>
                  <Button
                    variant={formData.flyerType === 'url' ? 'default' : 'outline'}
                    onClick={() => handleInputChange('flyerType', 'url')}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Enter URL
                  </Button>
                </div>
                {formData.flyerType === 'file' ? (
                  <div
                    {...getRootProps()}
                    className={`p-4 border-2 border-dashed rounded-lg text-center ${
                      isDragActive ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800/50'
                    }`}
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
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
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
                <Label htmlFor="date" className="text-white">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-white">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => handleInputChange('eventTime', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter event location"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-white">
                  Capacity (Optional)
                </Label>
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
                <Label htmlFor="duration" className="text-white">
                  Duration (Optional)
                </Label>
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
                    value={durationUnitOptions.find((opt) => opt.value === formData.duration.unit)}
                    onChange={(option) => handleDurationChange('unit', option ? option.value : 'Days')}
                    options={durationUnitOptions}
                    styles={customSelectStyles}
                    placeholder="Select unit"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-white">
                  Event Type
                </Label>
                <Select
                  id="eventType"
                  value={eventTypeOptions.find((option) => option.value === formData.eventType)}
                  onChange={(option) => handleInputChange('eventType', option ? option.value : '')}
                  options={eventTypeOptions}
                  styles={customSelectStyles}
                  placeholder="Select event type"
                  isClearable
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">
                  Status
                </Label>
                <Select
                  id="status"
                  value={statusOptions.find((option) => option.value === formData.status)}
                  onChange={(option) => handleInputChange('status', option ? option.value : 'upcoming')}
                  options={statusOptions}
                  styles={customSelectStyles}
                  placeholder="Select status"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility" className="text-white">
                  Visibility
                </Label>
                <Select
                  id="visibility"
                  value={visibilityOptions.find((option) => option.value === formData.visibility)}
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
                className="bg-orange-600 hover:bg-orange-700 text-white"
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
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Rich Text
                    </Button>
                    <Button
                      variant={guidelinesMode === 'pdf' ? 'default' : 'outline'}
                      onClick={() => setGuidelinesMode('pdf')}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      PDF Upload
                    </Button>
                  </div>
                </div>
                {guidelinesMode === 'text' ? (
                  <div className="space-y-2">
                    <Label htmlFor="guidelinesText" className="text-white">
                      Guidelines Text
                    </Label>
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
                      className={`p-4 border-2 border-dashed rounded-lg text-center ${
                        isDragActive ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800/50'
                      }`}
                    >
                      <input {...getInputProps()} accept="application/pdf" />
                      <p className="text-white">Drag and drop a PDF file here, or click to select</p>
                      <p className="text-sm text-gray-300">Max 10MB, PDF only</p>
                    </div>
                    {formData.guidelinesPDF && (
                      <div className="flex items-center gap-2 mt-2">
                        <a
                          href={formData.guidelinesPDF}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
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
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {openSections.anchors ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.anchors && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.anchors.map((anchor, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-700 rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label className="text-white">Name</Label>
                      <Input
                        value={anchor.name}
                        onChange={(e) =>
                          updateDynamicItem('anchors', index, { ...anchor, name: e.target.value })
                        }
                        placeholder="Enter name"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Email</Label>
                      <Input
                        type="email"
                        value={anchor.email}
                        onChange={(e) =>
                          updateDynamicItem('anchors', index, { ...anchor, email: e.target.value })
                        }
                        placeholder="Enter email"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Role</Label>
                      <Input
                        value={anchor.role}
                        onChange={(e) =>
                          updateDynamicItem('anchors', index, { ...anchor, role: e.target.value })
                        }
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
                  className="bg-green-600 hover:bg-green-700 text-white"
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
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {openSections.prizes ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.prizes && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.prizes.map((prize, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-700 rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label className="text-white">Title</Label>
                      <Input
                        value={prize.title}
                        onChange={(e) =>
                          updateDynamicItem('prizes', index, { ...prize, title: e.target.value })
                        }
                        placeholder="Enter prize title"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Amount (NGN)</Label>
                      <Input
                        type="number"
                        value={prize.amount}
                        onChange={(e) =>
                          updateDynamicItem('prizes', index, { ...prize, amount: e.target.value })
                        }
                        placeholder="Enter amount"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white">Description</Label>
                      <Textarea
                        value={prize.description}
                        onChange={(e) =>
                          updateDynamicItem('prizes', index, { ...prize, description: e.target.value })
                        }
                        placeholder="Enter prize description"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white">Criteria</Label>
                      <Textarea
                        value={prize.criteria}
                        onChange={(e) =>
                          updateDynamicItem('prizes', index, { ...prize, criteria: e.target.value })
                        }
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
                  onClick={() =>
                    addDynamicItem('prizes', { title: '', amount: '', description: '', criteria: '' })
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
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
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {openSections.media ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.media && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.media.map((media, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-700 rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label className="text-white">Type</Label>
                      <Select
                        value={[{ value: 'url', label: 'URL' }, { value: 'file', label: 'File' }].find(
                          (opt) => opt.value === media.type
                        )}
                        onChange={(option) =>
                          updateDynamicItem('media', index, {
                            ...media,
                            type: option.value,
                            url: '',
                            name: '',
                          })
                        }
                        options={[{ value: 'url', label: 'URL' }, { value: 'file', label: 'File' }]}
                        styles={customSelectStyles}
                      />
                    </div>
                    {media.type === 'url' ? (
                      <div className="space-y-2">
                        <Label className="text-white">URL</Label>
                        <Input
                          value={media.url}
                          onChange={(e) =>
                            updateDynamicItem('media', index, { ...media, url: e.target.value })
                          }
                          placeholder="Enter media URL"
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-white">Uploaded File</Label>
                        {media.url ? (
                          <div className="flex items-center gap-2">
                            {media.mimeType?.startsWith('image') ? (
                              <img
                                src={media.url}
                                alt={media.name}
                                className="h-20 w-20 object-cover rounded"
                              />
                            ) : (
                              <a
                                href={media.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                              >
                                {media.name}
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white bg-red-600 hover:bg-red-700"
                              onClick={() =>
                                updateDynamicItem('media', index, {
                                  ...media,
                                  url: '',
                                  name: '',
                                  mimeType: '',
                                })
                              }
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        ) : (
                          <div
                            {...getRootProps()}
                            className={`p-4 border-2 border-dashed rounded-lg text-center ${
                              isDragActive ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800/50'
                            }`}
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
                  className="bg-green-600 hover:bg-green-700 text-white"
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
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {openSections.timeline ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.timeline && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.timeline.map((milestone, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-700 rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label className="text-white">Date</Label>
                      <Input
                        type="date"
                        value={milestone.date}
                        onChange={(e) =>
                          updateDynamicItem('timeline', index, { ...milestone, date: e.target.value })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Title</Label>
                      <Input
                        value={milestone.title}
                        onChange={(e) =>
                          updateDynamicItem('timeline', index, { ...milestone, title: e.target.value })
                        }
                        placeholder="Enter milestone title"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white">Description</Label>
                      <Textarea
                        value={milestone.description}
                        onChange={(e) =>
                          updateDynamicItem('timeline', index, {
                            ...milestone,
                            description: e.target.value,
                          })
                        }
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
                  className="bg-green-600 hover:bg-green-700 text-white"
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
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {openSections.mentorship ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.mentorship && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                <div className="space-y-2">
                  <Label htmlFor="mentorship" className="text-white">
                    Mentorship Details
                  </Label>
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
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {openSections.techStack ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.techStack && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.techStack.map((tech, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-700 rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label className="text-white">Name</Label>
                      <Input
                        value={tech.name}
                        onChange={(e) =>
                          updateDynamicItem('techStack', index, { ...tech, name: e.target.value })
                        }
                        placeholder="Enter technology name"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Description</Label>
                      <Textarea
                        value={tech.description}
                        onChange={(e) =>
                          updateDynamicItem('techStack', index, {
                            ...tech,
                            description: e.target.value,
                          })
                        }
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
                  className="bg-green-600 hover:bg-green-700 text-white"
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
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {openSections.customFields ? 'Hide' : 'Add'}
              </Button>
            </div>
            {openSections.customFields && (
              <div className="space-y-4 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                {formData.customFields.map((field, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-700 rounded-lg"
                  >
                    <div className="space-y-2">
                      <Label className="text-white">Key</Label>
                      <Input
                        value={field.key}
                        onChange={(e) =>
                          updateDynamicItem('customFields', index, { ...field, key: e.target.value })
                        }
                        placeholder="Enter field key"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Type</Label>
                      <Select
                        value={customFieldTypeOptions.find((opt) => opt.value === field.type)}
                        onChange={(option) =>
                          updateDynamicItem('customFields', index, {
                            ...field,
                            type: option.value,
                            value: '',
                          })
                        }
                        options={customFieldTypeOptions}
                        styles={customSelectStyles}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Value</Label>
                      <Input
                        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                        value={field.value}
                        onChange={(e) =>
                          updateDynamicItem('customFields', index, { ...field, value: e.target.value })
                        }
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
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Add Custom Field
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="text-white">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <Calendar className="w-4 h-4" />
            <span>Update Event</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;