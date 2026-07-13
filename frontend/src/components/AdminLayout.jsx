import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#080f1e] transition-colors duration-300 overflow-hidden text-slate-900 dark:text-slate-200">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Ambient background glows */}
        <div className="absolute top-[-5%] right-[10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[5%] w-[25%] h-[25%] rounded-full bg-purple-500/5 dark:bg-purple-500/8 blur-3xl pointer-events-none" />
        
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
