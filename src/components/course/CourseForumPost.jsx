// Required env: VITE_AVATAR_URL
const AVATAR_URL = import.meta.env.VITE_AVATAR_URL || 'https://ui-avatars.com/api/';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ThumbsUp, MessageSquare, Clock, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const CourseForumPost = ({ post, onLike, onComment, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onComment(post._id, newComment);
      setNewComment('');
    }
  };

  const isLiked = Array.isArray(post.likes) && post.likes.includes(currentUserId);

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
            <AvatarImage src={post.author?.profilePicture || `${AVATAR_URL}?name=${post.author?.name || 'User'}&background=random`} />
            <AvatarFallback>{(post.author?.name || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-slate-900 dark:text-white flex items-center">
              {post.author?.name || 'Unknown User'}
              {post.author?.role === 'facilitator' && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs rounded-md">
                  Facilitator
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">{post.title}</h3>
        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onLike(post._id)}
          className={isLiked ? "text-red-500 dark:text-red-400" : ""}
        >
          <ThumbsUp className="h-4 w-4 mr-1" /> {(post.likes || []).length || 0}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
          <MessageSquare className="h-4 w-4 mr-1" /> {(post.comments || []).length || 0} Comments
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          {/* Comment List */}
          <div className="max-h-80 overflow-y-auto space-y-3 mb-3">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, index) => (
                <div key={index} className="flex gap-3 py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.profilePicture || `${AVATAR_URL}?name=${comment.author?.name || 'User'}&background=random`} />
                    <AvatarFallback>{(comment.author?.name || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-slate-900 dark:text-white">{comment.author?.name || 'Unknown User'}</span>
                      {comment.author?.role === 'facilitator' && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">Facilitator</Badge>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 break-words">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-3">No comments yet. Be the first to comment!</div>
            )}
          </div>

          {/* Comment Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CourseForumPost;
