// components/content/ReviewWorkflow.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, AlertCircle, NotebookPen } from 'lucide-react';

const statusColors = {
  pending_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  needs_revision: 'bg-blue-100 text-blue-800'
};

const ReviewWorkflow = ({ submissions, onStatusChange }) => {
  const [selectedStatus, setSelectedStatus] = useState({});
  const [isUpdating, setIsUpdating] = useState({});
  const { toast } = useToast();

  const handleStatusChange = async (submissionId) => {
    setIsUpdating(prev => ({ ...prev, [submissionId]: true }));
    
    try {
      const response = await fetch(`/api/content/${submissionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus[submissionId] })
      });

      if (!response.ok) throw new Error('Status update failed');
      
      const data = await response.json();
      onStatusChange(submissionId, data.status);
      toast({
        title: "Status Updated",
        description: `Content status changed to ${data.status.replace('_', ' ')}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <Check className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      case 'needs_revision': return <NotebookPen className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Content Review Queue</h2>
      
      {submissions.length === 0 ? (
        <Card className="p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p>No submissions awaiting review</p>
        </Card>
      ) : (
        submissions.map((submission) => (
          <Card key={submission.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium">{submission.title}</h3>
                <p className="text-sm text-gray-600">{submission.contentType}</p>
              </div>
              <Badge className={statusColors[submission.status]}>
                {getStatusIcon(submission.status)}
                <span className="ml-1 capitalize">{submission.status.replace('_', ' ')}</span>
              </Badge>
            </div>
            
            <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: submission.content }} />
            
            <div className="flex items-center gap-2">
              <Select 
                value={selectedStatus[submission.id] || submission.status}
                onValueChange={(value) => setSelectedStatus(prev => ({ ...prev, [submission.id]: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => handleStatusChange(submission.id)}
                disabled={isUpdating[submission.id] || !selectedStatus[submission.id] || selectedStatus[submission.id] === submission.status}
              >
                {isUpdating[submission.id] ? "Updating..." : "Update"}
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default ReviewWorkflow;