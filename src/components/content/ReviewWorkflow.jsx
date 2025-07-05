import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, AlertCircle, NotebookPen, Loader2, FileText, Code, Image, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusConfig = {
  pending_review: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Clock className="w-4 h-4" />,
    label: 'Pending Review'
  },
  approved: {
    color: 'bg-green-100 text-green-800',
    icon: <Check className="w-4 h-4" />,
    label: 'Approved'
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    icon: <X className="w-4 h-4" />,
    label: 'Rejected'
  },
  needs_revision: {
    color: 'bg-blue-100 text-blue-800',
    icon: <NotebookPen className="w-4 h-4" />,
    label: 'Needs Revision'
  }
};

const contentTypeIcons = {
  lesson: <FileText className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />
};

const ReviewWorkflow = ({ 
  submissions = [], 
  onStatusChange,
  currentUser,
  showContentPreview = true
}) => {
  const [selectedStatus, setSelectedStatus] = useState({});
  const [reviewComments, setReviewComments] = useState({});
  const [isUpdating, setIsUpdating] = useState({});
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const { toast } = useToast();

  // Initialize state when submissions change
  useEffect(() => {
    const initialStatus = {};
    const initialComments = {};
    submissions.forEach(sub => {
      initialStatus[sub.id] = sub.status;
      initialComments[sub.id] = '';
    });
    setSelectedStatus(initialStatus);
    setReviewComments(initialComments);
  }, [submissions]);

  const handleStatusChange = async (submissionId) => {
    if (!selectedStatus[submissionId] || selectedStatus[submissionId] === submissions.find(s => s.id === submissionId)?.status) {
      return;
    }

    setIsUpdating(prev => ({ ...prev, [submissionId]: true }));
    
    try {
      const comment = reviewComments[submissionId] || '';
      const response = await fetch(`/api/content/${submissionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: selectedStatus[submissionId],
          comment,
          reviewerId: currentUser?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Status update failed');
      }
      
      const data = await response.json();
      onStatusChange(submissionId, data.status, comment);
      toast({
        title: "Status Updated",
        description: `Content marked as ${statusConfig[data.status].label}`,
      });
      
      // Clear comment after successful submission
      setReviewComments(prev => ({ ...prev, [submissionId]: '' }));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const toggleExpandSubmission = (submissionId) => {
    setExpandedSubmission(prev => prev === submissionId ? null : submissionId);
  };

  const handleCommentChange = (submissionId, value) => {
    setReviewComments(prev => ({ ...prev, [submissionId]: value }));
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending_review;
    return (
      <Badge className={`${config.color} gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getContentIcon = (type) => {
    return contentTypeIcons[type] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Content Review Queue</h2>
        <div className="text-sm text-muted-foreground">
          {submissions.length} item{submissions.length !== 1 ? 's' : ''} pending
        </div>
      </div>
      
      {submissions.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No submissions awaiting review</h3>
          <p className="text-muted-foreground">New content submissions will appear here</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getContentIcon(submission.contentType)}
                    </div>
                    <div>
                      <h3 className="font-medium">{submission.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="gap-1">
                          {getContentIcon(submission.contentType)}
                          {submission.contentType}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={submission.author?.avatar} />
                            <AvatarFallback>
                              {submission.author?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{submission.author?.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(submission.status)}
                  </div>
                </div>

                {showContentPreview && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mb-4"
                      onClick={() => toggleExpandSubmission(submission.id)}
                    >
                      {expandedSubmission === submission.id ? (
                        <>
                          Hide Content <ChevronUp className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Show Content <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {expandedSubmission === submission.id && (
                      <div className="mt-2 mb-6">
                        <Tabs defaultValue="preview" className="w-full">
                          <TabsList className="grid grid-cols-2 w-[200px] mb-4">
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                          </TabsList>
                          <TabsContent value="preview">
                            <Card className="p-4 bg-muted/50">
                              {submission.contentType === 'image' ? (
                                <img 
                                  src={submission.content} 
                                  alt={submission.title} 
                                  className="max-h-[400px] mx-auto rounded"
                                />
                              ) : submission.contentType === 'video' ? (
                                <video 
                                  src={submission.content} 
                                  controls 
                                  className="max-h-[400px] mx-auto rounded"
                                />
                              ) : (
                                <div className="prose max-w-none">
                                  {submission.content}
                                </div>
                              )}
                            </Card>
                          </TabsContent>
                          <TabsContent value="details">
                            <Card className="p-4 bg-muted/50">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm font-medium">Description:</span>
                                  <p className="text-sm">{submission.description || 'No description provided'}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Tags:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {submission.tags?.length > 0 ? (
                                      submission.tags.map(tag => (
                                        <Badge key={tag} variant="secondary">
                                          {tag}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-sm text-muted-foreground">No tags</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </>
                )}

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Review Comment</Label>
                    <Textarea
                      value={reviewComments[submission.id] || ''}
                      onChange={(e) => handleCommentChange(submission.id, e.target.value)}
                      placeholder="Add review comments..."
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select 
                      value={selectedStatus[submission.id] || submission.status}
                      onValueChange={(value) => setSelectedStatus(prev => ({ ...prev, [submission.id]: value }))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([value, config]) => (
                          <SelectItem key={value} value={value} className="gap-1">
                            {config.icon}
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button 
                      onClick={() => handleStatusChange(submission.id)}
                      disabled={
                        isUpdating[submission.id] || 
                        !selectedStatus[submission.id] || 
                        selectedStatus[submission.id] === submission.status
                      }
                    >
                      {isUpdating[submission.id] ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating
                        </>
                      ) : (
                        'Update Status'
                      )}
                    </Button>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-muted-foreground ml-2">
                          Last updated: {new Date(submission.updatedAt).toLocaleString()}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {submission.updatedBy ? `Updated by ${submission.updatedBy.name}` : 'No update history'}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewWorkflow;