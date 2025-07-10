import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { GitPullRequest, Loader2, GitCompare, Info } from 'lucide-react';
import useDebounce from '../../hooks/use-debounce';

const CreatePRModal = ({ 
  isOpen, 
  onClose, 
  onCreatePR, 
  currentBranch,
  availableBranches = ['main', 'develop'],
  defaultTargetBranch = 'main',
  onBranchCompare
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetBranch, setTargetBranch] = useState(defaultTargetBranch);
  const [isCreating, setIsCreating] = useState(false);
  const [diffInfo, setDiffInfo] = useState(null);
  const [isLoadingDiff, setIsLoadingDiff] = useState(false);
  const debouncedTargetBranch = useDebounce(targetBranch, 500);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setTargetBranch(defaultTargetBranch);
      setDiffInfo(null);
    }
  }, [isOpen, defaultTargetBranch]);

  // Load diff information when target branch changes
  useEffect(() => {
    if (isOpen && currentBranch && debouncedTargetBranch && currentBranch !== debouncedTargetBranch) {
      fetchDiffInfo(currentBranch, debouncedTargetBranch);
    }
  }, [isOpen, currentBranch, debouncedTargetBranch]);

  const fetchDiffInfo = async (source, target) => {
    setIsLoadingDiff(true);
    try {
      if (onBranchCompare) {
        const info = await onBranchCompare(source, target);
        setDiffInfo(info);
      }
    } catch (error) {
      toast.error('Could not load branch comparison data');
    } finally {
      setIsLoadingDiff(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('PR title is required');
      return;
    }

    if (currentBranch === targetBranch) {
      toast.error('Source and target branches must be different');
      return;
    }

    setIsCreating(true);
    try {
      await onCreatePR({
        title: title.trim(),
        description: description.trim(),
        sourceBranch: currentBranch,
        targetBranch,
        status: 'open',
        createdAt: new Date().toISOString(),
        changes: diffInfo
      });
      toast.success('Pull request created successfully');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create pull request');
    } finally {
      setIsCreating(false);
    }
  };

  const generateDefaultTitle = () => {
    if (!currentBranch) return '';
    return `Merge ${currentBranch} into ${targetBranch}`;
  };

  const handleGenerateTitle = () => {
    setTitle(generateDefaultTitle());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5" />
            <DialogTitle>Create Pull Request</DialogTitle>
          </div>
          <DialogDescription>
            Propose changes from {currentBranch} to another branch
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Title *</Label>
              <Button 
                type="button" 
                variant="link" 
                size="sm" 
                className="h-auto px-0"
                onClick={handleGenerateTitle}
              >
                Suggest title
              </Button>
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of changes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`## Description\n\n## Changes\n\n## Testing\n\n## Related Issues`}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Markdown is supported
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source Branch</Label>
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-muted-foreground" />
                <Input 
                  value={currentBranch} 
                  disabled 
                  className="font-mono" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetBranch">Target Branch *</Label>
              <Select 
                value={targetBranch} 
                onValueChange={setTargetBranch}
                disabled={availableBranches.length <= 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target branch" />
                </SelectTrigger>
                <SelectContent>
                  {availableBranches
                    .filter(branch => branch !== currentBranch)
                    .map(branch => (
                      <SelectItem key={branch} value={branch} className="font-mono">
                        {branch}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoadingDiff ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Loading changes...</span>
            </div>
          ) : diffInfo && (
            <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Info className="w-4 h-4" />
                <span>Changes to be merged:</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex flex-col items-center p-2 bg-background rounded">
                  <span className="font-mono text-lg">{diffInfo.commits}</span>
                  <span className="text-muted-foreground">Commits</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-background rounded">
                  <span className="font-mono text-lg">{diffInfo.filesChanged}</span>
                  <span className="text-muted-foreground">Files Changed</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-background rounded">
                  <span className="font-mono text-lg">+{diffInfo.additions} -{diffInfo.deletions}</span>
                  <span className="text-muted-foreground">Lines Changed</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || !title.trim() || currentBranch === targetBranch}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <GitPullRequest className="mr-2 h-4 w-4" />
                  Create Pull Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePRModal;