// pages/content-management.jsx
import React, { useState, useEffect } from 'react';
import VersionHistory from '@/components/content/VersionHistory';
import ContributorRecognition from '@/components/content/ContributorRecognition';
import ContentSettings from '@/components/content/ContentSettings';
import ContentEditor from '@/components/content/ContentEditor';
import ReviewProcess from '@/components/content/ReviewProcess';
import CreateBranchModal from '@/components/content/CreateBranchModal';
import CreatePRModal from '@/components/content/CreatePRModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FilePlus, 
  ClipboardList, 
  History, 
  Award,
  GitBranch,
  GitPullRequest,
  GitFork,
  Code2,
  Users,
  Settings,
  GitCommit,
  GitMerge,
  GitCompare,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

// Dummy data for testing
const dummySubmissions = [
  {
    id: 'sub1',
    title: 'React Hooks Explained',
    content: '<p>A comprehensive guide to React Hooks including useState, useEffect, and custom hooks.</p>',
    contentType: 'lesson',
    status: 'pending_review',
    createdAt: '2023-05-15T10:30:00Z',
    contributor: { id: 'user1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg' },
    branch: 'feature/react-hooks',
    commitHash: 'a1b2c3d',
    changes: {
      filesChanged: 3,
      additions: 150,
      deletions: 0
    }
  },
  {
    id: 'sub2',
    title: 'Advanced CSS Grid Techniques',
    content: '<p>Learn how to create complex layouts with CSS Grid including responsive patterns.</p>',
    contentType: 'lesson',
    status: 'needs_revision',
    createdAt: '2023-05-10T14:45:00Z',
    contributor: { id: 'user2', name: 'Sam Wilson', avatar: '/avatars/sam.jpg' },
    branch: 'feature/css-grid',
    commitHash: 'e4f5g6h',
    changes: {
      filesChanged: 2,
      additions: 80,
      deletions: 15
    }
  },
  {
    id: 'sub3',
    title: 'TypeScript Best Practices',
    content: '<p>Collection of TypeScript patterns and practices for better code quality.</p>',
    contentType: 'code',
    status: 'approved',
    createdAt: '2023-05-05T09:15:00Z',
    contributor: { id: 'user3', name: 'Taylor Smith', avatar: '/avatars/taylor.jpg' },
    branch: 'main',
    commitHash: 'i7j8k9l',
    changes: {
      filesChanged: 4,
      additions: 200,
      deletions: 50
    }
  }
];

const dummyVersions = [
  {
    id: 'ver1',
    contentId: 'cont1',
    title: 'React Fundamentals',
    content: 'Initial version of React Fundamentals lesson',
    versionNumber: 1,
    isCurrent: false,
    createdAt: '2023-04-01T08:00:00Z',
    contributor: { id: 'user1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg' }
  },
  {
    id: 'ver2',
    contentId: 'cont1',
    title: 'React Fundamentals',
    content: 'Updated with new examples and exercises',
    versionNumber: 2,
    isCurrent: true,
    createdAt: '2023-04-15T11:30:00Z',
    contributor: { id: 'user2', name: 'Sam Wilson', avatar: '/avatars/sam.jpg' }
  }
];

const dummyContributors = [
  {
    id: 'user1',
    name: 'Alex Johnson',
    avatar: '/avatars/alex.jpg',
    contributions: 15,
    badges: ['Gold Contributor', 'Content Creator']
  },
  {
    id: 'user2',
    name: 'Sam Wilson',
    avatar: '/avatars/sam.jpg',
    contributions: 12,
    badges: ['Silver Contributor']
  },
  {
    id: 'user3',
    name: 'Taylor Smith',
    avatar: '/avatars/taylor.jpg',
    contributions: 8,
    badges: ['Bronze Contributor']
  },
  {
    id: 'user4',
    name: 'Jordan Lee',
    avatar: '/avatars/jordan.jpg',
    contributions: 5,
    badges: []
  }
];

// Add dummy PR data
const dummyPRs = [
  {
    id: 'pr1',
    title: 'Update React Hooks Documentation',
    description: 'Added comprehensive examples for useState and useEffect hooks',
    sourceBranch: 'feature/react-hooks',
    targetBranch: 'main',
    status: 'open',
    createdAt: '2024-03-15T10:30:00Z',
    author: { id: 'user1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg' },
    reviews: [
      { id: 'rev1', author: { id: 'user2', name: 'Sam Wilson', avatar: '/avatars/sam.jpg' }, status: 'approved', createdAt: '2024-03-15T11:00:00Z' }
    ],
    changes: {
      filesChanged: 3,
      additions: 150,
      deletions: 0
    }
  },
  {
    id: 'pr2',
    title: 'Add CSS Grid Examples',
    description: 'New examples demonstrating CSS Grid layouts',
    sourceBranch: 'feature/css-grid',
    targetBranch: 'develop',
    status: 'needs_revision',
    createdAt: '2024-03-14T14:45:00Z',
    author: { id: 'user2', name: 'Sam Wilson', avatar: '/avatars/sam.jpg' },
    reviews: [
      { id: 'rev2', author: { id: 'user1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg' }, status: 'changes_requested', createdAt: '2024-03-14T15:00:00Z' }
    ],
    changes: {
      filesChanged: 2,
      additions: 80,
      deletions: 15
    }
  }
];

const ContentManagementPage = () => {
  const [submissions, setSubmissions] = useState(dummySubmissions);
  const [selectedContentId, setSelectedContentId] = useState('cont1');
  const [activeBranch, setActiveBranch] = useState('main');
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [contentSettings, setContentSettings] = useState({
    visibility: 'private',
    notifications: true,
    autoMerge: false,
    requireReview: true,
    allowDirectCommits: false
  });
  const [pullRequests, setPullRequests] = useState(dummyPRs);
  const [selectedTab, setSelectedTab] = useState('submission');
  
  const handleCreateBranch = async (branchData) => {
    setActiveBranch(branchData.name);
    // In a real app, you would make an API call here
    return Promise.resolve(branchData);
  };

  const handleCreatePR = async (prData) => {
    // In a real app, you would make an API call here
    return Promise.resolve(prData);
  };

  const handleSubmission = (newSubmission) => {
    const branchName = `feature/${newSubmission.title.toLowerCase().replace(/\s+/g, '-')}`;
    setSubmissions([...submissions, {
      ...newSubmission,
      id: `sub${submissions.length + 1}`,
      createdAt: new Date().toISOString(),
      contributor: { id: 'currentUser', name: 'You', avatar: '/avatars/current-user.jpg' },
      branch: branchName,
      commitHash: Math.random().toString(36).substring(2, 9),
      changes: {
        filesChanged: 1,
        additions: 100,
        deletions: 0
      }
    }]);
  };

  const handleStatusChange = (submissionId, newStatus) => {
    setSubmissions(submissions.map(sub => 
      sub.id === submissionId ? { ...sub, status: newStatus } : sub
    ));
  };

  const handleSettingsChange = (newSettings) => {
    setContentSettings(newSettings);
  };

  const handlePRStatusChange = (prId, newStatus) => {
    setPullRequests(prs => prs.map(pr => 
      pr.id === prId ? { ...pr, status: newStatus } : pr
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-gray-500 mt-1">Collaborative content development with version control</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsBranchModalOpen(true)}
          >
            <GitFork className="w-4 h-4 mr-2" />
            New Branch
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsPRModalOpen(true)}
            disabled={activeBranch === 'main'}
          >
            <GitPullRequest className="w-4 h-4 mr-2" />
            Create PR
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Badge variant="outline" className="font-mono">
          {activeBranch}
        </Badge>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{submissions.length} contributors</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Code2 className="w-4 h-4" />
          <span>{submissions.length} commits</span>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-7 w-full max-w-5xl mb-8">
          <TabsTrigger value="submission">
            <FilePlus className="w-4 h-4 mr-2" />
            Submit Content
          </TabsTrigger>
          <TabsTrigger value="review">
            <ClipboardList className="w-4 h-4 mr-2" />
            Review Queue
          </TabsTrigger>
          <TabsTrigger value="prs">
            <GitPullRequest className="w-4 h-4 mr-2" />
            Pull Requests
          </TabsTrigger>
          <TabsTrigger value="commits">
            <GitCommit className="w-4 h-4 mr-2" />
            Commits
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Version History
          </TabsTrigger>
          <TabsTrigger value="contributors">
            <Award className="w-4 h-4 mr-2" />
            Contributors
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="submission">
          <div className="max-w-6xl mx-auto">
            <ContentEditor 
              contentId={selectedContentId}
              onSave={(content) => {
                handleSubmission(content);
                toast.success('Content saved successfully');
              }}
              onPreview={(content) => {
                // Handle preview
                console.log('Preview content:', content);
              }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="review">
          <div className="max-w-6xl mx-auto">
            {submissions.filter(s => s.status !== 'approved').map(submission => (
              <div key={submission.id} className="mb-6">
                <ReviewProcess 
                  content={submission}
                  onReviewComplete={({ status, review }) => {
                    handleStatusChange(submission.id, status);
                    toast.success(`Review ${status} for ${submission.title}`);
                  }}
                />
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="prs">
          <div className="max-w-6xl mx-auto space-y-4">
            {pullRequests.map(pr => (
              <Card key={pr.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{pr.title}</h3>
                    <p className="text-sm text-gray-600">{pr.description}</p>
                  </div>
                  <Badge variant={
                    pr.status === 'open' ? 'default' :
                    pr.status === 'merged' ? 'success' :
                    pr.status === 'needs_revision' ? 'warning' :
                    'destructive'
                  }>
                    {pr.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    <span>{pr.sourceBranch} → {pr.targetBranch}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    <span>{pr.changes.filesChanged} files changed</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>+{pr.changes.additions}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <span>-{pr.changes.deletions}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={pr.author.avatar} />
                      <AvatarFallback>{pr.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{pr.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(pr.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <GitCompare className="w-4 h-4 mr-2" />
                      Compare
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                    {pr.status === 'open' && (
                      <Button size="sm">
                        <GitMerge className="w-4 h-4 mr-2" />
                        Merge
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commits">
          <div className="max-w-6xl mx-auto space-y-4">
            {submissions.map(submission => (
              <Card key={submission.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{submission.title}</h3>
                    <p className="text-sm text-gray-600">{submission.contentType}</p>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {submission.commitHash}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    <span>{submission.branch}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    <span>{submission.changes.filesChanged} files changed</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span>+{submission.changes.additions}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <span>-{submission.changes.deletions}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={submission.contributor.avatar} />
                      <AvatarFallback>{submission.contributor.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{submission.contributor.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <GitCompare className="w-4 h-4 mr-2" />
                      View Changes
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="max-w-4xl mx-auto">
            <VersionHistory 
              contentId={selectedContentId} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="contributors">
          <div className="max-w-6xl mx-auto">
            <ContributorRecognition 
              contributors={dummyContributors} 
            />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="max-w-4xl mx-auto">
            <ContentSettings 
              contentId={selectedContentId}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        </TabsContent>
      </Tabs>

      <CreateBranchModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        onCreateBranch={handleCreateBranch}
        currentBranch={activeBranch}
      />

      <CreatePRModal
        isOpen={isPRModalOpen}
        onClose={() => setIsPRModalOpen(false)}
        onCreatePR={handleCreatePR}
        currentBranch={activeBranch}
      />
    </div>
  );
};

export default ContentManagementPage;