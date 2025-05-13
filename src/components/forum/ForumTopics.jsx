import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Users, Clock, Star, MessageSquare, Search } from 'lucide-react';
import ForumTopicDetail from './ForumTopicDetail';
import ForumPost from './ForumPost';

const TopicRow = ({ post, onSelect, onLikePost, currentUserId }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const lastComment = post.comments?.[post.comments.length - 1];
  const isLiked = post.likes?.includes(currentUserId);

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(post)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="hidden sm:flex">
            <AvatarFallback className="bg-red-100 text-red-800">{post.author?.name?.substring(0, 2).toUpperCase() || 'AN'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 hover:text-red-600 transition-colors">
                {post.title}
              </h3>
              {post.isAnnouncement && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  <Star className="w-3 h-3 mr-1" /> Announcement
                </Badge>
              )}
              {(post.comments?.length === 0 && !post.isAnnouncement) && (
                <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                  Unanswered
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-gray-500 mt-1">
              Started by <span className="font-medium">{post.author?.name || 'Anonymous'}</span>
            </div>
          </div>
          
          <div className="hidden md:flex flex-col items-center gap-1 min-w-20 text-center">
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1 text-gray-400" />
              <span className="text-sm font-medium">{post.comments?.length || 0}</span>
            </div>
            <span className="text-xs text-gray-500">{post.likes?.length || 0} likes</span>
          </div>
          
          <div className="hidden md:block min-w-32">
            {lastComment ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-gray-100">
                    {lastComment.author?.name?.substring(0, 2).toUpperCase() || 'AN'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xs font-medium">{lastComment.author?.name || 'Anonymous'}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(lastComment.createdAt)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">No comments yet</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ForumTopics = ({ categoryId, categoryTitle = "Course Q&A", posts = [], searchQuery = '', onLikePost, currentUserId, socket }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  
  const filteredPosts = searchQuery
    ? posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;
  
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
    />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-red-500" />
          {categoryTitle}
        </h2>
        <Button onClick={() => setShowNewPost(true)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          className="pl-10"
          placeholder="Search topics..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
        <div className="text-sm text-gray-600">
          {filteredPosts.length} topics • {filteredPosts.reduce((acc, post) => acc + (post.comments?.length || 0), 0)} posts
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Latest
          </Button>
          <Button variant="ghost" size="sm">
            Popular
          </Button>
          <Button variant="ghost" size="sm">
            Unsolved
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredPosts.map(post => (
          <TopicRow 
            key={post._id} 
            post={post} 
            onSelect={setSelectedTopic}
            onLikePost={onLikePost}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
};

export default ForumTopics;