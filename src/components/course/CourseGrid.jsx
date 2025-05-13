
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import CourseCard from './CourseCard';
import { useTourLMS } from '../../contexts/TourLMSContext';

const CourseGrid = ({ 
   
  title = "Available Courses", 
  showCreateButton = false, 
  createButtonLink = "/facilitator/create-course",
  emptyMessage = "No courses available yet",
  path = "courses" // Path prefix for course links
}) => {
  
  const {CoursesHub} = useTourLMS();
  const [courses,setCourses]=useState([]);

  useEffect(()=>{
if(!ocn(CoursesHub))return;
setCourses([...CoursesHub])
  },[CoursesHub])
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
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="text-2xl font-bold text-slate-900 dark:text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>
        
        {showCreateButton && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to={createButtonLink}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 shadow-sm transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create New Course</span>
            </Link>
          </motion.div>
        )}
      </div>
      
      {courses && courses.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {courses.map((course) => (
            <motion.div key={course.id || course._id} variants={itemVariants}>
              <CourseCard course={course} path={path} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
          
          {showCreateButton && (
            <Link 
              to={createButtonLink}
              className="inline-flex items-center space-x-2 mt-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create your first course</span>
            </Link>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CourseGrid;
