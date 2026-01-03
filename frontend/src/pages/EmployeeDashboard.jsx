import React, { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { StatCard, Card, CardHeader, CardTitle, CardBody } from '../components/Card';
import { attendanceAPI, leaveAPI, payrollAPI } from '../services/api';
import './Dashboard.css';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    attendance: { present: 0, total: 0, percentage: 0 },
    leaves: { used: 0, total: 0, remaining: 0 },
    payroll: { lastPay: 0, currency: 'USD' },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const [attendanceRes, leaveRes, payrollRes] = await Promise.all([
        attendanceAPI.getAttendanceByMonth(year, month),
        leaveAPI.getLeaveBalance(),
        payrollAPI.getMyPayroll(),
      ]);

      const attendanceData = attendanceRes.data || [];
      const presentDays = attendanceData.filter((a) => a.status === 'present').length;
      const totalWorkingDays = new Date(year, month, 0).getDate();

      setStats({
        attendance: {
          present: presentDays,
          total: totalWorkingDays,
          percentage: totalWorkingDays > 0 ? ((presentDays / totalWorkingDays) * 100).toFixed(1) : 0,
        },
        leaves: leaveRes.data || { used: 0, total: 0, remaining: 0 },
        payroll: {
          lastPay: payrollRes.data?.[0]?.netSalary || 0,
          currency: 'USD',
        },
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Mark Attendance', path: '/attendance', icon: FiClock },
    { label: 'Apply Leave', path: '/leave', icon: FiCalendar },
    { label: 'View Payslip', path: '/payroll', icon: FiDollarSign },
  ];

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's your overview</p>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Attendance This Month"
          value={`${stats.attendance.present}/${stats.attendance.total}`}
          change={`${stats.attendance.percentage}%`}
          trend="up"
          gradient="primary"
        />
        <StatCard
          label="Leave Balance"
          value={stats.leaves.remaining}
          subtitle={`${stats.leaves.used} used of ${stats.leaves.total}`}
          gradient="secondary"
        />
        <StatCard
          label="Last Payroll"
          value={`$${stats.payroll.lastPay.toLocaleString()}`}
          gradient="accent"
        />
        <StatCard
          label="Performance"
          value="Excellent"
          change="+12%"
          trend="up"
          gradient="success"
        />
      </div>

      <div className="dashboard-grid">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="quick-actions">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a
                    key={action.path}
                    href={action.path}
                    className="quick-action-card"
                  >
                    <Icon className="quick-action-icon" />
                    <span>{action.label}</span>
                  </a>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon success">
                  <FiClock />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Checked In</p>
                  <p className="activity-time">Today at 9:00 AM</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon primary">
                  <FiCalendar />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Leave Approved</p>
                  <p className="activity-time">Yesterday</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon accent">
                  <FiDollarSign />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Payslip Generated</p>
                  <p className="activity-time">3 days ago</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
