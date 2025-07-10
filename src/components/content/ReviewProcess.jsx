import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  GitPullRequest, 
  GitCommit, 
  MessageSquare, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  FileDiff,
  GitBranch,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

const ReviewProcess = ({ 
  content, 
  onReviewComplete,
  reviewers = [],
  requiredApprovals = 1,
  statusChecks = [],
  currentUser
}) => {
  const [review, setReview] = useState({
    status: 'pending',
    comments: [],
    newComment: '',
    approvedBy: [],
    changesRequestedBy: [],
    isSubmitting: false
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [diffView, setDiffView] = useState('split');
  const [expandedComments, setExpandedComments] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with mock data if none provided
  useEffect(() => {
    if (!currentUser) {
      setReview(prev => ({
        ...prev,
        approvedBy: [
          {
            id: '1',
            author: { id: 'reviewer1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg' },
            timestamp: new Date(Date.now() - 86400000),
            type: 'approval'
          }
        ],
        comments: [
          {
            id: '1',
            text: 'Looks good to me! Just a few minor suggestions.',
            author: { id: 'reviewer1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg' },
            timestamp: new Date(Date.now() - 86400000),
            type: 'comment'
          }
        ]
      }));
    }
  }, [currentUser]);

  const handleAddComment = async () => {
    if (!review.newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    const newComment = {
      id: Date.now().toString(),
      text: review.newComment,
      author: currentUser || { id: 'currentUser', name: 'You', avatar: '/avatars/current-user.jpg' },
      timestamp: new Date(),
      type: 'comment',
      file: selectedFile
    };

    setReview(prev => ({
      ...prev,
      comments: [...prev.comments, newComment],
      newComment: ''
    }));

    toast.success('Comment added');
  };

  const handleApprove = async () => {
    if (review.approvedBy.some(a => a.author.id === currentUser?.id)) {
      toast.info('You have already approved this content');
      return;
    }

    setIsLoading(true);
    try {
      const approval = {
        id: Date.now().toString(),
        author: currentUser || { id: 'currentUser', name: 'You', avatar: '/avatars/current-user.jpg' },
        timestamp: new Date(),
        type: 'approval'
      };

      const updatedReview = {
        ...review,
        status: review.approvedBy.length + 1 >= requiredApprovals ? 'approved' : 'pending',
        approvedBy: [...review.approvedBy, approval],
        comments: [...review.comments, approval]
      };

      setReview(updatedReview);

      if (onReviewComplete) {
        await onReviewComplete({ 
          status: updatedReview.status, 
          review: updatedReview 
        });
      }

      toast.success(updatedReview.status === 'approved' 
        ? 'Content approved and merged' 
        : 'Approval recorded');
    } catch (error) {
      toast.error('Failed to submit approval');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!review.newComment.trim()) {
      toast.error('Please explain what changes are needed');
      return;
    }

    setIsLoading(true);
    try {
      const changeRequest = {
        id: Date.now().toString(),
        author: currentUser || { id: 'currentUser', name: 'You', avatar: '/avatars/current-user.jpg' },
        timestamp: new Date(),
        type: 'change_request',
        text: review.newComment,
        file: selectedFile
      };

      const updatedReview = {
        ...review,
        status: 'changes_requested',
        changesRequestedBy: [...review.changesRequestedBy, changeRequest],
        comments: [...review.comments, changeRequest],
        newComment: ''
      };

      setReview(updatedReview);

      if (onReviewComplete) {
        await onReviewComplete({ 
          status: 'changes_requested', 
          review: updatedReview 
        });
      }

      toast.success('Changes requested');
    } catch (error) {
      toast.error('Failed to request changes');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCommentExpansion = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const getReviewStatusBadge = () => {
    switch (review.status) {
      case 'approved':
        return { variant: 'success', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'changes_requested':
        return { variant: 'warning', icon: <AlertCircle className="w-4 h-4" /> };
      case 'merged':
        return { variant: 'default', icon: <GitPullRequest className="w-4 h-4" /> };
      default:
        return { variant: 'default', icon: <Clock className="w-4 h-4" /> };
    }
  };

  const statusBadge = getReviewStatusBadge();

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Review Process</h2>
          <Badge variant={statusBadge.variant} className="gap-1">
            {statusBadge.icon}
            {review.status.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => setDiffView(diffView === 'split' ? 'unified' : 'split')}
          >
            <FileDiff className="w-4 h-4 mr-2" />
            {diffView === 'split' ? 'Unified View' : 'Split View'}
          </Button>
          <Button variant="outline">
            <GitBranch className="w-4 h-4 mr-2" />
            Compare Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5" />
                <h3 className="font-medium">Pull Request #{content.id}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="font-mono">
                  {content.branch}
                </Badge>
                <Badge variant="outline" className="max-w-[200px] truncate">
                  {content.commitMessage}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Author:</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={content.author?.avatar} />
                      <AvatarFallback>{content.author?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{content.author?.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Created:</span>
                  <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Changes</h4>
                <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <GitCommit className="w-4 h-4" />
                    <span className="truncate">{content.commitHash?.substring(0, 8)}</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">+{content.changes?.additions}</span>
                      <span className="text-muted-foreground">Additions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">-{content.changes?.deletions}</span>
                      <span className="text-muted-foreground">Deletions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{content.changes?.filesChanged}</span>
                      <span className="text-muted-foreground">Files Changed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-4">Review Comments</h3>
            <div className="space-y-4">
              {review.comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No comments yet. Be the first to review!
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  {review.comments.map(comment => (
                    <div 
                      key={comment.id} 
                      className={`flex gap-4 mb-4 p-2 rounded-lg ${comment.file === selectedFile ? 'bg-muted/50' : ''}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <span className="font-medium">{comment.author.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                          {comment.type === 'approval' && (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </Badge>
                          )}
                          {comment.type === 'change_request' && (
                            <Badge variant="warning" className="gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Changes Requested
                            </Badge>
                          )}
                          {comment.file && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {comment.file}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {expandedComments[comment.id] || comment.text.length < 300
                            ? comment.text
                            : `${comment.text.substring(0, 300)}...`}
                        </p>
                        {comment.text.length > 300 && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => toggleCommentExpansion(comment.id)}
                          >
                            {expandedComments[comment.id] ? (
                              <>
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Show more
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}

              <Separator />

              <div className="space-y-2">
                <Textarea
                  value={review.newComment}
                  onChange={(e) => setReview(prev => ({ ...prev, newComment: e.target.value }))}
                  placeholder="Add a review comment..."
                  rows={4}
                />
                <div className="flex flex-wrap justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleAddComment}
                    disabled={!review.newComment.trim()}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Comment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRequestChanges}
                    disabled={isLoading || !review.newComment.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    Request Changes
                  </Button>
                  <Button 
                    onClick={handleApprove}
                    disabled={isLoading || review.approvedBy.some(a => a.author.id === currentUser?.id)}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-4">
            <h3 className="font-medium mb-4">Review Status</h3>
            <div className="space-y-4">
              <div>
                <Label>Reviewers ({reviewers.length})</Label>
                <div className="mt-2 space-y-2">
                  {reviewers.map(reviewer => {
                    const approval = review.approvedBy.find(a => a.author.id === reviewer.id);
                    const changeRequest = review.changesRequestedBy.find(c => c.author.id === reviewer.id);
                    
                    return (
                      <div key={reviewer.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={reviewer.avatar} />
                            <AvatarFallback>{reviewer.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{reviewer.name}</span>
                        </div>
                        <div>
                          {approval ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <ThumbsUp className="w-4 h-4 text-green-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Approved on {new Date(approval.timestamp).toLocaleDateString()}
                              </TooltipContent>
                            </Tooltip>
                          ) : changeRequest ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <ThumbsDown className="w-4 h-4 text-red-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Requested changes on {new Date(changeRequest.timestamp).toLocaleDateString()}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div>
                <Label>Approval Status</Label>
                <div className="mt-2">
                  <Badge variant="outline">
                    {review.approvedBy.length} of {requiredApprovals} required approvals
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Status Checks ({statusChecks.length})</Label>
                <div className="mt-2 space-y-2">
                  {statusChecks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No status checks configured</p>
                  ) : (
                    statusChecks.map(check => (
                      <div key={check.id} className="flex items-center gap-2">
                        {check.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : check.status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        <span className="text-sm">{check.name}</span>
                        {check.status === 'success' && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {check.duration}ms
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-4">Changed Files</h3>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="modified">Modified</TabsTrigger>
                <TabsTrigger value="added">Added</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <div className="space-y-2">
                  {content.changedFiles?.map(file => (
                    <div 
                      key={file.name}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${selectedFile === file.name ? 'bg-muted' : 'hover:bg-muted/50'}`}
                      onClick={() => setSelectedFile(file.name)}
                    >
                      <span className="text-sm font-mono truncate">{file.name}</span>
                      <Badge variant="outline" className="text-xs">
                        +{file.additions} -{file.deletions}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </Card>
  );
};

export default ReviewProcess;