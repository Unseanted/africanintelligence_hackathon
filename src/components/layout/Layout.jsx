import { Outlet, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useTourLMS } from "../../contexts/TourLMSContext";
import { useNavigation } from "../../contexts/NavigationContext";
import { Button } from "@/components/ui/button";
import { 
  Menu, User, ChevronDown, GraduationCap, MapPin, Bell, Search, X, Shield, MessageSquare, LogOut, Sun, Moon
} from "lucide-react";
import NewSidebar from "./NewSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { clg, jp, ocn } from "../../lib/basic";
import { useIsMobile } from "@/hooks/use-mobile";
import { initializeNotifications, requestNotificationPermission } from "@/api/notificationService";
import AIChatbot from "@/components/ai/AIChatbot";

// Required env: VITE_AVATAR_URL
const AVATAR_URL = import.meta.env.VITE_AVATAR_URL || 'https://ui-avatars.com/api/';

let ison=false;
const Layout = ({ userType }) => {
  const { user, token, setToken, setUser, logout, packLoad, CoursesHub } = useTourLMS();
  const { isSidebarOpen, toggleSidebar } = useNavigation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [location, setLocation] = useState("Fetching location...");
  const {theme, setTheme} = useTourLMS();
  const searchRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!ocn(user)) {
      let x = localStorage.getItem('token'),
          y = localStorage.getItem('user');
      if (x) setToken(x);
      if (y) setUser(jp(y));
      if (x && y) packLoad(jp(y), x);
    }

    const handleToggleSidebar = () => {
      toggleSidebar();
    };

    document.addEventListener('toggle-sidebar', handleToggleSidebar);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);

    const setupNotifications = async () => {
      if (user) {
        const permission = await requestNotificationPermission();
        if (permission) {
          const serviceWorkerReg = await initializeNotifications();
          console.log("Push notifications initialized:", serviceWorkerReg);
        }
      }
    };
    
    setupNotifications();

    setNotifications([
      { id: 1, text: "New course content available", time: "5 minutes ago" },
      { id: 2, text: "Your assignment was graded", time: "2 hours ago" },
      { id: 3, text: "New forum post in your course", time: "Yesterday" },
    ]);

    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);

    const fetchLocation = async () => {
      
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              const userLocation = `${data.address.city || data.address.town || data.address.state?.split(' ')[0] || 'Unknown City'}, ${data.address.country}`;
              setLocation(userLocation);
              
            } catch (error) {
              console.error("Error with reverse geocoding:", error);
              await fetchIPLocation();
            }
          },
          async (error) => {
            console.error("Geolocation error:", error);
            await fetchIPLocation();
          },
          { timeout: 10000, maximumAge: 60000 } // 10-second timeout, 1-minute cache
        );
      } else {
        await fetchIPLocation();
      }
    };

    const fetchIPLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const userLocation = `${data.city || 'Unknown City'}, ${data.country_name || 'Unknown Country'}`;
        setLocation(userLocation);
        localStorage.setItem('userLocation', userLocation);
        localStorage.setItem('locationTimestamp', Date.now().toString());
      } catch (error) {
        console.error("IP geolocation error:", error);
        setLocation("Unknown Location");
      }
    };

    fetchLocation();

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);

    return () => {
      document.removeEventListener('toggle-sidebar', handleToggleSidebar);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user, theme, setToken, setUser, packLoad, toggleSidebar, navigate, CoursesHub]);

  useEffect(() => {
    if (searchTerm.length > 1 && CoursesHub && CoursesHub.length > 0) {
      const filteredResults = CoursesHub.filter(course => 
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      
      setSearchResults(filteredResults);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm, CoursesHub]);

  const handleNavigateToCourse = (courseId) => {
    setShowSearchResults(false);
    setSearchTerm('');
    navigate(`/student/courses/${courseId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  useEffect(()=>{
    if(ison)return;ison=true;toggleSidebar();
  },[])
  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-slate-50 to-slate-100' : 'bg-gradient-to-br from-slate-900 via-amber-500/10 to-slate-800'} flex`}>
      <NewSidebar 
        userType={userType} 
        isOpen={isSidebarOpen} 
        onClose={toggleSidebar} 
        theme={theme}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header 
          className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 shadow-lg backdrop-blur-md ${
            scrolled 
              ? `${theme === 'light' ? 'bg-gradient-to-r from-white via-amber-100/30 to-slate-100' : 'bg-gradient-to-r from-slate-900 via-amber-500/10 to-slate-800'}`
              : `${theme === 'light' ? 'bg-gradient-to-r from-white via-amber-100/30 to-slate-100' : 'bg-gradient-to-r from-slate-900 via-amber-500/10 to-slate-800'}`
          }`}
        >
          <div className="h-16 flex items-center px-4 justify-between sm:px-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="mr-2 p-2 rounded-full hover:bg-amber-100/30 dark:hover:bg-amber-500/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
              aria-label="Toggle sidebar"
            >
              <Menu className={`h-5 w-5 ${theme === 'light' ? 'text-amber-600' : 'text-gold-300'}`} />
            </motion.button>
            
            {!(isMobile&&searchTerm)&&(<Link 
              to={user ? `/${userType}` : "/"}
              className="flex items-center"
            >
              <motion.div
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <GraduationCap className={`h-6 w-6 ${theme === 'light' ? 'text-amber-600' : 'text-gold-300'}`} />
              </motion.div>
              <span className={`font-semibold hidden md:inline ml-2 text-amber-600`}>
                AFRICAN INTELLIGENCE
              </span>
            </Link>)}
            
            <div className="flex-1 mx-2 md:mx-8 relative max-w-md" ref={searchRef}>
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${theme === 'light' ? 'text-amber-500' : 'text-gold-400'}`} />
              <input 
                type="search" 
                placeholder="Search courses, topics, or resources..." 
                className={`w-full pl-10 pr-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 transition-all ${
                  theme === 'light' 
                    ? 'border-amber-200 bg-amber-50/50 focus:ring-amber-500 text-slate-800 placeholder-amber-500' 
                    : 'border-slate-700 bg-slate-800 focus:ring-gold-300 text-gold-300 placeholder-amber-400'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
              />
              
              {showSearchResults && searchResults.length > 0 && (
                <div className={`absolute left-0 right-0 mt-2 rounded-xl shadow-lg border overflow-hidden z-20 ${
                  theme === 'light' ? 'bg-white border-amber-200' : 'bg-slate-800 border-slate-700'
                }`}>
                  <div className={`p-2 border-b ${theme === 'light' ? 'border-amber-200' : 'border-slate-700'}`}>
                    <p className={`text-xs ${theme === 'light' ? 'text-amber-500' : 'text-gold-400'}`}>Search Results</p>
                  </div>
                  {searchResults.map(course => (
                    <div 
                      key={course._id} 
                      className={`p-3 hover:bg-opacity-10 cursor-pointer border-b last:border-0 ${
                        theme === 'light' 
                          ? 'hover:bg-amber-100/30 border-amber-200 text-slate-800' 
                          : 'hover:bg-gold-300/10 border-slate-700 text-gold-300'
                      }`}
                      onClick={() => handleNavigateToCourse(course._id)}
                    >
                      <p className="font-medium">{course.title}</p>
                      <p className={`text-xs line-clamp-1 ${theme === 'light' ? 'text-amber-500' : 'text-gold-400'}`}>
                        {course.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {!(isMobile&&searchTerm)&&(<div className={`flex items-center mr-4 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-gold-400'}`}>
              <MapPin className={`h-4 w-4 mr-1 ${theme === 'light' ? 'text-amber-600' : 'text-gold-300'}`} />
              <span>{location}</span>
            </div>)}

            {!isMobile && (
              <div className="relative mr-4">
                {/* <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="relative p-2 rounded-full hover:bg-amber-100/30 dark:hover:bg-amber-500/10 transition-colors"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className={`h-5 w-5 ${theme === 'light' ? 'text-amber-600' : 'text-gold-300'}`} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </motion.button> */}
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl overflow-hidden z-50 border ${
                        theme === 'light' ? 'bg-white border-amber-200' : 'bg-slate-800 border-slate-700'
                      }`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className={`p-3 border-b ${theme === 'light' ? 'border-amber-200' : 'border-gold-300/20'}`}>
                        <h3 className={`font-semibold ${theme === 'light' ? 'text-amber-600' : 'text-gold-300'}`}>
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`p-3 border-b hover:bg-opacity-10 cursor-pointer transition-colors ${
                              theme === 'light' 
                                ? 'border-amber-200 hover:bg-amber-100/30 text-slate-800' 
                                : 'border-slate-700 hover:bg-gold-300/10 text-gold-300'
                            }`}
                          >
                            <p className="text-sm font-medium">{notification.text}</p>
                            <p className={`text-xs mt-1 ${theme === 'light' ? 'text-amber-500' : 'text-gold-400'}`}>
                              {notification.time}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className={`p-2 text-center border-t ${theme === 'light' ? 'border-amber-200' : 'border-slate-700'}`}>
                        <button className={`text-sm transition-colors ${
                          theme === 'light' 
                            ? 'text-amber-600 hover:text-amber-800' 
                            : 'text-gold-300 hover:text-gold-200'
                        }`}>
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!isMobile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="mr-4 p-2 rounded-full hover:bg-amber-100/30 dark:hover:bg-amber-500/10 transition-colors"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-amber-600" />
                ) : (
                  <Sun className="h-5 w-5 text-gold-300" />
                )}
              </motion.button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                  <Avatar className={`h-8 w-8 border-2 ${theme === 'light' ? 'border-amber-100' : 'border-gold-300/30'}`}>
                    <AvatarImage src={user?.profilePicture ? user?.profilePicture : `${AVATAR_URL}?name=User&background=random`} />
                    <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm hidden md:flex">
                    <span className={`font-medium ${theme === 'light' ? 'text-amber-600' : 'text-gold-300'}`}>
                      {user?.name || 'Guest'}
                    </span>
                    <span className={`text-xs capitalize ${theme === 'light' ? 'text-amber-500' : 'text-gold-400'}`}>
                      {user?.role || 'Sign In'}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 ${theme === 'light' ? 'text-amber-500' : 'text-gold-400'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-56 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
                {user ? (
                  <>
                    <div className="p-2">
                      <p className={`text-sm font-medium ${theme === 'light' ? 'text-amber-600' : 'text-gold-300'}`}>
                        {user?.email}
                      </p>
                      <p className={`text-xs capitalize flex items-center ${theme === 'light' ? 'text-amber-500' : 'text-gold-400'}`}>
                        <Shield className={`h-4 w-4 mr-2 ${theme === 'light' ? 'text-amber-600' : 'text-gold-300'}`} />
                        {user?.role} Account
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/${userType}/account`)}>
                      <User className="h-4 w-4 mr-2" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/${userType}/messages`)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/${userType}/security`)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Security
                    </DropdownMenuItem>
                    {isMobile && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowNotifications(!showNotifications)}>
                          <Bell className="h-4 w-4 mr-2" />
                          Notifications
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {notifications.length}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={toggleTheme}>
                          {theme === 'light' ? (
                            <Moon className="h-4 w-4 mr-2" />
                          ) : (
                            <Sun className="h-4 w-4 mr-2" />
                          )}
                          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className={`focus:bg-opacity-20 ${
                        theme === 'light' 
                          ? 'text-amber-600 focus:text-amber-600 focus:bg-amber-100/30' 
                          : 'text-gold-300 focus:text-gold-200 focus:bg-gold-300/20'
                      }`}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/login')}>
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/register')}>
                      <User className="h-4 w-4 mr-2" />
                      Register
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6 pt-20 mt-8">
          <Outlet />
          {userType === 'student' && <AIChatbot />}
        </main>
        
        <footer className={`border-t py-4 px-4 ${
          theme === 'light' ? 'bg-white border-amber-200 text-amber-600' : 'bg-slate-800 border-slate-700 text-gold-400'
        }`}>
          <div className="container mx-auto text-center text-sm">
            <p>© {new Date().getFullYear()} African Intelligence. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;