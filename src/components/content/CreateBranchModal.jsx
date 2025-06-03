import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const CreateBranchModal = ({ isOpen, onClose, onCreateBranch, currentBranch }) => {
  const [branchName, setBranchName] = useState('');
  const [baseBranch, setBaseBranch] = useState(currentBranch);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!branchName.trim()) {
      toast.error('Branch name is required');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateBranch({
        name: branchName,
        baseBranch,
        createdAt: new Date().toISOString()
      });
      toast.success(`Created new branch: ${branchName}`);
      onClose();
    } catch (error) {
      toast.error('Failed to create branch');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Branch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="branchName">Branch Name</Label>
            <Input
              id="branchName"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="feature/new-content"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseBranch">Base Branch</Label>
            <Select value={baseBranch} onValueChange={setBaseBranch}>
              <SelectTrigger>
                <SelectValue placeholder="Select base branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">main</SelectItem>
                <SelectItem value="develop">develop</SelectItem>
                <SelectItem value={currentBranch}>{currentBranch}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBranchModal; 