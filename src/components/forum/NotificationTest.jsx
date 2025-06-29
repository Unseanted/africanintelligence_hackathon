import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useToast } from '@/hooks/use-toast';

const NotificationTest = () => {
  const { user, token, API_URL } = useTourLMS();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);

  const testBasicNotification = async () => {
    try {
      setTesting(true);
      const response = await fetch(`${API_URL}/api/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Basic notification test sent! Check your browser notifications.',
        });
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test notification. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const testForumNotification = async () => {
    try {
      setTesting(true);
      
      // First create a test post
      const testPost = {
        title: 'Test Forum Post',
        content: 'This is a test post for notification testing',
        category: 'Test Category',
        authorId: user._id
      };

      const response = await fetch(`${API_URL}/api/notifications/test-forum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          postId: '507f1f77bcf86cd799439011', // Test ObjectId
          authorId: user._id,
          isReply: false
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Forum notification test sent! Check your browser notifications.',
        });
      } else {
        throw new Error('Failed to send forum test notification');
      }
    } catch (error) {
      console.error('Error testing forum notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send forum test notification. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Notification Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Test push notifications to verify the system is working.
        </p>
        
        <div className="space-y-2">
          <Button 
            onClick={testBasicNotification}
            disabled={testing}
            className="w-full"
          >
            {testing ? 'Testing...' : 'Test Basic Notification'}
          </Button>
          
          <Button 
            onClick={testForumNotification}
            disabled={testing}
            variant="outline"
            className="w-full"
          >
            {testing ? 'Testing...' : 'Test Forum Notification'}
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>• Make sure you've granted notification permissions</p>
          <p>• Check browser console for any errors</p>
          <p>• Notifications should appear even when app is closed</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTest; 