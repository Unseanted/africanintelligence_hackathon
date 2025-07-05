import React, { useState, useEffect } from 'react';
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
  Tag,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const ContentSettings = ({ 
  contentId, 
  initialSettings = {},
  initialCollaborators = [],
  onSettingsChange,
  onCollaboratorsChange
}) => {
  // Settings state with defaults
  const [settings, setSettings] = useState({
    visibility: 'private',
    notifications: true,
    autoMerge: false,
    requireReview: true,
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
    labels: [],
    statusChecks: [],
    ...initialSettings
  });

  // Collaborators state
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newStatusCheck, setNewStatusCheck] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle settings changes
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  // Handle adding a new collaborator
  const handleAddCollaborator = async () => {
    if (!newCollaborator.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      const newCollaboratorData = {
        id: `temp-${Date.now()}`,
        email: newCollaborator.trim(),
        name: newCollaborator.trim().split('@')[0],
        avatar: '',
        role: 'contributor',
        permissions: ['push', 'pull']
      };

      const updatedCollaborators = [...collaborators, newCollaboratorData];
      setCollaborators(updatedCollaborators);
      
      if (onCollaboratorsChange) {
        await onCollaboratorsChange(updatedCollaborators);
      }

      setNewCollaborator('');
      toast.success('Collaborator added successfully');
    } catch (error) {
      toast.error('Failed to add collaborator');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing a collaborator
  const handleRemoveCollaborator = async (collaboratorId) => {
    setIsLoading(true);
    try {
      const updatedCollaborators = collaborators.filter(c => c.id !== collaboratorId);
      setCollaborators(updatedCollaborators);
      
      if (onCollaboratorsChange) {
        await onCollaboratorsChange(updatedCollaborators);
      }

      toast.success('Collaborator removed successfully');
    } catch (error) {
      toast.error('Failed to remove collaborator');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle role change for collaborator
  const handleRoleChange = async (collaboratorId, newRole) => {
    setIsLoading(true);
    try {
      const updatedCollaborators = collaborators.map(c => 
        c.id === collaboratorId ? { 
          ...c, 
          role: newRole,
          permissions: newRole === 'admin' ? ['push', 'pull', 'admin'] : ['push', 'pull']
        } : c
      );

      setCollaborators(updatedCollaborators);
      
      if (onCollaboratorsChange) {
        await onCollaboratorsChange(updatedCollaborators);
      }

      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a label
  const handleAddLabel = () => {
    if (!newLabel.trim()) {
      toast.error('Please enter a label name');
      return;
    }

    const updatedLabels = [...settings.labels, newLabel.trim()];
    const newSettings = { ...settings, labels: updatedLabels };
    setSettings(newSettings);
    setNewLabel('');
    
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  // Handle adding a status check
  const handleAddStatusCheck = () => {
    if (!newStatusCheck.trim()) {
      toast.error('Please enter a status check name');
      return;
    }

    const updatedStatusChecks = [...settings.statusChecks, newStatusCheck.trim()];
    const newSettings = { ...settings, statusChecks: updatedStatusChecks };
    setSettings(newSettings);
    setNewStatusCheck('');
    
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  // Handle removing a label
  const handleRemoveLabel = (labelToRemove) => {
    const updatedLabels = settings.labels.filter(label => label !== labelToRemove);
    const newSettings = { ...settings, labels: updatedLabels };
    setSettings(newSettings);
    
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  // Handle removing a status check
  const handleRemoveStatusCheck = (checkToRemove) => {
    const updatedStatusChecks = settings.statusChecks.filter(check => check !== checkToRemove);
    const newSettings = { ...settings, statusChecks: updatedStatusChecks };
    setSettings(newSettings);
    
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 w-full mb-6">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label>Content Visibility</Label>
                <p className="text-sm text-muted-foreground">Control who can view this content</p>
              </div>
              <Select
                value={settings.visibility}
                onValueChange={(value) => handleSettingChange('visibility', value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label>Default Branch</Label>
                <p className="text-sm text-muted-foreground">Set the default branch for this content</p>
              </div>
              <Input
                className="w-full sm:w-[180px]"
                value={settings.defaultBranch}
                onChange={(e) => handleSettingChange('defaultBranch', e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Commit Message Template</Label>
                <p className="text-sm text-muted-foreground">Template for commit messages</p>
              </div>
              <Textarea
                value={settings.commitMessageTemplate}
                onChange={(e) => handleSettingChange('commitMessageTemplate', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collaborators">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Add collaborator by email"
                value={newCollaborator}
                onChange={(e) => setNewCollaborator(e.target.value)}
                type="email"
              />
              <Button 
                onClick={handleAddCollaborator}
                disabled={isLoading || !newCollaborator.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Add
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              {collaborators.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No collaborators added yet
                </div>
              ) : (
                collaborators.map((collaborator) => (
                  <div 
                    key={collaborator.id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 hover:bg-muted/50 rounded-lg gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback>
                          {collaborator.name?.charAt(0) || collaborator.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {collaborator.name || collaborator.email.split('@')[0]}
                        </p>
                        <p className="text-sm text-muted-foreground">{collaborator.email}</p>
                        <div className="flex gap-1 mt-1">
                          {collaborator.permissions?.map(perm => (
                            <Badge key={perm} variant="secondary" className="text-xs capitalize">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Select
                        value={collaborator.role}
                        onValueChange={(value) => handleRoleChange(collaborator.id, value)}
                        disabled={isLoading}
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
                        disabled={isLoading}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="branches">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Branch Protection</Label>
                <p className="text-sm text-muted-foreground">Protect branches from unwanted changes</p>
              </div>
              <Switch 
                checked={settings.branchProtection}
                onCheckedChange={(checked) => handleSettingChange('branchProtection', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto-delete Stale Branches</Label>
                <p className="text-sm text-muted-foreground">Automatically delete branches after inactivity</p>
              </div>
              <Switch 
                checked={settings.autoDeleteStaleBranches}
                onCheckedChange={(checked) => handleSettingChange('autoDeleteStaleBranches', checked)}
              />
            </div>

            {settings.autoDeleteStaleBranches && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label>Stale Branch Age (days)</Label>
                  <p className="text-sm text-muted-foreground">Delete branches inactive for this many days</p>
                </div>
                <Input
                  type="number"
                  min="1"
                  className="w-full sm:w-[100px]"
                  value={settings.staleBranchAge}
                  onChange={(e) => handleSettingChange('staleBranchAge', parseInt(e.target.value) || 1)}
                />
              </div>
            )}

            <Separator />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label>Default Merge Strategy</Label>
                <p className="text-sm text-muted-foreground">How to merge pull requests by default</p>
              </div>
              <Select
                value={settings.defaultMergeStrategy}
                onValueChange={(value) => handleSettingChange('defaultMergeStrategy', value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
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
              <div className="space-y-1">
                <Label>Require Review</Label>
                <p className="text-sm text-muted-foreground">All changes must be reviewed before merging</p>
              </div>
              <Switch 
                checked={settings.requireReview}
                onCheckedChange={(checked) => handleSettingChange('requireReview', checked)}
              />
            </div>

            {settings.requireReview && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label>Required Reviewers</Label>
                  <p className="text-sm text-muted-foreground">Minimum number of required reviewers</p>
                </div>
                <Input
                  type="number"
                  min="1"
                  className="w-full sm:w-[100px]"
                  value={settings.maxReviewers}
                  onChange={(e) => handleSettingChange('maxReviewers', parseInt(e.target.value) || 1)}
                />
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Require Status Checks</Label>
                <p className="text-sm text-muted-foreground">Require status checks to pass before merging</p>
              </div>
              <Switch 
                checked={settings.requireStatusChecks}
                onCheckedChange={(checked) => handleSettingChange('requireStatusChecks', checked)}
              />
            </div>

            {settings.requireStatusChecks && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Add status check"
                    value={newStatusCheck}
                    onChange={(e) => setNewStatusCheck(e.target.value)}
                  />
                  <Button 
                    onClick={handleAddStatusCheck}
                    disabled={!newStatusCheck.trim()}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.statusChecks.map(check => (
                    <Badge 
                      key={check} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleRemoveStatusCheck(check)}
                    >
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
              <div className="space-y-1">
                <Label>Auto-merge Changes</Label>
                <p className="text-sm text-muted-foreground">Automatically merge approved changes</p>
              </div>
              <Switch 
                checked={settings.autoMerge}
                onCheckedChange={(checked) => handleSettingChange('autoMerge', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Squash Commits</Label>
                <p className="text-sm text-muted-foreground">Combine all commits into one when merging</p>
              </div>
              <Switch 
                checked={settings.squashCommits}
                onCheckedChange={(checked) => handleSettingChange('squashCommits', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Require Linear History</Label>
                <p className="text-sm text-muted-foreground">Prevent merge commits and require linear history</p>
              </div>
              <Switch 
                checked={settings.requireLinearHistory}
                onCheckedChange={(checked) => handleSettingChange('requireLinearHistory', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Labels</Label>
                <p className="text-sm text-muted-foreground">Add labels to categorize your content</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Add label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <Button 
                  onClick={handleAddLabel}
                  disabled={!newLabel.trim()}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.labels.map(label => (
                  <Badge 
                    key={label} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleRemoveLabel(label)}
                  >
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
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email notifications for content updates</p>
              </div>
              <Switch 
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Notification Preferences</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="newCommits" 
                      className="rounded text-primary focus:ring-primary" 
                      defaultChecked
                    />
                    <Label htmlFor="newCommits">New commits</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="pullRequests" 
                      className="rounded text-primary focus:ring-primary"
                      defaultChecked
                    />
                    <Label htmlFor="pullRequests">Pull requests</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="reviews" 
                      className="rounded text-primary focus:ring-primary"
                      defaultChecked
                    />
                    <Label htmlFor="reviews">Review requests</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="merges" 
                      className="rounded text-primary focus:ring-primary"
                      defaultChecked
                    />
                    <Label htmlFor="merges">Merged changes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="comments" 
                      className="rounded text-primary focus:ring-primary"
                      defaultChecked
                    />
                    <Label htmlFor="comments">Comments</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="mentions" 
                      className="rounded text-primary focus:ring-primary"
                      defaultChecked
                    />
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