import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { showToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/ToastContainer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Search, Bell, ChevronDown, LogOut, Settings as SettingsIcon
} from 'lucide-react';
import { ProgrammeSidebar } from './ProgrammeSidebar';

export const DashboardLayout: React.FC = () => {
  const { role, setRole, isAdmin } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Low stock: PECS Kits (5 remaining)', type: 'warning', read: false, time: '10m ago' },
    { id: 2, text: 'New assessment pending diagnosis: Aarav Sharma', type: 'info', read: false, time: '1h ago' },
    { id: 3, text: 'Sponsorship renewal due for Vihaan Patel', type: 'danger', read: false, time: '2h ago' },
    { id: 4, text: 'Camp report generated: Kothrud Medical Camp', type: 'success', read: true, time: '1d ago' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast('Notifications marked as read', 'success');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Searching directory for "${searchQuery}"...`, 'info');
      // If we are in awards, search awards, etc. For now just mock:
      navigate(`${location.pathname}?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Determine portal name for mobile topbar based on route
  let portalName = 'RENU Portal';
  if (location.pathname.startsWith('/awards')) portalName = 'Awards Portal';
  if (location.pathname.startsWith('/road-safety')) portalName = 'Road Safety Portal';

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-700 transition-colors duration-200">
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 fixed h-full z-20 shadow-xs">
        <ProgrammeSidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen min-w-0 overflow-x-hidden">
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between backdrop-blur-md bg-white/80 border-b border-slate-200 px-4 md:px-6 py-3 shadow-xs">
          {/* Mobile hamburger menu toggle & Brand */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2" title="Return to Programme Switcher">
              <img src="/vishal-logo.png" alt="Vishalwin Foundation" className="h-8 w-auto block lg:hidden" />
              <span className="font-display font-extrabold text-slate-900 text-lg tracking-tight hidden sm:block">{portalName}</span>
            </Link>
          </div>

          {/* Global Search Bar (Desktop) */}
          <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center relative w-80">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-200"
            />
          </form>

          {/* Topbar Actions */}
          <div className="flex items-center gap-3.5 ml-auto">
            {/* Quick Role Toggle Simulator */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
              <button
                onClick={() => {
                  setRole('Admin');
                  showToast('Switched to Admin Role', 'success', 'You now have full administrator capabilities.');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  role === 'Admin'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => {
                  setRole('Coordinator');
                  showToast('Switched to Coordinator Role', 'info', 'Capabilities restricted for coordinators.');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  role === 'Coordinator'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Coord
              </button>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-red-500 text-[8px] font-bold text-white flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay Menu */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-lg z-40 py-2 backdrop-blur-md"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                      <span className="font-bold text-slate-800 text-sm font-display">Notifications</span>
                      <button onClick={handleMarkAllRead} className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer">
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto scrollbar-thin">
                      {notifications.map((n) => (
                        <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-red-50/10' : ''}`}>
                          <div className="flex gap-3 items-start">
                            <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${n.type === 'danger' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <div>
                              <p className={`text-xs ${!n.read ? 'text-slate-800 font-semibold' : 'text-slate-600'}`}>{n.text}</p>
                              <span className="text-[9px] text-slate-400 font-medium mt-1 block">{n.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50/50 rounded-b-2xl">
                      <a href="#" className="text-[10px] font-bold text-slate-500 hover:text-slate-800">View All Activity</a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200 cursor-pointer"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {role === 'Admin' ? 'Dr. Satish Gupta' : 'Rohan Kulkarni'}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{role}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-red-50 text-red-600 font-extrabold flex items-center justify-center text-sm shadow-inner">
                  {role === 'Admin' ? 'SG' : 'RK'}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Overlay Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-lg z-40 py-2"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl mb-1">
                      <p className="text-sm font-bold text-slate-800">{role === 'Admin' ? 'satish.gupta@vishalwin.org' : 'rohan.k@vishalwin.org'}</p>
                    </div>
                    <Link to="/shared/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors font-medium">
                      <SettingsIcon className="h-4 w-4" /> Account Settings
                    </Link>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button onClick={() => showToast('Logging out...', 'info')} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors font-medium cursor-pointer">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full relative z-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay (Slide-in) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="font-display font-extrabold text-slate-900">Menu</span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ProgrammeSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
};
