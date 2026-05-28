import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Activity, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Add this
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/real-time', icon: Activity, label: 'Live Monitor' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <div 
        className={`hidden lg:block ${
          collapsed ? 'w-16' : 'w-56'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-200 relative min-h-screen`}
      >
        {/* Collapse toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-10 w-5 h-5 bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors z-50"
        >
          {collapsed ? <ChevronRight size="12" /> : <ChevronLeft size="12" />}
        </button>

        {/* Logo Section */}
        <div className={`py-5 border-b border-gray-100 ${collapsed ? 'px-0' : 'px-4'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
           <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
            <img 
              src="/sunstarlogo.jpg" 
              alt="SunStar Davao" 
              className="w-full h-full object-contain"
            />
          </div>
            {!collapsed && (
              <div>
                <h1 className="text-sm font-semibold text-gray-900 leading-tight">SunStar Davao</h1>
                <p className="text-[10px] text-gray-400 leading-tight">Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-4 px-2">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'} px-3 py-2 transition-colors relative group ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`
                  }
                >
                  <item.icon size="16" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* System Section */}
          {/* {!collapsed && (
            <div className="mt-6 pt-3 border-t border-gray-100">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">
                System
              </p>
              <ul className="space-y-0.5">
                <li>
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 transition-colors ${
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`
                    }
                  >
                    <Settings size="14" />
                    <span className="text-sm">Settings</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/help"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 transition-colors ${
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`
                    }
                  >
                    <HelpCircle size="14" />
                    <span className="text-sm">Help</span>
                  </NavLink>
                </li>
              </ul>
            </div>
          )} */}
        </nav>

        {/* User Info & Logout */}
        <div className={`py-4 border-t border-gray-100 ${collapsed ? 'px-2' : 'px-4'}`}>
          {/* {!collapsed && user && (
            <div className="mb-3 px-3 py-2 bg-gray-50">
              <p className="text-[10px] text-gray-400">Logged in as</p>
              <p className="text-xs font-medium text-gray-800 truncate">{user?.name?.split(' ')[0] || 'Admin'}</p>
            </div>
          )} */}
          
          <button
            onClick={handleLogout}
            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'} w-full px-3 text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors group relative`}
          >
            {/* <LogOut size="16" className="group-hover:text-red-600" /> */}
            {/* {!collapsed && <span className="text-sm font-medium">Sign Out</span>} */}
            
            {/* Tooltip for collapsed mode */}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                Sign Out
              </span>
            )}
          </button>

          {!collapsed && (
            <p className="text-center text-[10px] text-gray-400 mt-4">
              v2.0 © 2026
            </p>
          )}
        </div>

        {collapsed && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <div className="w-1 h-1 bg-gray-300"></div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation - visible only on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-20">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                <item.icon size="20" className={isActive ? 'text-gray-900' : 'text-gray-400'} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
         
        </div>
      </div>
    </>
  );
};

export default Sidebar;
