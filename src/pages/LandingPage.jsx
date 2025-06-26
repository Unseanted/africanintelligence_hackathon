// Required env: VITE_UNSPLASH_URL
const UNSPLASH_URL = import.meta.env.VITE_UNSPLASH_URL || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, Star } from 'lucide-react';
import { useTourLMS } from '@/contexts/TourLMSContext';

const LandingPage = () => {
  const { CoursesHub } = useTourLMS();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (CoursesHub && CoursesHub.length > 0) {
      // Get up to 6 published courses with highest enrollment or rating
      const published = CoursesHub.filter(course => course.status === 'published');
      const sorted = [...published].sort((a, b) => {
        // Sort by enrollment count first, then by rating
        if ((b.enrolled || 0) !== (a.enrolled || 0)) {
          return (b.enrolled || 0) - (a.enrolled || 0);
        }
        return (b.rating || 0) - (a.rating || 0);
      });
      
      setFeaturedCourses(sorted.slice(0, 6));
      setLoading(false);
    }
  }, [CoursesHub]);

  const CourseCard = ({ course }) => (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-video overflow-hidden">
        <img 
          src={course.thumbnail || UNSPLASH_URL} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex gap-2">
          <Badge variant="outline">{course.level || "Beginner"}</Badge>
          <Badge variant="outline">{course.category || "General"}</Badge>
        </div>
        <h3 className="text-lg font-bold line-clamp-2 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>
        <div className="flex text-sm text-gray-500 gap-3">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{course.enrolled || 0}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{course.duration || "Self-paced"}</span>
          </div>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 mr-1 fill-current" />
            <span>{course.rating || "New"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link to={`/course/${course._id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );

  const CourseSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4">
        <div className="mb-2 flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-3 mt-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Learn. Connect. Grow.</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Discover courses designed to enhance your skills and advance your career
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="default" className="bg-white text-red-600 hover:bg-gray-100">
              <Link to="/explore-courses">Explore Courses</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/register">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our most popular and highly-rated courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Show skeletons while loading
              Array(6).fill().map((_, index) => (
                <CourseSkeleton key={index} />
              ))
            ) : featuredCourses.length > 0 ? (
              // Show courses if available
              featuredCourses.map(course => (
                <CourseCard key={course._id} course={course} />
              ))
            ) : (
              // Fallback if no courses are available
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium mb-2">No courses available yet</h3>
                <p className="text-gray-600">Check back soon for new courses!</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link to="/explore-courses">View All Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Learn With Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform offers a unique learning experience designed for your growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg shadow-sm border border-gray-100 bg-white">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert-Led Content</h3>
              <p className="text-gray-600">
                Learn from industry leaders with real-world experience and in-depth knowledge
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg shadow-sm border border-gray-100 bg-white">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Learning</h3>
              <p className="text-gray-600">
                Connect with fellow learners, share experiences, and collaborate on projects
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg shadow-sm border border-gray-100 bg-white">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Certificates</h3>
              <p className="text-gray-600">
                Earn recognized certificates to showcase your new skills and achievements
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 max-w-xl mx-auto">
            Join thousands of students already learning on our platform
          </p>
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
            <Link to="/register">Get Started For Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
