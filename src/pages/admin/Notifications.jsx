
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, 
  Send, 
  Users, 
  BookOpen, 
  Filter, 
  RefreshCcw,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { useToast } from '../../components/ui/use-toast';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { Skeleton } from '../../components/ui/skeleton';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getIconByType = (type) => {
    switch(type) {
      case 'warning':
        return <AlertCircle className="text-amber-500" />;
      case 'error':
        return <AlertCircle className="text-red-500" />;
      case 'success':
        return <CheckCircle className="text-green-500" />;
      case 'info':
      default:
        return <Info className="text-blue-500" />;
    }
  };
  
  const icon = getIconByType(notification.type);
  const isRead = notification.read;
  
  return (
    <div className={`p-4 rounded-lg transition-colors ${isRead ? 'bg-gray-800/20' : 'bg-gray-800/50 border-l-4 border-purple-500'}`}>
      <div className="flex items-start gap-4">
        <div className="mt-1">{icon}</div>
        <div className="flex-1">
          <h3 className={`font-medium ${isRead ? 'text-gray-300' : 'text-white'}`}>{notification.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {format(new Date(notification.createdAt), 'PPp')}
            </span>
            {!isRead && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs hover:bg-gray-700"
                onClick={() => onMarkAsRead(notification._id)}
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateNotificationDialog = ({ courses = [], onSend }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [target, setTarget] = useState('all');
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const handleSend = async () => {
    if (!title || !message) {
      return;
    }
    
    setLoading(true);
    try {
      await onSend({ title, message, type, target, courseId: target === 'course' ? courseId : null });
      setOpen(false);
      setTitle('');
      setMessage('');
      setType('info');
      setTarget('all');
      setCourseId('');
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          <span>Create Notification</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle>Create New Notification</DialogTitle>
          <DialogDescription>
            Send notifications to users on the platform
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Notification Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Target Audience</label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">All Students</SelectItem>
                  <SelectItem value="facilitators">All Facilitators</SelectItem>
                  <SelectItem value="course">Specific Course</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {target === 'course' && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Select Course</label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {courses.map(course => (
                    <SelectItem key={course.key} value={course.key}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!title || !message || loading}
            className="gap-2"
          >
            {loading && <RefreshCcw className="w-4 h-4 animate-spin" />}
            <Send className="w-4 h-4" />
            <span>Send Notification</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, read, unread
  const { toast } = useToast();
  const { API_URL } = useTourLMS();

  useEffect(() => {
    fetchNotifications();
    fetchCourses();
  }, [API_URL]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Failed to load notifications",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/courses`, {
        headers: { 'x-auth-token': token }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        )
      );
      toast({
        title: "Notification marked as read",
        variant: "default"
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Failed to update notification",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          read: true, 
          readAt: new Date() 
        }))
      );
      toast({
        title: "All notifications marked as read",
        variant: "default"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Failed to update notifications",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive"
      });
    }
  };

  const sendNotification = async (notificationData) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = notificationData.target === 'course' 
        ? `${API_URL}/notifications/course-update/${notificationData.courseId}`
        : `${API_URL}/notifications/test`;
      
      await axios.post(endpoint, {
        title: notificationData.title,
        message: notificationData.message
      }, {
        headers: { 'x-auth-token': token }
      });
      
      toast({
        title: "Notification sent successfully",
        variant: "success"
      });
      
      // Refresh notifications list
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Failed to send notification",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Filter notifications based on search query and read/unread status
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'read') {
      return matchesSearch && notification.read;
    } else if (filter === 'unread') {
      return matchesSearch && !notification.read;
    }
    
    return matchesSearch;
  });

  // Stats
  const totalNotifications = notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <Bell /> Notifications
        </h1>
        <p className="text-gray-400 mt-1">
          Manage and send notifications to users
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Notifications</p>
                <p className="text-2xl font-bold">{totalNotifications}</p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-full text-gray-400">
                <Bell size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-400">Unread</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <div className="p-3 bg-blue-900/30 rounded-full text-blue-400">
                <Bell size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-400">Read</p>
                <p className="text-2xl font-bold">{readCount}</p>
              </div>
              <div className="p-3 bg-green-900/30 rounded-full text-green-400">
                <CheckCircle size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700 focus:border-purple-500"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-700 bg-gray-800/50">
                <Filter size={16} className="mr-2" />
                {filter === 'all' ? 'All' : filter === 'read' ? 'Read' : 'Unread'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border border-gray-700">
              <DropdownMenuItem onClick={() => setFilter('all')} className="text-gray-200 hover:bg-gray-700 cursor-pointer">
                All Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('read')} className="text-gray-200 hover:bg-gray-700 cursor-pointer">
                Read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('unread')} className="text-gray-200 hover:bg-gray-700 cursor-pointer">
                Unread
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            className="border-gray-700 bg-gray-800/50"
            onClick={fetchNotifications}
          >
            <RefreshCcw size={16} />
          </Button>
          
          <Button 
            variant="outline" 
            className="border-gray-700 bg-gray-800/50"
            onClick={markAllAsRead}
          >
            Mark all read
          </Button>
          
          <CreateNotificationDialog 
            courses={courses}
            onSend={sendNotification}
          />
        </div>
      </div>

      {/* Notifications List */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
        <CardHeader className="border-b border-gray-800">
          <CardTitle>Notification Center</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="mb-4">
            <TabsList className="bg-gray-800/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-900/30">
                All
                <Badge variant="outline" className="ml-2 bg-gray-800/50 text-gray-200">{totalNotifications}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="data-[state=active]:bg-purple-900/30">
                Unread
                <Badge variant="outline" className="ml-2 bg-gray-800/50 text-gray-200">{unreadCount}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-800/30">
                      <div className="flex gap-4">
                        <Skeleton className="h-6 w-6 rounded bg-gray-700" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-48 mb-2 bg-gray-700" />
                          <Skeleton className="h-4 w-full mb-3 bg-gray-700" />
                          <Skeleton className="h-3 w-20 bg-gray-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map(notification => (
                    <NotificationItem 
                      key={notification._id} 
                      notification={notification} 
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">No notifications found</p>
                  {searchQuery && <p className="text-gray-500 mt-1">Try adjusting your search</p>}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="unread" className="mt-4">
              {loading ? (
                <div className="space-y-4">
                  {Array(2).fill(0).map((_, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-800/30">
                      <div className="flex gap-4">
                        <Skeleton className="h-6 w-6 rounded bg-gray-700" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-48 mb-2 bg-gray-700" />
                          <Skeleton className="h-4 w-full mb-3 bg-gray-700" />
                          <Skeleton className="h-3 w-20 bg-gray-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.filter(n => !n.read).length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications
                    .filter(n => !n.read)
                    .map(notification => (
                      <NotificationItem 
                        key={notification._id} 
                        notification={notification} 
                        onMarkAsRead={markAsRead}
                      />
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">All caught up!</p>
                  <p className="text-gray-500 mt-1">You have no unread notifications</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
