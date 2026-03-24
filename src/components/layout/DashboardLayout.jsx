import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIChatWidget from '../features/AIChatWidget';
import { LayoutDashboard, Briefcase, FileText, User, Building2, BarChart3 } from 'lucide-react';

const studentBottomLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/applications', icon: FileText, label: 'Applied' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminBottomLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Home' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/admin/applications', icon: FileText, label: 'Apps' },
  { to: '/admin/companies', icon: Building2, label: 'Companies' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

export default function DashboardLayout({ children, hideRight = false }) {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { user } = useAuth();
  const bottomLinks = user?.role === 'admin' ? adminBottomLinks : studentBottomLinks;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar — hidden off-screen on mobile, always visible on lg+ */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
        mobileSidebar ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <Sidebar onClose={() => setMobileSidebar(false)} />
      </div>

      {/* Mobile overlay — closes sidebar on tap */}
      {mobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileSidebar(false)} />
      )}

      {/* Main area */}
      <div className="flex flex-col min-h-screen lg:ml-[240px]">
        <Navbar onMenuToggle={() => setMobileSidebar(v => !v)} />
        <main className="flex-1 p-4 sm:p-5 pb-20 lg:pb-5 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* AI Chat Widget — students only */}
      {user?.role === 'student' && <AIChatWidget />}

      {/* Mobile bottom nav — only visible below lg */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex items-center justify-around px-2 py-1 shadow-lg">
        {bottomLinks.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/admin' || to === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-slate-500'
              }`
            }>
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
