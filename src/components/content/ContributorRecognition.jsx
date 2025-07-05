import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Trophy,
  Star,
  Heart,
  Zap,
  Plus,
  UserPlus,
  Edit2,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ContributorRecognition = ({
  initialContributors = [],
  isAdmin = false,
  onContributorsUpdate
}) => {
  const [contributors, setContributors] = useState(initialContributors);
  const [filteredContributors, setFilteredContributors] = useState(initialContributors);
  const [isAddingContributor, setIsAddingContributor] = useState(false);
  const [isEditingContributor, setIsEditingContributor] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('contributions');
  const [currentPage, setCurrentPage] = useState(1);
  const contributorsPerPage = 12;
  const { toast } = useToast();

  const [newContributor, setNewContributor] = useState({
    name: '',
    avatar: '',
    contributions: 0,
    badges: [],
    role: 'contributor',
    joinDate: new Date().toISOString().split('T')[0]
  });

  // Initialize and filter contributors
  useEffect(() => {
    setContributors(initialContributors);
    setFilteredContributors(initialContributors);
  }, [initialContributors]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...contributors];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(contributor =>
        contributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contributor.badges.some(badge => badge.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'recent') return new Date(b.joinDate) - new Date(a.joinDate);
      return b.contributions - a.contributions; // Default: contributions
    });

    setFilteredContributors(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [contributors, searchTerm, sortBy]);

  const getTopContributors = () => {
    return [...contributors]
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 3);
  };

  const getBadge = (position) => {
    const badges = [
      { icon: <Trophy className="w-4 h-4" />, color: "bg-amber-100 text-amber-800", label: "Top Contributor" },
      { icon: <Star className="w-4 h-4" />, color: "bg-slate-100 text-slate-800", label: "Star Contributor" },
      { icon: <Heart className="w-4 h-4" />, color: "bg-rose-100 text-rose-800", label: "Valued Contributor" }
    ];
    return badges[position] || { icon: <Zap className="w-4 h-4" />, color: "bg-purple-100 text-purple-800", label: "Active Contributor" };
  };

  const validateContributor = (contributor) => {
    if (!contributor.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the contributor",
        variant: "destructive"
      });
      return false;
    }
    if (contributor.contributions < 0) {
      toast({
        title: "Validation Error",
        description: "Contributions cannot be negative",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleAddContributor = async () => {
    if (!validateContributor(newContributor)) return;

    setIsLoading(true);
    try {
      const contributor = {
        id: Date.now().toString(),
        ...newContributor,
        badges: newContributor.badges.length ? newContributor.badges : ['New Contributor'],
        joinDate: new Date().toISOString().split('T')[0]
      };

      const updatedContributors = [...contributors, contributor];
      setContributors(updatedContributors);

      if (onContributorsUpdate) {
        await onContributorsUpdate(updatedContributors);
      }

      resetForm();
      setIsAddingContributor(false);
      toast({
        title: "Success",
        description: "Contributor added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contributor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditContributor = (contributor) => {
    setSelectedContributor(contributor);
    setNewContributor({
      name: contributor.name,
      avatar: contributor.avatar,
      contributions: contributor.contributions,
      badges: contributor.badges,
      role: contributor.role || 'contributor',
      joinDate: contributor.joinDate || new Date().toISOString().split('T')[0]
    });
    setIsEditingContributor(true);
  };

  const handleUpdateContributor = async () => {
    if (!validateContributor(newContributor)) return;

    setIsLoading(true);
    try {
      const updatedContributors = contributors.map(c =>
        c.id === selectedContributor.id ? { ...c, ...newContributor } : c
      );

      setContributors(updatedContributors);

      if (onContributorsUpdate) {
        await onContributorsUpdate(updatedContributors);
      }

      resetForm();
      setIsEditingContributor(false);
      setSelectedContributor(null);
      toast({
        title: "Success",
        description: "Contributor updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contributor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContributor = async (contributorId) => {
    if (!confirm('Are you sure you want to remove this contributor?')) return;

    setIsLoading(true);
    try {
      const updatedContributors = contributors.filter(c => c.id !== contributorId);
      setContributors(updatedContributors);

      if (onContributorsUpdate) {
        await onContributorsUpdate(updatedContributors);
      }

      toast({
        title: "Success",
        description: "Contributor removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove contributor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewContributor({
      name: '',
      avatar: '',
      contributions: 0,
      badges: [],
      role: 'contributor',
      joinDate: new Date().toISOString().split('T')[0]
    });
  };

  // Pagination logic
  const indexOfLastContributor = currentPage * contributorsPerPage;
  const indexOfFirstContributor = indexOfLastContributor - contributorsPerPage;
  const currentContributors = filteredContributors.slice(indexOfFirstContributor, indexOfLastContributor);
  const totalPages = Math.ceil(filteredContributors.length / contributorsPerPage);

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contributor Recognition</h1>
          <p className="text-muted-foreground">
            Recognizing the top contributors to our community
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Dialog open={isAddingContributor} onOpenChange={setIsAddingContributor}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Contributor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Contributor</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={newContributor.name}
                      onChange={(e) => setNewContributor(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Contributor name"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="avatar" className="text-right">
                      Avatar URL
                    </Label>
                    <Input
                      id="avatar"
                      value={newContributor.avatar}
                      onChange={(e) => setNewContributor(prev => ({ ...prev, avatar: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contributions" className="text-right">
                      Contributions
                    </Label>
                    <Input
                      id="contributions"
                      type="number"
                      min="0"
                      value={newContributor.contributions}
                      onChange={(e) =>
                        setNewContributor((prev) => ({
                          ...prev,
                          contributions: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className="col-span-3"
                    />

                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <Select
                      value={newContributor.role}
                      onValueChange={(value) => setNewContributor(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="maintainer">Maintainer</SelectItem>
                        <SelectItem value="contributor">Contributor</SelectItem>
                        <SelectItem value="reviewer">Reviewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="badges" className="text-right">
                      Badges
                    </Label>
                    <Input
                      id="badges"
                      value={newContributor.badges.join(', ')}
                      onChange={(e) => setNewContributor(prev => ({
                        ...prev,
                        badges: e.target.value.split(',').map(b => b.trim()).filter(Boolean)
                      }))}
                      placeholder="MVP, Top Contributor, Bug Hunter"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="joinDate" className="text-right">
                      Join Date
                    </Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={newContributor.joinDate}
                      onChange={(e) => setNewContributor(prev => ({ ...prev, joinDate: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddContributor}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add Contributor
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Separator />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contributors by name or badges..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Sort by</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contributions">Most Contributions</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="recent">Recently Joined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top Contributors */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Top Contributors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getTopContributors().map((contributor, index) => {
            const badge = getBadge(index);
            return (
              <Card key={contributor.id} className="p-6 text-center relative group hover:shadow-md transition-shadow">
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditContributor(contributor)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Contributor</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContributor(contributor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Remove Contributor</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                <div className="flex justify-center mb-4">
                  <Avatar className="w-20 h-20 border-2 border-primary">
                    <AvatarImage src={contributor.avatar} />
                    <AvatarFallback className="text-xl">
                      {contributor.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex justify-center mb-2">
                  <Badge className={`${badge.color} gap-1`}>
                    {badge.icon}
                    {badge.label}
                  </Badge>
                </div>

                <h3 className="text-lg font-medium">{contributor.name}</h3>
                <p className="text-muted-foreground">{contributor.contributions} contributions</p>

                <div className="mt-4 flex justify-center flex-wrap gap-2">
                  {contributor.badges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* All Contributors */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Contributors</h2>
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstContributor + 1}-{Math.min(indexOfLastContributor, filteredContributors.length)} of {filteredContributors.length}
          </div>
        </div>

        {filteredContributors.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No contributors found matching your criteria</p>
          </Card>
        ) : (
          <>
            <Card className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {currentContributors.map((contributor) => (
                  <div
                    key={contributor.id}
                    className="flex flex-col items-center p-4 rounded-lg hover:bg-muted/50 transition-colors relative group"
                  >
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditContributor(contributor)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteContributor(contributor.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove</TooltipContent>
                        </Tooltip>
                      </div>
                    )}

                    <Avatar className="w-16 h-16 mb-2">
                      <AvatarImage src={contributor.avatar} />
                      <AvatarFallback>
                        {contributor.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm font-medium text-center line-clamp-1">
                          {contributor.name}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>{contributor.name}</TooltipContent>
                    </Tooltip>

                    <p className="text-xs text-muted-foreground">
                      {contributor.contributions} contributions
                    </p>

                    {contributor.badges.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="mt-2 flex justify-center">
                            <Badge variant="outline" className="text-xs">
                              {contributor.badges[0]}
                              {contributor.badges.length > 1 && ` +${contributor.badges.length - 1}`}
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {contributor.badges.map(badge => (
                              <Badge key={badge} variant="secondary" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Contributor Dialog */}
      <Dialog open={isEditingContributor} onOpenChange={setIsEditingContributor}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Contributor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit-name"
                value={newContributor.name}
                onChange={(e) => setNewContributor(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-avatar" className="text-right">
                Avatar URL
              </Label>
              <Input
                id="edit-avatar"
                value={newContributor.avatar}
                onChange={(e) => setNewContributor(prev => ({ ...prev, avatar: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-contributions" className="text-right">
                Contributions
              </Label>
              <Input
                id="edit-contributions"
                type="number"
                min="0"
                value={newContributor.contributions}
                onChange={(e) => setNewContributor(prev => ({
                  ...prev,
                  contributions: Math.max(0, parseInt(e.target.value) || 0)
                }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Select
                value={newContributor.role}
                onValueChange={(value) => setNewContributor(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="maintainer">Maintainer</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-badges" className="text-right">
                Badges
              </Label>
              <Input
                id="edit-badges"
                value={newContributor.badges.join(', ')}
                onChange={(e) => setNewContributor(prev => ({
                  ...prev,
                  badges: e.target.value.split(',').map(b => b.trim()).filter(Boolean)
                }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-joinDate" className="text-right">
                Join Date
              </Label>
              <Input
                id="edit-joinDate"
                type="date"
                value={newContributor.joinDate}
                onChange={(e) => setNewContributor(prev => ({ ...prev, joinDate: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateContributor}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Update Contributor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContributorRecognition;