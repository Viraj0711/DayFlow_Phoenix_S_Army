import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiClock, FiCalendar, FiDownload } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardBody, StatCard } from '../components/Card';
import { FormGroup, FormLabel, FormSelect } from '../components/Form';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import './Reports.css';

const Reports = () => {
  const { isAdmin } = useAuth();
  const [reportType, setReportType] = useState('attendance');
  const [period, setPeriod] = useState('month');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [reportType, period]);

  const fetchReport = async () => {
    try {
      if (isAdmin) {
        const response = await adminAPI.generateReport(reportType, { period });
        setReportData(response.data);
      } else {
        // Mock data for employee view
        generateMockData();
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
      generateMockData();
    }
  };

  const generateMockData = () => {
    setReportData({
      summary: {
        totalDays: 22,
        present: 20,
        absent: 1,
        late: 1,
        leaves: 3,
      },
      monthly: [
        { month: 'Jan', value: 95 },
        { month: 'Feb', value: 92 },
        { month: 'Mar', value: 97 },
        { month: 'Apr', value: 94 },
        { month: 'May', value: 96 },
        { month: 'Jun', value: 93 },
        { month: 'Jul', value: 95 },
        { month: 'Aug', value: 98 },
        { month: 'Sep', value: 94 },
        { month: 'Oct', value: 96 },
        { month: 'Nov', value: 95 },
        { month: 'Dec', value: 93 },
      ],
    });
  };

  const handleExport = () => {
    alert('Export feature requires backend integration');
  };

  const getMaxValue = () => {
    if (!reportData?.monthly) return 0;
    return Math.max(...reportData.monthly.map(d => d.value));
  };

  return (
    <DashboardLayout>
      <div className="reports-container">
        <div className="reports-header">
          <div>
            <h1 className="reports-title">Reports & Analytics</h1>
            <p className="reports-subtitle">View detailed insights and statistics</p>
          </div>
          <Button variant="primary" icon={FiDownload} onClick={handleExport}>
            Export Report
          </Button>
        </div>

        <div className="reports-filters">
          <FormGroup>
            <FormLabel htmlFor="reportType">Report Type</FormLabel>
            <FormSelect
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="attendance">Attendance Report</option>
              <option value="leave">Leave Report</option>
              <option value="performance">Performance Report</option>
              {isAdmin && <option value="payroll">Payroll Report</option>}
              {isAdmin && <option value="employee">Employee Report</option>}
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="period">Period</FormLabel>
            <FormSelect
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </FormSelect>
          </FormGroup>
        </div>

        {reportData && (
          <>
            <div className="stats-grid">
              <StatCard
                label="Total Days"
                value={reportData.summary?.totalDays || 0}
                gradient="primary"
              />
              <StatCard
                label="Present"
                value={reportData.summary?.present || 0}
                gradient="success"
              />
              <StatCard
                label="Absent"
                value={reportData.summary?.absent || 0}
                gradient="error"
              />
              <StatCard
                label="Late Arrivals"
                value={reportData.summary?.late || 0}
                gradient="accent"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-container">
                  <div className="chart">
                    {reportData.monthly?.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <div className="chart-bar-wrapper">
                          <div
                            className="chart-bar"
                            style={{
                              height: `${(item.value / getMaxValue()) * 100}%`,
                            }}
                          >
                            <span className="chart-bar-value">{item.value}%</span>
                          </div>
                        </div>
                        <span className="chart-label">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="reports-grid">
              <Card>
                <CardHeader>
                  <CardTitle>Summary Statistics</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="stats-list">
                    <div className="stats-item">
                      <div className="stats-icon success">
                        <FiTrendingUp />
                      </div>
                      <div className="stats-content">
                        <p className="stats-label">Average Attendance</p>
                        <p className="stats-value">95.2%</p>
                      </div>
                    </div>
                    <div className="stats-item">
                      <div className="stats-icon primary">
                        <FiClock />
                      </div>
                      <div className="stats-content">
                        <p className="stats-label">On-Time Rate</p>
                        <p className="stats-value">96.8%</p>
                      </div>
                    </div>
                    <div className="stats-item">
                      <div className="stats-icon accent">
                        <FiCalendar />
                      </div>
                      <div className="stats-content">
                        <p className="stats-label">Leave Utilization</p>
                        <p className="stats-value">68%</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="stats-item">
                        <div className="stats-icon secondary">
                          <FiUsers />
                        </div>
                        <div className="stats-content">
                          <p className="stats-label">Active Employees</p>
                          <p className="stats-value">127</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="insights-list">
                    <div className="insight-item success">
                      <h4>Excellent Attendance</h4>
                      <p>Your attendance rate is above company average</p>
                    </div>
                    <div className="insight-item info">
                      <h4>Consistent Performance</h4>
                      <p>Maintained steady attendance throughout the year</p>
                    </div>
                    <div className="insight-item warning">
                      <h4>Leave Balance</h4>
                      <p>Consider planning your remaining leave days</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
