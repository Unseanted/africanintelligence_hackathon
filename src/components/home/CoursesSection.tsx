
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Star, Users, ChevronRight } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  instructor: string;
  image: string;
  rating: number;
  students: number;
}

interface CoursesSectionProps {
  courses: Course[];
  isVisible: {
    courses: boolean;
  };
}

const CoursesSection: React.FC<CoursesSectionProps> = ({ courses, isVisible }) => {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <motion.div 
        className="max-w-7xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible.courses ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Popular Tourism & Hospitality Courses
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Begin your journey into smart tourism with our top-rated courses
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
        {courses.map((course, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible.courses ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -10 }}
          >
            <div className="h-48 overflow-hidden">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">Instructor: {course.instructor}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="ml-1 text-gray-700">{course.rating}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="ml-1 text-gray-700">{course.students} students</span>
                </div>
                <Link to="/register">
                  <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center">
        <Link to="/register">
          <Button className="bg-red-600 hover:bg-red-700">
            Explore All Courses <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CoursesSection;
