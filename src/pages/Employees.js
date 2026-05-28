import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Trash2, Download, ChevronLeft, ChevronRight, Users, Filter } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await api.delete(`/admin/employees/${id}`);
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get unique departments from employees data
  const getUniqueDepartments = () => {
    const depts = new Set();
    employees.forEach(emp => {
      if (emp.department) {
        depts.add(emp.department);
      }
    });
    return Array.from(depts).sort();
  };

  const uniqueDepartments = getUniqueDepartments();

  // Filter employees
  const filteredEmployees = employees
    .filter(emp => {
      const matchesSearch = search === '' || 
        emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(search.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'name') {
        aVal = a.name || '';
        bVal = b.name || '';
      } else if (sortField === 'employee_id') {
        aVal = a.employee_id || '';
        bVal = b.employee_id || '';
      } else if (sortField === 'created_at') {
        aVal = new Date(a.created_at || 0);
        bVal = new Date(b.created_at || 0);
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Employees</h1>
              <p className="text-xs text-gray-400">{filteredEmployees.length} total</p>
            </div>
            <button className="p-2 bg-gray-900 text-white">
              <UserPlus size="16" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Employees</h1>
            <p className="text-xs text-gray-400">{filteredEmployees.length} total employees</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 hover:bg-gray-50">
              <Download size="12" />
              <span>Export</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-900 text-white hover:bg-gray-800">
              <UserPlus size="12" />
              <span>Add Employee</span>
            </button>
          </div>
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
          </button>
        </div>

        {/* Filters */}
        <div className={`px-4 md:px-0 mb-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white border border-gray-200">
            <div className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1">
                  <Search size="14" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-300"
                  />
                </div>

                <div className="relative w-full md:w-48">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gray-300 appearance-none bg-white"
                  >
                    <option value="all">All Departments</option>
                    {uniqueDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="hidden md:block text-xs text-gray-400">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-2 px-4">
          {currentItems.map((emp) => (
            <div key={emp.employee_id} className="bg-white border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                    {emp.image_url ? (
                      <img src={emp.image_url} className="w-full h-full object-cover" alt={emp.name} />
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        {emp.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{emp.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 font-mono">{emp.employee_id || 'N/A'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(emp.employee_id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size="14" />
                </button>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Department:</span>
                <span className="text-xs font-medium text-gray-700">{emp.department || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-500">Position:</span>
                <span className="text-xs text-gray-600">{emp.role || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-500">Joined:</span>
                <span className="text-xs text-gray-600">
                  {emp.created_at ? new Date(emp.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Employee</span>
                    {sortField === 'name' && <span className="text-gray-400 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('employee_id')}>
                  <div className="flex items-center gap-1">
                    <span>Employee ID</span>
                    {sortField === 'employee_id' && <span className="text-gray-400 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-1">
                    <span>Joined</span>
                    {sortField === 'created_at' && <span className="text-gray-400 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentItems.map((emp) => (
                <tr key={emp.employee_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {emp.image_url ? (
                          <img src={emp.image_url} className="w-full h-full object-cover" alt={emp.name} />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">
                            {emp.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{emp.name || 'Unknown'}</span>
                        <p className="text-xs text-gray-400 mt-0.5">Position: {emp.role || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-mono text-gray-500">{emp.employee_id || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600">{emp.department || 'Unassigned'}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {emp.created_at ? new Date(emp.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button onClick={() => handleDelete(emp.employee_id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size="14" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 px-4">
            <Users size="32" className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No employees found</h3>
            <p className="text-xs text-gray-400">
              {search || selectedDepartment !== 'all' ? 'Try adjusting your search or filter' : 'No employees have been added yet'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredEmployees.length > 0 && (
          <div className="px-4 md:px-0 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-0">
            <div className="text-xs text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-200 bg-white text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size="14" />
              </button>
              <div className="hidden md:flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 text-xs font-medium ${
                        currentPage === pageNum
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <span className="md:hidden text-xs text-gray-500">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-200 bg-white text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight size="14" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;