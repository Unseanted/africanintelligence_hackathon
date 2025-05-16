import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Clock, Star, MessageSquare, ThumbsUp, Eye, Tag, Pin, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Socket } from 'socket.io-client';

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

interface TopicRowProps {
  post: Post;
  onSelect: (post: Post) => void;
  onLikePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onPinPost: (postId: string) => void;
  currentUserId: string;
  isFacilitator: boolean;
}

const TopicRow: React.FC<TopicRowProps> = ({
  post,
  onSelect,
  onLikePost,
  onDeletePost,
  onPinPost,
  currentUserId,
  isFacilitator
}) => {
  const isLiked = post.likes?.includes(currentUserId);
  const isAuthor = post.author._id === currentUserId;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.profilePicture} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 
                className="text-lg font-semibold truncate cursor-pointer hover:text-blue-600"
                onClick={() => onSelect(post)}
              >
                {post.title}
              </h3>
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
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
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
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${isLiked ? 'text-blue-600' : ''}`}
                  onClick={() => onLikePost(post._id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.likes?.length || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => onSelect(post)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Reply
                </Button>
              </div>

              {(isFacilitator || isAuthor) && (
                <div className="flex items-center gap-2">
                  {isFacilitator && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => onPinPost(post._id)}
                    >
                      <Pin className="h-4 w-4" />
                      {post.isPinned ? 'Unpin' : 'Pin'}
                    </Button>
                  )}
                  {(isFacilitator || isAuthor) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      onClick={() => onDeletePost(post._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicRow; 