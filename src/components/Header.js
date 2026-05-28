import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, LogOut, ChevronDown, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import pusherService from '../services/pusher';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = pusherService.subscribe('attendance-channel', 'new-attendance', (data) => {
      const newNotif = {
        id: Date.now(),
        message: `${data.employeeName} just clocked ${data.type === 'IN' ? 'in' : 'out'}`,
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        type: data.type,
        read: false
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 10));
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="px-4 py-2 md:px-6 md:py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and company text (mobile only) */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 flex items-center justify-center">
              <img 
                src="/sunstarlogo.jpg" 
                alt="SunStar Davao" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-sm font-semibold text-gray-900">SunStar Davao</span>
          </div>

          {/* Left side - Time and date (desktop only) */}
          <div className="hidden md:flex items-center gap-2">
            <Clock size="14" className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">
              {formatDate(currentTime)}
            </span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile time */}
            <div className="md:hidden flex items-center gap-1">
              <Clock size="12" className="text-gray-400" />
              <span className="text-xs text-gray-600">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 md:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Bell size="16" className="md:w-[18px] md:h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-medium min-w-[14px] h-[14px] flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-gray-200 shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {unreadCount} unread
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                            !notif.read ? 'bg-gray-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`mt-1 w-1.5 h-1.5 flex-shrink-0 ${
                              notif.type === 'IN' ? 'bg-green-500' : 'bg-amber-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-700">{notif.message}</p>
                              <div className="flex items-center mt-1 text-xs text-gray-400">
                                <Clock size="10" className="mr-1" />
                                {notif.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell size="20" className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1 md:gap-2 p-1 md:p-1.5 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-6 h-6 md:w-7 md:h-7 bg-gray-100 border border-gray-200 flex items-center justify-center rounded-full overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                  ) : (
                    <User size="14" className="text-gray-500" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name?.split(' ')[0] || 'Admin'}</p>
                  <p className="text-xs text-gray-400">{user?.role || 'Admin'}</p>
                </div>
                <ChevronDown 
                  size="14" 
                  className={`text-gray-400 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user?.email || 'admin@sunstar.com'}</p>
                  </div>
                  
                  <div className="border-t border-gray-100 py-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size="14" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;