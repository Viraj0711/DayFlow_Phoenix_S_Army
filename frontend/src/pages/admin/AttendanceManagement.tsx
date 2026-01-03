import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';
import { AttendanceRecord, AttendanceOverview } from '@/types';
import { formatDate } from '@/lib/utils';
import { Calendar, Download, Filter, Users, UserCheck, UserX } from 'lucide-react';

const AttendanceManagement: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AttendanceOverview | null>(null);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate]);

  useEffect(() => {
    filterRecordsList();
  }, [searchQuery, filterStatus, attendanceRecords]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRecords: AttendanceRecord[] = [
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: 'Sarah Johnson',
          date: selectedDate,
          checkIn: '09:15 AM',
          checkOut: '06:30 PM',
          status: 'present',
          workHours: 9.25,
        },
        {
          id: '2',
          employeeId: 'EMP002',
          employeeName: 'Michael Chen',
          date: selectedDate,
          status: 'absent',
        },
        {
          id: '3',
          employeeId: 'EMP003',
          employeeName: 'Priya Sharma',
          date: selectedDate,
          status: 'leave',
          remarks: 'Approved paid leave',
        },
        {
          id: '4',
          employeeId: 'EMP004',
          employeeName: 'David Williams',
          date: selectedDate,
          checkIn: '09:00 AM',
          checkOut: '01:00 PM',
          status: 'half-day',
          workHours: 4,
          remarks: 'Medical appointment',
        },
        {
          id: '5',
          employeeId: 'EMP005',
          employeeName: 'Anjali Patel',
          date: selectedDate,
          checkIn: '08:45 AM',
          checkOut: '06:00 PM',
          status: 'present',
          workHours: 9.25,
        },
        {
          id: '6',
          employeeId: 'EMP006',
          employeeName: 'Robert Brown',
          date: selectedDate,
          checkIn: '09:30 AM',
          status: 'present',
        },
        {
          id: '7',
          employeeId: 'EMP007',
          employeeName: 'Emma Davis',
          date: selectedDate,
          checkIn: '09:10 AM',
          checkOut: '06:15 PM',
          status: 'present',
          workHours: 9.08,
        },
        {
          id: '8',
          employeeId: 'EMP008',
          employeeName: 'James Wilson',
          date: selectedDate,
          status: 'absent',
        },
      ];

      const mockOverview: AttendanceOverview = {
        totalEmployees: 142,
        present: 125,
        absent: 9,
        onLeave: 4,
        halfDay: 4,
        date: selectedDate,
      };

      setAttendanceRecords(mockRecords);
      setOverview(mockOverview);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecordsList = () => {
    let filtered = attendanceRecords;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((record) => record.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.employeeName.toLowerCase().includes(query) ||
          record.employeeId.toLowerCase().includes(query)
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const attendancePercentage = overview
    ? ((overview.present / overview.totalEmployees) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage employee attendance across the organization
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Date Selector & Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Date Selector */}
        <div className="lg:col-span-2 card">
          <label className="label">Select Date</label>
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" size={20} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">Attendance Rate</p>
            <p className="text-3xl font-bold text-primary-600 mt-1">
              {attendancePercentage}%
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-2">
              <Users size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {overview?.totalEmployees}
            </p>
            <p className="text-xs text-gray-600 mt-1">Total</p>
          </div>

          <div className="card text-center">
            <div className="mx-auto w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-2">
              <UserCheck size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{overview?.present}</p>
            <p className="text-xs text-gray-600 mt-1">Present</p>
          </div>

          <div className="card text-center">
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-2">
              <UserX size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{overview?.absent}</p>
            <p className="text-xs text-gray-600 mt-1">Absent</p>
          </div>

          <div className="card text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center mb-2">
              <Calendar size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{overview?.onLeave}</p>
            <p className="text-xs text-gray-600 mt-1">On Leave</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by employee name or ID..."
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('present')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'present'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Present
            </button>
            <button
              onClick={() => setFilterStatus('absent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'absent'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Absent
            </button>
            <button
              onClick={() => setFilterStatus('leave')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'leave'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Leave
            </button>
            <button
              onClick={() => setFilterStatus('half-day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'half-day'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Half Day
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">
                          {record.employeeName}
                        </p>
                        <p className="text-sm text-gray-500">{record.employeeId}</p>
                      </div>
                    </td>
                    <td>
                      <p className="text-gray-900">
                        {record.checkIn || '-'}
                      </p>
                    </td>
                    <td>
                      <p className="text-gray-900">
                        {record.checkOut || '-'}
                      </p>
                    </td>
                    <td>
                      <p className="text-gray-900">
                        {record.workHours ? `${record.workHours.toFixed(2)} hrs` : '-'}
                      </p>
                    </td>
                    <td>
                      <Badge status={record.status}>{record.status}</Badge>
                    </td>
                    <td>
                      <p className="text-gray-900 text-sm">
                        {record.remarks || '-'}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;
