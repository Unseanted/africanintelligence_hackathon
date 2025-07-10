import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Sparkles, 
  BrainCircuit, 
  Globe, 
  Network, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  BookOpen, 
  Award 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { image_01, image_02 } from '../js/Data';
import { useTourLMS } from "../contexts/TourLMSContext";

// Required env: VITE_UNSPLASH_URL
const UNSPLASH_URL = import.meta.env.VITE_UNSPLASH_URL || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2784&q=80';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Skeleton Loader Component for Courses
const CourseSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-amber-200 dark:border-gold-300/20 animate-pulse">
    <div className="aspect-video bg-slate-200 dark:bg-slate-700 relative">
      <div className="absolute top-3 left-3 bg-slate-300 dark:bg-slate-600 h-6 w-20 rounded-md"></div>
      <div className="absolute top-3 right-3 bg-slate-300 dark:bg-slate-600 h-6 w-16 rounded-md"></div>
    </div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
    </div>
  </div>
);

const partners = [
  'Microsoft Africa', 'Google AI', 'African Development Bank', 'UNESCO', 'UNICEF', 'IBM Research Africa'
];

const Index = () => {
  const { user, API_URL } = useTourLMS();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_URL}/courses/latest`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please log in to view courses');
          }
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        console.log('temp courses --- ', data);
        setCourses(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    setTheme(localStorage.getItem('theme') || 'light');
    const handleStorageChange = () => {
      setTheme(localStorage.getItem('theme') || 'light');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-amber-50/50' : 'bg-slate-900'}`}>
      {/* Hero Section */}
      <section className={`relative overflow-hidden ${theme === 'light' ? 'bg-gradient-to-br from-white via-amber-100/30 to-slate-100' : 'bg-gradient-to-br from-slate-900 via-amber-500/10 to-slate-800'} text-white`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke={`${theme === 'light' ? '#F59E0B' : '#FFD700'}`} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.div variants={fadeInUp} className={`inline-flex items-center gap-2 rounded-full ${theme === 'light' ? 'bg-amber-100/50 text-amber-800' : 'bg-gold-300/10 text-amber-500'} backdrop-blur-sm px-4 py-1.5 text-sm font-medium mb-2`}>
                <Sparkles className={`h-4 w-4 ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'}`} />
                <span>Taking African Education from 0 to 100</span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${theme === 'light' ? 'text-amber-800' : 'text-amber-100'}`}>
                African Intelligence <br/>
                <span className={`${theme === 'light' ? 'text-amber-600' : 'text-amber-500'}`}>Learning Management System</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className={`text-lg md:text-xl ${theme === 'light' ? 'text-slate-600' : 'text-gold-400'} max-w-xl`}>
                Empowering Africa with AI-driven education, making difficult courses accessible and providing structured learning paths with expert facilitators.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" asChild className={`${theme === 'light' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'} rounded-full px-8`}>
                  <Link to="/register">Join Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className={`${theme === 'light' ? 'bg-transparent hover:bg-amber-100/30 text-amber-600 border-amber-500' : 'bg-transparent hover:bg-amber-500/10 text-amber-500 border-gold-300/20'} rounded-full px-8`}>
                  <Link to="/login">Sign In</Link>
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${theme === 'light' ? 'from-amber-600 to-amber-800' : 'from-amber-500 to-amber-700'} rounded-xl blur opacity-30`}></div>
                <img 
                  src={image_01} 
                  alt="African students learning with AI"
                  className={`relative rounded-xl shadow-2xl border ${theme === 'light' ? 'border-amber-200' : 'border-gold-300/20'} bg-slate-800 w-full`}
                />
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Curved divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className={`fill-${theme === 'light' ? 'amber-50/50' : 'slate-900'}`}>
            <path d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      {/* Features Section */}
      <section className={`py-20 ${theme === 'light' ? 'bg-amber-50/50' : 'bg-slate-800/50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'} mb-6`}>
              Powered by AI, Built for Africa
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-600' : 'text-white'}`}>
              We leverage cutting-edge AI technologies to make learning accessible, 
              personalized, and effective for students across the African continent.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BrainCircuit className={`h-10 w-10 ${theme === 'light' ? 'text-amber-600' : 'text-amber-100'}`} />,
                title: "AI-Powered Learning",
                description: "Personalized learning paths adapted to your pace and learning style using advanced AI algorithms."
              },
              {
                icon: <Globe className={`h-10 w-10 ${theme === 'light' ? 'text-amber-600' : 'text-amber-100'}`} />,
                title: "African-Centric Content",
                description: "Courses designed specifically to address African challenges and opportunities."
              },
              {
                icon: <Network className={`h-10 w-10 ${theme === 'light' ? 'text-amber-600' : 'text-amber-100'}`} />,
                title: "Expert Facilitators",
                description: "Learn from top African experts in technology, business, and innovation."
              },
              {
                icon: <Users className={`h-10 w-10 ${theme === 'light' ? 'text-amber-600' : 'text-amber-100'}`} />,
                title: "Collaborative Learning",
                description: "Connect with peers across the continent to solve problems together."
              },
              {
                icon: <BookOpen className={`h-10 w-10 ${theme === 'light' ? 'text-amber-600' : 'text-amber-100'}`} />,
                title: "Structured Modules",
                description: "Well-designed course modules that break down complex concepts into manageable units."
              },
              {
                icon: <Award className={`h-10 w-10 ${theme === 'light' ? 'text-amber-600' : 'text-amber-100'}`} />,
                title: "Recognized Certification",
                description: "Earn certificates that are recognized by employers across Africa and beyond."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-8 rounded-xl shadow-sm border ${theme === 'light' ? 'bg-white border-amber-200 hover:bg-amber-100/10' : 'bg-slate-800 border-gold-300/20 hover:bg-amber-500/10'} hover:shadow-lg transition-all`}
              >
                <div className={`mb-4 ${theme === 'light' ? 'bg-amber-100/50' : 'bg-gold-300/10'} p-3 rounded-lg inline-block`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'} mb-3`}>{feature.title}</h3>
                <p className={`${theme === 'light' ? 'text-slate-600' : 'text-white'}`}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Courses */}
      <section className={`py-20 ${theme === 'light' ? 'bg-amber-50/50' : 'bg-slate-800/50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'} mb-6`}>
              Featured Courses
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-600' : 'text-white'}`}>
              Explore our most recent AI and technology courses designed 
              specifically for African learners.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <CourseSkeleton key={index} />
              ))
            ) : error ? (
              <div className={`col-span-full text-center ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'}`}>
                <p>{error}</p>
                {error.includes('log in') && (
                  <p>
                    <Link to="/login" className={`${theme === 'light' ? 'text-amber-600 hover:text-amber-700' : 'text-amber-500 hover:text-gold-200'}`}>
                      Log in here
                    </Link>
                  </p>
                )}
              </div>
            ) : courses.length === 0 ? (
              <div className={`col-span-full text-center ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'}`}>
                <p>No courses available at the moment.</p>
              </div>
            ) : (
              courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`rounded-xl overflow-hidden shadow-sm border ${theme === 'light' ? 'bg-white border-amber-200 hover:bg-amber-100/10' : 'bg-slate-800 border-gold-300/20 hover:bg-amber-500/10'} hover:shadow-lg transition-all group`}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={course.thumbnail || UNSPLASH_URL} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute top-3 left-3 ${theme === 'light' ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white'} text-xs font-medium px-2 py-1 rounded-md`}>
                      {course.category || 'AI & Machine Learning'}
                    </div>
                    <div className={`absolute top-3 right-3 ${theme === 'light' ? 'bg-amber-100/50 text-amber-800' : 'bg-gold-300/10 text-amber-500'} backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-md`}>
                      {course.level || 'Beginner'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'} mb-2 line-clamp-2`}>
                      {course.title}
                    </h3>
                    <p className={`mb-4 line-clamp-2 ${theme === 'light' ? 'text-slate-600' : 'text-white'}`}>
                      {course.description}
                    </p>
                    <Link 
                      to={`/student/courses/${course.courseId || course._id}`} 
                      className={`inline-flex items-center font-medium ${theme === 'light' ? 'text-amber-600 hover:text-amber-700' : 'text-amber-500 hover:text-gold-200'}`}
                    >
                      Explore Course <ArrowRight className={`ml-2 h-4 w-4 ${theme === 'light' ? 'text-amber-600' : 'text-amber-500'}`} />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <Link 
              to="/student/courses" 
              className={`inline-flex items-center ${theme === 'light' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'} px-6 py-3 rounded-full font-medium transition-colors`}
            >
              View All Courses <ArrowRight className={`ml-2 h-4 w-4 ${theme === 'light' ? 'text-white' : 'text-white'}`} />
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className={`py-20 ${theme === 'light' ? 'bg-gradient-to-r from-amber-600 to-amber-800' : 'bg-gradient-to-r from-amber-500 to-amber-700'} text-white`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === 'light' ? 'text-white' : 'text-white'}`}>
                Ready to Transform Your Learning Journey?
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Access to cutting-edge AI learning tools",
                  "Community of peers and mentors across Africa",
                  "Learn at your own pace with flexible schedules",
                  "Practical skills that solve real African challenges"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className={`h-6 w-6 ${theme === 'light' ? 'text-white' : 'text-amber-500'} mr-2 flex-shrink-0`} />
                    <span className={`${theme === 'light' ? 'text-white' : 'text-white'}`}>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className={`${theme === 'light' ? 'bg-white text-amber-600 hover:bg-amber-100' : 'bg-slate-900 text-amber-500 hover:bg-slate-800'} rounded-full px-8`}>
                  <Link to="/register">Join Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className={`${theme === 'light' ? 'bg-transparent hover:bg-amber-100/20 text-white border-white' : 'bg-transparent hover:bg-amber-500/10 text-amber-500 border-gold-300/20'} rounded-full px-8`}>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative hidden lg:block"
            >
              <div className={`rounded-xl overflow-hidden shadow-2xl border-2 ${theme === 'light' ? 'border-amber-200' : 'border-gold-300/20'}`}>
                <img 
                  src={image_02} 
                  alt="Students collaborating"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`absolute -left-8 -bottom-8 ${theme === 'light' ? 'bg-amber-100/50' : 'bg-gold-300/10'} backdrop-blur-md rounded-xl p-6 border ${theme === 'light' ? 'border-amber-200' : 'border-gold-300/20'} shadow-xl`}>
                <div className="flex items-center space-x-4">
                  <GraduationCap className={`h-12 w-12 ${theme === 'light' ? 'text-amber-600' : 'text-amber-500'}`} />
                  <div>
                    <div className={`text-xl font-bold ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'}`}>10,000,000+</div>
                    <div className={`text-sm ${theme === 'light' ? 'text-amber-100' : 'text-white'}`}>Targeting Students Across Africa</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Partners */}
      <section className={`py-16 ${theme === 'light' ? 'bg-amber-50/50' : 'bg-slate-900'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'}`}>
              Trusted by Leading Organizations
            </h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {partners.map((partner, index) => (
              <div key={index} className={`font-medium ${theme === 'light' ? 'text-amber-600' : 'text-white'}`}>
                {partner}
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className={`pt-16 pb-8 ${theme === 'light' ? 'bg-amber-100/50' : 'bg-slate-900'} ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-4">
                <GraduationCap className={`h-8 w-8 ${theme === 'light' ? 'text-amber-600' : 'text-amber-500'} mr-2`} />
                <span className={`text-xl font-bold ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'}`}>AFRICAN INT.</span>
              </div>
              <p className={`${theme === 'light' ? 'text-amber-600' : 'text-white'} mb-4`}>
                Empowering Africa through AI-driven education and innovative learning solutions.
              </p>
            </div>
            
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'}`}>Quick Links</h3>
              <ul className="space-y-2">
                {['Courses', 'About Us', 'Facilitators', 'Testimonials', 'Contact'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className={`${theme === 'light' ? 'text-amber-600 hover:text-amber-700' : 'text-white hover:text-amber-500'} transition-colors`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'}`}>Resources</h3>
              <ul className="space-y-2">
                {['Blog', 'Webinars', 'Research Papers', 'AI Tools', 'Community Forum'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className={`${theme === 'light' ? 'text-amber-600 hover:text-amber-700' : 'text-white hover:text-amber-500'} transition-colors`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-amber-800' : 'text-amber-500'}`}>Stay Connected</h3>
              <p className={`${theme === 'light' ? 'text-amber-600' : 'text-white'} mb-4`}>
                Subscribe to our newsletter for updates on new courses and AI innovations.
              </p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className={`px-4 py-2 ${theme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-800 placeholder-amber-600' : 'bg-slate-800 border-slate-700 text-amber-500 placeholder-gold-400'} border rounded-l-md focus:outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-amber-500' : 'focus:ring-gold-300'} w-full`}
                />
                <button className={`${theme === 'light' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'} px-4 rounded-r-md transition-colors text-white`}>
                  →
                </button>
              </div>
            </div>
          </div>
          
          <div className={`border-t ${theme === 'light' ? 'border-amber-200' : 'border-slate-800'} pt-8 text-center ${theme === 'light' ? 'text-amber-600' : 'text-white'} text-sm`}>
            <p>© {new Date().getFullYear()} African Intelligence. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;