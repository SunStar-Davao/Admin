import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, Eye, EyeOff, Shield } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative">
          <div className="absolute inset-0 bg-black/70 z-10"></div>
        <img 
          src="/bg.png" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />s
        <div className="relative z-10 flex flex-col justify-between p-8 h-full">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/sunstarlogo.jpg" 
                  alt="SunStar Davao" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-white text-lg font-medium">SunStar Davao</span>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-semibold text-white mb-3">Admin Portal</h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Manage employees, track attendance, and oversee operations from a single dashboard.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-1 w-10 bg-amber-500"></div>
              <span className="text-gray-400 text-xs">Since 1982</span>
            </div>
          </div>
          
          <div className="text-gray-300 text-sm">
           © 2024 SunStar Davao. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center lg:text-left mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Welcome back</h2>
            <p className="text-xs text-gray-500 mt-1">Sign in to your admin account</p>
          </div>

          <div className="bg-white border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <LogIn size="14" className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admin Login</span>
              </div>
            </div>

            <div className="p-5">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User size="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:border-gray-300"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-1.5 text-sm border border-gray-200 focus:outline-none focus:border-gray-300"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size="14" /> : <Eye size="14" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-gray-800" />
                    <span className="text-xs text-gray-500">Remember me</span>
                  </label>
                  <a href="#" className="text-xs text-gray-500 hover:text-gray-800">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-400">Other access</span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => window.location.href = 'https://employee-tan-six.vercel.app/'}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <Shield size="12" />
                    <span>Employee Login</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
