
import { useState, useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  User, 
  ChevronDown, 
  Hotel, 
  MapPin, 
  Bell, 
  Search, 
  LogOut, 
  Settings,
  Shield,
  MessageSquare,
  X,
  BookOpen
} from "lucide-react";
import Sidebar from "./Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { clg, ocn } from '@/lib/basic';
import SearchBar from "@/components/layout/SearchBar";

interface LayoutProps {
  userType: "admin" | "facilitator" | "student";
}

const Layout = ({ userType }: LayoutProps) => {
  const { logout } = useAuth();
  const { user } = useTourLMS();
  const { isSidebarOpen, toggleSidebar } = useNavigation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!ocn(user)) {
    navigate("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    navigate("/login");
  };

  const notifications = [
    { id: 1, text: "New course content available", time: "5 minutes ago" },
    { id: 2, text: "Your assignment was graded", time: "2 hours ago" },
    { id: 3, text: "New forum post in your course", time: "Yesterday" },
  ];

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user && user.role) {
      navigate(`/${user.role === 'admin' ? 'admin' : user.role === 'facilitator' ? 'facilitator' : 'student'}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <Sidebar userType={userType} isOpen={isSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header 
          className={`z-30 fixed top-0 left-0 right-0 ${
            isScrolled 
              ? "bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-sm" 
              : "bg-white dark:bg-slate-800"
          } transition-all duration-200`}
        >
          <div className="h-16 flex items-center px-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="mr-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen && isMobile ? <X className="h-5 w-5 text-slate-600 dark:text-slate-200" /> : <Menu className="h-5 w-5 text-slate-600 dark:text-slate-200" />}
            </motion.button>
            
            <Link to="#" onClick={handleLogoClick} className="flex items-center">
              <motion.div
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Hotel className="h-6 w-6 text-red-600" />
              </motion.div>
              <span className="font-semibold text-slate-800 dark:text-white hidden md:inline ml-2">AFRICAN INTELLIGENCE</span>
            </Link>
            
            <div className="flex-1 mx-4 md:mx-12 relative max-w-md">
              {showSearch ? (
                <SearchBar onClose={() => setShowSearch(false)} />
              ) : (
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="text-slate-400 dark:text-slate-500 h-4 w-4 mr-2" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Search courses, topics, or resources...</span>
                </div>
              )}
            </div>
            
            <div className="hidden md:flex items-center mr-6 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4 text-red-500 mr-1" />
              <span>Plateau State, Nigeria</span>
            </div>

            {/* Notifications */}
            <div className="relative mr-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </motion.button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden z-50 border border-slate-200 dark:border-slate-700"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className="p-3 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                        >
                          <p className="text-sm font-medium text-slate-800 dark:text-white">{notification.text}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 text-center border-t border-slate-200 dark:border-slate-700">
                      <button className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                  <Avatar className="h-8 w-8 border-2 border-red-100 dark:border-red-900/30">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} />
                    <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium text-slate-800 dark:text-white">{user.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{user.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-red-500" />
                    {user.role} Account
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/${userType}/account`)}>
                  <User className="h-4 w-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/${userType}/courses`)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Courses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/${userType}/messages`)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/${userType}/security`)}>
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6 mt-16">
          <Outlet />
        </main>
        
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-4 px-4">
          <div className="container mx-auto text-center text-sm text-slate-600 dark:text-slate-400">
            <p>© {new Date().getFullYear()} African Intelligence LMS. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
