import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiDownload, FiCalendar, FiFileText } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardBody, StatCard } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { Badge } from '../components/Components';
import { payrollAPI } from '../services/api';
import './Payroll.css';

const Payroll = () => {
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      const response = await payrollAPI.getMyPayroll();
      setPayrollHistory(response.data || []);
    } catch (err) {
      console.error('Failed to fetch payroll:', err);
      // Use mock data
      setPayrollHistory([
        {
          id: 1,
          month: 'December 2025',
          payDate: '2025-12-31',
          basicSalary: 5000,
          allowances: 1500,
          deductions: 800,
          netSalary: 5700,
          status: 'paid',
        },
        {
          id: 2,
          month: 'November 2025',
          payDate: '2025-11-30',
          basicSalary: 5000,
          allowances: 1200,
          deductions: 750,
          netSalary: 5450,
          status: 'paid',
        },
        {
          id: 3,
          month: 'October 2025',
          payDate: '2025-10-31',
          basicSalary: 5000,
          allowances: 1300,
          deductions: 780,
          netSalary: 5520,
          status: 'paid',
        },
      ]);
    }
  };

  const handleViewPayslip = async (payroll) => {
    try {
      const response = await payrollAPI.getPayslip(payroll.id);
      setSelectedPayslip(response.data || payroll);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to fetch payslip:', err);
      setSelectedPayslip(payroll);
      setShowModal(true);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await payrollAPI.downloadPayslip(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download payslip:', err);
      alert('Download feature requires backend integration');
    }
  };

  const latestPayroll = payrollHistory[0] || {};

  const columns = [
    {
      header: 'Month',
      accessor: 'month',
      render: (value) => <span className="table-text-bold">{value}</span>,
    },
    {
      header: 'Pay Date',
      accessor: 'payDate',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Basic Salary',
      accessor: 'basicSalary',
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      header: 'Allowances',
      accessor: 'allowances',
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      header: 'Deductions',
      accessor: 'deductions',
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      header: 'Net Salary',
      accessor: 'netSalary',
      render: (value) => (
        <span className="table-text-success">${value.toLocaleString()}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <Badge variant={value === 'paid' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (value, row) => (
        <div className="table-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewPayslip(row)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={FiDownload}
            onClick={() => handleDownload(value)}
          >
            Download
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="payroll-container">
        <div className="payroll-header">
          <div>
            <h1 className="payroll-title">Payroll</h1>
            <p className="payroll-subtitle">View your salary and payslips</p>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            label="Current Month Salary"
            value={`$${latestPayroll.netSalary?.toLocaleString() || '0'}`}
            gradient="primary"
          />
          <StatCard
            label="Basic Salary"
            value={`$${latestPayroll.basicSalary?.toLocaleString() || '0'}`}
            gradient="secondary"
          />
          <StatCard
            label="Total Allowances"
            value={`$${latestPayroll.allowances?.toLocaleString() || '0'}`}
            gradient="success"
          />
          <StatCard
            label="Total Deductions"
            value={`$${latestPayroll.deductions?.toLocaleString() || '0'}`}
            gradient="error"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
          </CardHeader>
          <CardBody>
            <Table
              columns={columns}
              data={payrollHistory}
              emptyMessage="No payroll records found"
            />
          </CardBody>
        </Card>

        {selectedPayslip && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={`Payslip - ${selectedPayslip.month}`}
            size="lg"
          >
            <div className="payslip">
              <div className="payslip-header">
                <h2 className="payslip-title">DayFlow HRMS</h2>
                <p className="payslip-subtitle">Payslip for {selectedPayslip.month}</p>
              </div>

              <div className="payslip-section">
                <h3 className="payslip-section-title">Earnings</h3>
                <div className="payslip-row">
                  <span>Basic Salary</span>
                  <span>${selectedPayslip.basicSalary?.toLocaleString()}</span>
                </div>
                <div className="payslip-row">
                  <span>House Rent Allowance</span>
                  <span>${((selectedPayslip.allowances || 0) * 0.4).toFixed(2)}</span>
                </div>
                <div className="payslip-row">
                  <span>Transport Allowance</span>
                  <span>${((selectedPayslip.allowances || 0) * 0.3).toFixed(2)}</span>
                </div>
                <div className="payslip-row">
                  <span>Other Allowances</span>
                  <span>${((selectedPayslip.allowances || 0) * 0.3).toFixed(2)}</span>
                </div>
                <div className="payslip-row payslip-subtotal">
                  <span>Gross Salary</span>
                  <span>
                    ${((selectedPayslip.basicSalary || 0) + (selectedPayslip.allowances || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="payslip-section">
                <h3 className="payslip-section-title">Deductions</h3>
                <div className="payslip-row">
                  <span>Tax Deduction</span>
                  <span>${((selectedPayslip.deductions || 0) * 0.6).toFixed(2)}</span>
                </div>
                <div className="payslip-row">
                  <span>Insurance</span>
                  <span>${((selectedPayslip.deductions || 0) * 0.3).toFixed(2)}</span>
                </div>
                <div className="payslip-row">
                  <span>Other Deductions</span>
                  <span>${((selectedPayslip.deductions || 0) * 0.1).toFixed(2)}</span>
                </div>
                <div className="payslip-row payslip-subtotal">
                  <span>Total Deductions</span>
                  <span>${selectedPayslip.deductions?.toLocaleString()}</span>
                </div>
              </div>

              <div className="payslip-total">
                <span>Net Salary</span>
                <span>${selectedPayslip.netSalary?.toLocaleString()}</span>
              </div>

              <div className="payslip-footer">
                <p>Payment Date: {new Date(selectedPayslip.payDate).toLocaleDateString()}</p>
                <p>Status: <Badge variant="success">{selectedPayslip.status}</Badge></p>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                variant="primary"
                icon={FiDownload}
                onClick={() => handleDownload(selectedPayslip.id)}
              >
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payroll;
