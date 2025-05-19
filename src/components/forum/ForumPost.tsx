import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, MessageCircle, Send, Paperclip, Heart, RefreshCw, Reply, BookmarkPlus, MessageSquare, ThumbsUp, Clock, Pin, Trash2, Edit, CheckCircle, ArrowLeft, Tag } from 'lucide-react';
import { getForumCategories, createForumPost } from '@/api/forumService';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '@/services/socketService';
import { Badge } from "@/components/ui/badge";
import { Socket } from 'socket.io-client';
import { Input } from "@/components/ui/input";

interface Category {
  id: number;
  name: string;
}

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

interface ForumPostProps {
  onCancel: () => void;
  category?: string;
  type?: 'general' | 'course';
  socket: Socket;
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onPin: (postId: string) => void;
  currentUserId: string;
  isFacilitator: boolean;
}

const forumCategories: Category[] = [
  "Smart Trends",
  "Technology Implementation",
  "Virtual & Augmented Reality",
  "Data Analytics & AI",
  "AI in Career Development",
  "Sustainable Technology",
  "Tech-Driven Marketing Strategies",
  "Hospitality Technology Solutions"
].map((cat, ind) => ({ name: cat, id: ind }));

const ForumPost: React.FC<ForumPostProps> = ({
  onCancel,
  category,
  type = "general",
  socket,
  post,
  onLike,
  onDelete,
  onPin,
  currentUserId,
  isFacilitator
}) => {
  const { token } = useTourLMS();
  const { toast } = useToast();
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>(forumCategories);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [newTag, setNewTag] = useState('');

  // Fetch forum categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getForumCategories(token);
        setCategories(categoriesData);
        if (categoriesData.length > 0 && !selectedCategory) {
          setSelectedCategory(categoriesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories. Please try again.',
          variant: 'destructive',
        });
      }
    };

    if (token) {
      fetchCategories();
    }
  }, [token, toast, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const postData = {
        title,
        content,
        category: selectedCategory,
        isCommunityPost: true,
        tags,
        isAnnouncement: isFacilitator && type === 'course'
      };
      
      if (post) {
        socket.emit('forum:update_post', {
          postId: post._id,
          title: title.trim(),
          content: content.trim(),
          tags
        });
        toast({
          title: 'Success',
          description: 'Post updated successfully',
        });
      } else {
        socket.emit('forum:create_post', postData);
        toast({
          title: 'Success',
          description: 'Post created successfully',
        });
      }
      
      onCancel(); // Close the form after submission
    } catch (error: unknown) {
      console.error('Error submitting post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit post';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      socket?.emit('forum:add_comment', {
        postId: post._id,
        content: newComment.trim()
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsSolution = async (commentId: string) => {
    try {
      socket?.emit('forum:mark_solution', {
        postId: post._id,
        commentId
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

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Post Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback>{post.author?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-slate-900 dark:text-white flex items-center">
              {post.author?.name || 'Unknown User'}
              {post.author?.role === 'facilitator' && (
                <Badge variant="secondary" className="ml-2 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  Facilitator
                </Badge>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
        {post.isPinned && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Pin className="h-3 w-3" />
            Pinned
          </Badge>
        )}
      </div>

      {/* Post Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">{post.title}</h3>
        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{post.content}</p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-1 ${
              post.likes?.includes(currentUserId) ? 'text-red-500' : ''
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            {post.likes?.length || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            {post.comments?.length || 0}
          </Button>
        </div>

        {isFacilitator && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPin(post._id)}
              className="flex items-center gap-1"
            >
              <Pin className="h-4 w-4" />
              {post.isPinned ? 'Unpin' : 'Pin'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post._id)}
              className="flex items-center gap-1 text-red-500"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <div className="p-4 space-y-4">
            {post.comments?.map((comment) => (
              <div
                key={comment._id}
                className="flex gap-3 py-2 border-b border-slate-200 dark:border-slate-700 last:border-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author?.profilePicture} />
                  <AvatarFallback>{comment.author?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-slate-900 dark:text-white">
                      {comment.author?.name || 'Unknown User'}
                    </span>
                    {comment.author?.role === 'facilitator' && (
                      <Badge variant="secondary" className="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        Facilitator
                      </Badge>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {comment.isSolution && (
                      <Badge variant="secondary" className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Solution
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 break-words">
                    {comment.content}
                  </p>
                  {isFacilitator && !comment.isSolution && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsSolution(comment._id)}
                      className="mt-1 text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark as Solution
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Comment */}
            <div className="flex gap-3 mt-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author?.profilePicture} />
                <AvatarFallback>{post.author?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="mt-2"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add Tag
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? 'Submitting...' : post ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ForumPost; 