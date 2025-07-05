import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, FileText, Code, Image, Video, Loader2, X, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ContentSubmissionForm = ({ 
  courseId, 
  onSubmission,
  initialContent = null,
  editMode = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    contentType: 'lesson',
    status: 'pending_review'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // Initialize form with initialContent if in edit mode
  useEffect(() => {
    if (initialContent && editMode) {
      setFormData({
        title: initialContent.title || '',
        content: initialContent.content || '',
        contentType: initialContent.contentType || 'lesson',
        status: initialContent.status || 'pending_review'
      });
    }
  }, [initialContent, editMode]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.content.trim()) errors.content = 'Content is required';
    if (formData.content.length > 10000) errors.content = 'Content is too long (max 10,000 characters)';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Simulate progress for demo (replace with actual upload progress in production)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const endpoint = editMode 
        ? `/api/content/${initialContent.id}/update`
        : '/api/content/submit';

      const response = await fetch(endpoint, {
        method: editMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courseId
        })
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }
      
      const data = await response.json();
      onSubmission?.(data);
      
      toast({
        title: editMode ? "Updated!" : "Submitted!",
        description: editMode 
          ? "Your content has been updated successfully."
          : "Your content has been submitted for review.",
        action: <Check className="h-4 w-4 text-green-500" />
      });

      if (!editMode) {
        // Reset form only for new submissions
        setFormData({
          title: '',
          content: '',
          contentType: 'lesson',
          status: 'pending_review'
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        action: <X className="h-4 w-4 text-red-500" />
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear validation error when field changes
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const contentTypes = [
    { value: 'lesson', label: 'Lesson', icon: <FileText className="w-4 h-4" /> },
    { value: 'code', label: 'Code Example', icon: <Code className="w-4 h-4" /> },
    { value: 'image', label: 'Image Resource', icon: <Image className="w-4 h-4" /> },
    { value: 'video', label: 'Video Resource', icon: <Video className="w-4 h-4" /> }
  ];

  return (
    <div className="p-6 border rounded-lg bg-background">
      <h2 className="text-xl font-semibold mb-4">
        {editMode ? 'Edit Content' : 'Submit New Content'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={validationErrors.title ? 'border-destructive' : ''}
          />
          {validationErrors.title && (
            <p className="text-sm text-destructive mt-1">{validationErrors.title}</p>
          )}
        </div>

        <div>
          <Label htmlFor="contentType">Content Type *</Label>
          <Select 
            value={formData.contentType} 
            onValueChange={(value) => handleChange('contentType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    {type.icon}
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={10}
            className={validationErrors.content ? 'border-destructive' : ''}
          />
          <div className="flex justify-between mt-1">
            {validationErrors.content ? (
              <p className="text-sm text-destructive">{validationErrors.content}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {formData.content.length}/10,000 characters
              </p>
            )}
          </div>
        </div>

        {isSubmitting && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{editMode ? 'Updating...' : 'Submitting...'}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[180px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editMode ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                {editMode ? 'Update Content' : 'Submit for Review'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContentSubmissionForm;