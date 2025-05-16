import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import CourseCard from './CourseCard';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { ocn } from '../../lib/basic';

const CourseGrid = ({ 
  title = "Available Courses", 
  showCreateButton = false, 
  createButtonLink = "/facilitator/create-course",
  emptyMessage = "No courses available yet",
  path = "courses" // Path prefix for course links
}) => {
  const { CoursesHub } = useTourLMS();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!ocn(CoursesHub)) return;
    setCourses([...CoursesHub]);
  }, [CoursesHub]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {showCreateButton && (
          <Link to={createButtonLink}>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <PlusCircle className="w-5 h-5" />
              Create Course
            </button>
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{emptyMessage}</h3>
          <p className="text-gray-500 dark:text-gray-400">Please check back later for new course offerings</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses.map((course) => (
            <motion.div key={course._id} variants={itemVariants}>
              <CourseCard course={course} path={path} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CourseGrid;
