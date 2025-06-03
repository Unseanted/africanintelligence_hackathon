// components/content/ContributorRecognition.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Heart, Zap } from 'lucide-react';

const ContributorRecognition = ({ contributors }) => {
  const getTopContributors = () => {
    return [...contributors]
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 3);
  };

  const getBadge = (position) => {
    switch (position) {
      case 0: return { icon: <Trophy className="w-4 h-4" />, color: "bg-amber-100 text-amber-800" };
      case 1: return { icon: <Star className="w-4 h-4" />, color: "bg-slate-100 text-slate-800" };
      case 2: return { icon: <Heart className="w-4 h-4" />, color: "bg-rose-100 text-rose-800" };
      default: return { icon: <Zap className="w-4 h-4" />, color: "bg-purple-100 text-purple-800" };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Top Contributors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getTopContributors().map((contributor, index) => (
            <Card key={contributor.id} className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={contributor.avatar} />
                  <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex justify-center mb-2">
                <Badge className={getBadge(index).color}>
                  {getBadge(index).icon}
                  <span className="ml-1">#{index + 1} Contributor</span>
                </Badge>
              </div>
              
              <h3 className="text-lg font-medium">{contributor.name}</h3>
              <p className="text-gray-600">{contributor.contributions} contributions</p>
              
              <div className="mt-4 flex justify-center gap-2">
                {contributor.badges.map((badge) => (
                  <Badge key={badge} variant="outline">
                    {badge}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">All Contributors</h2>
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {contributors.map((contributor) => (
              <div key={contributor.id} className="flex flex-col items-center">
                <Avatar>
                  <AvatarImage src={contributor.avatar} />
                  <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="mt-2 text-sm font-medium">{contributor.name}</p>
                <p className="text-xs text-gray-500">{contributor.contributions} contributions</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContributorRecognition;