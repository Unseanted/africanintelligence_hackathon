import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, MessageCircle, Send, Paperclip, Heart, RefreshCw, Reply, BookmarkPlus } from 'lucide-react';
import { getForumCategories, createForumPost } from '@/api/forumService';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useToast } from '@/hooks/use-toast';
const forumCategories = [
  "Smart Trends",
  "Technology Implementation",
  "Virtual & Augmented Reality",
  "Data Analytics & AI",
  "AI in Career Development",
  "Sustainable Technology",
  "Tech-Driven Marketing Strategies",
  "Hospitality Technology Solutions"
].map((cat,ind)=>({name:cat,id:ind}));

const ForumPost = ({ onCancel, category, type = "general", socket }) => {
  const { token } = useTourLMS();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(forumCategories);
  const [categories, setCategories] = useState(forumCategories);

  // Fetch forum categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getForumCategories(token);
        setCategories(categoriesData);
        if (categoriesData.length > 0 && !selectedCategory) {
          setSelectedCategory(categoriesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories. Please try again.',
          variant: 'destructive',
        });
      }
    };

    if (token) {
      fetchCategories();
    }
  }, [token, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const postData = {
        title,
        content,
        category: selectedCategory,
        isCommunityPost: true,
      };
      
      const newPost = await createForumPost(postData, token);
      
      // Emit socket event for real-time update
      socket?.emit('forum:create_post', newPost);
      
      toast({
        title: 'Success',
        description: 'Your post has been published!',
        variant: 'default',
      });
      
      onCancel(); // Close the form after submission
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message||'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-red-500" />
          {type === "course" ? "New Course Discussion" : "New Forum Topic"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="post-title" className="block text-sm font-medium">
              Title
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter a descriptive title for your question or insight"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
              required
            >
              <SelectTrigger className="w-full">
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

          <div className="space-y-2">
            <label htmlFor="post-content" className="block text-sm font-medium">
              Content
            </label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your and hospitality questions, insights, or experiences in Plateau State..."
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                  <Paperclip className="h-4 w-4" />
                  <span>Attach Photos</span>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept="image/*"
                />
              </label>
              {selectedFile && (
                <span className="text-xs text-gray-500">{selectedFile.name}</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForumPost;