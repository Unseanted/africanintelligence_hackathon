import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Trash, Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';

const DeleteEventDialog = ({ onDelete }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
      setOpen(false);
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-gray-700 bg-gray-800/50 text-red-400 hover:text-red-300 hover:bg-red-900/20">
          <Trash size={16} />
          <span>Delete Event</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>Are you sure you want to delete this event? This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="text-white">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <Trash className="w-4 h-4" />
            <span>Delete</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteEventDialog;