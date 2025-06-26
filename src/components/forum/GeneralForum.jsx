// Required env: VITE_AVATAR_URL
const AVATAR_URL = import.meta.env.VITE_AVATAR_URL || 'https://ui-avatars.com/api/';

import React, { useState, useEffect } from 'react';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { getCommunityForum, createForumPost, getForumCategories } from '@/api/forumService';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Users,
  Search,
  Filter,
  Plus,
  ThumbsUp,
  Clock,
  Send,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const ForumPostSkeleton = () => (
  <div className="space-y-3 p-4 border rounded-lg">
    <div className="flex items-center space-x-2">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-3 w-[100px]" />
      </div>
    </div>
    <Skeleton className="h-4 w-[80%]" />
    <Skeleton className="h-4 w-[60%]" />
    <div className="flex justify-between pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

const ForumPost = ({ post, onLike, onComment, currentUserId }) => {
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

  const isLiked = post.likes?.includes(currentUserId);

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
            <AvatarImage src={post.author.profilePicture || `${AVATAR_URL}?name=${post.author.name}&background=random`} />
            <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-slate-900 dark:text-white">{post.author.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(post.createdAt)}
              {post.category && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {post.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {post.isAnnouncement && (
          <Badge className="bg-amber-500 hover:bg-amber-600">Announcement</Badge>
        )}
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
          <ThumbsUp className="h-4 w-4 mr-1" /> {post.likes?.length || 0}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
          <MessageSquare className="h-4 w-4 mr-1" /> {post.comments?.length || 0} Comments
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
                    <AvatarImage src={comment.author.profilePicture || `${AVATAR_URL}?name=${comment.author.name}&background=random`} />
                    <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-900 dark:text-white">{comment.author.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
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

const CreatePostDialog = ({ open, onOpenChange, categories, onCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      onCreate({
        title,
        content,
        category,
        isAnnouncement,
        isCommunityPost: true
      });
      // Reset form
      setTitle('');
      setContent('');
      setCategory('general');
      setIsAnnouncement(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, questions, or insights with the community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">Content</label>
            <Textarea
              id="content"
              placeholder="What would you like to share?"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Only show for facilitators */}
          {/* <div className="flex items-center space-x-2">
            <Checkbox
              id="isAnnouncement"
              checked={isAnnouncement}
              onCheckedChange={setIsAnnouncement}
            />
            <label htmlFor="isAnnouncement" className="text-sm font-medium">
              Mark as announcement
            </label>
          </div> */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim()}>
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const GeneralForum = () => {
  const { user, token } = useTourLMS();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsData, categoriesData] = await Promise.all([
          getCommunityForum(token),
          getForumCategories()
        ]);
        setPosts(postsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching forum data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load forum data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleCreatePost = async (postData) => {
    try {
      const newPost = await createForumPost(postData, token);
      setPosts([newPost, ...posts]);
      toast({
        title: 'Success',
        description: 'Your post has been published!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await fetch(`/api/forum/${postId}/like`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) throw new Error('Failed to like post');
      
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const userLiked = post.likes.includes(user._id);
          const newLikes = userLiked 
            ? post.likes.filter(id => id !== user._id)
            : [...post.likes, user._id];
          
          return { ...post, likes: newLikes };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to like post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const response = await fetch(`/api/forum/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      
      const newComment = await response.json();
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return { ...post, comments: [...post.comments, newComment] };
        }
        return post;
      }));
      
      toast({
        title: 'Success',
        description: 'Your comment has been added!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Filter posts based on active tab, search query, and category
  const filteredPosts = posts.filter(post => {
    // Filter by tab
    if (activeTab === 'announcements' && !post.isAnnouncement) return false;
    if (activeTab === 'myPosts' && post.author._id !== user?._id) return false;
    
    // Filter by search query
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !post.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory !== 'all' && post.category !== selectedCategory) return false;
    
    return true;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Community Forum</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Connect, share, and learn with the African Intelligence community
          </p>
        </div>
        
        <Button 
          onClick={() => setShowCreatePost(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Categories</h3>
            </div>
            <div className="p-2">
              <div className="space-y-1">
                <Button 
                  variant={selectedCategory === 'all' ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  All Categories
                </Button>
                
                {categories.map((category) => (
                  <Button 
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"} 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Forum Stats</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">Total Posts</span>
                  <span className="font-medium">{posts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">Active Users</span>
                  <span className="font-medium">{posts.reduce((acc, post) => {
                    if (!acc.includes(post.author._id)) acc.push(post.author._id);
                    return acc;
                  }, []).length}</span>
                </div>
                {user && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300">Your Posts</span>
                    <span className="font-medium">{posts.filter(post => post.author._id === user._id).length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search posts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>All Posts</span>
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Announcements</span>
              </TabsTrigger>
              <TabsTrigger value="myPosts" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>My Posts</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {loading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <ForumPostSkeleton key={i} />
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <ForumPost
                      key={post._id}
                      post={post}
                      onLike={handleLikePost}
                      onComment={handleAddComment}
                      currentUserId={user?._id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                  <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No posts found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {searchQuery 
                      ? 'No posts match your search criteria' 
                      : 'Be the first to start a discussion'}
                  </p>
                  {!searchQuery && (
                    <Button 
                      onClick={() => setShowCreatePost(true)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create Post
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="announcements" className="space-y-6">
              {/* Same structure as "all" tab but filtered for announcements */}
              {loading ? (
                <div className="space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <ForumPostSkeleton key={i} />
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <ForumPost
                      key={post._id}
                      post={post}
                      onLike={handleLikePost}
                      onComment={handleAddComment}
                      currentUserId={user?._id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                  <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No announcements found</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Check back later for important announcements
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="myPosts" className="space-y-6">
              {/* Same structure as "all" tab but filtered for user's posts */}
              {loading ? (
                <div className="space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <ForumPostSkeleton key={i} />
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <ForumPost
                      key={post._id}
                      post={post}
                      onLike={handleLikePost}
                      onComment={handleAddComment}
                      currentUserId={user?._id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                  <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">You haven't created any posts yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Share your thoughts with the community
                  </p>
                  <Button 
                    onClick={() => setShowCreatePost(true)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Create Your First Post
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Create Post Dialog */}
      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        categories={categories}
        onCreate={handleCreatePost}
      />
    </div>
  );
};

export default GeneralForum;
