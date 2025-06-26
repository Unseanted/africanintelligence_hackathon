// Required env: VITE_UNSPLASH_URL
const UNSPLASH_URL = import.meta.env.VITE_UNSPLASH_URL || 'https://images.unsplash.com/photo-1564648351416-3eec9f3e85de?auto=format&fit=crop&w=800&q=80';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book, Users, Clock, Star, Search, Filter, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTourLMS } from '../../contexts/TourLMSContext';

const CourseCard = ({ course }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Link to={`/facilitator/courses/${course.key}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
          <div className="aspect-video relative overflow-hidden bg-gray-100">
            <img 
              src={course.thumbnail ? course.thumbnail : UNSPLASH_URL} 
              alt={course.title}
              className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
            />
            <Badge className="absolute top-2 right-2 bg-red-500">
              {course.category}
            </Badge>
          </div>
          <CardContent className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-1">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
              {course.shortDescription}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolled}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{course.rating}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

const CourseGrid = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const {facilitatorCourses}=useTourLMS();
  
  const filteredCourses = facilitatorCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && course.category.toLowerCase() === filter.toLowerCase();
  });
  
  const categories = ['all', ...new Set(facilitatorCourses.map(course => course.category.toLowerCase()))];

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Your Courses</h2>
          <p className="text-gray-600">Create and manage tourism and hospitality courses</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link 
            to="/facilitator/create-course"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Course</span>
          </Link>
        </motion.div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category, index) => (
                  <SelectItem key={index} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline">
            More Filters
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <Book className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
          <p className="text-gray-600 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default CourseGrid;
