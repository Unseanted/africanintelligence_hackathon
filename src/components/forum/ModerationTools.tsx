import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { AlertTriangle, CheckCircle, XCircle, Flag, Shield, User } from 'lucide-react';

interface ReportedContent {
  _id: string;
  type: 'comment' | 'reply';
  content: string;
  author: {
    _id: string;
    name: string;
    reputation: number;
  };
  reportCount: number;
  reports: {
    reason: string;
    reportedBy: string;
    reportedAt: string;
  }[];
  status: 'pending' | 'resolved' | 'dismissed';
}

interface ModerationToolsProps {
  lessonId: string;
}

const ModerationTools: React.FC<ModerationToolsProps> = ({ lessonId }) => {
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<ReportedContent | null>(null);
  const { token } = useTourLMS();
  const { toast } = useToast();

  useEffect(() => {
    const fetchReportedContent = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/lessons/${lessonId}/reported-content`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch reported content');

        const data = await response.json();
        setReportedContent(data);
      } catch (error) {
        console.error('Error fetching reported content:', error);
        toast({
          title: 'Error',
          description: 'Failed to load reported content',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportedContent();
  }, [token, lessonId]);

  const handleAction = async (contentId: string, action: 'approve' | 'remove' | 'dismiss') => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/moderate/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) throw new Error('Failed to moderate content');

      const updatedContent = await response.json();
      setReportedContent(prev => prev.map(content => 
        content._id === updatedContent._id ? updatedContent : content
      ));

      toast({
        title: 'Success',
        description: `Content ${action}d successfully`,
      });
    } catch (error) {
      console.error('Error moderating content:', error);
      toast({
        title: 'Error',
        description: 'Failed to moderate content',
        variant: 'destructive',
      });
    }
  };

  const filteredContent = reportedContent.filter(content => {
    const searchLower = searchQuery.toLowerCase();
    return (
      content.content.toLowerCase().includes(searchLower) ||
      content.author.name.toLowerCase().includes(searchLower) ||
      content.reports.some(report => report.reason.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Moderation Tools</h2>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search reported content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {!selectedContent ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredContent.map(content => (
            <Card key={content._id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{content.author.name}</span>
                    <span className="text-sm text-gray-500">
                      (Reputation: {content.author.reputation})
                    </span>
                  </div>
                  <p className="text-gray-700">{content.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Flag className="w-4 h-4" />
                      <span>{content.reportCount} reports</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{content.status}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedContent(content)}
                >
                  Review
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Review Reported Content</h3>
            <Button variant="outline" onClick={() => setSelectedContent(null)}>
              Back to List
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Content Details</h4>
              <Card className="p-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{selectedContent.author.name}</span>
                    <span className="text-sm text-gray-500">
                      (Reputation: {selectedContent.author.reputation})
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{selectedContent.content}</p>
                </div>
              </Card>
            </div>

            <div>
              <h4 className="font-medium mb-2">Reports</h4>
              <div className="space-y-2">
                {selectedContent.reports.map((report, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{report.reason}</p>
                        <p className="text-sm text-gray-500">
                          Reported by {report.reportedBy} on{' '}
                          {new Date(report.reportedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => handleAction(selectedContent._id, 'dismiss')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Dismiss Reports
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction(selectedContent._id, 'remove')}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Remove Content
              </Button>
              <Button
                onClick={() => handleAction(selectedContent._id, 'approve')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Content
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ModerationTools; 