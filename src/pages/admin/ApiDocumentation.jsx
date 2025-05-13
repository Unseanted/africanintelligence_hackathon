
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, BookOpen, Plus, Search, Save, X, Edit, Trash2, RefreshCw } from 'lucide-react';

const ApiDocumentation = () => {
  const [endpoints, setEndpoints] = useState([]);
  const [filteredEndpoints, setFilteredEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEndpoint, setEditEndpoint] = useState(null);
  const [formData, setFormData] = useState({
    method: 'GET',
    path: '',
    category: 'auth',
    description: '',
    requestBody: '',
    responseBody: '',
    parameters: [],
    headers: [],
  });
  
  const { API_URL } = useTourLMS();
  const { toast } = useToast();

  useEffect(() => {
    fetchEndpoints();
  }, []);

  useEffect(() => {
    if (searchTerm || currentCategory !== 'all') {
      filterEndpoints();
    } else {
      setFilteredEndpoints(endpoints);
    }
  }, [searchTerm, currentCategory, endpoints]);

  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // In a real implementation, this would fetch from the documentation collection
      // For now, let's use the README data structure
      
      // Simulated API call - replace with actual API call in production
      const dummyEndpoints = [
        {
          _id: '1',
          method: 'POST',
          path: '/api/auth/register',
          category: 'auth',
          description: 'Register a new user',
          requestBody: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'student'
          }, null, 2),
          responseBody: JSON.stringify({
            user: {
              _id: '12345',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'student'
            },
            token: 'jwt-token-here'
          }, null, 2),
          parameters: [],
          headers: [{ name: 'Content-Type', value: 'application/json' }]
        },
        {
          _id: '2',
          method: 'POST',
          path: '/api/auth/login',
          category: 'auth',
          description: 'Authenticate user and get token',
          requestBody: JSON.stringify({
            email: 'john@example.com',
            password: 'password123'
          }, null, 2),
          responseBody: JSON.stringify({
            user: {
              _id: '12345',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'student'
            },
            token: 'jwt-token-here'
          }, null, 2),
          parameters: [],
          headers: [{ name: 'Content-Type', value: 'application/json' }]
        },
        {
          _id: '3',
          method: 'GET',
          path: '/api/courses',
          category: 'courses',
          description: 'Get all published courses',
          requestBody: '',
          responseBody: JSON.stringify([
            {
              _id: '12345',
              title: 'Introduction to Tourism',
              description: 'Learn the basics of tourism',
              facilitator: '67890',
              status: 'published'
            }
          ], null, 2),
          parameters: [],
          headers: [{ name: 'x-auth-token', value: 'jwt-token-here' }]
        },
        {
          _id: '4',
          method: 'GET',
          path: '/api/courses/:id',
          category: 'courses',
          description: 'Get course details by ID',
          requestBody: '',
          responseBody: JSON.stringify({
            _id: '12345',
            title: 'Introduction to Tourism',
            description: 'Learn the basics of tourism',
            facilitator: '67890',
            status: 'published',
            modules: []
          }, null, 2),
          parameters: [{ name: 'id', description: 'Course ID' }],
          headers: [{ name: 'x-auth-token', value: 'jwt-token-here' }]
        },
        {
          _id: '5',
          method: 'GET',
          path: '/api/admin/events',
          category: 'events',
          description: 'Get all events',
          requestBody: '',
          responseBody: JSON.stringify([
            {
              _id: '12345',
              title: 'Tourism Conference 2025',
              description: 'Annual tourism conference',
              eventDate: '2025-06-15T09:00:00.000Z',
              status: 'upcoming'
            }
          ], null, 2),
          parameters: [],
          headers: [{ name: 'x-auth-token', value: 'jwt-token-here' }]
        },
        {
          _id: '6',
          method: 'POST',
          path: '/api/admin/events/:eventId/teams',
          category: 'teams',
          description: 'Create team for event',
          requestBody: JSON.stringify({
            name: 'Team Explorers',
            description: 'A team of tourism explorers',
            leader: '67890',
            members: ['67890']
          }, null, 2),
          responseBody: JSON.stringify({
            message: 'Team created successfully',
            team: {
              _id: '54321',
              name: 'Team Explorers',
              description: 'A team of tourism explorers',
              leader: '67890',
              members: ['67890'],
              createdAt: '2025-05-10T14:30:00.000Z'
            }
          }, null, 2),
          parameters: [{ name: 'eventId', description: 'Event ID' }],
          headers: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'x-auth-token', value: 'jwt-token-here' }
          ]
        }
      ];
      
      setEndpoints(dummyEndpoints);
      setFilteredEndpoints(dummyEndpoints);
    } catch (error) {
      console.error('Error fetching API documentation:', error);
      toast({
        title: 'Failed to load API documentation',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEndpoints = () => {
    let filtered = endpoints;
    
    if (searchTerm) {
      filtered = filtered.filter(endpoint => 
        endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (currentCategory !== 'all') {
      filtered = filtered.filter(endpoint => endpoint.category === currentCategory);
    }
    
    setFilteredEndpoints(filtered);
  };

  const handleAddEndpoint = async () => {
    try {
      // In a real implementation, this would save to the documentation collection
      const newEndpoint = {
        _id: Date.now().toString(),
        ...formData
      };
      
      setEndpoints([...endpoints, newEndpoint]);
      setDialogOpen(false);
      resetForm();
      
      toast({
        title: 'Endpoint added',
        description: 'API endpoint documentation has been added successfully',
      });
    } catch (error) {
      console.error('Error adding endpoint:', error);
      toast({
        title: 'Failed to add endpoint',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEndpoint = async () => {
    try {
      if (!editEndpoint) return;
      
      // In a real implementation, this would update the documentation collection
      const updatedEndpoints = endpoints.map(ep => 
        ep._id === editEndpoint._id ? { ...formData, _id: ep._id } : ep
      );
      
      setEndpoints(updatedEndpoints);
      setDialogOpen(false);
      setEditEndpoint(null);
      resetForm();
      
      toast({
        title: 'Endpoint updated',
        description: 'API endpoint documentation has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating endpoint:', error);
      toast({
        title: 'Failed to update endpoint',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEndpoint = async (id) => {
    try {
      // In a real implementation, this would delete from the documentation collection
      const updatedEndpoints = endpoints.filter(ep => ep._id !== id);
      setEndpoints(updatedEndpoints);
      
      toast({
        title: 'Endpoint deleted',
        description: 'API endpoint documentation has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      toast({
        title: 'Failed to delete endpoint',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      method: 'GET',
      path: '',
      category: 'auth',
      description: '',
      requestBody: '',
      responseBody: '',
      parameters: [],
      headers: [],
    });
  };

  const editEndpointHandler = (endpoint) => {
    setEditEndpoint(endpoint);
    setFormData({
      method: endpoint.method,
      path: endpoint.path,
      category: endpoint.category,
      description: endpoint.description,
      requestBody: endpoint.requestBody,
      responseBody: endpoint.responseBody,
      parameters: endpoint.parameters || [],
      headers: endpoint.headers || [],
    });
    setDialogOpen(true);
  };

  const addParameter = () => {
    setFormData({
      ...formData,
      parameters: [...formData.parameters, { name: '', description: '' }]
    });
  };

  const removeParameter = (index) => {
    const parameters = [...formData.parameters];
    parameters.splice(index, 1);
    setFormData({ ...formData, parameters });
  };

  const updateParameter = (index, field, value) => {
    const parameters = [...formData.parameters];
    parameters[index][field] = value;
    setFormData({ ...formData, parameters });
  };

  const addHeader = () => {
    setFormData({
      ...formData,
      headers: [...formData.headers, { name: '', value: '' }]
    });
  };

  const removeHeader = (index) => {
    const headers = [...formData.headers];
    headers.splice(index, 1);
    setFormData({ ...formData, headers });
  };

  const updateHeader = (index, field, value) => {
    const headers = [...formData.headers];
    headers[index][field] = value;
    setFormData({ ...formData, headers });
  };

  const getMethodBadgeColor = (method) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-500 hover:bg-blue-600';
      case 'POST': return 'bg-green-500 hover:bg-green-600';
      case 'PUT': return 'bg-amber-500 hover:bg-amber-600';
      case 'DELETE': return 'bg-red-500 hover:bg-red-600';
      case 'PATCH': return 'bg-purple-500 hover:bg-purple-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'auth', label: 'Authentication' },
    { key: 'courses', label: 'Courses' },
    { key: 'learner', label: 'Learner' },
    { key: 'facilitator', label: 'Facilitator' },
    { key: 'admin', label: 'Admin' },
    { key: 'forum', label: 'Forum' },
    { key: 'chat', label: 'Chat' },
    { key: 'notification', label: 'Notifications' },
    { key: 'upload', label: 'Upload' },
    { key: 'events', label: 'Events' },
    { key: 'teams', label: 'Teams' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-gray-400">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-gray-500">
            Explore and manage the available API endpoints in the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchEndpoints()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-1" /> Add Endpoint
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search endpoints..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs>
<TabsList className="h-10">
          {categories.map((category) => (
            <TabsTrigger
              key={category.key}
              value={category.key}
              onClick={() => setCurrentCategory(category.key)}
              className={currentCategory === category.key ? '' : ''}
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
        </Tabs>
        
      </div>

      {filteredEndpoints.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center justify-center">
            <BookOpen className="h-16 w-16 text-gray-400 mb-3" />
            <h2 className="text-lg font-medium">No endpoints found</h2>
            <p className="text-gray-500 mt-2">
              {searchTerm || currentCategory !== 'all' 
                ? 'Try changing your search criteria'
                : 'Start by adding API documentation'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEndpoints.map((endpoint) => (
            <Card key={endpoint._id} className="overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${getMethodBadgeColor(endpoint.method)} font-mono`}>
                      {endpoint.method}
                    </Badge>
                    <CardTitle className="text-base md:text-lg font-mono">
                      {endpoint.path}
                    </CardTitle>
                    <Badge variant="outline">{endpoint.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => editEndpointHandler(endpoint)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteEndpoint(endpoint._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-4">{endpoint.description}</p>
                
                <Accordion type="single" collapsible>
                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <AccordionItem value="parameters">
                      <AccordionTrigger>Parameters</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Name</th>
                                <th className="text-left py-2">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {endpoint.parameters.map((param, index) => (
                                <tr key={index} className="border-b last:border-0">
                                  <td className="py-2 font-mono">{param.name}</td>
                                  <td className="py-2">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  
                  {endpoint.headers && endpoint.headers.length > 0 && (
                    <AccordionItem value="headers">
                      <AccordionTrigger>Headers</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Name</th>
                                <th className="text-left py-2">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {endpoint.headers.map((header, index) => (
                                <tr key={index} className="border-b last:border-0">
                                  <td className="py-2 font-mono">{header.name}</td>
                                  <td className="py-2 font-mono">{header.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  
                  {endpoint.requestBody && (
                    <AccordionItem value="request">
                      <AccordionTrigger>Request Body</AccordionTrigger>
                      <AccordionContent>
                        <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md overflow-x-auto font-mono text-sm">
                          {endpoint.requestBody}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  
                  {endpoint.responseBody && (
                    <AccordionItem value="response">
                      <AccordionTrigger>Response Body</AccordionTrigger>
                      <AccordionContent>
                        <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md overflow-x-auto font-mono text-sm">
                          {endpoint.responseBody}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editEndpoint ? 'Edit API Endpoint' : 'Add API Endpoint'}</DialogTitle>
            <DialogDescription>
              {editEndpoint 
                ? 'Update the details for this API endpoint documentation.'
                : 'Fill in the details to document a new API endpoint.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="method">Method</Label>
                  <select
                    id="method"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.filter(c => c.key !== 'all').map(category => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="path">Path</Label>
                <Input
                  id="path"
                  placeholder="/api/resource/:id"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this endpoint does"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Parameters</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addParameter}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {formData.parameters.map((param, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    <Input
                      placeholder="Name"
                      value={param.name}
                      onChange={(e) => updateParameter(index, 'name', e.target.value)}
                      className="w-1/3"
                    />
                    <Input
                      placeholder="Description"
                      value={param.description}
                      onChange={(e) => updateParameter(index, 'description', e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeParameter(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Headers</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addHeader}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {formData.headers.map((header, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    <Input
                      placeholder="Name"
                      value={header.name}
                      onChange={(e) => updateHeader(index, 'name', e.target.value)}
                      className="w-1/3"
                    />
                    <Input
                      placeholder="Value"
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeHeader(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="requestBody">Request Body (JSON)</Label>
                <Textarea
                  id="requestBody"
                  placeholder="{}"
                  value={formData.requestBody}
                  onChange={(e) => setFormData({ ...formData, requestBody: e.target.value })}
                  className="font-mono h-[150px]"
                />
              </div>
              
              <div>
                <Label htmlFor="responseBody">Response Body (JSON)</Label>
                <Textarea
                  id="responseBody"
                  placeholder="{}"
                  value={formData.responseBody}
                  onChange={(e) => setFormData({ ...formData, responseBody: e.target.value })}
                  className="font-mono h-[150px]"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDialogOpen(false);
                setEditEndpoint(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={editEndpoint ? handleUpdateEndpoint : handleAddEndpoint}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {editEndpoint ? 'Update Endpoint' : 'Save Endpoint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiDocumentation;
