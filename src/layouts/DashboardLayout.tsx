import React, { useState } from'react';
import { Link, useLocation, useNavigate, Outlet } from'react-router-dom';
import { useRole } from'../hooks/useRole';
import { showToast } from'../hooks/useToast';
import { ToastContainer } from'../components/ui/ToastContainer';
import { motion, AnimatePresence } from'framer-motion';
import {
 LayoutDashboard,
 CalendarRange,
 Users,
 Clock,
 Activity,
 Building2,
 HandHeart,
 Package,
 UserCheck,
 GraduationCap,
 FileText,
 BarChart3,
 Settings as SettingsIcon,
 Menu,
 X,
 Search,
 Bell,
 ChevronDown,
 Lock,
 LogOut
} from'lucide-react';
import { Button } from'../components/ui';

interface SidebarItem {
 name: string;
 path: string;
 icon: React.ReactNode;
 adminOnly?: boolean;
}

export const DashboardLayout: React.FC = () => {
 const { role, setRole, isAdmin, isCoordinator } = useRole();
 const location = useLocation();
 const navigate = useNavigate();
 const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
 const [isProfileOpen, setIsProfileOpen] = useState(false);
 const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');

 // Sample Notifications
 const [notifications, setNotifications] = useState([
 { id: 1, text:'Low stock: PECS Kits (5 remaining)', type:'warning', read: false, time:'10m ago'},
 { id: 2, text:'New assessment pending diagnosis: Aarav Sharma', type:'info', read: false, time:'1h ago'},
 { id: 3, text:'Sponsorship renewal due for Vihaan Patel', type:'danger', read: false, time:'2h ago'},
 { id: 4, text:'Camp report generated: Kothrud Medical Camp', type:'success', read: true, time:'1d ago'},
 ]);

 const unreadCount = notifications.filter(n => !n.read).length;

 const handleMarkAllRead = () => {
 setNotifications(notifications.map(n => ({ ...n, read: true })));
 showToast('Notifications marked as read','success');
 };

 const handleGlobalSearch = (e: React.FormEvent) => {
 e.preventDefault();
 if (searchQuery.trim()) {
 showToast(`Searching directory for"${searchQuery}"...`,'info');
 navigate(`/children?search=${encodeURIComponent(searchQuery)}`);
 }
 };

 const menuItems: SidebarItem[] = [
 { name:'Dashboard', path:'/', icon: <LayoutDashboard className="h-5 w-5"/> },
 { name:'Camp Management', path:'/camps', icon: <CalendarRange className="h-5 w-5"/> },
 { name:'Children', path:'/children', icon: <Users className="h-5 w-5"/> },
 { name:'Follow-Ups', path:'/follow-ups', icon: <Clock className="h-5 w-5"/> },
 { name:'Diagnosis', path:'/diagnosis', icon: <Activity className="h-5 w-5"/> },
 { name:'Therapy Centres', path:'/therapy-centres', icon: <Building2 className="h-5 w-5"/> },
 { name:'Sponsorships', path:'/sponsorships', icon: <HandHeart className="h-5 w-5"/>, adminOnly: true },
 { name:'Inventory', path:'/inventory', icon: <Package className="h-5 w-5"/>, adminOnly: true },
 { name:'Coordinators', path:'/coordinators', icon: <UserCheck className="h-5 w-5"/>, adminOnly: true },
 { name:'School Admissions', path:'/school-admissions', icon: <GraduationCap className="h-5 w-5"/> },
 { name:'Reports', path:'/reports', icon: <FileText className="h-5 w-5"/> },
 { name:'Analytics', path:'/analytics', icon: <BarChart3 className="h-5 w-5"/> },
 { name:'Settings', path:'/settings', icon: <SettingsIcon className="h-5 w-5"/> },
 ];

 const currentMenuItem = menuItems.find(item => item.path === location.pathname);
 const isAccessBlocked = currentMenuItem?.adminOnly && isCoordinator;

 const sidebarContent = (
 <div className="flex flex-col h-full bg-white text-slate-600 select-none border-r border-slate-200">
    {/* Brand Header */}
    <Link to="/" className="flex items-center justify-center px-6 py-4 border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors group">
      <img src="/vishal-logo.png" alt="Vishalwin Foundation" className="h-12 w-auto group-hover:scale-105 transition-transform duration-300" />
    </Link>

 {/* Navigation Items */}
 <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-none">
 {menuItems.map((item) => {
 if (item.adminOnly && isCoordinator) return null; // Hide admin sections
 const isActive = location.pathname === item.path || 
 (item.path !=='/'&& location.pathname.startsWith(item.path));
 const isLocked = item.adminOnly && isCoordinator;

 return (
 <Link
 key={item.name}
 to={isLocked ?'#': item.path}
 onClick={() => {
 if (isLocked) {
 showToast('Access Denied','danger','Admin privileges are required for this section.');
 return;
 }
 setIsMobileSidebarOpen(false);
 }}
 className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 group ${
 isActive
 ?'bg-red-50 text-red-600 border-l-4 border-red-600 rounded-l-none font-bold'
 : isLocked
 ?'text-slate-400 cursor-not-allowed hover:bg-slate-50/10'
 :'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
 }`}
 >
 <div className="flex items-center gap-3">
 <span className={isActive ?'text-red-600':'text-slate-400 group-hover:text-slate-700'}>
 {item.icon}
 </span>
 <span>{item.name}</span>
 </div>
 {isLocked && (
 <Lock className="h-3.5 w-3.5 text-slate-400"/>
 )}
 </Link>
 );
 })}
 </nav>

 {/* Coordinator Quick Info / Status Panel */}
 <div className="p-4 border-t border-slate-200 bg-slate-50/50">
 <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs">
 <div className="flex items-center gap-2 mb-2.5">
 <div className={`h-2 w-2 rounded-full ${isAdmin ?'bg-emerald-500 animate-pulse':'bg-teal-500'}`} />
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Simulator</span>
 </div>
 <p className="text-sm font-bold text-slate-900 mb-0.5">{role} Portal</p>
 <p className="text-[10px] text-slate-500 mb-2 font-medium">
 {role ==='Admin'?'Dr. Satish Gupta':'Rohan Kulkarni'}
 </p>
 <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
 {isAdmin 
 ?'Admin Mode: Full access to sponsors, inventories and user directories.'
 :'Coordinator Mode: Child profiling, follow-ups and registrations only.'
 }
 </p>
 </div>
 </div>
 </div>
 );

 return (
 <div className="min-h-screen flex bg-[#F8FAFC] text-slate-700 transition-colors duration-200">
 {/* Desktop Sidebar (Fixed) */}
 <aside className="hidden lg:block w-64 flex-shrink-0 fixed h-full z-20 shadow-xs">
 {sidebarContent}
 </aside>

 {/* Main Content Area */}
 <div className="flex-1 flex flex-col lg:pl-64 min-h-screen min-w-0 overflow-x-hidden">
 {/* Top Navigation Header */}
 <header className="sticky top-0 z-30 flex items-center justify-between backdrop-blur-md bg-white/80 border-b border-slate-200 px-4 md:px-6 py-3 shadow-xs">
 {/* Mobile hamburger menu toggle */}
 <div className="flex items-center gap-4 lg:hidden">
 <button
 onClick={() => setIsMobileSidebarOpen(true)}
 className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none cursor-pointer"
 >
 <Menu className="h-6 w-6"/>
 </button>
 <span className="font-display font-extrabold text-slate-900 text-lg tracking-tight">RENU Portal</span>
 </div>

 {/* Global Search Bar (Desktop) */}
 <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center relative w-80">
 <Search className="absolute left-3.5 h-4 w-4 text-slate-400"/>
 <input
 type="text"
 placeholder="Search child ID, parent or tag..."
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
 showToast('Switched to Admin Role','success','You now have full administrator capabilities.');
 }}
 className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
 role ==='Admin'
 ?'bg-white text-slate-950 shadow-xs'
 :'text-slate-500 hover:text-slate-900'
 }`}
 >
 Admin
 </button>
 <button
 onClick={() => {
 setRole('Coordinator');
 showToast('Switched to Coordinator Role','info','Capabilities restricted to child registration and follow-ups.');
 }}
 className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
 role ==='Coordinator'
 ?'bg-white text-slate-950 shadow-xs'
 :'text-slate-500 hover:text-slate-900'
 }`}
 >
 Coordinator
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
 <Bell className="h-4.5 w-4.5"/>
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
 <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
 <span className="text-xs font-bold text-slate-800">Notifications</span>
 {unreadCount > 0 && (
 <button 
 onClick={handleMarkAllRead}
 className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
 >
 Mark all read
 </button>
 )}
 </div>
 <div className="max-h-64 overflow-y-auto">
 {notifications.length === 0 ? (
 <div className="px-4 py-6 text-center text-xs text-slate-400">
 No notifications
 </div>
 ) : (
 notifications.map(n => (
 <div 
 key={n.id} 
 className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50/80 transition-colors flex gap-2.5 items-start ${
 !n.read ?'bg-red-50/10':''
 }`}
 >
 <div className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
 n.type ==='warning'?'bg-amber-500':
 n.type ==='danger'?'bg-red-500':
 n.type ==='success'?'bg-emerald-500':'bg-red-500'
 }`} />
 <div className="flex-1">
 <p className="text-xs text-slate-700 font-semibold leading-relaxed">{n.text}</p>
 <span className="text-[10px] text-slate-400 mt-1 block font-medium">{n.time}</span>
 </div>
 </div>
 ))
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Profile Dropdown */}
 <div className="relative">
 <button
 onClick={() => {
 setIsProfileOpen(!isProfileOpen);
 setIsNotificationsOpen(false);
 }}
 className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
 >
 <div className="h-8 w-8 rounded-full bg-red-50 text-red-600 font-extrabold flex items-center justify-center text-sm shadow-inner">
 {role ==='Admin'?'AD':'CO'}
 </div>
 <div className="hidden lg:flex flex-col text-left mr-1">
 <span className="text-xs font-bold text-slate-800 leading-tight">
 {role ==='Admin'?'Dr. Satish Gupta':'Rohan Kulkarni'}
 </span>
 <span className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">{role}</span>
 </div>
 <ChevronDown className="h-3.5 w-3.5 text-slate-400"/>
 </button>

 <AnimatePresence>
 {isProfileOpen && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.15 }}
 className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-lg z-40 py-2 backdrop-blur-md"
 >
 <div className="px-4 py-2 border-b border-slate-100">
 <p className="text-xs font-bold text-slate-800">
 {role ==='Admin'?'Dr. Satish Gupta':'Rohan Kulkarni'}
 </p>
 <p className="text-[10px] text-slate-400 font-medium">
 {role ==='Admin'?'satish.gupta@vishalwin.org':'rohan.k@vishalwin.org'}
 </p>
 </div>
 <Link
 to="/settings"
 onClick={() => setIsProfileOpen(false)}
 className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
 >
 <SettingsIcon className="h-4 w-4 text-slate-400"/>
 Account Settings
 </Link>
 <button
 onClick={() => {
 setIsProfileOpen(false);
 showToast('Logged out simulator','warning');
 }}
 className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer font-semibold"
 >
 <LogOut className="h-4 w-4 text-slate-400"/>
 Logout Simulation
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </header>

 {/* Page Main Content Area */}
 <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-none overflow-y-auto">
 <AnimatePresence mode="wait">
 {isAccessBlocked ? (
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-slate-200 rounded-3xl shadow-lg"
 >
 <div className="h-14 w-14 rounded-full bg-red-50 text-brand-danger flex items-center justify-center mx-auto mb-4 border border-red-100">
 <Lock className="h-6 w-6"/>
 </div>
 <h2 className="text-xl font-bold text-slate-900 mb-2 font-display">Access Denied</h2>
 <p className="text-xs text-slate-500 mb-6 leading-relaxed">
 The simulated **{role}** role does not have authorization to view the **{currentMenuItem?.name}** module.
 </p>
 <div className="flex gap-3 justify-center">
 <Button variant="outline"size="sm"onClick={() => navigate(-1)}>
 Go Back
 </Button>
 <Button 
 size="sm"
 onClick={() => {
 setRole('Admin');
 showToast('Role switched to Admin','success');
 }}
 >
 Switch to Admin
 </Button>
 </div>
 </motion.div>
 ) : (
 <motion.div
 key={location.pathname}
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 transition={{ duration: 0.25, ease:'easeOut'}}
 >
 <Outlet />
 </motion.div>
 )}
 </AnimatePresence>
 </main>
 </div>

 {/* Mobile Sidebar Drawer Overlay */}
 <AnimatePresence>
 {isMobileSidebarOpen && (
 <div className="fixed inset-0 z-50 flex lg:hidden">
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setIsMobileSidebarOpen(false)}
 className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
 />
 {/* Sidebar panel */}
 <motion.div
 initial={{ x:'-100%'}}
 animate={{ x: 0 }}
 exit={{ x:'-100%'}}
 transition={{ type:'spring', damping: 28, stiffness: 240 }}
 className="relative flex flex-col w-64 max-w-xs h-full bg-white z-10"
 >
 <div className="absolute top-4 right-4 z-20">
 <button
 onClick={() => setIsMobileSidebarOpen(false)}
 className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
 >
 <X className="h-5 w-5"/>
 </button>
 </div>
 {sidebarContent}
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Global Toast Container */}
 <ToastContainer />
 </div>
 );
};
export default DashboardLayout;
