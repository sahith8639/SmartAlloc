import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Brain,
  Cpu,
  LineChart,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppContext } from '../App';

function Sidebar({ isOpen, setIsOpen }) {
  const { handleLogout, user } = useAppContext();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Resource Monitoring', path: '/monitoring', icon: Activity },
    { name: 'Workload Analysis', path: '/workload', icon: BarChart3 },
    { name: 'ML Prediction', path: '/prediction', icon: Brain },
    { name: 'Resource Allocation', path: '/allocation', icon: Cpu },
    { name: 'Performance Monitoring', path: '/performance', icon: LineChart },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex flex-col bg-white dark:bg-cardDark border-r border-slate-200 dark:border-slate-800 transition-all duration-300 transform md:translate-x-0 md:relative ${
        isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary text-white font-bold">
            OS
          </div>
          {isOpen && (
            <span className="font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SmartAlloc
            </span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:flex items-center justify-center w-6 h-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border-l-4 border-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {isOpen && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Footer Account Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
        {isOpen && (
          <div className="mb-3 px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Session Profile</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.username || 'Guest'}</p>
            <span className="inline-flex items-center px-2 py-0.5 mt-1 text-xs font-semibold rounded bg-secondary/15 text-secondary dark:text-secondary-light">
              {user?.role === 'admin' ? 'Administrator' : 'System Manager'}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger/10 rounded-lg transition-all"
        >
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
