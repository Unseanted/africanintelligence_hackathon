import React, { useState, useEffect } from 'react';
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
import { Input } from '../../components/ui/input';
import { Search, Plus, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../components/ui/use-toast';
import { useTourLMS } from '../../contexts/TourLMSContext';

const AddParticipantDialog = ({ onAdd, excludeIds = [] }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);
  const { toast } = useToast();
  const { API_URL } = useTourLMS();

  useEffect(() => {
    if (open && searchQuery.length >= 2) {
      const debounce = setTimeout(() => {
        fetchUsers();
      }, 300);
      return () => clearTimeout(debounce);
    } else {
    //   setUsers([]);
    }
  }, [searchQuery, open]);
  
  useEffect(()=>{
    fetchUsers();
  },[])

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { 'x-auth-token': token },
        params: { search: searchQuery },
      });
      const filteredUsers = response.data.filter((user) => !excludeIds.includes(user._id));
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Failed to fetch users',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (userId) => {
    setAdding(userId);
    try {
      await onAdd(userId);
      setOpen(false);
      setSearchQuery('');
      setUsers([]);
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setAdding(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-green-600 hover:bg-green-700">
          <Plus size={16} />
          <span>Add Participant</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>Search for users to add as participants to the event.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 focus:border-purple-500 text-white placeholder:text-gray-400"
            />
          </div>
          <div className="mt-4 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-800 mb-2"
                >
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAdd(user._id)}
                    disabled={adding === user._id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {adding === user._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Add'
                    )}
                  </Button>
                </div>
              ))
            ) : searchQuery.length >= 2 ? (
              <p className="text-center text-gray-400 py-4">No users found</p>
            ) : (
              <p className="text-center text-gray-400 py-4">Enter a search term to find users</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="text-white">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddParticipantDialog;