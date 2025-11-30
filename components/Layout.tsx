
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { LogOut, LayoutDashboard, RefreshCw, Bell, Check, X, User as UserIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ChatWidget } from './ChatWidget';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, activeRole, switchRole, logout, notifications, markAsRead, markAllAsRead, logoUrl } = useApp();
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
          <button onClick={markAllAsRead} className="text-xs text-brand-teal hover:text-brand-dark">
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
              className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-brand-teal/5' : ''}`}
            >
              <div className="flex gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-brand-orange' : 'bg-transparent'}`} />
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
      <aside className="w-64 bg-brand-dark text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10 flex flex-col">
          <div className="bg-white p-3 rounded-lg w-full flex items-center justify-center mb-4 shadow-sm h-20">
             <img src={logoUrl} alt="Organization Logo" className="max-h-full max-w-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-white pl-1">
            SendREQ
          </h1>
          <p className="text-brand-teal text-xs mt-1 pl-1">YOTA Payment Request System</p>
        </div>

        {/* Role Switcher if applicable */}
        {user.roles.length > 1 && (
           <div className="px-6 py-4 bg-black/20 border-b border-white/10">
              <label className="text-xs text-brand-teal font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                 <RefreshCw size={10} /> Switch View
              </label>
              <select 
                value={activeRole}
                onChange={(e) => switchRole(e.target.value as Role)}
                className="w-full bg-brand-dark text-white text-xs border border-white/20 rounded p-2 focus:ring-1 focus:ring-brand-teal focus:outline-none"
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
                  ? 'bg-brand-teal text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-black/20 hover:bg-black/40 py-2 rounded-md text-sm transition-colors text-gray-300 hover:text-white"
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
                 activeRole === Role.AUTHORIZER ? 'Authorizer Dashboard' : 
                 activeRole === Role.AUDITOR ? 'Auditor Access Portal' : 'Staff Dashboard'}
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
                            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-brand-orange rounded-full border-2 border-white"></span>
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
                     <div className="w-9 h-9 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-bold border-2 border-white shadow-sm overflow-hidden">
                        {user.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user.name.charAt(0)
                        )}
                     </div>
                  </Link>
              </div>
          </header>

          {/* Mobile Header */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-brand-dark z-50 flex items-center justify-between px-4 shadow-md">
            <div className="flex items-center space-x-2">
                <div className="bg-white p-1 rounded h-10 w-24 flex items-center justify-center">
                   <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Link to="/profile" className="text-gray-300 hover:text-white flex items-center">
                    <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-bold border border-white/20 overflow-hidden bg-white/10">
                        {user.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={16} className="text-white" />
                        )}
                    </div>
                </Link>
                <div className="relative" ref={notificationRef}>
                      <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-gray-300 hover:bg-white/10 rounded-full transition-colors"
                      >
                          <Bell size={20} />
                          {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-brand-orange rounded-full border-2 border-brand-dark"></span>
                          )}
                      </button>
                      {showNotifications && <NotificationPanel />}
                </div>
                <button onClick={logout} className="text-gray-300">
                   <LogOut size={20} />
                </button>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto md:pt-0 pt-16 bg-gray-50 relative flex flex-col">
            <div className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-grow">
              {children}
            </div>
            <footer className="py-6 text-center border-t border-gray-200/50 mt-auto bg-gray-50/50">
                <p className="text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} SendREQ. Custom developed for <span className="font-semibold text-brand-dark">YOTA - Youth Opportunity and Transformation in Africa</span>.
                </p>
            </footer>
          </main>

          {/* Chat Widget */}
          <ChatWidget />
      </div>
    </div>
  );
};
