import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  Lock, 
  Bell, 
  GitBranch, 
  UserPlus,
  UserMinus,
  FileText,
  Zap,
  Tag
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ContentSettings = ({ contentId, onSettingsChange }) => {
  const [settings, setSettings] = useState({
    visibility: 'private',
    notifications: true,
    autoMerge: false,
    requireReview: true,
    allowDirectCommits: false,
    branchProtection: true,
    squashCommits: true,
    deleteBranchAfterMerge: true,
    autoDeleteStaleBranches: false,
    staleBranchAge: 30,
    maxReviewers: 2,
    requireStatusChecks: true,
    requireBranchUpToDate: true,
    requireLinearHistory: false,
    allowForcePush: false,
    allowRebase: true,
    defaultBranch: 'main',
    defaultMergeStrategy: 'merge',
    commitMessageTemplate: 'feat: {title}\n\n{description}',
    labels: ['enhancement', 'bug', 'documentation'],
    statusChecks: ['lint', 'test', 'build']
  });

  const [collaborators, setCollaborators] = useState([
    {
      id: 'user1',
      name: 'Alex Johnson',
      avatar: '/avatars/alex.jpg',
      role: 'admin',
      email: 'alex@example.com',
      permissions: ['push', 'pull', 'admin']
    },
    {
      id: 'user2',
      name: 'Sam Wilson',
      avatar: '/avatars/sam.jpg',
      role: 'contributor',
      email: 'sam@example.com',
      permissions: ['push', 'pull']
    }
  ]);

  const [newCollaborator, setNewCollaborator] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newStatusCheck, setNewStatusCheck] = useState('');

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleAddCollaborator = () => {
    if (!newCollaborator) return;
    
    const newCollaboratorData = {
      id: `user${collaborators.length + 1}`,
      name: newCollaborator,
      avatar: `/avatars/default.jpg`,
      role: 'contributor',
      email: `${newCollaborator.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      permissions: ['push', 'pull']
    };

    setCollaborators([...collaborators, newCollaboratorData]);
    setNewCollaborator('');
  };

  const handleRemoveCollaborator = (collaboratorId) => {
    setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
  };

  const handleRoleChange = (collaboratorId, newRole) => {
    setCollaborators(collaborators.map(c => 
      c.id === collaboratorId ? { 
        ...c, 
        role: newRole,
        permissions: newRole === 'admin' ? ['push', 'pull', 'admin'] : ['push', 'pull']
      } : c
    ));
  };

  const handleAddLabel = () => {
    if (!newLabel) return;
    setSettings({
      ...settings,
      labels: [...settings.labels, newLabel]
    });
    setNewLabel('');
  };

  const handleAddStatusCheck = () => {
    if (!newStatusCheck) return;
    setSettings({
      ...settings,
      statusChecks: [...settings.statusChecks, newStatusCheck]
    });
    setNewStatusCheck('');
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-6 w-full max-w-3xl mb-8">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="collaborators">
            <Users className="w-4 h-4 mr-2" />
            Collaborators
          </TabsTrigger>
          <TabsTrigger value="branches">
            <GitBranch className="w-4 h-4 mr-2" />
            Branches
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Lock className="w-4 h-4 mr-2" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="workflow">
            <Zap className="w-4 h-4 mr-2" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Content Visibility</Label>
                <p className="text-sm text-gray-500">Control who can view this content</p>
              </div>
              <Select
                value={settings.visibility}
                onValueChange={(value) => handleSettingChange('visibility', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Default Branch</Label>
                <p className="text-sm text-gray-500">Set the default branch for this content</p>
              </div>
              <Input
                className="w-[180px]"
                value={settings.defaultBranch}
                onChange={(e) => handleSettingChange('defaultBranch', e.target.value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Commit Message Template</Label>
                <p className="text-sm text-gray-500">Template for commit messages</p>
              </div>
              <Input
                className="w-[300px]"
                value={settings.commitMessageTemplate}
                onChange={(e) => handleSettingChange('commitMessageTemplate', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collaborators">
          <div className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Add collaborator by email"
                value={newCollaborator}
                onChange={(e) => setNewCollaborator(e.target.value)}
              />
              <Button onClick={handleAddCollaborator}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback>{collaborator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{collaborator.name}</p>
                      <p className="text-sm text-gray-500">{collaborator.email}</p>
                      <div className="flex gap-1 mt-1">
                        {collaborator.permissions.map(perm => (
                          <Badge key={perm} variant="secondary" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={collaborator.role}
                      onValueChange={(value) => handleRoleChange(collaborator.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="contributor">Contributor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="branches">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Branch Protection</Label>
                <p className="text-sm text-gray-500">Protect branches from unwanted changes</p>
              </div>
              <Switch 
                checked={settings.branchProtection}
                onCheckedChange={(checked) => handleSettingChange('branchProtection', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-delete Stale Branches</Label>
                <p className="text-sm text-gray-500">Automatically delete branches after inactivity</p>
              </div>
              <Switch 
                checked={settings.autoDeleteStaleBranches}
                onCheckedChange={(checked) => handleSettingChange('autoDeleteStaleBranches', checked)}
              />
            </div>

            {settings.autoDeleteStaleBranches && (
              <div className="flex items-center justify-between">
                <div>
                  <Label>Stale Branch Age (days)</Label>
                  <p className="text-sm text-gray-500">Delete branches inactive for this many days</p>
                </div>
                <Input
                  type="number"
                  className="w-[100px]"
                  value={settings.staleBranchAge}
                  onChange={(e) => handleSettingChange('staleBranchAge', parseInt(e.target.value))}
                />
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Default Merge Strategy</Label>
                <p className="text-sm text-gray-500">How to merge pull requests by default</p>
              </div>
              <Select
                value={settings.defaultMergeStrategy}
                onValueChange={(value) => handleSettingChange('defaultMergeStrategy', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">Create merge commit</SelectItem>
                  <SelectItem value="squash">Squash and merge</SelectItem>
                  <SelectItem value="rebase">Rebase and merge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Review</Label>
                <p className="text-sm text-gray-500">All changes must be reviewed before merging</p>
              </div>
              <Switch 
                checked={settings.requireReview}
                onCheckedChange={(checked) => handleSettingChange('requireReview', checked)}
              />
            </div>

            {settings.requireReview && (
              <div className="flex items-center justify-between">
                <div>
                  <Label>Required Reviewers</Label>
                  <p className="text-sm text-gray-500">Minimum number of required reviewers</p>
                </div>
                <Input
                  type="number"
                  className="w-[100px]"
                  value={settings.maxReviewers}
                  onChange={(e) => handleSettingChange('maxReviewers', parseInt(e.target.value))}
                />
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Status Checks</Label>
                <p className="text-sm text-gray-500">Require status checks to pass before merging</p>
              </div>
              <Switch 
                checked={settings.requireStatusChecks}
                onCheckedChange={(checked) => handleSettingChange('requireStatusChecks', checked)}
              />
            </div>

            {settings.requireStatusChecks && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add status check"
                    value={newStatusCheck}
                    onChange={(e) => setNewStatusCheck(e.target.value)}
                  />
                  <Button onClick={handleAddStatusCheck}>
                    <FileText className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.statusChecks.map(check => (
                    <Badge key={check} variant="secondary">
                      {check}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="workflow">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-merge Changes</Label>
                <p className="text-sm text-gray-500">Automatically merge approved changes</p>
              </div>
              <Switch 
                checked={settings.autoMerge}
                onCheckedChange={(checked) => handleSettingChange('autoMerge', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Squash Commits</Label>
                <p className="text-sm text-gray-500">Combine all commits into one when merging</p>
              </div>
              <Switch 
                checked={settings.squashCommits}
                onCheckedChange={(checked) => handleSettingChange('squashCommits', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Linear History</Label>
                <p className="text-sm text-gray-500">Prevent merge commits and require linear history</p>
              </div>
              <Switch 
                checked={settings.requireLinearHistory}
                onCheckedChange={(checked) => handleSettingChange('requireLinearHistory', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Labels</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Add label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <Button onClick={handleAddLabel}>
                  <Tag className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.labels.map(label => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive email notifications for content updates</p>
              </div>
              <Switch 
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Notification Preferences</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="newCommits" className="rounded" />
                    <Label htmlFor="newCommits">New commits</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="pullRequests" className="rounded" />
                    <Label htmlFor="pullRequests">Pull requests</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="reviews" className="rounded" />
                    <Label htmlFor="reviews">Review requests</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="merges" className="rounded" />
                    <Label htmlFor="merges">Merged changes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="comments" className="rounded" />
                    <Label htmlFor="comments">Comments</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="mentions" className="rounded" />
                    <Label htmlFor="mentions">Mentions</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ContentSettings; 