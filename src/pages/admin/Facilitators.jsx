
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  CircuitBoard, 
  BookOpen, 
  Star, 
  Users,
  RefreshCcw,
  Filter,
  ChevronRight,
  UserX 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useTourLMS } from '../../contexts/TourLMSContext';

const Facilitators = () => {
  const [facilitators, setFacilitators] = useState([]);
  const {API_URL}= useTourLMS();
    const [filteredFacilitators, setFilteredFacilitators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const { toast } = useToast();

  useEffect(() => {
    fetchFacilitators();
  }, []);

  useEffect(() => {
    filterFacilitators();
  }, [facilitators, searchQuery, filter]);

  const fetchFacilitators = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { 'x-auth-token': token }
      });
      
      // Filter only facilitators
      const facilitatorsData = response.data.filter(user => user.role === 'facilitator');
      setFacilitators(facilitatorsData);
      setFilteredFacilitators(facilitatorsData);
    } catch (error) {
      console.error('Error fetching facilitators:', error);
      toast({
        title: "Failed to load facilitators",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFacilitators = () => {
    let filtered = [...facilitators];
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(facilitator => 
        facilitator.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        facilitator.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(facilitator => facilitator.lastLogin);
    } else if (filter === 'inactive') {
      filtered = filtered.filter(facilitator => !facilitator.lastLogin);
    }
    
    setFilteredFacilitators(filtered);
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <CircuitBoard /> Facilitators Management
        </h1>
        <p className="text-gray-400 mt-1">
          View, search and manage course facilitators
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Facilitators</p>
                <p className="text-2xl font-bold text-white">{loading ? '-' : facilitators.length}</p>
              </div>
              <div className="p-3 bg-amber-900/30 rounded-full text-amber-400">
                <CircuitBoard size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Facilitators</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '-' : facilitators.filter(f => f.createdCourses?.length).length}
                </p>
              </div>
              <div className="p-3 bg-green-900/30 rounded-full text-green-400">
                <CircuitBoard size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg. Courses</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '-' : (facilitators.reduce((acc, curr) => 
                    acc + (curr.createdCourses?.length || 0), 0) / facilitators.length || 0).toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-purple-900/30 rounded-full text-purple-400">
                <BookOpen size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-400">New This Month</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '-' : facilitators.filter(f => {
                    const createdDate = new Date(f.createdAt);
                    const now = new Date();
                    return createdDate.getMonth() === now.getMonth() && 
                           createdDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-indigo-900/30 rounded-full text-indigo-400">
                <Users size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search by name or email..."
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
                {filter === 'all' ? 'All Facilitators' : filter === 'active' ? 'Active' : 'Inactive'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border border-gray-700">
              <DropdownMenuItem onClick={() => setFilter('all')} className="text-gray-200 hover:bg-gray-700 cursor-pointer">
                All Facilitators
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('active')} className="text-gray-200 hover:bg-gray-700 cursor-pointer">
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('inactive')} className="text-gray-200 hover:bg-gray-700 cursor-pointer">
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            className="border-gray-700 bg-gray-800/50"
            onClick={fetchFacilitators}
          >
            <RefreshCcw size={16} />
          </Button>
        </div>
      </div>

      {/* Facilitators Table */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Courses</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                Array(5).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse"></div>
                        <div className="h-4 w-24 bg-gray-800 animate-pulse rounded"></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-800 animate-pulse rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-800 animate-pulse rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-8 bg-gray-800 animate-pulse rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-800 animate-pulse rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-800 animate-pulse rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-8 w-8 bg-gray-800 animate-pulse rounded"></div></td>
                  </tr>
                ))
              ) : filteredFacilitators.length > 0 ? (
                filteredFacilitators.map((facilitator) => (
                  <tr key={facilitator._id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-medium">
                          {facilitator.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className='text-white'>{facilitator.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{facilitator.email}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {facilitator.createdAt ? new Date(facilitator.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400">
                        {facilitator.createdCourses?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="ml-1">{facilitator.rating || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {facilitator.createdCourses?.length ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm text-green-400">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                          <span className="text-sm text-gray-400">Inactive</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/oracle/facilitators/${facilitator._id}`}
                          className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                          title="View Details"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-gray-400">
                    <UserX className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p>No facilitators found matching your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Facilitators;
