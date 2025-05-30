import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const NewSidebar = ({ userType, isOpen, onClose, theme }) => {
  const location = useLocation();
  const links = {
    admin: adminLinks,
    facilitator: facilitatorLinks,
    student: studentLinks,
  }[userType] || studentLinks;

  const isDashboardRoute = (path) => {
    return path === "/student" || path === "/admin" || path === "/facilitator";
  };

  const isActive = (link) => {
    if (isDashboardRoute(link.to)) {
      // For dashboard links, only active if we're exactly on that route
      return location.pathname === link.to;
    } else {
      // For other links, active if the current path starts with the link path
      return location.pathname.startsWith(link.to);
    }
  };

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
                    className={() =>
                      cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                        isActive(link)
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