import { useState } from 'react';
import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const [dark, setDark] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  const notifications = [
    { id: 1, text: 'Analytics Pro accepted your application', time: '2h ago', unread: true },
    { id: 2, text: 'New job posted: Full Stack Developer', time: '5h ago', unread: true },
    { id: 3, text: 'Profile completion reminder', time: '1d ago', unread: false },
  ];

  return (
    <header className="h-14 bg-white dark:bg-slate-800/95 border-b border-gray-100 dark:border-slate-700 flex items-center px-4 gap-3 sticky top-0 z-20 shadow-sm">
      {/* Mobile menu toggle */}
      <button onClick={onMenuToggle} className="lg:hidden btn-ghost p-2 flex-shrink-0">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search — hidden on small mobile, visible from sm */}
      <div className="hidden sm:flex flex-1 max-w-xs relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input placeholder="Search jobs, companies..." className="input pl-9 py-2 text-sm w-full" />
      </div>

      <div className="flex-1" />

      {/* Dark mode */}
      <button onClick={toggleDark} className="btn-ghost p-2 rounded-xl flex-shrink-0" title="Toggle dark mode">
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Notifications */}
      <div className="relative flex-shrink-0">
        <button onClick={() => setShowNotif(!showNotif)} className="btn-ghost p-2 rounded-xl relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        {showNotif && (
          <div className="absolute right-0 top-12 w-72 sm:w-80 card p-3 z-50 shadow-xl animate-fade-in">
            <h3 className="font-semibold text-sm text-gray-800 dark:text-slate-200 mb-3 px-1">Notifications</h3>
            <div className="space-y-1">
              {notifications.map(n => (
                <div key={n.id} className={`px-3 py-2.5 rounded-xl text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${n.unread ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                  <p className="text-gray-700 dark:text-slate-300 text-xs leading-relaxed">{n.text}</p>
                  <p className="text-gray-400 dark:text-slate-500 text-[10px] mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-gray-800 dark:text-slate-200">{user?.name?.split(' ')[0]}</div>
          <div className="text-[10px] text-gray-400 dark:text-slate-500 capitalize">{user?.role}</div>
        </div>
      </div>
    </header>
  );
}
