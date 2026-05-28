import React, { useState, useEffect } from 'react';
import { Users, Clock, RefreshCw } from 'lucide-react';
import api from '../services/api';
import pusherService from '../services/pusher';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const RealTimeMonitor = () => {
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshInterval] = useState(30);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval * 1000);

    const unsubscribeNew = pusherService.subscribe('attendance-channel', 'new-attendance', () => {
      fetchData(true);
    });

    const unsubscribeUpdate = pusherService.subscribe('attendance-channel', 'attendance-updated', () => {
      fetchData(true);
    });

    return () => {
      clearInterval(interval);
      if (unsubscribeNew) unsubscribeNew();
      if (unsubscribeUpdate) unsubscribeUpdate();
    };
  }, [refreshInterval]);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const attendanceRes = await api.get('/admin/attendance/today');
      setTodayAttendance(attendanceRes.data.data || []);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error fetching real-time data:', error);
      if (!silent) toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const EmployeeCard = ({ employee }) => {
    const isClockedOut = !!employee.time_out;
    const isLate = employee.late_minutes > 0;

    return (
      <div className="bg-white border border-gray-200">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center">
                {employee.employees?.image_url ? (
                  <img
                    src={employee.employees.image_url}
                    className="w-full h-full object-cover"
                    alt={employee.employees.name}
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-600">
                    {employee.employees?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{employee.employees?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {employee.employee_id}</p>
              </div>
            </div>
            <div className={`px-2 py-0.5 text-xs font-medium ${
              isClockedOut 
                ? 'bg-gray-100 text-gray-500' 
                : isLate
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-green-50 text-green-600 border border-green-200'
            }`}>
              {isClockedOut ? 'CLOCKED OUT' : isLate ? 'LATE' : 'ACTIVE'}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Time In</span>
              <span className="text-xs font-mono text-gray-700">{formatTime(employee.time_in)}</span>
            </div>
            
            {employee.time_out && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Time Out</span>
                <span className="text-xs font-mono text-gray-700">{formatTime(employee.time_out)}</span>
              </div>
            )}

            {employee.late_minutes > 0 && (
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-100">
                <span className="text-xs text-amber-600">Late by</span>
                <span className="text-xs font-medium text-amber-600">{formatDuration(employee.late_minutes)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stillWorking = todayAttendance.filter(a => !a.time_out).length;
  const lateCount = todayAttendance.filter(a => a.late_minutes > 0).length;
  const clockedOut = todayAttendance.filter(a => a.time_out).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Live Monitor</h1>
              <p className="text-xs text-gray-400">{todayAttendance.length} today</p>
            </div>
            <button
              onClick={() => fetchData(false)}
              className="p-2 text-gray-500 border border-gray-200"
            >
              <RefreshCw size="14" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Real-Time Monitor</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Auto-refreshes every {refreshInterval} seconds • Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => fetchData(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-900 text-white hover:bg-gray-800"
          >
            <RefreshCw size="12" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:max-w-7xl md:mx-auto md:px-6 pb-20 md:pb-6">
        {/* Stats Cards - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 md:px-0 mb-6">
          <div className="bg-white border border-gray-200 p-3">
            <p className="text-xs text-gray-400">Total Today</p>
            <p className="text-xl font-semibold text-gray-900">{todayAttendance.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-3">
            <p className="text-xs text-gray-400">Still Working</p>
            <p className="text-xl font-semibold text-blue-600">{stillWorking}</p>
          </div>
          <div className="bg-white border border-gray-200 p-3">
            <p className="text-xs text-gray-400">Clocked Out</p>
            <p className="text-xl font-semibold text-gray-500">{clockedOut}</p>
          </div>
          <div className="bg-white border border-gray-200 p-3">
            <p className="text-xs text-gray-400">Late Today</p>
            <p className="text-xl font-semibold text-amber-600">{lateCount}</p>
          </div>
        </div>

        {/* Mobile Last Updated */}
        <div className="md:hidden px-4 mb-4">
          <p className="text-xs text-gray-400 text-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Today's Attendance Section */}
        <div className="px-4 md:px-0">
          <div className="bg-white border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size="14" className="text-gray-400" />
                  <h2 className="text-sm font-medium text-gray-900">Today's Attendance</h2>
                  <span className="text-xs text-gray-400">({todayAttendance.length})</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500"></span>
                    <span className="text-gray-500">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-500"></span>
                    <span className="text-gray-500">Late</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400"></span>
                    <span className="text-gray-500">Clocked out</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {todayAttendance.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {todayAttendance.map((employee) => (
                    <EmployeeCard key={employee.id} employee={employee} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock size="32" className="text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No attendance records</h3>
                  <p className="text-xs text-gray-400">No one has clocked in yet today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitor;