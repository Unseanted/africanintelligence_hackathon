// components/content/VersionHistory.jsx
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
  FileText
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Mock data with more Git-like structure
const mockVersions = [
  {
    id: 1,
    commitHash: "a1b2c3d",
    versionNumber: 1.0,
    title: "Initial Version",
    description: "Initial commit with basic structure",
    createdAt: "2024-03-15T10:00:00Z",
    isCurrent: false,
    contributor: { name: "John Doe", avatar: "/avatars/john.jpg" },
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
    id: 2,
    commitHash: "e4f5g6h",
    versionNumber: 1.1,
    title: "Updated content structure",
    description: "Refactored content organization and added new sections",
    createdAt: "2024-03-16T14:30:00Z",
    isCurrent: false,
    contributor: { name: "Jane Smith", avatar: "/avatars/jane.jpg" },
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
    id: 3,
    commitHash: "i7j8k9l",
    versionNumber: 1.2,
    title: "Current working version",
    description: "Merged feature branch and resolved conflicts",
    createdAt: "2024-03-17T09:15:00Z",
    isCurrent: true,
    contributor: { name: "Mike Johnson", avatar: "/avatars/mike.jpg" },
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

const VersionHistory = ({ contentId }) => {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [selectedTab, setSelectedTab] = useState("commits");
  const { toast } = useToast();

  const fetchVersions = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVersions(mockVersions);
      setCurrentVersion(mockVersions.find(v => v.isCurrent));
      setIsLoading(false);
    }, 500);
  };

  const handleRollback = (versionId) => {
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
  };

  useEffect(() => {
    fetchVersions();
  }, [contentId]);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Version History
          </h2>
          <Badge variant="outline" className="font-mono">
            {currentVersion?.branch || 'main'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <GitFork className="w-4 h-4 mr-2" />
            New Branch
          </Button>
          <Button variant="outline" size="sm">
            <GitPullRequest className="w-4 h-4 mr-2" />
            Create PR
          </Button>
          <Button variant="outline" onClick={fetchVersions} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
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
              {versions.map((version) => (
                <Card key={version.id} className={`p-4 ${version.isCurrent ? 'border-2 border-blue-500' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <GitCommit className="w-4 h-4 text-gray-500" />
                      <span className="font-mono text-sm">{version.commitHash}</span>
                      {version.isCurrent && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>{version.contributor.name}</span>
                      <CalendarDays className="w-4 h-4" />
                      <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium mb-1">{version.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{version.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRollback(version.id)}
                        disabled={version.isCurrent}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restore this version
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      View Changes
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="branches">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Active Branches</h3>
              <Button variant="outline" size="sm">
                <GitFork className="w-4 h-4 mr-2" />
                New Branch
              </Button>
            </div>
            <div className="space-y-2">
              {['main', 'feature/content-update', 'bugfix/typos'].map((branch) => (
                <div key={branch} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-gray-500" />
                    <span className="font-mono">{branch}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <GitMerge className="w-4 h-4 mr-2" />
                    Merge
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="changes">
          <Card className="p-4">
            <div className="space-y-4">
              {currentVersion?.diff.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>{file.file}</span>
                    <Badge variant={file.status === 'added' ? 'default' : 'secondary'}>
                      {file.status}
                    </Badge>
                  </div>
                  <span className="font-mono text-sm">{file.changes}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default VersionHistory;