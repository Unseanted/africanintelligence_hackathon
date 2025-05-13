
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  BookOpen,
  BarChart,
  FileText,
  MessageSquare,
  Bell,
  Briefcase,
  Award,
  FileEdit,
  UserPlus,
  Cpu,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useIsMobile } from '@/hooks/use-mobile';

const adminLinks = [
  { to: "/admin", icon: Home, label: "Dashboard", color: "text-blue-500" },
  { to: "/admin/students", icon: Users, label: "Students", color: "text-violet-500" },
  { to: "/admin/facilitators", icon: Users, label: "Facilitators", color: "text-indigo-500" },
  { to: "/admin/courses", icon: BookOpen, label: "Courses", color: "text-green-500" },
  { to: "/admin/analytics", icon: BarChart, label: "Analytics", color: "text-amber-500" },
  { to: "/admin/reports", icon: FileText, label: "Reports", color: "text-orange-500" },
];

const facilitatorLinks = [
  { to: "/facilitator", icon: Home, label: "Dashboard", color: "text-blue-500" },
  { to: "/facilitator/courses", icon: BookOpen, label: "Courses", color: "text-green-500" },
  { to: "/facilitator/drafts", icon: FileEdit, label: "Draft Courses", color: "text-amber-500" },
  { to: "/facilitator/students", icon: Users, label: "Students", color: "text-violet-500" },
  { to: "/facilitator/analytics", icon: BarChart, label: "Analytics", color: "text-pink-500" },
  { to: "/facilitator/forum", icon: MessageSquare, label: "Forum", color: "text-indigo-500" },
  { to: "/facilitator/messages", icon: MessageSquare, label: "Messages", color: "text-emerald-500" },
  { to: "/facilitator/certificates", icon: Award, label: "Certificates", color: "text-amber-500" },
];

const studentLinks = [
  { to: "/student", icon: Home, label: "Dashboard", color: "text-blue-500" },
  { to: "/student/courses", icon: BookOpen, label: "Courses", color: "text-green-500" },
  { to: "/student/forum", icon: MessageSquare, label: "Forum", color: "text-indigo-500" },
  { to: "/student/friends", icon: UserPlus, label: "Friends", color: "text-violet-500" },
  { to: "/student/messages", icon: MessageSquare, label: "Messages", color: "text-emerald-500" },
  { to: "/student/jobs", icon: Briefcase, label: "Job Board", color: "text-amber-500" },
  { to: "/student/certificates", icon: Award, label: "Certificates", color: "text-pink-500" },
  { to: "/student/notifications", icon: Bell, label: "Notifications", color: "text-orange-500" },
];

const sidebarVariants = {
  open: { 
    x: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    } 
  },
  closed: { 
    x: '-100%',
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    } 
  }
};

const Sidebar = ({ userType, isOpen }) => {
  const links = {
    admin: adminLinks,
    facilitator: facilitatorLinks,
    student: studentLinks,
  }[userType];

  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay for mobile that closes sidebar when clicked */}
          {isMobile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
              onClick={() => document.dispatchEvent(new CustomEvent('toggle-sidebar'))}
            />
          )}
          
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={cn(
              "fixed z-40 h-screen shadow-xl",
              isMobile ? "w-[240px]" : "w-64 lg:relative"
            )}
          >
            <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden rounded-r-xl">
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center"
                >
                  <GraduationCap className="h-6 w-6 text-red-500" />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-2 font-bold text-red-500 transition-all duration-300"
                  >
                    AFRICAN INT.
                  </motion.span>
                </motion.div>
              </div>
              
              <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200",
                        "hover:bg-white/10 group relative overflow-hidden",
                        isActive
                          ? "bg-red-900/30 text-red-400 font-medium"
                          : "text-slate-300"
                      )
                    }
                  >
                    <span className={`relative z-10 ${link.color}`}>
                      <link.icon className="h-5 w-5" />
                    </span>
                    
                    <span className="relative z-10">{link.label}</span>
                    
                    {/* Gradient hover effect */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-slate-800/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                      initial={false}
                      transition={{ duration: 0.3 }}
                    />
                  </NavLink>
                ))}
              </nav>
              
              <div className="mt-auto p-4 border-t border-slate-700/50 text-xs text-slate-400 text-center">
                <p>AFRICAN INTELLIGENCE</p>
                <p className="mt-1">Empowering Africa through AI</p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
