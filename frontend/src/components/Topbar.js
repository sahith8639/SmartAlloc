import React, { useState, useEffect } from 'react';
import { Menu, Bell, Sun, Moon, User, Server } from 'lucide-react';
import { useAppContext } from '../App';

function Topbar({ sidebarOpen, setSidebarOpen }) {
  const { darkMode, setDarkMode, notifications, user } = useAppContext();
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative flex items-center justify-between h-16 px-4 bg-white dark:bg-cardDark border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 z-10">
      {/* Sidebar Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <Server size={18} className="text-primary" />
          <span className="text-xs font-semibold px-2 py-1 bg-success/10 text-success rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-green"></span>
            Agent Live
          </span>
        </div>
      </div>

      {/* Clock & Controls */}
      <div className="flex items-center gap-4">
        {/* Current Time Display */}
        <div className="hidden md:block text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-md border border-slate-200/50 dark:border-slate-800/40">
          {time.toLocaleTimeString()} | {time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>

        {/* Dark Mode Switcher */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
        </button>

        {/* Notifications Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-2 z-20 slide-in">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-sm">System Notifications</span>
                  <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => setShowNotifications(false)}>Close</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-slate-400 text-xs">No alerts active</div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase ${
                            notif.type === 'success' ? 'text-success' : notif.type === 'warning' ? 'text-warning' : 'text-primary'
                          }`}>
                            {notif.type}
                          </span>
                          <span className="text-[10px] text-slate-400">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Badge Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20">
            <User size={16} />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200">{user?.username}</p>
            <p className="text-[10px] leading-tight text-slate-400 truncate uppercase">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
