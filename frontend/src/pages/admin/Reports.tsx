import React, { useState, useEffect } from 'react';
import { AttendanceReport, SalarySlip } from '@/types';
import { formatDate, formatCurrency, downloadCSV } from '@/lib/utils';
import Badge from '@/components/Badge';
import SearchBar from '@/components/SearchBar';
import { FileText, Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'salary'>('attendance');
  const [attendanceReports, setAttendanceReports] = useState<AttendanceReport[]>([]);
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, [selectedMonth]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      // Mock attendance reports
      const mockAttendanceReports: AttendanceReport[] = [
        {
          employeeId: 'EMP001',
          employeeName: 'Sarah Johnson',
          department: 'Engineering',
          totalDays: 22,
          presentDays: 22,
          absentDays: 0,
          leaveDays: 0,
          halfDays: 0,
          attendancePercentage: 100,
        },
        {
          employeeId: 'EMP002',
          employeeName: 'Michael Chen',
          department: 'Marketing',
          totalDays: 22,
          presentDays: 20,
          absentDays: 0,
          leaveDays: 2,
          halfDays: 0,
          attendancePercentage: 90.9,
        },
        {
          employeeId: 'EMP003',
          employeeName: 'Priya Sharma',
          department: 'Human Resources',
          totalDays: 22,
          presentDays: 19,
          absentDays: 0,
          leaveDays: 3,
          halfDays: 0,
          attendancePercentage: 86.4,
        },
        {
          employeeId: 'EMP004',
          employeeName: 'David Williams',
          department: 'Finance',
          totalDays: 22,
          presentDays: 20,
          absentDays: 1,
          leaveDays: 0,
          halfDays: 1,
          attendancePercentage: 90.9,
        },
        {
          employeeId: 'EMP005',
          employeeName: 'Anjali Patel',
          department: 'Engineering',
          totalDays: 22,
          presentDays: 21,
          absentDays: 1,
          leaveDays: 0,
          halfDays: 0,
          attendancePercentage: 95.5,
        },
      ];

      // Mock salary slips
      const mockSalarySlips: SalarySlip[] = [
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: 'Sarah Johnson',
          employeeEmail: 'sarah.j@dayflow.com',
          month: selectedMonth.split('-')[1],
          year: parseInt(selectedMonth.split('-')[0]),
          salaryStructure: {
            basicSalary: 50000,
            houseRentAllowance: 15000,
            medicalAllowance: 5000,
            transportAllowance: 3000,
            otherAllowances: 2000,
            providentFund: 6000,
            professionalTax: 200,
            incomeTax: 8000,
            otherDeductions: 0,
          },
          grossSalary: 75000,
          netSalary: 60800,
          generatedOn: '2026-01-01',
        },
        {
          id: '2',
          employeeId: 'EMP002',
          employeeName: 'Michael Chen',
          employeeEmail: 'michael.c@dayflow.com',
          month: selectedMonth.split('-')[1],
          year: parseInt(selectedMonth.split('-')[0]),
          salaryStructure: {
            basicSalary: 45000,
            houseRentAllowance: 13500,
            medicalAllowance: 4500,
            transportAllowance: 2500,
            otherAllowances: 1500,
            providentFund: 5400,
            professionalTax: 200,
            incomeTax: 6500,
            otherDeductions: 0,
          },
          grossSalary: 67000,
          netSalary: 54900,
          generatedOn: '2026-01-01',
        },
      ];

      setAttendanceReports(mockAttendanceReports);
      setSalarySlips(mockSalarySlips);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendanceReports = attendanceReports.filter((report) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.employeeName.toLowerCase().includes(query) ||
      report.employeeId.toLowerCase().includes(query) ||
      report.department.toLowerCase().includes(query)
    );
  });

  const filteredSalarySlips = salarySlips.filter((slip) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      slip.employeeName.toLowerCase().includes(query) ||
      slip.employeeId.toLowerCase().includes(query)
    );
  });

  const handleDownloadAttendanceReport = () => {
    const exportData = filteredAttendanceReports.map((report) => ({
      'Employee ID': report.employeeId,
      'Employee Name': report.employeeName,
      'Department': report.department,
      'Total Days': report.totalDays,
      'Present Days': report.presentDays,
      'Absent Days': report.absentDays,
      'Leave Days': report.leaveDays,
      'Half Days': report.halfDays,
      'Attendance %': report.attendancePercentage.toFixed(2),
    }));
    downloadCSV(exportData, `attendance-report-${selectedMonth}`);
  };

  const handleDownloadSalarySlip = (slip: SalarySlip) => {
    // In a real app, this would download a PDF
    console.log('Downloading salary slip for', slip.employeeName);
  };

  // Chart data
  const departmentAttendanceData = attendanceReports.reduce((acc, report) => {
    const existing = acc.find((item) => item.department === report.department);
    if (existing) {
      existing.total++;
      existing.avgAttendance += report.attendancePercentage;
    } else {
      acc.push({
        department: report.department,
        total: 1,
        avgAttendance: report.attendancePercentage,
      });
    }
    return acc;
  }, [] as { department: string; total: number; avgAttendance: number }[])
  .map((item) => ({
    ...item,
    avgAttendance: (item.avgAttendance / item.total).toFixed(1),
  }));

  const attendanceDistributionData = [
    {
      name: 'Excellent (>95%)',
      value: attendanceReports.filter((r) => r.attendancePercentage > 95).length,
    },
    {
      name: 'Good (85-95%)',
      value: attendanceReports.filter((r) => r.attendancePercentage >= 85 && r.attendancePercentage <= 95).length,
    },
    {
      name: 'Average (75-85%)',
      value: attendanceReports.filter((r) => r.attendancePercentage >= 75 && r.attendancePercentage < 85).length,
    },
    {
      name: 'Poor (<75%)',
      value: attendanceReports.filter((r) => r.attendancePercentage < 75).length,
    },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            View comprehensive reports and insights
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'attendance'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={20} />
              Attendance Reports
            </div>
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'salary'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={20} />
              Salary Slips
            </div>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by employee name, ID, or department..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" size={20} />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input"
              max={new Date().toISOString().slice(0, 7)}
            />
          </div>
        </div>
      </div>

      {activeTab === 'attendance' && (
        <>
          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department-wise Attendance */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Department-wise Attendance
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgAttendance" fill="#0ea5e9" name="Avg Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Attendance Distribution */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Attendance Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendanceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Report Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Detailed Attendance Report
              </h2>
              <button
                onClick={handleDownloadAttendanceReport}
                className="btn-secondary flex items-center gap-2"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Total Days</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Leave</th>
                    <th>Half Day</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendanceReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No attendance reports found
                      </td>
                    </tr>
                  ) : (
                    filteredAttendanceReports.map((report) => (
                      <tr key={report.employeeId} className="hover:bg-gray-50">
                        <td>
                          <div>
                            <p className="font-medium text-gray-900">
                              {report.employeeName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {report.employeeId}
                            </p>
                          </div>
                        </td>
                        <td>
                          <p className="text-gray-900">{report.department}</p>
                        </td>
                        <td>
                          <p className="text-gray-900">{report.totalDays}</p>
                        </td>
                        <td>
                          <p className="text-green-600 font-medium">
                            {report.presentDays}
                          </p>
                        </td>
                        <td>
                          <p className="text-red-600 font-medium">
                            {report.absentDays}
                          </p>
                        </td>
                        <td>
                          <p className="text-blue-600 font-medium">
                            {report.leaveDays}
                          </p>
                        </td>
                        <td>
                          <p className="text-orange-600 font-medium">
                            {report.halfDays}
                          </p>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  report.attendancePercentage >= 95
                                    ? 'bg-green-600'
                                    : report.attendancePercentage >= 85
                                    ? 'bg-blue-600'
                                    : report.attendancePercentage >= 75
                                    ? 'bg-orange-600'
                                    : 'bg-red-600'
                                }`}
                                style={{ width: `${report.attendancePercentage}%` }}
                              />
                            </div>
                            <span className="font-medium text-gray-900 text-sm">
                              {report.attendancePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'salary' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Salary Slips
          </h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month/Year</th>
                  <th>Gross Salary</th>
                  <th>Net Salary</th>
                  <th>Generated On</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalarySlips.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No salary slips found
                    </td>
                  </tr>
                ) : (
                  filteredSalarySlips.map((slip) => (
                    <tr key={slip.id} className="hover:bg-gray-50">
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">
                            {slip.employeeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {slip.employeeId}
                          </p>
                        </div>
                      </td>
                      <td>
                        <p className="text-gray-900">
                          {slip.month}/{slip.year}
                        </p>
                      </td>
                      <td>
                        <p className="text-gray-900 font-medium">
                          {formatCurrency(slip.grossSalary)}
                        </p>
                      </td>
                      <td>
                        <p className="text-green-600 font-bold">
                          {formatCurrency(slip.netSalary)}
                        </p>
                      </td>
                      <td>
                        <p className="text-gray-900">
                          {formatDate(slip.generatedOn)}
                        </p>
                      </td>
                      <td>
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleDownloadSalarySlip(slip)}
                            className="btn-secondary flex items-center gap-2"
                          >
                            <Download size={16} />
                            Download PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
