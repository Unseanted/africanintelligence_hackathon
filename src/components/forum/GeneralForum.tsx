import React, { useState, useEffect, useCallback } from 'react';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { getCommunityForum, createForumPost, getForumCategories, togglePostLike, deleteForumPost } from '@/api/forumService';
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
  Tag,
  Trash2,
  Edit,
  Pin
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
import { useSocket } from '@/services/socketService';
import { Card, CardContent } from '@/components/ui/card';

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

interface Category {
  id: string;
  name: string;
}

interface ForumPostProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onPin: (postId: string) => void;
  currentUserId: string;
  isFacilitator: boolean;
}

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSubmit: (postData: Partial<Post>) => void;
  isFacilitator: boolean;
}

const ForumPostSkeleton: React.FC = () => (
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

const ForumPost: React.FC<ForumPostProps> = ({ post, onLike, onDelete, onPin, currentUserId, isFacilitator }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // Implement comment submission logic
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
            <AvatarImage src={post.author.profilePicture || `https://ui-avatars.com/api/?name=${post.author.name}&background=random`} />
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
              post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.profilePicture || `https://ui-avatars.com/api/?name=${comment.author.name}&background=random`} />
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

      {/* Additional Actions */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
        {isFacilitator && (
          <>
            <Button variant="ghost" size="sm" onClick={() => onPin(post._id)}>
              <Pin className="h-4 w-4 mr-1" />
              {post.isPinned ? 'Unpin' : 'Pin'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(post._id)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ open, onOpenChange, categories, onSubmit, isFacilitator }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      onSubmit({
        title,
        content,
        category,
        isAnnouncement
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim()}>
            Create Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const GeneralForum: React.FC = () => {
  const { user, token } = useTourLMS();
  const { toast } = useToast();
  const socket = useSocket();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [forumPosts, forumCategories] = await Promise.all([
        getCommunityForum(token),
        getForumCategories(token)
      ]);
      setPosts(forumPosts || []);
      setCategories(forumCategories || []);
    } catch (error) {
      console.error('Error fetching forum data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load forum data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, selectedCategory, fetchData]);

  useEffect(() => {
    if (socket) {
      // Listen for new posts
      socket.on('forum:new_post', (newPost: Post) => {
        setPosts(prev => [newPost, ...prev]);
      });

      // Listen for post updates
      socket.on('forum:post_updated', (updatedPost: Post) => {
        setPosts(prev => prev.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        ));
      });

      // Listen for post deletions
      socket.on('forum:post_deleted', (postId: string) => {
        setPosts(prev => prev.filter(post => post._id !== postId));
      });

      // Listen for new comments
      socket.on('forum:new_comment', ({ postId, comment }: { postId: string, comment: Comment }) => {
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, comments: [...post.comments, comment] }
            : post
        ));
      });

      return () => {
        socket.off('forum:new_post');
        socket.off('forum:post_updated');
        socket.off('forum:post_deleted');
        socket.off('forum:new_comment');
      };
    }
  }, [socket]);

  const handleCreatePost = async (postData: Partial<Post>) => {
    try {
      const newPost = await createForumPost(postData, token);
      socket?.emit('forum:create_post', newPost);
      toast({
        title: 'Success',
        description: 'Your post has been published',
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish your post',
        variant: 'destructive',
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await togglePostLike(postId, token);
      socket?.emit('forum:like_post', { postId, userId: user?._id });
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to like the post',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deleteForumPost(postId, token);
      socket?.emit('forum:delete_post', postId);
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
      const updatedPost = await createForumPost({ postId, action: 'pin' }, token);
      socket?.emit('forum:pin_post', { postId, isPinned: updatedPost.isPinned });
      toast({
        title: 'Success',
        description: updatedPost.isPinned ? 'Post pinned successfully' : 'Post unpinned successfully',
      });
    } catch (error) {
      console.error('Error pinning post:', error);
      toast({
        title: 'Error',
        description: 'Failed to pin/unpin the post',
        variant: 'destructive',
      });
    }
  };

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterBy === 'all' || 
                          (filterBy === 'announcements' && post.isAnnouncement) ||
                          (filterBy === 'pinned' && post.isPinned) ||
                          (filterBy === 'solved' && post.isSolved) ||
                          (filterBy === 'unsolved' && !post.isSolved);
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      return matchesSearch && matchesFilter && matchesCategory;
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Filters</h3>
              <div className="space-y-2">
                <Button
                  variant={filterBy === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilterBy('all')}
                >
                  All Posts
                </Button>
                <Button
                  variant={filterBy === 'announcements' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilterBy('announcements')}
                >
                  Announcements
                </Button>
                <Button
                  variant={filterBy === 'pinned' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilterBy('pinned')}
                >
                  Pinned Posts
                </Button>
                <Button
                  variant={filterBy === 'solved' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilterBy('solved')}
                >
                  Solved
                </Button>
                <Button
                  variant={filterBy === 'unsolved' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setFilterBy('unsolved')}
                >
                  Unsolved
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <ForumPostSkeleton key={i} />
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <ForumPost
                  key={post._id}
                  post={post}
                  onLike={() => handleLikePost(post._id)}
                  onDelete={() => handleDeletePost(post._id)}
                  onPin={() => handlePinPost(post._id)}
                  currentUserId={user?._id}
                  isFacilitator={user?.role === 'facilitator'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-500 mb-1">No Posts Found</h3>
              <p className="text-gray-400">
                {searchQuery
                  ? 'Try adjusting your search or filter criteria'
                  : 'Be the first to start a discussion!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {showCreatePost && (
        <CreatePostDialog
          open={showCreatePost}
          onOpenChange={setShowCreatePost}
          categories={categories}
          onSubmit={handleCreatePost}
          isFacilitator={user?.role === 'facilitator'}
        />
      )}
    </div>
  );
};

export default GeneralForum; 