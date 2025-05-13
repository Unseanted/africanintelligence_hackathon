
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search, FileCode, Code, RefreshCcw, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const HTTP_METHODS = {
  'GET': 'bg-blue-600 hover:bg-blue-700',
  'POST': 'bg-green-600 hover:bg-green-700',
  'PUT': 'bg-amber-600 hover:bg-amber-700',
  'DELETE': 'bg-red-600 hover:bg-red-700'
};

const ApiDocumentationStudents = () => {
  const { API_URL } = useTourLMS();
  const { toast } = useToast();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    fetchDocumentation();
  }, []);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/documentation`, {
        headers: { 'x-auth-token': token },
      });
      
      // Sort by endpoint and method
      const sortedDocs = response.data.sort((a, b) => {
        if (a.endpoint < b.endpoint) return -1;
        if (a.endpoint > b.endpoint) return 1;
        
        // Same endpoint, sort by method
        const methodOrder = { GET: 1, POST: 2, PUT: 3, DELETE: 4 };
        return methodOrder[a.method] - methodOrder[b.method];
      });
      
      setDocs(sortedDocs);
    } catch (error) {
      console.error('Error fetching API documentation:', error);
      toast({
        title: 'Failed to load API documentation',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDocumentation();
  };

  const filteredDocs = docs.filter(doc => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      doc.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || 
      doc.category === categoryFilter ||
      doc.endpoint.toLowerCase().includes(categoryFilter.toLowerCase());
    
    // Method filter
    const matchesMethod = methodFilter === 'all' || doc.method === methodFilter;
    
    return matchesSearch && matchesCategory && matchesMethod;
  });

  // Group docs by category
  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    const category = doc.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {});

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <FileCode className="text-purple-500" />
            API Documentation
          </h1>
          <p className="text-gray-500">
            Reference documentation for the AFRICAN INTELLIGENCE LMS API
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="auth">Authentication</SelectItem>
            <SelectItem value="courses">Courses</SelectItem>
            <SelectItem value="learner">Learner</SelectItem>
            <SelectItem value="facilitator">Facilitator</SelectItem>
            <SelectItem value="forum">Forum</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="teams">Teams</SelectItem>
            <SelectItem value="notifications">Notifications</SelectItem>
            <SelectItem value="upload">Upload</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <p className="text-gray-400">Loading API documentation...</p>
          </div>
        </div>
      ) : filteredDocs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center justify-center">
            <BookOpen className="h-16 w-16 text-gray-400 mb-3" />
            <h2 className="text-lg font-medium">No endpoints found</h2>
            <p className="text-gray-500 mt-2">
              {searchQuery || categoryFilter !== 'all' || methodFilter !== 'all' 
                ? 'Try changing your search criteria'
                : 'No API documentation available yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="grouped">
          <TabsList className="mb-6">
            <TabsTrigger value="grouped">Grouped By Category</TabsTrigger>
            <TabsTrigger value="all">All Endpoints</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grouped" className="mt-0 space-y-8">
            {Object.entries(groupedDocs).map(([category, categoryDocs]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-xl font-medium capitalize flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  {category} Endpoints
                  <Badge variant="outline" className="ml-2">
                    {categoryDocs.length}
                  </Badge>
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {categoryDocs.map(doc => (
                    <Card key={doc._id} className="overflow-hidden">
                      <CardHeader className="bg-slate-50 dark:bg-slate-900">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={`${HTTP_METHODS[doc.method]} font-mono`}>
                              {doc.method}
                            </Badge>
                            <CardTitle className="text-base md:text-lg font-mono">
                              {doc.endpoint}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="mb-4">{doc.description}</p>
                        
                        <Accordion type="single" collapsible>
                          {doc.payload && Object.keys(doc.payload).length > 0 && (
                            <AccordionItem value="payload">
                              <AccordionTrigger>Request Payload</AccordionTrigger>
                              <AccordionContent>
                                <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md overflow-x-auto font-mono text-sm">
                                  {JSON.stringify(doc.payload, null, 2)}
                                </pre>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                          
                          {doc.response && Object.keys(doc.response).length > 0 && (
                            <AccordionItem value="response">
                              <AccordionTrigger>Response Example</AccordionTrigger>
                              <AccordionContent>
                                <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md overflow-x-auto font-mono text-sm">
                                  {JSON.stringify(doc.response, null, 2)}
                                </pre>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 gap-6">
              {filteredDocs.map(doc => (
                <Card key={doc._id} className="overflow-hidden">
                  <CardHeader className="bg-slate-50 dark:bg-slate-900">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${HTTP_METHODS[doc.method]} font-mono`}>
                          {doc.method}
                        </Badge>
                        <CardTitle className="text-base md:text-lg font-mono">
                          {doc.endpoint}
                        </CardTitle>
                        <Badge variant="outline">{doc.category}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="mb-4">{doc.description}</p>
                    
                    <Accordion type="single" collapsible>
                      {doc.payload && Object.keys(doc.payload).length > 0 && (
                        <AccordionItem value="payload">
                          <AccordionTrigger>Request Payload</AccordionTrigger>
                          <AccordionContent>
                            <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md overflow-x-auto font-mono text-sm">
                              {JSON.stringify(doc.payload, null, 2)}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      
                      {doc.response && Object.keys(doc.response).length > 0 && (
                        <AccordionItem value="response">
                          <AccordionTrigger>Response Example</AccordionTrigger>
                          <AccordionContent>
                            <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md overflow-x-auto font-mono text-sm">
                              {JSON.stringify(doc.response, null, 2)}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ApiDocumentationStudents;
