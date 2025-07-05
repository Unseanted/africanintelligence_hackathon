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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { GitBranch, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const CreateBranchModal = ({ 
  isOpen, 
  onClose, 
  onCreateBranch, 
  currentBranch = 'main',
  availableBranches = ['main', 'develop'],
  validateBranchName
}) => {
  const [branchName, setBranchName] = useState('');
  const [baseBranch, setBaseBranch] = useState(currentBranch);
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const debouncedBranchName = useDebounce(branchName, 300);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBranchName('');
      setBaseBranch(currentBranch);
      setValidationError('');
    }
  }, [isOpen, currentBranch]);

  // Validate branch name as user types
  useEffect(() => {
    if (debouncedBranchName && validateBranchName) {
      const error = validateBranchName(debouncedBranchName);
      setValidationError(error || '');
    }
  }, [debouncedBranchName, validateBranchName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!branchName.trim()) {
      toast.error('Branch name is required');
      return;
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsCreating(true);
    try {
      await onCreateBranch({
        name: branchName.trim(),
        baseBranch,
        createdAt: new Date().toISOString()
      });
      toast.success(`Created new branch: ${branchName.trim()}`);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create branch');
    } finally {
      setIsCreating(false);
    }
  };

  const generateSuggestedName = () => {
    const prefix = 'feature/';
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${prefix}${branchName.trim() || 'new-feature'}-${randomSuffix}`;
  };

  const handleGenerateName = () => {
    setBranchName(generateSuggestedName());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Create New Branch
          </DialogTitle>
          <DialogDescription>
            Create a new branch from an existing base branch
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="branchName">Branch Name</Label>
              <Button 
                type="button" 
                variant="link" 
                size="sm" 
                className="h-auto px-0"
                onClick={handleGenerateName}
              >
                Suggest name
              </Button>
            </div>
            <Input
              id="branchName"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="feature/new-content"
              className="font-mono"
            />
            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Use lowercase, numbers, and hyphens only
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseBranch">Base Branch</Label>
            <Select 
              value={baseBranch} 
              onValueChange={setBaseBranch}
              disabled={availableBranches.length <= 1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select base branch" />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map(branch => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              The branch you want to branch from
            </p>
          </div>

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
              disabled={isCreating || !branchName.trim() || !!validationError}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Branch'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBranchModal;