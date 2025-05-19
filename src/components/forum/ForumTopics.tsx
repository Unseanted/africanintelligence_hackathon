import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Users, Clock, Star, MessageSquare, Search, ThumbsUp, Eye, Tag, Pin, Trash2 } from 'lucide-react';
import ForumTopicDetail from './ForumTopicDetail';
import ForumPost from './ForumPost';
import TopicRow from './TopicRow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '@/services/socketService';
import { useToast } from '@/hooks/use-toast';
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

interface ForumTopicsProps {
  categoryId: string;
  categoryTitle?: string;
  posts: Post[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLikePost: (postId: string) => void;
  currentUserId: string;
  socket: Socket;
  isFacilitator: boolean;
}

const ForumTopics: React.FC<ForumTopicsProps> = ({ 
  categoryId, 
  categoryTitle = "Course Q&A", 
  posts = [], 
  searchQuery = '', 
  onSearchChange,
  onLikePost, 
  currentUserId, 
  socket,
  isFacilitator
}) => {
  const [selectedTopic, setSelectedTopic] = useState<Post | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const { toast } = useToast();

  const handleFilterChange = (filter: string) => {
    setFilterBy(filter);
    setSortBy(filter === 'popular' ? 'popular' : 'recent');
  };

  const handleDeletePost = async (postId: string) => {
    try {
      socket.emit('forum:delete_post', postId);
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the post',
        variant: 'destructive',
      });
    }
  };

  const handlePinPost = async (postId: string) => {
    try {
      socket.emit('forum:pin_post', { postId });
      toast({
        title: 'Success',
        description: 'Post pin status updated',
      });
    } catch (error) {
      console.error('Error pinning post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update pin status',
        variant: 'destructive',
      });
    }
  };

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterBy === 'all' || 
                          (filterBy === 'solved' && post.isSolved) ||
                          (filterBy === 'unsolved' && !post.isSolved) ||
                          (filterBy === 'pinned' && post.isPinned) ||
                          (filterBy === 'announcements' && post.isAnnouncement);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'comments':
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        default:
          return 0;
      }
    });
  
  if (selectedTopic) {
    return <ForumTopicDetail
      post={selectedTopic}
      onBack={() => setSelectedTopic(null)}
      onLikePost={onLikePost}
      currentUserId={currentUserId}
      socket={socket}
    />;
  }

  if (showNewPost) {
    return <ForumPost 
      onCancel={() => setShowNewPost(false)} 
      category={categoryTitle}
      type="general"
      socket={socket}
      post={null}
      onLike={() => {}}
      onDelete={() => {}}
      onPin={() => {}}
      currentUserId={currentUserId}
      isFacilitator={isFacilitator}
    />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">{categoryTitle}</h2>
        <div className="flex gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="comments">Most Comments</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="unsolved">Unsolved</SelectItem>
              <SelectItem value="pinned">Pinned</SelectItem>
              {isFacilitator && (
                <SelectItem value="announcements">Announcements</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          className="pl-10"
          placeholder="Search topics..." 
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
        <div className="text-sm text-gray-600">
          {filteredPosts.length} topics • {filteredPosts.reduce((acc, post) => acc + (post.comments?.length || 0), 0)} posts
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterBy === 'recent' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleFilterChange('recent')}
          >
            Latest
          </Button>
          <Button 
            variant={filterBy === 'popular' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleFilterChange('popular')}
          >
            Popular
          </Button>
          <Button 
            variant={filterBy === 'unsolved' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleFilterChange('unsolved')}
          >
            Unsolved
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <TopicRow
            key={post._id}
            post={post}
            onSelect={setSelectedTopic}
            onLikePost={onLikePost}
            onDeletePost={handleDeletePost}
            onPinPost={handlePinPost}
            currentUserId={currentUserId}
            isFacilitator={isFacilitator}
          />
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No topics found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery ? 'Try adjusting your search or filter criteria' : 'Be the first to start a discussion!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumTopics; 