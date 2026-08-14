import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import {
  LayoutDashboard, CalendarRange, Users, Clock, Activity, Building2,
  HandHeart, Package, UserCheck, GraduationCap, FileText, BarChart3,
  Settings as SettingsIcon, Lock, Trophy, ShieldAlert, CheckCircle
} from 'lucide-react';

export const ProgrammeSidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { isCoordinator } = useRole();
  const location = useLocation();

  // Determine active programme based on route
  const isRenu = location.pathname.startsWith('/renu');
  const isAwards = location.pathname.startsWith('/awards');
  const isRoadSafety = location.pathname.startsWith('/road-safety');
  const isShared = location.pathname.startsWith('/shared');

  let menuItems: any[] = [];
  let programmeName = 'RENU Programme';

  if (isRenu) {
    programmeName = 'RENU Programme';
    menuItems = [
      { name: 'Dashboard', path: '/renu', icon: <LayoutDashboard className="h-5 w-5" />, exact: true },
      { name: 'Camp Management', path: '/renu/camps', icon: <CalendarRange className="h-5 w-5" /> },
      { name: 'Children', path: '/renu/children', icon: <Users className="h-5 w-5" /> },
      { name: 'Follow-Ups', path: '/renu/follow-ups', icon: <Clock className="h-5 w-5" /> },
      { name: 'Home Visits', path: '/renu/home-visits', icon: <LayoutDashboard className="h-5 w-5" /> },
      { name: 'Diagnosis', path: '/renu/diagnosis', icon: <Activity className="h-5 w-5" /> },
      { name: 'Assessments Database', path: '/renu/assessments', icon: <Activity className="h-5 w-5" /> },
      { name: 'Medical Database', path: '/renu/medical-database', icon: <FileText className="h-5 w-5" /> },
      { name: 'Volunteer Visits', path: '/renu/volunteer-visits', icon: <Users className="h-5 w-5" /> },
      { name: 'Stakeholders', path: '/renu/stakeholders', icon: <Building2 className="h-5 w-5" /> },
      { name: 'Therapy Centres', path: '/renu/therapy-centres', icon: <Building2 className="h-5 w-5" /> },
      { name: 'School Admissions', path: '/renu/school-admissions', icon: <GraduationCap className="h-5 w-5" /> },
      { name: 'Sponsorships', path: '/renu/sponsorships', icon: <HandHeart className="h-5 w-5" />, adminOnly: true },
      { name: 'Inventory', path: '/renu/inventory', icon: <Package className="h-5 w-5" />, adminOnly: true },
      { name: 'Reports', path: '/renu/reports', icon: <FileText className="h-5 w-5" /> },
      { name: 'Analytics', path: '/renu/analytics', icon: <BarChart3 className="h-5 w-5" /> },
    ];
  } else if (isAwards) {
    programmeName = 'Guardian Angel Awards';
    menuItems = [
      { name: 'Dashboard', path: '/awards', icon: <LayoutDashboard className="h-5 w-5" />, exact: true },
      { name: 'Events', path: '/awards/events', icon: <CalendarRange className="h-5 w-5" /> },
      { name: 'Nominees', path: '/awards/nominees', icon: <Users className="h-5 w-5" /> },
      { name: 'Ceremony', path: '/awards/ceremony', icon: <Trophy className="h-5 w-5" /> },
      { name: 'Awardees', path: '/awards/awardees', icon: <CheckCircle className="h-5 w-5" /> },
      { name: 'Reports', path: '/awards/reports', icon: <FileText className="h-5 w-5" /> },
    ];
  } else if (isRoadSafety) {
    programmeName = 'Road Safety Programme';
    menuItems = [
      { name: 'Dashboard', path: '/road-safety', icon: <LayoutDashboard className="h-5 w-5" />, exact: true },
      { name: 'Workshops', path: '/road-safety/workshops', icon: <ShieldAlert className="h-5 w-5" /> },
      { name: 'Institutions', path: '/road-safety/institutions', icon: <Building2 className="h-5 w-5" /> },
      { name: 'Collaborations', path: '/road-safety/collaborations', icon: <HandHeart className="h-5 w-5" /> },
      { name: 'Participants', path: '/road-safety/participants', icon: <Users className="h-5 w-5" /> },
      { name: 'Programme Reach', path: '/road-safety/programme-reach', icon: <Activity className="h-5 w-5" /> },
      { name: 'Reports', path: '/road-safety/reports', icon: <FileText className="h-5 w-5" /> },
    ];
  }

  const portalPrefix = isAwards ? '/awards' : isRoadSafety ? '/road-safety' : '/renu';

  // Common shared tools appended at bottom
  const sharedItems = [
    { name: 'Coordinators', path: `${portalPrefix}/coordinators`, icon: <UserCheck className="h-5 w-5" />, adminOnly: true },
    { name: 'Settings', path: `${portalPrefix}/settings`, icon: <SettingsIcon className="h-5 w-5" /> },
  ];

  const renderMenu = (items: any[]) => (
    items.map((item) => {
      if (item.adminOnly && isCoordinator) return null;
      const isActive = item.exact 
        ? location.pathname === item.path 
        : location.pathname.startsWith(item.path);
      const isLocked = item.adminOnly && isCoordinator;

      return (
        <Link
          key={item.path}
          to={isLocked ? '#' : item.path}
          onClick={(e) => {
            if (isLocked) {
              e.preventDefault();
              return;
            }
            if (onCloseMobile) onCloseMobile();
          }}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 group ${
            isActive
              ? 'bg-red-50 text-red-600 border-l-4 border-red-600 rounded-l-none font-bold'
              : isLocked
              ? 'text-slate-400 cursor-not-allowed hover:bg-slate-50/10'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-700'}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </div>
          {isLocked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
        </Link>
      );
    })
  );

  return (
    <div className="flex flex-col h-full bg-white text-slate-600 select-none border-r border-slate-200">
      {/* Brand Header */}
      <Link to="/" className="flex items-center justify-center px-6 py-4 border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors group">
        <img src="/vishal-logo.png" alt="Vishalwin Foundation" className="h-12 w-auto group-hover:scale-105 transition-transform duration-300" />
      </Link>
      <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block text-center">
          {programmeName}
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {renderMenu(menuItems)}
        
        {menuItems.length > 0 && <div className="my-4 border-t border-slate-100" />}
        
        {renderMenu(sharedItems)}
      </nav>
    </div>
  );
};
