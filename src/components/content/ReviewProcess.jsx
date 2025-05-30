import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const ReviewProcess = ({ content, onReviewComplete }) => {
  const [review, setReview] = useState({
    status: 'pending',
    comments: [],
    newComment: '',
    requestedChanges: [],
    approvedBy: [],
    changesRequestedBy: []
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [diffView, setDiffView] = useState('split');

  const handleAddComment = () => {
    if (!review.newComment.trim()) return;

    const newComment = {
      id: Date.now(),
      text: review.newComment,
      author: { id: 'currentUser', name: 'You', avatar: '/avatars/current-user.jpg' },
      timestamp: new Date(),
      type: 'comment'
    };

    setReview(prev => ({
      ...prev,
      comments: [...prev.comments, newComment],
      newComment: ''
    }));
  };

  const handleApprove = () => {
    const approval = {
      id: Date.now(),
      author: { id: 'currentUser', name: 'You', avatar: '/avatars/current-user.jpg' },
      timestamp: new Date(),
      type: 'approval'
    };

    setReview(prev => ({
      ...prev,
      status: 'approved',
      approvedBy: [...prev.approvedBy, approval],
      comments: [...prev.comments, approval]
    }));

    toast.success('Content approved');
    onReviewComplete?.({ status: 'approved', review });
  };

  const handleRequestChanges = () => {
    const changeRequest = {
      id: Date.now(),
      author: { id: 'currentUser', name: 'You', avatar: '/avatars/current-user.jpg' },
      timestamp: new Date(),
      type: 'change_request',
      text: review.newComment
    };

    setReview(prev => ({
      ...prev,
      status: 'changes_requested',
      changesRequestedBy: [...prev.changesRequestedBy, changeRequest],
      comments: [...prev.comments, changeRequest],
      newComment: ''
    }));

    toast.info('Changes requested');
    onReviewComplete?.({ status: 'changes_requested', review });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Review Process</h2>
          <Badge variant={
            review.status === 'approved' ? 'success' :
            review.status === 'changes_requested' ? 'warning' :
            'default'
          }>
            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setDiffView(diffView === 'split' ? 'unified' : 'split')}>
            <FileDiff className="w-4 h-4 mr-2" />
            {diffView === 'split' ? 'Unified View' : 'Split View'}
          </Button>
          <Button variant="outline">
            <GitBranch className="w-4 h-4 mr-2" />
            Compare
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5" />
                <h3 className="font-medium">Pull Request</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {content.branch}
                </Badge>
                <Badge variant="outline">
                  {content.commitMessage}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Author:</span>
                  <span className="font-medium">{content.author?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Created:</span>
                  <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Changes</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <GitCommit className="w-4 h-4" />
                    <span>{content.commitHash}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">+{content.changes?.additions}</span>
                      <span className="text-red-600">-{content.changes?.deletions}</span>
                      <span>{content.changes?.filesChanged} files changed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-4">Review Comments</h3>
            <div className="space-y-4">
              {review.comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.author.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                      {comment.type === 'approval' && (
                        <Badge variant="success" className="ml-2">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                      {comment.type === 'change_request' && (
                        <Badge variant="warning" className="ml-2">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Changes Requested
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <Textarea
                  value={review.newComment}
                  onChange={(e) => setReview(prev => ({ ...prev, newComment: e.target.value }))}
                  placeholder="Add a review comment..."
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleAddComment}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Comment
                  </Button>
                  <Button variant="outline" onClick={handleRequestChanges}>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Request Changes
                  </Button>
                  <Button onClick={handleApprove}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-4 space-y-6">
          <Card className="p-4">
            <h3 className="font-medium mb-4">Review Status</h3>
            <div className="space-y-4">
              <div>
                <Label>Reviewers</Label>
                <div className="mt-2 space-y-2">
                  {review.approvedBy.map(approval => (
                    <div key={approval.id} className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={approval.author.avatar} />
                        <AvatarFallback>{approval.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{approval.author.name}</span>
                      <ThumbsUp className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                  {review.changesRequestedBy.map(request => (
                    <div key={request.id} className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={request.author.avatar} />
                        <AvatarFallback>{request.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{request.author.name}</span>
                      <ThumbsDown className="w-4 h-4 text-red-500" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label>Required Reviewers</Label>
                <div className="mt-2">
                  <Badge variant="outline">2 of 2 approved</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Status Checks</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Lint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Tests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Build</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
};

export default ReviewProcess; 