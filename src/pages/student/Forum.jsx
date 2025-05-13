import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Users, TrendingUp } from 'lucide-react';
import ForumCategories from '@/components/forum/ForumCategories';
import ForumTopics from '@/components/forum/ForumTopics';
import { getCommunityForum, getForumCategories, togglePostLike } from '@/api/forumService';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useToast } from '@/hooks/use-toast';
import { clg } from '../../lib/basic';

const Forum = () => {
  const { user, token } = useTourLMS();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ totalTopics: 0, totalPosts: 0, activeUsers: 0, onlineNow: 0 });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Fetch forum data (categories, posts, and stats)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, postsData] = await Promise.all([
          getForumCategories(token),
          getCommunityForum(token),
        ]);

        clg([categoriesData,postsData])
        setCategories(categoriesData);
        setPosts(postsData.posts || []);

        // Calculate forum stats
        const totalTopics = postsData.posts?.length || 0;
        const totalPosts = postsData.posts?.reduce((acc, post) => acc + (post.comments?.length || 0), 0) || 0;
        const activeUsers = new Set(postsData.posts?.map(post => post.author?._id)).size || 0;
        const onlineNow = 42; // This could be fetched via socket or another API if available

        setStats({ totalTopics, totalPosts, activeUsers, onlineNow });
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
  }, [token, toast]);

  // Set up socket.io for real-time updates
  useEffect(() => {
    if (!token) return;

    const socketInstance = io('https://africanapi.onrender.com', {
      auth: { token },
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      socketInstance.emit('join_room', 'forum:community');
    });

    // Listen for new posts
    socketInstance.on('forum:new_community_post', (newPost) => {
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setStats(prevStats => ({
        ...prevStats,
        totalTopics: prevStats.totalTopics + 1,
      }));
    });

    // Listen for new comments
    socketInstance.on('forum:new_community_comment', ({ postId, comment }) => {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? { ...post, comments: [...(post.comments || []), comment] }
            : post
        )
      );
      setStats(prevStats => ({
        ...prevStats,
        totalPosts: prevStats.totalPosts + 1,
      }));
    });

    // Listen for post updates (e.g., likes)
    socketInstance.on('forum:community_post_updated', ({ _id }) => {
      setPosts(prevPosts =>
        prevPosts.map(async post => {
          if (post._id === _id) {
            const updatedPost = await getForumPost(_id, token);
            return updatedPost;
          }
          return post;
        })
      );
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  // Handle like/unlike post
  const handleLikePost = async (postId) => {
    try {
      const updatedPost = await togglePostLike(postId, token);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, likes: updatedPost.likes } : post
        )
      );

      // Emit socket event for real-time update
      socket?.emit('forum:toggle_like', { postId, courseId: null });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle like. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Course Forum</h1>
          <p className="text-gray-600">Connect with fellow students and instructors</p>
        </div>
        
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              className="pl-10" 
              placeholder="Search forum..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-1 lg:col-span-3 bg-red-50 border-red-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                <MessageCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">Welcome to our Course Forum</h2>
                <p className="text-gray-600 mb-3">
                  This is a space for students and instructors to interact, ask questions, 
                  and share knowledge. Please remember to be respectful and supportive.
                </p>
                <Button size="sm">
                  Forum Guidelines
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              Forum Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Topics:</span>
                <Badge variant="outline">{stats.totalTopics}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Posts:</span>
                <Badge variant="outline">{stats.totalPosts}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users:</span>
                <Badge variant="outline">{stats.activeUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Online Now:</span>
                <Badge className="bg-green-100 text-green-800">{stats.onlineNow}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="recent">Recent Discussions</TabsTrigger>
          <TabsTrigger value="popular">Popular Topics</TabsTrigger>
          <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <ForumCategories categories={categories} />
        </TabsContent>
        
        <TabsContent value="recent">
          <ForumTopics
            categoryTitle="Recent Discussions"
            posts={posts}
            searchQuery={searchQuery}
            onLikePost={handleLikePost}
            currentUserId={user?._id}
            socket={socket}
          />
        </TabsContent>
        
        <TabsContent value="popular">
          <ForumTopics
            categoryTitle="Popular Topics"
            posts={posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))}
            searchQuery={searchQuery}
            onLikePost={handleLikePost}
            currentUserId={user?._id}
            socket={socket}
          />
        </TabsContent>
        
        <TabsContent value="unanswered">
          <ForumTopics
            categoryTitle="Unanswered Questions"
            posts={posts.filter(post => !post.comments || post.comments.length === 0)}
            searchQuery={searchQuery}
            onLikePost={handleLikePost}
            currentUserId={user?._id}
            socket={socket}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Forum;