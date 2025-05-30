import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Code2, 
  Video, 
  FileText,
  ArrowLeft,
  Star,
  Clock,
  Users,
  Search,
  Filter,
  SlidersHorizontal
} from 'lucide-react';

const AllRecommendations = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Mock data for all recommendations
  const allRecommendations = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      type: 'course',
      difficulty: 'intermediate',
      estimatedTime: '4h',
      progress: 0,
      matchScore: 95,
      icon: <Code2 className="w-5 h-5" />,
      category: 'progress'
    },
    {
      id: 2,
      title: 'TypeScript Best Practices',
      type: 'tutorial',
      difficulty: 'advanced',
      estimatedTime: '2h',
      progress: 0,
      matchScore: 88,
      icon: <FileText className="w-5 h-5" />,
      category: 'progress'
    },
    {
      id: 3,
      title: 'Web Performance Optimization',
      type: 'workshop',
      difficulty: 'intermediate',
      participants: 156,
      rating: 4.8,
      icon: <Video className="w-5 h-5" />,
      category: 'trending'
    },
    {
      id: 4,
      title: 'State Management Patterns',
      type: 'course',
      difficulty: 'advanced',
      participants: 89,
      rating: 4.9,
      icon: <Code2 className="w-5 h-5" />,
      category: 'trending'
    },
    {
      id: 5,
      title: 'Testing React Applications',
      type: 'course',
      difficulty: 'intermediate',
      relevance: 'high',
      icon: <BookOpen className="w-5 h-5" />,
      category: 'skillGaps'
    },
    {
      id: 6,
      title: 'GraphQL Fundamentals',
      type: 'tutorial',
      difficulty: 'beginner',
      relevance: 'medium',
      icon: <FileText className="w-5 h-5" />,
      category: 'skillGaps'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort recommendations
  const filteredRecommendations = allRecommendations
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || item.category === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'participants':
          return (b.participants || 0) - (a.participants || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold">All Recommendations</h2>
        <div className="w-32" /> {/* Spacer for alignment */}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search recommendations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="progress">Based on Progress</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="skillGaps">Skill Gaps</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="participants">Participants</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredRecommendations.map(item => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                        {item.difficulty}
                      </Badge>
                      {item.estimatedTime && (
                        <span className="text-sm text-gray-500">{item.estimatedTime}</span>
                      )}
                      {item.participants && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-1" />
                          {item.participants}
                        </div>
                      )}
                      {item.rating && (
                        <div className="flex items-center text-sm text-yellow-500">
                          <Star className="w-4 h-4 mr-1" />
                          {item.rating}
                        </div>
                      )}
                    </div>
                  </div>
                  {item.matchScore && (
                    <Badge variant="secondary" className="ml-2">
                      {item.matchScore}% match
                    </Badge>
                  )}
                  {item.relevance && (
                    <Badge variant={item.relevance === 'high' ? 'destructive' : 'secondary'}>
                      {item.relevance} priority
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AllRecommendations; 