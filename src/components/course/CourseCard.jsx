
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Star, BookOpen, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTourLMS } from '../../contexts/TourLMSContext';
import { enrollInCourse } from '../../api/courseService';
import { clg, ocn, parse } from '../../lib/basic';
import { image_01, image_02 } from '../../js/Data';

const CourseCard = ({ course, path = 'course' }) => {
  // Determine if it's a featured course
  const isFeatured = course.featured;
  const {user,enrolledCourses}=useTourLMS();
  const [isEnrolled,setIsEnrolled]=useState(false);
  const [progress,setProgress]=useState(0);

  useEffect(()=>{
    if(!isEnrolled&&ocn(user)&&course.enrolledStudents.find(stu=>stu==user.id)){
      const Course=enrolledCourses.find(crs=>crs.key==course.key);
      if(Course)setProgress(parse(Course.progress));
      setIsEnrolled(true);

    }

  },[user])
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link 
        to={`/student/${path}/${course.key}`}
        className="block h-full"
      >
        <div className="relative h-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700 flex flex-col">
          {/* Course Image with Overlay */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={course.thumbnail || image_02}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-lg line-clamp-2">{course.title}</h3>
            </div>
            
            {/* Category Badge */}
            <Badge className="absolute top-3 right-3 text-xs bg-yellow-600 hover:bg-red-700">
              {course.category || 'AI Learning'}
            </Badge>
            
            {/* Featured Badge */}
            {isFeatured && (
              <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-medium px-2 py-1 rounded-md flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </div>
            )}
          </div>
          
          {/* Course Info */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
              {course.shortDescription || 'Learn advanced AI concepts with practical applications focused on African innovation.'}
            </div>
            
            {/* Course Stats */}
            <div className="mt-auto grid grid-cols-2 gap-2">
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{course.duration || '8 weeks'}</span>
              </div>
              
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 justify-end">
                <Users className="h-3.5 w-3.5 mr-1" />
                <span>{ocn(course.enrolledStudents)} students</span>
              </div>
              
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                <span>{course.level || 'Intermediate'}</span>
              </div>
              
              <div className="flex items-center text-xs text-amber-500 justify-end">
                <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                <span>{course.rating || '0'}</span>
              </div>
            </div>
            
            {/* Bottom Action Area with Gradient */}
            <div className={`mt-4 -mx-4 -mb-4 p-3 bg-gradient-to-r ${isEnrolled?"from-green-100":"from-red-50"} to-slate-50 dark:from-red-900/20 dark:to-slate-800/50 border-t border-slate-200 dark:border-slate-700`}>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isEnrolled?progress>50?'text-green-700':'text-slate-600':"text-slate-900"} dark:text-white`}>
                  {isEnrolled?`${progress}% complete`:course.price ? `${course.price}` : 'Free'}
                </span>
                <span className={`text-xs ${isEnrolled?"text-green-700":"text-red-600"} dark:text-red-400 font-medium`}>
                  {isEnrolled?"Continue":"View Details"} →
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
