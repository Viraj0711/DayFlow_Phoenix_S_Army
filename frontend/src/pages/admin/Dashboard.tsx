import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '@/components/StatCard';
import { Users, UserCheck, Calendar, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { DashboardStats, LeaveRequest, AttendanceRecord } from '@/types';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/Badge';
import api from '@/lib/api';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In production, these would be actual API calls
      // For now, using mock data
      setStats({
        totalEmployees: 142,
        activeEmployees: 138,
        onLeaveToday: 4,
        pendingLeaveRequests: 7,
        todayAttendance: {
          present: 125,
          absent: 9,
          notMarked: 8,
        },
        monthlyStats: {
          newJoinees: 5,
          resignations: 2,
          averageAttendance: 92.5,
        },
      });

      setRecentLeaves([
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: 'Sarah Johnson',
          employeeEmail: 'sarah.j@dayflow.com',
          leaveType: 'paid',
          startDate: '2026-01-10',
          endDate: '2026-01-12',
          totalDays: 3,
          reason: 'Family vacation',
          status: 'pending',
          appliedOn: '2026-01-03',
        },
        {
          id: '2',
          employeeId: 'EMP023',
          employeeName: 'Michael Chen',
          employeeEmail: 'michael.c@dayflow.com',
          leaveType: 'sick',
          startDate: '2026-01-05',
          endDate: '2026-01-05',
          totalDays: 1,
          reason: 'Medical appointment',
          status: 'pending',
          appliedOn: '2026-01-02',
        },
        {
          id: '3',
          employeeId: 'EMP045',
          employeeName: 'Priya Sharma',
          employeeEmail: 'priya.s@dayflow.com',
          leaveType: 'casual',
          startDate: '2026-01-08',
          endDate: '2026-01-09',
          totalDays: 2,
          reason: 'Personal work',
          status: 'pending',
          appliedOn: '2026-01-03',
        },
      ]);

      setTodayAttendance([
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: 'Sarah Johnson',
          date: '2026-01-03',
          checkIn: '09:15 AM',
          checkOut: '06:30 PM',
          status: 'present',
          workHours: 9.25,
        },
        {
          id: '2',
          employeeId: 'EMP023',
          employeeName: 'Michael Chen',
          date: '2026-01-03',
          status: 'absent',
        },
        {
          id: '3',
          employeeId: 'EMP045',
          employeeName: 'Priya Sharma',
          date: '2026-01-03',
          checkIn: '09:00 AM',
          status: 'present',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={Users}
          color="blue"
          trend={{ value: 3.2, isPositive: true }}
          onClick={() => navigate('/admin/employees')}
        />
        <StatCard
          title="Present Today"
          value={stats?.todayAttendance.present || 0}
          icon={UserCheck}
          color="green"
          onClick={() => navigate('/admin/attendance')}
        />
        <StatCard
          title="On Leave"
          value={stats?.onLeaveToday || 0}
          icon={Calendar}
          color="yellow"
          onClick={() => navigate('/admin/leave-requests')}
        />
        <StatCard
          title="Pending Requests"
          value={stats?.pendingLeaveRequests || 0}
          icon={AlertCircle}
          color="red"
          onClick={() => navigate('/admin/leave-requests')}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Joinees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.monthlyStats.newJoinees}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.monthlyStats.averageAttendance}%
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.activeEmployees}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                of {stats?.totalEmployees} total
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leave Requests & Today's Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Leave Requests
            </h2>
            <button
              onClick={() => navigate('/admin/leave-requests')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentLeaves.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No pending requests
              </p>
            ) : (
              recentLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
                  onClick={() => navigate('/admin/leave-requests')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {leave.employeeName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''} • {leave.reason}
                      </p>
                    </div>
                    <Badge status={leave.leaveType} className="capitalize">
                      {leave.leaveType}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Attendance Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Today's Attendance
            </h2>
            <button
              onClick={() => navigate('/admin/attendance')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </button>
          </div>
          
          {/* Attendance Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats?.todayAttendance.present}
              </p>
              <p className="text-xs text-gray-600 mt-1">Present</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {stats?.todayAttendance.absent}
              </p>
              <p className="text-xs text-gray-600 mt-1">Absent</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">
                {stats?.todayAttendance.notMarked}
              </p>
              <p className="text-xs text-gray-600 mt-1">Not Marked</p>
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Recent Check-ins</p>
            {todayAttendance.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {record.employeeName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {record.checkIn ? `Check-in: ${record.checkIn}` : 'Not checked in'}
                  </p>
                </div>
                <Badge status={record.status}>
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
