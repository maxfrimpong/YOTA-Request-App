import React from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { LogOut, LayoutDashboard, FileText, Settings, UserCircle, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, activeRole, switchRole, logout } = useApp();
  const location = useLocation();

  if (!user || !activeRole) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            PayFlow
          </h1>
          <p className="text-slate-400 text-xs mt-1">Cash Payment System</p>
        </div>

        {/* Role Switcher if applicable */}
        {user.roles.length > 1 && (
           <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                 <RefreshCw size={10} /> Switch View
              </label>
              <select 
                value={activeRole}
                onChange={(e) => switchRole(e.target.value as Role)}
                className="w-full bg-slate-900 text-white text-xs border border-slate-600 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                  {user.roles.map(r => (
                      <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
              </select>
           </div>
        )}

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 mb-4 px-2">
             <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-medium truncate">{user.name}</p>
               <p className="text-xs text-slate-400 truncate capitalize">{activeRole.replace('_', ' ')} View</p>
             </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 py-2 rounded-md text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header (Visible on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
             <h1 className="text-xl font-bold text-white">PayFlow</h1>
             {user.roles.length > 1 && (
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                    {activeRole.replace('_', ' ')}
                </span>
             )}
        </div>
        <button onClick={logout} className="text-slate-300">
          <LogOut size={20} />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-16">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
