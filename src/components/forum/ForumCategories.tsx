import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Star,
  Bookmark,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  topicCount?: number;
  memberCount?: number;
  viewCount?: number;
  lastActivity?: string;
  tags?: string[];
  isPinned?: boolean;
  isBookmarked?: boolean;
  featuredTopics?: {
    _id: string;
    title: string;
    author: {
      name: string;
      profilePicture?: string;
    };
    createdAt: string;
  }[];
}

interface ForumCategoriesProps {
  categories: Category[];
  onCategoryClick?: (categoryId: string) => void;
  onBookmarkToggle?: (categoryId: string) => void;
  isLoading?: boolean;
  initialTag?: string;
}

type SortOption = 'name' | 'topics' | 'members' | 'views' | 'activity';
type SortDirection = 'asc' | 'desc';

const ForumCategories: React.FC<ForumCategoriesProps> = ({
  categories,
  onCategoryClick,
  onBookmarkToggle,
  isLoading = false,
  initialTag,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('topics');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Get all unique tags from categories
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    categories.forEach(category => {
      category.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [categories]);

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    return categories
      .filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            category.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.length === 0 || 
                          selectedTags.every(tag => category.tags?.includes(tag));
        return matchesSearch && matchesTags;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'topics':
            comparison = (a.topicCount || 0) - (b.topicCount || 0);
            break;
          case 'members':
            comparison = (a.memberCount || 0) - (b.memberCount || 0);
            break;
          case 'views':
            comparison = (a.viewCount || 0) - (b.viewCount || 0);
            break;
          case 'activity':
            comparison = new Date(a.lastActivity || 0).getTime() - new Date(b.lastActivity || 0).getTime();
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [categories, searchQuery, sortBy, sortDirection, selectedTags]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  const handleTagClick = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    
    // Update URL with selected tags
    if (newTags.length > 0) {
      searchParams.set('tags', newTags.join(','));
    } else {
      searchParams.delete('tags');
    }
    setSearchParams(searchParams);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSort('name')}>
                Name {sortBy === 'name' && (sortDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('topics')}>
                Topics {sortBy === 'topics' && (sortDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('members')}>
                Members {sortBy === 'members' && (sortDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('views')}>
                Views {sortBy === 'views' && (sortDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('activity')}>
                Activity {sortBy === 'activity' && (sortDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedCategories.map((category) => (
          <Card
            key={category._id}
            className={cn(
              "hover:shadow-md transition-all duration-200 cursor-pointer",
              expandedCategory === category._id && "ring-2 ring-primary"
            )}
            onClick={() => {
              setExpandedCategory(expandedCategory === category._id ? null : category._id);
              onCategoryClick?.(category._id);
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  {category.icon && <span className="text-red-500">{category.icon}</span>}
                  {category.name}
                  {category.isPinned && <Star className="h-4 w-4 text-yellow-500" />}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmarkToggle?.(category._id);
                  }}
                >
                  <Bookmark
                    className={cn(
                      "h-4 w-4",
                      category.isBookmarked ? "text-primary fill-primary" : "text-gray-400"
                    )}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{category.topicCount || 0}</p>
                    <p className="text-xs text-gray-500">Topics</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{category.memberCount || 0}</p>
                    <p className="text-xs text-gray-500">Members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{category.viewCount || 0}</p>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{category.lastActivity || 'Never'}</p>
                    <p className="text-xs text-gray-500">Last Activity</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {category.tags && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {category.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Featured Topics */}
              {expandedCategory === category._id && category.featuredTopics && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Featured Topics</h4>
                  <div className="space-y-2">
                    {category.featuredTopics.map((topic) => (
                      <div key={topic._id} className="flex items-center gap-2 text-sm">
                        <Eye className="h-3 w-3 text-gray-500" />
                        <span className="truncate">{topic.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedCategories.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
          <p className="text-gray-500 mt-2">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default ForumCategories; 