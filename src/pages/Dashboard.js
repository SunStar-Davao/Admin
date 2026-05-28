import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, TrendingUp, BarChart3, RefreshCw, UserCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import pusherService from '../services/pusher';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchDashboardStats();
    fetchWeeklyData();
    
    const unsubscribe = pusherService.subscribe('attendance-channel', 'new-attendance', () => {
      fetchDashboardStats(true);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [timeRange]);

  const fetchDashboardStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const days = timeRange === 'week' ? 7 : 30;
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await api.get(`/admin/attendance/report?startDate=${startDate}&endDate=${endDate}`);
      
      if (response.data.success) {
        const grouped = response.data.data.reduce((acc, record) => {
          const date = record.date;
          if (!acc[date]) {
            acc[date] = { 
              date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              fullDate: date,
              present: 0, 
              late: 0, 
              absent: 0,
            };
          }
          if (record.status === 'present') acc[date].present++;
          if (record.status === 'late') acc[date].late++;
          if (record.status === 'absent') acc[date].absent++;
          return acc;
        }, {});

        const chartData = Object.values(grouped).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
        setWeeklyData(chartData);
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats(true);
    fetchWeeklyData();
  };

  const pieData = [
    { name: 'Present', value: stats.presentToday, color: '#10b981' },
    { name: 'Late', value: stats.lateToday, color: '#f59e0b' },
    { name: 'Absent', value: stats.absentToday, color: '#ef4444' },
  ].filter(item => item.value > 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-400">Overview</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 border border-gray-200"
            >
              <RefreshCw size="14" className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size="12" className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            
            <div className="flex border border-gray-200">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeRange === 'week' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeRange === 'month' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:max-w-7xl md:mx-auto md:px-6 pb-20 md:pb-6">
        {/* Mobile Time Range Selector */}
        <div className="md:hidden px-4 mb-4">
          <div className="flex border border-gray-200 bg-white">
            <button
              onClick={() => setTimeRange('week')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                timeRange === 'week' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-500'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                timeRange === 'month' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-500'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Stats Row - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 gap-3 px-4 md:px-0 mb-6">
          <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} />
          <StatCard title="Present" value={stats.presentToday} icon={Calendar} />
          <StatCard title="Late" value={stats.lateToday} icon={Clock} />
          <StatCard title="Absent" value={stats.absentToday} icon={UserCheck} />
        </div>

        {/* Mobile Stats Summary Card */}
        <div className="md:hidden px-4 mb-6">
          <div className="bg-white border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-2">Last updated</p>
            <p className="text-sm text-gray-900">{lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-0">
          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <TrendingUp size="14" className="text-gray-400" />
                    Attendance Trend
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {timeRange === 'week' ? 'Last 7 days' : 'Last 30 days'}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500"></span>
                    <span className="text-gray-500">Present</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-500"></span>
                    <span className="text-gray-500">Late</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500"></span>
                    <span className="text-gray-500">Absent</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="present" 
                      name="Present"
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="#10b981"
                      fillOpacity={0.1}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="late" 
                      name="Late"
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      fill="#f59e0b"
                      fillOpacity={0.1}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="absent" 
                      name="Absent"
                      stroke="#ef4444" 
                      strokeWidth={2}
                      fill="#ef4444"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[280px]">
                  <BarChart3 size="32" className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="bg-white border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <BarChart3 size="14" className="text-gray-400" />
                Today's Distribution
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="p-4">
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 space-y-2">
                    {pieData.map((item) => {
                      const total = stats.presentToday + stats.lateToday + stats.absentToday;
                      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      return (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2" style={{ backgroundColor: item.color }}></span>
                            <span className="text-xs text-gray-600">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-900">{item.value}</span>
                            <span className="text-xs text-gray-400 w-10 text-right">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Total</span>
                      <span className="text-sm font-medium text-gray-900">
                        {stats.presentToday + stats.lateToday + stats.absentToday}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[260px]">
                  <BarChart3 size="32" className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No attendance yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;