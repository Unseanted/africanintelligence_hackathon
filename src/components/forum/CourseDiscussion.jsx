
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User, ThumbsUp } from 'lucide-react';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { getCourseForumPosts, createForumPost, addCommentToPost, toggleLikePost } from '@/api/forumService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { clg } from '../../lib/basic';

const CourseDiscussion = ({ courseId }) => {
  const { user, token, socket } = useTourLMS();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [comments, setComments] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token && courseId) {
      fetchPosts();
    }
  }, [token, courseId]);

  useEffect(() => {
    if (socket) {
      // Listen for new posts
      socket.on(`forum:new-post:${courseId}`, (newPost) => {
        setPosts(prev => [newPost, ...prev]);
      });

      // Listen for new comments
      socket.on(`forum:new-comment`, (data) => {
        if (data.courseId === courseId) {
          setPosts(prev => prev.map(post => {
            if (post._id === data.postId) {
              return {
                ...post,
                comments: [...(post.comments || []), data.comment]
              };
            }
            return post;
          }));
        }
      });

      // Listen for post likes
      socket.on(`forum:post-like`, (data) => {
        if (data.courseId === courseId) {
          setPosts(prev => prev.map(post => {
            if (post._id === data.postId) {
              return {
                ...post,
                likes: data.likes
              };
            }
            return post;
          }));
        }
      });

      return () => {
        socket.off(`forum:new-post:${courseId}`);
        socket.off(`forum:new-comment`);
        socket.off(`forum:post-like`);
      };
    }
  }, [socket, courseId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const forumPosts = await getCourseForumPosts(courseId, token);
      clg('course forum --- ',forumPosts)
      setPosts(forumPosts || []);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load forum posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a title and content for your post',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const newPost = await createForumPost({
        title: newPostTitle,
        content: newPostContent,
        course: courseId,
        category: 'general'
      }, token);

      // Only add to local state if socket integration isn't doing it
      if (!socket) {
        setPosts(prev => [newPost, ...prev]);
      }
      
      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPostForm(false);
      
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (postId) => {
    const commentContent = comments[postId];
    if (!commentContent || !commentContent.trim()) {
      toast({
        title: 'Missing content',
        description: 'Please enter a comment',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await addCommentToPost(postId, commentContent, token);
      
      // Only update local state if socket integration isn't doing it
      if (!socket) {
        setPosts(prev => prev.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [
                ...(post.comments || []),
                {
                  author: {
                    _id: user._id,
                    name: user.name,
                    profilePicture: user.profilePicture,
                    role: user.role
                  },
                  content: commentContent,
                  createdAt: new Date()
                }
              ]
            };
          }
          return post;
        }));
      }
      
      setComments({
        ...comments,
        [postId]: ''
      });
      
      toast({
        title: 'Success',
        description: 'Your comment has been added',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add your comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await toggleLikePost(postId, token);
      // The socket will update the UI
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to like the post',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Course Discussion</h3>
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-4" />
                <Skeleton className="h-16 w-full mb-2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Course Discussion</h3>
        <Button onClick={() => setShowNewPostForm(!showNewPostForm)}>
          {showNewPostForm ? 'Cancel' : 'New Post'}
        </Button>
      </div>

      {showNewPostForm && (
        <Card className="p-4">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <Input
                placeholder="Post title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {posts.length === 0 ? (
        <Card className="p-6 text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium">No discussions yet</h3>
          <p className="text-gray-500 mb-4">Be the first to start a discussion about this course</p>
          <Button onClick={() => setShowNewPostForm(true)}>Start Discussion</Button>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post._id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={post.author?.profilePicture || ''} alt={post.author?.name || 'User'} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-semibold">{post.author?.name || 'Anonymous'}</h4>
                    {post.author?.role === 'facilitator' && (
                      <Badge variant="outline" className="ml-2 bg-red-100">Facilitator</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(post.createdAt), 'PPp')}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleLikePost(post._id)}
                >
                  <ThumbsUp className={`h-4 w-4 ${post.likes?.includes(user?._id) ? 'fill-current text-blue-500' : ''}`} />
                  <span>{post.likes?.length || 0}</span>
                </Button>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{post.title}</h3>
                <p className="mt-1 text-gray-700">{post.content}</p>
              </div>
              
              {/* Comments section */}
              <div className="pl-4 border-l-2 border-gray-100 mt-4 space-y-3">
                {post.comments && post.comments.length > 0 && (
                  <h5 className="text-sm font-medium text-gray-500">
                    {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                  </h5>
                )}
                
                {post.comments && post.comments.map((comment, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author?.profilePicture || ''} alt={comment.author?.name || 'User'} />
                      <AvatarFallback className="text-xs">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">{comment.author?.name || 'Anonymous'}</p>
                        {comment.author?.role === 'facilitator' && (
                          <Badge variant="outline" className="ml-2 text-xs bg-red-100">Facilitator</Badge>
                        )}
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Add comment form */}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a comment..."
                    value={comments[post._id] || ''}
                    onChange={(e) => setComments({...comments, [post._id]: e.target.value})}
                    className="text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleAddComment(post._id)}
                    disabled={submitting}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default CourseDiscussion;
