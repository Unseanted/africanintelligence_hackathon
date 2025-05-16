import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Users, Clock, Star, MessageSquare, ThumbsUp, Eye, Tag, Pin, Trash2, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  name: string;
  profilePicture?: string;
  role: string;
}

interface Comment {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
  likes: string[];
  isSolution: boolean;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  likes: string[];
  comments: Comment[];
  views: number;
  isSolved: boolean;
  isAnnouncement: boolean;
  isPinned: boolean;
  category: string;
  tags?: string[];
}

interface ForumTopicDetailProps {
  post: Post;
  onBack: () => void;
  onLikePost: (postId: string) => void;
  currentUserId: string;
  socket: Socket;
}

const ForumTopicDetail: React.FC<ForumTopicDetailProps> = ({
  post,
  onBack,
  onLikePost,
  currentUserId,
  socket
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isLiked = post.likes?.includes(currentUserId);
  const isAuthor = post.author._id === currentUserId;
  const isFacilitator = post.author.role === 'facilitator';

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      socket.emit('forum:add_comment', {
        postId: post._id,
        content: newComment.trim()
      });
      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsSolution = async (commentId: string) => {
    try {
      socket.emit('forum:mark_solution', {
        postId: post._id,
        commentId
      });
      toast({
        title: 'Success',
        description: 'Marked as solution',
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

  const handleDeleteComment = async (commentId: string) => {
    try {
      socket.emit('forum:delete_comment', {
        postId: post._id,
        commentId
      });
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Topics
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.profilePicture} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{post.title}</h2>
                {post.isPinned && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {post.isAnnouncement && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Star className="h-3 w-3 mr-1" />
                    Announcement
                  </Badge>
                )}
                {post.isSolved && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Star className="h-3 w-3 mr-1" />
                    Solved
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {post.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {post.comments?.length || 0} comments
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views || 0} views
                </span>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="prose max-w-none mb-6">
                {post.content}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${isLiked ? 'text-blue-600' : ''}`}
                  onClick={() => onLikePost(post._id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.likes?.length || 0} likes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comments</h3>
        
        {post.comments?.map((comment) => (
          <Card key={comment._id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.author.profilePicture} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.author.name}</span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {comment.isSolution && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Solution
                        </Badge>
                      )}
                    </div>
                    {(isFacilitator || comment.author._id === currentUserId) && (
                      <div className="flex items-center gap-2">
                        {isFacilitator && !comment.isSolution && !post.isSolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleMarkAsSolution(comment._id)}
                          >
                            <Star className="h-4 w-4" />
                            Mark as Solution
                          </Button>
                        )}
                        {(isFacilitator || comment.author._id === currentUserId) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="prose max-w-none">
                    {comment.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="p-4">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-4"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForumTopicDetail; 