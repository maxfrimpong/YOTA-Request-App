import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { LogOut, LayoutDashboard, RefreshCw, Bell, Check, X, User as UserIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ChatWidget } from './ChatWidget';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, activeRole, switchRole, logout, notifications, markAsRead, markAllAsRead } = useApp();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Filter notifications for current user
  const myNotifications = notifications.filter(n => n.userId === user?.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user || !activeRole) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'My Profile', icon: UserIcon, path: '/profile' },
  ];

  const NotificationPanel = () => (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-700 text-sm">Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {myNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-xs">No notifications</div>
        ) : (
          myNotifications.map(notification => (
            <div 
              key={notification.id} 
              onClick={() => markAsRead(notification.id)}
              className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                <div>
                   <p className={`text-sm ${!notification.isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                     {notification.message}
                   </p>
                   <p className="text-xs text-gray-400 mt-1">
                     {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · {new Date(notification.createdAt).toLocaleDateString()}
                   </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

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
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 py-2 rounded-md text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen relative">
          
          {/* Desktop Header */}
          <header className="hidden md:flex justify-between items-center py-4 px-8 bg-white border-b border-gray-200 shadow-sm z-20">
              <h2 className="text-xl font-bold text-gray-800">
                {location.pathname === '/profile' ? 'User Profile' : 
                 activeRole === Role.ADMIN ? 'System Administration' : 
                 activeRole === Role.APPROVER ? 'Executive Portal' : 
                 activeRole === Role.AUTHORIZER ? 'Authorizer Dashboard' : 'Staff Dashboard'}
              </h2>
              
              <div className="flex items-center space-x-6">
                  {/* Notification Bell */}
                  <div className="relative" ref={notificationRef}>
                      <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                      >
                          <Bell size={20} />
                          {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                          )}
                      </button>
                      {showNotifications && <NotificationPanel />}
                  </div>

                  {/* User Profile Snippet */}
                  <Link to="/profile" className="flex items-center space-x-3 pl-6 border-l border-gray-200 hover:bg-gray-50 transition-colors p-2 rounded-lg cursor-pointer">
                     <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.department}</p>
                     </div>
                     <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
                        {user.name.charAt(0)}
                     </div>
                  </Link>
              </div>
          </header>

          {/* Mobile Header */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-50 flex items-center justify-between px-4 shadow-md">
            <div className="flex items-center space-x-2">
                <Link to="/" className="text-xl font-bold text-white">PayFlow</Link>
                {user.roles.length > 1 && (
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                        {activeRole.replace('_', ' ')}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-3">
                <Link to="/profile" className="text-slate-300 hover:text-white">
                    <UserIcon size={20} />
                </Link>
                <div className="relative" ref={notificationRef}>
                      <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-300 hover:bg-slate-800 rounded-full transition-colors"
                      >
                          <Bell size={20} />
                          {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                          )}
                      </button>
                      {showNotifications && <NotificationPanel />}
                </div>
                <button onClick={logout} className="text-slate-300">
                   <LogOut size={20} />
                </button>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto md:pt-0 pt-16 bg-gray-50 relative">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
              {children}
            </div>
          </main>

          {/* Chat Widget */}
          <ChatWidget />
      </div>
    </div>
  );
};