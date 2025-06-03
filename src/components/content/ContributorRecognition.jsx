// components/content/ContributorRecognition.jsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Star, Heart, Zap, Plus, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ContributorRecognition = ({ contributors: initialContributors, isAdmin = false }) => {
  const [contributors, setContributors] = useState(initialContributors);
  const [isAddingContributor, setIsAddingContributor] = useState(false);
  const [isEditingContributor, setIsEditingContributor] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState(null);
  const { toast } = useToast();

  const [newContributor, setNewContributor] = useState({
    name: '',
    avatar: '',
    contributions: 0,
    badges: []
  });

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

  const handleAddContributor = () => {
    if (!newContributor.name) {
      toast({
        title: "Error",
        description: "Please enter a name for the contributor",
        variant: "destructive"
      });
      return;
    }

    const contributor = {
      id: Date.now(),
      ...newContributor,
      badges: newContributor.badges.length ? newContributor.badges : ['New Contributor']
    };

    setContributors(prev => [...prev, contributor]);
    setNewContributor({
      name: '',
      avatar: '',
      contributions: 0,
      badges: []
    });
    setIsAddingContributor(false);
    
    toast({
      title: "Success",
      description: "Contributor added successfully"
    });
  };

  const handleEditContributor = (contributor) => {
    setSelectedContributor(contributor);
    setNewContributor(contributor);
    setIsEditingContributor(true);
  };

  const handleUpdateContributor = () => {
    if (!newContributor.name) {
      toast({
        title: "Error",
        description: "Please enter a name for the contributor",
        variant: "destructive"
      });
      return;
    }

    setContributors(prev => 
      prev.map(c => c.id === selectedContributor.id ? { ...c, ...newContributor } : c)
    );
    
    setNewContributor({
      name: '',
      avatar: '',
      contributions: 0,
      badges: []
    });
    setIsEditingContributor(false);
    setSelectedContributor(null);
    
    toast({
      title: "Success",
      description: "Contributor updated successfully"
    });
  };

  const handleDeleteContributor = (contributorId) => {
    if (confirm('Are you sure you want to remove this contributor?')) {
      setContributors(prev => prev.filter(c => c.id !== contributorId));
      toast({
        title: "Success",
        description: "Contributor removed successfully"
      });
    }
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <Dialog open={isAddingContributor} onOpenChange={setIsAddingContributor}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contributor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contributor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newContributor.name}
                    onChange={(e) => setNewContributor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter contributor name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avatar URL</Label>
                  <Input
                    value={newContributor.avatar}
                    onChange={(e) => setNewContributor(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="Enter avatar URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contributions</Label>
                  <Input
                    type="number"
                    value={newContributor.contributions}
                    onChange={(e) => setNewContributor(prev => ({ ...prev, contributions: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter number of contributions"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badges (comma-separated)</Label>
                  <Input
                    value={newContributor.badges.join(', ')}
                    onChange={(e) => setNewContributor(prev => ({ 
                      ...prev, 
                      badges: e.target.value.split(',').map(b => b.trim()).filter(Boolean)
                    }))}
                    placeholder="Enter badges (e.g., MVP, Top Contributor)"
                  />
                </div>
                <Button onClick={handleAddContributor} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contributor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Top Contributors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getTopContributors().map((contributor, index) => (
            <Card key={contributor.id} className="p-6 text-center relative">
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditContributor(contributor)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteContributor(contributor.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
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
              <div key={contributor.id} className="flex flex-col items-center relative group">
                {isAdmin && (
                  <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditContributor(contributor)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteContributor(contributor.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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

      <Dialog open={isEditingContributor} onOpenChange={setIsEditingContributor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contributor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newContributor.name}
                onChange={(e) => setNewContributor(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter contributor name"
              />
            </div>
            <div className="space-y-2">
              <Label>Avatar URL</Label>
              <Input
                value={newContributor.avatar}
                onChange={(e) => setNewContributor(prev => ({ ...prev, avatar: e.target.value }))}
                placeholder="Enter avatar URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Contributions</Label>
              <Input
                type="number"
                value={newContributor.contributions}
                onChange={(e) => setNewContributor(prev => ({ ...prev, contributions: parseInt(e.target.value) || 0 }))}
                placeholder="Enter number of contributions"
              />
            </div>
            <div className="space-y-2">
              <Label>Badges (comma-separated)</Label>
              <Input
                value={newContributor.badges.join(', ')}
                onChange={(e) => setNewContributor(prev => ({ 
                  ...prev, 
                  badges: e.target.value.split(',').map(b => b.trim()).filter(Boolean)
                }))}
                placeholder="Enter badges (e.g., MVP, Top Contributor)"
              />
            </div>
            <Button onClick={handleUpdateContributor} className="w-full">
              Update Contributor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContributorRecognition;