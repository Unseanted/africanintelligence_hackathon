import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  GitCommit, 
  GitBranch, 
  RotateCcw, 
  User, 
  CalendarDays,
  GitPullRequest,
  GitMerge,
  GitFork,
  MessageSquare,
  Code2,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  X,
  Search
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const VersionHistory = ({ 
  contentId,
  initialVersions = [],
  onVersionRestore,
  onBranchCreate,
  onPRCreate,
  onBranchMerge,
  currentUser
}) => {
  const [versions, setVersions] = useState(initialVersions);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [selectedTab, setSelectedTab] = useState("commits");
  const [branches, setBranches] = useState(['main', 'feature/content-update', 'bugfix/typos']);
  const [activeBranch, setActiveBranch] = useState('main');
  const [isCreatingPR, setIsCreatingPR] = useState(false);
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCommits, setExpandedCommits] = useState({});
  const [newBranchDialogOpen, setNewBranchDialogOpen] = useState(false);
  const [newPRDialogOpen, setNewPRDialogOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [prTitle, setPRTitle] = useState('');
  const [prDescription, setPRDescription] = useState('');
  const { toast } = useToast();

  // Initialize with mock data if none provided
  useEffect(() => {
    if (initialVersions.length === 0) {
      fetchVersions();
    } else {
      setVersions(initialVersions);
      setCurrentVersion(initialVersions.find(v => v.isCurrent));
    }
  }, [initialVersions]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setVersions(mockVersions);
      setCurrentVersion(mockVersions.find(v => v.isCurrent));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load version history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollback = async (versionId) => {
    try {
      if (onVersionRestore) {
        await onVersionRestore(versionId);
      }
      
      const newVersions = versions.map(v => ({
        ...v,
        isCurrent: v.id === versionId
      }));
      setVersions(newVersions);
      setCurrentVersion(newVersions.find(v => v.isCurrent));
      
      toast({
        title: "Success",
        description: "Content rolled back to this version",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore version",
        variant: "destructive"
      });
    }
  };

  const handleCreateBranch = async () => {
    if (!branchName.trim()) {
      toast({
        title: "Error",
        description: "Branch name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingBranch(true);
    try {
      const branch = `feature/${branchName.toLowerCase().replace(/\s+/g, '-')}`;
      
      if (onBranchCreate) {
        await onBranchCreate(branch);
      }

      setBranches(prev => [...prev, branch]);
      setActiveBranch(branch);
      setBranchName('');
      setNewBranchDialogOpen(false);
      
      toast({
        title: "Success",
        description: `Created new branch: ${branch}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create branch",
        variant: "destructive"
      });
    } finally {
      setIsCreatingBranch(false);
    }
  };

  const handleCreatePR = async () => {
    if (!prTitle.trim()) {
      toast({
        title: "Error",
        description: "PR title cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingPR(true);
    try {
      if (onPRCreate) {
        await onPRCreate({
          title: prTitle,
          description: prDescription,
          sourceBranch: activeBranch,
          targetBranch: 'main'
        });
      }

      setPRTitle('');
      setPRDescription('');
      setNewPRDialogOpen(false);
      
      toast({
        title: "Success",
        description: `Created PR: ${prTitle}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create pull request",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPR(false);
    }
  };

  const handleMergeBranch = async (branchName) => {
    if (branchName === 'main') {
      toast({
        title: "Error",
        description: "Cannot merge main branch",
        variant: "destructive"
      });
      return;
    }

    setIsMerging(true);
    try {
      if (onBranchMerge) {
        await onBranchMerge(branchName, 'main');
      }

      setBranches(prev => prev.filter(b => b !== branchName));
      
      toast({
        title: "Success",
        description: `Merged ${branchName} into main`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to merge branch",
        variant: "destructive"
      });
    } finally {
      setIsMerging(false);
    }
  };

  const toggleCommitExpansion = (commitId) => {
    setExpandedCommits(prev => ({
      ...prev,
      [commitId]: !prev[commitId]
    }));
  };

  const filteredVersions = versions.filter(version => 
    version.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.commitHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBranches = branches.filter(branch => 
    branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (version) => {
    if (version.isCurrent) {
      return (
        <Badge variant="default" className="gap-1">
          <Check className="w-3 h-3" />
          Current
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Version History
          </h2>
          <Badge variant="outline" className="font-mono">
            {activeBranch}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setNewBranchDialogOpen(true)}
            disabled={isCreatingBranch}
          >
            <GitFork className="w-4 h-4 mr-2" />
            {isCreatingBranch ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : 'New Branch'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setNewPRDialogOpen(true)}
            disabled={isCreatingPR || activeBranch === 'main'}
          >
            <GitPullRequest className="w-4 h-4 mr-2" />
            {isCreatingPR ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : 'Create PR'}
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchVersions} 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${selectedTab}...`}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-xl mb-6">
          <TabsTrigger value="commits">
            <GitCommit className="w-4 h-4 mr-2" />
            Commits
          </TabsTrigger>
          <TabsTrigger value="branches">
            <GitBranch className="w-4 h-4 mr-2" />
            Branches
          </TabsTrigger>
          <TabsTrigger value="changes">
            <Code2 className="w-4 h-4 mr-2" />
            Changes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commits">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {filteredVersions.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No matching commits found' : 'No commits yet'}
                  </p>
                </Card>
              ) : (
                filteredVersions.map((version) => (
                  <Card 
                    key={version.id} 
                    className={`p-4 ${version.isCurrent ? 'border-2 border-primary' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <GitCommit className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{version.commitHash.substring(0, 7)}</span>
                        {getStatusBadge(version)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={version.contributor.avatar} />
                            <AvatarFallback>{version.contributor.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{version.contributor.name}</span>
                        </div>
                        <CalendarDays className="w-4 h-4" />
                        <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-medium mb-1">{version.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {expandedCommits[version.id] || version.description.length < 100
                        ? version.description
                        : `${version.description.substring(0, 100)}...`}
                      {version.description.length > 100 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs ml-2"
                          onClick={() => toggleCommitExpansion(version.id)}
                        >
                          {expandedCommits[version.id] ? (
                            <>
                              <ChevronUp className="w-3 h-3 mr-1" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3 mr-1" />
                              Show more
                            </>
                          )}
                        </Button>
                      )}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{version.changes.filesChanged} files changed</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <span>+{version.changes.additions}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <span>-{version.changes.deletions}</span>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRollback(version.id)}
                          disabled={version.isCurrent}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restore this version
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toast({
                            title: "Comment",
                            description: "This would open a comment dialog in a real implementation"
                          })}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Comment
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast({
                          title: "View Changes",
                          description: `Showing changes for commit ${version.commitHash.substring(0, 7)}`
                        })}
                      >
                        View Changes
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="branches">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="font-medium">Active Branches ({branches.length})</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setNewBranchDialogOpen(true)}
                disabled={isCreatingBranch}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreatingBranch ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : 'New Branch'}
              </Button>
            </div>
            {filteredBranches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No matching branches found' : 'No branches yet'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBranches.map((branch) => (
                  <div 
                    key={branch} 
                    className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono">{branch}</span>
                      {branch === activeBranch && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleMergeBranch(branch)}
                      disabled={branch === 'main' || branch === activeBranch || isMerging}
                    >
                      {isMerging ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <GitMerge className="w-4 h-4 mr-2" />
                      )}
                      Merge
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="changes">
          <Card className="p-4">
            {currentVersion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Changes in current version</h3>
                  <Badge variant="outline" className="font-mono">
                    {currentVersion.commitHash.substring(0, 7)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {currentVersion.diff.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{file.file}</span>
                        <Badge variant={file.status === 'added' ? 'default' : 'secondary'}>
                          {file.status}
                        </Badge>
                      </div>
                      <span className="font-mono text-sm">
                        <span className="text-green-600">{file.changes.split(' ')[0]}</span>
                        {file.changes.includes('-') && (
                          <span className="text-red-600"> {file.changes.split(' ')[1]}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No current version selected
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Branch Dialog */}
      <Dialog open={newBranchDialogOpen} onOpenChange={setNewBranchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
            <DialogDescription>
              Create a new branch from the current branch ({activeBranch})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="feature/new-content"
              />
              <p className="text-sm text-muted-foreground">
                Use lowercase, numbers, and hyphens only
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewBranchDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBranch}
              disabled={isCreatingBranch || !branchName.trim()}
            >
              {isCreatingBranch ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : 'Create Branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New PR Dialog */}
      <Dialog open={newPRDialogOpen} onOpenChange={setNewPRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Pull Request</DialogTitle>
            <DialogDescription>
              Create a pull request from {activeBranch} to main
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={prTitle}
                onChange={(e) => setPRTitle(e.target.value)}
                placeholder="Brief description of changes"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={prDescription}
                onChange={(e) => setPRDescription(e.target.value)}
                placeholder="Detailed description of changes..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Branch</Label>
                <Input value={activeBranch} disabled />
              </div>
              <div className="space-y-2">
                <Label>Target Branch</Label>
                <Input value="main" disabled />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewPRDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePR}
              disabled={isCreatingPR || !prTitle.trim()}
            >
              {isCreatingPR ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : 'Create Pull Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// Mock data
const mockVersions = [
  {
    id: '1',
    commitHash: "a1b2c3d4e5",
    versionNumber: 1.0,
    title: "Initial Version",
    description: "Initial commit with basic content structure and placeholder text for all sections. Added main content file and basic configuration.",
    createdAt: "2024-03-15T10:00:00Z",
    isCurrent: false,
    contributor: { name: "Alex Johnson", avatar: "/avatars/alex.jpg" },
    branch: "main",
    changes: {
      filesChanged: 5,
      additions: 120,
      deletions: 0
    },
    diff: [
      { file: "content.md", status: "added", changes: "+120" },
      { file: "assets/image1.png", status: "added", changes: "+1" },
      { file: "config.json", status: "added", changes: "+1" }
    ]
  },
  {
    id: '2',
    commitHash: "e4f5g6h7i8",
    versionNumber: 1.1,
    title: "Content structure update",
    description: "Refactored content organization and added new sections. Improved the overall flow of the content and fixed some typos in the existing text.",
    createdAt: "2024-03-16T14:30:00Z",
    isCurrent: false,
    contributor: { name: "Sam Wilson", avatar: "/avatars/sam.jpg" },
    branch: "feature/content-update",
    changes: {
      filesChanged: 3,
      additions: 45,
      deletions: 12
    },
    diff: [
      { file: "content.md", status: "modified", changes: "+45 -12" },
      { file: "assets/image2.png", status: "added", changes: "+1" }
    ]
  },
  {
    id: '3',
    commitHash: "j9k0l1m2n3",
    versionNumber: 1.2,
    title: "Current working version",
    description: "Merged feature branch and resolved conflicts. Added final touches to the content and updated all references. This is the current production version.",
    createdAt: "2024-03-17T09:15:00Z",
    isCurrent: true,
    contributor: { name: "Taylor Smith", avatar: "/avatars/taylor.jpg" },
    branch: "main",
    changes: {
      filesChanged: 4,
      additions: 30,
      deletions: 8
    },
    diff: [
      { file: "content.md", status: "modified", changes: "+30 -8" },
      { file: "config.json", status: "modified", changes: "+2 -1" }
    ]
  }
];

export default VersionHistory;