
import React from 'react';
import { NavLink,Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CircuitBoard, 
  PieChart, 
  Calendar, 
  Settings, 
  LogOut,
  Shield,
  Menu,
  X,
  Bell,
  FileCode
} from 'lucide-react';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/oracle' },
    { name: 'Students', icon: <Users size={20} />, path: '/oracle/students' },
    { name: 'Facilitators', icon: <CircuitBoard size={20} />, path: '/oracle/facilitators' },
    { name: 'Analytics', icon: <PieChart size={20} />, path: '/oracle/analytics' },
    { name: 'Events', icon: <Calendar size={20} />, path: '/oracle/events' },
    { name: 'Notifications', icon: <Bell size={20} />, path: '/oracle/notifications' },
    { name: 'API Documentation', icon: <FileCode size={20} />, path: '/oracle/apiDocs' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/oracle/settings' }
  ];

  const navItemClass = (isActive) => {
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/40 text-white backdrop-blur-sm' 
        : 'text-gray-300 hover:bg-white/10'
    }`;
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-16'} h-full bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-r border-gray-800/50 transition-all duration-300 overflow-hidden flex flex-col`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-800/50">
        <div className={`flex items-center gap-3 ${!isOpen && 'opacity-0'}`}>
          <Shield className="text-purple-500" size={24} />
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Oracle
          </h1>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-gray-800/50"
        >
          {isOpen ? <X size={20} className="text-gray-400" /> : <Menu size={20} className="text-gray-400" />}
        </button>
      </div>
      
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => navItemClass(isActive)}
          >
            <span className="text-purple-400">{item.icon}</span>
            <span className={`${!isOpen && 'hidden'} transition-opacity duration-200`}>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-800/50">
        <Link to='/oracle/login' >
        <button 
          onClick={logout} 
          className={`w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200`}
        >
          <LogOut size={20} />
          <span className={`${!isOpen && 'hidden'}`}>Logout</span>
        </button>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
