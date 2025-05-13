
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useTourLMS } from '../../contexts/TourLMSContext';
import AdminSidebar from './AdminSidebar';
import LoadingScreen from '../LoadingScreen';

const AdminLayout = () => {
  const { user, loading } = useTourLMS();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect if not authenticated or not an admin
  // if (!user || user.role !== 'facilitator') {
  //   return <Navigate to="/oracle/login" />;
  // }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 backdrop-blur-sm bg-black/20">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
