import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Code2, 
  Video, 
  FileText,
  ArrowRight,
  Star,
  Clock,
  Users
} from 'lucide-react';
import AllRecommendations from './AllRecommendations';

const Recommendations = () => {
  const [showAll, setShowAll] = useState(false);

  // Mock data for recommendations
  const recommendations = {
    basedOnProgress: [
      {
        id: 1,
        title: 'Advanced React Patterns',
        type: 'course',
        difficulty: 'intermediate',
        estimatedTime: '4h',
        progress: 0,
        matchScore: 95,
        icon: <Code2 className="w-5 h-5" />
      },
      {
        id: 2,
        title: 'TypeScript Best Practices',
        type: 'tutorial',
        difficulty: 'advanced',
        estimatedTime: '2h',
        progress: 0,
        matchScore: 88,
        icon: <FileText className="w-5 h-5" />
      }
    ],
    trending: [
      {
        id: 3,
        title: 'Web Performance Optimization',
        type: 'workshop',
        difficulty: 'intermediate',
        participants: 156,
        rating: 4.8,
        icon: <Video className="w-5 h-5" />
      },
      {
        id: 4,
        title: 'State Management Patterns',
        type: 'course',
        difficulty: 'advanced',
        participants: 89,
        rating: 4.9,
        icon: <Code2 className="w-5 h-5" />
      }
    ],
    skillGaps: [
      {
        id: 5,
        title: 'Testing React Applications',
        type: 'course',
        difficulty: 'intermediate',
        relevance: 'high',
        icon: <BookOpen className="w-5 h-5" />
      },
      {
        id: 6,
        title: 'GraphQL Fundamentals',
        type: 'tutorial',
        difficulty: 'beginner',
        relevance: 'medium',
        icon: <FileText className="w-5 h-5" />
      }
    ]
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showAll) {
    return <AllRecommendations onBack={() => setShowAll(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Personalized Recommendations</h2>
        <Button variant="outline" onClick={() => setShowAll(true)}>
          View All
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Based on Your Progress</h3>
          <div className="space-y-4">
            {recommendations.basedOnProgress.map(item => (
              <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
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
                        <span className="text-sm text-gray-500">{item.estimatedTime}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {item.matchScore}% match
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Trending Now</h3>
          <div className="space-y-4">
            {recommendations.trending.map(item => (
              <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
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
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-1" />
                          {item.participants}
                        </div>
                        <div className="flex items-center text-sm text-yellow-500">
                          <Star className="w-4 h-4 mr-1" />
                          {item.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Fill Your Skill Gaps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.skillGaps.map(item => (
              <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
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
                        <Badge variant={item.relevance === 'high' ? 'destructive' : 'secondary'}>
                          {item.relevance} priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Recommendations; 