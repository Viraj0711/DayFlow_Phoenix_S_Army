import React, { useState, useEffect } from 'react';
import { FiUsers, FiClock, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { StatCard, Card, CardHeader, CardTitle, CardBody } from '../components/Card';
import { adminAPI } from '../services/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    avgAttendance: 0,
  });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, leavesRes] = await Promise.all([
        adminAPI.getAllEmployees(),
        adminAPI.getPendingLeaves(),
      ]);

      const employees = employeesRes.data || [];
      const leaves = leavesRes.data || [];

      setStats({
        totalEmployees: employees.length,
        presentToday: Math.floor(employees.length * 0.92), // Mock data
        pendingLeaves: leaves.length,
        avgAttendance: 92,
      });

      setPendingLeaves(leaves.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-subtitle">Manage your organization efficiently</p>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Employees"
          value={stats.totalEmployees}
          change="+5 this month"
          trend="up"
          gradient="primary"
        />
        <StatCard
          label="Present Today"
          value={stats.presentToday}
          subtitle={`${((stats.presentToday / stats.totalEmployees) * 100).toFixed(0)}% attendance`}
          gradient="success"
        />
        <StatCard
          label="Pending Leave Requests"
          value={stats.pendingLeaves}
          gradient="accent"
        />
        <StatCard
          label="Avg Attendance"
          value={`${stats.avgAttendance}%`}
          change="+2.5%"
          trend="up"
          gradient="secondary"
        />
      </div>

      <div className="dashboard-grid">
        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Approvals</CardTitle>
          </CardHeader>
          <CardBody>
            {pendingLeaves.length === 0 ? (
              <p className="empty-state">No pending leave requests</p>
            ) : (
              <div className="leave-list">
                {pendingLeaves.map((leave) => (
                  <div key={leave.id} className="leave-item">
                    <div className="leave-info">
                      <p className="leave-employee">{leave.employeeName}</p>
                      <p className="leave-dates">
                        {new Date(leave.startDate).toLocaleDateString()} -{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`badge badge-${leave.type}`}>
                      {leave.leaveType}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="quick-stats">
              <div className="quick-stat">
                <div className="quick-stat-icon primary">
                  <FiUsers />
                </div>
                <div className="quick-stat-content">
                  <p className="quick-stat-value">
                    {Math.floor(stats.totalEmployees * 0.15)}
                  </p>
                  <p className="quick-stat-label">New Hires This Month</p>
                </div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-icon success">
                  <FiClock />
                </div>
                <div className="quick-stat-content">
                  <p className="quick-stat-value">98.5%</p>
                  <p className="quick-stat-label">On-Time Arrival Rate</p>
                </div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-icon accent">
                  <FiCalendar />
                </div>
                <div className="quick-stat-content">
                  <p className="quick-stat-value">
                    {Math.floor(stats.totalEmployees * 0.08)}
                  </p>
                  <p className="quick-stat-label">Employees on Leave</p>
                </div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-icon secondary">
                  <FiTrendingUp />
                </div>
                <div className="quick-stat-content">
                  <p className="quick-stat-value">+12%</p>
                  <p className="quick-stat-label">Productivity Growth</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
