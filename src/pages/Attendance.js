import React, { useState, useEffect } from 'react';
import { Calendar, Download, Search, Filter, Clock, UserCheck, Users, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
  });

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [startDate, endDate, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      let url = `/admin/attendance/report?startDate=${startDate}&endDate=${endDate}`;
      if (selectedEmployee) {
        url += `&employeeId=${selectedEmployee}`;
      }
      
      const response = await api.get(url);
      
      if (response.data.success) {
        setAttendance(response.data.data || []);
        
        setSummary({
          total: response.data.summary?.totalDays || 0,
          present: response.data.summary?.present || 0,
          late: response.data.summary?.late || 0,
          absent: response.data.summary?.absent || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-50 text-green-600 border border-green-200';
      case 'late':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'absent':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-500 border border-gray-200';
    }
  };

  const formatLateTime = (minutes) => {
    if (!minutes || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const exportToExcel = () => {
    const exportData = attendance.map(record => ({
      'Date': formatFullDate(record.date),
      'Employee ID': record.employees?.employee_id || record.employee_id,
      'Employee Name': record.employees?.name || 'Unknown',
      'Time In': formatTime(record.time_in),
      'Time Out': formatTime(record.time_out),
      'Status': record.status?.toUpperCase() || 'UNKNOWN',
      'Late Minutes': record.late_minutes || 0,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `attendance_${startDate}_to_${endDate}.xlsx`);
    toast.success('Report exported successfully');
  };

  const filteredAttendance = attendance.filter(record => {
    if (!search) return true;
    const name = record.employees?.name?.toLowerCase() || '';
    const id = record.employees?.employee_id?.toLowerCase() || record.employee_id?.toLowerCase() || '';
    return name.includes(search.toLowerCase()) || id.includes(search.toLowerCase());
  });

  const attendanceRate = summary.total > 0 
    ? Math.round(((summary.present) / summary.total) * 100) 
    : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Attendance</h1>
              <p className="text-xs text-gray-400">{filteredAttendance.length} records</p>
            </div>
            <button
              onClick={exportToExcel}
              className="p-2 bg-gray-900 text-white"
            >
              <Download size="16" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Attendance Records</h1>
            <p className="text-xs text-gray-400">{filteredAttendance.length} records found</p>
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-900 text-white hover:bg-gray-800"
          >
            <Download size="12" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:max-w-7xl md:mx-auto md:px-6 pb-20 md:pb-6">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden px-4 mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 border border-gray-200 bg-white"
          >
            <Filter size="14" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {showFilters ? <ChevronUp size="14" /> : <ChevronDown size="14" />}
          </button>
        </div>

        {/* Filters */}
        <div className={`px-4 md:px-0 mb-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white border border-gray-200">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-300 appearance-none bg-white"
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.name} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                  <div className="relative">
                    <Search size="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Name or ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 md:px-0 mb-6">
          <div className="bg-white border border-gray-200 p-3">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-xl font-semibold text-gray-900">{summary.total}</p>
          </div>
          <div className="bg-white border border-gray-200 p-3">
            <p className="text-xs text-gray-400">Present</p>
            <p className="text-xl font-semibold text-green-600">{summary.present}</p>
          </div>
          <div className="bg-white border border-gray-200 p-3">
            <p className="text-xs text-gray-400">Late</p>
            <p className="text-xl font-semibold text-amber-600">{summary.late}</p>
          </div>
          <div className="bg-white border border-gray-200 p-3">
            <p className="text-xs text-gray-400">Absent</p>
            <p className="text-xl font-semibold text-red-600">{summary.absent}</p>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-2 px-4">
          {filteredAttendance.length > 0 ? (
            filteredAttendance.map((record) => (
              <div key={record.id} className="bg-white border border-gray-200 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {record.employees?.image_url ? (
                        <img src={record.employees.image_url} className="w-full h-full object-cover" alt={record.employees.name} />
                      ) : (
                        <span className="text-xs font-medium text-gray-600">
                          {record.employees?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.employees?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400 font-mono">{record.employees?.employee_id || record.employee_id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium ${getStatusColor(record.status)}`}>
                    {record.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-xs text-gray-700">{formatFullDate(record.date)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Time In</p>
                    <p className="text-xs font-mono text-gray-700">{formatTime(record.time_in)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Time Out</p>
                    <p className="text-xs font-mono text-gray-700">{formatTime(record.time_out)}</p>
                  </div>
                </div>
                {record.late_minutes > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-amber-600">{formatLateTime(record.late_minutes)} late</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 p-8 text-center">
              <Calendar size="32" className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No records found</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                      {formatFullDate(record.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 border border-gray-200 flex items-center justify-center">
                          {record.employees?.image_url ? (
                            <img src={record.employees.image_url} className="w-full h-full object-cover" alt={record.employees.name} />
                          ) : (
                            <span className="text-[10px] font-medium text-gray-600">
                              {record.employees?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{record.employees?.name || 'Unknown'}</span>
                          <p className="text-xs text-gray-400 font-mono">{record.employees?.employee_id || record.employee_id}</p>
                        </div>
                      </div>
                     </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-700">
                      {formatTime(record.time_in)}
                     </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500">
                      {formatTime(record.time_out)}
                     </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                     </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      {record.late_minutes > 0 ? (
                        <span className="text-amber-600">{formatLateTime(record.late_minutes)}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                     </td>
                   </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <Calendar size="32" className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No attendance records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;