import React, { useState, useEffect, useCallback } from 'react';
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
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  likes: string[];
  comments: Comment[];
  course: string;
  category: string;
}

interface CourseDiscussionProps {
  courseId: string;
}

const CourseDiscussion: React.FC<CourseDiscussionProps> = ({ courseId }) => {
  const { user, token, socket } = useTourLMS();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const forumPosts = await getCourseForumPosts(courseId, token);
      clg('course forum --- ', forumPosts);
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
  }, [courseId, token, toast]);

  useEffect(() => {
    if (token && courseId) {
      fetchPosts();
    }
  }, [token, courseId, fetchPosts]);

  useEffect(() => {
    if (socket) {
      // Listen for new posts
      socket.on(`forum:new-post:${courseId}`, (newPost: Post) => {
        setPosts(prev => [newPost, ...prev]);
      });

      // Listen for new comments
      socket.on(`forum:new-comment`, (data: { courseId: string; postId: string; comment: Comment }) => {
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
      socket.on(`forum:post-like`, (data: { courseId: string; postId: string; likes: string[] }) => {
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

  const handleCreatePost = async (e: React.FormEvent) => {
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

  const handleAddComment = async (postId: string) => {
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
                  _id: `temp-${Date.now()}`,
                  author: {
                    _id: user._id,
                    name: user.name,
                    profilePicture: user.profilePicture,
                    role: user.role
                  },
                  content: commentContent,
                  createdAt: new Date().toISOString()
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

  const handleLikePost = async (postId: string) => {
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
                placeholder="Write your post..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px]"
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

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post._id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.profilePicture} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{post.title}</h4>
                  <p className="text-sm text-gray-500">
                    Posted by {post.author.name} • {format(new Date(post.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <p className="text-gray-700">{post.content}</p>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikePost(post._id)}
                  className={post.likes?.includes(user._id) ? 'text-red-500' : ''}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {post.likes?.length || 0}
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={comments[post._id] || ''}
                      onChange={(e) => setComments({ ...comments, [post._id]: e.target.value })}
                      className="flex-1"
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
              {post.comments?.length > 0 && (
                <div className="space-y-3 mt-4">
                  {post.comments.map((comment) => (
                    <div key={comment._id} className="flex items-start gap-3 pl-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.profilePicture} />
                        <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.author.name}</span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseDiscussion; 