import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Briefcase, FileText, User, BarChart3,
  Building2, LogOut, ChevronRight, Zap, X
} from 'lucide-react';

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/applications', icon: FileText, label: 'Applications' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Job Listings' },
  { to: '/admin/applications', icon: FileText, label: 'Applications' },
  { to: '/admin/companies', icon: Building2, label: 'Companies' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNav = () => { if (onClose) onClose(); };

  return (
    <aside className="h-screen w-[240px] bg-white dark:bg-slate-800/95 border-r border-gray-100 dark:border-slate-700 flex flex-col shadow-soft">
      {/* Logo + mobile close */}
      <div className="px-4 py-4 flex items-center gap-2.5 border-b border-gray-100 dark:border-slate-700">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center shadow-glow flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <span className="font-bold text-gray-900 dark:text-white text-sm">PlacePro</span>
          <div className="text-[10px] text-gray-400 dark:text-slate-500 leading-none">Placement Tracker</div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* User pill */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">{user?.name || 'User'}</div>
            <div className="text-[10px] text-primary-600 dark:text-primary-400 font-medium capitalize">{user?.role || 'student'}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">Menu</p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleNav}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
          </NavLink>
        ))}
      </nav>

      {/* Upgrade / promo card */}
      <div className="mx-3 mb-3 p-3 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-100 dark:border-primary-900/30">
        <div className="text-xs font-semibold text-gray-800 dark:text-slate-200 mb-0.5">Profile Boost</div>
        <div className="text-[10px] text-gray-500 dark:text-slate-400 mb-2">Complete your profile to get better matches</div>
        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 rounded-full" style={{ width: `${user?.profileCompletion || 0}%` }}/>
        </div>
        <div className="text-[10px] text-primary-600 dark:text-primary-400 mt-1 font-semibold">{user?.profileCompletion || 0}% complete</div>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-gray-100 dark:border-slate-700 pt-3">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
