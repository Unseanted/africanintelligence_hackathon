import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, BookOpen, HelpCircle, Star, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCommunityForum } from '@/api/forumService';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useToast } from '@/hooks/use-toast';

// Map category IDs to icons and colors
const categoryStyles = {
  general: { icon: MessageCircle, color: "bg-blue-100 text-blue-800" },
  questions: { icon: HelpCircle, color: "bg-red-100 text-red-800" },
  resources: { icon: BookOpen, color: "bg-purple-100 text-purple-800" },
  projects: { icon: Users, color: "bg-green-100 text-green-800" },
  careers: { icon: Star, color: "bg-yellow-100 text-yellow-800" },
  events: { icon: Lightbulb, color: "bg-orange-100 text-orange-800" },
  feedback: { icon: MessageCircle, color: "bg-blue-100 text-blue-800" },
};

const ForumCategoryCard = ({ category, onClick }) => {
  const Icon = categoryStyles[category.id]?.icon || MessageCircle;
  const color = categoryStyles[category.id]?.color || "bg-gray-100 text-gray-800";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{category.description || "Discuss topics related to this category"}</p>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-gray-50">
                  {category.topics || 0} Topics
                </Badge>
                <Badge variant="outline" className="bg-gray-50">
                  {category.posts || 0} Posts
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ForumCategories = ({ categories = [], onSelectCategory }) => {
  const { token } = useTourLMS();
  const { toast } = useToast();
  const [categoryStats, setCategoryStats] = useState({});

  // Fetch stats (topics and posts) for each category
  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const stats = {};
        for (const category of categories) {
          const postsData = await getCommunityForum(token, category.id);
          const posts = postsData.posts || [];
          const topics = posts.length;
          const totalPosts = posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0);
          stats[category.id] = { topics, posts: totalPosts };
        }
        setCategoryStats(stats);
      } catch (error) {
        console.error('Error fetching category stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load category stats. Please try again.',
          variant: 'destructive',
        });
      }
    };

    if (token && categories.length > 0) {
      fetchCategoryStats();
    }
  }, [token, categories, toast]);

  // Combine categories with their stats
  const enrichedCategories = categories.map(category => ({
    ...category,
    topics: categoryStats[category.id]?.topics || 0,
    posts: categoryStats[category.id]?.posts || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Forum Categories</h2>
        <Badge className="bg-red-500 py-1 px-3">
          <span className="text-sm">{categories.length} Categories</span>
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrichedCategories.map(category => (
          <ForumCategoryCard 
            key={category.id} 
            category={category} 
            onClick={() => onSelectCategory && onSelectCategory(category)}
          />
        ))}
      </div>
    </div>
  );
};

export default ForumCategories;