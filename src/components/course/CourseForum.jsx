
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  ThumbsUp, 
  Clock, 
  User,
  Trash2, 
  Edit,
  AlertCircle 
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { 
  getCourseForum, 
  createForumPost, 
  addForumComment, 
  togglePostLike, 
  deleteForumPost, 
  deleteForumComment 
} from '@/api/forumService';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '@/services/socketService';

const CourseForum = ({ courseId, isFacilitator = false }) => {
  const { user, token } = useTourLMS();
  const { toast } = useToast();
  const socketService = useSocket();
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const commentInputRef = useRef(null);

  useEffect(() => {
    loadForumData();
    
    // Join the course forum room for real-time updates
    if (socketService) {
      socketService.joinRoom(`forum:course:${courseId}`);
      
      // Set up socket event listeners
      const newPostListener = (data) => {
        if (data.course === courseId) {
          setPosts(prev => [data, ...prev]);
        }
      };
      
      const newCommentListener = (data) => {
        if (data.courseId === courseId) {
          setPosts(prev => prev.map(post => 
            post._id === data.postId 
              ? { ...post, comments: [...post.comments, data.comment] }
              : post
          ));
          
          // If this is the selected post, update it too
          if (selectedPost && selectedPost._id === data.postId) {
            setSelectedPost(prev => ({
              ...prev,
              comments: [...prev.comments, data.comment]
            }));
          }
        }
      };
      
      const postUpdatedListener = (data) => {
        if (data.course === courseId) {
          setPosts(prev => prev.map(post => 
            post._id === data._id ? data : post
          ));
          
          // If this is the selected post, update it too
          if (selectedPost && selectedPost._id === data._id) {
            setSelectedPost(data);
          }
        }
      };
      
      socketService.on('forum:new_post', newPostListener);
      socketService.on('forum:new_comment', newCommentListener);
      socketService.on('forum:post_updated', postUpdatedListener);
      
      return () => {
        socketService.off('forum:new_post', newPostListener);
        socketService.off('forum:new_comment', newCommentListener);
        socketService.off('forum:post_updated', postUpdatedListener);
        socketService.leaveRoom(`forum:course:${courseId}`);
      };
    }
  }, [courseId, token, socketService, selectedPost]);

  const loadForumData = async () => {
    try {
      setLoading(true);
      const forumData = await getCourseForum(courseId, token);
      
      // Separate announcements from regular posts
      const announcementPosts = forumData.filter(post => post.isAnnouncement);
      const regularPosts = forumData.filter(post => !post.isAnnouncement);
      
      setAnnouncements(announcementPosts);
      setPosts(regularPosts);
    } catch (error) {
      console.error('Error loading forum data:', error);
      toast({
        title: "Error",
        description: "Failed to load forum discussions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and content for your post.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const postData = {
        title: newPostTitle,
        content: newPostContent,
        course: courseId,
        isAnnouncement: isFacilitator && true, // Only facilitators can create announcements
      };
      
      const createdPost = await createForumPost(postData, token);
      
      if (createdPost.isAnnouncement) {
        setAnnouncements(prev => [createdPost, ...prev]);
      } else {
        setPosts(prev => [createdPost, ...prev]);
      }
      
      // Emit the new post event via socket
      if (socketService) {
        socketService.sendForumPost(createdPost);
      }
      
      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPostForm(false);
      
      toast({
        title: "Success",
        description: "Your post has been published.",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to publish your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPost = (post) => {
    setSelectedPost(post);
    setNewComment('');
    
    // Focus the comment input when a post is selected
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 100);
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      const commentData = {
        content: newComment,
      };
      
      const result = await addForumComment(selectedPost._id, commentData, token);
      
      // Update the selected post with the new comment
      setSelectedPost(prev => ({
        ...prev,
        comments: [...prev.comments, result.comment]
      }));
      
      // Update the post in the full list too
      setPosts(prev => prev.map(post => 
        post._id === selectedPost._id 
          ? { ...post, comments: [...post.comments, result.comment] }
          : post
      ));
      
      // Emit the new comment event via socket
      if (socketService) {
        socketService.sendForumComment(selectedPost._id, {
          content: newComment,
          postId: selectedPost._id,
          courseId: courseId
        });
      }
      
      setNewComment('');
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the discussion.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes.includes(user.id);
          const newLikes = isLiked
            ? post.likes.filter(id => id !== user.id)
            : [...post.likes, user.id];
          
          return { ...post, likes: newLikes };
        }
        return post;
      }));
      
      // If this is the selected post, update it too
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(prev => {
          const isLiked = prev.likes.includes(user.id);
          const newLikes = isLiked
            ? prev.likes.filter(id => id !== user.id)
            : [...prev.likes, user.id];
          
          return { ...prev, likes: newLikes };
        });
      }
      
      // Send to server
      await togglePostLike(postId, token);
      
      // Emit the post update event via socket
      if (socketService) {
        socketService.emit('forum:toggle_like', { postId, courseId });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      
      // Revert optimistic update on error
      loadForumData();
      
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteForumPost(postId, token);
      
      // Remove the post from state
      setPosts(prev => prev.filter(post => post._id !== postId));
      setAnnouncements(prev => prev.filter(post => post._id !== postId));
      
      // If this was the selected post, go back to the list
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(null);
      }
      
      toast({
        title: "Post Deleted",
        description: "The post has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteForumComment(postId, commentId, token);
      
      // Update both posts list and selected post
      const updateComments = (postToUpdate) => {
        return {
          ...postToUpdate,
          comments: postToUpdate.comments.filter(comment => comment._id !== commentId)
        };
      };
      
      setPosts(prev => prev.map(post => 
        post._id === postId ? updateComments(post) : post
      ));
      
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(updateComments(selectedPost));
      }
      
      toast({
        title: "Comment Deleted",
        description: "The comment has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete the comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToList}
              className="mb-4"
            >
              ← Back to Discussions
            </Button>
            
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={selectedPost.author?.profilePicture} />
                <AvatarFallback>{getUserInitials(selectedPost.author?.name)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedPost.title}</h2>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <span>{selectedPost.author?.name || 'Unknown User'}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(selectedPost.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {(isFacilitator || selectedPost.author?._id === user.id) && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDeletePost(selectedPost._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="my-4 prose max-w-none">
                  <p className="whitespace-pre-line">{selectedPost.content}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`flex items-center gap-1 ${
                      selectedPost.likes.includes(user.id) ? 'text-red-500' : ''
                    }`}
                    onClick={() => handleToggleLike(selectedPost._id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{selectedPost.likes.length}</span>
                  </Button>
                  
                  <div className="text-sm text-gray-500">
                    {selectedPost.comments.length} comments
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t my-6"></div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-4">Comments</h3>
            
            {selectedPost.comments.length > 0 ? (
              <div className="space-y-4">
                {selectedPost.comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author?.profilePicture} />
                      <AvatarFallback>{getUserInitials(comment.author?.name)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <div className="font-medium text-sm">
                            {comment.author?.name || 'Unknown User'}
                          </div>
                          
                          {(isFacilitator || comment.author?._id === user.id) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 text-red-500"
                              onClick={() => handleDeleteComment(selectedPost._id, comment._id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <form onSubmit={handleAddComment}>
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={!newComment.trim() || submitting}
                    className="flex items-center gap-1"
                  >
                    {submitting ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Course Forum</h2>
          
          <Button 
            onClick={() => setShowNewPostForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New {isFacilitator ? 'Announcement' : 'Post'}
          </Button>
        </div>
        
        {showNewPostForm && (
          <Card className="mb-6 bg-gray-50">
            <CardContent className="p-4">
              <form onSubmit={handleCreatePost}>
                <div className="space-y-4">
                  <h3 className="font-medium">Create New {isFacilitator ? 'Announcement' : 'Post'}</h3>
                  
                  <div>
                    <Input
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Title"
                      className="mb-2"
                    />
                    
                    <Textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className="h-32"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewPostForm(false)}
                    >
                      Cancel
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={!newPostTitle.trim() || !newPostContent.trim() || submitting}
                    >
                      {submitting ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      ) : null}
                      Post
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="discussions">
          <TabsList className="mb-4">
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discussions">
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectPost(post)}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={post.author?.profilePicture} />
                          <AvatarFallback>{getUserInitials(post.author?.name)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{post.title}</h3>
                            
                            {post.likes.length > 0 && (
                              <div className="flex items-center text-sm text-gray-500">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {post.likes.length}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <span>{post.author?.name || 'Unknown User'}</span>
                            <span>•</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {post.content}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.comments.length}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-500 mb-1">No Discussions Yet</h3>
                <p className="text-gray-400 mb-4">Be the first to start a discussion in this course!</p>
                <Button onClick={() => setShowNewPostForm(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Start a Discussion
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="announcements">
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((post) => (
                  <Card key={post._id} className="hover:bg-gray-50 cursor-pointer border-l-4 border-l-red-500" onClick={() => handleSelectPost(post)}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={post.author?.profilePicture} />
                          <AvatarFallback>{getUserInitials(post.author?.name)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{post.title}</h3>
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                  Announcement
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span>{post.author?.name || 'Unknown User'}</span>
                                <span>•</span>
                                <span>{formatDate(post.createdAt)}</span>
                              </div>
                            </div>
                            
                            {post.likes.length > 0 && (
                              <div className="flex items-center text-sm text-gray-500">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {post.likes.length}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {post.content}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.comments.length}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                {isFacilitator ? (
                  <>
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-500 mb-1">No Announcements Posted</h3>
                    <p className="text-gray-400 mb-4">Create an announcement to communicate important information with your students.</p>
                    <Button onClick={() => setShowNewPostForm(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Create Announcement
                    </Button>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-500 mb-1">No Announcements</h3>
                    <p className="text-gray-400">Your instructor has not posted any announcements yet.</p>
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CourseForum;
