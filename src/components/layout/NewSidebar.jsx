import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
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
  Trophy,
  Star,
  FileEdit,
  UserPlus,
  Cpu,
  Calendar,
  GraduationCap,
  X,
  FileCode
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { to: '/facilitator/apiDocs',label: 'API Documentation', icon: FileCode, color: "text-indigo-500" },
  // { to: "/facilitator/analytics", icon: BarChart, label: "Analytics", color: "text-pink-500" },
  // { to: "/facilitator/forum", icon: MessageSquare, label: "Forum", color: "text-indigo-500" },
  // { to: "/facilitator/messages", icon: MessageSquare, label: "Messages", color: "text-emerald-500" },
  // { to: "/facilitator/certificates", icon: Award, label: "Certificates", color: "text-amber-500" },
];

const studentLinks = [
  { to: "/student", icon: Home, label: "Dashboard", color: "text-blue-500" },
  { to: "/student/courses", icon: BookOpen, label: "Courses", color: "text-green-500" },
  { to: "/student/forum", icon: MessageSquare, label: "Forum", color: "text-indigo-500" },
  { to: "/student/events", icon: Calendar, label: "Events", color: "text-indigo-500" },
  { to: '/student/apiDocs', icon: FileCode,label: 'API Documentation', color: "text-indigo-500" },
  { to: "/student/leaderboard", icon: Trophy, label: "Leaderboard", color: "text-amber-500" },
  { to: "/student/badges", icon: Star, label: "Badges", color: "text-yellow-500" },
    // { to: "/student/friends", icon: UserPlus, label: "Friends", color: "text-violet-500" },
  // { to: "/student/messages", icon: MessageSquare, label: "Messages", color: "text-emerald-500" },
  // { to: "/student/jobs", icon: Briefcase, label: "Job Board", color: "text-amber-500" },
  // { to: "/student/certificates", icon: Award, label: "Certificates", color: "text-pink-500" },
  // { to: "/student/notifications", icon: Bell, label: "Notifications", color: "text-orange-500" },
];

const sidebarVariants = {
  hidden: { x: '-100%', transition: { type: 'spring', stiffness: 400, damping: 40 } },
  visible: { x: 0, transition: { type: 'spring', stiffness: 400, damping: 40 } },
};

const NewSidebar = ({ userType, isOpen, onClose, theme }) => {
  const links = {
    admin: adminLinks,
    facilitator: facilitatorLinks,
    student: studentLinks,
  }[userType] || studentLinks;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[300px] overflow-hidden rounded-r-2xl shadow-2xl transition-all duration-300 ${
              theme === 'light'
                ? 'bg-gradient-to-br from-white via-amber-100/50 to-slate-100 border-r border-amber-300'
                : 'bg-gradient-to-br from-slate-900 via-amber-500/10 to-slate-800 border-r border-amber-500'
            }`}
          >
            <div className="h-full flex flex-col overflow-y-auto">
              <div className={`p-4 border-b flex justify-between items-center ${
                theme === 'light' ? 'border-amber-200/50' : 'border-gold-300/20'
              }`}>
                <div className="flex items-center space-x-2">
                  <GraduationCap className={`h-7 w-7 ${theme === 'light' ? 'text-amber-600' : 'text-gold-300'}`} />
                  <span className={`font-bold text-lg bg-gradient-to-r from-gold-300 to-amber-500 text-transparent bg-clip-text`}>
                    AFRICAN INT.
                  </span>
                </div>
                <button 
                  onClick={onClose}
                  className={`p-1.5 rounded-full transition-colors ${
                    theme === 'light' ? 'bg-amber-100/50 hover:bg-amber-200/50' : 'bg-slate-800 hover:bg-gold-900/20'
                  }`}
                >
                  <X className={`h-5 w-5 ${theme === 'light' ? 'text-amber-600' : 'text-gold-300'}`} />
                </button>
              </div>
              <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                        isActive
                          ? `${theme === 'light' ? 'bg-amber-100/50 text-amber-600' : 'bg-gold-900/30 text-gold-300'} font-medium shadow-inner`
                          : `${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} hover:bg-opacity-10`,
                        theme === 'light' ? 'hover:bg-amber-100/30' : 'hover:bg-amber-500/10'
                      )
                    }
                    onClick={onClose}
                  >
                    <div className={`relative z-10 ${link.color} p-2 rounded-lg ${
                      theme === 'light' ? 'bg-amber-50/50' : 'bg-gold-300/10'
                    }`}>
                      <link.icon className="h-5 w-5" />
                    </div>
                    <span className="relative z-10 font-medium">{link.label}</span>
                    <motion.div 
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity -z-10 ${
                        theme === 'light' 
                          ? 'bg-gradient-to-r from-amber-100/50 to-transparent' 
                          : 'bg-gradient-to-r from-amber-500/20 to-transparent'
                      }`}
                      initial={false}
                      transition={{ duration: 0.3 }}
                    />
                  </NavLink>
                ))}
              </nav>
              <div className={`mt-auto p-4 border-t ${
                theme === 'light' ? 'border-amber-200/50' : 'border-gold-300/20'
              }`}>
                <div className={`p-3 rounded-xl text-center ${
                  theme === 'light' ? 'bg-amber-50/50' : 'bg-gold-300/10'
                }`}>
                  <p className={`text-sm ${theme === 'light' ? 'text-amber-600' : 'text-gold-300'}`}>
                    AFRICAN INTELLIGENCE
                  </p>
                  <p className={`mt-1 text-xs ${theme === 'light' ? 'text-amber-500' : 'text-gold-400'}`}>
                    Empowering Africa through AI
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewSidebar;