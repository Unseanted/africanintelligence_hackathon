import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { ThumbsUp, MessageSquare, Flag, Star, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import WebSocketService from '@/services/websocket';
import ForumGuidelinesModal from './ForumGuidelinesModal';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    reputation: number;
  };
  upvotes: number;
  downvotes: number;
  createdAt: string;
  replies: Comment[];
  isSolution?: boolean;
  isModerated?: boolean;
}

interface ThreadedDiscussionProps {
  lessonId: string;
  initialComments?: Comment[];
}

const ThreadedDiscussion: React.FC<ThreadedDiscussionProps> = ({ lessonId, initialComments = [] }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const { token, user } = useTourLMS();
  const { toast } = useToast();
  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    if (!token) return;

    // Initialize WebSocket connection
    wsService.initialize(token);

    // Listen for real-time updates
    wsService.onCommentUpdate((data) => {
      if (data.lessonId === lessonId) {
        setComments(prev => {
          const newComments = [...prev];
          const index = newComments.findIndex(c => c._id === data.comment._id);
          if (index >= 0) {
            newComments[index] = data.comment;
          } else {
            newComments.push(data.comment);
          }
          return newComments;
        });
      }
    });

    return () => {
      wsService.disconnect();
    };
  }, [token, lessonId]);

  const handleSubmitComment = async (parentId?: string) => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment,
          parentId
        })
      });

      if (!response.ok) throw new Error('Failed to post comment');

      const comment = await response.json();
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setReplyingTo(null);

      toast({
        title: 'Success',
        description: 'Comment posted successfully',
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    }
  };

  const handleVote = async (commentId: string, voteType: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType })
      });

      if (!response.ok) throw new Error('Failed to vote');

      const updatedComment = await response.json();
      setComments(prev => prev.map(c => 
        c._id === commentId ? updatedComment : c
      ));
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit vote',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsSolution = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/solution`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to mark as solution');

      const updatedComment = await response.json();
      setComments(prev => prev.map(c => 
        c._id === commentId ? updatedComment : c
      ));

      toast({
        title: 'Success',
        description: 'Marked as solution successfully',
      });
    } catch (error) {
      console.error('Error marking solution:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark as solution',
        variant: 'destructive',
      });
    }
  };

  const handleReport = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to report comment');

      toast({
        title: 'Success',
        description: 'Comment reported successfully',
      });
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to report comment',
        variant: 'destructive',
      });
    }
  };

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isExpanded = expandedComments.has(comment._id);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <div key={comment._id} className={`space-y-4 ${depth > 0 ? 'ml-8' : ''}`}>
        <Card className={`p-4 ${comment.isModerated ? 'bg-yellow-50' : ''}`}>
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={comment.author.avatar} />
              <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.author.name}</span>
                  <span className="text-sm text-gray-500">
                    Rep: {comment.author.reputation}
                  </span>
                  {comment.isSolution && (
                    <span className="text-sm text-green-600 font-medium">
                      <Star className="w-4 h-4 inline mr-1" />
                      Solution
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(comment._id, 'up')}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="ml-1">{comment.upvotes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(comment._id, 'down')}
                  >
                    <ThumbsUp className="w-4 h-4 transform rotate-180" />
                    <span className="ml-1">{comment.downvotes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReport(comment._id)}
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{comment.content}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment._id)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Reply
                </Button>
                {!comment.isSolution && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsSolution(comment._id)}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Mark as Solution
                  </Button>
                )}
                {hasReplies && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCommentExpansion(comment._id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 mr-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-1" />
                    )}
                    {isExpanded ? 'Hide Replies' : 'Show Replies'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {replyingTo === comment._id && (
          <div className="ml-8">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your reply..."
              className="mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
              <Button onClick={() => handleSubmitComment(comment._id)}>
                Post Reply
              </Button>
            </div>
          </div>
        )}

        {isExpanded && hasReplies && (
          <div className="space-y-4">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleGuidelinesClick = () => {
    setIsGuidelinesOpen(true);
  };

  const handleGuidelinesClose = () => {
    setIsGuidelinesOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Discussion</h2>
        <Button
          variant="outline"
          onClick={handleGuidelinesClick}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Forum Guidelines
        </Button>
      </div>

      <div className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Start a discussion..."
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button onClick={() => handleSubmitComment()}>
            Post Comment
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map(comment => renderComment(comment))}
      </div>

      <ForumGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={handleGuidelinesClose}
      />
    </div>
  );
};

export default ThreadedDiscussion; 