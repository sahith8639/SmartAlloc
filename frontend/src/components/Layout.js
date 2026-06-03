import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-bgLight dark:bg-bgDark transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Content wrapper */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top Navbar */}
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Dynamic page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-bgLight dark:bg-bgDark transition-colors duration-300">
          <div className="mx-auto max-w-7xl slide-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
